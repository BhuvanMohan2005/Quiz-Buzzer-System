import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ref, set, onValue, update, get, serverTimestamp } from "firebase/database";
import { db } from "../firebase/config";
import countdownSound from "../assets/countdown.wav";

export default function PlayerPage() {
  const { room, id, name } = useParams();

  const [clicked, setClicked] = useState(false);
  const [reactionTime, setReactionTime] = useState(null);
  const [startTime, setStartTime] = useState(null);

  const [countdown, setCountdown] = useState(null);
  const [buzzerOpen, setBuzzerOpen] = useState(false);

  const soundRef = useRef(null);
  const hasPlayed = useRef(false);

  // 🔊 init sound
  useEffect(() => {
    soundRef.current = new Audio(countdownSound);
  }, []);

  // ✅ add player
  useEffect(() => {
    set(ref(db, `players/${id}`), {
      name,
      room,
      pressed: false,
      pressedAt: null
    });
  }, [id, name, room]);

  // 🔥 MAIN SYNC LOGIC
  useEffect(() => {
    const roomRef = ref(db, `rooms/${room}`);

    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data?.startTime) return;

      setStartTime(data.startTime);
      setClicked(false);
      setReactionTime(null);
      hasPlayed.current = false;

      const interval = setInterval(() => {
        const now = Date.now();
        const diff = data.startTime - now;

        const sec = Math.ceil(diff / 1000);

        if (diff > 0) {
          setCountdown(sec);

          // 🔊 PLAY SOUND ONLY ONCE
          if (!hasPlayed.current) {
            hasPlayed.current = true;
            soundRef.current.currentTime = 0;
            soundRef.current.play().catch(() => {});
          }

        } else {
          setCountdown(0);
          setBuzzerOpen(true);
          clearInterval(interval);
        }

      }, 50); // high precision

    });
  }, [room]);

  // ✅ player reaction
  useEffect(() => {
    const playerRef = ref(db, `players/${id}`);

    onValue(playerRef, (snapshot) => {
      const data = snapshot.val();

      if (data?.pressedAt && startTime) {
        const rt = data.pressedAt - startTime;
        setReactionTime(rt);
      }
    });
  }, [id, startTime]);
  
  useEffect(() => {
  set(ref(db, `players/${id}`), {
    name,
    room,
    pressed: false,
    pressedAt: null,
    createdAt: Date.now() // 🔥 NEW
  });
}, [id, name, room]);


  // 🔴 buzzer press
  const pressBuzzer = async () => {
    if (clicked) return;
    setClicked(true);

    const roomRef = ref(db, `rooms/${room}`);
    const snapshot = await get(roomRef);
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

    {/* ⏳ Countdown */}
    {countdown > 0 && (
      <h1 className="countdown">{countdown}</h1>
    )}

    {/* 🚀 GO */}
    {countdown === 0 && !buzzerOpen && (
      <h1 className="go-text">GO 🚨</h1>
    )}

    {/* 🔴 Buzzer */}
    {buzzerOpen && reactionTime === null && countdown===0 && (
      <button
        onClick={pressBuzzer}
        disabled={clicked}
        className="buzzer-btn"
      >
        {clicked ? "WAIT..." : "BUZZ 🚨"}
      </button>
    )}

    {/* 🏁 Result */}
    {reactionTime !== null && (
      <h2 className="result">
        Your attempt is recorded 
      </h2>
    )}
  </div>
);
}