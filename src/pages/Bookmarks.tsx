import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Star,
  MessageCircle,
  Image,
  FileText,
  Calendar,
  X,
  Heart,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";

interface Bookmark {
  id: string;
  type: "message" | "media" | "file" | "link";
  title: string;
  content: string;
  translatedTitle?: string;
  translatedContent?: string;
  author: string;
  date: string;
  chatName: string;
  translatedChatName?: string;
  thumbnail?: string;
  url?: string;
}

export function Bookmarks() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "message" | "media" | "file" | "link"
  >("all");
  const [bookmarks, setBookmarksState] = useState<Bookmark[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookmarks = async () => {
      setLoading(true);
      setError(null);
      try {
        // Assuming there's a service to fetch bookmarks from the backend
        const response = await fetch('/api/bookmarks');
        if (!response.ok) {
          throw new Error('Failed to fetch bookmarks');
        }
        const data = await response.json();
        if (data.success) {
          setBookmarksState(data.bookmarks || []);
        } else {
          setError(data.message || 'Error fetching bookmarks');
        }
      } catch (err) {
        console.error('Error fetching bookmarks:', err);
        setError('Failed to load bookmarks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarks();
  }, []);

  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks;

    // Filtre par type
    if (selectedFilter !== "all") {
      filtered = filtered.filter(
        (bookmark) => bookmark.type === selectedFilter
      );
    }

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (bookmark) =>
          bookmark.title.toLowerCase().includes(query) ||
          bookmark.content.toLowerCase().includes(query) ||
          bookmark.author.toLowerCase().includes(query) ||
          bookmark.chatName.toLowerCase().includes(query)
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [bookmarks, selectedFilter, searchQuery]);

  const removeBookmark = async (bookmarkId: string) => {
    try {
      // Assuming there's an API endpoint to remove bookmarks
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to remove bookmark');
      }
      setBookmarksState((prev) => prev.filter((b) => b.id !== bookmarkId));
    } catch (err) {
      console.error('Error removing bookmark:', err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="w-3 h-3 xs:w-4 h-4 text-blue-500" />;
      case "media":
        return <Image className="w-3 h-3 xs:w-4 h-4 text-green-500" />;
      case "file":
        return <FileText className="w-3 h-3 xs:w-4 h-4 text-orange-500" />;
      case "link":
        return <Star className="w-3 h-3 xs:w-4 h-4 text-purple-500" />;
      default:
        return <MessageCircle className="w-3 h-3 xs:w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "message":
        return t("message");
      case "media":
        return t("media");
      case "file":
        return t("file");
      case "link":
        return t("link");
      default:
        return t("other");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 overflow-y-auto">
      <div className="p-2 xs:p-4 lg:p-6">
        {/* Header */}
        <div className="mb-4 xs:mb-6 sm:mb-8">
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold text-gray-900 mb-1 xs:mb-2">
            {t("bookmarks") || "Favoris"}
          </h1>
          <p className="text-gray-600 text-xs xs:text-sm sm:text-base">
            {t("bookmarksDescription")}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 xs:mb-6">
          <div className="p-2 xs:p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-2 xs:gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-2 xs:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 xs:w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-6 xs:pl-10 pr-2 xs:pr-4 py-1 xs:py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs xs:text-sm sm:text-base"
                  aria-label={t("searchBookmarks")}
                />
              </div>

              {/* Filter button */}
              <div className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-1 xs:space-x-2 px-2 xs:px-4 py-1 xs:py-2 sm:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs xs:text-sm sm:text-base"
                >
                  <Filter className="w-3 h-3 xs:w-4 h-4" />
                  <span>{t("filterBookmarks")}</span>
                  {selectedFilter !== "all" && (
                    <div className="w-1.5 h-1.5 xs:w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </button>

                {/* Filters dropdown */}
                {showFilters && (
                  <div className="absolute right-0 top-full mt-1 xs:mt-2 w-40 xs:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    <div className="p-1 xs:p-2">
                      {[
                        { key: "all", label: t("allTypes"), icon: Star },
                        {
                          key: "message",
                          label: t("messagesType"),
                          icon: MessageCircle,
                        },
                        { key: "media", label: t("mediaType"), icon: Image },
                        { key: "file", label: t("filesType"), icon: FileText },
                        { key: "link", label: t("linksType"), icon: Star },
                      ].map((filter) => (
                        <button
                          key={filter.key}
                          onClick={() => {
                            setSelectedFilter(
                              filter.key as
                                | "all"
                                | "message"
                                | "media"
                                | "file"
                                | "link"
                            );
                            setShowFilters(false);
                          }}
                          className={`w-full flex items-center space-x-2 xs:space-x-3 px-2 xs:px-3 py-1 xs:py-2 rounded-md transition-colors text-xs xs:text-sm ${
                            selectedFilter === filter.key
                              ? "bg-blue-50 text-blue-700"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <filter.icon className="w-3 h-3 xs:w-4 h-4" />
                          <span>{filter.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Active filters */}
            {(selectedFilter !== "all" || searchQuery) && (
              <div className="flex flex-wrap items-center gap-1 xs:gap-2 mt-2 xs:mt-4 pt-2 xs:pt-4 border-t border-gray-200">
                <span className="text-xs xs:text-sm text-gray-600">
                  {t("activeFilters")}
                </span>
                {selectedFilter !== "all" && (
                  <span className="inline-flex items-center space-x-0.5 xs:space-x-1 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    <span>{getTypeLabel(selectedFilter)}</span>
                    <button
                      onClick={() => setSelectedFilter("all")}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                      title={t("removeTypeFilter")}
                    >
                      <X className="w-2.5 h-2.5 xs:w-3 h-3" />
                    </button>
                  </span>
                )}
                {searchQuery && (
                  <span className="inline-flex items-center space-x-0.5 xs:space-x-1 px-1.5 xs:px-2 py-0.5 xs:py-1 bg-green-100 text-green-800 rounded-full text-xs">
                    <span>"{searchQuery}"</span>
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:bg-green-200 rounded-full p-0.5"
                      title={t("clearSearch")}
                    >
                      <X className="w-2.5 h-2.5 xs:w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 space-y-2 xs:space-y-4 overflow-y-auto h-full">
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 xs:p-8 sm:p-12 text-center">
              <div className="w-8 h-8 xs:w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full mx-auto mb-2 xs:mb-4 animate-pulse"></div>
              <h3 className="text-base xs:text-lg sm:text-xl font-medium text-gray-900 mb-1 xs:mb-2">
                {t("loadingBookmarks")}
              </h3>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 xs:p-8 sm:p-12 text-center">
              <Heart className="w-8 h-8 xs:w-12 h-12 sm:w-16 sm:h-16 text-red-300 mx-auto mb-2 xs:mb-4" />
              <h3 className="text-base xs:text-lg sm:text-xl font-medium text-gray-900 mb-1 xs:mb-2">
                {t("errorLoadingBookmarks")}
              </h3>
              <p className="text-gray-600 text-xs xs:text-sm sm:text-base">
                {error}
              </p>
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 xs:p-8 sm:p-12 text-center">
              <Heart className="w-8 h-8 xs:w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-2 xs:mb-4" />
              <h3 className="text-base xs:text-lg sm:text-xl font-medium text-gray-900 mb-1 xs:mb-2">
                {searchQuery || selectedFilter !== "all"
                  ? t("noResultsFound")
                  : t("noBookmarksYet")}
              </h3>
              <p className="text-gray-600 text-xs xs:text-sm sm:text-base">
                {searchQuery || selectedFilter !== "all"
                  ? t("modifySearchCriteria")
                  : t("addToBookmarks")}
              </p>
            </div>
          ) : (
            filteredBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 xs:p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1 xs:space-x-2 mb-1 xs:mb-2">
                      {getTypeIcon(bookmark.type)}
                      <span className="text-xs font-medium text-gray-500 uppercase">
                        {getTypeLabel(bookmark.type)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {bookmark.translatedChatName || bookmark.chatName}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1 xs:mb-2 text-xs xs:text-sm sm:text-base">
                      {bookmark.translatedTitle || bookmark.title}
                    </h3>

                    <div className="flex items-start space-x-2 xs:space-x-3">
                      {bookmark.thumbnail && (
                        <img
                          src={bookmark.thumbnail}
                          alt="Aperçu"
                          className="w-10 h-10 xs:w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-600 text-xs xs:text-sm sm:text-base line-clamp-2">
                          {bookmark.translatedContent || bookmark.content}
                        </p>
                        <div className="flex items-center space-x-2 xs:space-x-4 mt-1 xs:mt-2 text-xs text-gray-500">
                          <span>{t("byAuthor")} {bookmark.author}</span>
                          <span className="flex items-center space-x-0.5 xs:space-x-1">
                            <Calendar className="w-2.5 h-2.5 xs:w-3 h-3" />
                            <span>{formatDate(bookmark.date)}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeBookmark(bookmark.id)}
                    className="ml-1 xs:ml-3 p-1 xs:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    title={t("removeBookmark")}
                  >
                    <Heart className="w-3 h-3 xs:w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats */}
        {filteredBookmarks.length > 0 && (
          <div className="mt-4 xs:mt-8 text-center text-xs xs:text-sm text-gray-500">
            {filteredBookmarks.length} {t("resultsDisplayed")}{" "}
            {bookmarks.length} {t("totalBookmarks")}
          </div>
        )}

        {/* Click outside to close filters */}
        {showFilters && (
          <div
            className="fixed inset-0 z-0"
            onClick={() => setShowFilters(false)}
          />
        )}
      </div>
    </div>
  );
}
