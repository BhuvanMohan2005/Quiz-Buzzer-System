import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, get,set } from "firebase/database";
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

  const host = async () => {
  if (!room) return;

  const cleanRoom = room.trim().toLowerCase();
  const roomRef = ref(db, `rooms/${cleanRoom}`);

  const snapshot = await get(roomRef);

  // 🔐 Generate host key
  const hostKey = Math.random().toString(36).substring(2, 10);

  if (!snapshot.exists()) {
    // 🆕 Create room
    await set(roomRef, {
      phase: "waiting",
      hostKey
    });

    localStorage.setItem(`host_${cleanRoom}`, hostKey);

    navigate(`/host/${cleanRoom}`);
  } else {
    // ⚠️ Room exists → check if YOU are host
    const data = snapshot.val();
    const savedKey = localStorage.getItem(`host_${cleanRoom}`);

    if (savedKey && savedKey === data.hostKey) {
      navigate(`/host/${cleanRoom}`);
    } else {
      alert("❌ Room already has a host");
    }
  }
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