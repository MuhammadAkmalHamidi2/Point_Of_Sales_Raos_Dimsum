"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

type FilterType = "Hari Ini" | "Minggu Ini" | "Bulan Ini" | "Custom";

type DashboardData = {
  filter: string;
  startDate: string;
  endDate: string;
  totalOmset: number;
  cashAmount: number;
  qrisAmount: number;
  cashPercent: number;
  qrisPercent: number;
  chart: { label: string; val: number; amount: number }[];
};

const emptyDashboardData: DashboardData = {
  filter: "Harian",
  startDate: "",
  endDate: "",
  totalOmset: 0,
  cashAmount: 0,
  qrisAmount: 0,
  cashPercent: 0,
  qrisPercent: 0,
  chart: [],
};

const formatRupiah = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);

const getPeriodLabel = (filter: FilterType, data: DashboardData) => {
  if (filter === "Hari Ini") {
    const today = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `Hari Ini (${today})`;
  }
  if (filter === "Minggu Ini") return "Minggu Ini (Senin - Minggu)";
  if (filter === "Bulan Ini") {
    const monthYear = new Date().toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
    return `Bulan Ini (${monthYear})`;
  }
  return data.startDate && data.endDate
    ? `${data.startDate} s/d ${data.endDate}`
    : "Rentang Tanggal Khusus";
};

export default function DashboardKeuangan() {
  const [filter, setFilter] = useState<FilterType>("Hari Ini");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [dashboardData, setDashboardData] =
    useState<DashboardData>(emptyDashboardData);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const apiFilterParam =
        filter === "Hari Ini"
          ? "Harian"
          : filter === "Minggu Ini"
          ? "Mingguan"
          : filter === "Bulan Ini"
          ? "Bulanan"
          : "Custom";

      const params = new URLSearchParams({ filter: apiFilterParam });
      if (filter === "Custom") {
        if (!customStart || !customEnd) {
          setIsLoading(false);
          return;
        }
        params.set("start", customStart);
        params.set("end", customEnd);
      }

      const response = await api.get<{ data: DashboardData }>(
        `/api/dashboard?${params.toString()}`
      );
      setDashboardData(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil data dashboard:", error);
      setErrorMessage("Gagal memuat data dashboard.");
    } finally {
      setIsLoading(false);
    }
  }, [customEnd, customStart, filter]);

  useEffect(() => {
    const loadDashboard = async () => {
      await fetchDashboard();
    };

    void loadDashboard();
  }, [fetchDashboard]);

  const currentData = dashboardData;

  const xAxisLabel =
    filter === "Hari Ini"
      ? "Jam (08:00 - 20:00)"
      : filter === "Minggu Ini"
      ? "Hari (Senin - Minggu)"
      : filter === "Bulan Ini"
      ? "Minggu dalam Bulan Ini"
      : "Tanggal";

  return (
    <div className="space-y-6">
      {/* Header Bar & Filter Tabs */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-base md:text-xl font-bold text-[#212121]">
              Dashboard Keuangan
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Menampilkan data:{" "}
              <span className="font-semibold text-zinc-700">
                {getPeriodLabel(filter, currentData)}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap bg-[#F5F6F8] p-1 rounded-xl border border-zinc-200/60 gap-1">
            {(
              ["Hari Ini", "Minggu Ini", "Bulan Ini", "Custom"] as FilterType[]
            ).map((tab) => (
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
            <span className="font-semibold text-zinc-600">
              Pilih Rentang Tanggal:
            </span>
            <input
              type="date"
              value={customStart}
              onChange={(e) => {
                const nextStart = e.target.value;
                setCustomStart(nextStart);
                if (customEnd && nextStart > customEnd) {
                  setCustomEnd(nextStart);
                }
              }}
              className="px-3 py-1.5 border border-zinc-200 rounded-lg text-zinc-700 font-medium outline-none focus:border-[#E52424]"
            />
            <span className="text-zinc-400">s/d</span>
            <input
              type="date"
              value={customEnd}
              min={customStart || undefined}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="px-3 py-1.5 border border-zinc-200 rounded-lg text-zinc-700 font-medium outline-none focus:border-[#E52424]"
            />
          </div>
        )}
        {errorMessage && (
          <p className="text-xs text-red-500">{errorMessage}</p>
        )}
      </div>

      {isLoading && (
        <p className="text-xs text-zinc-400 text-center">
          Memuat data dashboard...
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Total Omset & Rincian Pembayaran */}
        <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Omset ({filter})
            </span>
            <h2 className="text-3xl font-extrabold text-[#212121] mt-1">
              {formatRupiah(currentData.totalOmset)}
            </h2>

            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#43A047] text-xs font-semibold">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              <span>Data aktual</span>
              <span className="text-zinc-400 font-normal ml-0.5">
                sesuai periode
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 space-y-2.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Rincian Pembayaran
            </span>

            <div className="flex justify-between items-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E88E5]"></span>
                <span className="text-xs font-semibold text-zinc-600">
                  Cash
                </span>
              </div>
              <span className="text-xs font-bold text-[#212121]">
                {formatRupiah(currentData.cashAmount)}
              </span>
            </div>

            <div className="flex justify-between items-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E52424]"></span>
                <span className="text-xs font-semibold text-zinc-600">
                  QRIS
                </span>
              </div>
              <span className="text-xs font-bold text-[#212121]">
                {formatRupiah(currentData.qrisAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Diagram Grafik Omset */}
        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-[#212121]">
                Grafik Pertumbuhan Omset
              </p>
              <p className="text-[11px] text-zinc-400">
                Visualisasi tren penjualan ({filter})
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E52424]"></span>
              <span className="text-zinc-500 font-medium">Omset Penjualan</span>
            </div>
          </div>

          <div className="pt-2">
            {/* Tinggi container grafik diperbesar dari h-52 ke h-60 */}
            <div className="flex h-60">
              {/* SUMBU Y */}
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

              {/* AREA PLOT GRAFIK (Padding atas ditambah dari pt-4 ke pt-10 agar tooltip tidak terpotong) */}
              <div className="flex-1 relative flex items-end justify-between gap-1.5 pl-3 pt-10 border-b border-zinc-200 overflow-x-auto">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1 pt-6">
                  <div className="border-b border-dashed border-zinc-100 w-full"></div>
                  <div className="border-b border-dashed border-zinc-100 w-full"></div>
                  <div className="border-b border-dashed border-zinc-100 w-full"></div>
                  <div className="border-b border-dashed border-zinc-100 w-full"></div>
                  <div></div>
                </div>

                {currentData.chart.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400 italic">
                    Belum ada data grafik omset pada periode ini.
                  </div>
                ) : (
                  currentData.chart.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative z-10 min-w-[12px]"
                    >
                      {/* Tooltip nilai omset di atas bar */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-zinc-900 text-white text-[10px] py-1 px-2 rounded shadow-md pointer-events-none z-20 font-bold whitespace-nowrap">
                        {item.label}: {formatRupiah(item.amount)}
                      </div>

                      <div className="w-full max-w-[28px] bg-zinc-100/80 rounded-t-lg h-full flex items-end overflow-hidden">
                        <div
                          className="w-full bg-gradient-to-t from-[#E52424] to-red-400 rounded-t-lg transition-all duration-500 group-hover:brightness-110"
                          style={{ height: `${item.val}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SUMBU X */}
            <div className="pl-[52px] pt-2">
              <div className="flex justify-between gap-1">
                {currentData.chart.map((item, idx) => (
                  <span
                    key={idx}
                    className="flex-1 text-center text-[9px] font-semibold text-zinc-500 truncate"
                  >
                    {item.label}
                  </span>
                ))}
              </div>
              <p className="text-center text-[11px] font-bold text-zinc-400 uppercase tracking-wider mt-2.5">
                {xAxisLabel}
              </p>
            </div>
          </div>
        </div>

        {/* Persentase Metode Pembayaran */}
        <div className="md:col-span-3 lg:col-span-1 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
          <p className="text-sm font-bold text-[#212121]">
            Persentase Metode Pembayaran
          </p>

          <div className="flex items-center justify-between">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#F5F6F8"
                  strokeWidth="3.8"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#1E88E5"
                  strokeWidth="3.8"
                  strokeDasharray={`${currentData.cashPercent} ${
                    100 - currentData.cashPercent
                  }`}
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke="#E52424"
                  strokeWidth="3.8"
                  strokeDasharray={`${currentData.qrisPercent} ${
                    100 - currentData.qrisPercent
                  }`}
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
                  <span className="font-semibold text-zinc-600 text-xs">
                    Cash
                  </span>
                </div>
                <span className="font-bold text-[#212121] text-xs">
                  {currentData.cashPercent}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#E52424]"></span>
                  <span className="font-semibold text-zinc-600 text-xs">
                    QRIS
                  </span>
                </div>
                <span className="font-bold text-[#212121] text-xs">
                  {currentData.qrisPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}