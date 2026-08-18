"use client";

import { useState } from "react";

const dummyKaryawan = [
  { id: 1, name: "Bud Santoso", role: "Tenant", status: "Aktif" },
  { id: 2, name: "Siti Aminah", role: "Tenant", status: "Aktif" },
  { id: 3, name: "Ahmad Fauzi", role: "Tenant", status: "Aktif" },
  { id: 4, name: "Dewi Lestari", role: "Tenant", status: "Izin" },
];

const dummyAbsensi = [
  { id: 1, name: "Bud Santoso", checkIn: "08:05", checkOut: "17:02", status: "Hadir" },
  { id: 2, name: "Siti Aminah", checkIn: "08:10", checkOut: "17:15", status: "Hadir" },
  { id: 3, name: "Ahmad Fauzi", checkIn: "-", checkOut: "-", status: "Izin" },
  { id: 4, name: "Dewi Lestari", checkIn: "-", checkOut: "-", status: "Sakit" },
];

export default function KaryawanPage() {
  const [mainTab, setMainTab] = useState<"Data" | "Absensi">("Data");
  const [subCategory, setSubCategory] = useState<"Produksi" | "Tenant">("Tenant");

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200/80 flex justify-between items-center shadow-2xs">
        <div>
          <h1 className="text-base md:text-xl font-bold text-[#212121]">Kelola Karyawan</h1>
          <p className="text-xs text-zinc-400 mt-0.5">Manajemen staf dan riwayat absensi harian</p>
        </div>
      </div>

      {/* MOBILE TAB SWITCHER (Hidden on Desktop) */}
      <div className="flex md:hidden bg-white p-1 rounded-2xl border border-zinc-200/80">
        <button
          onClick={() => setMainTab("Data")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            mainTab === "Data" ? "bg-[#E52424] text-white" : "text-zinc-500"
          }`}
        >
          Data Karyawan
        </button>
        <button
          onClick={() => setMainTab("Absensi")}
          className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all ${
            mainTab === "Absensi" ? "bg-[#E52424] text-white" : "text-zinc-500"
          }`}
        >
          Absensi Karyawan
        </button>
      </div>

      {/* RESPONSIVE GRID CONTAINER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SECTION: DATA KARYAWAN */}
        <div className={`space-y-4 ${mainTab === "Data" ? "block" : "hidden md:block"}`}>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-[#212121]">Data Karyawan</h2>
              <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl">
                {(["Produksi", "Tenant"] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSubCategory(cat)}
                    className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                      subCategory === cat ? "bg-white text-[#212121] shadow-xs" : "text-zinc-400"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="divide-y divide-zinc-100">
              {dummyKaryawan.map((emp) => (
                <div key={emp.id} className="py-3.5 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-[#212121]">{emp.name}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{emp.role}</p>
                  </div>
                  <span
                    className={`text-[10px] px-3 py-1 rounded-full font-semibold ${
                      emp.status === "Aktif"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {emp.status}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full py-2.5 bg-[#E52424] text-white font-semibold text-xs rounded-xl active:scale-98 transition-all">
              + Tambah Karyawan
            </button>
          </div>
        </div>

        {/* SECTION: ABSENSI KARYAWAN */}
        <div className={`space-y-4 ${mainTab === "Absensi" ? "block" : "hidden md:block"}`}>
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-[#212121]">Absensi Karyawan</h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#212121] bg-zinc-50 px-3 py-1 rounded-xl border border-zinc-200/60">
                <button className="text-zinc-400 font-bold">&lt;</button>
                <span>24 Mei 2024</span>
                <button className="text-zinc-400 font-bold">&gt;</button>
              </div>
            </div>

            <div className="divide-y divide-zinc-100">
              {dummyAbsensi.map((item) => (
                <div key={item.id} className="py-3.5 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-[#212121]">{item.name}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {item.checkIn} - {item.checkOut}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-3 py-1 rounded-full font-semibold ${
                      item.status === "Hadir"
                        ? "bg-emerald-50 text-emerald-600"
                        : item.status === "Izin"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full py-2.5 bg-zinc-800 text-white font-semibold text-xs rounded-xl active:scale-98 transition-all">
              Edit Absensi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}