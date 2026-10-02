"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

type FilterType = "Hari Ini" | "Mingguan" | "Bulanan" | "Custom";

type Tenant = {
  outletName: string;
  address: string | null;
  status: boolean;
  karyawans: {
    id: number;
    name: string;
    category: string;
    phone: string | null;
  }[];
};

type KomposisiItem = {
  id?: number;
  qtyPcs: number;
  childProduct?: {
    id?: number;
    namaProduk: string;
    category?: {
      id: number;
      name?: string;
      nama_kategori?: string;
    };
  };
};

type Transaksi = {
  id: number;
  invoice: string;
  namaProduk: string;
  pcs: number;
  pax: number;
  saus: string[] | string;
  subtotal: number;
  totalBayar: number;
  metodePembayaran: string;
  createdAt: string;
  kasir: { id: number; username: string } | null;
  produk?: {
    id?: number;
    namaProduk?: string;
    category?: {
      id: number;
      name?: string;
      nama_kategori?: string;
    };
    komposisi?: KomposisiItem[];
  };
  komposisi?: KomposisiItem[];
};

type TransaksiGroup = Omit<Transaksi, "pcs" | "pax" | "saus" | "namaProduk"> & {
  items: Transaksi[];
};

type BiayaOperasional = {
  id: number;
  outletId?: number;
  keterangan: string;
  biaya?: number;
  jumlah?: number;
  tanggal?: string;
  createdAt: string;
  user?: {
    username?: string;
    name?: string;
  };
};

function getComparisonRange(
  filter: FilterType,
  startValue: string,
  endValue: string,
  selectedMonth: string
) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  if (filter === "Hari Ini") {
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    return { start: yesterdayStart, end: new Date(todayStart.getTime() - 1), label: "kemarin" };
  }

  if (filter === "Mingguan") {
    const currentWeekStart = new Date(todayStart);
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay());
    const previousWeekStart = new Date(currentWeekStart);
    previousWeekStart.setDate(previousWeekStart.getDate() - 7);
    return {
      start: previousWeekStart,
      end: new Date(currentWeekStart.getTime() - 1),
      label: "minggu kemarin",
    };
  }

  if (filter === "Bulanan") {
    const [year, month] = selectedMonth.split("-").map(Number);
    const prevMonthStart = new Date(year, month - 2, 1);
    const currMonthStart = new Date(year, month - 1, 1);
    return {
      start: prevMonthStart,
      end: new Date(currMonthStart.getTime() - 1),
      label: "bulan sebelumnya",
    };
  }

  const start = new Date(startValue);
  const end = new Date(endValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  if (start > end) return null;
  const duration = end.getTime() - start.getTime() + 1;
  return {
    start: new Date(start.getTime() - duration),
    end: new Date(start.getTime() - 1),
    label: "periode sebelumnya",
  };
}

function sumTransactions(transactions: TransaksiGroup[], start: Date, end: Date) {
  return transactions.reduce((total, transaction) => {
    const date = new Date(transaction.createdAt);
    return date >= start && date <= end ? total + transaction.totalBayar : total;
  }, 0);
}

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [biayaList, setBiayaList] = useState<BiayaOperasional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("Hari Ini");

  const [customStart, setCustomStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6);
    return date.toISOString().slice(0, 10);
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().slice(0, 10));

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const response = await api.get<{ data?: Tenant }>(`/api/outlets/${id}`);
        setTenant(response.data.data ?? null);
      } catch (error) {
        console.error("Gagal mengambil detail tenant:", error);
        setTenant(null);
      }
    };

    const fetchTransaksi = async () => {
      try {
        const response = await api.get<{ data?: Transaksi[] }>(
          `/api/penjualan/outlet/${id}`
        );
        setTransaksiList(response.data.data ?? []);
      } catch (error) {
        console.error("Gagal mengambil riwayat transaksi:", error);
        setTransaksiList([]);
      }
    };

    const fetchBiayaOperasional = async () => {
      try {
        const response = await api.get<{ data?: BiayaOperasional[] }>(
          `/api/biaya-operasional/tenant/${id}`
        );
        setBiayaList(response.data.data ?? []);
      } catch (error) {
        console.error("Gagal mengambil biaya operasional:", error);
        setBiayaList([]);
      }
    };

    const loadData = async () => {
      if (Number.isInteger(id)) {
        setIsLoading(true);
        await Promise.all([fetchTenant(), fetchTransaksi(), fetchBiayaOperasional()]);
        setIsLoading(false);
      }
    };

    void loadData();
  }, [id]);

  const uniqueTransaksi = useMemo(() => {
    const groups: TransaksiGroup[] = [];
    transaksiList.forEach((trx) => {
      const group = groups.find((item) => item.invoice === trx.invoice);
      if (group) {
        group.items.push(trx);
      } else {
        groups.push({ ...trx, items: [trx] });
      }
    });
    return groups;
  }, [transaksiList]);

  const filteredTransaksi = useMemo(() => {
    const now = new Date();

    return uniqueTransaksi.filter((trx) => {
      const trxDate = new Date(trx.createdAt);

      if (filter === "Hari Ini") {
        return trxDate.toDateString() === now.toDateString();
      }

      if (filter === "Mingguan") {
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(now.getDate() - now.getDay());
        firstDayOfWeek.setHours(0, 0, 0, 0);
        return trxDate >= firstDayOfWeek;
      }

      if (filter === "Bulanan") {
        const [year, month] = selectedMonth.split("-").map(Number);
        return (
          trxDate.getMonth() === month - 1 &&
          trxDate.getFullYear() === year
        );
      }

      if (filter === "Custom") {
        const start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        return trxDate >= start && trxDate <= end;
      }

      return true;
    });
  }, [uniqueTransaksi, filter, customStart, customEnd, selectedMonth]);

  const filteredBiaya = useMemo(() => {
    const now = new Date();

    return biayaList.filter((b) => {
      const bDate = new Date(b.createdAt);

      if (filter === "Hari Ini") {
        return bDate.toDateString() === now.toDateString();
      }

      if (filter === "Mingguan") {
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(now.getDate() - now.getDay());
        firstDayOfWeek.setHours(0, 0, 0, 0);
        return bDate >= firstDayOfWeek;
      }

      if (filter === "Bulanan") {
        const [year, month] = selectedMonth.split("-").map(Number);
        return (
          bDate.getMonth() === month - 1 &&
          bDate.getFullYear() === year
        );
      }

      if (filter === "Custom") {
        const start = new Date(customStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(customEnd);
        end.setHours(23, 59, 59, 999);
        return bDate >= start && bDate <= end;
      }

      return true;
    });
  }, [biayaList, filter, customStart, customEnd, selectedMonth]);

  const totalBiayaOperasional = useMemo(() => {
    return filteredBiaya.reduce((sum, item) => sum + Number(item.biaya || item.jumlah || 0), 0);
  }, [filteredBiaya]);

  const { totalOmset, cashOmset, qrisOmset, cashPercent, qrisPercent } =
    useMemo(() => {
      const total = filteredTransaksi.reduce(
        (sum, trx) => sum + trx.totalBayar,
        0
      );
      const cash = filteredTransaksi
        .filter((trx) => trx.metodePembayaran?.toLowerCase() === "cash")
        .reduce((sum, trx) => sum + trx.totalBayar, 0);
      const qris = filteredTransaksi
        .filter((trx) => trx.metodePembayaran?.toLowerCase() === "qris")
        .reduce((sum, trx) => sum + trx.totalBayar, 0);

      const cPercent = total > 0 ? Math.round((cash / total) * 100) : 0;
      const qPercent = total > 0 ? 100 - cPercent : 0;

      return {
        totalOmset: total,
        cashOmset: cash,
        qrisOmset: qris,
        cashPercent: cPercent,
        qrisPercent: qPercent,
      };
    }, [filteredTransaksi]);

  // Kalkulasi Cash Bersih Storan (Total Cash dikurangi Biaya Operasional)
  const cashBersihStoran = useMemo(() => {
    return cashOmset - totalBiayaOperasional;
  }, [cashOmset, totalBiayaOperasional]);

  const recapProduk = useMemo(() => {
    const map: Record<string, { namaKategori: string; totalPcs: number; totalPax: number }> = {};

    filteredTransaksi.forEach((trx) => {
      trx.items.forEach((item) => {
        const namaKategori =
          item.produk?.category?.name ||
          item.produk?.category?.nama_kategori ||
          item.produk?.namaProduk ||
          item.namaProduk ||
          "Lainnya";

        const totalPcsItem = Number(item.pcs || 1) * Number(item.pax || 1);
        const paxItem = Number(item.pax || 1);

        if (!map[namaKategori]) {
          map[namaKategori] = {
            namaKategori,
            totalPcs: 0,
            totalPax: 0,
          };
        }

        map[namaKategori].totalPcs += totalPcsItem;
        map[namaKategori].totalPax += paxItem;
      });
    });

    return Object.values(map);
  }, [filteredTransaksi]);

  const comparison = useMemo(() => {
    const range = getComparisonRange(filter, customStart, customEnd, selectedMonth);
    if (!range) return null;

    const previousOmset = sumTransactions(uniqueTransaksi, range.start, range.end);
    if (previousOmset === 0) {
      return { percent: null, label: range.label };
    }

    return {
      percent: Math.round(((totalOmset - previousOmset) / previousOmset) * 100),
      label: range.label,
    };
  }, [customEnd, customStart, filter, selectedMonth, totalOmset, uniqueTransaksi]);

  const { chartData, xAxisLabel } = useMemo(() => {
    let groups: { label: string; amount: number }[] = [];
    let xLabel = "";

    if (filter === "Hari Ini") {
      xLabel = "Jam";
      const hours = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
      groups = hours.map((h) => ({ label: h, amount: 0 }));

      filteredTransaksi.forEach((trx) => {
        const hour = new Date(trx.createdAt).getHours();
        let index = Math.floor((hour - 8) / 2);
        if (index < 0) index = 0;
        if (index >= groups.length) index = groups.length - 1;
        groups[index].amount += trx.totalBayar;
      });
    } else if (filter === "Mingguan") {
      xLabel = "Hari";
      const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
      groups = days.map((d) => ({ label: d, amount: 0 }));

      filteredTransaksi.forEach((trx) => {
        const dayIdx = (new Date(trx.createdAt).getDay() + 6) % 7;
        groups[dayIdx].amount += trx.totalBayar;
      });
    } else if (filter === "Bulanan") {
      xLabel = "Tanggal dalam Bulan Ini";
      const [year, month] = selectedMonth.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();

      groups = Array.from({ length: daysInMonth }, (_, i) => ({
        label: String(i + 1),
        amount: 0,
      }));

      filteredTransaksi.forEach((trx) => {
        const dateObj = new Date(trx.createdAt);
        const dayIdx = dateObj.getDate() - 1;
        if (groups[dayIdx]) {
          groups[dayIdx].amount += trx.totalBayar;
        }
      });
    } else {
      xLabel = "Tanggal";
      const mapDates = new Map<string, number>();
      filteredTransaksi.forEach((trx) => {
        const dStr = new Date(trx.createdAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
        });
        mapDates.set(dStr, (mapDates.get(dStr) || 0) + trx.totalBayar);
      });

      groups = Array.from(mapDates.entries()).map(([label, amount]) => ({
        label,
        amount,
      }));

      if (groups.length === 0) {
        groups = [{ label: "-", amount: 0 }];
      }
    }

    const maxAmount = Math.max(...groups.map((g) => g.amount), 1);

    const formattedChart = groups.map((g) => ({
      label: g.label,
      val: Math.round((g.amount / maxAmount) * 100),
      amountFormatted:
        g.amount >= 1000000
          ? `${(g.amount / 1000000).toFixed(1)}M`
          : g.amount >= 1000
            ? `${Math.round(g.amount / 1000)}rb`
            : `Rp ${g.amount}`,
    }));

    return { chartData: formattedChart, xAxisLabel: xLabel };
  }, [filteredTransaksi, filter, selectedMonth]);

  if (isLoading) {
    return <p className="text-sm text-zinc-500 p-6">Memuat detail tenant...</p>;
  }

  if (!tenant) {
    return <p className="text-sm text-zinc-500 p-6">Tenant tidak ditemukan.</p>;
  }

  return (
    <div className="space-y-6">
      {/* HEADER & FILTER SECTION */}
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
              <h1 className="text-base md:text-xl font-bold text-[#212121]">
                {tenant.outletName}
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                {tenant.address ?? "Alamat belum diisi"} ·{" "}
                <span
                  className={`font-semibold ${tenant.status ? "text-green-600" : "text-zinc-500"}`}
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${filter === tab
                    ? "bg-[#E52424] text-white shadow-xs"
                    : "text-zinc-500 hover:text-zinc-900"
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filter === "Bulanan" && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-100 text-xs">
            <span className="font-semibold text-zinc-600">Pilih Bulan Laporan:</span>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 border border-zinc-200 rounded-lg text-zinc-700 font-medium outline-none focus:border-[#E52424] bg-white"
            />
          </div>
        )}

        {filter === "Custom" && (
          <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-zinc-100 text-xs">
            <span className="font-semibold text-zinc-600">Pilih Rentang Tanggal:</span>
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
      </div>

      {/* OMSET + GRAFIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Omset ({filter === "Bulanan" ? `Bulan ${selectedMonth}` : filter})
            </span>
            <h2 className="text-3xl font-extrabold text-[#212121] mt-1">
              Rp {totalOmset.toLocaleString("id-ID")}
            </h2>
            {comparison && (
              <div
                className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${comparison.percent === null
                    ? "bg-zinc-100 text-zinc-500"
                    : comparison.percent >= 0
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  }`}
              >
                {comparison.percent === null ? (
                  <span>Belum ada data {comparison.label}</span>
                ) : (
                  <>
                    <span>{comparison.percent >= 0 ? "↑" : "↓"}</span>
                    <span>{Math.abs(comparison.percent)}%</span>
                    <span className="text-zinc-400 font-normal">
                      dari {comparison.label}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-zinc-100 space-y-2.5">
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Rincian Pembayaran
            </span>

            <div className="flex justify-between items-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1E88E5]"></span>
                <span className="text-xs font-semibold text-zinc-600">Cash</span>
              </div>
              <span className="text-xs font-bold text-[#212121]">
                Rp {cashOmset.toLocaleString("id-ID")}
              </span>
            </div>

            <div className="flex justify-between items-center bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E52424]"></span>
                <span className="text-xs font-semibold text-zinc-600">QRIS</span>
              </div>
              <span className="text-xs font-bold text-[#212121]">
                Rp {qrisOmset.toLocaleString("id-ID")}
              </span>
            </div>

            {/* BARIS TAMBAHAN: Cash Bersih Storan */}
            <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-200/60 pt-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                <span className="text-xs font-bold text-emerald-900">Cash Bersih Storan</span>
              </div>
              <span className="text-xs font-extrabold text-emerald-700">
                Rp {cashBersihStoran.toLocaleString("id-ID")}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-bold text-[#212121]">
                Grafik Pertumbuhan Omset
              </p>
              <p className="text-[11px] text-zinc-400">
                Visualisasi tren penjualan tenant ini ({filter === "Bulanan" ? selectedMonth : filter})
              </p>
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

              <div className="flex-1 relative flex items-end justify-between gap-1 pl-3 pt-4 border-b border-zinc-200 overflow-x-auto">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1">
                  <div className="border-b border-dashed border-zinc-100 w-full"></div>
                  <div className="border-b border-dashed border-zinc-100 w-full"></div>
                  <div className="border-b border-dashed border-zinc-100 w-full"></div>
                  <div className="border-b border-dashed border-zinc-100 w-full"></div>
                  <div></div>
                </div>

                {chartData.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative z-10 min-w-[12px]"
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-7 bg-zinc-900 text-white text-[10px] py-1 px-2 rounded shadow-md pointer-events-none z-20 font-bold whitespace-nowrap">
                      {item.label}: {item.amountFormatted}
                    </div>

                    <div className="w-full max-w-[24px] bg-zinc-100/80 rounded-t-lg h-full flex items-end overflow-hidden">
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
              <div className="flex justify-between gap-1">
                {chartData.map((item, idx) => (
                  <span
                    key={idx}
                    className={`flex-1 text-center text-[9px] font-semibold text-zinc-500 truncate ${filter === "Bulanan" && idx % 3 !== 0 ? "hidden md:inline" : ""
                      }`}
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
      </div>

      {/* UANG OPERASIONAL SECTION */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
              Uang Operasional ({filter === "Bulanan" ? selectedMonth : filter})
            </h2>
          </div>
          <span className="text-xs font-extrabold text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200/60">
            Total: Rp {totalBiayaOperasional.toLocaleString("id-ID")}
          </span>
        </div>

        {filteredBiaya.length === 0 ? (
          <p className="text-xs text-zinc-400 py-6 text-center italic">
            Belum ada catatan uang operasional pada periode ini.
          </p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredBiaya.map((item: any) => {
              const nominal = Number(item.biaya || item.jumlah || 0);
              // Mengambil teks keterangan dari berbagai kemungkinan nama kolom backend
              const keteranganTeks = item.deskripsi
              const authorName = item.user?.name || item.user?.username;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-[#212121] leading-tight text-sm">
                      {keteranganTeks}
                    </p>
                    <p className="text-[11px] font-medium text-zinc-400">
                      {new Date(item.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })} · {new Date(item.createdAt).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} WIB {authorName ? `· Oleh: ${authorName}` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="bg-amber-50 text-amber-700 font-mono text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-200/50">
                      Rp {nominal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REKAP JENIS DIMSUM (KATEGORI) */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-zinc-100 text-zinc-700 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h2 className="text-xs font-bold text-[#212121] uppercase tracking-wider">
              Rekap Jenis Dimsum ({filter === "Bulanan" ? selectedMonth : filter})
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200/80">
            {recapProduk.length} Kategori
          </span>
        </div>

        {recapProduk.length === 0 ? (
          <p className="text-xs text-zinc-400 py-6 text-center italic">
            Belum ada data rekap kategori keluar pada periode ini.
          </p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {recapProduk.map((item) => (
              <div
                key={item.namaKategori}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-[#212121] leading-tight text-sm">
                    {item.namaKategori}
                  </p>
                  <p className="text-[11px] font-medium text-zinc-400">
                    Terjual dalam {item.totalPax} Pax
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <span className="bg-[#212121] text-white font-mono text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs">
                    {item.totalPcs} <span className="text-[10px] font-normal text-zinc-300">Pcs</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PERSENTASE PEMBAYARAN + DATA KARYAWAN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
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
                  strokeDasharray={`${cashPercent} ${100 - cashPercent}`}
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
                  strokeDasharray={`${qrisPercent} ${100 - qrisPercent}`}
                  strokeDashoffset={`-${cashPercent}`}
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
                <span className="font-bold text-[#212121] text-xs">
                  {cashPercent}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#E52424]"></span>
                  <span className="font-semibold text-zinc-600 text-xs">QRIS</span>
                </div>
                <span className="font-bold text-[#212121] text-xs">
                  {qrisPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-[#212121]">Data Karyawan</h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Karyawan yang bertugas di tenant ini
              </p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-500">
              {tenant.karyawans.length} orang
            </span>
          </div>

          {tenant.karyawans.length === 0 ? (
            <p className="text-xs text-zinc-400 py-4 text-center">
              Belum ada karyawan terdaftar di tenant ini.
            </p>
          ) : (
            <div className="divide-y divide-zinc-100">
              {tenant.karyawans.map((emp) => (
                <div
                  key={emp.id}
                  className="py-3 flex justify-between items-center"
                >
                  <div>
                    <p className="text-xs font-bold text-[#212121]">
                      {emp.name}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {emp.category}
                      {emp.phone && <span> · {emp.phone}</span>}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-green-50 text-green-600">
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIWAYAT TRANSAKSI */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-[#212121]">Riwayat Transaksi</h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Transaksi tenant pada periode {filter === "Bulanan" ? `bulan ${selectedMonth}` : filter.toLowerCase()}
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-500 shrink-0">
            {filteredTransaksi.length} transaksi
          </span>
        </div>

        {filteredTransaksi.length === 0 ? (
          <p className="text-xs text-zinc-400 py-6 text-center">
            Belum ada transaksi pada periode ini.
          </p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {filteredTransaksi.map((trx) => (
              <div key={trx.invoice} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#212121] truncate">{trx.invoice}</p>
                  <div className="mt-1 space-y-0.5">
                    {trx.items.map((item) => (
                      <p key={item.id} className="text-[11px] text-zinc-600 truncate">
                        {item.produk?.namaProduk || item.namaProduk || "Produk"} · {item.pcs} pcs · {item.pax} pax
                      </p>
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                    {new Date(trx.createdAt).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })} · {new Date(trx.createdAt).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} WIB
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-[#212121]">
                    Rp {Number(trx.totalBayar).toLocaleString("id-ID")}
                  </p>
                  <span className="text-[10px] text-zinc-400 uppercase">
                    {trx.metodePembayaran || "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}