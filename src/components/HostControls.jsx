import { ref, set, get } from "firebase/database";
import { db } from "../firebase/config";

export default function HostControls({ room }) {

  const start = async () => {
    console.log("START CLICKED");

    const roomRef = ref(db, `rooms/${room}`);

    // 🔥 ALWAYS CREATE ROOM
    const delay = 3000;

    await set(roomRef, {
      buzzerOpen: false,
      startTime: Date.now() + delay
    });

    console.log("START SUCCESS");
  };

  const clearRoomData = async () => {
    console.log("END CLICKED");

    await set(ref(db, `rooms/${room}`), null);
    console.log("ROOM CLEARED");
  };

  return (
    <div>
      <button onClick={start}>Start Buzzer</button>
      <button onClick={clearRoomData}>End Quiz 🧹</button>
    </div>
  );
}