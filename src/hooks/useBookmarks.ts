import { useEffect, useState, useCallback } from "react";
import type { Socket } from "socket.io-client";
import { Bookmark } from "../types/bookmark";
import {
  getBookmarks,
  addBookmark,
  removeBookmark,
} from "../services/bookmarkService";
export function useBookmarks(socket: unknown, userId: string) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getBookmarks()
      .then((data) => setBookmarks(data))
      .finally(() => setLoading(false));
  }, [userId]);

  // Socket.io listeners
  useEffect(() => {
    if (!socket) return;
    const s = socket as Socket;
    const handleAdded = (bookmark: Bookmark) => {
      setBookmarks((prev) => [bookmark, ...prev]);
    };
    const handleRemoved = ({ id }: { id: string }) => {
      setBookmarks((prev) => prev.filter((b) => b._id !== id));
    };
    s.on("bookmarkAdded", handleAdded);
    s.on("bookmarkRemoved", handleRemoved);
    return () => {
      s.off("bookmarkAdded", handleAdded);
      s.off("bookmarkRemoved", handleRemoved);
    };
  }, [socket]);

  // Actions
  const add = useCallback(
    async (data: Omit<Bookmark, "_id" | "date" | "user">) => {
      const res = await addBookmark(data);
      // L'état sera mis à jour par le socket
      return res;
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    await removeBookmark(id);
    // L'état sera mis à jour par le socket
  }, []);

  return { bookmarks, loading, add, remove };
}
