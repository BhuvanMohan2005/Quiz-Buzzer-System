import { useParams } from "react-router-dom";
import { ref, set } from "firebase/database";
import { db } from "../firebase/config";
import { useEffect } from "react";
import HostControls from "../components/HostControls";
import Leaderboard from "../components/Leaderboard";

export default function HostPage() {
  const { room } = useParams();

  // ✅ Create room
  useEffect(() => {
    set(ref(db, `rooms/${room}`), {
      buzzerOpen: false,
      timestamp: null
    });
  }, [room]);

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h1>Host Panel</h1>
      <h3>Room Code: {room}</h3>

      {/* 🎮 Controls */}
      <HostControls room={room} />

      {/* 📊 Leaderboard */}
      <div style={{ marginTop: "30px" }}>
        <Leaderboard room={room} />
      </div>
    </div>
  );
}