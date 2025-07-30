export interface Bookmark {
  _id: string;
  user: string;
  message: string;
  type: "message" | "media" | "file" | "link";
  title?: string;
  content?: string;
  author?: string;
  chatName?: string;
  thumbnail?: string;
  url?: string;
  date: string;
}
