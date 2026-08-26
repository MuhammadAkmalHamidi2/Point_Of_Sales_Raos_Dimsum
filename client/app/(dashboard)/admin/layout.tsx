"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const Icons = {
  Dashboard: ({ active }: { active: boolean }) => (
    <svg className={`w-5 h-5 ${active ? "text-[#E52424]" : "text-zinc-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Karyawan: ({ active }: { active: boolean }) => (
    <svg className={`w-5 h-5 ${active ? "text-[#E52424]" : "text-zinc-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Penjualan: ({ active }: { active: boolean }) => (
    <svg className={`w-5 h-5 ${active ? "text-[#E52424]" : "text-zinc-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Produk: ({ active }: { active: boolean }) => (
    <svg className={`w-5 h-5 ${active ? "text-[#E52424]" : "text-zinc-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
    Tenant: ({ active }: { active: boolean }) => (
    <svg className={`w-5 h-5 ${active ? "text-[#E52424]" : "text-zinc-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l1.5-4.5A2 2 0 016.4 3h11.2a2 2 0 011.9 1.5L21 9m-18 0v9a2 2 0 002 2h14a2 2 0 002-2V9m-18 0h18M9 21v-6a1 1 0 011-1h4a1 1 0 011 1v6" />
    </svg>
  ),
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (!token || role !== "admin") {
      router.push("/login");
    } else {
      setIsChecking(false);
    }
  }, []);

  if (isChecking) {
    return null;
  }

  const navItems = [
    { label: "Dashboard", path: "/admin", Icon: Icons.Dashboard },
    { label: "Karyawan", path: "/admin/karyawan", Icon: Icons.Karyawan },
    { label: "Tenant", path: "/admin/tenant", Icon: Icons.Tenant },
    { label: "Penjualan", path: "/admin/analisa", Icon: Icons.Penjualan },
    { label: "Produk", path: "/admin/produk", Icon: Icons.Produk },
  ];

  
  return (
    <div className="w-full min-h-screen bg-[#F5F6F8] text-[#212121] font-sans antialiased flex flex-col md:flex-row">
      
      {/* DESKTOP SIDEBAR (Visible md:flex) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-200/80 sticky top-0 h-screen p-5 z-50">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-[#E52424] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            R
          </div>
          <div>
            <h2 className="font-bold text-sm text-[#212121]">RAOS DIMSUM</h2>
            <p className="text-[10px] text-zinc-400 font-medium">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ label, path, Icon }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={path}
                href={path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-red-50 text-[#E52424]"
                    : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                }`}
              >
                <Icon active={isActive} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Info Footer */}
        <div className="pt-4 border-t border-zinc-100 flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-800 text-white flex items-center justify-center text-xs font-bold">
            AD
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#212121] truncate">Admin Raos</p>
            <p className="text-[10px] text-zinc-400 truncate">admin@raosdimsum.com</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <main className="flex-1 pb-20 md:pb-8 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* MOBILE BOTTOM NAVIGATION (Visible < md) */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-zinc-200 h-[64px] flex items-center justify-around z-50 px-4">
          {navItems.map(({ label, path, Icon }) => {
            const isActive = pathname === path;
            return (
              <Link
                key={path}
                href={path}
                className="flex flex-col items-center justify-center flex-1 h-full py-1"
              >
                <Icon active={isActive} />
                <span className={`text-[11px] mt-1 tracking-tight ${isActive ? "font-bold text-[#E52424]" : "font-medium text-zinc-400"}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

    </div>
  );
}