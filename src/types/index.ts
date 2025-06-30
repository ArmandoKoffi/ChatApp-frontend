
export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  age?: number;
  gender?: 'homme' | 'femme' | 'autre';
  interests?: string[];
  intentions?: 'amis' | 'rencontres' | 'connaissances' | 'mariage';
  profilePicture?: string;
  location?: string;
  role: UserRole;
  isOnline: boolean;
  lastSeen: Date;
  isBanned?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  description: string;
  type: 'amis' | 'rencontres' | 'connaissances' | 'mariage' | 'general';
  connectedUsers: number;
  maxUsers?: number;
  isActive: boolean;
  createdAt: Date;
  moderators?: string[];
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  roomId: string;
  timestamp: Date;
  isPrivate?: boolean;
  recipientId?: string;
  isReported?: boolean;
}

export interface PrivateMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  recipientId: string;
  recipientName: string;
  timestamp: Date;
  isRead: boolean;
}

export type CurrentView = 'home' | 'bookmarks' | 'messages' | 'gallery' | 'settings' | 'rooms' | 'admin' | 'profile' | 'search';
