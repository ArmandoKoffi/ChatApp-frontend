import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Index from "./pages/Index";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { LearnMore } from "./pages/LearnMore";
import { ForgotPassword } from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";
import { LanguageProvider } from "./components/LanguageContext";
import { ThemeProvider } from "./components/ThemeContext";
import { AuthProvider, useAuthContext } from "./contexts";

const queryClient = new QueryClient();

import { useLocation } from 'react-router-dom';

// Composant pour les routes protégées
const ProtectedRoutes = () => {
  const { isAuthenticated, loading } = useAuthContext();
  const [authCheckCompleted, setAuthCheckCompleted] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    // Stocker le chemin actuel dans localStorage pour maintenir la page après un refresh
    localStorage.setItem('lastKnownPath', location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    // Mettre à jour l'état d'authentification en arrière-plan sans bloquer le rendu
    if (!loading) {
      setAuthCheckCompleted(true);
    }
  }, [loading]);

  // Récupérer le dernier chemin connu depuis localStorage
  const lastKnownPath = localStorage.getItem('lastKnownPath') || '/';
  // Vérifier si un token existe dans localStorage pour supposer que l'utilisateur est connecté
  const hasToken = !!localStorage.getItem('token');
  // Utiliser cette information pour décider du rendu initial
  const initiallyAuthenticated = hasToken && isAuthenticated !== false;

  return (
    <Routes>
      {initiallyAuthenticated || isAuthenticated ? (
        <>
          <Route path="/" element={<Index />} />
          <Route path="/landing" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="/learn-more" element={<Navigate to="/" replace />} />
          <Route
            path="/forgot-password"
            element={<Navigate to="/" replace />}
          />
          <Route path="*" element={<Index />} />
        </>
      ) : (
        <>
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/learn-more" element={<LearnMore />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          {/* Fallback to last known path or landing if path is invalid */}
          <Route path="/" element={lastKnownPath && lastKnownPath !== '/' ? <Navigate to={lastKnownPath} replace /> : <Landing />} />
          <Route path="*" element={lastKnownPath && lastKnownPath !== '/' && lastKnownPath !== '*' ? <Navigate to={lastKnownPath} replace /> : <Landing />} />
        </>
      )}
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ProtectedRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
