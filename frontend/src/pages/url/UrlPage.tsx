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
} from "lucide-react";

import api from "../../services/api";

type Url = {
  _id: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

type UrlResponse = {
  success: boolean;
  data: {
    urls: Url[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const Urls = () => {
  const [urls, setUrls] = useState<Url[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const fetchUrls = async () => {
    try {
      setLoading(true);

      const response = await api.get("/urls");

      if (response.data.success) {
        setUrls(response.data.data.items);
        setPagination({
          page: response.data.data.page,
          limit: response.data.data.limit,
          total: response.data.data.total,
          totalPages: response.data.data.totalPages,
        });
      }
    } catch (error) {
      console.error("Failed to fetch URLs:", error);
      setUrls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const filteredUrls = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return urls;
    }

    return urls.filter(
      (url) =>
        url.originalUrl.toLowerCase().includes(value) ||
        url.shortCode.toLowerCase().includes(value),
    );
  }, [urls, search]);

  const getShortUrl = (shortCode: string) => {
    return `${import.meta.env.VITE_API_BASE_URL}/urls/${shortCode}`;
  };

  const copyUrl = async (url: Url) => {
    const shortUrl = getShortUrl(url.shortCode);

    await navigator.clipboard.writeText(shortUrl);

    setCopiedId(url._id);

    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const deactivateUrl = async (id: string) => {
    try {
      await api.patch(`/urls/id/${id}/deactivate`);

      setOpenMenuId(null);
      await fetchUrls();
    } catch (error) {
      console.error("Failed to deactivate URL:", error);
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

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-zinc-500">
              URL MANAGEMENT
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
              My URLs
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Manage, monitor and organize all your shortened links.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            <Link2 size={17} />
            Create Link
          </button>
        </div>

        {/* Toolbar */}
        <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <div className="relative max-w-md">
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
        </div>

        {/* Content */}
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          {loading ? (
            <div className="divide-y divide-zinc-100">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="animate-pulse p-5">
                  <div className="h-4 w-2/5 rounded bg-zinc-200" />
                  <div className="mt-3 h-3 w-3/5 rounded bg-zinc-100" />
                </div>
              ))}
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100">
                <Link2 size={25} className="text-zinc-500" />
              </div>

              <h2 className="text-lg font-semibold text-zinc-950">
                {search ? "No URLs found" : "No URLs yet"}
              </h2>

              <p className="mt-2 max-w-sm text-sm text-zinc-500">
                {search
                  ? "Try searching with a different URL or short code."
                  : "Create your first short link and start tracking its performance."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
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

                      return (
                        <tr
                          key={url._id}
                          className="transition hover:bg-zinc-50/60"
                        >
                          <td className="max-w-md px-5 py-5">
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                                <Link2 size={16} className="text-zinc-600" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-zinc-950">
                                  {shortUrl}
                                </p>

                                <p className="mt-1 truncate text-xs text-zinc-500">
                                  {url.originalUrl}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                              <MousePointerClick
                                size={15}
                                className="text-zinc-400"
                              />
                              {url.clicks.toLocaleString()}
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                url.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-zinc-100 text-zinc-500"
                              }`}
                            >
                              {url.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                              <CalendarDays size={15} />
                              {formatDate(url.createdAt)}
                            </div>
                          </td>

                          <td className="px-5 py-5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => copyUrl(url)}
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                                title="Copy short URL"
                              >
                                {copiedId === url._id ? (
                                  <Check size={16} />
                                ) : (
                                  <Copy size={16} />
                                )}
                              </button>

                              <a
                                href={shortUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                                title="Open short URL"
                              >
                                <ExternalLink size={16} />
                              </a>

                              <button
                                type="button"
                                onClick={() => deactivateUrl(url._id)}
                                disabled={!url.isActive}
                                className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                Deactivate
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-zinc-100 md:hidden">
                {filteredUrls.map((url) => {
                  const shortUrl = getShortUrl(url.shortCode);

                  return (
                    <div key={url._id} className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100">
                            <Link2 size={16} className="text-zinc-600" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-zinc-950">
                              {shortUrl}
                            </p>

                            <p className="mt-1 truncate text-xs text-zinc-500">
                              {url.originalUrl}
                            </p>
                          </div>
                        </div>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenMenuId((current) =>
                                current === url._id ? null : url._id,
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950"
                            title="More actions"
                          >
                            <MoreHorizontal size={17} />
                          </button>

                          {openMenuId === url._id && (
                            <div className="absolute right-0 top-11 z-50 w-48 overflow-hidden rounded-xl border border-zinc-200 bg-white p-1.5 shadow-xl">
                              {/* Copy */}
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(url.shortUrl);
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                              >
                                Copy URL
                              </button>

                              {/* Open */}
                              <button
                                type="button"
                                onClick={() => {
                                  window.open(url.shortUrl, "_blank");
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                              >
                                Open URL
                              </button>

                              {/* Activate / Deactivate */}
                              {url.isActive ? (
                                <button
                                  type="button"
                                  onClick={() => deactivateUrl(url._id)}
                                  className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-amber-600 transition hover:bg-amber-50"
                                >
                                  Deactivate
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-emerald-600 transition"
                                  title="Activate endpoint is not available yet"
                                >
                                  Activate
                                </button>
                              )}

                              <div className="my-1 border-t border-zinc-100" />

                              {/* Edit */}
                              <button
                                type="button"
                                onClick={() => {
                                  // We'll connect this in the next step.
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-zinc-100"
                              >
                                Edit
                              </button>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => {
                                  // We'll connect this in the delete step.
                                  setOpenMenuId(null);
                                }}
                                className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-xs text-zinc-400">Clicks</p>

                            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-zinc-800">
                              <MousePointerClick size={14} />
                              {url.clicks.toLocaleString()}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-zinc-400">Status</p>

                            <span
                              className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                url.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-zinc-100 text-zinc-500"
                              }`}
                            >
                              {url.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => copyUrl(url)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200"
                          >
                            {copiedId === url._id ? (
                              <Check size={16} />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>

                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
