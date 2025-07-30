// Déclaration globale pour window.socket
declare global {
  interface Window {
    socket?: import("socket.io-client").Socket;
  }
}
import { useState, useEffect } from "react";

interface User {
  _id: string;
  name: string;
  avatar?: string;
  isOnline?: boolean;
}
import { Users, Settings, UserPlus, Shield, Flag } from "lucide-react";
import { ChatRoom } from "@/types";
import { useLanguage } from "./LanguageContext";

interface GroupInfoPanelProps {
  selectedRoom: string;
}

export function GroupInfoPanel({ selectedRoom }: GroupInfoPanelProps) {
  // Style utilitaire pour l'animation delay (à placer une seule fois dans le composant)
  const fadeDelays = `
    .fade-delay-0 { animation-delay: 0s; }
    .fade-delay-1 { animation-delay: 0.1s; }
    .fade-delay-2 { animation-delay: 0.2s; }
    .fade-delay-3 { animation-delay: 0.3s; }
    .fade-delay-4 { animation-delay: 0.4s; }
    .fade-delay-5 { animation-delay: 0.5s; }
    .fade-delay-6 { animation-delay: 0.6s; }
    .fade-delay-7 { animation-delay: 0.7s; }
    .fade-delay-8 { animation-delay: 0.8s; }
    .fade-delay-9 { animation-delay: 0.9s; }
  `;
  // Handlers stubs pour éviter les erreurs
  const handleInvite = () => setShowInviteModal(true);
  const handleUserReport = (id: string, name: string) => {
    setSelectedUser({ id, name });
    setShowReportModal(true);
  };
  const handleUserBlock = (id: string, name: string) => {
    setSelectedUser({ id, name });
    setShowBlockModal(true);
  };
  const handleCopyInviteLink = () => {
    if (inviteLink) navigator.clipboard.writeText(inviteLink);
  };
  const handleToggleBlock = (id: string, block: boolean) => {
    // Appel API pour bloquer/débloquer, puis mise à jour du state
    setBlockedUsers((prev) =>
      block ? [...prev, id] : prev.filter((u) => u !== id)
    );
    setShowBlockModal(false);
    setSelectedUser(null);
  };
  const handleReport = (id: string) => {
    // Appel API pour signaler, puis mise à jour du state
    setReportedUsers((prev) => [...prev, id]);
    setShowReportModal(false);
    setSelectedUser(null);
  };
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [reportedUsers, setReportedUsers] = useState<string[]>([]);
  const { t } = useLanguage();
  const [members, setMembers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [avatar, setAvatar] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [inviteLink, setInviteLink] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#f0f2f5");

  // Récupérer les infos du groupe à l'ouverture ou changement
  useEffect(() => {
    if (!selectedRoom) return;
    fetch(`/api/chatrooms/${selectedRoom}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMembers((data.data.members || []) as User[]);
          setAdmins((data.data.admins || []) as User[]);
          setOnlineCount(
            (data.data.members || []).filter((m: User) => m.isOnline).length
          );
          setAvatar(data.data.avatar || "");
          setName(data.data.name || "");
          setDescription(data.data.description || "");
        }
      });
  }, [selectedRoom]);

  // Socket.io : synchronisation temps réel
  useEffect(() => {
    const socket = window.socket;
    if (!socket) return;
    type GroupProfilePayload = {
      groupId: string;
      groupAvatar?: string;
      groupName?: string;
      groupDescription?: string;
    };
    type GroupUserStatusPayload = {
      groupId: string;
      members: User[];
      admins: User[];
    };
    const handleGroupProfileUpdated = (data: GroupProfilePayload) => {
      if (data.groupId === selectedRoom) {
        setAvatar(data.groupAvatar || "");
        setName(data.groupName || "");
        setDescription(data.groupDescription || "");
      }
    };
    const handleGroupUserStatusUpdate = (data: GroupUserStatusPayload) => {
      if (data.groupId === selectedRoom) {
        setMembers(data.members || []);
        setAdmins(data.admins || []);
        setOnlineCount(
          Array.isArray(data.members)
            ? data.members.filter((m) => m.isOnline).length
            : 0
        );
      }
    };
    socket.on("groupProfileUpdated", handleGroupProfileUpdated);
    socket.on("groupUserStatusUpdate", handleGroupUserStatusUpdate);
    return () => {
      socket.off("groupProfileUpdated", handleGroupProfileUpdated);
      socket.off("groupUserStatusUpdate", handleGroupUserStatusUpdate);
    };
  }, [selectedRoom]);

  return (
    <div className="h-full bg-white flex flex-col animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="text-center animate-scale-in">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <Users className="w-8 h-8 text-white" />
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{name}</h2>
          <p className="text-sm text-gray-500 mb-3">{description}</p>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
            <span>
              {onlineCount} {t("online")}
            </span>
            <span>•</span>
            <span>
              {t("members")} {members.length}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleInvite}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-200 hover:scale-105 transform"
            title={t("inviteMembers")}
          >
            <UserPlus className="w-4 h-4" />
            <span className="text-sm">{t("invite")}</span>
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200 hover:scale-105 transform"
            title={t("groupSettings")}
          >
            <Settings className="w-4 h-4" />
            <span className="text-sm">{t("settings")}</span>
          </button>
        </div>
      </div>

      {/* Membres connectés */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            {t("connectedMembers")} ({onlineCount})
          </h3>
          <div className="space-y-3">
            {/* Style global pour l'animation delay */}
            <style>{fadeDelays}</style>
            {members
              .filter((user) => user.isOnline)
              .map((user, index) => (
                <div
                  key={user._id}
                  className={`flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all duration-200 hover:scale-105 transform animate-fade-in cursor-pointer fade-delay-${index}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={user.avatar || "/placeholder.svg"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        {user.name}
                      </h4>
                      <p className="text-xs text-gray-500">{t("online")}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleUserReport(user._id, user.name)}
                      className="p-1 hover:bg-gray-100 rounded transition-all duration-200 hover:scale-110"
                      title={t("reportUser")}
                    >
                      <Flag className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleUserBlock(user._id, user.name)}
                      className="p-1 hover:bg-gray-100 rounded transition-all duration-200 hover:scale-110"
                      title={t("blockUser")}
                    >
                      <Shield className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl border border-gray-200 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("inviteFriends")}
            </h3>
            <p className="text-sm text-gray-600 mb-4">{t("shareInviteLink")}</p>
            <div className="bg-gray-100 p-3 rounded-lg mb-4">
              <p className="text-sm text-gray-800 break-all">{inviteLink}</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCopyInviteLink}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
              >
                {t("copyLink")}
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                {t("close")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl border border-gray-200 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("groupSettings")}
            </h3>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="backgroundColor"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("backgroundColor")}
                </label>
                <input
                  id="backgroundColor"
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                  title={t("chooseBackgroundColor")}
                />
              </div>
              <div>
                <label
                  htmlFor="notifications"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("notifications")}
                </label>
                <select
                  id="notifications"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  title={t("notificationSettings")}
                >
                  <option>{t("allMessages")}</option>
                  <option>{t("mentionsOnly")}</option>
                  <option>{t("disabled")}</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="privacy"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("privacy")}
                </label>
                <select
                  id="privacy"
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  title={t("privacySettings")}
                >
                  <option>{t("public")}</option>
                  <option>{t("private")}</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200"
              >
                {t("save")}
              </button>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {showBlockModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl border border-gray-200 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {blockedUsers.includes(selectedUser.id)
                ? t("unblock")
                : t("block")}{" "}
              {selectedUser.name}
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {blockedUsers.includes(selectedUser.id)
                ? t("unblockConfirmation")
                : t("blockConfirmation")}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() =>
                  handleToggleBlock(
                    selectedUser.id,
                    !blockedUsers.includes(selectedUser.id)
                  )
                }
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
              >
                {blockedUsers.includes(selectedUser.id)
                  ? t("unblock")
                  : t("block")}
              </button>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report User Modal */}
      {showReportModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md shadow-xl border border-gray-200 animate-scale-in">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("report")} {selectedUser.name}
            </h3>
            <label
              htmlFor="reportReason"
              className="block text-sm text-gray-600 mb-2"
            >
              {t("reportReasonPrompt")}
            </label>
            <select
              id="reportReason"
              className="w-full p-2 border border-gray-300 rounded-lg mb-6"
              title={t("reportReason")}
            >
              <option>{t("inappropriateBehavior")}</option>
              <option>{t("spam")}</option>
              <option>{t("harassment")}</option>
              <option>{t("other")}</option>
            </select>
            <div className="flex space-x-3">
              <button
                onClick={() => handleReport(selectedUser.id)}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200"
              >
                {t("report")}
              </button>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all duration-200"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
