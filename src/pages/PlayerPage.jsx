import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ref, set, onValue, update, get } from "firebase/database";
import { db } from "../firebase/config";
import countdownSound from "../assets/countdown.wav";
import { serverTimestamp } from "firebase/database";

export default function PlayerPage() {
  const { room: rawRoom, id, name } = useParams();
  const safeName = decodeURIComponent(name || "Player");
  console.log("NAME PARAM:", name, 'and ', safeName);
  const room = rawRoom.trim().toLowerCase();

  const [clicked, setClicked] = useState(false);
  const [reactionTime, setReactionTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [countdown, setCountdown] = useState(null);

  const soundRef = useRef(null);
  const hasPlayed = useRef(false);
  const intervalRef = useRef(null);

  // 🔊 init sound
  useEffect(() => {
    soundRef.current = new Audio(countdownSound);
  }, []);

  // 🔓 unlock audio (IMPORTANT)
  useEffect(() => {
    const unlock = () => {
      soundRef.current.play().catch(() => { });
      soundRef.current.pause();
      soundRef.current.currentTime = 0;
      window.removeEventListener("click", unlock);
    };
    window.addEventListener("click", unlock);
  }, []);

  // ✅ ADD PLAYER
  useEffect(() => {
    if (!id || !room) return;

    const playerRef = ref(db, `rooms/${room}/players/${id}`);

    // 🔥 SET ONCE — full object
    set(playerRef, {
      name: safeName,
      pressed: false,
      pressedAt: null,
      createdAt: Date.now()
    });

  }, []); // 🔥 VERY IMPORTANT


  // ✅ PLAYER LISTENER
  useEffect(() => {
    const playerRef = ref(db, `rooms/${room}/players/${id}`);

    return onValue(playerRef, (snapshot) => {
      const data = snapshot.val();

      if (data?.pressedAt && startTime && reactionTime === null) {
        setReactionTime(data.pressedAt - startTime);
      }
    });
  }, [id, room, startTime, reactionTime]);

  // 🔴 BUZZER
  const pressBuzzer = async () => {
    if (clicked) return;

    setClicked(true); // 🔥 immediate UI change

    const snapshot = await get(ref(db, `rooms/${room}`));
    const data = snapshot.val();


    if (!data || data.phase !== "live") {
  setClicked(false);
  return;
}

    await update(ref(db, `rooms/${room}/players/${id}`), {
      pressed: true,
      pressedAt: Date.now(),
      serverTime: serverTimestamp()
    });
  };

  const [phase, setPhase] = useState("waiting");
  // "waiting" | "countdown" | "live"
  useEffect(() => {
    const roomRef = ref(db, `rooms/${room}`);

    return onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data?.startTime) {
        setPhase("waiting");
        return;
      }

      setStartTime(data.startTime);
      if (data.phase === "countdown") {
        setClicked(false);
        setReactionTime(null);
      }

      hasPlayed.current = false;

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const diff = data.startTime - now;
        const sec = Math.ceil(diff / 1000);

        if (diff > 0) {
          setPhase("countdown");
          setCountdown(sec);

          const timeToStart = data.startTime - Date.now();

          if (timeToStart <= 3000 && timeToStart > 2900 && !hasPlayed.current) {
            hasPlayed.current = true;
            soundRef.current.currentTime = 0;
            soundRef.current.play().catch(() => { });
          }

        } else {
          setPhase("live");
          setCountdown(0);
          clearInterval(intervalRef.current);
        }

      }, 50);
    });
  }, [room]);


  return (
    <div className="container">
      <h2 className="player-name">{safeName}</h2>

      {phase === "countdown" && countdown > 0 && (
        <h1 className="countdown">{countdown}</h1>
      )}

      {phase === "live" && !clicked && (
        <button onClick={pressBuzzer} className="buzzer-btn">
          BUZZ 🚨
        </button>
      )}

      {clicked && (
        <h2 className="result">✅ Response Recorded</h2>
      )}
    </div>
  );
}