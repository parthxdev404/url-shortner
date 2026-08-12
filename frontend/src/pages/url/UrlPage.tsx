import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Link2,
  MousePointerClick,
  CalendarDays,
  Check,
  Power,
  Trash2,
  Pencil,
  Loader2,
  X,
} from "lucide-react";

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
  type: "activate" | "deactivate" | "delete" | null;
  id: string | null;
};

export const Urls = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [actionState, setActionState] = useState<ActionState>({
    type: null,
    id: null,
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const getShortUrl = (shortCode: string) => {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

    return `${apiBaseUrl}/urls/${shortCode}`;
  };

  const getErrorMessage = (error: unknown, fallback: string) => {
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

  const fetchUrls = async () => {
    try {
      setLoading(true);
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
    } catch (error) {
      console.error("Failed to fetch URLs:", error);

      setUrls([]);

      setErrorMessage(getErrorMessage(error, "Unable to load your URLs."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, [pagination.page, pagination.limit]);

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

  const copyUrl = async (url: Url) => {
    try {
      const shortUrl = getShortUrl(url.shortCode);

      await navigator.clipboard.writeText(shortUrl);

      setCopiedId(url._id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (error) {
      console.error("Failed to copy URL:", error);

      setErrorMessage("Unable to copy the URL.");
    }
  };

  const activateUrl = async (id: string) => {
    try {
      setErrorMessage(null);

      setActionState({
        type: "activate",
        id,
      });

      await urlService.activate(id);

      // Instant UI update
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

  const deactivateUrl = async (id: string) => {
    try {
      setErrorMessage(null);

      setActionState({
        type: "deactivate",
        id,
      });

      await urlService.deactivate(id);

      // Instant UI update
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

  const deleteUrl = async (id: string) => {
    try {
      setErrorMessage(null);

      setActionState({
        type: "delete",
        id,
      });

      await urlService.delete(id);

      // Remove immediately from UI
      setUrls((currentUrls) => currentUrls.filter((url) => url._id !== id));

      // Update pagination count immediately
      setPagination((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
      }));
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

  const formatDate = (date: string | null) => {
    if (!date) {
      return "Never";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const isActionLoading = (id: string) => {
    return actionState.id === id;
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-400">
              URL Management
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl">
              My URLs
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Manage, monitor and organize all your shortened links.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 active:scale-[0.98]"
          >
            <Link2 size={17} />
            Create Link
          </button>
        </div>

        {errorMessage && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <div className="min-w-0 flex-1">{errorMessage}</div>

            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="shrink-0 rounded-md p-1 transition hover:bg-red-100"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search URLs..."
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-zinc-400 focus:border-zinc-400 focus:bg-white"
              />
            </div>

            <div className="text-sm text-zinc-400">
              {pagination.total.toLocaleString()}{" "}
              {pagination.total === 1 ? "URL" : "URLs"}
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {/* LOADING */}

          {loading ? (
            <div className="divide-y divide-zinc-100">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="animate-pulse p-5">
                  <div className="h-4 w-2/5 rounded bg-zinc-200" />

                  <div className="mt-3 h-3 w-3/5 rounded bg-zinc-100" />
                </div>
              ))}
            </div>
          ) : filteredUrls.length === 0 ? (
            /* EMPTY */

            <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
                <Link2 size={25} className="text-zinc-500" />
              </div>

              <h2 className="text-lg font-semibold text-zinc-950">
                {search ? "No URLs found" : "No URLs yet"}
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-zinc-500">
                {search
                  ? "Try searching with a different URL or short code."
                  : "Create your first short link and start tracking its performance."}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 bg-zinc-50/70">
                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Link
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Clicks
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Status
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Created
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-zinc-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-zinc-100">
                    {filteredUrls.map((url) => {
                      const shortUrl = getShortUrl(url.shortCode);

                      const actionLoading = isActionLoading(url._id);

                      return (
                        <tr
                          key={url._id}
                          className="transition hover:bg-zinc-50/60"
                        >
                          {/* LINK */}

                          <td className="max-w-md px-5 py-5">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                                <Link2 size={16} className="text-zinc-600" />
                              </div>

                              <div className="min-w-0">
                                <a
                                  href={shortUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block truncate text-sm font-semibold text-zinc-950 hover:underline"
                                >
                                  {shortUrl}
                                </a>

                                <p
                                  className="mt-1 truncate text-xs text-zinc-500"
                                  title={url.originalUrl}
                                >
                                  {url.originalUrl}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* CLICKS */}

                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                              <MousePointerClick
                                size={15}
                                className="text-zinc-400"
                              />

                              {url.clicks.toLocaleString()}
                            </div>
                          </td>

                          {/* STATUS */}

                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                url.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              <span
                                className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                  url.isActive
                                    ? "bg-emerald-500"
                                    : "bg-amber-500"
                                }`}
                              />

                              {url.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>

                          {/* CREATED */}

                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                              <CalendarDays size={15} />

                              {formatDate(url.createdAt)}
                            </div>
                          </td>

                          {/* ACTIONS */}

                          <td className="px-5 py-5">
                            <div className="flex items-center justify-end gap-2">
                              {/* COPY */}

                              <button
                                type="button"
                                onClick={() => copyUrl(url)}
                                disabled={actionLoading}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-40"
                                title="Copy"
                              >
                                {copiedId === url._id ? (
                                  <Check size={16} />
                                ) : (
                                  <Copy size={16} />
                                )}
                              </button>

                              {/* OPEN */}

                              <a
                                href={shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                                title="Open"
                              >
                                <ExternalLink size={16} />
                              </a>

                              {/* ACTIVATE / DEACTIVATE */}

                              {url.isActive ? (
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => deactivateUrl(url._id)}
                                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-amber-200 px-3 text-xs font-medium text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {actionLoading &&
                                  actionState.type === "deactivate" ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Power size={14} />
                                  )}
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled={actionLoading}
                                  onClick={() => activateUrl(url._id)}
                                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-emerald-200 px-3 text-xs font-medium text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {actionLoading &&
                                  actionState.type === "activate" ? (
                                    <Loader2
                                      size={14}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <Power size={14} />
                                  )}
                                  Activate
                                </button>
                              )}

                              {/* DELETE */}

                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => setDeleteId(url._id)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-zinc-100 md:hidden">
                {filteredUrls.map((url) => {
                  const shortUrl = getShortUrl(url.shortCode);

                  const actionLoading = isActionLoading(url._id);

                  return (
                    <div key={url._id} className="p-5">
                      <div className="flex items-start gap-3">
                        {/* ICON */}

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100">
                          <Link2 size={17} className="text-zinc-600" />
                        </div>

                        {/* MAIN */}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <a
                                href={shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block truncate text-sm font-semibold text-zinc-950 hover:underline"
                              >
                                {shortUrl}
                              </a>

                              <p
                                className="mt-1 truncate text-xs text-zinc-500"
                                title={url.originalUrl}
                              >
                                {url.originalUrl}
                              </p>
                            </div>

                            {/* MENU */}

                            <div className="relative shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenMenuId((current) =>
                                    current === url._id ? null : url._id,
                                  )
                                }
                                disabled={actionLoading}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 disabled:opacity-40"
                              >
                                <MoreHorizontal size={17} />
                              </button>

                              {openMenuId === url._id && (
                                <div className="absolute right-0 top-11 z-50 w-52 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                                  {/* COPY */}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      copyUrl(url);
                                      setOpenMenuId(null);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                                  >
                                    <Copy size={16} />
                                    Copy URL
                                  </button>

                                  {/* OPEN */}

                                  <a
                                    href={shortUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setOpenMenuId(null)}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-700 transition hover:bg-zinc-100"
                                  >
                                    <ExternalLink size={16} />
                                    Open URL
                                  </a>

                                  <div className="my-1 border-t border-zinc-100" />

                                  {/* ACTIVATE */}

                                  {!url.isActive && (
                                    <button
                                      type="button"
                                      onClick={() => activateUrl(url._id)}
                                      disabled={actionLoading}
                                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                                    >
                                      {actionLoading &&
                                      actionState.type === "activate" ? (
                                        <Loader2
                                          size={16}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Power size={16} />
                                      )}
                                      Activate
                                    </button>
                                  )}

                                  {/* DEACTIVATE */}

                                  {url.isActive && (
                                    <button
                                      type="button"
                                      onClick={() => deactivateUrl(url._id)}
                                      disabled={actionLoading}
                                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-amber-600 transition hover:bg-amber-50 disabled:opacity-50"
                                    >
                                      {actionLoading &&
                                      actionState.type === "deactivate" ? (
                                        <Loader2
                                          size={16}
                                          className="animate-spin"
                                        />
                                      ) : (
                                        <Power size={16} />
                                      )}
                                      Deactivate
                                    </button>
                                  )}

                                  <div className="my-1 border-t border-zinc-100" />

                                  {/* EDIT */}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);

                                      console.log("Edit URL:", url);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                                  >
                                    <Pencil size={16} />
                                    Edit URL
                                  </button>

                                  {/* DELETE */}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);

                                      setDeleteId(url._id);
                                    }}
                                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                                  >
                                    <Trash2 size={16} />
                                    Delete URL
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* META */}

                          <div className="mt-4 flex items-center gap-4">
                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-zinc-400">
                                Clicks
                              </p>

                              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-zinc-800">
                                <MousePointerClick size={14} />

                                {url.clicks.toLocaleString()}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-zinc-400">
                                Status
                              </p>

                              <span
                                className={`mt-1 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                  url.isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {url.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>

                            <div className="ml-auto text-right">
                              <p className="text-[11px] uppercase tracking-wide text-zinc-400">
                                Created
                              </p>

                              <p className="mt-1 text-xs text-zinc-500">
                                {formatDate(url.createdAt)}
                              </p>
                            </div>
                          </div>

                          {/* QUICK ACTIONS */}

                          <div className="mt-4 flex gap-2">
                            <button
                              type="button"
                              onClick={() => copyUrl(url)}
                              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100"
                            >
                              {copiedId === url._id ? (
                                <Check size={15} />
                              ) : (
                                <Copy size={15} />
                              )}

                              {copiedId === url._id ? "Copied" : "Copy"}
                            </button>

                            <a
                              href={shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100"
                            >
                              <ExternalLink size={15} />
                              Open
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {!loading && pagination.totalPages > 1 && (
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-sm">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((current) => ({
                  ...current,
                  page: current.page - 1,
                }))
              }
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-zinc-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination((current) => ({
                  ...current,
                  page: current.page + 1,
                }))
              }
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50">
                <Trash2 size={20} className="text-red-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-zinc-950">
                  Delete URL?
                </h2>

                <p className="mt-1 text-sm leading-6 text-zinc-500">
                  This URL will be removed from your active URL list. This
                  action cannot be undone from this screen.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                disabled={actionState.type === "delete"}
                className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  if (deleteId) {
                    deleteUrl(deleteId);
                  }
                }}
                disabled={actionState.type === "delete"}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionState.type === "delete" ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={15} />
                    Delete URL
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
