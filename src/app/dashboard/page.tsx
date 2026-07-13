import DeleteProductButton from "@/components/delete-product-button";
import EditTargetPrice from "@/components/edit-target-price";
import MarkNotificationReadButton from "@/components/mark-notification-read-button";
import RefreshAllButton from "@/components/refresh-all-button";
import RefreshPriceButton from "@/components/refresh-price-button";
import SidebarNav from "@/components/sidebar-nav";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatISTDateTime, formatISTTime } from "@/lib/format-date";

function getPriceStatus(currentPrice: number | null, targetPrice: number) {
  if (currentPrice === null) {
    return {
      label: "Price Unavailable",
      className: "bg-[#111827] text-[#9ca3af] border border-[#1f2937]",
    };
  }

  if (currentPrice <= targetPrice) {
    return {
      label: "Below Target",
      className: "bg-[#059669]/15 text-[#10b981] border border-[#059669]/30 font-semibold",
    };
  }

  return {
    label: "Above Target",
    className: "bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30",
  };
}

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const trackers = await prisma.tracker.findMany({
    where: {
      userId: session.userId,
    },
    include: {
      product: {
        include: {
          priceHistory: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      },
      notifications: {
        where: {
          isRead: false,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const unreadCount = trackers.reduce((acc, t) => acc + t.notifications.length, 0);
  const priceDropCount = trackers.filter(
    (t) => t.product.currentPrice !== null && t.product.currentPrice <= t.targetPrice
  ).length;

  const latestCheckDates = trackers
    .map((t) => (t.product.priceHistory[0] ? new Date(t.product.priceHistory[0].createdAt).getTime() : 0))
    .filter((d) => d > 0);
  const lastUpdated = latestCheckDates.length
    ? formatISTTime(new Date(Math.max(...latestCheckDates)))
    : "Never";

  return (
    <div className="min-h-screen bg-[#000000] text-white flex">
      {/* Sidebar Navigation */}
      <SidebarNav user={session.user} />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top App Header */}
        <header className="h-16 border-b border-[#1f2937] bg-[#0b0f19] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-white tracking-tight">System Dashboard</h1>
            <span className="hidden sm:inline-block text-xs text-[#6b7280]">|</span>
            <span className="hidden sm:inline-block text-xs text-[#9ca3af]">Enterprise Price Intelligence</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/add-product"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-colors cursor-pointer border border-[#2563eb]"
            >
              + Add Product
            </Link>
            <RefreshAllButton />
          </div>
        </header>

        {/* Main Content Body */}
        <main className="flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Header Description */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2937] pb-5">
            <div>
              <h2 className="text-xl font-bold text-white">Tracked Inventory & Price Alerts</h2>
              <p className="text-xs text-[#9ca3af] mt-1">
                Real-time scraping status, target triggers, and automated price monitoring for <span className="font-semibold text-white">{session.user.email}</span>.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-[#9ca3af] bg-[#0b0f19] border border-[#1f2937] px-3 py-1.5 rounded-md">
              <span className="h-2 w-2 rounded-full bg-[#10b981] animate-pulse" />
              Auto Scraper: Running
            </div>
          </div>

          {/* KPI Summary Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">Total Trackers</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-white">{trackers.length}</span>
                <span className="text-xs font-semibold text-[#2563eb] bg-[#2563eb]/10 px-2 py-0.5 rounded border border-[#2563eb]/20">
                  Active
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">Price Drops</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[#10b981]">{priceDropCount}</span>
                <span className="text-xs font-semibold text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded border border-[#10b981]/20">
                  Target Met
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">Unread Notifications</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[#f59e0b]">{unreadCount}</span>
                <span className="text-xs font-semibold text-[#f59e0b] bg-[#f59e0b]/10 px-2 py-0.5 rounded border border-[#f59e0b]/20">
                  Alerts
                </span>
              </div>
            </div>

            <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6b7280]">Last Scraped</p>
              <div className="mt-2 flex items-baseline justify-between">
                <span className="text-lg font-bold font-mono text-[#06b6d4]">{lastUpdated}</span>
                <span className="text-[10px] font-mono text-[#6b7280]">Live Sync</span>
              </div>
            </div>
          </div>

          {/* AI Portfolio Insight Card */}
          {(() => {
            const closeCount = trackers.filter((t) => {
              if (t.product.currentPrice === null) return false;
              const diff = t.product.currentPrice - t.targetPrice;
              return diff > 0 && (diff / t.targetPrice) * 100 <= 10;
            }).length;

            const portfolioInsight = (() => {
              if (trackers.length === 0) {
                return {
                  summary: "No products are currently being tracked under your account.",
                  recommendation: "Use the 'Add Product' tab to submit a URL and initialize tracking.",
                };
              }
              if (priceDropCount > 0) {
                return {
                  summary: `Currently, ${priceDropCount} out of ${trackers.length} tracked products have dropped below or met your target thresholds.`,
                  recommendation: `Target Met: ${priceDropCount} items are in target buying range. Check notifications below.`,
                };
              }
              if (closeCount > 0) {
                return {
                  summary: `All tracked items are above target, but ${closeCount} product(s) are close (within 10%) to your target price.`,
                  recommendation: `Watch Closely: ${closeCount} items are near target. Run manual refresh before purchase decisions.`,
                };
              }
              return {
                summary: `All ${trackers.length} items are currently above target thresholds.`,
                recommendation: "Prices are stable. Wait for automated scheduled refresh cycles to fetch lower rates.",
              };
            })();

            return (
              <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 rounded bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center border border-[#2563eb]/20">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">AI Portfolio Insight</h3>
                  </div>
                  <span className="rounded bg-[#06b6d4]/10 px-2 py-0.5 text-[10px] font-semibold text-[#06b6d4] border border-[#06b6d4]/20 uppercase">
                    Portfolio Status
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-[#9ca3af]">
                    <strong className="text-white">Analysis:</strong> {portfolioInsight.summary}
                  </p>
                  <p className="text-xs text-[#10b981] font-medium mt-1">
                    <strong className="text-white">Recommendation:</strong> {portfolioInsight.recommendation}
                  </p>
                </div>
              </div>
            );
          })()}

          {/* Global Unread Alert Banner */}
          {unreadCount > 0 && (
            <div id="alerts" className="rounded-lg border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#f59e0b]" />
                </span>
                <p className="text-xs font-semibold text-[#f59e0b]">
                  Price Alert: {unreadCount} product(s) currently meet or fall below your configured target price.
                </p>
              </div>
            </div>
          )}

          {/* Data Table / List Rows Container */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9ca3af]">
                Product Inventory ({trackers.length})
              </h3>
            </div>

            {trackers.length === 0 ? (
              <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-10 text-center">
                <p className="text-sm font-semibold text-white">No product trackers initialized yet.</p>
                <p className="mt-1 text-xs text-[#9ca3af]">Add a product URL from Amazon or Flipkart to begin automated price tracking.</p>
                <Link
                  href="/add-product"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-[#2563eb] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
                >
                  + Add Product Tracker
                </Link>
              </div>
            ) : (
              trackers.map((tracker) => {
                const status = getPriceStatus(
                  tracker.product.currentPrice,
                  tracker.targetPrice
                );

                const historyCount = tracker.product.priceHistory.length;
                const latestHistory = tracker.product.priceHistory[0];

                return (
                  <div
                    key={tracker.id}
                    className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-4 hover:border-[#273142] transition-colors space-y-3"
                  >
                    {/* Top Row: Title, URL, Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2937]/60 pb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {tracker.product.title}
                          </h4>
                          <span className="text-[10px] font-semibold text-[#9ca3af] bg-[#111827] border border-[#1f2937] px-2 py-0.5 rounded">
                            {tracker.product.store || "Unknown"}
                          </span>
                        </div>
                        <a
                          href={tracker.product.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-mono text-[#6b7280] hover:text-[#06b6d4] truncate block max-w-2xl mt-0.5"
                        >
                          {tracker.product.url}
                        </a>
                      </div>

                      <div className="shrink-0">
                        <span className={`px-2.5 py-1 text-xs rounded ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Scanned Metrics */}
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 text-xs">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Current Price</span>
                        <p className="text-sm font-bold text-white mt-0.5">
                          {tracker.product.currentPrice
                            ? `₹${tracker.product.currentPrice.toLocaleString()}`
                            : "Unavailable"}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Target Price</span>
                        <p className="text-sm font-bold text-[#06b6d4] mt-0.5">
                          ₹{tracker.targetPrice.toLocaleString()}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">History Logs</span>
                        <p className="text-xs font-medium text-[#9ca3af] mt-0.5">
                          {historyCount} records
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Last Scraped</span>
                        <p className="text-xs font-mono text-[#9ca3af] mt-0.5">
                          {latestHistory
                            ? formatISTDateTime(latestHistory.createdAt)
                            : "No history"}
                        </p>
                      </div>
                    </div>

                    {/* Unread Alert Card if Target Met */}
                    {tracker.notifications.length > 0 && (
                      <div className="rounded border border-[#f59e0b]/30 bg-[#f59e0b]/10 p-2.5 text-xs text-[#f59e0b] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{tracker.notifications[0].message}</span>
                        </div>
                        <MarkNotificationReadButton notificationId={tracker.notifications[0].id} />
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <RefreshPriceButton productId={tracker.product.id} />
                        <EditTargetPrice
                          trackerId={tracker.id}
                          currentTargetPrice={tracker.targetPrice}
                        />
                        <DeleteProductButton productId={tracker.product.id} />
                      </div>

                      <Link
                        href={`/products/${tracker.product.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563eb] hover:text-[#3b82f6] hover:underline"
                      >
                        View Details & Trend →
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}