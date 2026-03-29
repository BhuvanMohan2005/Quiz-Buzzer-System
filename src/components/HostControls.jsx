import { ref, update, get, set } from "firebase/database";
import { db } from "../firebase/config";

export default function HostControls({ room }) {

  // 🚀 Start buzzer
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

    // start with delay
    const delay = 3000;

    update(roomRef, {
      buzzerOpen: false,
      startTime: Date.now() + delay
    });
  };

  // 🧹 CLEAR ROOM DATA
  const clearRoomData = async () => {
    const playersRef = ref(db, "players");
    const snapshot = await get(playersRef);
    const data = snapshot.val();

    if (data) {
      Object.entries(data).forEach(([id, p]) => {
        if (p.room === room) {
          set(ref(db, `players/${id}`), null); // delete player
        }
      });
    }

    set(ref(db, `rooms/${room}`), null); // delete room
  };

  return (
    <div>
      <button onClick={start}>Start Buzzer</button>
      <button onClick={clearRoomData}>End Quiz 🧹</button>
    </div>
  );
}