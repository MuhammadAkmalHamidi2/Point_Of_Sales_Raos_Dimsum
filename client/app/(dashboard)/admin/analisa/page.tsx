"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type PackageData = {
  qty: number;
  pax: number;
  categoryName?: string;
};

type SauceData = {
  name: string;
  count: number;
};

type PackageGroup = {
  categoryName: string;
  packages: PackageData[];
};

type AnalisaSummary = {
  packages: PackageGroup[];
  sauces: SauceData[];
};

type DayData = AnalisaSummary & {
  date: string;
  label: string;
};

type AnalisaResponse = {
  period: string;
  startDate: string;
  endDate: string;
  totals: AnalisaSummary;
  days: DayData[];
};

export default function AnalisaPage() {
  const [activeTab, setActiveTab] = useState<"Saus" | "PCS">("Saus");
  const [analisa, setAnalisa] = useState<AnalisaResponse | null>(null);
  const [selectedDay, setSelectedDay] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalisa = async () => {
      try {
        const response = await api.get("/api/analisa");

        if (response.data.success) {
          setAnalisa(response.data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data analisa:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalisa();
  }, []);

  const selectedSummary =
    selectedDay === "all"
      ? analisa?.totals
      : analisa?.days.find((day) => day.date === selectedDay);

  const packageGroups = selectedSummary?.packages ?? [];
  const packageData = packageGroups.flatMap((group) => group.packages);
  const sauceData = selectedSummary?.sauces ?? [];

  const maxSauceCount = Math.max(...sauceData.map((item) => item.count), 1);
  const totalPax = packageData.reduce((total, item) => total + item.pax, 0);
  const packageColors = ["#E52424", "#F97316", "#10B981", "#3B82F6", "#8B5CF6"];
  const packageChart = packageData.reduce<
    Array<PackageData & { color: string; start: number; end: number }>
  >((result, item, index) => {
    const percentage = totalPax ? (item.pax / totalPax) * 100 : 0;
    const start = result.length ? result[result.length - 1].end : 0;

    return [
      ...result,
      {
        ...item,
        categoryName: packageGroups.find((group) => group.packages.includes(item))?.categoryName,
        color: packageColors[index % packageColors.length],
        start,
        end: start + percentage,
      },
    ];
  }, []);
  const chartBackground = packageChart.length
    ? `conic-gradient(${packageChart.map((item) => `${item.color} ${item.start}% ${item.end}%`).join(", ")})`
    : "#e4e4e7";

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
        <h1 className="text-base md:text-xl font-bold text-[#212121]">
          Analisa Penjualan
        </h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Ringkasan packaging dan saus minggu ini
        </p>
      </div>

      <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200/80">
        <div>
          <p className="text-sm font-bold text-[#212121]">Periode analisa</p>
          <p className="text-[11px] text-zinc-400">
            {analisa ? `${analisa.startDate} sampai ${analisa.endDate}` : "Minggu ini"}
          </p>
        </div>
        <select
          value={selectedDay}
          onChange={(event) => setSelectedDay(event.target.value)}
          className="max-w-38 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-600 outline-none"
        >
          <option value="all">Minggu ini</option>
          {analisa?.days.map((day) => (
            <option key={day.date} value={day.date}>{day.label}</option>
          ))}
        </select>
      </div>

      {/* MOBILE SWITCHER */}
      <div className="flex md:hidden bg-white p-1 rounded-2xl border border-zinc-200/80">
        <button
          onClick={() => setActiveTab("Saus")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "Saus" ? "bg-[#E52424] text-white" : "text-zinc-500"
          }`}
        >
          Saus
        </button>
        <button
          onClick={() => setActiveTab("PCS")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === "PCS" ? "bg-[#E52424] text-white" : "text-zinc-500"
          }`}
        >
          PCS
        </button>
      </div>

      {/* 2-COLUMN GRID ON DESKTOP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* SAUS SECTION */}
        <div
          className={`bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4 ${activeTab === "Saus" ? "block" : "hidden md:block"}`}
        >
          <div>
            <h2 className="text-sm font-bold text-[#212121]">Jumlah Keluar Saus</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">Total pcs saus</p>
          </div>
          {loading ? <p className="text-sm text-zinc-400">Memuat data...</p> : (
            <div className="space-y-4 pt-2">
              {sauceData.map((sauce) => (
                <div key={sauce.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-zinc-600">{sauce.name}</span>
                    <span className="font-bold text-[#212121]">{sauce.count.toLocaleString("id-ID")} pcs</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden">
                    <div className="bg-[#E52424] h-full rounded-full transition-all" style={{ width: `${(sauce.count / maxSauceCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PCS SECTION */}
        <div
          className={`bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4 ${activeTab === "PCS" ? "block" : "hidden md:block"}`}
        >
          <div>
            <h2 className="text-sm font-bold text-[#212121]">Jumlah Keluar Packaging</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">Total packaging dalam pax</p>
          </div>
          {loading ? <p className="text-sm text-zinc-400">Memuat data...</p> : (
            <div className="space-y-5 py-2">
              <div className="flex items-center gap-5">
                <div className="relative w-32 h-32 shrink-0 rounded-full flex items-center justify-center" style={{ background: chartBackground }}>
                  <div className="w-20 h-20 bg-white rounded-full flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-[#212121]">{packageData.reduce((total, item) => total + item.pax, 0)}</span>
                    <span className="text-[10px] text-zinc-400">total pax</span>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  {packageChart.map((item) => (
                    <div key={item.qty} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-zinc-600">{item.categoryName} · {item.qty} pcs</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                {packageGroups.map((group) => (
                  <div key={group.categoryName}>
                    <h3 className="text-sm font-bold text-[#212121]">
                      {group.categoryName}
                    </h3>
                    <div className="grid grid-cols-3 gap-3 mt-2">
                      {group.packages.map((item) => (
                        <div key={`${group.categoryName}-${item.qty}`} className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-center">
                          <p className="text-xs font-medium text-zinc-500">{item.qty} pcs</p>
                          <p className="text-sm font-bold text-[#212121] mt-1">{item.pax} pax</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
