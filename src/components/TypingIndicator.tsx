
import { useEffect, useState } from 'react';

interface TypingIndicatorProps {
  isTyping: boolean;
  isRecording?: boolean;
  userName?: string;
  isGroupChat?: boolean;
}

export function TypingIndicator({ isTyping, isRecording = false, userName, isGroupChat = false }: TypingIndicatorProps) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    if (!isTyping && !isRecording) {
      setDots('');
      return;
    }

    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isTyping, isRecording]);

  if (!isTyping && !isRecording) return null;

  return (
    <div className="flex items-center px-4 py-2 text-sm text-gray-500 animate-fade-in">
      <div className="flex space-x-1 mr-2">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      {userName 
        ? isRecording 
          ? `${userName} enregistre un vocal${dots}` 
          : isGroupChat 
            ? `${userName} sont en train d'écrire${dots}` 
            : `${userName} est en train d'écrire${dots}` 
        : isRecording 
          ? `Enregistrement d'un vocal${dots}` 
          : `Écriture en cours${dots}`}
    </div>
  );
}
