"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutButton from "./logout-button";

type UserProfile = {
  name?: string | null;
  email: string;
};

type SidebarNavProps = {
  user?: UserProfile;
};

export default function SidebarNav({ user: initialUser }: SidebarNavProps) {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | undefined>(initialUser);

  useEffect(() => {
    if (initialUser) {
      setCurrentUser(initialUser);
      return;
    }

    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setCurrentUser(data.user);
          }
        }
      } catch (e) {
        // Silent error
      }
    }

    fetchUser();
  }, [initialUser]);

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
    },
    {
      label: "Add Product",
      href: "/add-product",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      label: "AI Assistant",
      href: "/ai-assistant",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      label: "Notifications",
      href: "/dashboard#alerts",
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-[#1f2937] bg-[#0b0f19] flex flex-col justify-between hidden md:flex min-h-screen sticky top-0 h-screen">
      {/* Top Section */}
      <div>
        {/* Logo */}
        <div className="p-5 border-b border-[#1f2937]/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2563eb] text-white shadow-sm">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-base font-bold tracking-tight text-white">
              Pricelytix<span className="text-[#06b6d4]">.</span>
            </span>
          </Link>
          <span className="text-[10px] font-semibold tracking-wider text-[#9ca3af] uppercase bg-[#1f2937]/60 px-2 py-0.5 rounded">
            v1.0
          </span>
        </div>

        {/* Navigation Items */}
        <div className="p-3 space-y-1">
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6b7280]">
            Platform Navigation
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[#2563eb] text-white"
                    : "text-[#9ca3af] hover:text-white hover:bg-[#1f2937]/50"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bottom User / Status */}
      <div className="p-3 border-t border-[#1f2937]/80 space-y-2">
        {currentUser ? (
          <div className="p-2.5 rounded-md bg-[#000000]/40 border border-[#1f2937] space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-[#2563eb]/20 text-[#2563eb] border border-[#2563eb]/30 flex items-center justify-center text-xs font-bold shrink-0">
                {(currentUser.name || currentUser.email)[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser.name || "User"}
                </p>
                <p className="text-[10px] text-[#6b7280] truncate">{currentUser.email}</p>
              </div>
            </div>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-md bg-[#000000]/40 border border-[#1f2937]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
              </span>
              <span className="text-xs font-medium text-[#9ca3af]">Scraper Active</span>
            </div>
            <span className="text-[10px] font-mono text-[#6b7280]">SQLite</span>
          </div>
        )}
      </div>
    </aside>
  );
}
