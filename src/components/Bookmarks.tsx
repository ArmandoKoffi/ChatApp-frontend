import { useAuthContext } from "../contexts";
import { useEffect } from "react";
import { useBookmarks } from "../hooks/useBookmarks";
import io from "socket.io-client";

export function Bookmarks() {
  const { user } = useAuthContext();
  // Crée une instance socket.io (ou récupère celle globale selon ton archi)
  const socket = io("https://chatapp-shi2.onrender.com", {
    transports: ["websocket"],
    path: "/socket.io",
  });
  const { bookmarks, loading, add, remove } = useBookmarks(socket, user?._id);

  useEffect(() => {
    if (user) {
      socket.emit("join", user._id);
    }
    return () => {
      socket.disconnect();
    };
  }, [user, socket]);

  if (loading) return <div>Chargement...</div>;

  return (
    <div>
      <h2>Mes favoris</h2>
      {bookmarks.length === 0 && <div>Aucun favori</div>}
      <ul>
        {bookmarks.map((b) => (
          <li key={b._id}>
            <strong>{b.title || b.type}</strong> — {b.content || b.url}
            <button onClick={() => remove(b._id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
