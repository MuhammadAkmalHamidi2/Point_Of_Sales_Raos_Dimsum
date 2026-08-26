'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

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
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [alert, setAlert] = useState<{ message: string; type: string }>({ message: '', type: '' });

  // State Form Kategori
  const [catForm, setCatForm] = useState({ id: '', name: '' });

  // State Form Produk
  const [prodForm, setProdForm] = useState<{
    id: string | number;
    namaProduk: string;
    categoryId: string | number;
    keterangan: string;
    toppings: Topping[];
    hargaproduks: HargaProduk[];
  }>({
    id: '',
    namaProduk: '',
    categoryId: '',
    keterangan: '',
    toppings: [{ namaTopping: '', harga: '' }],
    hargaproduks: [{ qty: '', harga: '' }],
  });

  // State File Gambar dari Device & Preview
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const showAlert = (message: string, type = 'success') => {
    setAlert({ message, type });
    setTimeout(() => setAlert({ message: '', type: '' }), 3000);
  };

  const fetchInitialData = async () => {
    setLoading(true);
    await Promise.all([loadCategories(), loadProducts()]);
    setLoading(false);
  };

  // ================= KATEGORI HANDLERS =================
  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories`);
      const result = await res.json();
      if (result.success) {
        setCategories(result.data);
      } else {
        console.error('Gagal memuat kategori:', result.message);
      }
    } catch (error) {
      console.error('Error pada loadCategories:', error);
      showAlert('Gagal memuat data kategori', 'error');
    }
  };

  const handleCategorySubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = catForm.id ? 'PUT' : 'POST';
      const url = catForm.id
        ? `${API_BASE_URL}/api/categories/${catForm.id}`
        : `${API_BASE_URL}/api/categories`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: catForm.name }),
      });
      const result = await res.json();

      if (result.success) {
        showAlert(result.message || 'Kategori berhasil disimpan');
        resetCatForm();
        loadCategories();
      } else {
        console.error('Gagal menyimpan kategori:', result.message);
        showAlert(result.message || 'Gagal menyimpan kategori', 'error');
      }
    } catch (error) {
      console.error('Error pada handleCategorySubmit:', error);
      showAlert('Gagal menyimpan kategori', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetCatForm = () => setCatForm({ id: '', name: '' });

  const handleDeleteCategory = async (id: number | string) => {
    if (!confirm('Hapus kategori ini?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/categories/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showAlert('Kategori berhasil dihapus');
        loadCategories();
      } else {
        console.error('Gagal menghapus kategori:', result.message);
        showAlert(result.message, 'error');
      }
    } catch (error) {
      console.error('Error pada handleDeleteCategory:', error);
      showAlert('Gagal menghapus kategori', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ================= PRODUK HANDLERS =================
  const loadProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/all`);
      const result = await res.json();
      if (result.success) {
        setProducts(result.data);
      } else {
        console.error('Gagal memuat produk:', result.message);
      }
    } catch (error) {
      console.error('Error pada loadProducts:', error);
      showAlert('Gagal memuat data produk', 'error');
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
      showAlert('Silakan pilih kategori terlebih dahulu', 'error');
      return;
    }

    setLoading(true);
    try {
      const method = prodForm.id ? 'PUT' : 'POST';
      const url = prodForm.id
        ? `${API_BASE_URL}/api/products/${prodForm.id}`
        : `${API_BASE_URL}/api/products`;

      const formData = new FormData();
      formData.append('namaProduk', prodForm.namaProduk);
      formData.append('categoryId', String(prodForm.categoryId));
      formData.append('keterangan', prodForm.keterangan);

      if (imageFile) {
        formData.append('produkImg', imageFile);
      }

      const formattedToppings = prodForm.toppings
        .filter((t) => t.namaTopping.trim() !== '')
        .map((t) => ({ namaTopping: t.namaTopping, harga: Number(t.harga) || 0 }));
      formData.append('toppings', JSON.stringify(formattedToppings));

      const formattedHarga = prodForm.hargaproduks
        .filter((h) => h.qty && h.harga)
        .map((h) => ({ qty: Number(h.qty), harga: Number(h.harga) || 0 }));
      formData.append('hargaproduks', JSON.stringify(formattedHarga));

      const res = await fetch(url, {
        method,
        body: formData,
      });
      const result = await res.json();

      if (result.success) {
        showAlert(result.message || 'Produk berhasil disimpan');
        resetProdForm();
        loadProducts();
      } else {
        console.error('Gagal menyimpan produk:', result.message || result);
        showAlert(result.message || 'Gagal menyimpan produk', 'error');
      }
    } catch (error) {
      console.error('Error pada handleProductSubmit:', error);
      showAlert('Gagal menyimpan produk', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetProdForm = () => {
    setProdForm({
      id: '',
      namaProduk: '',
      categoryId: '',
      keterangan: '',
      toppings: [{ namaTopping: '', harga: '' }],
      hargaproduks: [{ qty: '', harga: '' }],
    });
    setImageFile(null);
    setImagePreview('');
  };

  const handleEditProduct = (prod: Product) => {
    setProdForm({
      id: prod.id,
      namaProduk: prod.namaProduk,
      categoryId: prod.categoryId || '',
      keterangan: prod.keterangan || '',
      toppings: prod.toppings?.length ? prod.toppings : [{ namaTopping: '', harga: '' }],
      hargaproduks: prod.hargaproduks?.length ? prod.hargaproduks : [{ qty: '', harga: '' }],
    });
    setImageFile(null);
    setImagePreview(prod.produkImg ? `${API_BASE_URL}/uploads/${prod.produkImg}` : '');
  };

  const handleDeleteProduct = async (id: number | string) => {
    if (!confirm('Hapus produk ini beserta data relasinya?')) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/products/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        showAlert('Produk berhasil dihapus');
        loadProducts();
      } else {
        console.error('Gagal menghapus produk:', result.message);
        showAlert(result.message, 'error');
      }
    } catch (error) {
      console.error('Error pada handleDeleteProduct:', error);
      showAlert('Gagal menghapus produk', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDynamicChange = (
    type: 'toppings' | 'hargaproduks',
    index: number,
    field: string,
    value: string
  ) => {
    if (type === 'toppings') {
      const updated = prodForm.toppings.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      setProdForm((prev) => ({ ...prev, toppings: updated }));
    } else {
      const updated = prodForm.hargaproduks.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      );
      setProdForm((prev) => ({ ...prev, hargaproduks: updated }));
    }
  };

  const addDynamicField = (type: 'toppings' | 'hargaproduks', defaultObj: Topping | HargaProduk) => {
    if (type === 'toppings') {
      setProdForm((prev) => ({ ...prev, toppings: [...prev.toppings, defaultObj as Topping] }));
    } else {
      setProdForm((prev) => ({ ...prev, hargaproduks: [...prev.hargaproduks, defaultObj as HargaProduk] }));
    }
  };

  const removeDynamicField = (type: 'toppings' | 'hargaproduks', index: number) => {
    if (type === 'toppings') {
      const updated = prodForm.toppings.filter((_, i) => i !== index);
      setProdForm((prev) => ({ ...prev, toppings: updated }));
    } else {
      const updated = prodForm.hargaproduks.filter((_, i) => i !== index);
      setProdForm((prev) => ({ ...prev, hargaproduks: updated }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">Produk</h1>
              <p className="text-xs text-slate-500">Manajemen Produk & Kategori</p>
            </div>
          </div>

          <nav className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'products'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kelola Produk ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'categories'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Kategori ({categories.length})
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {alert.message && (
          <div
            className={`flex items-center p-4 mb-6 rounded-xl border text-sm font-medium transition-all shadow-sm ${
              alert.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            <span className="mr-2">{alert.type === 'error' ? '⚠️' : '✅'}</span>
            {alert.message}
          </div>
        )}

        {/* TAB PRODUK */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit">
              <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
                <h2 className="text-base font-semibold text-slate-900">
                  {prodForm.id ? 'Edit Data Produk' : 'Tambah Produk Baru'}
                </h2>
                {prodForm.id && (
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
                    Mode Edit
                  </span>
                )}
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nama Produk</label>
                  <input
                    type="text"
                    placeholder="misal: Dimsum Ayam Premium"
                    value={prodForm.namaProduk}
                    onChange={(e) => setProdForm({ ...prodForm, namaProduk: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Kategori</label>
                  <select
                    value={prodForm.categoryId}
                    onChange={(e) => setProdForm({ ...prodForm, categoryId: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                    required
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Keterangan (Opsional)</label>
                  <input
                    type="text"
                    placeholder="misal: Isi 5 pcs / porsi"
                    value={prodForm.keterangan}
                    onChange={(e) => setProdForm({ ...prodForm, keterangan: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                  />
                </div>

                {/* Input Gambar dari Device */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Gambar Produk dari Device</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-200 bg-slate-50 rounded-lg"
                  />
                  {imagePreview && (
                    <div className="mt-3 relative w-24 h-24 border border-slate-200 rounded-lg overflow-hidden bg-slate-100">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Section Dynamic: Toppings */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Opsi Topping / Saus
                    </label>
                    <button
                      type="button"
                      onClick={() => addDynamicField('toppings', { namaTopping: '', harga: '' })}
                      className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                    >
                      + Tambah Saus
                    </button>
                  </div>
                  {prodForm.toppings.map((t, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Nama Saus"
                        value={t.namaTopping}
                        onChange={(e) =>
                          handleDynamicChange('toppings', idx, 'namaTopping', e.target.value)
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Harga"
                        value={t.harga}
                        onChange={(e) =>
                          handleDynamicChange('toppings', idx, 'harga', e.target.value)
                        }
                        className="w-28 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500"
                      />
                      {prodForm.toppings.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDynamicField('toppings', idx)}
                          className="px-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Section Dynamic: Harga */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Opsi Harga & Porsi
                    </label>
                    <button
                      type="button"
                      onClick={() => addDynamicField('hargaproduks', { qty: '', harga: '' })}
                      className="text-xs text-indigo-600 font-medium hover:text-indigo-700 flex items-center gap-1"
                    >
                      + Tambah Harga
                    </button>
                  </div>
                  {prodForm.hargaproduks.map((h, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Qty / Pax"
                        value={h.qty}
                        onChange={(e) =>
                          handleDynamicChange('hargaproduks', idx, 'qty', e.target.value)
                        }
                        className="w-24 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500"
                      />
                      <input
                        type="number"
                        placeholder="Harga Total (Rp)"
                        value={h.harga}
                        onChange={(e) =>
                          handleDynamicChange('hargaproduks', idx, 'harga', e.target.value)
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500"
                      />
                      {prodForm.hargaproduks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDynamicField('hargaproduks', idx)}
                          className="px-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2.5 px-4 rounded-lg shadow-sm transition-all text-sm"
                  >
                    {loading ? 'Memproses...' : prodForm.id ? 'Simpan Perubahan' : 'Tambah Produk'}
                  </button>
                  {prodForm.id && (
                    <button
                      type="button"
                      onClick={resetProdForm}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 px-4 rounded-lg transition-all text-sm"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Tabel Produk */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Daftar Produk</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Produk</th>
                      <th className="py-3 px-4">Kategori</th>
                      <th className="py-3 px-4">Toppings</th>
                      <th className="py-3 px-4">Harga</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          {loading ? 'Memuat data...' : 'Belum ada produk yang tersimpan.'}
                        </td>
                      </tr>
                    ) : (
                      products.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center space-x-3">
                              <div>
                                <div className="font-medium text-slate-900">{p.namaProduk}</div>
                                {p.keterangan && (
                                  <div className="text-xs text-slate-400">{p.keterangan}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                              {p.category?.name || 'Tanpa Kategori'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1">
                              {p.toppings?.length ? (
                                p.toppings.map((t, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 rounded-md border border-indigo-100"
                                  >
                                    {t.namaTopping}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1">
                              {p.hargaproduks?.length ? (
                                p.hargaproduks.map((h, idx) => (
                                  <span key={idx} className="text-xs text-slate-700">
                                    <strong className="font-medium">{h.qty} pcs:</strong> Rp
                                    {Number(h.harga).toLocaleString('id-ID')}
                                  </span>
                                ))
                              ) : (
                                <span className="text-slate-400 text-xs">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleEditProduct(p)}
                                className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB KATEGORI */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm h-fit">
              <h2 className="text-base font-semibold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                {catForm.id ? 'Edit Kategori' : 'Tambah Kategori'}
              </h2>
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nama Kategori</label>
                  <input
                    type="text"
                    placeholder="misal: Makanan Utama"
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-medium py-2 px-4 rounded-lg shadow-sm transition-all text-sm"
                  >
                    {loading ? 'Memproses...' : catForm.id ? 'Update' : 'Simpan'}
                  </button>
                  {catForm.id && (
                    <button
                      type="button"
                      onClick={resetCatForm}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg transition-all text-sm"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100">
                <h3 className="font-semibold text-slate-900">Daftar Kategori</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-20">ID</th>
                      <th className="py-3 px-4">Nama Kategori</th>
                      <th className="py-3 px-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-400">
                          {loading ? 'Memuat data...' : 'Belum ada kategori.'}
                        </td>
                      </tr>
                    ) : (
                      categories.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs text-slate-400">#{c.id}</td>
                          <td className="py-3.5 px-4 font-medium text-slate-900">{c.name}</td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setCatForm({ id: String(c.id), name: c.name })}
                                className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(c.id)}
                                className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}