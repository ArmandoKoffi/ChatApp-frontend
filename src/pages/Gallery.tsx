import {
  Image,
  Download,
  Share,
  Eye,
  Grid,
  List,
  Play,
  FileAudio,
} from "lucide-react";
import { useState, useEffect } from "react";
import { ShareImageModal } from "@/components/ShareImageModal";
import api from "@/services/api";

import { useLanguage } from "@/components/LanguageContext";

export function Gallery() {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [shareModal, setShareModal] = useState<{
    isOpen: boolean;
    imageUrl: string;
    imageName: string;
  }>({
    isOpen: false,
    imageUrl: "",
    imageName: "",
  });
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  interface MediaItem {
    id: number;
    url: string;
    title: string;
    date: string;
    sender: string;
    type: "image" | "audio" | "video";
  }

  useEffect(() => {
    const fetchMediaItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/media');
        if (response.data.success) {
          setMediaItems(response.data.media || []);
        } else {
          setError(response.data.message || 'Error fetching media items');
        }
      } catch (err) {
        console.error('Error fetching media items:', err);
        setError('Failed to load media items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMediaItems();
  }, []);

  const handleView = (item: MediaItem) => {
    if (item.type === "image") {
      window.open(item.url, "_blank");
    } else {
      console.log("Lecture du média:", item.title);
    }
  };

  const handleDownload = (item: MediaItem) => {
    // Simulation du téléchargement
    const link = document.createElement("a");
    link.href = item.url;
    link.download = item.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = (item: MediaItem) => {
    setShareModal({
      isOpen: true,
      imageUrl: item.url,
      imageName: item.title,
    });
  };

  const getMediaIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-6 h-6 xs:w-8 h-8 text-blue-500" />;
      case "audio":
        return <FileAudio className="w-6 h-6 xs:w-8 h-8 text-green-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-y-auto">
      <div className="p-2 xs:p-3 sm:p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 xs:mb-3 sm:mb-4">
          <h1 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-1 xs:mb-2 sm:mb-0">
            {t("gallery")}
          </h1>
          <div className="flex space-x-1 xs:space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1 xs:p-1 sm:p-2 rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              aria-label={t("gridView")}
            >
              <Grid className="w-3 h-3 xs:w-3 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1 xs:p-1 sm:p-2 rounded-lg transition-colors ${
                viewMode === "list"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              aria-label={t("listView")}
            >
              <List className="w-3 h-3 xs:w-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2 xs:p-3 sm:p-4">
        {loading ? (
          <div className="text-center py-6 xs:py-8 sm:py-12">
            <p className="text-gray-500 text-xs xs:text-sm sm:text-base">{t("loading")}</p>
          </div>
        ) : error ? (
          <div className="text-center py-6 xs:py-8 sm:py-12">
            <p className="text-red-500 text-xs xs:text-sm sm:text-base">{error}</p>
          </div>
        ) : mediaItems.length === 0 ? (
          <div className="text-center py-6 xs:py-8 sm:py-12">
            <Image className="w-8 h-8 xs:w-10 h-10 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-3 xs:mb-4" />
            <p className="text-gray-500 text-xs xs:text-sm sm:text-base">{t("noMedia")}</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 xs:mt-2">
              {t("sharedMediaHint")}
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4"
                : "space-y-2 xs:space-y-3 sm:space-y-4"
            }
          >
            {mediaItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                  viewMode === "list" ? "flex" : ""
                }`}
              >
                <div
                  className={`relative ${
                    viewMode === "grid"
                      ? "w-full h-36 xs:h-40 sm:h-48"
                      : "w-20 h-16 xs:w-24 h-20 sm:w-32 sm:h-24 flex-shrink-0"
                  }`}
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      {getMediaIcon(item.type)}
                    </div>
                  )}
                </div>
                <div className="p-1 xs:p-2 sm:p-3 flex-1">
                  <h3 className="font-medium text-gray-900 mb-1 truncate text-xs xs:text-sm sm:text-base">
                    {item.title}
                  </h3>
                  <p className="text-xs xs:text-sm text-gray-600 mb-0.5 xs:mb-1">
                    {t('byAuthor')} {item.sender}
                  </p>
                  <p className="text-xs text-gray-400 mb-1 xs:mb-2 sm:mb-3">
                    {item.date}
                  </p>
                  <div className="flex space-x-0.5 xs:space-x-1 sm:space-x-2">
                    <button
                      onClick={() => handleView(item)}
                      className="p-0.5 xs:p-1 text-gray-500 hover:text-blue-500 transition-colors rounded hover:bg-blue-50"
                      title={t("view")}
                    >
                      <Eye className="w-3 h-3 xs:w-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(item)}
                      className="p-0.5 xs:p-1 text-gray-500 hover:text-green-500 transition-colors rounded hover:bg-green-50"
                      title={t("download")}
                    >
                      <Download className="w-3 h-3 xs:w-3 sm:w-4 sm:h-4" />
                    </button>
                    <button
                      onClick={() => handleShare(item)}
                      className="p-0.5 xs:p-1 text-gray-500 hover:text-purple-500 transition-colors rounded hover:bg-purple-50"
                      title={t("share")}
                    >
                      <Share className="w-3 h-3 xs:w-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ShareImageModal
        isOpen={shareModal.isOpen}
        onClose={() => setShareModal((prev) => ({ ...prev, isOpen: false }))}
        imageUrl={shareModal.imageUrl}
        imageName={shareModal.imageName}
      />
    </div>
  );
}
