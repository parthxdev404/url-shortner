import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Copy,
  ExternalLink,
  BarChart3,
  MoreHorizontal,
  Link2,
  MousePointerClick,
  CalendarDays,
  Check,
  Power,
  Trash2,
  Loader2,
  X,
  RotateCcw,
  CheckSquare,
  Square,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { urlService, type Url } from "../../services/urlService";
import { notifyUrlsChanged } from "../../utils/urlEvents";

type UrlResponse = {
  success: boolean;
  data: {
    items: Url[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

type ActionState = {
  type:
    | "activate"
    | "deactivate"
    | "delete"
    | "bulkDelete"
    | "bulkRestore"
    | "bulkDeactivate"
    | null;
  id: string | null;
};

export const Urls = () => {
  const navigate = useNavigate();

  /* =========================================================
     STATE
  ========================================================= */

  const [urls, setUrls] = useState<Url[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [actionState, setActionState] = useState<ActionState>({
    type: null,
    id: null,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  /* =========================================================
     HELPERS
  ========================================================= */

  const getShortUrl = (shortCode: string) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    return `${apiBaseUrl}/urls/${shortCode}`;
  };

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      ).response;

      if (response?.data?.message) {
        return response.data.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) {
      return "Never";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Unknown";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(parsedDate);
  };

  const isActionLoading = (id: string) => {
    return actionState.id === id;
  };

  /* =========================================================
     FETCH URLS
  ========================================================= */

  const fetchUrls = async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage(null);

      const response = await urlService.getMyUrls({
        page: pagination.page,
        limit: pagination.limit,
        search: search.trim() || undefined,
      });

      const responseData = response as unknown as UrlResponse;

      if (!responseData.success) {
        setUrls([]);
        return;
      }

      const data = responseData.data;

      setUrls(data.items ?? []);

      setPagination((current) => ({
        ...current,
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.totalPages,
      }));

      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to fetch URLs:", error);

      setUrls([]);

      setErrorMessage(getErrorMessage(error, "Unable to load your URLs."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [pagination.page, pagination.limit]);

  /*
   * Search should restart pagination from page 1.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPagination((current) => {
        if (current.page === 1) {
          return current;
        }

        return {
          ...current,
          page: 1,
        };
      });

      if (pagination.page === 1) {
        fetchUrls();
      }
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [search]);

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredUrls = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return urls;
    }

    return urls.filter((url) => {
      return (
        url.originalUrl.toLowerCase().includes(value) ||
        url.shortCode.toLowerCase().includes(value)
      );
    });
  }, [urls, search]);

  /* =========================================================
     SELECTION
  ========================================================= */

  const visibleIds = filteredUrls.map((url) => url._id);

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  const someVisibleSelected = visibleIds.some((id) => selectedIds.includes(id));

  const toggleSelection = (id: string) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((selectedId) => selectedId !== id);
      }

      return [...current, id];
    });
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.includes(id)),
      );

      return;
    }

    setSelectedIds((current) => {
      const merged = new Set([...current, ...visibleIds]);

      return Array.from(merged);
    });
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  /* =========================================================
     COPY
  ========================================================= */

  const copyUrl = async (url: Url) => {
    try {
      const shortUrl = getShortUrl(url.shortCode);

      await navigator.clipboard.writeText(shortUrl);

      setCopiedId(url._id);

      window.setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy URL:", error);

      setErrorMessage("Unable to copy the URL.");
    }
  };

  /* =========================================================
     ACTIVATE
  ========================================================= */

  const activateUrl = async (id: string) => {
    try {
      setErrorMessage(null);

      setActionState({
        type: "activate",
        id,
      });

      await urlService.activate(id);

      setUrls((currentUrls) =>
        currentUrls.map((url) =>
          url._id === id
            ? {
                ...url,
                isActive: true,
              }
            : url,
        ),
      );

      notifyUrlsChanged();

      setOpenMenuId(null);
    } catch (error) {
      console.error("Failed to activate URL:", error);

      setErrorMessage(getErrorMessage(error, "Unable to activate this URL."));
    } finally {
      setActionState({
        type: null,
        id: null,
      });
    }
  };

  /* =========================================================
     DEACTIVATE
  ========================================================= */

  const deactivateUrl = async (id: string) => {
    try {
      setErrorMessage(null);

      setActionState({
        type: "deactivate",
        id,
      });

      await urlService.deactivate(id);

      setUrls((currentUrls) =>
        currentUrls.map((url) =>
          url._id === id
            ? {
                ...url,
                isActive: false,
              }
            : url,
        ),
      );

      notifyUrlsChanged();

      setOpenMenuId(null);
    } catch (error) {
      console.error("Failed to deactivate URL:", error);

      setErrorMessage(getErrorMessage(error, "Unable to deactivate this URL."));
    } finally {
      setActionState({
        type: null,
        id: null,
      });
    }
  };

  /* =========================================================
     DELETE SINGLE URL
  ========================================================= */

  const deleteUrl = async (id: string) => {
    try {
      setErrorMessage(null);

      setActionState({
        type: "delete",
        id,
      });

      await urlService.delete(id);

      setUrls((currentUrls) => currentUrls.filter((url) => url._id !== id));

      setPagination((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
      }));

      setSelectedIds((current) =>
        current.filter((selectedId) => selectedId !== id),
      );

      notifyUrlsChanged();

      setDeleteId(null);
      setOpenMenuId(null);
    } catch (error) {
      console.error("Failed to delete URL:", error);

      setErrorMessage(getErrorMessage(error, "Unable to delete this URL."));
    } finally {
      setActionState({
        type: null,
        id: null,
      });
    }
  };

  /* =========================================================
     BULK DELETE
  ========================================================= */

  const bulkDelete = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    try {
      setErrorMessage(null);

      setActionState({
        type: "bulkDelete",
        id: null,
      });

      await urlService.bulkDelete(selectedIds);

      const selectedSet = new Set(selectedIds);

      setUrls((currentUrls) =>
        currentUrls.filter((url) => !selectedSet.has(url._id)),
      );

      setPagination((current) => ({
        ...current,
        total: Math.max(0, current.total - selectedIds.length),
      }));

      clearSelection();

      notifyUrlsChanged();
    } catch (error) {
      console.error("Failed to bulk delete URLs:", error);

      setErrorMessage(
        getErrorMessage(error, "Unable to delete selected URLs."),
      );
    } finally {
      setActionState({
        type: null,
        id: null,
      });
    }
  };

  /* =========================================================
     BULK RESTORE
  ========================================================= */

  const bulkRestore = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    try {
      setErrorMessage(null);

      setActionState({
        type: "bulkRestore",
        id: null,
      });

      await urlService.bulkRestore(selectedIds);

      clearSelection();

      notifyUrlsChanged();

      await fetchUrls(true);
    } catch (error) {
      console.error("Failed to bulk restore URLs:", error);

      setErrorMessage(
        getErrorMessage(error, "Unable to restore selected URLs."),
      );
    } finally {
      setActionState({
        type: null,
        id: null,
      });
    }
  };

  /* =========================================================
     BULK DEACTIVATE
  ========================================================= */

  const bulkDeactivate = async () => {
    if (selectedIds.length === 0) {
      return;
    }

    try {
      setErrorMessage(null);

      setActionState({
        type: "bulkDeactivate",
        id: null,
      });

      await urlService.bulkDeactivate(selectedIds);

      const selectedSet = new Set(selectedIds);

      setUrls((currentUrls) =>
        currentUrls.map((url) =>
          selectedSet.has(url._id)
            ? {
                ...url,
                isActive: false,
              }
            : url,
        ),
      );

      clearSelection();

      notifyUrlsChanged();
    } catch (error) {
      console.error("Failed to bulk deactivate URLs:", error);

      setErrorMessage(
        getErrorMessage(error, "Unable to deactivate selected URLs."),
      );
    } finally {
      setActionState({
        type: null,
        id: null,
      });
    }
  };

  /* =========================================================
     LOADING STATE
  ========================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-10 w-48 rounded-lg bg-zinc-200" />

            <div className="mt-6 h-12 w-full rounded-xl bg-zinc-200" />

            <div className="mt-6 space-y-4">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="h-28 rounded-2xl bg-zinc-200" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     MAIN
  ========================================================= */

  return (
    <div className="min-h-screen bg-zinc-50 px-3 py-5 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
                URL Management
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
                Your URLs
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Manage, monitor and organize your shortened URLs.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchUrls(true)}
              disabled={refreshing}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Loader2 size={16} className={refreshing ? "animate-spin" : ""} />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* =====================================================
            ERROR
        ===================================================== */}

        {errorMessage && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p>{errorMessage}</p>

            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="shrink-0 rounded-lg p-1 hover:bg-red-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* =====================================================
            SEARCH
        ===================================================== */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search URLs..."
              className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100"
            />
          </div>
        </div>

        {/* =====================================================
            BULK TOOLBAR
        ===================================================== */}

        {selectedIds.length > 0 && (
          <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare size={18} className="text-zinc-700" />

                <span className="text-sm font-semibold text-zinc-900">
                  {selectedIds.length} selected
                </span>

                <button
                  type="button"
                  onClick={clearSelection}
                  className="ml-1 text-xs font-medium text-zinc-400 hover:text-zinc-900"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:flex">
                <button
                  type="button"
                  onClick={bulkRestore}
                  disabled={actionState.type !== null}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                >
                  {actionState.type === "bulkRestore" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <RotateCcw size={15} />
                  )}
                  Restore
                </button>

                <button
                  type="button"
                  onClick={bulkDeactivate}
                  disabled={actionState.type !== null}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
                >
                  {actionState.type === "bulkDeactivate" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Power size={15} />
                  )}
                  Deactivate
                </button>

                <button
                  type="button"
                  onClick={bulkDelete}
                  disabled={actionState.type !== null}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  {actionState.type === "bulkDelete" ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Trash2 size={15} />
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            URL LIST
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {/* SELECT ALL */}
          <div className="border-b border-zinc-100 px-4 py-3 sm:px-5">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-950"
            >
              {allVisibleSelected ? (
                <CheckSquare size={17} className="text-zinc-900" />
              ) : someVisibleSelected ? (
                <span className="flex h-[17px] w-[17px] items-center justify-center rounded border border-zinc-900 bg-zinc-900">
                  <span className="h-0.5 w-2.5 bg-white" />
                </span>
              ) : (
                <Square size={17} className="text-zinc-400" />
              )}

              {allVisibleSelected ? "Unselect all" : "Select all"}
            </button>
          </div>

          {filteredUrls.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center px-6">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
                  <Link2 size={20} className="text-zinc-400" />
                </div>

                <h2 className="mt-4 text-base font-semibold text-zinc-900">
                  No URLs found
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  {search
                    ? "Try changing your search."
                    : "Create your first shortened URL to get started."}
                </p>
              </div>
            </div>
          ) : (
            <div>
              {filteredUrls.map((url) => {
                const selected = selectedIds.includes(url._id);

                const actionLoading = isActionLoading(url._id);

                return (
                  <div
                    key={url._id}
                    className={`border-b border-zinc-100 px-4 py-4 last:border-b-0 sm:px-5 ${
                      selected ? "bg-zinc-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* CHECKBOX */}

                      <button
                        type="button"
                        onClick={() => toggleSelection(url._id)}
                        className="mt-1 shrink-0"
                        aria-label={selected ? "Unselect URL" : "Select URL"}
                      >
                        {selected ? (
                          <CheckSquare size={18} className="text-zinc-900" />
                        ) : (
                          <Square
                            size={18}
                            className="text-zinc-300 hover:text-zinc-600"
                          />
                        )}
                      </button>

                      {/* CONTENT */}

                      <div className="min-w-0 flex-1">
                        {/* TOP */}

                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <a
                                href={getShortUrl(url.shortCode)}
                                target="_blank"
                                rel="noreferrer"
                                className="max-w-full truncate text-sm font-semibold text-zinc-950 hover:underline sm:text-base"
                              >
                                {getShortUrl(url.shortCode)}
                              </a>

                              <span
                                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                                  url.isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-zinc-100 text-zinc-500"
                                }`}
                              >
                                {url.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <p className="mt-1 truncate text-xs text-zinc-400 sm:text-sm">
                              {url.originalUrl}
                            </p>
                          </div>

                          {/* =================================================
                              DESKTOP ACTIONS
                              ================================================= */}

                          <div className="hidden shrink-0 items-center gap-2 sm:flex">
                            {/* ANALYTICS */}

                            <button
                              type="button"
                              onClick={() =>
                                navigate(`/urls/${url._id}/analytics`)
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
                            >
                              <BarChart3 size={15} />
                              Analytics
                            </button>

                            {/* ACTIVE */}

                            {url.isActive ? (
                              <button
                                type="button"
                                onClick={() => deactivateUrl(url._id)}
                                disabled={actionLoading}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {actionLoading ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <Power size={15} />
                                )}
                                Deactivate
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => activateUrl(url._id)}
                                disabled={actionLoading}
                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {actionLoading ? (
                                  <Loader2 size={15} className="animate-spin" />
                                ) : (
                                  <Power size={15} />
                                )}
                                Activate
                              </button>
                            )}

                            {/* DELETE */}

                            <button
                              type="button"
                              onClick={() => setDeleteId(url._id)}
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={15} />
                              Delete
                            </button>
                          </div>

                          {/* =================================================
                              MOBILE THREE DOT MENU
                              ================================================= */}

                          <div className="relative sm:hidden">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenMenuId((current) =>
                                  current === url._id ? null : url._id,
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-600 shadow-sm hover:bg-zinc-50"
                              aria-label="Open URL actions"
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {openMenuId === url._id && (
                              <div className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                                {/* ANALYTICS */}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);

                                    navigate(`/urls/${url._id}/analytics`);
                                  }}
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                                >
                                  <BarChart3 size={16} />
                                  Analytics
                                </button>

                                {/* ACTIVATE / DEACTIVATE */}

                                {url.isActive ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);

                                      deactivateUrl(url._id);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                                  >
                                    <Power size={16} />
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);

                                      activateUrl(url._id);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 hover:bg-zinc-100"
                                  >
                                    <Power size={16} />
                                    Activate
                                  </button>
                                )}

                                <div className="my-1 border-t border-zinc-100" />

                                {/* DELETE */}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setOpenMenuId(null);

                                    setDeleteId(url._id);
                                  }}
                                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={16} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* =================================================
                            METADATA / SECONDARY ACTIONS
                            ================================================= */}

                        <div className="mt-4 flex flex-col gap-3 border-t border-zinc-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-400">
                            <span className="inline-flex items-center gap-1.5">
                              <MousePointerClick size={14} />
                              {(url.clicks ?? 0).toLocaleString()} clicks
                            </span>

                            <span className="inline-flex items-center gap-1.5">
                              <CalendarDays size={14} />

                              {formatDate(url.createdAt)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* COPY */}

                            <button
                              type="button"
                              onClick={() => copyUrl(url)}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                            >
                              {copiedId === url._id ? (
                                <>
                                  <Check size={14} />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  Copy
                                </>
                              )}
                            </button>

                            {/* OPEN */}

                            <a
                              href={getShortUrl(url.shortCode)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
                            >
                              <ExternalLink size={14} />
                              Open
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}

        {pagination.totalPages > 1 && (
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500 sm:text-sm">
              Page {pagination.page} of {pagination.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    page: Math.max(1, current.page - 1),
                  }))
                }
                className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() =>
                  setPagination((current) => ({
                    ...current,
                    page: Math.min(current.totalPages, current.page + 1),
                  }))
                }
                className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            DELETE CONFIRMATION
        ===================================================== */}

        {deleteId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-950">
                    Delete URL?
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    This URL will be removed from your active URL list.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteId(null)}
                  className="h-10 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => deleteUrl(deleteId)}
                  disabled={actionState.type === "delete"}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {actionState.type === "delete" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  Delete URL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
