"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";

import KasirHeader from "@/components/kasir/KasirHeader";
import BottomNavigation from "@/components/kasir/BottomNavigation";

interface Category {
  id: number;
  name?: string;
  nama_kategori?: string;
}

interface ItemPenjualan {
  id: number;
  namaProduk: string;
  pcs: number;
  pax: number;
  saus: string[] | string;
  subtotal: number;
  produk?: {
    id?: number;
    namaProduk?: string;
    category?: Category;
  };
}

interface TransaksiGroup {
  invoice: string;
  totalBayar: number;
  metodePembayaran: string;
  createdAt: string;
  kasir?: {
    id?: number | string;
    nama: string;
    username: string;
  };
  items: ItemPenjualan[];
}

interface BiayaOperasional {
  id: number | string;
  deskripsi: string;
  biaya: number;
}

interface DimsumBawa {
  id?: number | string;
  categoryId?: number;
  category_id?: number;
  jumlahPcs?: number;
  jumlah_bawa?: number;
  jumlah_pcs?: number;
  category?: Category;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

export default function KasirHistoryPage() {
  const [transaksiList, setTransaksiList] = useState<TransaksiGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<"ALL" | "Cash" | "QRIS" | "Online">("ALL");

  // Operational Cost States
  const [biayaList, setBiayaList] = useState<BiayaOperasional[]>([]);
  const [inputDeskripsi, setInputDeskripsi] = useState("");
  const [inputBiaya, setInputBiaya] = useState("");
  const [isSubmittingBiaya, setIsSubmittingBiaya] = useState(false);

  // Categories & Stock States (Dimsum Dibawa DB)
  const [categories, setCategories] = useState<Category[]>([]);
  const [stockInputs, setStockInputs] = useState<Record<number, string>>({});
  const [dimsumBawaData, setDimsumBawaData] = useState<Record<number, DimsumBawa>>({});
  const [editingCategory, setEditingCategory] = useState<Record<number, boolean>>({});
  const [isSavingStock, setIsSavingStock] = useState<Record<number, boolean>>({});

  const fetchCategories = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(`${API_BASE}/api/categories`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.data.success || Array.isArray(response.data.data)) {
        const catData: Category[] = response.data.data || response.data;
        setCategories(catData);
      }
    } catch (err) {
      console.error("Gagal memuat daftar kategori:", err);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Sesi login tidak ditemukan. Silakan login kembali.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE}/api/penjualan/my-history`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const rawData = response.data.data || [];
        const todayKey = new Intl.DateTimeFormat("en-CA", {
          timeZone: "Asia/Jakarta",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date());

        const todayData = rawData.filter(
          (item: any) =>
            item.createdAt &&
            new Intl.DateTimeFormat("en-CA", {
              timeZone: "Asia/Jakarta",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }).format(new Date(item.createdAt)) === todayKey
        );

        const grouped = todayData.reduce(
          (acc: Record<string, TransaksiGroup>, item: any) => {
            const inv = item.invoice;
            if (!acc[inv]) {
              acc[inv] = {
                invoice: item.invoice,
                totalBayar: Number(item.totalBayar || 0),
                metodePembayaran: item.metodePembayaran || "Cash",
                createdAt: item.createdAt,
                kasir: item.kasir,
                items: [],
              };
            }

            let parsedSaus = [];
            if (typeof item.saus === "string") {
              try {
                parsedSaus = JSON.parse(item.saus);
              } catch {
                parsedSaus = item.saus ? [item.saus] : [];
              }
            } else if (Array.isArray(item.saus)) {
              parsedSaus = item.saus;
            }

            acc[inv].items.push({
              id: item.id,
              namaProduk: item.namaProduk,
              pcs: Number(item.pcs || 1),
              pax: Number(item.pax || 1),
              saus: parsedSaus,
              subtotal: Number(item.subtotal || 0),
              produk: item.produk,
            });
            return acc;
          },
          {}
        );

        setTransaksiList(Object.values(grouped));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Gagal memuat riwayat transaksi.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBiayaOperasional = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${API_BASE}/api/biaya-operasional`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setBiayaList(response.data.data || []);
      }
    } catch (err) {
      console.error("Gagal memuat biaya operasional", err);
    }
  }, []);

  const fetchDimsumBawaToday = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.get(`${API_BASE}/api/dimsum-bawa/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const list: DimsumBawa[] = response.data.data || (Array.isArray(response.data) ? response.data : []);
      const bawaMap: Record<number, DimsumBawa> = {};
      const inputsMap: Record<number, string> = {};

      list.forEach((item) => {
        const catId = item.categoryId || item.category_id || item.category?.id;
        const pcs = item.jumlah_bawa ?? item.jumlahPcs ?? item.jumlah_pcs ?? 0;

        if (catId) {
          bawaMap[catId] = { ...item, jumlahPcs: Number(pcs) };
          inputsMap[catId] = String(pcs);
        }
      });

      setDimsumBawaData(bawaMap);
      setStockInputs((prev) => ({ ...inputsMap, ...prev }));
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.warn("Endpoint /api/dimsum-bawa/today belum terpasang di backend server.");
      } else {
        console.error("Gagal memuat data dimsum dibawa hari ini:", err);
      }
    }
  }, []);

  useEffect(() => {
    fetchHistory();
    fetchBiayaOperasional();
    fetchCategories();
    fetchDimsumBawaToday();
  }, [fetchHistory, fetchBiayaOperasional, fetchCategories, fetchDimsumBawaToday]);

  const handleAddBiaya = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDeskripsi.trim() || !inputBiaya) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setIsSubmittingBiaya(true);
      await axios.post(
        `${API_BASE}/api/biaya-operasional`,
        { deskripsi: inputDeskripsi, biaya: Number(inputBiaya) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInputDeskripsi("");
      setInputBiaya("");
      fetchBiayaOperasional();
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menambahkan biaya operasional.");
    } finally {
      setIsSubmittingBiaya(false);
    }
  };

  const handleDeleteBiaya = async (id: string | number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus biaya ini?")) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await axios.delete(`${API_BASE}/api/biaya-operasional/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        fetchBiayaOperasional();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menghapus biaya operasional.");
    }
  };

  // Simpan / Update Dimsum Dibawa ke DB
  const handleSaveCategoryStock = async (catId: number, e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    const rawInput = stockInputs[catId];
    const val = rawInput !== undefined && rawInput !== "" ? Number(rawInput) : 0;

    if (isNaN(val) || val < 0) {
      alert("Jumlah dimsum dibawa harus berupa angka valid");
      return;
    }

    const existingData = dimsumBawaData[catId];

    try {
      setIsSavingStock((prev) => ({ ...prev, [catId]: true }));

      const payload = {
        categoryId: catId,
        category_id: catId,
        jumlahPcs: val,
        jumlah_bawa: val,
      };

      if (existingData && existingData.id) {
        await axios.put(
          `${API_BASE}/api/dimsum-bawa/${existingData.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_BASE}/api/dimsum-bawa`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      await fetchDimsumBawaToday();
      setEditingCategory((prev) => ({ ...prev, [catId]: false }));
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal menyimpan stok dimsum dibawa ke database.");
    } finally {
      setIsSavingStock((prev) => ({ ...prev, [catId]: false }));
    }
  };

  // Filtered Transaksi
  const filteredTransaksi = useMemo(() => {
    return transaksiList.filter((trx) => {
      const matchSearch =
        trx.invoice.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trx.items.some((i) => i.namaProduk.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchPayment =
        selectedPayment === "ALL" ||
        trx.metodePembayaran.toLowerCase() === selectedPayment.toLowerCase();

      return matchSearch && matchPayment;
    });
  }, [transaksiList, searchQuery, selectedPayment]);

  // Financial Stats
  const totalOmzet = useMemo(() => transaksiList.reduce((sum, trx) => sum + trx.totalBayar, 0), [transaksiList]);
  const cashMasuk = useMemo(() => transaksiList.filter((trx) => trx.metodePembayaran.toLowerCase() === "cash").reduce((sum, trx) => sum + trx.totalBayar, 0), [transaksiList]);
  const qrisMasuk = useMemo(() => transaksiList.filter((trx) => trx.metodePembayaran.toLowerCase() === "qris").reduce((sum, trx) => sum + trx.totalBayar, 0), [transaksiList]);
  const onlineMasuk = useMemo(() => transaksiList.filter((trx) => trx.metodePembayaran.toLowerCase() === "online").reduce((sum, trx) => sum + trx.totalBayar, 0), [transaksiList]);
  const totalBiayaOperasional = useMemo(() => biayaList.reduce((sum, item) => sum + Number(item.biaya || 0), 0), [biayaList]);
  const cashBersih = useMemo(() => cashMasuk - totalBiayaOperasional, [cashMasuk, totalBiayaOperasional]);

  // Rekap Terjual per Kategori
  const recapByCategoryId = useMemo(() => {
    const map: Record<string, { catId?: number; namaKategori: string; totalPcs: number; totalPax: number }> = {};

    transaksiList.forEach((trx) => {
      trx.items.forEach((item) => {
        const catObj = item.produk?.category;
        const catName = catObj?.name || catObj?.nama_kategori || "Lainnya";
        const catId = catObj?.id;

        const key = catId ? `id_${catId}` : catName;
        const totalPcsItem = Number(item.pcs || 1) * Number(item.pax || 1);
        const paxItem = Number(item.pax || 1);

        if (!map[key]) {
          map[key] = { catId, namaKategori: catName, totalPcs: 0, totalPax: 0 };
        }

        map[key].totalPcs += totalPcsItem;
        map[key].totalPax += paxItem;
      });
    });

    return map;
  }, [transaksiList]);

  const recapProdukList = useMemo(() => Object.values(recapByCategoryId), [recapByCategoryId]);

  // Grand Total Overall
  const totalStokDibawaOverall = useMemo(
    () => Object.values(dimsumBawaData).reduce((a, b) => a + Number(b.jumlahPcs || 0), 0),
    [dimsumBawaData]
  );
  const totalStokTerjualOverall = useMemo(() => recapProdukList.reduce((a, b) => a + b.totalPcs, 0), [recapProdukList]);
  const totalStokSisaOverall = useMemo(() => totalStokDibawaOverall - totalStokTerjualOverall, [totalStokDibawaOverall, totalStokTerjualOverall]);

  return (
    <main className="min-h-screen bg-slate-100/60 pb-28 text-slate-800 antialiased">
      <KasirHeader title="Laporan & Riwayat Penjualan" />

      <div className="max-w-md mx-auto px-4 py-6 space-y-5">
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              Laporan Hari Ini
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Rekapitulasi Omzet, Kas, dan Biaya Operasional
            </p>
          </div>

          <button
            onClick={() => {
              fetchHistory();
              fetchBiayaOperasional();
              fetchCategories();
              fetchDimsumBawaToday();
            }}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 text-slate-500 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {/* Dashboard Stat Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1 col-span-2">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Omzet
            </span>
            <p className="text-lg font-bold text-slate-900 tracking-tight">
              Rp {totalOmzet.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Cash Masuk</span>
            <p className="text-base font-bold text-slate-900 tracking-tight">
              Rp {cashMasuk.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">QRIS</span>
            <p className="text-base font-bold text-slate-900 tracking-tight">
              Rp {qrisMasuk.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Online</span>
            <p className="text-base font-bold text-slate-900 tracking-tight">
              Rp {onlineMasuk.toLocaleString("id-ID")}
            </p>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 space-y-1">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Biaya Operasional</span>
            <p className="text-base font-bold text-slate-900 tracking-tight">
              Rp {totalBiayaOperasional.toLocaleString("id-ID")}
            </p>
          </div>
        </div>

        {/* Highlight Cash Bersih */}
        <div className="bg-slate-900 text-white p-4.5 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                Cash Bersih (Cash - Biaya)
              </span>
              <p className="text-xl font-bold text-white tracking-tight">
                Rp {cashBersih.toLocaleString("id-ID")}
              </p>
            </div>
            <div className="w-9 h-9 bg-slate-800 border border-slate-700/80 rounded-lg flex items-center justify-center text-slate-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* INPUT STOK DIMSUM PER KATEGORI */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-100 text-slate-700 rounded-md flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Input Stok Dimsum Per Kategori
              </h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {categories.length} Kategori
            </span>
          </div>

          {categories.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-2">
              Memuat kategori...
            </p>
          ) : (
            <div className="space-y-3 divide-y divide-slate-100">
              {categories.map((cat) => {
                const catName = cat.name || cat.nama_kategori || `Kategori #${cat.id}`;
                const hasBawa = dimsumBawaData[cat.id] !== undefined;
                const bawaPcs = dimsumBawaData[cat.id]?.jumlahPcs;
                const isEditing = editingCategory[cat.id] || !hasBawa;
                const isSaving = isSavingStock[cat.id] || false;

                return (
                  <div key={cat.id} className="pt-3 first:pt-0 flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 w-1/3 truncate">
                      {catName}
                    </span>

                    {isEditing ? (
                      <form
                        onSubmit={(e) => handleSaveCategoryStock(cat.id, e)}
                        className="flex items-center gap-1.5 flex-1 justify-end"
                      >
                        <input
                          type="number"
                          placeholder="Pcs"
                          value={stockInputs[cat.id] ?? ""}
                          onChange={(e) => setStockInputs((prev) => ({ ...prev, [cat.id]: e.target.value }))}
                          className="w-24 px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800 placeholder:text-slate-400 text-center"
                          min="0"
                          disabled={isSaving}
                        />
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                        >
                          {isSaving ? "..." : "Simpan"}
                        </button>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                          {bawaPcs} Pcs
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingCategory((prev) => ({ ...prev, [cat.id]: true }))}
                          className="text-[10px] text-slate-400 hover:text-slate-700 underline"
                        >
                          Ubah
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* REKAP JENIS DIMSUM (KATEGORI) HARI INI */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-100 text-slate-700 rounded-md flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Rekap Jenis Dimsum (Kategori) Hari Ini
              </h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
              {recapProdukList.length} Kategori
            </span>
          </div>

          {recapProdukList.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-3">
              Belum ada data rekap kategori keluar hari ini.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {recapProdukList.map((item) => (
                <div key={item.namaKategori} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800 leading-tight">
                      {item.namaKategori}
                    </p>
                    <p className="text-[10px] font-medium text-slate-400">
                      Terjual dalam {item.totalPax} Pax
                    </p>
                  </div>
                  <span className="bg-slate-900 text-white font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                    {item.totalPcs} <span className="text-[10px] font-normal text-slate-300">Pcs</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LIST SISA DIMSUM PER KATEGORI */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-slate-100 text-slate-700 rounded-md flex items-center justify-center">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Sisa Stok Dimsum Hari Ini
              </h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
              {categories.length} Kategori
            </span>
          </div>

          {categories.length === 0 ? (
            <p className="text-xs text-slate-400 italic text-center py-3">
              Belum ada data sisa stok.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {categories.map((cat) => {
                const catName = cat.name || cat.nama_kategori || `Kategori #${cat.id}`;
                const key = `id_${cat.id}`;
                const terjualPcs = recapByCategoryId[key]?.totalPcs || 0;
                const bawaObj = dimsumBawaData[cat.id];
                const bawaPcs = bawaObj !== undefined ? Number(bawaObj.jumlahPcs || 0) : null;
                const sisaPcs = bawaPcs !== null ? bawaPcs - terjualPcs : null;

                return (
                  <div key={cat.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 text-xs">
                    <div>
                      <p className="font-semibold text-slate-800 leading-tight">
                        {catName}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400">
                        Dibawa: {bawaPcs !== null ? `${bawaPcs} Pcs` : "-"} | Terjual: {terjualPcs} Pcs
                      </p>
                    </div>

                    <span className={`font-mono text-xs font-bold px-2.5 py-1 rounded-lg ${sisaPcs !== null ? (sisaPcs < 0 ? "bg-red-100 text-red-700" : "bg-slate-900 text-white") : "bg-slate-100 text-slate-400"}`}>
                      {sisaPcs !== null ? `${sisaPcs} Pcs` : "Belum diisi"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Form & List Biaya Operasional */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Biaya Operasional Hari Ini
            </h2>
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {biayaList.length} Item
            </span>
          </div>

          <form onSubmit={handleAddBiaya} className="space-y-2.5">
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7">
                <input
                  type="text"
                  placeholder="Deskripsi (contoh: Beli Es)"
                  value={inputDeskripsi}
                  onChange={(e) => setInputDeskripsi(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>
              <div className="col-span-5">
                <input
                  type="number"
                  placeholder="Biaya (Rp)"
                  value={inputBiaya}
                  onChange={(e) => setInputBiaya(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800 placeholder:text-slate-400"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmittingBiaya}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
            >
              {isSubmittingBiaya ? "Menyimpan..." : "+ Tambah Biaya Operasional"}
            </button>
          </form>

          {/* List Item Biaya */}
          <div className="pt-2 border-t border-slate-100">
            {biayaList.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-xs text-slate-400 italic">Belum ada pengeluaran operasional hari ini.</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {biayaList.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between bg-slate-50/80 px-3 py-2 rounded-lg border border-slate-200/60 text-xs"
                  >
                    <span className="font-medium text-slate-700 truncate max-w-[180px]">
                      {b.deskripsi}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900">
                        - Rp {Number(b.biaya).toLocaleString("id-ID")}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteBiaya(b.id)}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
                        title="Hapus Biaya"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Search & Filter Section */}
        <div className="space-y-2.5 pt-1">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari Invoice atau Nama Produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800 placeholder:text-slate-400 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(["ALL", "Cash", "QRIS", "Online"] as const).map((method) => (
              <button
                key={method}
                onClick={() => setSelectedPayment(method)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                  selectedPayment === method
                    ? "bg-slate-900 text-white"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {method === "ALL" ? "Semua Metode" : method}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section Transaksi */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200/80 p-4 animate-pulse space-y-3">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div className="w-24 h-4 bg-slate-200 rounded" />
                  <div className="w-12 h-4 bg-slate-200 rounded" />
                </div>
                <div className="space-y-2">
                  <div className="w-3/4 h-3.5 bg-slate-200 rounded" />
                  <div className="w-1/2 h-3 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl border border-slate-200 p-6 text-center">
            <p className="text-xs font-medium text-slate-700">{error}</p>
            <button
              onClick={() => {
                fetchHistory();
                fetchBiayaOperasional();
                fetchCategories();
                fetchDimsumBawaToday();
              }}
              className="mt-3 px-3 py-1.5 bg-slate-900 text-white font-medium text-xs rounded-lg transition"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredTransaksi.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center">
            <p className="text-xs font-bold text-slate-800">Transaksi Tidak Ditemukan</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {searchQuery || selectedPayment !== "ALL"
                ? "Tidak ada data riwayat yang cocok dengan filter pencarian Anda."
                : "Belum ada riwayat transaksi penjualan yang tercatat hari ini."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransaksi.map((trx) => (
              <div key={trx.invoice} className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                <div className="bg-slate-50 px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-medium text-xs text-slate-800">{trx.invoice}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-semibold border border-slate-200 bg-white text-slate-700">
                      {trx.metodePembayaran}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    {new Date(trx.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                  </span>
                </div>

                <div className="p-3.5 space-y-2 divide-y divide-slate-100">
                  {trx.items.map((item) => {
                    const sausText =
                      Array.isArray(item.saus) && item.saus.length > 0 ? ` • ${item.saus.join(", ")}` : "";

                    return (
                      <div key={item.id} className="pt-2 first:pt-0 flex justify-between items-start gap-3 text-xs">
                        <div className="space-y-0.5">
                          <h4 className="font-semibold text-slate-900 leading-snug">{item.namaProduk}</h4>
                          <p className="text-[11px] font-medium text-slate-500">
                            {item.pax} Pax ({item.pcs * item.pax} Pcs){sausText}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900 tracking-tight whitespace-nowrap">
                          Rp {item.subtotal.toLocaleString("id-ID")}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-50/60 px-3.5 py-2.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Transaksi</span>
                  <span className="text-xs font-extrabold text-slate-900 tracking-tight">
                    Rp {trx.totalBayar.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation />
    </main>
  );
}