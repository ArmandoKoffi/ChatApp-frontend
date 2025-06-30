import api from './api';
import { User } from './authService';

// Types pour les données utilisateur
export interface UpdateProfileData {
  username?: string;
  email?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other';
  interests?: string[];
  profilePicture?: File;
  removeProfilePicture?: boolean;
  age?: number;
  location?: string;
  intentions?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Service utilisateur
const userService = {
  // Récupérer tous les utilisateurs (pour les contacts potentiels)
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  
  // Récupérer un utilisateur par son ID
  getUserById: async (userId: string) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },
  
  // Mettre à jour le profil de l'utilisateur
  updateProfile: async (profileData: UpdateProfileData) => {
    // Utiliser FormData pour envoyer des fichiers
    const formData = new FormData();
    
    // Ajouter les champs texte au FormData
    if (profileData.username) formData.append('username', profileData.username);
    if (profileData.email) formData.append('email', profileData.email);
    if (profileData.bio !== undefined) formData.append('bio', profileData.bio);
    if (profileData.gender) formData.append('gender', profileData.gender);
    if (profileData.age !== undefined) formData.append('age', String(profileData.age));
    if (profileData.location !== undefined) formData.append('location', profileData.location);
    if (profileData.intentions !== undefined) formData.append('intentions', profileData.intentions);
    if (profileData.removeProfilePicture !== undefined) {
      formData.append('removeProfilePicture', String(profileData.removeProfilePicture));
    }
    
    // Ajouter les intérêts s'ils sont fournis
    if (profileData.interests && profileData.interests.length > 0) {
      profileData.interests.forEach((interest, index) => {
        formData.append(`interests[${index}]`, interest);
      });
    }
    
    // Ajouter l'image de profil si elle est fournie
    if (profileData.profilePicture) {
      formData.append('profilePicture', profileData.profilePicture);
    }
    
    const response = await api.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
  
  // Changer le mot de passe
  changePassword: async (passwordData: ChangePasswordData) => {
    const response = await api.put('/users/change-password', passwordData);
    return response.data;
  },
  
  // Récupérer les contacts de l'utilisateur
  getContacts: async () => {
    const response = await api.get('/users/contacts');
    return response.data;
  },
  
  // Ajouter un contact
  addContact: async (userId: string) => {
    const response = await api.post(`/users/contacts/${userId}`);
    return response.data;
  },
  
  // Supprimer un contact
  removeContact: async (userId: string) => {
    const response = await api.delete(`/users/contacts/${userId}`);
    return response.data;
  },
  
  // Bloquer un utilisateur
  blockUser: async (userId: string) => {
    const response = await api.post(`/users/block/${userId}`);
    return response.data;
  },
  
  // Débloquer un utilisateur
  unblockUser: async (userId: string) => {
    const response = await api.delete(`/users/block/${userId}`);
    return response.data;
  },
  
  // Récupérer les utilisateurs bloqués
  getBlockedUsers: async () => {
    const response = await api.get('/users/blocked');
    return response.data;
  }
};

export default userService;
