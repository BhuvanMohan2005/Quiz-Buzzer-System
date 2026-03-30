import { useParams } from "react-router-dom";
import HostControls from "../components/HostControls";
import Leaderboard from "../components/Leaderboard";
import { useEffect, useState } from "react";
import { ref, onValue, get } from "firebase/database";
import { db } from "../firebase/config";

export default function HostPage() {
  const { room } = useParams();

  const [phase, setPhase] = useState("waiting");
  const [startTime, setStartTime] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [players, setPlayers] = useState([]);
  const [isHost, setIsHost] = useState(false);

  // 🔐 CHECK IF USER IS HOST
  useEffect(() => {
    const checkHost = async () => {
      const snapshot = await get(ref(db, `rooms/${room}`));
      const data = snapshot.val();

      const savedKey = localStorage.getItem(`host_${room}`);

      if (data && savedKey === data.hostKey) {
        setIsHost(true);
      } else {
        setIsHost(false);
      }
    };

    checkHost();
  }, [room]);

  // 🔥 ROOM LISTENER
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

  // 🔥 COUNTDOWN (visual only)
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

  const showLeaderboard =
    phase === "live" && players.some(p => p.pressedAt);

  return (
    <div className="container">

      <h1>🎮 Host Panel</h1>
      <h3>Room Code: {room}</h3>

      {/* 👑 HOST STATUS */}
      {isHost ? (
        <p style={{ color: "#00ffcc", fontWeight: "bold" }}>
          👑 You are the host
        </p>
      ) : (
        <p style={{ color: "red", fontWeight: "bold" }}>
          🔒 You are not the host
        </p>
      )}

      {/* 🎮 CONTROLS */}
      <div style={{ marginTop: "20px" }}>
        {isHost ? (
          <HostControls room={room} />
        ) : (
          <p>Host controls disabled</p>
        )}
      </div>

      {/* 🔥 STATUS */}
      <div style={{ marginTop: "25px" }}>
        {phase === "waiting" && <h2>⏳ Waiting to start...</h2>}

        {phase === "countdown" && countdown > 0 && (
          <h1 style={{ color: "orange" }}>{countdown}</h1>
        )}

        {phase === "live" && (
          <h2 style={{ color: "#00ffcc" }}>🚨 Buzzer Live</h2>
        )}
      </div>

      {/* 📊 PROGRESS */}
      {phase !== "waiting" && (
        <div style={{ marginTop: "10px" }}>
          <p>
            {answered} / {total} answered
          </p>
        </div>
      )}

      {/* 🏆 LEADERBOARD */}
      <div style={{ marginTop: "30px" }}>
        {showLeaderboard ? (
          <Leaderboard room={room} startTime={startTime} />
        ) : (
          <p>Waiting for responses...</p>
        )}
      </div>

    </div>
  );
}