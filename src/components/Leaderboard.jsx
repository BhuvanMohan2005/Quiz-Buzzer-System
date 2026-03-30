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

      const allPlayers = Object.values(data);

      // ✅ Separate clicked vs not clicked
      const clicked = allPlayers.filter(p => p.serverTime);
      const notClicked = allPlayers.filter(p => !p.serverTime);

      // ✅ Sort only valid players
      clicked.sort((a, b) => a.serverTime - b.serverTime);

      // ✅ Combine: valid first, then inactive
      setPlayers([...clicked, ...notClicked]);
    });
  }, [room]);

  if (players.length === 0) return null;

  // ✅ Winner = first valid player
  const winner = players.find(p => p.serverTime);

  return (
    <div className="leaderboard">
      <h2>🏆 Leaderboard</h2>

      <div className="table">
        {players.map((p, index) => {
          const isValid = !!p.serverTime;

          const actualTime = isValid
            ? p.pressedAt - startTime
            : null;

          const winnerTime = winner
            ? winner.pressedAt - startTime
            : null;

          const delay = isValid && winnerTime !== null
            ? actualTime - winnerTime
            : null;

          return (
            <div
              key={index}
              className={`row ${index === 0 && isValid ? "winner" : ""}`}
            >
              {/* Rank */}
              <span className="rank">
                {isValid
                  ? index === 0 ? "🥇"
                    : index === 1 ? "🥈"
                      : index === 2 ? "🥉"
                        : index + 1
                  : "—"}
              </span>

              {/* Name + Status */}
              <span className="name">
                {p.name}
                {!isValid && <span className="inactive"> (No Buzz)</span>}
              </span>

              {/* Actual Time */}
              <span className="time">
                {isValid ? `${actualTime} ms` : "—"}
              </span>

              {/* Delay */}
              <span className="delay">
                {isValid
                  ? delay === 0 ? "0 ms" : `+${delay} ms`
                  : "—"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}