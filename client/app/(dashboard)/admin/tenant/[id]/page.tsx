"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

type FilterType = "Hari Ini" | "Mingguan" | "Bulanan" | "Custom";

type Tenant = {
  outletName: string;
  address: string | null;
  status: boolean;
  karyawans: { id: number; name: string; category: string; phone: string | null }[];
};

const dashboardDataMap = {
  "Hari Ini": {
    label: "Hari Ini",
    totalOmset: "Rp 850.000",
    cashAmount: "Rp 470.000",
    qrisAmount: "Rp 380.000",
    growth: "+3.1%",
    comparisonText: "dari kemarin",
    xAxisLabel: "Jam",
    chart: [
      { label: "08:00", val: 30, amount: "80rb" },
      { label: "10:00", val: 55, amount: "150rb" },
      { label: "12:00", val: 100, amount: "280rb" },
      { label: "14:00", val: 70, amount: "190rb" },
      { label: "16:00", val: 60, amount: "160rb" },
      { label: "18:00", val: 90, amount: "240rb" },
    ],
    cashPercent: 55,
    qrisPercent: 45,
  },
  Mingguan: {
    label: "Bulan Ini (Minggu 1 - Minggu 4)",
    totalOmset: "Rp 19.200.000",
    cashAmount: "Rp 9.600.000",
    qrisAmount: "Rp 9.600.000",
    growth: "+10.0%",
    comparisonText: "dari bulan lalu",
    xAxisLabel: "Minggu",
    chart: [
      { label: "Minggu 1", val: 60, amount: "4M" },
      { label: "Minggu 2", val: 75, amount: "5M" },
      { label: "Minggu 3", val: 90, amount: "6M" },
      { label: "Minggu 4", val: 100, amount: "7M" },
    ],
    cashPercent: 50,
    qrisPercent: 50,
  },
  Bulanan: {
    label: "Tahun Ini (Januari - Desember 2026)",
    totalOmset: "Rp 96.000.000",
    cashAmount: "Rp 43.200.000",
    qrisAmount: "Rp 52.800.000",
    growth: "+18.4%",
    comparisonText: "dari tahun lalu",
    xAxisLabel: "Bulan",
    chart: [
      { label: "Jan", val: 40, amount: "6M" },
      { label: "Feb", val: 50, amount: "7M" },
      { label: "Mar", val: 65, amount: "9M" },
      { label: "Apr", val: 55, amount: "8M" },
      { label: "Mei", val: 80, amount: "11M" },
      { label: "Jun", val: 70, amount: "10M" },
      { label: "Jul", val: 85, amount: "12M" },
      { label: "Agu", val: 95, amount: "13M" },
      { label: "Sep", val: 75, amount: "10M" },
      { label: "Okt", val: 90, amount: "12M" },
      { label: "Nov", val: 85, amount: "11M" },
      { label: "Des", val: 100, amount: "14M" },
    ],
    cashPercent: 45,
    qrisPercent: 55,
  },
  Custom: {
    label: "Rentang Tanggal Custom",
    totalOmset: "Rp 2.120.000",
    cashAmount: "Rp 1.060.000",
    qrisAmount: "Rp 1.060.000",
    growth: "Custom",
    comparisonText: "periode terpilih",
    xAxisLabel: "Tanggal",
    chart: [
      { label: "20 Mei", val: 40, amount: "300rb" },
      { label: "21 Mei", val: 70, amount: "550rb" },
      { label: "22 Mei", val: 85, amount: "650rb" },
      { label: "23 Mei", val: 60, amount: "450rb" },
      { label: "24 Mei", val: 95, amount: "700rb" },
    ],
    cashPercent: 50,
    qrisPercent: 50,
  },
};

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("Hari Ini");
  const [customStart, setCustomStart] = useState("2026-05-20");
  const [customEnd, setCustomEnd] = useState("2026-05-24");

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await api.get<{ data?: Tenant }>(`/api/outlets/${id}`);
        setTenant(response.data.data ?? null);
      } catch (error) {
        console.error("Gagal mengambil detail tenant:", error);
        setTenant(null);
      } finally {
        setIsLoading(false);
      }
    };

    const loadTenant = async () => {
      if (Number.isInteger(id)) await fetchTenant();
    };

    void loadTenant();
  }, [id]);

  const currentData = dashboardDataMap[filter];

  if (isLoading) {
    return <p className="text-sm text-zinc-500">Memuat detail tenant...</p>;
  }

  if (!tenant) {
    return <p className="text-sm text-zinc-500">Tenant tidak ditemukan.</p>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/admin/tenant")}
              className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500 hover:bg-zinc-200 transition-all shrink-0"
            >
              ←
            </button>
            <div>
              <h1 className="text-base md:text-xl font-bold text-[#212121]">{tenant.outletName}</h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                {tenant.address ?? "Alamat belum diisi"} ·{" "}
                <span
                  className={`font-semibold ${
                    tenant.status ? "text-green-600" : "text-zinc-500"
                  }`}
                >
                  {tenant.status ? "Aktif" : "Nonaktif"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap bg-[#F5F6F8] p-1 rounded-xl border border-zinc-200/60 gap-1">
            {(["Hari Ini", "Mingguan", "Bulanan", "Custom"] as FilterType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === tab
                    ? "bg-[#E52424] text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filter === "Custom" && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-100 text-xs">
            <span className="font-semibold text-zinc-600">Pilih Rentang Tanggal:</span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="px-3 py-1.5 border border-zinc-200 rounded-lg text-zinc-700 font-medium outline-none focus:border-[#E52424]"
            />
            <span className="text-zinc-400">s/d</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 border border-zinc-200 rounded-lg text-zinc-700 font-medium outline-none focus:border-[#E52424]"
            />
          </div>
        )}
      </div>

      {/* OMSET + GRAFIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Omset</span>
            <h2 className="text-3xl font-extrabold text-[#212121] mt-1">{currentData.totalOmset}</h2>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#43A047] text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              <span>{currentData.growth}</span>
              <span className="text-zinc-400 font-normal ml-0.5">{currentData.comparisonText}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 space-y-2.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Rincian Pembayaran</span>

            <div className="flex justify-between items-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E88E5]"></span>
                <span className="text-xs font-semibold text-zinc-600">Cash</span>
              </div>
              <span className="text-xs font-bold text-[#212121]">{currentData.cashAmount}</span>
            </div>

            <div className="flex justify-between items-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E52424]"></span>
                <span className="text-xs font-semibold text-zinc-600">QRIS</span>
              </div>
              <span className="text-xs font-bold text-[#212121]">{currentData.qrisAmount}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-[#212121]">Grafik Pertumbuhan Omset</p>
              <p className="text-[11px] text-zinc-400">Visualisasi tren penjualan tenant ini</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E52424]"></span>
              <span className="text-zinc-500 font-medium">Omset Penjualan</span>
            </div>
          </div>

          <div className="pt-2">
            <div className="flex h-52">
              <div className="flex items-center gap-1.5 pr-2.5 border-r border-zinc-200">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase -rotate-90 whitespace-nowrap -ml-3">
                  Omset
                </span>
                <div className="flex flex-col justify-between h-full text-[10px] font-semibold text-zinc-400 py-1 text-right min-w-[32px]">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>
              </div>

              <div className="flex-1 relative flex items-end justify-between gap-2 pl-3 pt-4 border-b border-zinc-200">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1">
                  <div className="border-b border-dashed border-zinc-100 w-full"></div>
                  <div className="border-b border-dashed border-zinc-100 w-full"></div>
                  <div className="border-b border-dashed border-zinc-100 w-full"></div>
                  <div className="border-b border-dashed border-zinc-100 w-full"></div>
                  <div></div>
                </div>

                {currentData.chart.map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative z-10">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-zinc-900 text-white text-[10px] py-1 px-2 rounded shadow-md pointer-events-none z-20 font-bold whitespace-nowrap">
                      {item.amount}
                    </div>

                    <div className="w-full max-w-[28px] bg-zinc-100/80 rounded-t-lg h-full flex items-end overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-[#E52424] to-red-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                        style={{ height: `${item.val}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pl-[52px] pt-2">
              <div className="flex justify-between gap-2">
                {currentData.chart.map((item, idx) => (
                  <span key={idx} className="flex-1 text-center text-[10px] font-semibold text-zinc-500 truncate">
                    {item.label}
                  </span>
                ))}
              </div>
              <p className="text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-2.5">
                {currentData.xAxisLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* PERSENTASE PEMBAYARAN (kiri) + DATA KARYAWAN (kanan) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
          <p className="text-sm font-bold text-[#212121]">Persentase Metode Pembayaran</p>

          <div className="flex items-center justify-between">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle cx="18" cy="18" r="15.915" fill="none" stroke="#F5F6F8" strokeWidth="3.8" />
                <circle
                  cx="18" cy="18" r="15.915" fill="none"
                  stroke="#1E88E5" strokeWidth="3.8"
                  strokeDasharray={`${currentData.cashPercent} ${100 - currentData.cashPercent}`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                <circle
                  cx="18" cy="18" r="15.915" fill="none"
                  stroke="#E52424" strokeWidth="3.8"
                  strokeDasharray={`${currentData.qrisPercent} ${100 - currentData.qrisPercent}`}
                  strokeDashoffset={`-${currentData.cashPercent}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute flex flex-col items-center leading-none">
                <span className="text-xs font-bold text-[#212121]">100%</span>
                <span className="text-[9px] text-zinc-400 mt-0.5">Total</span>
              </div>
            </div>

            <div className="space-y-3 w-1/2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#1E88E5]"></span>
                  <span className="font-semibold text-zinc-600 text-xs">Cash</span>
                </div>
                <span className="font-bold text-[#212121] text-xs">{currentData.cashPercent}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#E52424]"></span>
                  <span className="font-semibold text-zinc-600 text-xs">QRIS</span>
                </div>
                <span className="font-bold text-[#212121] text-xs">{currentData.qrisPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-[#212121]">Data Karyawan</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">Karyawan yang bertugas di tenant ini</p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-500">
              {tenant.karyawans.length} orang
            </span>
          </div>

          {tenant.karyawans.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">Belum ada karyawan terdaftar di tenant ini.</p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {tenant.karyawans.map((emp) => (
                <div key={emp.id} className="py-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-[#212121]">{emp.name}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {emp.category}
                      {emp.phone && <span> · {emp.phone}</span>}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                      "bg-green-50 text-green-600"
                    }`}
                  >
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
