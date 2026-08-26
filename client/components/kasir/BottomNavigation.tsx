"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNavigation() {
  const pathname = usePathname();

  const menus = [
    {
      name: "Kasir",
      href: "/kasir",
      icon: "🛒",
    },
    {
      name: "Riwayat",
      href: "/kasir/history",
      icon: "🕘",
    },
    {
      name: "Absensi",
      href: "/absen",
      icon: "📝",
    },
    {
      name: "Akun",
      href: "/profile",
      icon: "👤",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-zinc-200">
      <div className="max-w-md mx-auto h-full grid grid-cols-4">
        {menus.map((menu) => {
          // Logika pengecekan aktif agar /kasir tidak bentrok dengan /kasir/history
          const active =
            menu.href === "/kasir"
              ? pathname === "/kasir" ||
                (pathname.startsWith("/kasir/") &&
                  !pathname.startsWith("/kasir/history"))
              : pathname === menu.href || pathname.startsWith(`${menu.href}/`);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex flex-col items-center justify-center gap-1 transition ${
                active ? "text-[#E52424]" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <span className="text-lg">{menu.icon}</span>
              <span className="text-[10px] font-medium">{menu.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}