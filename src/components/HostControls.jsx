import { ref, update, set } from "firebase/database";
import { db } from "../firebase/config";

export default function HostControls({ room }) {

  const startBuzzer = async () => {
    const roomRef = ref(db, `rooms/${room}`);

    // 🔥 Reset players for fresh round
    await set(ref(db, `rooms/${room}/players`), null);

    // ⏳ small delay (optional)
    setTimeout(async () => {
      await update(roomRef, {
        startTime: Date.now(),
        buzzerOpen: true,
      });
    }, 2000);
  };

  return (
    <div>
      <button onClick={startBuzzer}>Start Buzzer</button>
    </div>
  );
}