import { useState } from "react";
import { ref, get, update, serverTimestamp } from "firebase/database";
import { db } from "../firebase/config";

export default function BuzzerButton({ room, playerId }) {
  const [clicked, setClicked] = useState(false);

  const pressBuzzer = async () => {
    if (clicked) return;
    setClicked(true);

    const roomRef = ref(db, `rooms/${room}`);
    const snapshot = await get(roomRef);
    const data = snapshot.val();

    if (!data || !data.buzzerOpen) {
      setClicked(false);
      return;
    }

    // ✅ DO NOT block others anymore
    await update(ref(db, `players/${playerId}`), {
      pressed: true,
      pressedAt: serverTimestamp()
    });
  };

  return (
    <button disabled={clicked} onClick={pressBuzzer}>
      {clicked ? "WAIT..." : "BUZZ 🚨"}
    </button>
  );
}