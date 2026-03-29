import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ref, set, onValue, update, get, serverTimestamp } from "firebase/database";
import { db } from "../firebase/config";
import countdownSound from "../assets/countdown.wav";


export default function PlayerPage() {
  const { room: rawRoom, id, name } = useParams();
  const room = rawRoom.trim().toLowerCase();
 

  const [clicked, setClicked] = useState(false);
  const [reactionTime, setReactionTime] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const [countdown, setCountdown] = useState(null);
  const [buzzerOpen, setBuzzerOpen] = useState(false);

  const soundRef = useRef(null);
  const hasPlayed = useRef(false);
  const intervalRef = useRef(null);

  // 🔊 init sound
  useEffect(() => {
    soundRef.current = new Audio(countdownSound);
  }, []);

  // ✅ add player ONCE
  useEffect(() => {
    set(ref(db, `players/${id}`), {
      name,
      room,
      pressed: false,
      pressedAt: null,
      createdAt: Date.now()
    });
  }, [id, name, room]);

  // 🔥 ROOM SYNC (FIXED)
  useEffect(() => {
    const roomRef = ref(db, `rooms/${room}`);

    return onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data?.startTime) return;

      setStartTime(data.startTime);
      setClicked(false);
      setReactionTime(null);
      setBuzzerOpen(false);
      hasPlayed.current = false;

      // clear old interval
      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = data.startTime - now;

        const sec = Math.ceil(diff / 1000);

        if (diff > 0) {
          setCountdown(sec);

          if (!hasPlayed.current) {
            hasPlayed.current = true;
            soundRef.current.currentTime = 0;
            soundRef.current.play().catch(() => {});
          }

        } else {
          setCountdown(0);
          setBuzzerOpen(true);
          clearInterval(intervalRef.current);
        }

      }, 50);
    });
  }, [room]);

  // ✅ PLAYER LISTENER (FIXED)
  useEffect(() => {
    const playerRef = ref(db, `players/${id}`);

    return onValue(playerRef, (snapshot) => {
      const data = snapshot.val();

      if (data?.pressedAt && startTime && reactionTime === null) {
        const rt = data.pressedAt - startTime;
        setReactionTime(rt);
      }
    });
  }, [id, startTime, reactionTime]);

  // 🔴 buzzer press
  const pressBuzzer = async () => {
    if (clicked) return;
    setClicked(true);

    const snapshot = await get(ref(db, `rooms/${room}`));
    const data = snapshot.val();

    if (!data || Date.now() < data.startTime) {
      setClicked(false);
      return;
    }

    await update(ref(db, `players/${id}`), {
      pressed: true,
      pressedAt: serverTimestamp()
    });
  };

  return (
    <div className="container">
      <h2 className="player-name">{name}</h2>

      {countdown > 0 && <h1 className="countdown">{countdown}</h1>}

      {countdown === 0 && !buzzerOpen && (
        <h1 className="go-text">GO 🚨</h1>
      )}

      {buzzerOpen && reactionTime === null && (
        <button onClick={pressBuzzer} disabled={clicked} className="buzzer-btn">
          {clicked ? "WAIT..." : "BUZZ 🚨"}
        </button>
      )}

      {reactionTime !== null && (
        <h2 className="result">Your attempt is recorded</h2>
      )}
    </div>
  );
}