
import { useState, useRef, useEffect } from 'react';

interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isConnecting: boolean;
  startCall: (isVideo: boolean) => Promise<void>;
  endCall: () => void;
  toggleVideo: () => void;
  toggleAudio: () => void;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  error: string | null;
}

const defaultConfig: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

export function useWebRTC(config: WebRTCConfig = defaultConfig): UseWebRTCReturn {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const startCall = async (isVideo: boolean) => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Obtenir le flux local
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true
      });
      
      setLocalStream(stream);
      setIsVideoEnabled(isVideo);
      
      // Créer la connexion peer
      peerConnection.current = new RTCPeerConnection(config);
      
      // Ajouter les pistes locales
      stream.getTracks().forEach(track => {
        if (peerConnection.current) {
          peerConnection.current.addTrack(track, stream);
        }
      });
      
      // Gérer les pistes distantes
      peerConnection.current.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
      };
      
      // Gérer les changements de connexion
      peerConnection.current.onconnectionstatechange = () => {
        if (peerConnection.current) {
          const state = peerConnection.current.connectionState;
          if (state === 'connected') {
            setIsConnected(true);
            setIsConnecting(false);
          } else if (state === 'disconnected' || state === 'failed') {
            setIsConnected(false);
            setIsConnecting(false);
          }
        }
      };
      
      // Simuler une connexion réussie après 2 secondes (pour la démo)
      setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);
      }, 2000);
      
    } catch (err) {
      setError('Erreur lors de l\'accès aux médias');
      setIsConnecting(false);
      console.error('Erreur WebRTC:', err);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    setRemoteStream(null);
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      } else if (!isVideoEnabled) {
        // Ajouter la vidéo si elle n'était pas activée
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            const videoTrack = stream.getVideoTracks()[0];
            if (peerConnection.current && localStream) {
              peerConnection.current.addTrack(videoTrack, localStream);
              localStream.addTrack(videoTrack);
              setIsVideoEnabled(true);
            }
          })
          .catch(err => console.error('Erreur lors de l\'activation de la vidéo:', err));
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  };

  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return {
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
  };
}
