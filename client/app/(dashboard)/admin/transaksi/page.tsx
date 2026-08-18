"use client";

import { useState } from "react";

type FilterType = "Hari ini" | "Harian" | "Mingguan" | "Bulanan" | "Custom";

const transactionDatasets = {
  "Hari ini": [
    { id: "#TRX-240526-001", amount: "Rp 93.000", method: "Cash", time: "10.15 WIB - Hari Ini" },
    { id: "#TRX-240526-002", amount: "Rp 62.000", method: "QRIS", time: "11.02 WIB - Hari Ini" },
    { id: "#TRX-240526-003", amount: "Rp 36.000", method: "Cash", time: "12.20 WIB - Hari Ini" },
    { id: "#TRX-240526-004", amount: "Rp 52.000", method: "QRIS", time: "13.45 WIB - Hari Ini" },
  ],
  Harian: [
    { id: "#TRX-WEEK-01", amount: "Rp 120.000", method: "QRIS", time: "Senin, 18 Mei" },
    { id: "#TRX-WEEK-02", amount: "Rp 85.000", method: "Cash", time: "Selasa, 19 Mei" },
    { id: "#TRX-WEEK-03", amount: "Rp 210.000", method: "QRIS", time: "Sabtu, 23 Mei" },
  ],
  Mingguan: [
    { id: "#TRX-M1-001", amount: "Rp 450.000", method: "QRIS", time: "Minggu 1 Mei" },
    { id: "#TRX-M2-002", amount: "Rp 620.000", method: "Cash", time: "Minggu 2 Mei" },
    { id: "#TRX-M3-003", amount: "Rp 510.000", method: "QRIS", time: "Minggu 3 Mei" },
  ],
  Bulanan: [
    { id: "#TRX-FEB-01", amount: "Rp 1.250.000", method: "QRIS", time: "Februari 2026" },
    { id: "#TRX-MAR-01", amount: "Rp 3.400.000", method: "Cash", time: "Maret 2026" },
    { id: "#TRX-APR-01", amount: "Rp 2.800.000", method: "QRIS", time: "April 2026" },
  ],
  Custom: [
    { id: "#TRX-CUST-01", amount: "Rp 175.000", method: "Cash", time: "Periode Custom" },
  ],
};

export default function TransaksiPage() {
  const [filter, setFilter] = useState<FilterType>("Hari ini");
  const [customStart, setCustomStart] = useState("2026-05-20");
  const [customEnd, setCustomEnd] = useState("2026-05-24");

  const transactions = transactionDatasets[filter];

  return (
    <div className="space-y-6">
      {/* Header Bar & Global Filter */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-base md:text-xl font-bold text-[#212121]">Riwayat Transaksi</h1>
            <p className="text-xs text-zinc-400 mt-0.5">Daftar transaksi berdasarkan filter waktu</p>
          </div>

          <div className="flex flex-wrap bg-[#F5F6F8] p-1 rounded-xl border border-zinc-200/60 gap-1">
            {(["Hari ini", "Harian", "Mingguan", "Bulanan", "Custom"] as FilterType[]).map((tab) => (
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
            <span className="font-semibold text-zinc-600">Pilih Tanggal:</span>
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

      {/* Transaction List */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-2xs divide-y divide-zinc-100 overflow-hidden">
        {transactions.map((trx) => (
          <div key={trx.id} className="p-4 md:p-5 flex justify-between items-center hover:bg-zinc-50/50 transition-colors">
            <div>
              <p className="text-xs md:text-sm font-bold text-[#212121]">{trx.id}</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">{trx.time}</p>
            </div>
            <div className="text-right">
              <p className="text-xs md:text-sm font-bold text-[#212121]">{trx.amount}</p>
              <span
                className={`text-[10px] px-3 py-0.5 rounded-full font-semibold inline-block mt-0.5 ${
                  trx.method === "Cash"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {trx.method}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}