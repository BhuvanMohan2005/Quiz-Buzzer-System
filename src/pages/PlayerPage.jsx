import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { ref, set, onValue, update } from "firebase/database";
import { db } from "../firebase/config";
import { serverTimestamp } from "firebase/database";

export default function PlayerPage() {
  const { room: rawRoom, id, name } = useParams();

  const room = rawRoom.trim().toLowerCase();
  const safeName = decodeURIComponent(name || "Player");

  const [clicked, setClicked] = useState(false);
  const [reactionTime, setReactionTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [phase, setPhase] = useState("waiting");
  const [showBuzzer, setShowBuzzer] = useState(false);
  const [winner, setWinner] = useState(null);

  const intervalRef = useRef(null);
  const hasStartedRef = useRef(false);
  const hasClickedRef = useRef(false);
  const currentRoundRef = useRef(null);

  // ✅ ADD PLAYER
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

  // ✅ PLAYER LISTENER (reaction time)
  useEffect(() => {
    const playerRef = ref(db, `rooms/${room}/players/${id}`);

    return onValue(playerRef, (snapshot) => {
      const data = snapshot.val();

      if (data?.pressedAt && startTime && reactionTime === null) {
        setReactionTime(data.pressedAt - startTime);
      }
    });
  }, [id, room, startTime, reactionTime]);

  // 🏆 WINNER LISTENER (FAIR)
  useEffect(() => {
    const playersRef = ref(db, `rooms/${room}/players`);

    return onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const players = Object.values(data)
        .filter(p => p.serverTime);

      if (players.length === 0) return;

      players.sort((a, b) => a.serverTime - b.serverTime);

      setWinner(players[0]);
    });
  }, [room]);

  // 🔴 BUZZER
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

  // ⏱️ COUNTDOWN + ROUND LOGIC
  useEffect(() => {
    const roomRef = ref(db, `rooms/${room}`);

    return onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data?.startTime) {
        setPhase("waiting");
        return;
      }

      const roundId = data.startTime;

      // 🔄 NEW ROUND DETECTED
      if (currentRoundRef.current !== roundId) {
        currentRoundRef.current = roundId;

        setClicked(false);
        setReactionTime(null);
        setShowBuzzer(false);
        setWinner(null);

        hasClickedRef.current = false;
        hasStartedRef.current = false;
      }

      setStartTime(roundId);

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
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

  const isWinner = winner?.name === safeName;

  return (
    <div className="container">
      <h2 className="player-name">{safeName}</h2>

      {/* 🔢 Countdown */}
      {phase === "countdown" && countdown > 0 && (
        <h1 className="countdown">{countdown}</h1>
      )}

      {/* 🚀 GO */}
      {phase === "go" && (
        <h1 className="go-text">GO 🚀</h1>
      )}

      {/* 🔴 BUZZER */}
      {phase === "live" && showBuzzer && !clicked && (
        <button onClick={pressBuzzer} className="buzzer-btn">
          BUZZ 🚨
        </button>
      )}

      {/* ✅ RESULT */}
      {clicked && (
        <h2 className="result">✅ Response Recorded</h2>
      )}

      {/* 🏆 WINNER */}
      {/* 🏆 WINNER */}
{winner && (
  <div className="winner-container">
    {/* Winner box */}
    <h2 className="results">
      {isWinner ? "🏆 YOU WON!" : `🥇 Winner: ${winner.name}`}
    </h2>

    {/* Current player's delay relative to winner */}
    <div className="winner-delays">
      <div className="winner-reaction">
        ⏱ Your delay: {reactionTime !== null ? (isWinner ? 0 : reactionTime - (winner.pressedAt - startTime)) : "-"} ms
      </div>
    </div>
  </div>
)}
    </div>
  );
}
