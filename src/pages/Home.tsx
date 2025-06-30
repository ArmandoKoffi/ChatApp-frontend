import { useState, useEffect } from "react";
import {
  MessageCircle,
  Users,
  Heart,
  Star,
  Sparkles,
  Zap,
  Globe,
  Shield,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

export function Home() {
  const { t } = useLanguage();
  const [currentStats, setCurrentStats] = useState({
    activeUsers: 1250,
    messagesDay: 45680,
    connections: 892,
  });

  // Animation des statistiques
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStats((prev) => ({
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 5),
        messagesDay: prev.messagesDay + Math.floor(Math.random() * 20),
        connections: prev.connections + Math.floor(Math.random() * 3),
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: MessageCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      title: t("instantMessaging"),
      description: t("instantMessagingDesc"),
    },
    {
      icon: Users,
      color: "text-green-500",
      bgColor: "bg-green-50",
      title: t("chatRooms"),
      description: t("chatRoomsDesc"),
    },
    {
      icon: Heart,
      color: "text-red-500",
      bgColor: "bg-red-50",
      title: t("authenticConnections"),
      description: t("authenticConnectionsDesc"),
    },
    {
      icon: Shield,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      title: t("guaranteedSecurity"),
      description: t("guaranteedSecurityDesc"),
    },
  ];

  const recentActivities = [
    {
      user: t("marie"),
      action: t("joinedRoomFriends"),
      time: t("minutesAgo").replace("%d", "2"),
      avatar: "👩‍💼",
    },
    {
      user: t("pierre"),
      action: t("sharedPhoto"),
      time: t("minutesAgo").replace("%d", "5"),
      avatar: "👨‍💻",
    },
    {
      user: t("sophie"),
      action: t("startedVideoCall"),
      time: t("minutesAgo").replace("%d", "8"),
      avatar: "👩‍🎨",
    },
    {
      user: t("lucas"),
      action: t("sentVoiceMessage"),
      time: t("minutesAgo").replace("%d", "12"),
      avatar: "👨‍🎓",
    },
  ];

  return (
    <div className="min-h-screen h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-2 xs:p-4 sm:p-6 lg:p-8 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header animé */}
        <div className="text-center mb-4 xs:mb-6 sm:mb-8 lg:mb-12 animate-fade-in">
          <div className="flex items-center justify-center space-x-2 mb-2 xs:mb-3 sm:mb-4 lg:mb-6 animate-scale-in">
            <div className="w-10 h-10 xs:w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <MessageCircle className="w-5 h-5 xs:w-6 h-6 sm:w-8 h-8 lg:w-10 lg:h-10 text-white" />
            </div>
            <span className="text-lg xs:text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900">ChatApp</span>
          </div>
          <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-4xl font-bold text-gray-900 mb-1 xs:mb-2 sm:mb-4">
            {t("welcome")}
          </h1>
          <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-1 xs:px-2 sm:px-4">
            {t("connectWith")} {t("theWorld")}
          </p>
        </div>

        {/* Statistiques en temps réel */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 lg:gap-6 mb-4 xs:mb-6 sm:mb-8 lg:mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-6 text-center shadow-lg border border-white/20 animate-fade-in hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-center w-8 h-8 xs:w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-blue-100 rounded-full mx-auto mb-1 xs:mb-2 sm:mb-3 lg:mb-4">
              <Users className="w-4 h-4 xs:w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-blue-600" />
            </div>
            <div className="text-base xs:text-lg sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-0.5 xs:mb-1 sm:mb-2 animate-pulse">
              {currentStats.activeUsers.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              {t("activeUsers")}
            </div>
          </div>

          <div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-6 text-center shadow-lg border border-white/20 animate-fade-in hover:scale-105 transition-transform duration-300"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center justify-center w-8 h-8 xs:w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-green-100 rounded-full mx-auto mb-1 xs:mb-2 sm:mb-3 lg:mb-4">
              <MessageCircle className="w-4 h-4 xs:w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-green-600" />
            </div>
            <div className="text-base xs:text-lg sm:text-2xl lg:text-3xl font-bold text-green-600 mb-0.5 xs:mb-1 sm:mb-2 animate-pulse">
              {currentStats.messagesDay.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              {t("messagesSent")}
            </div>
          </div>

          <div
            className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-6 text-center shadow-lg border border-white/20 animate-fade-in hover:scale-105 transition-transform duration-300"
            style={{ animationDelay: "0.4s" }}
          >
            <div className="flex items-center justify-center w-8 h-8 xs:w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-red-100 rounded-full mx-auto mb-1 xs:mb-2 sm:mb-3 lg:mb-4">
              <Heart className="w-4 h-4 xs:w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-red-600" />
            </div>
            <div className="text-base xs:text-lg sm:text-2xl lg:text-3xl font-bold text-red-600 mb-0.5 xs:mb-1 sm:mb-2 animate-pulse">
              {currentStats.connections.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-gray-600">
              {t("successfulMeetings")}
            </div>
          </div>
        </div>

        {/* Fonctionnalités principales */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4 lg:gap-6 mb-4 xs:mb-6 sm:mb-8 lg:mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20 animate-fade-in hover:scale-105 transition-all duration-300 group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`inline-flex items-center justify-center w-8 h-8 xs:w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 ${feature.bgColor} rounded-2xl mb-1 xs:mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon
                  className={`w-4 h-4 xs:w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 ${feature.color}`}
                />
              </div>
              <h3 className="text-xs xs:text-sm sm:text-base lg:text-lg font-semibold text-gray-900 mb-0.5 xs:mb-1 sm:mb-2">
                {feature.title}
              </h3>
              <p className="text-xs sm:text-sm lg:text-base text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Activité récente */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 xs:p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20 animate-fade-in mb-4 xs:mb-6 sm:mb-8 lg:mb-12">
          <div className="flex items-center justify-between mb-2 xs:mb-3 sm:mb-4 lg:mb-6">
            <h2 className="text-sm xs:text-base sm:text-lg lg:text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="w-3 h-3 xs:w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-500 mr-1 xs:mr-2 animate-pulse" />
              {t("recentActivity")}
            </h2>
            <div className="flex items-center text-xs sm:text-sm text-gray-500">
              <div className="w-1 h-1 xs:w-1.5 h-1.5 sm:w-2 h-2 bg-green-400 rounded-full mr-0.5 xs:mr-1 sm:mr-2 animate-pulse"></div>
              {t("live")}
            </div>
          </div>

          <div className="space-y-1 xs:space-y-2 sm:space-y-3 lg:space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-1 xs:space-x-2 sm:space-x-3 lg:space-x-4 p-1 xs:p-2 sm:p-3 lg:p-4 bg-gray-50/50 rounded-xl hover:bg-gray-50 transition-colors duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-sm xs:text-lg sm:text-2xl lg:text-3xl">
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm lg:text-base text-gray-900">
                    <span className="font-semibold">{activity.user}</span>{" "}
                    {activity.action}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {activity.time}
                  </p>
                </div>
                <div className="w-1 h-1 xs:w-1.5 h-1.5 sm:w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Éléments décoratifs flottants */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div
            className="absolute top-10 left-10 w-3 h-3 xs:w-4 h-4 bg-blue-400 rounded-full animate-bounce opacity-20"
            style={{ animationDelay: "0s", animationDuration: "3s" }}
          ></div>
          <div
            className="absolute top-32 right-20 w-2 h-2 xs:w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-20"
            style={{ animationDelay: "1s", animationDuration: "4s" }}
          ></div>
          <div
            className="absolute bottom-40 left-20 w-1.5 h-1.5 xs:w-2 h-2 bg-green-400 rounded-full animate-bounce opacity-20"
            style={{ animationDelay: "2s", animationDuration: "5s" }}
          ></div>
          <div
            className="absolute bottom-20 right-32 w-4 h-4 xs:w-5 h-5 bg-red-400 rounded-full animate-bounce opacity-20"
            style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
