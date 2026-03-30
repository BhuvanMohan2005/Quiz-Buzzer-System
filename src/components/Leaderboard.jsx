import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/config";

export default function Leaderboard({ room }) {
  const [players, setPlayers] = useState([]);
  const [startTime, setStartTime] = useState(null);

  // 📥 Fetch players
  useEffect(() => {
    const playersRef = ref(db, `rooms/${room}/players`);

    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setPlayers([]);
        return;
      }

      const parsed = Object.entries(data).map(([id, p]) => ({
  id,
  name: p.name || "Unknown", // ✅ safety
  ...p,
}));

      setPlayers(parsed);
    });

  }, [room]);

  // 📥 Fetch startTime
  useEffect(() => {
    const roomRef = ref(db, `rooms/${room}`);

    onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.startTime) {
        setStartTime(data.startTime);
      }
    });

  }, [room]);

  // 🧠 Compute leaderboard
  const leaderboard = players
    .filter(p => p.pressedAt)
    .map(p => ({
      ...p,
      reactionTime: p.pressedAt - startTime,
    }))
    .sort((a, b) => a.serverTime - b.serverTime);


  const allAnswered =
  players.length > 0 &&
  players.every(p => p.pressdAt);
  return (
    <div>
      <h2>Leaderboard</h2>
      {allAnswered&& leaderboard.length === 0 ? (
        <p>No buzz yet</p>
      ) : (
        <table border="1" style={{ margin: "auto" }}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Time (ms)</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((p, i) => (
              <tr key={p.id}>
                <td>{i + 1}</td>
                <td>{p.name}</td>
                <td>{p.reactionTime}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}