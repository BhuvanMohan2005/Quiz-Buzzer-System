
import { db } from "../firebase/config";
import { ref, set, update } from "firebase/database";
export default function HostControls({ room }) {

  const start = async () => {
  console.log("START CLICKED");

  const roomRef = ref(db, `rooms/${room}`);
  const delay = 3000;

  // Step 1: set start time
  await set(roomRef, {
    buzzerOpen: false,
    startTime: Date.now() + delay
  });

  // Step 2: OPEN buzzer after delay
  setTimeout(async () => {
    await update(roomRef, {
      buzzerOpen: true
    });
    console.log("BUZZER OPENED");
  }, delay);
};

  const clearRoomData = async () => {
    await set(ref(db, `rooms/${room}`), null);
  };

  return (
    <div>
      <button onClick={start}>Start Buzzer</button>
      <button onClick={clearRoomData}>End Quiz 🧹</button>
    </div>
  );
}