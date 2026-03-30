import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { db } from "../firebase/config";

export default function Home() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();


  const join = async () => {
    if (!name || !room) return;

    const cleanRoom = room.trim().toLowerCase();

    const snapshot = await get(ref(db, `rooms/${cleanRoom}`));

    if (!snapshot.exists()) {
      alert("Room does not exist");
      return;
    }

    const id = Date.now().toString();
    navigate(`/player/${cleanRoom}/${id}/${encodeURIComponent(name)}`);
  };

  const host = () => {
    const cleanRoom = room.trim().toLowerCase();
    navigate(`/host/${cleanRoom}`);
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