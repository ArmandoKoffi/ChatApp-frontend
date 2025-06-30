import axios from "axios";

// Création d'une instance axios avec la configuration de base
const api = axios.create({
baseURL: import.meta.env.VITE_API_URL || "https://chatapp-shi2.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Pour permettre l'envoi de cookies
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Variable pour éviter les redirections multiples
let isRedirecting = false;

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gérer les erreurs 401 (non autorisé) - rediriger vers la page de connexion
    if (error.response && error.response.status === 401) {
      // Éviter les redirections multiples
      if (!isRedirecting) {
        isRedirecting = true;
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Utiliser une redirection douce au lieu de window.location.href
        setTimeout(() => {
          if (
            window.location.pathname !== "/login" &&
            window.location.pathname !== "/landing"
          ) {
            window.location.replace("/login");
          }
          isRedirecting = false;
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
