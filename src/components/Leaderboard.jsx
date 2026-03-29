import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/config";

export default function Leaderboard({ room }) {
    const [players, setPlayers] = useState([]);
    const [startTime, setStartTime] = useState(null);

    // ✅ Get start time
    useEffect(() => {
        const roomRef = ref(db, `rooms/${room}`);

        onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            setStartTime(data?.startTime);
        });
    }, [room]);

    // ✅ Get players and compute reaction time
    useEffect(() => {
        const playersRef = ref(db, "players");

        onValue(playersRef, (snapshot) => {
            const data = snapshot.val();

            const TEN_MIN = 10 * 60 * 1000;

            const list = Object.entries(data || {})
                .map(([id, p]) => ({ id, ...p }))
                .filter(p =>
                    p.room === room &&
                    p.pressedAt &&
                    p.createdAt &&
                    Date.now() - p.createdAt < TEN_MIN // 🔥 remove old junk
                )
                .map(p => ({
                    ...p,
                    reactionTime: p.pressedAt - startTime
                }))
                .sort((a, b) => a.reactionTime - b.reactionTime);

            setPlayers(list);
        });
    }, [room, startTime]);

    if (!startTime) return <p>Waiting for host...</p>;
    if (players.length === 0) return <p>No one buzzed yet</p>;

    const fastest = players[0].reactionTime;

    return (
        <div>
            <h3>Leaderboard</h3>

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
                    {players.map((p, i) => (
                        <tr
                            key={p.id}
                            style={{
                                backgroundColor: i === 0 ? "lightgreen" : "white",
                                fontWeight: i === 0 ? "bold" : "normal"
                            }}
                        >
                            <td>{i + 1}</td>

                            <td>
                                {p.name} {i === 0 && "🏆"}
                            </td>

                            <td>{p.reactionTime}</td>

                            <td>
                                {i === 0 ? 0 : p.reactionTime - fastest}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}