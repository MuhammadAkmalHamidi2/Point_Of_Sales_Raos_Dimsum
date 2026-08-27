"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { api } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface Category {
  id: number | string;
  name: string;
}

interface Topping {
  namaTopping: string;
  harga: number | string;
}

interface HargaProduk {
  qty: number | string;
  harga: number | string;
}

interface Product {
  id: number | string;
  namaProduk: string;
  categoryId: number | string;
  keterangan?: string;
  produkImg?: string;
  category?: { name: string };
  toppings?: Topping[];
  hargaproduks?: HargaProduk[];
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"products" | "categories">(
    "products",
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ message: string; type: string }>({
    message: "",
    type: "",
  });

  // State Form Kategori
  const [catForm, setCatForm] = useState({ id: "", name: "" });

  // State Form Produk
  const [prodForm, setProdForm] = useState<{
    id: string | number;
    namaProduk: string;
    categoryId: string | number;
    keterangan: string;
    toppings: Topping[];
    hargaproduks: HargaProduk[];
  }>({
    id: "",
    namaProduk: "",
    categoryId: "",
    keterangan: "",
    toppings: [{ namaTopping: "", harga: "" }],
    hargaproduks: [{ qty: "", harga: "" }],
  });

  // State File Gambar dari Device & Preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const showAlert = (message: string, type = "success") => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: "", type: "" }), 3000);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([loadCategories(), loadProducts()]);
    setLoading(false);
  };

  // ================= KATEGORI HANDLERS =================
  const loadCategories = async () => {
    try {
      const res = await api.get("/api/categories");
      const result = res.data;
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error("Gagal memuat kategori:", result.message);
      }
    } catch (error) {
      console.error("Error pada loadCategories:", error);
      showAlert("Gagal memuat data kategori", "error");
    }
  };

  const handleCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = catForm.id
        ? await api.put(`/api/categories/${catForm.id}`, {
            name: catForm.name,
          })
        : await api.post("/api/categories", { name: catForm.name });
      const result = res.data;

      if (result.success) {
        showAlert(result.message || "Kategori berhasil disimpan");
        resetCatForm();
        loadCategories();
      } else {
        console.error("Gagal menyimpan kategori:", result.message);
        showAlert(result.message || "Gagal menyimpan kategori", "error");
      }
    } catch (error) {
      console.error("Error pada handleCategorySubmit:", error);
      showAlert("Gagal menyimpan kategori", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetCatForm = () => setCatForm({ id: "", name: "" });

  const handleDeleteCategory = async (id: number | string) => {
    if (!confirm("Hapus kategori ini?")) return;
    setLoading(true);
    try {
      const res = await api.delete(`/api/categories/${id}`);
      const result = res.data;
      if (result.success) {
        showAlert("Kategori berhasil dihapus");
        loadCategories();
      } else {
        console.error("Gagal menghapus kategori:", result.message);
        showAlert(result.message, "error");
      }
    } catch (error) {
      console.error("Error pada handleDeleteCategory:", error);
      showAlert("Gagal menghapus kategori", "error");
    } finally {
      setLoading(false);
    }
  };

  // ================= PRODUK HANDLERS =================
  const loadProducts = async () => {
    try {
      const res = await api.get("/api/products/all");
      const result = res.data;
      if (result.success) {
        setProducts(result.data);
      } else {
        console.error("Gagal memuat produk:", result.message);
      }
    } catch (error) {
      console.error("Error pada loadProducts:", error);
      showAlert("Gagal memuat data produk", "error");
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prodForm.categoryId) {
      showAlert("Silakan pilih kategori terlebih dahulu", "error");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("namaProduk", prodForm.namaProduk);
      formData.append("categoryId", String(prodForm.categoryId));
      formData.append("keterangan", prodForm.keterangan);

      if (imageFile) {
        formData.append("produkImg", imageFile);
      }

      const formattedToppings = prodForm.toppings
        .filter((t) => t.namaTopping.trim() !== "")
        .map((t) => ({
          namaTopping: t.namaTopping,
          harga: Number(t.harga) || 0,
        }));
      formData.append("toppings", JSON.stringify(formattedToppings));

      const formattedHarga = prodForm.hargaproduks
        .filter((h) => h.qty && h.harga)
        .map((h) => ({ qty: Number(h.qty), harga: Number(h.harga) || 0 }));
      formData.append("hargaproduks", JSON.stringify(formattedHarga));

      const res = prodForm.id
        ? await api.put(`/api/products/${prodForm.id}`, formData)
        : await api.post("/api/products", formData);
      const result = res.data;

      if (result.success) {
        showAlert(result.message || "Produk berhasil disimpan");
        resetProdForm();
        loadProducts();
      } else {
        console.error("Gagal menyimpan produk:", result.message || result);
        showAlert(result.message || "Gagal menyimpan produk", "error");
      }
    } catch (error) {
      console.error("Error pada handleProductSubmit:", error);
      showAlert("Gagal menyimpan produk", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetProdForm = () => {
    setProdForm({
      id: "",
      namaProduk: "",
      categoryId: "",
      keterangan: "",
      toppings: [{ namaTopping: "", harga: "" }],
      hargaproduks: [{ qty: "", harga: "" }],
    });
    setImageFile(null);
    setImagePreview("");
  };

  const handleEditProduct = (prod: Product) => {
    setProdForm({
      id: prod.id,
      namaProduk: prod.namaProduk,
      categoryId: prod.categoryId || "",
      keterangan: prod.keterangan || "",
      toppings: prod.toppings?.length
        ? prod.toppings
        : [{ namaTopping: "", harga: "" }],
      hargaproduks: prod.hargaproduks?.length
        ? prod.hargaproduks
        : [{ qty: "", harga: "" }],
    });
    setImageFile(null);
    setImagePreview(
      prod.produkImg ? `${API_BASE_URL}/uploads/${prod.produkImg}` : "",
    );
  };

  const handleDeleteProduct = async (id: number | string) => {
    if (!confirm("Hapus produk ini beserta data relasinya?")) return;
    setLoading(true);
    try {
      const res = await api.delete(`/api/products/${id}`);
      const result = res.data;
      if (result.success) {
        showAlert("Produk berhasil dihapus");
        loadProducts();
      } else {
        console.error("Gagal menghapus produk:", result.message);
        showAlert(result.message, "error");
      }
    } catch (error) {
      console.error("Error pada handleDeleteProduct:", error);
      showAlert("Gagal menghapus produk", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDynamicChange = (
    type: "toppings" | "hargaproduks",
    index: number,
    field: string,
    value: string,
  ) => {
    if (type === "toppings") {
      const updated = prodForm.toppings.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      );
      setProdForm((prev) => ({ ...prev, toppings: updated }));
    } else {
      const updated = prodForm.hargaproduks.map((item, i) =>
        i === index ? { ...item, [field]: value } : item,
      );
      setProdForm((prev) => ({ ...prev, hargaproduks: updated }));
    }
  };

  const addDynamicField = (
    type: "toppings" | "hargaproduks",
    defaultObj: Topping | HargaProduk,
  ) => {
    if (type === "toppings") {
      setProdForm((prev) => ({
        ...prev,
        toppings: [...prev.toppings, defaultObj as Topping],
      }));
    } else {
      setProdForm((prev) => ({
        ...prev,
        hargaproduks: [...prev.hargaproduks, defaultObj as HargaProduk],
      }));
    }
  };

  const removeDynamicField = (
    type: "toppings" | "hargaproduks",
    index: number,
  ) => {
    if (type === "toppings") {
      const updated = prodForm.toppings.filter((_, i) => i !== index);
      setProdForm((prev) => ({ ...prev, toppings: updated }));
    } else {
      const updated = prodForm.hargaproduks.filter((_, i) => i !== index);
      setProdForm((prev) => ({ ...prev, hargaproduks: updated }));
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-zinc-200/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-2xs">
        <div>
          <h1 className="text-base md:text-xl font-bold text-[#212121]">
            Produk
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manajemen produk dan kategori
          </p>
        </div>
        <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab("products")}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "products"
                ? "bg-white text-[#212121] shadow-xs"
                : "text-zinc-400"
            }`}
          >
            Produk ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("categories")}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === "categories"
                ? "bg-white text-[#212121] shadow-xs"
                : "text-zinc-400"
            }`}
          >
            Kategori ({categories.length})
          </button>
        </div>
      </div>

      {alert.message && (
        <div
          className={`flex items-center px-4 py-3 rounded-2xl border text-xs font-semibold shadow-2xs ${
            alert.type === "error"
              ? "bg-red-50 border-red-100 text-[#E52424]"
              : "bg-emerald-50 border-emerald-100 text-emerald-600"
          }`}
        >
          {alert.message}
        </div>
      )}

      {/* TAB PRODUK */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {/* FORM PRODUK */}
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-[#212121]">
                {prodForm.id ? "Edit Data Produk" : "Tambah Produk Baru"}
              </h2>
              {prodForm.id && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600">
                  Mode edit
                </span>
              )}
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">
                  Nama Produk
                </label>
                <input
                  type="text"
                  placeholder="misal: Dimsum Ayam Premium"
                  value={prodForm.namaProduk}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, namaProduk: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#E52424]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">
                  Kategori
                </label>
                <select
                  value={prodForm.categoryId}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#E52424] bg-white"
                  required
                >
                  <option value="">Pilih kategori...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">
                  Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="misal: Isi 5 pcs / porsi"
                  value={prodForm.keterangan}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, keterangan: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#E52424]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">
                  Gambar Produk
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-zinc-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-red-50 file:text-[#E52424] cursor-pointer border border-zinc-200 rounded-xl px-1 py-1"
                />
                {imagePreview && (
                  <div className="mt-2 w-20 h-20 border border-zinc-200 rounded-xl overflow-hidden bg-zinc-50">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* TOPPING / SAUS */}
              <div className="space-y-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-600">
                    Opsi Topping / Saus
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      addDynamicField("toppings", {
                        namaTopping: "",
                        harga: "",
                      })
                    }
                    className="text-xs font-bold text-[#E52424]"
                  >
                    + Tambah
                  </button>
                </div>
                {prodForm.toppings.map((t, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nama saus"
                      value={t.namaTopping}
                      onChange={(e) =>
                        handleDynamicChange(
                          "toppings",
                          idx,
                          "namaTopping",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 outline-none focus:border-[#E52424] bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Harga"
                      value={t.harga}
                      onChange={(e) =>
                        handleDynamicChange(
                          "toppings",
                          idx,
                          "harga",
                          e.target.value,
                        )
                      }
                      className="w-28 px-3 py-2 text-xs rounded-lg border border-zinc-200 outline-none focus:border-[#E52424] bg-white"
                    />
                    {prodForm.toppings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDynamicField("toppings", idx)}
                        className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-red-50 text-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* HARGA & PORSI */}
              <div className="space-y-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200/60">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-600">
                    Opsi Harga & Porsi
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      addDynamicField("hargaproduks", { qty: "", harga: "" })
                    }
                    className="text-xs font-bold text-[#E52424]"
                  >
                    + Tambah
                  </button>
                </div>
                {prodForm.hargaproduks.map((h, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Qty / pax"
                      value={h.qty}
                      onChange={(e) =>
                        handleDynamicChange(
                          "hargaproduks",
                          idx,
                          "qty",
                          e.target.value,
                        )
                      }
                      className="w-24 px-3 py-2 text-xs rounded-lg border border-zinc-200 outline-none focus:border-[#E52424] bg-white"
                    />
                    <input
                      type="number"
                      placeholder="Harga total (Rp)"
                      value={h.harga}
                      onChange={(e) =>
                        handleDynamicChange(
                          "hargaproduks",
                          idx,
                          "harga",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 text-xs rounded-lg border border-zinc-200 outline-none focus:border-[#E52424] bg-white"
                    />
                    {prodForm.hargaproduks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDynamicField("hargaproduks", idx)}
                        className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-lg bg-red-50 text-red-500"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#E52424] text-white text-xs font-semibold hover:bg-[#D91F1F] disabled:opacity-60 transition-all"
                >
                  {loading
                    ? "Memproses..."
                    : prodForm.id
                      ? "Simpan Perubahan"
                      : "Tambah Produk"}
                </button>
                {prodForm.id && (
                  <button
                    type="button"
                    onClick={resetProdForm}
                    className="py-2.5 px-4 rounded-xl border border-zinc-200 text-zinc-600 text-xs font-semibold hover:bg-zinc-50 transition-all"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* DAFTAR PRODUK */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-[#212121]">
                Daftar Produk
              </h3>
            </div>
            <div className="overflow-x-auto">
              {products.length === 0 ? (
                <p className="text-xs text-zinc-400 py-8 text-center">
                  {loading
                    ? "Memuat data..."
                    : "Belum ada produk yang tersimpan."}
                </p>
              ) : (
                <table className="w-full min-w-[720px] text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                        Produk
                      </th>
                      <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                        Kategori
                      </th>
                      <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                        Topping
                      </th>
                      <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400">
                        Harga
                      </th>
                      <th className="px-5 py-2.5 text-[10px] font-bold uppercase tracking-wide text-zinc-400 text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr
                        key={p.id}
                        className="align-top hover:bg-zinc-50/80 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <p className="text-xs font-bold text-[#212121]">
                            {p.namaProduk}
                          </p>
                          {p.keterangan && (
                            <p className="text-[11px] text-zinc-400 mt-0.5">
                              {p.keterangan}
                            </p>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-500 whitespace-nowrap">
                            {p.category?.name || "Tanpa kategori"}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          {p.toppings?.length ? (
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {p.toppings.map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-red-50 text-[#E52424] whitespace-nowrap"
                                >
                                  {t.namaTopping}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-zinc-300">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3.5">
                          {p.hargaproduks?.length ? (
                            <div className="flex flex-col gap-0.5">
                              {p.hargaproduks.map((h, idx) => (
                                <span
                                  key={idx}
                                  className="text-[11px] text-zinc-500 whitespace-nowrap"
                                >
                                  <span className="font-semibold text-[#212121]">
                                    {h.qty} pcs:
                                  </span>{" "}
                                  Rp
                                  {Number(h.harga).toLocaleString("id-ID")}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-zinc-300">-</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEditProduct(p)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-all"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19.5 13.5v4.875c0 .621-.504 1.125-1.125 1.125H5.625A1.125 1.125 0 014.5 18.375V6.375c0-.621.504-1.125 1.125-1.125h4.875"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB KATEGORI */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-4 md:col-span-1">
            <h2 className="text-sm font-bold text-[#212121]">
              {catForm.id ? "Edit Kategori" : "Tambah Kategori"}
            </h2>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-600">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  placeholder="misal: Makanan Utama"
                  value={catForm.name}
                  onChange={(e) =>
                    setCatForm({ ...catForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 text-sm outline-none focus:border-[#E52424]"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#E52424] text-white text-xs font-semibold hover:bg-[#D91F1F] disabled:opacity-60 transition-all"
                >
                  {loading ? "Memproses..." : catForm.id ? "Update" : "Simpan"}
                </button>
                {catForm.id && (
                  <button
                    type="button"
                    onClick={resetCatForm}
                    className="py-2.5 px-4 rounded-xl border border-zinc-200 text-zinc-600 text-xs font-semibold hover:bg-zinc-50 transition-all"
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-2xs overflow-hidden md:col-span-2">
            <div className="p-5 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-[#212121]">
                Daftar Kategori
              </h3>
            </div>
            <div className="divide-y divide-zinc-100">
              {categories.length === 0 ? (
                <p className="text-xs text-zinc-400 py-8 text-center">
                  {loading ? "Memuat data..." : "Belum ada kategori."}
                </p>
              ) : (
                categories.map((c) => (
                  <div
                    key={c.id}
                    className="py-3.5 px-5 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-xs font-bold text-[#212121]">
                        {c.name}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                        #{c.id}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          setCatForm({ id: String(c.id), name: c.name })
                        }
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-all"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 13.5v4.875c0 .621-.504 1.125-1.125 1.125H5.625A1.125 1.125 0 014.5 18.375V6.375c0-.621.504-1.125 1.125-1.125h4.875"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
