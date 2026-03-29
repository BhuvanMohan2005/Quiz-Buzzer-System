import { ref, update, get } from "firebase/database";
import { db } from "../firebase/config";

export default function HostControls({ room }) {

  const start = async () => {
    const roomRef = ref(db, `rooms/${room}`);

    // reset players
    const playersRef = ref(db, "players");
    const snapshot = await get(playersRef);
    const data = snapshot.val();

    if (data) {
      Object.entries(data).forEach(([id, p]) => {
        if (p.room === room) {
          update(ref(db, `players/${id}`), {
            pressed: false,
            pressedAt: null
          });
        }
      });
    }

    const delay = 3000; // 3 sec countdown

    update(roomRef, {
      buzzerOpen: false,
      startTime: Date.now() + delay // 🔥 FUTURE TIME
    });
  };

  return <button onClick={start}>Start Buzzer</button>;
}