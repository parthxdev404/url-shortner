import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Globe,
  Globe2,
  Laptop,
  Monitor,
  MousePointerClick,
  RefreshCw,
  Smartphone,
  Tablet,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  analyticsService,
  type AnalyticsOverview,
  type StatItem,
  type TimelineItem,
} from "../../services/analyticService";

const formatNumber = (value: number | null | undefined) => {
  return (value ?? 0).toLocaleString();
};

const formatDate = (date: string | null) => {
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

/* =========================================================
   ANALYTICS PAGE
========================================================= */

export const AnalyticsPage = () => {
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);

  const [browserStats, setBrowserStats] = useState<StatItem[]>([]);
  const [osStats, setOSStats] = useState<StatItem[]>([]);
  const [deviceStats, setDeviceStats] = useState<StatItem[]>([]);
  const [referrerStats, setReferrerStats] = useState<StatItem[]>([]);
  const [countryStats, setCountryStats] = useState<StatItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /* =======================================================
     FETCH ANALYTICS
  ======================================================= */

  const fetchAnalytics = useCallback(
    async (silent = false) => {
      /*
       * /analytics doesn't contain a URL id.
       *
       * The detailed analytics page requires:
       * /urls/:id/analytics
       */
      if (!id) {
        setOverview(null);
        setTimeline([]);
        setBrowserStats([]);
        setOSStats([]);
        setDeviceStats([]);
        setReferrerStats([]);
        setCountryStats([]);

        setError("No URL was selected. Open analytics from a specific URL.");

        setLoading(false);
        setRefreshing(false);

        return;
      }

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        const [
          overviewResponse,
          timelineResponse,
          browserResponse,
          osResponse,
          deviceResponse,
          referrerResponse,
          countryResponse,
        ] = await Promise.all([
          analyticsService.getOverview(id),
          analyticsService.getTimeline(id),
          analyticsService.getBrowserStats(id),
          analyticsService.getOSStats(id),
          analyticsService.getDeviceStats(id),
          analyticsService.getReferrerStats(id),
          analyticsService.getCountryStats(id),
        ]);

        /*
         * OVERVIEW
         */

        if (!overviewResponse.success) {
          throw new Error(
            overviewResponse.message || "Unable to load analytics overview.",
          );
        }

        setOverview(overviewResponse.data);

        /*
         * TIMELINE
         */

        if (timelineResponse.success) {
          setTimeline(timelineResponse.data ?? []);
        } else {
          setTimeline([]);
        }

        /*
         * BROWSER
         */

        if (browserResponse.success) {
          setBrowserStats(browserResponse.data ?? []);
        } else {
          setBrowserStats([]);
        }

        /*
         * OS
         */

        if (osResponse.success) {
          setOSStats(osResponse.data ?? []);
        } else {
          setOSStats([]);
        }

        /*
         * DEVICE
         */

        if (deviceResponse.success) {
          setDeviceStats(deviceResponse.data ?? []);
        } else {
          setDeviceStats([]);
        }

        /*
         * REFERRER
         */

        if (referrerResponse.success) {
          setReferrerStats(referrerResponse.data ?? []);
        } else {
          setReferrerStats([]);
        }

        /*
         * COUNTRY
         */

        if (countryResponse.success) {
          setCountryStats(countryResponse.data ?? []);
        } else {
          setCountryStats([]);
        }
      } catch (err) {
        console.error("Analytics fetch failed:", err);

        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Unable to load analytics.");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id],
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    void fetchAnalytics();
  }, [fetchAnalytics]);

  /* =======================================================
     SYNC WITH URL CHANGES
  ======================================================= */

  useEffect(() => {
    const handleUrlsChanged = () => {
      void fetchAnalytics(true);
    };

    window.addEventListener("urls:changed", handleUrlsChanged);

    return () => {
      window.removeEventListener("urls:changed", handleUrlsChanged);
    };
  }, [fetchAnalytics]);

  /* =======================================================
     REFRESH WHEN TAB BECOMES ACTIVE
  ======================================================= */

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchAnalytics(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchAnalytics]);

  /* =======================================================
     FORMATTED TIMELINE
  ======================================================= */

  const formattedTimeline = useMemo(() => {
    return timeline.map((item) => ({
      ...item,
      label: new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
      }).format(new Date(item.date)),
    }));
  }, [timeline]);

  /* =======================================================
     NO URL ID
  ======================================================= */

  if (!id) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-2xl border border-zinc-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100">
              <BarChart3 size={22} className="text-zinc-500" />
            </div>

            <h1 className="mt-5 text-xl font-semibold text-zinc-950 sm:text-2xl">
              Select a URL
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Analytics are available for individual short URLs. Open analytics
              from the URLs page to view detailed performance data.
            </p>

            <button
              type="button"
              onClick={() => navigate("/urls")}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 sm:w-auto"
            >
              <ArrowLeft size={16} />
              Back to URLs
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     INITIAL LOADING
  ======================================================= */

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  /* =======================================================
     FULL PAGE ERROR
  ======================================================= */

  if (error && !overview) {
    return (
      <div className="min-h-screen bg-zinc-50 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <BarChart3 size={22} className="text-red-500" />
            </div>

            <h1 className="mt-5 text-xl font-semibold text-zinc-950 sm:text-2xl">
              Unable to load analytics
            </h1>

            <p className="mt-2 text-sm leading-6 text-zinc-500">{error}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => navigate("/urls")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50"
              >
                <ArrowLeft size={16} />
                Back to URLs
              </button>

              <button
                type="button"
                onClick={() => void fetchAnalytics()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-zinc-50 px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 flex flex-col gap-5 sm:mb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <button
              type="button"
              onClick={() => navigate("/urls")}
              className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-950"
            >
              <ArrowLeft size={16} />
              Back to URLs
            </button>

            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 sm:text-xs">
              URL Analytics
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl lg:text-4xl">
              Analytics
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-500">
              Understand how your short URL is performing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void fetchAnalytics(true)}
            disabled={refreshing}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        {/* =================================================
            OVERVIEW CARDS
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<MousePointerClick size={18} />}
            label="Total Clicks"
            value={formatNumber(overview?.totalClicks)}
          />

          <StatCard
            icon={<Users size={18} />}
            label="Unique Visitors"
            value={formatNumber(overview?.uniqueVisitors)}
          />

          <StatCard
            icon={<Globe size={18} />}
            label="Top Browser"
            value={overview?.topBrowser || "Unknown"}
          />

          <StatCard
            icon={<Monitor size={18} />}
            label="Top OS"
            value={overview?.topOS || "Unknown"}
          />
        </div>

        {/* =================================================
            LAST CLICK
        ================================================= */}

        <div className="mt-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm sm:px-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium text-zinc-500">
              Last clicked
            </span>

            <span className="text-sm font-semibold text-zinc-950">
              {formatDate(overview?.lastClicked ?? null)}
            </span>
          </div>
        </div>

        {/* =================================================
            TIMELINE
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-zinc-950">
              Clicks over time
            </h2>

            <p className="mt-1 text-sm leading-6 text-zinc-500">
              Track how your URL traffic changes over time.
            </p>
          </div>

          {formattedTimeline.length === 0 ? (
            <EmptyState text="No click data available yet." />
          ) : (
            <div className="h-[260px] w-full sm:h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={formattedTimeline}
                  margin={{
                    top: 5,
                    right: 5,
                    left: -15,
                    bottom: 0,
                  }}
                >
                  <defs>
                    <linearGradient
                      id="clickGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopOpacity={0.2} />

                      <stop offset="95%" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} />

                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                    minTickGap={20}
                  />

                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                    fontSize={11}
                    width={35}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e4e4e7",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="clicks"
                    strokeWidth={2}
                    fill="url(#clickGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* =================================================
            BREAKDOWN
        ================================================= */}

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <AnalyticsList
            title="Browsers"
            icon={<Globe size={18} />}
            items={browserStats}
          />

          <AnalyticsList
            title="Operating Systems"
            icon={<Monitor size={18} />}
            items={osStats}
          />

          <AnalyticsList
            title="Devices"
            icon={<Laptop size={18} />}
            items={deviceStats}
          />

          <AnalyticsList
            title="Referrers"
            icon={<Globe2 size={18} />}
            items={referrerStats}
          />

          <AnalyticsList
            title="Countries"
            icon={<Globe2 size={18} />}
            items={countryStats}
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   STAT CARD
========================================================= */

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const StatCard = ({ icon, label, value }: StatCardProps) => {
  return (
    <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
          {icon}
        </div>

        <span className="truncate text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400 sm:text-xs">
          Analytics
        </span>
      </div>

      <p className="mt-5 text-sm text-zinc-500">{label}</p>

      <p
        className="mt-1 truncate text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl"
        title={value}
      >
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   ANALYTICS LIST
========================================================= */

type AnalyticsListProps = {
  title: string;
  icon: React.ReactNode;
  items: StatItem[];
};

const AnalyticsList = ({ title, icon, items }: AnalyticsListProps) => {
  /*
   * IMPORTANT:
   *
   * Backend returns:
   *
   * {
   *   name: string,
   *   count: number
   * }
   *
   * Therefore we use item.count.
   */

  const total = items.reduce((sum, item) => sum + (item.count ?? 0), 0);

  return (
    <section className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-zinc-950">
            {title}
          </h2>

          <p className="text-xs text-zinc-400">
            {items.length} {items.length === 1 ? "entry" : "entries"}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <EmptyState text={`No ${title.toLowerCase()} data available.`} />
      ) : (
        <div className="space-y-4">
          {items.slice(0, 8).map((item) => {
            const count = item.count ?? 0;

            const percentage = total > 0 ? (count / total) * 100 : 0;

            return (
              <div key={`${title}-${item.name}`} className="min-w-0">
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span
                    className="min-w-0 truncate text-sm font-medium text-zinc-700"
                    title={item.name || "Unknown"}
                  >
                    {item.name || "Unknown"}
                  </span>

                  <span className="shrink-0 text-sm font-semibold text-zinc-950">
                    {count.toLocaleString()}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                  <div
                    className="h-full rounded-full bg-zinc-900 transition-all duration-500"
                    style={{
                      width: `${Math.min(Math.max(percentage, 0), 100)}%`,
                    }}
                  />
                </div>

                <p className="mt-1 text-right text-[11px] text-zinc-400">
                  {percentage.toFixed(1)}%
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyState = ({ text }: { text: string }) => {
  return (
    <div className="flex min-h-32 items-center justify-center px-2 text-center">
      <div>
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
          <BarChart3 size={17} className="text-zinc-400" />
        </div>

        <p className="mt-3 text-sm leading-6 text-zinc-500">{text}</p>
      </div>
    </div>
  );
};

/* =========================================================
   LOADING SKELETON
========================================================= */

const AnalyticsSkeleton = () => {
  return (
    <div className="min-h-screen bg-zinc-50 px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="animate-pulse">
          {/* Header */}

          <div className="h-4 w-32 rounded bg-zinc-200" />

          <div className="mt-5 h-9 w-48 rounded bg-zinc-200 sm:w-64" />

          <div className="mt-3 h-4 w-full max-w-xl rounded bg-zinc-200" />

          {/* Cards */}

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-32 rounded-2xl bg-zinc-200" />
            ))}
          </div>

          {/* Last click */}

          <div className="mt-4 h-16 rounded-2xl bg-zinc-200" />

          {/* Chart */}

          <div className="mt-6 h-[330px] rounded-2xl bg-zinc-200" />

          {/* Lists */}

          <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-64 rounded-2xl bg-zinc-200" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
