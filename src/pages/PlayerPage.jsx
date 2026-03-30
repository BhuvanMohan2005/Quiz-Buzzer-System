import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ref, set, onValue, update } from "firebase/database";
import { db } from "../firebase/config";
import { serverTimestamp } from "firebase/database";

export default function PlayerPage() {
  const { room: rawRoom, id, name } = useParams();
  const safeName = decodeURIComponent(name || "Player");
  const room = rawRoom.trim().toLowerCase();

  const [clicked, setClicked] = useState(false);
  const [reactionTime, setReactionTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [phase, setPhase] = useState("waiting"); // waiting | countdown | go | live
  const [showBuzzer, setShowBuzzer] = useState(false);

  const intervalRef = useRef(null);
  const hasStartedRef = useRef(false);   // prevents multiple GO/Buzz
  const hasClickedRef = useRef(false);   // locks UI after click
  const currentRoundRef = useRef(null);  // track current round ID

  // ✅ Add player to room
  useEffect(() => {
    if (!id || !room) return;

    const playerRef = ref(db, `rooms/${room}/players/${id}`);
    set(playerRef, {
      name: safeName,
      pressed: false,
      pressedAt: null,
      createdAt: Date.now()
    });
  }, []);

  // ✅ Listen for player updates
  useEffect(() => {
    const playerRef = ref(db, `rooms/${room}/players/${id}`);
    return onValue(playerRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.pressedAt && startTime && reactionTime === null) {
        setReactionTime(data.pressedAt - startTime);
      }
    });
  }, [id, room, startTime, reactionTime]);

  // 🔴 BUZZER press
  const pressBuzzer = async () => {
    if (clicked || !showBuzzer) return;

    hasClickedRef.current = true;
    setClicked(true);

    await update(ref(db, `rooms/${room}/players/${id}`), {
      pressed: true,
      pressedAt: Date.now(),
      serverTime: serverTimestamp()
    });
  };

  // ⏱ Countdown & GO/Buzz logic
  useEffect(() => {
    const roomRef = ref(db, `rooms/${room}`);

    return onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data?.startTime) {
        setPhase("waiting");
        return;
      }

      const roundId = data.startTime; // unique round identifier

      // 🆕 Detect new round
      if (currentRoundRef.current !== roundId) {
        currentRoundRef.current = roundId;

        // reset state for new round
        setClicked(false);
        setReactionTime(null);
        setShowBuzzer(false);
        hasClickedRef.current = false;
        hasStartedRef.current = false;
      }

      setStartTime(data.startTime);

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        // stop after click or wrong round
        if (hasClickedRef.current) return;
        if (currentRoundRef.current !== roundId) return;

        const now = Date.now();
        const diff = roundId - now;
        const sec = Math.ceil(diff / 1000);

        if (diff > 0) {
          setPhase("countdown");
          setCountdown(sec);
        } else {
          if (hasStartedRef.current) return;

          hasStartedRef.current = true;
          setPhase("go");
          setCountdown(0);
          clearInterval(intervalRef.current);

          setTimeout(() => {
            if (hasClickedRef.current) return;
            if (currentRoundRef.current !== roundId) return;

            setPhase("live");
            setShowBuzzer(true);
          }, 600);
        }
      }, 50);
    });
  }, [room]);

  return (
    <div className="container">
      <h2 className="player-name">{safeName}</h2>

      {/* Countdown */}
      {phase === "countdown" && countdown > 0 && (
        <h1 className="countdown">{countdown}</h1>
      )}

      {/* GO */}
      {phase === "go" && (
        <h1 className="go-text">GO 🚀</h1>
      )}

      {/* Buzzer */}
      {phase === "live" && showBuzzer && !clicked && (
        <button onClick={pressBuzzer} className="buzzer-btn">
          BUZZ 🚨
        </button>
      )}

      {/* Clicked Result */}
      {clicked && (
        <h2 className="result">✅ Response Recorded</h2>
      )}
    </div>
  );
}