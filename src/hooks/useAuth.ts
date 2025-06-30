import { useState, useEffect, useCallback } from "react";
import { authService, userService } from "../services";
import {
  User,
  LoginData,
  RegisterData,
  ForgotPasswordData,
} from "../services/authService";
import { UpdateProfileData, ChangePasswordData } from "../services/userService";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

// Hook personnalisé pour gérer l'authentification
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
  });

  // Variable pour éviter les appels multiples
  const [isChecking, setIsChecking] = useState(false);

  // Fonction pour rediriger vers la page de connexion
  const redirectToLanding = useCallback(() => {
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.href = "/landing";
      }, 500);
    }
  }, []);

  // Charger l'utilisateur avec gestion d'erreur améliorée
  const loadUser = useCallback(async () => {
    // Éviter les appels multiples simultanés
    if (isChecking) {
      return;
    }

    try {
      setIsChecking(true);

      // Vérifier d'abord s'il y a un token
      const token = localStorage.getItem("token");
      if (!token) {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
        return;
      }

      // Vérifier l'authentification avec timeout
      const authStatusPromise = authService.isAuthenticated();
      const authStatus = await Promise.race([
        authStatusPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 5000)
        ),
      ]);

      if (authStatus) {
        // Si authentifié, récupérer les données utilisateur
        const userDataPromise = authService.getStoredUser();
        const userData = await Promise.race([
          userDataPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 5000)
          ),
        ]);

        if (userData) {
          setAuthState({
            user: userData as User,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,
          });
          // Ne pas rediriger automatiquement pour maintenir la page actuelle
        }
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
        // Ne pas rediriger automatiquement pour maintenir la page actuelle
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'utilisateur:", err);
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
      // Ne pas rediriger automatiquement pour maintenir la page actuelle
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, redirectToLanding]);

  // Charger l'utilisateur au démarrage
  useEffect(() => {
    loadUser();
  }, []);

  // Inscription
  const register = useCallback(
    async (userData: RegisterData) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await authService.register(userData);

        if (response.success && response.token) {
          // Stocker le token si fourni
          localStorage.setItem("token", response.token);

          // Recharger les données utilisateur
          await loadUser();
        }

        return response;
      } catch (err: unknown) {
        const errorMessage = "Erreur lors de l'inscription";
        setAuthState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        throw err;
      } finally {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    },
    [loadUser]
  );

  // Connexion
  const login = useCallback(
    async (loginData: LoginData) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        // Connexion avec timeout
        const loginPromise = authService.login(loginData);
        const response = await Promise.race([
          loginPromise,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 5000)
          ),
        ]);

        if (response.success) {
          if (response.token) {
            // Stocker le token si fourni
            localStorage.setItem("token", response.token);
          }

          // Recharger les données utilisateur
          const userDataPromise = authService.getStoredUser();
          const userData = await Promise.race([
            userDataPromise,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Timeout")), 5000)
            ),
          ]);

          if (userData) {
            setAuthState({
              user: userData as User,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
          }
        }

        return response;
      } catch (err: unknown) {
        const errorMessage = "Erreur lors de la connexion";
        setAuthState((prev) => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }));
        // Ne pas rediriger automatiquement pour maintenir la page actuelle
        throw err;
      } finally {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    },
    [redirectToLanding]
  );

  // Déconnexion
  const logout = useCallback(async () => {
    setAuthState((prev) => ({ ...prev, loading: true }));

    try {
      // Déconnexion avec timeout
      const logoutPromise = authService.logout();
      const response = await Promise.race([
        logoutPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), 5000)
        ),
      ]);

      // Émettre l'événement de déconnexion si nécessaire
      if (
        response &&
        response.action === "emitLogoutEvent" &&
        authState.user?._id
      ) {
        if (typeof window !== "undefined" && "socket" in window) {
          const socket = window.socket as unknown;
          if (socket) {
            (socket as { emit: (event: string, data: string) => void }).emit(
              "logout",
              authState.user._id
            );
            console.log("Logout event emitted for user:", authState.user._id);
          }
        }
      }
    } catch (err: unknown) {
      console.error("Erreur lors de la déconnexion:", err);
    } finally {
      // Nettoyer l'état local dans tous les cas
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      });
      redirectToLanding();
    }
  }, [authState.user, redirectToLanding]);

  // Réinitialisation du mot de passe
  const forgotPassword = useCallback(async (data: ForgotPasswordData) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await authService.forgotPassword(data);
      return response;
    } catch (err: unknown) {
      const errorMessage = "Erreur lors de la réinitialisation du mot de passe";
      setAuthState((prev) => ({ ...prev, error: errorMessage }));
      throw err;
    } finally {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Mise à jour du profil
  const updateProfile = useCallback(async (profileData: UpdateProfileData) => {
    setAuthState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await userService.updateProfile(profileData);
      if (response.success) {
        const userData = await authService.getStoredUser();
        if (userData) {
          setAuthState((prev) => ({ ...prev, user: userData as User }));
        }
      }
      return response;
    } catch (err: unknown) {
      const errorMessage = "Erreur lors de la mise à jour du profil";
      setAuthState((prev) => ({ ...prev, error: errorMessage }));
      throw err;
    } finally {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Changement de mot de passe
  const changePassword = useCallback(
    async (passwordData: ChangePasswordData) => {
      setAuthState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await userService.changePassword(passwordData);
        return response;
      } catch (err: unknown) {
        const errorMessage = "Erreur lors du changement de mot de passe";
        setAuthState((prev) => ({ ...prev, error: errorMessage }));
        throw err;
      } finally {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    },
    []
  );

  // Mise à jour manuelle de l'utilisateur
  const updateUser = useCallback((updatedUser: User) => {
    setAuthState((prev) => ({ ...prev, user: updatedUser }));
  }, []);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: authState.isAuthenticated,
    register,
    login,
    logout,
    forgotPassword,
    updateProfile,
    changePassword,
    updateUser,
    loadUser,
  };
};

export default useAuth;
