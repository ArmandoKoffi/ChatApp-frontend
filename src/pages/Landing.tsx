
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Users, Heart, Shield, Globe, Star, ArrowRight, Play } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export function Landing() {
  const { t } = useLanguage();
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: t('instantMessaging'),
      description: t('instantMessagingDesc')
    },
    {
      icon: <Users className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: t('chatRooms'),
      description: t('chatRoomsDesc')
    },
    {
      icon: <Heart className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: t('authenticConnections'),
      description: t('authenticConnectionsDesc')
    },
    {
      icon: <Shield className="w-6 h-6 sm:w-8 sm:h-8" />,
      title: t('guaranteedSecurity'),
      description: t('guaranteedSecurityDesc')
    }
  ];

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

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 pb-12 sm:pb-20">
        <div className="text-center">
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm mb-4 sm:mb-6">
              <Star className="w-4 h-4 text-yellow-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">{t('newPlatform')}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 animate-fade-in leading-tight">
            {t('connectWith')}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 block sm:inline">
              {" "}{t('theWorld')}
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto animate-fade-in px-4">
            {t('landingDescription')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center animate-scale-in max-w-md sm:max-w-none mx-auto">
            <Link
              to="/register"
              className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-semibold shadow-xl hover:shadow-2xl flex items-center justify-center space-x-2"
            >
              <span>{t('startFree')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/learn-more" className="group px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-full hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-medium flex items-center justify-center space-x-2">
              <Play className="w-4 h-4" />
              <span>{t('learnMore')}</span>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-12 sm:mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2 animate-fade-in border border-gray-100/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-blue-600 mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-200">
                {feature.icon}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-12 sm:mt-20 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="animate-scale-in group">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2 group-hover:scale-110 transition-transform">10K+</div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">{t('activeUsers')}</div>
            </div>
            <div className="animate-scale-in group" style={{ animationDelay: '0.1s' }}>
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2 group-hover:scale-110 transition-transform">50K+</div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">{t('messagesSent')}</div>
            </div>
            <div className="animate-scale-in group" style={{ animationDelay: '0.2s' }}>
              <div className="text-2xl sm:text-3xl font-bold text-pink-600 mb-2 group-hover:scale-110 transition-transform">1K+</div>
              <div className="text-sm sm:text-base text-gray-600 font-medium">{t('successfulMeetings')}</div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-12 sm:mt-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12 animate-fade-in">
            {t('whatUsersSay')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {[1, 2, 3].map((index) => (
              <div 
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in border border-gray-100/50"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center mb-4">
                  <img 
                    src={`https://images.unsplash.com/photo-${index === 1 ? '1494790108755-2616b612b789' : index === 2 ? '1507003211169-0a1dd7228f2d' : '1438761681033-6461ffad8d80'}?w=40&h=40&fit=crop&crop=face`}
                    alt="User"
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover mr-3"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Utilisateur {index}</h4>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-sm sm:text-base text-gray-600 italic">
                  "{t('testimonial' + index)}"
                </p>
              </div>
            ))}
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
