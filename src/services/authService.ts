import api from "./api";

// Types pour les données d'authentification
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender?: "male" | "female" | "other";
  profilePicture?: File;
  age?: string;
  interests?: string[];
  intentions?: string;
  location?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  bio: string;
  interests: string[];
  isOnline: boolean;
  gender?: string;
  role: string;
  age?: number;
  location?: string;
  intentions?: string;
}

// Variable pour éviter les appels multiples
let isCheckingAuth = false;

// Service d'authentification
const authService = {
  // Inscription d'un nouvel utilisateur
  register: async (userData: RegisterData) => {
    // Utiliser FormData pour envoyer des fichiers
    const formData = new FormData();
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("confirmPassword", userData.confirmPassword);

    if (userData.gender) {
      formData.append("gender", userData.gender);
    }
    if (userData.age) {
      formData.append("age", userData.age);
    }
    if (userData.interests && userData.interests.length > 0) {
      const formattedInterests = userData.interests.map(interest => ({ label: interest }));
      formData.append("interests", JSON.stringify(formattedInterests));
    }
    if (userData.intentions) {
      formData.append("intentions", userData.intentions);
    }
    if (userData.location) {
      formData.append("location", userData.location);
    }

    if (userData.profilePicture) {
      formData.append("profilePicture", userData.profilePicture);
    }

    const response = await api.post("/auth/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Connexion d'un utilisateur
  login: async (loginData: LoginData) => {
    const response = await api.post("/auth/login", loginData);
    return response.data;
  },

  // Déconnexion d'un utilisateur
  logout: async () => {
    try {
      const response = await api.get("/auth/logout");
      // Nettoyer le stockage local après la déconnexion
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return response.data;
    } catch (error) {
      // Même en cas d'erreur, nettoyer le stockage local
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      throw error;
    }
  },

  // Récupération du profil de l'utilisateur connecté
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Réinitialisation du mot de passe
  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: async (): Promise<boolean> => {
    // Éviter les appels multiples simultanés
    if (isCheckingAuth) {
      return false;
    }

    // Vérifier d'abord le token local
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }

    try {
      isCheckingAuth = true;
      const response = await api.get("/auth/me");
      return response.data.success === true;
    } catch (error: unknown) {
      console.warn(
        "Vérification d'authentification échouée:",
        (error as Error)?.message || 'Unknown error'
      );

      // Si l'erreur est 401, l'utilisateur n'est pas authentifié
      if ((error as { response?: { status: number } })?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return false;
      }

      // Pour les autres erreurs (connexion, etc.), considérer comme non authentifié
      // mais ne pas supprimer le token (au cas où le serveur serait temporairement indisponible)
      if ((error as { code?: string })?.code === "ECONNREFUSED" || (error as { code?: string })?.code === "NETWORK_ERROR") {
        console.warn("Serveur non disponible - garder le token pour plus tard");
      }

      return false;
    } finally {
      isCheckingAuth = false;
    }
  },

  // Récupérer l'utilisateur stocké localement
  getStoredUser: async (): Promise<User | null> => {
    try {
      const response = await api.get("/auth/me");
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error: unknown) {
      console.warn(
        "Récupération utilisateur échouée:",
        (error as Error)?.message || 'Unknown error'
      );

      if ((error as { response?: { status: number } })?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return null;
      }

      return null;
    }
  },

  // Mettre à jour l'utilisateur stocké localement
  updateStoredUser: async (user: User) => {
    // Cette fonction est gardée pour la compatibilité mais ne fait rien
    // car nous ne stockons plus les données utilisateur dans localStorage
  },
};

export default authService;
