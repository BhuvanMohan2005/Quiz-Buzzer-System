import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/config";

export default function Leaderboard({ room, startTime }) {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const playersRef = ref(db, `rooms/${room}/players`);

    return onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      let list = Object.values(data)
        .filter(p => p.serverTime);

      // 🔥 FAIR SORT
      list.sort((a, b) => a.serverTime - b.serverTime);

      setPlayers(list);
    });
  }, [room]);

  if (players.length === 0) return null;

  const winner = players[0];
  const winnerTime = winner.pressedAt - startTime;

  return (
    <div className="leaderboard">
      <h2>🏆 Leaderboard</h2>

      <div className="table">
        {players.map((p, index) => {
          const actualTime = p.pressedAt - startTime;
          const delay = actualTime - winnerTime;

          return (
            <div
              key={index}
              className={`row ${index === 0 ? "winner" : ""}`}
            >
              {/* Rank */}
              <span className="rank">
                {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
              </span>

              {/* Name */}
              <span className="name">{p.name}</span>

              {/* Actual Time */}
              <span className="time">
                {actualTime} ms
              </span>

              {/* Delay */}
              <span className="delay">
                {delay === 0 ? "0 ms" : `+${delay} ms`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}