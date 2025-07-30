import { useState, useEffect } from "react";
import io from "socket.io-client";
import { useAuthContext } from "../contexts";
import {
  Users,
  MessageCircle,
  Heart,
  UserCheck,
  Crown,
  Plus,
} from "lucide-react";
import { createChatRoom } from "../services/chatRoomService";
import { ChatRoom } from "@/types";
import { useLanguage } from "./LanguageContext";
import { fetchChatRooms } from "../services/chatRoomService";

interface ChatRoomsProps {
  onRoomSelect: (roomId: string) => void;
  selectedRoom?: string;
  userRole: "user" | "admin";
  searchQuery?: string;
}

export function ChatRooms({
  onRoomSelect,
  selectedRoom,
  userRole,
  searchQuery = "",
}: ChatRoomsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<{
    name: string;
    description: string;
    type: ChatRoom["type"];
  }>({
    name: "",
    description: "",
    type: "general",
  });
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [joining, setJoining] = useState<string | null>(null);
  const [leaving, setLeaving] = useState<string | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    const loadChatRooms = async () => {
      try {
        const rooms = await fetchChatRooms();
        setChatRooms(rooms);
      } catch (error) {
        console.error("Failed to load chat rooms:", error);
      }
    };
    loadChatRooms();
    // Synchronisation socket.io pour groupes en temps réel
    const socket = io();
    socket.on("groupProfileUpdated", (group) => {
      setChatRooms((prev) => {
        if (prev.some((r) => r.id === group.groupId)) return prev;
        return [
          {
            id: group.groupId,
            name: group.groupName,
            description: group.groupDescription,
            type: group.groupType || "public",
            connectedUsers: 0,
            isActive: true,
            createdAt: new Date(),
          },
          ...prev,
        ];
      });
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleJoin = async (roomId: string) => {
    setJoining(roomId);
    try {
      await fetch(`/api/chatrooms/${roomId}/join`, {
        method: "POST",
        credentials: "include",
      });
      setChatRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? { ...r, connectedUsers: (r.connectedUsers || 0) + 1 }
            : r
        )
      );
    } finally {
      setJoining(null);
    }
  };

  const handleLeave = async (roomId: string) => {
    setLeaving(roomId);
    try {
      await fetch(`/api/chatrooms/${roomId}/leave`, {
        method: "POST",
        credentials: "include",
      });
      setChatRooms((prev) =>
        prev.map((r) =>
          r.id === roomId
            ? { ...r, connectedUsers: Math.max((r.connectedUsers || 1) - 1, 0) }
            : r
        )
      );
    } finally {
      setLeaving(null);
    }
  };
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError(null);
    try {
      const newRoom = await createChatRoom(form);
      setShowCreateModal(false);
      setForm({ name: "", description: "", type: "general" });
      setChatRooms((prev) => [newRoom, ...prev]);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "message" in err.response.data
      ) {
        // On typise l'objet pour éviter 'any'
        const response = err.response as { data?: { message?: string } };
        setError(response.data?.message || "Erreur lors de la création");
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de la création");
      }
    } finally {
      setCreating(false);
    }
  };

  const filteredRooms = chatRooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoomIcon = (type: ChatRoom["type"]) => {
    switch (type) {
      case "amis":
        return <Users className="w-5 h-5" />;
      case "rencontres":
        return <Heart className="w-5 h-5" />;
      case "connaissances":
        return <UserCheck className="w-5 h-5" />;
      case "mariage":
        return <Crown className="w-5 h-5" />;
      default:
        return <MessageCircle className="w-5 h-5" />;
    }
  };

  const getRoomGradient = (type: ChatRoom["type"]) => {
    switch (type) {
      case "amis":
        return "from-blue-500 to-blue-600";
      case "rencontres":
        return "from-pink-500 to-pink-600";
      case "connaissances":
        return "from-green-500 to-green-600";
      case "mariage":
        return "from-purple-500 to-purple-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4 animate-fade-in">
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {t("groupSettings")}
        </h4>
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200 hover:scale-105 transform"
          title={t("newGroupChat")}
          aria-label={t("newGroupChat")}
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Modal de création de groupe */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form
            onSubmit={handleCreateGroup}
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md animate-fade-in"
          >
            <h2 className="text-lg font-bold mb-4">{t("newGroupChat")}</h2>
            <div className="mb-3">
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder={t("groupName")}
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                className="w-full border rounded px-3 py-2"
                placeholder={t("groupDescription")}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                required
              />
            </div>
            <div className="mb-3">
              <select
                className="w-full border rounded px-3 py-2"
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as ChatRoom["type"],
                  }))
                }
                aria-label={t("groupType")}
              >
                <option value="general">{t("publicGroup")}</option>
                <option value="amis">{t("friendsGroup")}</option>
                <option value="rencontres">{t("datingGroup")}</option>
                <option value="connaissances">{t("acquaintancesGroup")}</option>
                <option value="mariage">{t("marriageGroup")}</option>
              </select>
            </div>
            {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-blue-500 text-white"
                disabled={creating}
              >
                {creating ? t("creating") : t("create")}
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredRooms.map((room, index) => {
        const userId = user?._id;
        const isMember =
          userId && room.members && room.members.includes(userId);
        return (
          <div
            key={room.id}
            onClick={() => onRoomSelect(room.id)}
            className={`p-4 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 transform animate-fade-in ${
              selectedRoom === room.id
                ? "bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 shadow-lg"
                : "hover:bg-gray-50 hover:shadow-md"
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-center space-x-3 mb-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getRoomGradient(
                  room.type
                )} flex items-center justify-center text-white animate-scale-in`}
              >
                {getRoomIcon(room.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 truncate text-sm">
                  {room.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {room.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-600 font-medium">
                    {room.connectedUsers} {t("online")}
                  </span>
                </div>
              </div>
              {room.maxUsers && (
                <span className="text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                  {room.connectedUsers}/{room.maxUsers}
                </span>
              )}
            </div>

            {/* Boutons rejoindre/quitter */}
            <div className="mt-2 flex gap-2">
              {isMember ? (
                <button
                  className="px-3 py-1 rounded bg-red-100 text-red-600 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLeave(room.id);
                  }}
                  disabled={leaving === room.id}
                >
                  {leaving === room.id ? t("leaving") : t("leaveGroup")}
                </button>
              ) : (
                <button
                  className="px-3 py-1 rounded bg-blue-100 text-blue-600 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoin(room.id);
                  }}
                  disabled={joining === room.id}
                >
                  {joining === room.id ? t("joining") : t("joinGroup")}
                </button>
              )}
            </div>

            {selectedRoom === room.id && (
              <div className="mt-3 pt-3 border-t border-gray-200 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {t("activeSince")} {room.createdAt.toLocaleDateString()}
                  </span>
                  <span className="text-green-500 font-medium">
                    {t("online")}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {filteredRooms.length === 0 && searchQuery && (
        <div className="text-center py-8 text-gray-500">
          <p>
            {t("noResults")} "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
