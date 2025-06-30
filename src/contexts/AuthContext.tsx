import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '../hooks';
import { User } from '../services/authService';
import { LoginData, RegisterData, ForgotPasswordData } from '../services/authService';
import { UpdateProfileData, ChangePasswordData } from '../services/userService';

// Interface pour le contexte d'authentification
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (userData: RegisterData) => Promise<void | { success: boolean; message: string }>;
  login: (loginData: LoginData) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<{ success: boolean; message: string }>;
  updateProfile: (profileData: UpdateProfileData) => Promise<{ success: boolean; message: string }>;
  changePassword: (passwordData: ChangePasswordData) => Promise<{ success: boolean; message: string }>;
  updateUser: (updatedUser: User) => void;
}

// Création du contexte
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props pour le provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider du contexte d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};
