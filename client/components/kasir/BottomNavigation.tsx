"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const pathname = usePathname() || "";

  const menus = [
    {
      name: "Kasir",
      href: "/kasir",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
    },
    {
      name: "Riwayat",
      href: "/kasir/history",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      name: "Absensi",
      href: "/absen",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
    {
      name: "Akun",
      href: "/kasir/profile",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white/95 backdrop-blur-md border-t border-zinc-200/80 shadow-lg">
      <div className="max-w-md sm:max-w-xl lg:max-w-2xl mx-auto h-full grid grid-cols-4">
        {menus.map((menu) => {
          // Pengecekan presisi agar /kasir tidak aktif saat berada di /kasir/history atau /kasir/profile
          const active =
            menu.href === "/kasir"
              ? pathname === "/kasir" ||
                (pathname.startsWith("/kasir/") &&
                  !pathname.startsWith("/kasir/history") &&
                  !pathname.startsWith("/kasir/profile"))
              : pathname === menu.href || pathname.startsWith(`${menu.href}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-200 select-none ${
                active
                  ? "text-[#E52424] font-bold"
                  : "text-zinc-400 hover:text-zinc-600 font-medium"
              }`}
            >
              {active && (
                <span className="absolute top-0 w-8 h-1 rounded-b-full bg-[#E52424]" />
              )}
              <div className="transition-transform duration-200 active:scale-90">
                {menu.icon}
              </div>
              <span className="text-[10px] leading-none tracking-tight">{menu.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}