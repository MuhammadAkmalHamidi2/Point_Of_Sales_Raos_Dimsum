import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F9FA] text-[#212121] flex flex-col justify-between selection:bg-[#E52424]/10 selection:text-[#E52424]">
      {/* Top Bar Navigation */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E52424] text-white flex items-center justify-center font-black text-xl shadow-md shadow-[#E52424]/20">
            R
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-[#212121]">
              POS RAOS
            </h1>
            <p className="text-[11px] font-medium text-zinc-400 mt-0.5">
              Point of Sale System
            </p>
          </div>
        </div>
      </header>

      {/* Hero & Portal Selection */}
      <section className="w-full max-w-5xl mx-auto px-6 py-8 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#212121] tracking-tight">
            Pilih Modul Layanan
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-2 leading-relaxed">
            Selamat datang di portal utama POS RAOS. Silakan pilih sistem kerja sesuai dengan peran dan kebutuhan operasional outlet.
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Card 1: Kasir POS */}
          <Link
            href="/login"
            className="group relative bg-white border border-zinc-200 hover:border-[#E52424] rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-[#E52424]/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#E52424]/10 text-[#E52424] flex items-center justify-center mb-5 group-hover:bg-[#E52424] group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#212121] group-hover:text-[#E52424] transition-colors">
                Aplikasi Kasir (POS)
              </h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                Pencatatan transaksi, kelola item pesanan, varian saus, dan cetak struk penjualan.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-[#E52424] gap-1 group-hover:translate-x-1 transition-transform">
              <span>Buka Kasir</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>

          {/* Card 2: Dashboard Admin */}
          <Link
            href="/login"
            className="group relative bg-white border border-zinc-200 hover:border-indigo-500 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#212121] group-hover:text-indigo-600 transition-colors">
                Dashboard Admin
              </h3>
              <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
                Kelola inventaris produk, master data, serta rekapitulasi laporan omset harian.
              </p>
            </div>
            <div className="mt-6 flex items-center text-xs font-bold text-indigo-600 gap-1 group-hover:translate-x-1 transition-transform">
              <span>Masuk Admin</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto px-6 py-6 text-center border-t border-zinc-200/60">
        <p className="text-xs text-zinc-400 font-medium">
          &copy; {new Date().getFullYear()} POS RAOS System. All rights reserved.
        </p>
      </footer>
    </main>
  );
}