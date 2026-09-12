"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

type InventoryItem = {
  id: number;
  nama: string;
  satuan: string;
  stok: number;
};

type HargaProdukOption = {
  id: number;
  qty: number;
  harga: number;
};

type ProdukOption = {
  id: number;
  namaProduk: string;
  hargaproduks: HargaProdukOption[];
};

type NeedRow = {
  inventoryId: number;
  jumlah: number;
};

export default function ProductOrderNeedPage() {
  const [produks, setProduks] = useState<ProdukOption[]>([]);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);

  const [selectedProdukId, setSelectedProdukId] = useState<number | "">("");
  const [selectedHargaProdukId, setSelectedHargaProdukId] = useState<number | "">("");

  const [needs, setNeeds] = useState<NeedRow[]>([]);

  const [loadingMaster, setLoadingMaster] = useState(true);
  const [loadingNeeds, setLoadingNeeds] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. Load Master Produk & Master Inventori saat pertama dibuka
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const [resProduk, resInventory] = await Promise.all([
          api.get("/api/produk"),
          api.get("/api/inventory"),
        ]);

        if (resProduk.data.success) {
          setProduks(resProduk.data.data || resProduk.data.produk || []);
        }
        if (resInventory.data.success) {
          setInventoryList(resInventory.data.data || resInventory.data.inventory || []);
        }
      } catch (err) {
        console.error("Gagal memuat data master", err);
      } finally {
        setLoadingMaster(false);
      }
    };

    fetchMasterData();
  }, []);

  // 2. Load data kebutuhan stok saat Varian / HargaProduk dipilih
  useEffect(() => {
    if (!selectedHargaProdukId) {
      setNeeds([]);
      return;
    }

    const fetchNeeds = async () => {
      setLoadingNeeds(true);
      try {
        const res = await api.get(`/api/order-needs/${selectedHargaProdukId}`);
        if (res.data.success) {
          const mapped = res.data.data.map((item: any) => ({
            inventoryId: item.inventoryId,
            jumlah: item.jumlah,
          }));
          setNeeds(mapped);
        }
      } catch (err) {
        console.error("Gagal mengambil data kebutuhan varian", err);
        setNeeds([]);
      } finally {
        setLoadingNeeds(false);
      }
    };

    fetchNeeds();
  }, [selectedHargaProdukId]);

  // Handler Pilih Produk
  const handleProdukChange = (pId: number) => {
    setSelectedProdukId(pId);
    setSelectedHargaProdukId(""); // Reset varian terpilih
    setNeeds([]);
  };

  // Handler Tambah Baris Inventori Baru
  const handleAddRow = () => {
    if (inventoryList.length === 0) {
      alert("Data inventori masih kosong.");
      return;
    }
    setNeeds((prev) => [
      ...prev,
      { inventoryId: inventoryList[0].id, jumlah: 1 },
    ]);
  };

  // Handler Hapus Baris
  const handleRemoveRow = (index: number) => {
    setNeeds((prev) => prev.filter((_, i) => i !== index));
  };

  // Handler Ubah Input Baris
  const handleRowChange = (index: number, field: keyof NeedRow, value: number) => {
    setNeeds((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  // Handler Simpan Ke Backend
  const handleSubmit = async () => {
    if (!selectedHargaProdukId) {
      alert("Pilih varian produk terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        hargaProdukId: Number(selectedHargaProdukId),
        needs: needs.map((n) => ({
          inventoryId: Number(n.inventoryId),
          jumlah: Number(n.jumlah) || 1,
        })),
      };

      const res = await api.post(`/api/order-needs/${selectedHargaProdukId}`, payload);
      if (res.data.success) {
        alert("Kebutuhan stok varian berhasil disimpan!");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Gagal menyimpan kebutuhan varian");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProdukObj = produks.find((p) => p.id === Number(selectedProdukId));

  return (
    <div className="space-y-5 pb-10 max-w-4xl mx-auto">
      {/* HEADER SECTION */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-zinc-800">Setting Kebutuhan Stok (BOM)</h1>
          <p className="text-xs text-zinc-400">
            Pemetaan kemasan & bahan baku yang otomatis terpotong saat transaksi
          </p>
        </div>
      </div>

      {/* SELECTOR PRODUK & VARIAN */}
      <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-zinc-700 block mb-1.5">
            Pilih Produk
          </label>
          <select
            value={selectedProdukId}
            onChange={(e) => handleProdukChange(Number(e.target.value))}
            disabled={loadingMaster}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 outline-none focus:ring-1 focus:ring-zinc-400"
          >
            <option value="">-- Pilih Produk --</option>
            {produks.map((p) => (
              <option key={p.id} value={p.id}>
                {p.namaProduk}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-700 block mb-1.5">
            Pilih Varian (Porsi)
          </label>
          <select
            value={selectedHargaProdukId}
            onChange={(e) => setSelectedHargaProdukId(Number(e.target.value))}
            disabled={!selectedProdukId || loadingMaster}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 outline-none focus:ring-1 focus:ring-zinc-400 disabled:opacity-50"
          >
            <option value="">-- Pilih Varian --</option>
            {selectedProdukObj?.hargaproduks?.map((hp) => (
              <option key={hp.id} value={hp.id}>
                Paket {hp.qty} Pcs - (Rp {hp.harga?.toLocaleString("id-ID")})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* TABLE MAPPING INVENTORI */}
      {selectedHargaProdukId ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
            <span className="text-xs font-bold text-zinc-700">Daftar Kemasan & Bahan Terpakai</span>
            <button
              onClick={handleAddRow}
              type="button"
              className="px-3 py-1.5 bg-zinc-800 text-white rounded-lg text-xs font-semibold hover:bg-zinc-700 transition-all"
            >
              + Tambah Item
            </button>
          </div>

          {loadingNeeds ? (
            <p className="p-8 text-center text-xs text-zinc-400">Memuat data kebutuhan stok...</p>
          ) : needs.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              Belum ada item kemasan/bahan yang terhubung ke varian ini.
            </div>
          ) : (
            <div className="divide-y divide-zinc-100">
              <div className="grid grid-cols-12 bg-zinc-50/80 p-3.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                <div className="col-span-7">Item Inventori / Kemasan</div>
                <div className="col-span-3 text-center">Jumlah Kebutuhan</div>
                <div className="col-span-2 text-right">Aksi</div>
              </div>

              {needs.map((row, index) => {
                const invInfo = inventoryList.find((i) => i.id === row.inventoryId);
                return (
                  <div key={index} className="grid grid-cols-12 items-center p-3.5 text-xs">
                    <div className="col-span-7 pr-2">
                      <select
                        value={row.inventoryId}
                        onChange={(e) =>
                          handleRowChange(index, "inventoryId", Number(e.target.value))
                        }
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700 outline-none focus:ring-1 focus:ring-zinc-400"
                      >
                        {inventoryList.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.nama} ({inv.satuan}) - Stok Sistem: {inv.stok}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3 flex items-center justify-center space-x-1">
                      <input
                        type="number"
                        min="1"
                        value={row.jumlah}
                        onChange={(e) =>
                          handleRowChange(index, "jumlah", Number(e.target.value))
                        }
                        className="w-20 text-center font-bold bg-zinc-50 border border-zinc-200 rounded-lg py-1.5 text-xs outline-none focus:ring-1 focus:ring-zinc-400"
                      />
                      <span className="text-[10px] text-zinc-400 font-semibold">
                        {invInfo?.satuan || "pcs"}
                      </span>
                    </div>

                    <div className="col-span-2 text-right">
                      <button
                        onClick={() => handleRemoveRow(index)}
                        type="button"
                        className="text-red-500 hover:text-red-700 font-bold text-xs p-1"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="p-4 bg-zinc-50/50 border-t border-zinc-100">
            <button
              onClick={handleSubmit}
              disabled={submitting || loadingNeeds || needs.length === 0}
              className="w-full py-3 bg-[#E52424] text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-all shadow-2xs disabled:opacity-50"
            >
              {submitting ? "Menyimpan Kebutuhan..." : "Simpan Kebutuhan Stok Varian"}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-2xl border border-zinc-200/80 shadow-2xs text-center text-xs text-zinc-400">
          Silakan pilih produk dan variannya di atas untuk mulai mengatur kebutuhan stok.
        </div>
      )}
    </div>
  );
}