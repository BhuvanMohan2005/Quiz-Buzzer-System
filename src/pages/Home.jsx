import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { db } from "../firebase/config";

export default function Home() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();

  const join = async () => {
    // ✅ basic validation
    if (!name || !room) {
      alert("Enter team name and room code");
      return;
    }

    try {
      // 🔍 check if room exists
      const roomRef = ref(db, `rooms/${room}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        alert("Room not created yet. Ask host to start first.");
        return;
      }

      // ✅ room exists → allow join
      const id = Date.now();
      navigate(`/player/${room}/${id}/${name}`);

    } catch (err) {
      console.error("Error checking room:", err);
    }
  };

  const host = () => {
    if (!room) {
      alert("Enter room code");
      return;
    }

    navigate(`/host/${room}`);
  };

  return (
    <div>
      <h2>Quiz Buzzer</h2>

      <input
        placeholder="Team Name"
        onChange={e => setName(e.target.value)}
      />

      <input
        placeholder="Room Code"
        onChange={e => setRoom(e.target.value)}
      />

      <button onClick={join}>Join</button>
      <button onClick={host}>Host</button>
    </div>
  );
}