import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-between">
      {/* Top Header Navigation */}
      <header className="border-b border-[#1f2937] bg-[#0b0f19] px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#2563eb]">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span>Pricelytix<span className="text-[#06b6d4]">.</span></span>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-[#9ca3af] hover:text-white transition-colors px-3 py-1.5"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="text-xs font-semibold text-[#9ca3af] hover:text-white transition-colors px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/add-product"
              className="rounded-md bg-[#2563eb] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-colors border border-[#2563eb]"
            >
              Add Product
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="px-6 pt-16 pb-20 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md border border-[#1f2937] bg-[#0b0f19] px-3 py-1 text-xs font-medium text-[#06b6d4] mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
              Automated Price Monitoring & Target Alert Platform
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              Enterprise Price Tracking & Deal Intelligence
            </h1>

            <p className="mt-4 text-sm sm:text-base text-[#9ca3af] max-w-xl mx-auto leading-relaxed">
              Monitor product prices automatically across Amazon and Flipkart, set custom target price alerts, and visualize price movement history with clean analytics.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-md bg-[#2563eb] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1d4ed8] transition-colors border border-[#2563eb]"
              >
                Go to Dashboard
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                href="/add-product"
                className="inline-flex items-center gap-2 rounded-md bg-[#111827] px-5 py-2.5 text-xs font-semibold text-[#9ca3af] border border-[#1f2937] hover:bg-[#1f2937] hover:text-white transition-colors"
              >
                + Track New Product
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="px-6 py-12 border-t border-[#1f2937] bg-[#0b0f19]">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280] text-center mb-1">
              Core Capabilities
            </h2>
            <p className="text-lg font-bold text-center text-white mb-8">
              Reliable infrastructure for price intelligence
            </p>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-[#1f2937] bg-[#000000] p-5">
                <div className="h-8 w-8 rounded bg-[#2563eb]/10 text-[#2563eb] flex items-center justify-center mb-3 border border-[#2563eb]/20">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white">Multi-Store Scraping</h3>
                <p className="mt-1.5 text-xs text-[#9ca3af] leading-relaxed">
                  Extracts live e-commerce prices with automatic store detection for Amazon and Flipkart URLs.
                </p>
              </div>

              <div className="rounded-lg border border-[#1f2937] bg-[#000000] p-5">
                <div className="h-8 w-8 rounded bg-[#10b981]/10 text-[#10b981] flex items-center justify-center mb-3 border border-[#10b981]/20">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white">Target Price Notifications</h3>
                <p className="mt-1.5 text-xs text-[#9ca3af] leading-relaxed">
                  Generates dashboard alert cards and sends automated email notifications when prices hit target levels.
                </p>
              </div>

              <div className="rounded-lg border border-[#1f2937] bg-[#000000] p-5">
                <div className="h-8 w-8 rounded bg-[#06b6d4]/10 text-[#06b6d4] flex items-center justify-center mb-3 border border-[#06b6d4]/20">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <h3 className="text-sm font-bold text-white">Price History Logs</h3>
                <p className="mt-1.5 text-xs text-[#9ca3af] leading-relaxed">
                  Maintains detailed audit logs and renders interactive line charts for tracking price movement over time.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f2937] py-6 text-center text-xs text-[#6b7280]">
        <p>© {new Date().getFullYear()} Pricelytix Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}