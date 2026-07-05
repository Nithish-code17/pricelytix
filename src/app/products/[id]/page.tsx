import PriceHistoryChart from "@/components/price-history-chart";
import SidebarNav from "@/components/sidebar-nav";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

type ProductDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

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

export default async function ProductDetailsPage({
  params,
}: ProductDetailsPageProps) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const tracker = await prisma.tracker.findFirst({
    where: {
      productId: id,
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
    },
  });

  if (!tracker) {
    notFound();
  }

  const product = tracker.product;
  const history = product.priceHistory;

  const status = getPriceStatus(product.currentPrice, tracker.targetPrice);

  const prices = history.map((item) => item.price);
  const lowestPrice = prices.length ? Math.min(...prices) : null;
  const highestPrice = prices.length ? Math.max(...prices) : null;
  const latestChecked = history.length ? history[0].createdAt : null;

  // Generate dynamic AI price insight
  const insight = (() => {
    if (product.currentPrice === null) {
      return {
        summary: "E-commerce price data is currently unavailable for this item. Please trigger a manual price refresh to inspect.",
        recommendation: "WAIT AND REFRESH LATER",
        recommendationClass: "bg-[#111827] text-[#9ca3af] border border-[#1f2937]",
        confidence: "Low",
        confidenceClass: "text-[#6b7280]",
      };
    }

    if (product.currentPrice <= tracker.targetPrice) {
      return {
        summary: `Excellent! The current price of ₹${product.currentPrice.toLocaleString()} has met your target threshold of ₹${tracker.targetPrice.toLocaleString()}. This represents an optimal purchasing opportunity.`,
        recommendation: "BUY NOW",
        recommendationClass: "bg-[#059669]/15 text-[#10b981] border border-[#059669]/30 font-semibold",
        confidence: "High",
        confidenceClass: "text-[#10b981]",
      };
    }

    const diff = product.currentPrice - tracker.targetPrice;
    const percentage = Math.round((diff / tracker.targetPrice) * 100);

    if (percentage <= 10) {
      return {
        summary: `The product is highly competitive, currently sitting at ₹${product.currentPrice.toLocaleString()} which is only ${percentage}% above your target of ₹${tracker.targetPrice.toLocaleString()}. Spot deals or coupons could make this a buy today.`,
        recommendation: "WATCH CLOSELY",
        recommendationClass: "bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30 font-semibold",
        confidence: "Medium",
        confidenceClass: "text-[#f59e0b]",
      };
    }

    return {
      summary: `The item is currently priced at ₹${product.currentPrice.toLocaleString()} which is ${percentage}% above your target of ₹${tracker.targetPrice.toLocaleString()}. We suggest waiting for additional price drops or flash sales.`,
      recommendation: "WAIT",
      recommendationClass: "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30 font-semibold",
      confidence: "High",
      confidenceClass: "text-[#10b981]",
    };
  })();

  return (
    <div className="min-h-screen bg-[#000000] text-white flex">
      {/* Sidebar Navigation */}
      <SidebarNav user={session.user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#1f2937] bg-[#0b0f19] px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="text-base font-bold text-white tracking-tight truncate">
              {product.title}
            </h1>
            <span className="text-xs text-[#6b7280]">|</span>
            <span className="text-xs font-mono text-[#9ca3af] uppercase">{product.store || "Unknown"}</span>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-md bg-[#111827] px-3 py-1.5 text-xs font-medium text-[#9ca3af] border border-[#1f2937] hover:bg-[#1f2937] hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-6 md:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Main Info Box */}
          <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2937] pb-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#06b6d4]">
                  Product Analytics Profile
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">{product.title}</h2>
                <a
                  href={product.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-[#6b7280] hover:text-[#06b6d4] transition-colors truncate block max-w-2xl mt-1"
                >
                  {product.url} ↗
                </a>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded bg-[#111827] px-2.5 py-1 text-xs font-semibold text-[#9ca3af] border border-[#1f2937]">
                  {product.store || "Unknown Store"}
                </span>

                <span className={`rounded px-2.5 py-1 text-xs ${status.className}`}>
                  {status.label}
                </span>
              </div>
            </div>

            {/* Metric KPI Grid */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-6 text-xs">
              <div className="rounded border border-[#1f2937] bg-[#000000]/40 p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Current Price</span>
                <p className="text-base font-bold text-white mt-1">
                  {product.currentPrice ? `₹${product.currentPrice.toLocaleString()}` : "Unavailable"}
                </p>
              </div>

              <div className="rounded border border-[#1f2937] bg-[#000000]/40 p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Target Price</span>
                <p className="text-base font-bold text-[#06b6d4] mt-1">
                  ₹{tracker.targetPrice.toLocaleString()}
                </p>
              </div>

              <div className="rounded border border-[#1f2937] bg-[#000000]/40 p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Lowest Price</span>
                <p className="text-base font-bold text-[#10b981] mt-1">
                  {lowestPrice ? `₹${lowestPrice.toLocaleString()}` : "No data"}
                </p>
              </div>

              <div className="rounded border border-[#1f2937] bg-[#000000]/40 p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Highest Price</span>
                <p className="text-base font-bold text-[#ef4444] mt-1">
                  {highestPrice ? `₹${highestPrice.toLocaleString()}` : "No data"}
                </p>
              </div>

              <div className="rounded border border-[#1f2937] bg-[#000000]/40 p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Total Checks</span>
                <p className="text-base font-bold text-white mt-1">
                  {history.length}
                </p>
              </div>

              <div className="rounded border border-[#1f2937] bg-[#000000]/40 p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">Last Scraped</span>
                <p className="text-xs font-mono text-[#9ca3af] mt-1">
                  {latestChecked ? new Date(latestChecked).toLocaleString() : "No data"}
                </p>
              </div>
            </div>
          </div>

          {/* AI Price Insight Card */}
          <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 rounded bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center border border-[#2563eb]/20">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">AI Price Insight</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[#6b7280] font-semibold uppercase">Confidence:</span>
                <span className={`text-[10px] font-mono font-bold uppercase ${insight.confidenceClass}`}>
                  {insight.confidence}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs text-[#9ca3af] leading-relaxed">
                  {insight.summary}
                </p>
              </div>

              <div className="shrink-0">
                <span className={`px-3 py-1.5 text-xs rounded uppercase tracking-wider ${insight.recommendationClass}`}>
                  {insight.recommendation}
                </span>
              </div>
            </div>
          </div>

          {/* Recharts Price History Chart */}
          <PriceHistoryChart history={history} />

          {/* Price History Table */}
          <div className="rounded-lg border border-[#1f2937] bg-[#0b0f19] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2937] pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Price Scrape Audit Trail</h3>
              <span className="text-xs text-[#6b7280]">Ordered chronologically (Latest first)</span>
            </div>

            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-xs text-[#6b7280] py-4 text-center">No price history available yet.</p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded border border-[#1f2937]/80 bg-[#000000]/30 p-3 text-xs"
                  >
                    <div>
                      <span className="text-[10px] text-[#6b7280] uppercase block">Scraped At</span>
                      <span className="font-mono text-[#9ca3af]">{new Date(item.createdAt).toLocaleString()}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-[#6b7280] uppercase block">Recorded Price</span>
                      <span className="text-sm font-bold text-white">₹{item.price.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}