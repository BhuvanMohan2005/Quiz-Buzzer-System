import { ref, update, get } from "firebase/database";
import { db } from "../firebase/config";

export default function HostControls({ room }) {

  const startBuzzer = async () => {
    const roomRef = ref(db, `rooms/${room}`);
    const snapshot = await get(roomRef);
    const data = snapshot.val();

    const savedKey = localStorage.getItem(`host_${room}`);

    // 🔐 BLOCK UNAUTHORIZED HOST
    if (!data || data.hostKey !== savedKey) {
      alert("❌ You are not the host!");
      return;
    }

    const now = Date.now();

    // ✅ RESET PLAYERS
    const playersRef = ref(db, `rooms/${room}/players`);
    const playersSnap = await get(playersRef);

    if (playersSnap.exists()) {
      const updates = {};

      Object.keys(playersSnap.val()).forEach((id) => {
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