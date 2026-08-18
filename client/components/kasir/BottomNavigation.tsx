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
      name: "History",
      href: "/kasir/history",
      icon: "🕘",
    },
    {
      name: "Profile",
      href: "/profile",
      icon: "👤",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-zinc-200">

      <div className="max-w-md mx-auto h-full grid grid-cols-3">

        {menus.map((menu) => {
          const active =
            pathname === menu.href ||
            (menu.href === "/kasir" &&
              pathname.startsWith("/kasir"));

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex flex-col items-center justify-center gap-1 transition ${
                active
                  ? "text-[#E52424]"
                  : "text-zinc-400"
              }`}
            >

              <span className="text-lg">
                {menu.icon}
              </span>

              <span className="text-[10px] font-medium">
                {menu.name}
              </span>

            </Link>
          );
        })}

      </div>

    </nav>
  );
}