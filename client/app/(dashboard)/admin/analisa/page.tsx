"use client";

import { useState } from "react";

const dummySauceData = [
  { name: "Mentai", count: 120, max: 150 },
  { name: "Tar-Tar", count: 95, max: 150 },
  { name: "Brulee", count: 80, max: 150 },
  { name: "Hot Volcano", count: 70, max: 150 },
];

const dummyPcsData = [
  { label: "2 PCS", percentage: "10%", color: "bg-emerald-500" },
  { label: "4 PCS", percentage: "15%", color: "bg-blue-500" },
  { label: "6 PCS", percentage: "20%", color: "bg-orange-500" },
  { label: "16 PCS", percentage: "55%", color: "bg-red-500" },
];

export default function AnalisaPage() {
  const [activeTab, setActiveTab] = useState<"Saus" | "PCS">("Saus");

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200/80 shadow-2xs">
        <h1 className="text-base md:text-xl font-bold text-[#212121]">Analisa Penjualan</h1>
        <p className="text-xs text-zinc-400 mt-0.5">Statistik penggunaan saus dan porsi PCS</p>
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
        <div className={`bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4 ${activeTab === "Saus" ? "block" : "hidden md:block"}`}>
          <div>
            <h2 className="text-sm font-bold text-[#212121]">Jumlah Keluar Saus</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">Akumulasi hari ini</p>
          </div>

          <div className="space-y-4 pt-2">
            {dummySauceData.map((sauce) => (
              <div key={sauce.name} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-zinc-600">{sauce.name}</span>
                  <span className="font-bold text-[#212121]">{sauce.count}</span>
                </div>
                <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-[#E52424] h-full rounded-full transition-all duration-300"
                    style={{ width: `${(sauce.count / sauce.max) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PCS SECTION */}
        <div className={`bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4 ${activeTab === "PCS" ? "block" : "hidden md:block"}`}>
          <div>
            <h2 className="text-sm font-bold text-[#212121]">Jumlah Keluar PCS</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">Akumulasi hari ini</p>
          </div>

          <div className="flex flex-col items-center gap-6 py-2">
            <div className="relative w-40 h-40 rounded-full bg-[conic-gradient(#10B981_0%_10%,#3B82F6_10%_25%,#F97316_25%_45%,#E52424_45%_100%)] flex items-center justify-center">
              <div className="w-24 h-24 bg-white rounded-full"></div>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 text-xs">
              {dummyPcsData.map((pcs) => (
                <div key={pcs.label} className="flex items-center gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                  <span className={`w-3 h-3 rounded-full ${pcs.color}`}></span>
                  <span className="text-zinc-600 font-medium">{pcs.label}</span>
                  <span className="font-bold text-[#212121] ml-auto">{pcs.percentage}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}