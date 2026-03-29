import { useState } from "react";
import { ref, get, update, serverTimestamp } from "firebase/database";
import { db } from "../firebase/config";

export default function BuzzerButton({ room, playerId }) {
  const [clicked, setClicked] = useState(false);

  const pressBuzzer = async () => {
  if (clicked) return;

  const snapshot = await get(ref(db, `rooms/${room}`));
  const data = snapshot.val();

  if (!data || Date.now() < data.startTime) {
    return;
  }

  setClicked(true);

  await update(ref(db, `players/${id}`), {
    pressed: true,
    pressedAt: Date.now()   // 🔥 CHANGE THIS
  });

  console.log("BUZZ SENT");
};

  return (
    <button disabled={clicked} onClick={pressBuzzer}>
      {clicked ? "WAIT..." : "BUZZ 🚨"}
    </button>
  );
}