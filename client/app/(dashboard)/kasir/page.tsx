import Link from "next/link";
import KasirHeader from "@/components/kasir/KasirHeader";
import BottomNavigation from "@/components/kasir/BottomNavigation";

export default function KasirPage() {
  return (
    <main className="min-h-screen bg-[#F5F5F5] pb-20">

      <KasirHeader title="Kasir" />

      <div className="max-w-md mx-auto px-4 py-5">

        {/* Greeting */}
        <div className="mb-6">

          <p className="text-xs text-zinc-500">
            Selamat bekerja 👋
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#212121]">
            Mau pesan apa hari ini?
          </h2>

        </div>


        {/* Search */}
        <div className="relative mb-6">

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            🔍
          </span>

          <input
            type="text"
            placeholder="Cari produk..."
            className="w-full h-11 bg-white border border-zinc-200 rounded-xl pl-11 pr-4 text-sm outline-none focus:border-[#E52424] focus:ring-4 focus:ring-[#E52424]/10"
          />

        </div>


        {/* Category */}
        <section>

          <div className="flex items-center justify-between mb-3">

            <h3 className="font-semibold text-[#212121]">
              Kategori
            </h3>

            <span className="text-xs text-zinc-400">
              1 kategori
            </span>

          </div>


          <Link
            href="/kasir/makanan"
            className="block"
          >

            <div className="bg-white rounded-2xl border border-zinc-200 p-4 hover:border-[#E52424] hover:shadow-md transition">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-xl bg-[#E52424]/10 flex items-center justify-center text-2xl">
                  🍽️
                </div>

                <div className="flex-1">

                  <h4 className="font-semibold text-[#212121]">
                    Makanan
                  </h4>

                  <p className="text-xs text-zinc-400 mt-1">
                    1 produk tersedia
                  </p>

                </div>

                <span className="text-zinc-400">
                  →
                </span>

              </div>

            </div>

          </Link>

        </section>

      </div>

      <BottomNavigation />

    </main>
  );
}