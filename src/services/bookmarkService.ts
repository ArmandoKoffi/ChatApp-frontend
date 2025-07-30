import api from "./api";
import { Bookmark } from "../types/bookmark";

export const getBookmarks = async (): Promise<Bookmark[]> => {
  const res = await api.get("/bookmarks");
  return res.data.data;
};

export const addBookmark = async (
  bookmark: Omit<Bookmark, "_id" | "date" | "user">
) => {
  const res = await api.post("/bookmarks", bookmark);
  return res.data.data;
};

export const removeBookmark = async (id: string): Promise<{ id: string }> => {
  const res = await api.delete(`/bookmarks/${id}`);
  return res.data.data;
};
