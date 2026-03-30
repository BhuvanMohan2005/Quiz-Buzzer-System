import { useParams } from "react-router-dom";
import HostControls from "../components/HostControls";
import Leaderboard from "../components/Leaderboard";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/config";

export default function HostPage() {
  const { room } = useParams();

  const [phase, setPhase] = useState("waiting");
  const [startTime, setStartTime] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [players, setPlayers] = useState([]);

  // 🔥 SINGLE ROOM LISTENER (ONLY ONE)
  useEffect(() => {
    const roomRef = ref(db, `rooms/${room}`);

    return onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      setPhase(data.phase || "waiting");
      setStartTime(data.startTime || null);
    });
  }, [room]);

  // 🔥 PLAYERS LISTENER
  useEffect(() => {
    const playersRef = ref(db, `rooms/${room}/players`);

    return onValue(playersRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setPlayers([]);
        return;
      }

      const parsed = Object.entries(data).map(([id, p]) => ({
        id,
        name: p.name || "Unknown",
        ...p,
      }));

      setPlayers(parsed);
    });
  }, [room]);

  // 🔥 COUNTDOWN (ONLY VISUAL)
  useEffect(() => {
    if (!startTime || phase !== "countdown") return;

    const interval = setInterval(() => {
      const diff = startTime - Date.now();
      const sec = Math.ceil(diff / 1000);

      if (diff > 0) {
        setCountdown(sec);
      } else {
        setCountdown(0);
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, phase]);

  // 📊 PROGRESS
  const answered = players.filter(p => p.pressedAt).length;
  const total = players.length;

  const allAnswered = players.length > 0 && players.every(p => p.pressedAt);
  const showLeaderboard = phase === "live" && players.some(p => p.pressedAt);


  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>Host Panel</h1>
      <h3>Room Code: {room}</h3>

      {/* 🎮 Controls */}
      <HostControls room={room} />

      {/* 🔥 STATUS */}
      <div style={{ marginTop: "20px" }}>
        {phase === "waiting" && <h2>⏳ Waiting to start...</h2>}

        {phase === "countdown" && countdown > 0 && (
          <h1 style={{ color: "orange" }}>{countdown}</h1>
        )}

        {phase === "live" && (
          <h2 style={{ color: "green" }}>🚨 Buzzer Live</h2>
        )}
      </div>

      {/* 📊 PROGRESS */}
      {phase !== "waiting" && (
        <div style={{ marginTop: "10px" }}>
          <p>{answered} / {total} answered</p>
        </div>
      )}

      {/* 🏆 LEADERBOARD (ONLY AFTER ALL ANSWERED) */}
      <div style={{ marginTop: "30px" }}>
        {showLeaderboard? (
          <Leaderboard room={room} />
        ) : (
          <p>Waiting for all players...</p>
        )}
      </div>
    </div>
  );
}