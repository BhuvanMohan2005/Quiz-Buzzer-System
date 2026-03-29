import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import { db } from "../firebase/config";

export default function Home() {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const navigate = useNavigate();


const join = async () => {
  if (!name || !room) {
    alert("Enter name and room");
    return;
  }

  const snapshot = await get(ref(db, `rooms/${room}`));

  if (!snapshot.exists()) {
    alert("Room does not exist. Wait for host.");
    return;
  }

  const id = Date.now();
  navigate(`/player/${room}/${id}/${name}`);
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