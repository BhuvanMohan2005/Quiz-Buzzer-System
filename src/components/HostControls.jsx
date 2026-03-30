import { ref, update, get } from "firebase/database";
import { db } from "../firebase/config";

export default function HostControls({ room }) {

  const startBuzzer = async () => {
    const roomRef = ref(db, `rooms/${room}`);
    const now = Date.now();

    // ✅ RESET PLAYERS (NOT DELETE)
    const playersRef = ref(db, `rooms/${room}/players`);
    const snapshot = await get(playersRef);

    if (snapshot.exists()) {
      const updates = {};

      Object.keys(snapshot.val()).forEach((id) => {
        updates[`${id}/pressed`] = false;
        updates[`${id}/pressedAt`] = null;
      });

      await update(playersRef, updates);
    }

    // ✅ START ROUND
    await update(roomRef, {
      phase: "countdown",
      startTime: now + 3000
    });

    setTimeout(() => {
      update(roomRef, {
        phase: "live"
      });
    }, 3000);
  };

  return (
    <div>
      <button onClick={startBuzzer}>Start Buzzer</button>
    </div>
  );
}