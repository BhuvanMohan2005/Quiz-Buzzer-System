import { useState } from "react";
import { ref, get, update } from "firebase/database";
import { db } from "../firebase/config";

export default function BuzzerButton({ room, playerId }) {
  const [clicked, setClicked] = useState(false);

  const pressBuzzer = async () => {
    if (clicked) return;

    const snapshot = await get(ref(db, `rooms/${room}`));
    const data = snapshot.val();

    if (!data || !data.buzzerOpen) {
      return;
    }

    setClicked(true);

    await update(ref(db, `rooms/${room}/players/${playerId}`), {
      pressed: true,
      pressedAt: Date.now(), // ✅ correct
    });

    console.log("BUZZ SENT");
  };

  return (
    <button disabled={clicked} onClick={pressBuzzer}>
      {clicked ? "WAIT..." : "BUZZ 🚨"}
    </button>
  );
}