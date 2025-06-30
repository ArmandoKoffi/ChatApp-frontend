import { useState, useRef, useEffect } from 'react';
import { X, Mic, MicOff, Video, VideoOff, PhoneOff, Users } from 'lucide-react';
import { useWebRTC } from '@/hooks/useWebRTC';
import { useLanguage } from './LanguageContext';

interface VideoCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userAvatar: string;
  isAudioOnly?: boolean;
  onToggleVideo?: () => void;
  isGroupCall?: boolean;
}

export function VideoCallModal({ 
  isOpen, 
  onClose, 
  userName, 
  userAvatar, 
  isAudioOnly = false,
  onToggleVideo,
  isGroupCall = false 
}: VideoCallModalProps) {
  const { t } = useLanguage();
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const {
    localStream,
    remoteStream,
    isConnected,
    isConnecting,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio,
    isVideoEnabled,
    isAudioEnabled,
    error
  } = useWebRTC();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  useEffect(() => {
    if (isOpen) {
      startCall(!isAudioOnly);
    } else {
      endCall();
      setCallDuration(0);
    }
  }, [isOpen, isAudioOnly, startCall, endCall]);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    console.log(`Appel terminé avec ${userName}, durée: ${formatDuration(callDuration)}`);
    endCall();
    onClose();
  };

  const handleToggleVideo = () => {
    toggleVideo();
    if (onToggleVideo) {
      onToggleVideo();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-4xl h-full max-h-[90vh] flex flex-col animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img 
                src={userAvatar} 
                alt={userName}
                className="w-10 h-10 rounded-full animate-scale-in"
              />
              {isGroupCall && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <Users className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">{userName}</h3>
              <p className="text-gray-300 text-sm">
                {isConnecting ? t('connecting') : isConnected ? formatDuration(callDuration) : t('waiting')}
              </p>
              {error && (
                <p className="text-red-400 text-xs">{error}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title={t('close')}
            aria-label={t('close')}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Area */}
        <div className="flex-1 relative bg-gray-800 rounded-xl overflow-hidden animate-fade-in">
          {isVideoEnabled && isConnected ? (
            <>
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
              />
              
              {/* Local Video (Picture in Picture) */}
              <div className="absolute top-4 right-4 w-32 h-24 bg-gray-700 rounded-lg overflow-hidden animate-slide-in-right">
                <video
                  ref={localVideoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full animate-scale-in">
              <div className="text-center">
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-32 h-32 rounded-full mx-auto mb-4 animate-pulse"
                />
                <h3 className="text-white text-xl font-semibold">{userName}</h3>
                <p className="text-gray-300">
                  {isVideoEnabled ? t('videoCall') : t('audioCall')}
                  {isGroupCall && ` ${t('groupCall')}`}
                </p>
                {isConnecting && (
                  <div className="mt-4 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center space-x-4 mt-6">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all duration-200 hover:scale-110 ${
              !isAudioEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title={isAudioEnabled ? t('muteAudio') : t('unmuteAudio')}
            aria-label={isAudioEnabled ? t('muteAudio') : t('unmuteAudio')}
          >
            {isAudioEnabled ? <Mic className="w-6 h-6 text-white" /> : <MicOff className="w-6 h-6 text-white" />}
          </button>
          
          <button
            onClick={handleToggleVideo}
            className={`p-4 rounded-full transition-all duration-200 hover:scale-110 ${
              isVideoEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-500 hover:bg-red-600'
            }`}
            title={isVideoEnabled ? t('disableVideo') : t('enableVideo')}
            aria-label={isVideoEnabled ? t('disableVideo') : t('enableVideo')}
          >
            {isVideoEnabled ? <Video className="w-6 h-6 text-white" /> : <VideoOff className="w-6 h-6 text-white" />}
          </button>
          
          <button
            onClick={handleEndCall}
            className="p-4 bg-red-500 hover:bg-red-600 rounded-full transition-all duration-200 hover:scale-110"
            title={t('endCall')}
            aria-label={t('endCall')}
          >
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
