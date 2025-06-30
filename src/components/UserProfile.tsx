import {
  Edit,
  MapPin,
  Heart,
  Users,
  Crown,
  Camera,
  Save,
  X,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "./LanguageContext";
import { InterestsModal } from "./InterestsModal";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuthContext } from "../contexts";
import { useToast } from "../hooks";
import userService from "../services/userService";

export function UserProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false);
  const { t } = useLanguage();
  const {
    user,
    updateProfile,
    updateUser,
    loading: authLoading,
  } = useAuthContext();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    username: user?.username || "Utilisateur",
    email: user?.email || "",
    age: user?.age || 0,
    gender: (user?.gender === "male"
      ? "homme"
      : user?.gender === "female"
      ? "femme"
      : "autre") as "homme" | "femme" | "autre",
    location: user?.location || "",
    intentions:
      user?.intentions ||
      ("rencontres" as "amis" | "rencontres" | "connaissances" | "mariage"),
    interests: user?.interests || [],
    bio: user?.bio || "",
    profilePicture: user?.profilePicture || "",
  });

  const [tempProfile, setTempProfile] = useState(profile);

  const getIntentionColor = (intention: string) => {
    switch (intention) {
      case "amis":
        return "bg-blue-100 text-blue-800";
      case "rencontres":
        return "bg-pink-100 text-pink-800";
      case "connaissances":
        return "bg-green-100 text-green-800";
      case "mariage":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getIntentionIcon = (intention: string) => {
    switch (intention) {
      case "amis":
        return <Users className="w-4 h-4" />;
      case "rencontres":
        return <Heart className="w-4 h-4" />;
      case "connaissances":
        return <Users className="w-4 h-4" />;
      case "mariage":
        return <Crown className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getTranslatedIntention = (intention: string) => {
    switch (intention) {
      case "amis":
        return t("amis");
      case "rencontres":
        return t("rencontres");
      case "connaissances":
        return t("connaissances");
      case "mariage":
        return t("mariage");
      default:
        return intention;
    }
  };

  const handleSave = async () => {
    try {
      // Convertir les intérêts en chaînes pour l'API
      // Les centres d'intérêt sont facultatifs, donc un tableau vide est acceptable
      const interestsAsStrings = tempProfile.interests
        .filter((interest) => interest !== null && interest !== undefined)
        .map((interest: NonNullable<unknown>) => {
          if (typeof interest === "object") {
            if ("label" in interest) {
              return (interest as { label: string }).label;
            }
            return "";
          }
          return interest.toString();
        });

      console.log("Interests to be saved:", interestsAsStrings);

      // Simplifier la logique pour gérer correctement la suppression
      const interestsToSave = interestsAsStrings.filter(
        (interest) => interest && interest.trim() !== ""
      );

      console.log("Final interests data for updateProfile:", interestsToSave);

      const payload = {
        username: tempProfile.username,
        gender:
          tempProfile.gender === "homme"
            ? ("male" as const)
            : tempProfile.gender === "femme"
            ? ("female" as const)
            : ("other" as const),
        interests: interestsToSave, // Toujours envoyer le tableau, même vide
        clearInterests: interestsToSave.length === 0, // Flag pour indiquer une suppression complète
        bio: tempProfile.bio,
        age: tempProfile.age,
        location: tempProfile.location,
        intentions: tempProfile.intentions,
      };

      console.log("Complete payload sent to updateProfile:", payload);
      await updateProfile(payload);

      setProfile(tempProfile);
      setIsEditing(false);

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été enregistrées avec succès.",
        variant: "default",
      });

      // Refresh user data from backend to ensure latest data is displayed
      const refreshedUser = await userService.getUserById("me");
      if (refreshedUser.success) {
        updateUser(refreshedUser.data);
        setProfile({
          username: refreshedUser.data.username || "Utilisateur",
          email: refreshedUser.data.email || "",
          age: refreshedUser.data.age || 0,
          gender: (refreshedUser.data.gender === "male"
            ? "homme"
            : refreshedUser.data.gender === "female"
            ? "femme"
            : "autre") as "homme" | "femme" | "autre",
          location: refreshedUser.data.location || "",
          intentions:
            refreshedUser.data.intentions ||
            ("rencontres" as
              | "amis"
              | "rencontres"
              | "connaissances"
              | "mariage"),
          interests: refreshedUser.data.interests || [],
          bio: refreshedUser.data.bio || "",
          profilePicture: refreshedUser.data.profilePicture || "",
        });
        // Log to confirm the context has been updated for real-time reflection
        console.log("User data refreshed and context updated:", refreshedUser.data);
      }
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour du profil",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const [showInvalidFormatModal, setShowInvalidFormatModal] = useState(false);

  const handleProfilePictureChange = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/jpg,image/png";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const validFormats = ["image/jpeg", "image/jpg", "image/png"];
        if (!validFormats.includes(file.type)) {
          setShowInvalidFormatModal(true);
          return;
        }
        try {
          const formData = {
            profilePicture: file,
          };
          const response = await userService.updateProfile(formData);
          if (response.success) {
            updateUser(response.data);
            setProfile((prev) => ({
              ...prev,
              profilePicture: response.data.profilePicture,
            }));
            setTempProfile((prev) => ({
              ...prev,
              profilePicture: response.data.profilePicture,
            }));
            toast({
              title: t("Profil mis à jour"),
              description: t("Image mise à jour avec succès"),
              variant: "default",
            });
            // Refresh user data from backend to ensure latest data is displayed
            const refreshedUser = await userService.getUserById("me");
            if (refreshedUser.success) {
              updateUser(refreshedUser.data);
              setProfile({
                username: refreshedUser.data.username || "Utilisateur",
                email: refreshedUser.data.email || "",
                age: refreshedUser.data.age || 0,
                gender: (refreshedUser.data.gender === "male"
                  ? "homme"
                  : refreshedUser.data.gender === "female"
                  ? "femme"
                  : "autre") as "homme" | "femme" | "autre",
                location: refreshedUser.data.location || "",
                intentions:
                  refreshedUser.data.intentions ||
                  ("rencontres" as
                    | "amis"
                    | "rencontres"
                    | "connaissances"
                    | "mariage"),
                interests: refreshedUser.data.interests || [],
                bio: refreshedUser.data.bio || "",
                profilePicture: refreshedUser.data.profilePicture || "",
              });
              // Log to confirm the context has been updated for real-time reflection
              console.log("User data refreshed after profile picture update:", refreshedUser.data);
            }
          }
        } catch (error) {
          console.error("Error updating profile picture:", error);
          toast({
            title: t("erreur"),
            description: t("Echec de la mise à jour de l'image"),
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  };

  const handleResetProfilePicture = async () => {
    try {
      const formData = {
        removeProfilePicture: true,
      };
      const response = await userService.updateProfile(formData);
      if (response.success) {
        updateUser(response.data);
        setProfile((prev) => ({
          ...prev,
          profilePicture: response.data.profilePicture,
        }));
        setTempProfile((prev) => ({
          ...prev,
          profilePicture: response.data.profilePicture,
        }));
        toast({
          title: t("Profil mis à jour"),
          description: t("Image restaurée avec succès"),
          variant: "default",
        });
        // Refresh user data from backend to ensure latest data is displayed
        const refreshedUser = await userService.getUserById("me");
        if (refreshedUser.success) {
          updateUser(refreshedUser.data);
          setProfile({
            username: refreshedUser.data.username || "Utilisateur",
            email: refreshedUser.data.email || "",
            age: refreshedUser.data.age || 0,
            gender: (refreshedUser.data.gender === "male"
              ? "homme"
              : refreshedUser.data.gender === "female"
              ? "femme"
              : "autre") as "homme" | "femme" | "autre",
            location: refreshedUser.data.location || "",
            intentions:
              refreshedUser.data.intentions ||
              ("rencontres" as
                | "amis"
                | "rencontres"
                | "connaissances"
                | "mariage"),
            interests: refreshedUser.data.interests || [],
            bio: refreshedUser.data.bio || "",
            profilePicture: refreshedUser.data.profilePicture || "",
          });
          // Log to confirm the context has been updated for real-time reflection
          console.log("User data refreshed after profile picture reset:", refreshedUser.data);
        }
      }
    } catch (error) {
      console.error("Error resetting profile picture:", error);
      toast({
        title: t("erreur"),
        description: t("Echec de la restauration de l'image"),
        variant: "destructive",
      });
    }
  };

  const handleInterestsChange = (newInterests: string[]) => {
    setTempProfile((prev) => ({ ...prev, interests: newInterests }));
  };

  // Transform interests to strings for InterestsModal
  const getStringInterests = (
    interests: Array<{ label: string } | string>
  ): string[] => {
    return interests.map((interest) =>
      typeof interest === "object" && interest && "label" in interest
        ? interest.label
        : String(interest || "")
    );
  };

  // Assign colors and icons based on interest name
  const getInterestStyle = (interestName: string) => {
    const normalizedName = interestName.toLowerCase().trim();
    switch (normalizedName) {
      case "voyages":
        return {
          color: "bg-blue-100 text-blue-800",
          icon: <MapPin className="w-3 h-3" />,
        };
      case "cuisine":
        return {
          color: "bg-orange-100 text-orange-800",
          icon: <Users className="w-3 h-3" />,
        };
      case "lecture":
        return {
          color: "bg-purple-100 text-purple-800",
          icon: <Edit className="w-3 h-3" />,
        };
      case "cinema":
        return {
          color: "bg-red-100 text-red-800",
          icon: <Camera className="w-3 h-3" />,
        };
      case "sport":
        return {
          color: "bg-green-100 text-green-800",
          icon: <Crown className="w-3 h-3" />,
        };
      case "musique":
        return {
          color: "bg-pink-100 text-pink-800",
          icon: <Heart className="w-3 h-3" />,
        };
      case "art":
        return {
          color: "bg-indigo-100 text-indigo-800",
          icon: <Plus className="w-3 h-3" />,
        };
      case "photographie":
        return {
          color: "bg-gray-100 text-gray-800",
          icon: <Camera className="w-3 h-3" />,
        };
      case "technologie":
        return {
          color: "bg-cyan-100 text-cyan-800",
          icon: <RefreshCw className="w-3 h-3" />,
        };
      case "gaming":
        return {
          color: "bg-violet-100 text-violet-800",
          icon: <Users className="w-3 h-3" />,
        };
      case "nature":
        return {
          color: "bg-emerald-100 text-emerald-800",
          icon: <MapPin className="w-3 h-3" />,
        };
      default:
        return {
          color: "bg-green-100 text-green-800",
          icon: <Heart className="w-3 h-3" />,
        };
    }
  };

  // Detect navigation attempt while editing - Block navigation when editing
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isEditing) {
        event.preventDefault();
        event.returnValue = t("saveChangesPrompt");
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing, t]);

  // Function to handle navigation attempt - This will be called by navigation components
  const attemptNavigation = (callback?: () => void) => {
    if (isEditing) {
      setShowLeaveConfirmation(true);
      // Prevent navigation until user confirms
      return false;
    }
    if (callback) callback();
    return true;
  };

  // Enhanced navigation interception - Strictly block navigation while editing
  // This simulates integration with a routing system to block navigation
  // For a complete solution, this should be integrated with React Router's Prompt or useBlocker if available
  useEffect(() => {
    if (!isEditing) return;

    const preventNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if clicked element is outside the UserProfile component or a navigation trigger
      // This is a broad check to ensure navigation is blocked
      if (
        !target.closest(".user-profile-container") ||
        target.tagName === "A" ||
        target.getAttribute("data-navigate") !== null
      ) {
        event.preventDefault();
        event.stopPropagation();
        setShowLeaveConfirmation(true);
      }
    };

    document.addEventListener("click", preventNavigation, { capture: true });
    return () =>
      document.removeEventListener("click", preventNavigation, {
        capture: true,
      });
  }, [isEditing]);

  // Load user data on component mount to ensure real-time data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const refreshedUser = await userService.getUserById("me");
        if (refreshedUser.success) {
          updateUser(refreshedUser.data);
          setProfile({
            username: refreshedUser.data.username || "Utilisateur",
            email: refreshedUser.data.email || "",
            age: refreshedUser.data.age || 0,
            gender: (refreshedUser.data.gender === "male"
              ? "homme"
              : refreshedUser.data.gender === "female"
              ? "femme"
              : "autre") as "homme" | "femme" | "autre",
            location: refreshedUser.data.location || "",
            intentions:
              refreshedUser.data.intentions ||
              ("rencontres" as
                | "amis"
                | "rencontres"
                | "connaissances"
                | "mariage"),
            interests: refreshedUser.data.interests || [],
            bio: refreshedUser.data.bio || "",
            profilePicture: refreshedUser.data.profilePicture || "",
          });
          setTempProfile({
            username: refreshedUser.data.username || "Utilisateur",
            email: refreshedUser.data.email || "",
            age: refreshedUser.data.age || 0,
            gender: (refreshedUser.data.gender === "male"
              ? "homme"
              : refreshedUser.data.gender === "female"
              ? "femme"
              : "autre") as "homme" | "femme" | "autre",
            location: refreshedUser.data.location || "",
            intentions:
              refreshedUser.data.intentions ||
              ("rencontres" as
                | "amis"
                | "rencontres"
                | "connaissances"
                | "mariage"),
            interests: refreshedUser.data.interests || [],
            bio: refreshedUser.data.bio || "",
            profilePicture: refreshedUser.data.profilePicture || "",
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [t, updateUser]);

  return (
    <div className="flex-1 bg-gray-50 overflow-hidden h-full user-profile-container">
      <ScrollArea className="h-full w-full">
        <div className="p-4 lg:p-6">
          <div className="w-full">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="relative h-32 sm:h-48 bg-gradient-to-r from-blue-500 to-purple-600">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="absolute bottom-4 left-4 sm:left-6 right-4 sm:right-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between space-y-4 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-4">
                      <div className="relative">
                        <img
                          src={
                            isEditing
                              ? tempProfile.profilePicture
                              : profile.profilePicture
                          }
                          alt={profile.username}
                          className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-white object-cover"
                        />
                        {isEditing && (
                          <button
                            onClick={handleProfilePictureChange}
                            className="absolute bottom-0 right-0 bg-blue-500 text-white p-1.5 sm:p-2 rounded-full hover:bg-blue-600 transition-colors"
                            title={t("changePhoto")}
                          >
                            <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        )}
                      </div>
                      <div className="text-white">
                        <h1 className="text-lg sm:text-2xl font-bold">
                          {profile.username}
                        </h1>
                        <div className="flex items-center space-x-2 text-blue-100 text-sm">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>
                            {isEditing
                              ? tempProfile.location
                              : profile.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                      {isEditing ? (
                        <>
                          <button
                            onClick={handleSave}
                            disabled={authLoading}
                            className={`bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center space-x-2 text-sm ${
                              authLoading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                          >
                            {authLoading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            <span>
                              {authLoading ? t("processing") : t("save")}
                            </span>
                          </button>
                          <button
                            onClick={handleCancel}
                            disabled={authLoading}
                            className={`bg-gray-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2 text-sm ${
                              authLoading ? "opacity-70 cursor-not-allowed" : ""
                            }`}
                          >
                            <X className="w-4 h-4" />
                            <span>{t("cancel")}</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          <span>{t("edit")}</span>
                        </button>
                      )}
                      <button
                        onClick={handleResetProfilePicture}
                        disabled={authLoading || !profile.profilePicture}
                        className={`bg-orange-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center space-x-2 text-sm ${
                          authLoading || !profile.profilePicture
                            ? "opacity-70 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>{t("Restaurer l'image par défaut")}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Content */}
              <div className="p-4 sm:p-6 space-y-6">
                {/* Email (non modifiable) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600">
                    {profile.email}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {t("emailCannotBeChanged")}
                  </p>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("fullName")}
                    </label>
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t("Champ Facultatif")}
                      </p>
                    )}
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfile.username}
                        onChange={(e) =>
                          setTempProfile({
                            ...tempProfile,
                            username: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={t("fullName")}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.username}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("age")}
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={tempProfile.age}
                        onChange={(e) =>
                          setTempProfile({
                            ...tempProfile,
                            age: parseInt(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={t("age")}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.age} ans</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("gender")}
                    </label>
                    {isEditing ? (
                      <select
                        value={tempProfile.gender}
                        onChange={(e) =>
                          setTempProfile({
                            ...tempProfile,
                            gender: e.target.value as
                              | "homme"
                              | "femme"
                              | "autre",
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={t("gender")}
                      >
                        <option value="femme">{t("femme")}</option>
                        <option value="homme">{t("homme")}</option>
                        <option value="autre">{t("autre")}</option>
                      </select>
                    ) : (
                      <p className="text-gray-900 capitalize py-2">
                        {profile.gender}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("location")}
                    </label>
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t("Champ Facultatif")}
                      </p>
                    )}
                    {isEditing ? (
                      <input
                        type="text"
                        value={tempProfile.location}
                        onChange={(e) =>
                          setTempProfile({
                            ...tempProfile,
                            location: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label={t("location")}
                      />
                    ) : (
                      <p className="text-gray-900 py-2">{profile.location}</p>
                    )}
                  </div>
                </div>

                {/* Intentions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t("status")}
                  </label>
                  {isEditing ? (
                    <select
                      value={tempProfile.intentions}
                      onChange={(e) =>
                        setTempProfile({
                          ...tempProfile,
                          intentions: e.target.value as
                            | "amis"
                            | "rencontres"
                            | "connaissances"
                            | "mariage",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={t("status")}
                    >
                      <option value="amis">{t("amis")}</option>
                      <option value="rencontres">{t("rencontres")}</option>
                      <option value="connaissances">
                        {t("connaissances")}
                      </option>
                      <option value="mariage">{t("mariage")}</option>
                    </select>
                  ) : (
                    <div
                      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getIntentionColor(
                        profile.intentions
                      )}`}
                    >
                      {getIntentionIcon(profile.intentions)}
                      <span className="capitalize">
                        {getTranslatedIntention(profile.intentions)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("biography")}
                  </label>
                  {isEditing && (
                    <p className="text-xs text-gray-500 mt-1">
                      {t("Champ Facultatif")}
                    </p>
                  )}
                  {isEditing ? (
                    <textarea
                      value={tempProfile.bio}
                      onChange={(e) =>
                        setTempProfile({ ...tempProfile, bio: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={t("biography")}
                    />
                  ) : (
                    <p className="text-gray-700 py-2">{profile.bio}</p>
                  )}
                </div>

                {/* Interests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t("interests")}
                  </label>
                  {isEditing && (
                    <p className="text-xs text-gray-500 mb-2">
                      {t("Champ Facultatif")}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {/* Afficher les intérêts seulement s'il y en a */}
                    {(isEditing ? tempProfile.interests : profile.interests)
                      .length > 0
                      ? (isEditing
                          ? tempProfile.interests
                          : profile.interests
                        ).map((interest, index) => {
                          const label =
                            typeof interest === "object" &&
                            interest &&
                            "label" in interest
                              ? (interest as { label: string }).label
                              : String(interest || "");

                          // Ne pas afficher les intérêts vides
                          if (!label || label.trim() === "") return null;

                          const style = getInterestStyle(label);
                          return (
                            <div
                              key={index}
                              className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${style.color}`}
                            >
                              {style.icon}
                              <span>{label}</span>
                            </div>
                          );
                        })
                      : // Afficher un message quand il n'y a pas d'intérêts (seulement en mode visualisation)
                        !isEditing && (
                          <p className="text-gray-500 italic text-sm">
                            {t("Aucun centre d'intérêt défini")}
                          </p>
                        )}

                    {isEditing && (
                      <>
                        <button
                          onClick={() => setShowInterestsModal(true)}
                          className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>{t("manageInterests")}</span>
                        </button>
                        <button
                          onClick={() => {
                            console.log(
                              "Clearing interests, current tempProfile.interests:",
                              tempProfile.interests
                            );
                            setTempProfile({ ...tempProfile, interests: [] });
                            console.log(
                              "Interests cleared, tempProfile.interests is now empty"
                            );
                          }}
                          className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium hover:bg-red-200 transition-colors flex items-center space-x-1"
                        >
                          <X className="w-3 h-3" />
                          <span>
                            {t("Supprimer tous les centres d'intérêt")}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <InterestsModal
        isOpen={showInterestsModal}
        onClose={() => setShowInterestsModal(false)}
        selectedInterests={getStringInterests(tempProfile.interests)}
        onInterestsChange={handleInterestsChange}
      />

      {/* Leave Confirmation Modal - Strictly blocks navigation */}
      {showLeaveConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-scale-in shadow-2xl border-2 border-red-500">
            <div className="p-6 border-b border-gray-200 bg-red-50">
              <h2 className="text-xl font-semibold text-red-700">
                {t("saveChanges")}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4 font-medium">
                {t("saveChangesPrompt")}
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowLeaveConfirmation(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                {t("stay")}
              </button>
              <button
                onClick={() => {
                  handleCancel();
                  setShowLeaveConfirmation(false);
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invalid Image Format Modal */}
      {showInvalidFormatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-scale-in shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {t("invalidFormat")}
              </h2>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                {t("acceptedFormats")}: .jpeg, .jpg, .png
              </p>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowInvalidFormatModal(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                {t("ok")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
