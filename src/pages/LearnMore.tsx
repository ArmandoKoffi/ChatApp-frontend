import { Link } from 'react-router-dom';
import { MessageCircle, Users, Heart, Shield, ArrowLeft, Play } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export function LearnMore() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center space-x-2 animate-fade-in">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">ChatApp</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="px-3 py-2 sm:px-4 sm:py-2 text-blue-600 hover:text-blue-700 transition-all duration-200 font-medium rounded-full hover:bg-blue-50 text-sm sm:text-base"
              >
                {t('login')}
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 sm:px-6 sm:py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-medium text-sm sm:text-base"
              >
                {t('register')}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-12 sm:pb-20">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 animate-fade-in">
            {t('learnMore')}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez tout ce que ChatApp a à offrir pour transformer votre façon de communiquer et de vous connecter avec le monde.
          </p>
        </div>

        {/* Detailed Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50 animate-fade-in">
            <div className="text-blue-600 mb-4">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{t('instantMessaging')}</h2>
            <p className="text-base text-gray-600 mb-4">
              {t('instantMessagingDesc')} Profitez d'une messagerie fluide avec des fonctionnalités avancées comme les messages vocaux, les appels vidéo et le partage de fichiers.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="text-green-600 mb-4">
              <Users className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{t('chatRooms')}</h2>
            <p className="text-base text-gray-600 mb-4">
              {t('chatRoomsDesc')} Créez ou rejoignez des salons thématiques pour discuter de vos passions avec des personnes partageant les mêmes intérêts.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="text-red-600 mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{t('authenticConnections')}</h2>
            <p className="text-base text-gray-600 mb-4">
              {t('authenticConnectionsDesc')} Notre algorithme de matching vous aide à trouver des personnes compatibles pour des relations significatives.
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100/50 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="text-purple-600 mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{t('guaranteedSecurity')}</h2>
            <p className="text-base text-gray-600 mb-4">
              {t('guaranteedSecurityDesc')} Avec un chiffrement de bout en bout et des outils de modération avancés, votre sécurité est notre priorité absolue.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12 sm:mt-16">
          <Link
            to="/register"
            className="group inline-flex items-center justify-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-xl hover:shadow-2xl"
          >
            <span>{t('startFree')}</span>
          </Link>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-all duration-200 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12 mt-12 sm:mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4 animate-fade-in">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <MessageCircle className="w-3 h-3 text-white" />
              </div>
              <span className="text-lg font-semibold">ChatApp</span>
            </div>
            <p className="text-gray-400 text-sm sm:text-base">© 2025 ChatApp. {t('allRightsReserved')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
