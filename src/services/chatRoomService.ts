import api from './api';
import { ChatRoom } from '@/types';

// Fetch all chat rooms from the backend
export const fetchChatRooms = async (): Promise<ChatRoom[]> => {
  try {
    const response = await api.get('/chatrooms');
    return response.data;
  } catch (error) {
    console.error('Error fetching chat rooms:', error);
    throw error;
  }
};

// Create a new chat room
export const createChatRoom = async (roomData: Partial<ChatRoom>): Promise<ChatRoom> => {
  try {
    const response = await api.post('/chatrooms', roomData);
    return response.data;
  } catch (error) {
    console.error('Error creating chat room:', error);
    throw error;
  }
};
