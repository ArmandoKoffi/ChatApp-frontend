import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, X, Trash2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';

interface VoiceMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (audioBlob: Blob, duration: number) => void;
}

export function VoiceMessageModal({ isOpen, onClose, onSend }: VoiceMessageModalProps) {
  const { t } = useLanguage();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      setRecordingTime(0);
      setAudioBlob(null);
      setAudioUrl(null);
    }
  }, [isOpen]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Erreur lors de l\'accès au microphone:', error);
      alert(t('cannotSendMessage'));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, recordingTime);
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">{t('voiceMessage')}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center space-y-6">
          {!audioBlob ? (
            <>
              <div className="flex items-center justify-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                  isRecording ? 'bg-red-100 animate-pulse' : 'bg-blue-100'
                }`}>
                  <Mic className={`w-12 h-12 ${isRecording ? 'text-red-500' : 'text-blue-500'}`} />
                </div>
              </div>

              <div className="text-2xl font-mono text-gray-700">
                {formatTime(recordingTime)}
              </div>

              <div className="flex justify-center space-x-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center space-x-2"
                  >
                    <Mic className="w-5 h-5" />
                    <span>{t('recordVoiceMessage')}</span>
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center space-x-2"
                  >
                    <Square className="w-5 h-5" />
                    <span>{t('cancelRecording')}</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-50 rounded-lg p-4">
                <audio controls className="w-full">
                  <source src={audioUrl || ''} type="audio/wav" />
                </audio>
                <p className="text-sm text-gray-600 mt-2">
                  {t('duration')}: {formatTime(recordingTime)}
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setAudioBlob(null);
                    setAudioUrl(null);
                    setRecordingTime(0);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{t('redo')}</span>
                </button>
                <button
                  onClick={handleSend}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('sendVoiceMessage')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
