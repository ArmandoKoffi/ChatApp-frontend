import { useState } from "react";
import { MessageMenu } from "./MessageMenu";
import { useLanguage } from "./LanguageContext";

interface Message {
  id: number;
  messageId: string;
  sender: "me" | "other";
  content: string;
  time: string;
  date: string | null;
  hasImage?: boolean;
  image?: string;
  hasAudio?: boolean;
  audio?: string;
  hasFile?: boolean;
  fileName?: string;
  fileSize?: number;
  isVoiceExpired?: boolean;
  isFavorite?: boolean;
  mediaUrl?: string;
  mediaType?: "image" | "audio" | "video" | "document";
  mediaName?: string;
  mediaSize?: number;
  mediaPublicId?: string;
  mediaContentType?: string;
}

interface ChatMessagesProps {
  selectedChat: string;
  messages?: Message[];
  onMessageSend?: (message: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onToggleFavorite?: (messageId: string) => void;
}

export function ChatMessages({
  selectedChat,
  messages: propMessages,
  onMessageSend,
  onDeleteMessage,
  onToggleFavorite,
}: ChatMessagesProps) {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>(propMessages || []);
  // Mocked messages removed to ensure frontend is data-empty

  const addMessage = (
    content: string,
    type: "text" | "emoji" | "file" | "audio" = "text",
    extra?: Partial<Message>
  ) => {
    const newMessage: Message = {
      id: messages.length + 1,
      messageId: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sender: "me",
      content,
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      date: null,
      ...extra,
    };
    setMessages((prev) => [...prev, newMessage]);
    if (onMessageSend) {
      onMessageSend(content);
    }
  };

  return (
    <div className="p-2 xs:p-3 sm:p-4 space-y-2 xs:space-y-3 sm:space-y-4 animate-fade-in">
      {messages.map((message, index) => {
        const showDate =
          message.date &&
          (index === 0 || messages[index - 1].date !== message.date);

        return (
          <div
            key={message.id}
            className="animate-scale-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {showDate && (
              <div className="text-center text-xs xs:text-sm text-gray-500 mb-2 xs:mb-3 sm:mb-4 animate-fade-in">
                {message.date}
              </div>
            )}

            <div
              className={`flex ${
                message.sender === "me" ? "justify-end" : "justify-start"
              } hover-scale`}
            >
              <div className="flex items-end space-x-1 xs:space-x-2 max-w-[70%] xs:max-w-xs sm:max-w-sm md:max-w-md">
                {message.sender === "other" && (
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face"
                    alt="Avatar"
                    className="w-6 h-6 xs:w-8 h-8 rounded-full object-cover flex-shrink-0 animate-scale-in"
                  />
                )}

                <div className="space-y-0.5 xs:space-y-1">
                  <div
                    className={`relative group px-2 xs:px-3 sm:px-4 py-1 xs:py-2 rounded-2xl transition-all duration-300 hover:scale-105 ${
                      message.sender === "me"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageMenu
                        messageId={message.messageId}
                        isSender={message.sender === "me"}
                        isFavorite={message.isFavorite || false}
                        onDelete={onDeleteMessage || (() => {})}
                        onToggleFavorite={onToggleFavorite || (() => {})}
                      />
                    </div>
                    {/* Affichage natif média Cloudinary (image, audio, vidéo, document) */}
                    {message.mediaType === "image" && message.mediaUrl ? (
                      <img
                        src={message.mediaUrl}
                        alt={message.mediaName || "Image envoyée"}
                        className="max-w-full h-auto rounded-lg mt-1 cursor-pointer"
                        onClick={() => window.open(message.mediaUrl, "_blank")}
                        onError={(e) => {
                          console.error(
                            "Error loading image:",
                            message.mediaUrl
                          );
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                    ) : message.mediaType === "audio" && message.mediaUrl ? (
                      <audio controls className="max-w-full mt-1">
                        <source
                          src={message.mediaUrl}
                          type={message.mediaContentType || "audio/mpeg"}
                        />
                        Votre navigateur ne supporte pas l'audio.
                      </audio>
                    ) : message.mediaType === "video" && message.mediaUrl ? (
                      <video controls className="max-w-full mt-1 rounded-lg">
                        <source
                          src={message.mediaUrl}
                          type={message.mediaContentType || "video/mp4"}
                        />
                        Votre navigateur ne supporte pas la vidéo.
                      </video>
                    ) : message.mediaType === "document" && message.mediaUrl ? (
                      <a
                        href={message.mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-1 text-blue-600 underline text-xs xs:text-sm"
                        title={message.mediaName || "Document envoyé"}
                      >
                        📄 {message.mediaName || "Document envoyé"}
                      </a>
                    ) : (
                      <p className="text-xs xs:text-sm">{message.content}</p>
                    )}
                  </div>

                  {/* Affichage vocal expiré (optionnel) */}
                  {message.isVoiceExpired && (
                    <div className="mt-1 xs:mt-2 animate-fade-in">
                      <div className="text-xs text-gray-400 italic bg-gray-50 px-2 py-1 rounded">
                        🎵 Message vocal expiré
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-xs text-gray-500 ${
                      message.sender === "me" ? "text-right" : "text-left"
                    } animate-fade-in`}
                  >
                    {message.time}
                  </div>
                </div>

                {message.sender === "me" && (
                  <img
                    src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
                    alt="Mon Avatar"
                    className="w-6 h-6 xs:w-8 h-8 rounded-full object-cover flex-shrink-0 animate-scale-in"
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
