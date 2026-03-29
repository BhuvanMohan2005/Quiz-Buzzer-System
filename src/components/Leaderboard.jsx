import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/config";

export default function Leaderboard({ room }) {
  const [players, setPlayers] = useState([]);
  const [startTime, setStartTime] = useState(null);

  // ✅ Listen room
  useEffect(() => {
    const roomRef = ref(db, `rooms/${room}`);

    return onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data?.startTime) {
        setStartTime(data.startTime);
      }
    });
  }, [room]);

  // ✅ Listen players (NO startTime dependency)
  useEffect(() => {
    const playersRef = ref(db, "players");

    return onValue(playersRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setPlayers([]);
        return;
      }

      // 🔥 DO NOT use startTime here directly
      const rawPlayers = Object.entries(data)
        .map(([id, p]) => ({ id, ...p }))
        .filter(p =>
          p.room &&
          p.room.toString().trim().toLowerCase() === room &&
          p.pressedAt
        );

      setPlayers(rawPlayers);
    });
  }, [room]);

  // ✅ Compute AFTER state updates
  const computed = players
    .filter(p => startTime && p.pressedAt >= startTime)
    .map(p => ({
      ...p,
      reactionTime: p.pressedAt - startTime
    }))
    .sort((a, b) => a.reactionTime - b.reactionTime);

  return (
    <div style={{ marginTop: "20px" }}>
      <h3>Leaderboard</h3>

      {!startTime && <p>Waiting for host...</p>}

      {startTime && computed.length === 0 && (
        <p>No one buzzed yet</p>
      )}

      {computed.length > 0 && (
        <table border="1" cellPadding="10" style={{ margin: "auto" }}>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Reaction Time (ms)</th>
              <th>Delay (ms)</th>
            </tr>
          </thead>

          <tbody>
            {computed.map((p, i) => {
              const fastest = computed[0].reactionTime;

              return (
                <tr
                  key={p.id}
                  style={{
                    backgroundColor: i === 0 ? "lightgreen" : "white",
                    fontWeight: i === 0 ? "bold" : "normal"
                  }}
                >
                  <td>{i + 1}</td>
                  <td>{p.name} {i === 0 && "🏆"}</td>
                  <td>{p.reactionTime}</td>
                  <td>{i === 0 ? 0 : p.reactionTime - fastest}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}