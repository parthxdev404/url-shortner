import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  BarChart3,
  Check,
  ChevronRight,
  Clipboard,
  ExternalLink,
  Link2,
  Loader2,
  MousePointerClick,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  TrendingUp,
  Unplug,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";

type DashboardStats = {
  totalUrls: number;
  activeUrls: number;
  inactiveUrls: number;
  expiredUrls: number;
  deletedUrls: number;
  totalClicks: number;
};

type DashboardUrl = {
  _id?: string;
  id?: string;
  originalUrl: string;
  shortCode: string;
  clicks: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
};

type DashboardData = {
  stats: DashboardStats;
  recentUrls: DashboardUrl[];
  topUrls: DashboardUrl[];
};

type DashboardResponse = {
  success: boolean;
  data: DashboardData;
  message?: string;
};

export const Dashboard = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchDashboard = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        setError(null);
        setIsLoading(true);
      }

      const response = await api.get<DashboardResponse>("/dashboard");

      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.message || "Unable to load dashboard.");
      }

      setDashboard(response.data.data);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);

      if (!silent) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unable to load dashboard.");
        }
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboard(false);
  }, [fetchDashboard]);

  useEffect(() => {
    const handleUrlsChanged = () => {
      // Silent background refresh
      fetchDashboard(true);
    };

    window.addEventListener("urls:changed", handleUrlsChanged);

    return () => {
      window.removeEventListener("urls:changed", handleUrlsChanged);
    };
  }, [fetchDashboard]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboard(false);
  };

  const handleCopy = async (shortCode: string) => {
    const shortUrl = `${import.meta.env.VITE_API_BASE_URL}/urls/${shortCode}`;

    try {
      await navigator.clipboard.writeText(shortUrl);

      setCopiedCode(shortCode);

      window.setTimeout(() => {
        setCopiedCode(null);
      }, 1800);
    } catch {
      console.error("Failed to copy URL");
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  const getShortUrl = (shortCode: string) => {
    return `${import.meta.env.VITE_API_BASE_URL}/urls/${shortCode}`;
  };

  const getDomain = (url: string) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) {
      return false;
    }

    return new Date(expiresAt).getTime() <= Date.now();
  };

  const getStatus = (url: DashboardUrl) => {
    if (isExpired(url.expiresAt)) {
      return {
        label: "Expired",
        className: "bg-orange-50 text-orange-600",
      };
    }

    if (!url.isActive) {
      return {
        label: "Inactive",
        className: "bg-red-50 text-red-600",
      };
    }

    return {
      label: "Active",
      className: "bg-emerald-50 text-emerald-600",
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-40 rounded-lg bg-black/[0.06]" />
            <div className="mt-3 h-4 w-64 rounded bg-black/[0.05]" />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-32 rounded-3xl bg-black/[0.04]" />
              ))}
            </div>

            <div className="mt-6 h-96 rounded-3xl bg-black/[0.04]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <div className="mx-auto flex min-h-screen max-w-xl items-center justify-center px-5">
          <div className="w-full rounded-[2rem] border border-black/[0.07] bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <XCircle className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-xl font-bold">Unable to load dashboard</h1>

            <p className="mt-2 text-sm text-black/45">
              {error || "Something went wrong."}
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { stats, recentUrls, topUrls } = dashboard;

  return (
    <div className="min-h-screen bg-[#fafafa] text-black">
      {/* Header */}

      <header className="sticky top-0 z-40 border-b border-black/[0.06] bg-[#fafafa]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div>
            <h1 className="text-xl font-bold tracking-[-0.03em]">Dashboard</h1>

            <p className="mt-0.5 text-xs text-black/40">
              Your LinkForge overview
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-black/[0.07]
                bg-white
                text-black/50
                transition
                hover:text-black
                disabled:opacity-50
              "
              title="Refresh dashboard"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={() => navigate("/settings")}
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                border
                border-black/[0.07]
                bg-white
                text-black/50
                transition
                hover:text-black
              "
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate("/create")}
              className="
                hidden
                h-10
                items-center
                gap-2
                rounded-full
                bg-black
                px-5
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-black/85
                sm:flex
              "
            >
              <Plus className="h-4 w-4" />
              Create link
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        {/* Mobile create button */}

        <button
          type="button"
          onClick={() => navigate("/create")}
          className="
            mb-6
            flex
            h-12
            w-full
            items-center
            justify-center
            gap-2
            rounded-2xl
            bg-black
            text-sm
            font-semibold
            text-white
            sm:hidden
          "
        >
          <Plus className="h-4 w-4" />
          Create link
        </button>

        {/* Stats */}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total links"
            value={stats.totalUrls}
            description="Links you've created"
            icon={<Link2 className="h-5 w-5" />}
          />

          <StatCard
            title="Active links"
            value={stats.activeUrls}
            description="Currently available"
            icon={<Activity className="h-5 w-5" />}
          />

          <StatCard
            title="Total clicks"
            value={stats.totalClicks}
            description="All-time visits"
            icon={<MousePointerClick className="h-5 w-5" />}
          />

          <StatCard
            title="Expired"
            value={stats.expiredUrls}
            description="Links past expiration"
            icon={<Unplug className="h-5 w-5" />}
          />
        </section>

        {/* Secondary stats */}

        <div className="mt-4 flex flex-wrap gap-3">
          <MiniStat
            icon={<Check className="h-3.5 w-3.5" />}
            label="Active"
            value={stats.activeUrls}
          />

          <MiniStat
            icon={<XCircle className="h-3.5 w-3.5" />}
            label="Inactive"
            value={stats.inactiveUrls}
          />

          <MiniStat
            icon={<Trash2 className="h-3.5 w-3.5" />}
            label="Deleted"
            value={stats.deletedUrls}
          />
        </div>

        {/* Main content */}

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* Recent URLs */}

          <section className="overflow-hidden rounded-[2rem] border border-black/[0.07] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.025)]">
            <div className="flex items-center justify-between border-b border-black/[0.06] px-6 py-5 sm:px-7">
              <div>
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-black/40" />
                  <h2 className="font-bold">Recent links</h2>
                </div>

                <p className="mt-1 text-xs text-black/40">
                  Your latest shortened URLs
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate("/urls")}
                className="flex items-center gap-1 text-xs font-semibold text-black/45 transition hover:text-black"
              >
                View all
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {recentUrls.length === 0 ? (
              <EmptyState
                title="No links yet"
                description="Create your first short link to see it here."
                onCreate={() => navigate("/create")}
              />
            ) : (
              <div className="divide-y divide-black/[0.05]">
                {recentUrls.map((url) => {
                  const status = getStatus(url);

                  return (
                    <UrlRow
                      key={url._id ?? url.id ?? url.shortCode}
                      url={url}
                      status={status}
                      copiedCode={copiedCode}
                      onCopy={handleCopy}
                      getShortUrl={getShortUrl}
                      getDomain={getDomain}
                      formatDate={formatDate}
                    />
                  );
                })}
              </div>
            )}
          </section>

          {/* Top URLs */}

          <section className="overflow-hidden rounded-[2rem] border border-black/[0.07] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.025)]">
            <div className="border-b border-black/[0.06] px-6 py-5 sm:px-7">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-black/40" />
                <h2 className="font-bold">Top performing</h2>
              </div>

              <p className="mt-1 text-xs text-black/40">
                Your most clicked links
              </p>
            </div>

            {topUrls.length === 0 ? (
              <EmptyState
                title="No analytics yet"
                description="Your most clicked links will appear here."
                onCreate={() => navigate("/create")}
              />
            ) : (
              <div className="divide-y divide-black/[0.05]">
                {topUrls.map((url, index) => (
                  <div
                    key={url._id ?? url.id ?? url.shortCode}
                    className="flex items-center gap-4 px-6 py-5 sm:px-7"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] text-xs font-bold text-black/40">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {url.shortCode}
                      </p>

                      <p className="mt-1 truncate text-xs text-black/35">
                        {getDomain(url.originalUrl)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-sm font-bold">
                        {url.clicks.toLocaleString()}
                      </p>

                      <p className="mt-1 text-[10px] uppercase tracking-wider text-black/30">
                        clicks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Analytics summary */}

        <section className="mt-6 rounded-[2rem] border border-black/[0.07] bg-black p-6 text-white sm:p-7">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-white/50" />
                <p className="text-sm font-semibold text-white/60">
                  Link performance
                </p>
              </div>

              <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em]">
                {stats.totalClicks.toLocaleString()} total clicks
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Across {stats.totalUrls.toLocaleString()} links
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/analytics")}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-full
                bg-white
                px-5
                py-2.5
                text-sm
                font-semibold
                text-black
                transition
                hover:bg-white/90
              "
            >
              View analytics
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Components                                                                  */
/* -------------------------------------------------------------------------- */

type StatCardProps = {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
};

const StatCard = ({ title, value, description, icon }: StatCardProps) => {
  return (
    <div className="rounded-[1.75rem] border border-black/[0.07] bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.025)]">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/[0.04] text-black/50">
          {icon}
        </div>

        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/25">
          LinkForge
        </span>
      </div>

      <p className="mt-6 text-xs font-medium text-black/40">{title}</p>

      <p className="mt-1 text-3xl font-bold tracking-[-0.04em]">
        {value.toLocaleString()}
      </p>

      <p className="mt-1 text-xs text-black/30">{description}</p>
    </div>
  );
};

type MiniStatProps = {
  icon: React.ReactNode;
  label: string;
  value: number;
};

const MiniStat = ({ icon, label, value }: MiniStatProps) => {
  return (
    <div className="flex items-center gap-2 rounded-full border border-black/[0.06] bg-white px-3.5 py-2 text-xs">
      <span className="text-black/35">{icon}</span>
      <span className="text-black/45">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
};

type UrlRowProps = {
  url: DashboardUrl;
  status: {
    label: string;
    className: string;
  };
  copiedCode: string | null;
  onCopy: (shortCode: string) => void;
  getShortUrl: (shortCode: string) => string;
  getDomain: (url: string) => string;
  formatDate: (date: string) => string;
};

const UrlRow = ({
  url,
  status,
  copiedCode,
  onCopy,
  getShortUrl,
  getDomain,
  formatDate,
}: UrlRowProps) => {
  return (
    <div className="group px-6 py-5 transition hover:bg-black/[0.012] sm:px-7">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/[0.04] text-black/40">
          <Link2 className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="max-w-[260px] truncate text-sm font-semibold">
              {url.shortCode}
            </p>

            <span
              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          <p className="mt-1 truncate text-xs text-black/35">
            {getDomain(url.originalUrl)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-black/30">
            <span>
              {url.clicks.toLocaleString()}{" "}
              {url.clicks === 1 ? "click" : "clicks"}
            </span>

            <span>Created {formatDate(url.createdAt)}</span>

            {url.expiresAt && <span>Expires {formatDate(url.expiresAt)}</span>}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onCopy(url.shortCode)}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-black/30
              transition
              hover:bg-black/[0.05]
              hover:text-black
            "
            title="Copy short URL"
          >
            {copiedCode === url.shortCode ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}
          </button>

          <a
            href={getShortUrl(url.shortCode)}
            target="_blank"
            rel="noreferrer"
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-xl
              text-black/30
              transition
              hover:bg-black/[0.05]
              hover:text-black
            "
            title="Open short URL"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

type EmptyStateProps = {
  title: string;
  description: string;
  onCreate: () => void;
};

const EmptyState = ({ title, description, onCreate }: EmptyStateProps) => {
  return (
    <div className="flex min-h-65 flex-col items-center justify-center px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/[0.04] text-black/30">
        <Link2 className="h-5 w-5" />
      </div>

      <h3 className="mt-4 text-sm font-bold">{title}</h3>

      <p className="mt-1 max-w-xs text-xs leading-5 text-black/35">
        {description}
      </p>

      <button
        type="button"
        onClick={onCreate}
        className="mt-5 flex items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white"
      >
        <Plus className="h-3.5 w-3.5" />
        Create link
      </button>
    </div>
  );
};
