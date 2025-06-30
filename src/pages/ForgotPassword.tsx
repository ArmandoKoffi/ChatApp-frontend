import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Send } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { useAuthContext } from '../contexts';
import { useToast } from '../hooks';

export function ForgotPassword() {
  const { t } = useLanguage();
  const { forgotPassword, loading: authLoading } = useAuthContext();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await forgotPassword({ email });
      
      toast({
        title: "Email envoyé",
        description: "Si un compte est associé à cet e-mail, vous recevrez un mot de passe temporaire.",
        variant: "default"
      });
      
      setIsSubmitted(true);
    } catch (error: Error | unknown) {
      toast({
        title: "Erreur",
        description: (error as Error & { response?: { data?: { message?: string } } }).response?.data?.message || "Une erreur est survenue lors de l'envoi de l'email",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-8 border border-gray-100/50 animate-fade-in">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4 animate-fade-in">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ChatApp</span>
          </div>
          <h2 className="mt-6 text-2xl sm:text-3xl font-bold text-gray-900">
            Mot de passe oublié ?
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.
          </p>
        </div>

        {!isSubmitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Adresse e-mail
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded relative block w-full px-3 py-2 sm:py-3 border border-gray-300 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-sm sm:text-base"
                  aria-label="Adresse e-mail"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={authLoading}
                className={`group relative w-full flex justify-center py-2 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${authLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {authLoading ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </span>
                {authLoading ? t('processing') : 'Réinitialiser le mot de passe'}
              </button>
            </div>

            <div className="text-center text-sm sm:text-base">
              <Link to="/login" className="text-blue-600 hover:text-blue-700 transition-colors duration-200">
                Retour à la connexion
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-center">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6 animate-fade-in">
              <p className="text-green-700 text-sm sm:text-base">
                Si un compte est associé à cet e-mail, vous recevrez sous peu un mot de passe temporaire. Veuillez vérifier votre boîte de réception et vos spams.
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium shadow hover:shadow-lg"
            >
              Retour à la connexion
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
