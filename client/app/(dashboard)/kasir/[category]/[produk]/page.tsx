"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import KasirHeader from "@/components/kasir/KasirHeader";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type Topping = {
  id: number;
  namaTopping: string;
  harga: number;
  produkId: number;
};

type HargaProduk = {
  id: number;
  harga: number;
  qty: number;
  produkId: number;
};

type Product = {
  id: number;
  namaProduk: string;
  keterangan: string | null;
  harga: number;
  categoryId: number;
  produkImg: string | null;
  createdAt: string;
  updatedAt: string;
  toppings: Topping[];
  hargaproduks: HargaProduk[];
};

type CartItem = {
  id: string;
  productId: number;
  name: string;
  price: number;
  saucePrice: number;
  pcs: number;
  pax: number;
  sauce: string[];
  image: string | null;
  quantity: number;
};

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.produk as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSauces, setSelectedSauces] = useState<number[]>([]);
  const [selectedPcsOption, setSelectedPcsOption] = useState<HargaProduk | null>(null);
  const [pax, setPax] = useState(1);

  // State Pop-up Notifikasi
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const getProductDetail = async () => {
    try {
      setLoading(true);

      const response = await axios.get<{ success: boolean; data: Product }>(
        `${API_URL}/api/products/detail/${productId}`
      );

      if (response.data.success) {
        const data = response.data.data;
        setProduct(data);

        if (data.hargaproduks && data.hargaproduks.length > 0) {
          const sortedHarga = [...data.hargaproduks].sort((a, b) => a.qty - b.qty);
          setSelectedPcsOption(sortedHarga[0]);
        }
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error("GET PRODUCT DETAIL ERROR:", error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      getProductDetail();
    }
  }, [productId]);

  const basePrice = selectedPcsOption
    ? Number(selectedPcsOption.harga)
    : product
      ? Number(product.harga)
      : 0;

  const selectedSauceObjects = (product?.toppings || []).filter((s) =>
    selectedSauces.includes(s.id)
  );

  const totalPcs = selectedPcsOption ? selectedPcsOption.qty : 0;
  const numSauces = selectedSauceObjects.length;

  const totalSaucePricePerPax =
    numSauces > 0 && totalPcs > 0
      ? selectedSauceObjects.reduce((acc, sauce) => {
        const pcsPerSauce = totalPcs / numSauces;
        return acc + Number(sauce.harga) * pcsPerSauce;
      }, 0)
      : 0;

  const unitPricePerPax = basePrice + totalSaucePricePerPax;
  const total = unitPricePerPax * pax;

  const toggleSauce = (sauceId: number) => {
    setSelectedSauces((current) => {
      if (current.includes(sauceId)) {
        return current.filter((id) => id !== sauceId);
      }
      return [...current, sauceId];
    });
  };

  const handleAddToCart = () => {
    if (!product || !selectedPcsOption) return;

    const existingCart = localStorage.getItem("kasir-cart");
    let cart: CartItem[] = [];

    if (existingCart) {
      try {
        const parsedCart = JSON.parse(existingCart);
        if (Array.isArray(parsedCart)) cart = parsedCart;
      } catch {
        cart = [];
      }
    }

    const sauceNames =
      selectedSauceObjects.length > 0
        ? selectedSauceObjects.map((option) => option.namaTopping)
        : ["original"];

    const sortedSauceIds = [...selectedSauces].sort((a, b) => a - b);
    const sauceKey = sortedSauceIds.length > 0 ? sortedSauceIds.join("-") : "original";
    const cartItemId = `${product.id}-${sauceKey}-${selectedPcsOption.qty}`;

    const newItem: CartItem = {
      id: cartItemId,
      productId: product.id,
      name: product.namaProduk,
      price: unitPricePerPax,
      saucePrice: totalSaucePricePerPax,
      pcs: selectedPcsOption.qty,
      pax: pax,
      sauce: sauceNames,
      image: product.produkImg,
      quantity: pax,
    };

    const existingIndex = cart.findIndex((item) => item.id === cartItemId);

    if (existingIndex !== -1) {
      cart[existingIndex].pax += pax;
      cart[existingIndex].quantity += pax;
    } else {
      cart.push(newItem);
    }

    localStorage.setItem("kasir-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cart-updated"));

    // Tampilkan Pop-up
    setShowSuccessModal(true);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F5F5F5]">
        <KasirHeader title="Produk" showBack />
        <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto p-5">
          <div className="h-56 bg-zinc-200 rounded-xl animate-pulse" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🥟</div>
          <h2 className="text-lg font-bold text-[#212121]">Produk tidak ditemukan</h2>
          <button
            type="button"
            onClick={() => router.back()}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#E52424] text-white text-sm font-semibold"
          >
            Kembali
          </button>
        </div>
      </main>
    );
  }

  const toppings = product.toppings || [];
  const hargaproduks = product.hargaproduks || [];

  return (
    <main className="min-h-screen bg-[#F5F5F5] pb-28">
      <KasirHeader title={product.namaProduk} showBack />

      <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto">
        <div className="h-56 sm:h-64 bg-white flex items-center justify-center border-b border-zinc-200 overflow-hidden">
          {product.produkImg ? (
            <img
              src={`${API_URL}/public/produk/${product.produkImg}`}
              alt={product.namaProduk}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-8xl sm:text-9xl">🥟</div>
          )}
        </div>

        <div className="px-4 sm:px-6 py-5">
          <div className="mb-7">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-bold text-[#212121]">
                {product.namaProduk}
              </h2>
              <span className="shrink-0 px-2.5 py-1 rounded-md bg-[#35A853]/10 text-[#35A853] text-[10px] font-semibold">
                Tersedia
              </span>
            </div>
            <p className="text-xs sm:text-sm leading-5 text-zinc-500 mt-3">
              {product.keterangan || "Tidak ada keterangan produk."}
            </p>
          </div>

          <section className="mb-7">
            <div className="flex items-end justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#212121]">Pilih Saus</h3>
                <p className="text-[10px] text-zinc-400 mt-1">Pilih satu atau lebih saus (opsional)</p>
              </div>
              <span className="text-[10px] font-medium text-zinc-400">Opsional</span>
            </div>

            <div className="space-y-2">
              {toppings.map((sauce) => {
                const isSelected = selectedSauces.includes(sauce.id);
                return (
                  <label
                    key={sauce.id}
                    className={`flex items-center gap-3 w-full min-h-[52px] px-3.5 rounded-xl border cursor-pointer select-none transition-all duration-200 ${isSelected
                      ? "border-[#E52424] bg-[#E52424]/5"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSauce(sauce.id)}
                      className="w-5 h-5 shrink-0 accent-[#E52424] cursor-pointer"
                    />
                    <div className="flex-1 flex items-center justify-between">
                      <span
                        className={`text-xs sm:text-sm font-medium ${isSelected ? "text-[#E52424]" : "text-zinc-700"
                          }`}
                      >
                        {sauce.namaTopping}
                      </span>
                      <span className="text-xs text-zinc-400">
                        +{formatRupiah(sauce.harga)}/pcs
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">
                  Saus dipilih ({selectedSauces.length})
                </span>
                <span className="text-[10px] font-semibold text-[#E52424]">
                  Biaya Saus: +{formatRupiah(totalSaucePricePerPax)} / pax
                </span>
              </div>
              {selectedSauces.length > 0 ? (
                <p className="text-xs font-semibold text-[#212121] leading-5">
                  {selectedSauceObjects.map((s) => s.namaTopping).join(" + ")}
                </p>
              ) : (
                <p className="text-xs font-medium text-zinc-500">Original (Tanpa Saus)</p>
              )}
            </div>
          </section>

          <section className="mb-7">
            <h3 className="text-sm font-semibold text-[#212121] mb-3">Berapa Pax?</h3>
            <div className="flex items-center justify-between bg-white border border-zinc-200 rounded-xl p-2">
              <button
                type="button"
                onClick={() => setPax(Math.max(1, pax - 1))}
                className="w-10 h-10 rounded-lg bg-[#F5F5F5] text-[#212121] font-bold hover:bg-zinc-200 active:scale-95 transition"
              >
                −
              </button>
              <div className="text-center">
                <span className="text-sm font-bold text-[#212121]">{pax} Pax</span>
              </div>
              <button
                type="button"
                onClick={() => setPax((current) => current + 1)}
                className="w-10 h-10 rounded-lg bg-[#E52424] text-white font-bold hover:bg-[#D91F1F] active:scale-95 transition"
              >
                +
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-[#212121] mb-3">Berapa PCS?</h3>
            <div className="grid grid-cols-3 gap-2">
              {hargaproduks.map((opt) => {
                const isSelected = selectedPcsOption?.id === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedPcsOption(opt)}
                    className={`h-14 rounded-xl border flex flex-col items-center justify-center transition-all active:scale-[0.98] ${isSelected
                      ? "border-[#E52424] bg-[#E52424] text-white"
                      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                      }`}
                  >
                    <span className="text-xs font-bold">{opt.qty} PCS</span>
                    <span
                      className={`text-[10px] ${isSelected ? "text-white/80" : "text-zinc-400"
                        }`}
                    >
                      {formatRupiah(opt.harga)}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-200 p-3 sm:p-4 z-40">
        <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] sm:text-xs text-zinc-400">Total Harga</p>
            <p className="font-bold text-sm sm:text-base truncate text-[#E52424]">
              {formatRupiah(total)}
            </p>
            <p className="text-[10px] text-zinc-400 truncate">
              Dimsum ({formatRupiah(basePrice)}) + Saus ({formatRupiah(totalSaucePricePerPax)})
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className="shrink-0 h-11 px-4 sm:px-6 rounded-xl bg-[#E52424] text-white text-xs sm:text-sm font-semibold hover:bg-[#D91F1F] active:scale-[0.98] transition"
          >
            Tambah ke Keranjang
          </button>
        </div>
      </div>

      {/* POP-UP / MODAL NOTIFIKASI */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#35A853]/10 text-[#35A853] text-2xl mb-3">
              ✓
            </div>
            <h3 className="text-base font-bold text-[#212121]">Berhasil Ditambahkan!</h3>
            <p className="mt-1 text-xs text-zinc-500">
              {product.namaProduk} telah masuk ke keranjang belanja.
            </p>

            <div className="mt-4 rounded-xl bg-[#F5F5F5] p-3 text-left text-xs space-y-1.5 text-zinc-600 border border-zinc-200">
              <div className="flex justify-between">
                <span>Pax:</span>
                <span className="font-semibold text-[#212121]">{pax} Pax</span>
              </div>
              <div className="flex justify-between">
                <span>Ukuran (PCS):</span>
                <span className="font-semibold text-[#212121]">{selectedPcsOption?.qty} PCS</span>
              </div>
              <div className="flex justify-between">
                <span>Saus:</span>
                <span className="font-semibold text-[#212121]">
                  {selectedSauceObjects.length > 0
                    ? selectedSauceObjects.map((s) => s.namaTopping).join(", ")
                    : "Original"}
                </span>
              </div>
              <div className="flex justify-between border-t border-zinc-200 pt-1.5 font-bold text-[#212121]">
                <span>Total Biaya:</span>
                <span className="text-[#E52424]">{formatRupiah(total)}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 active:scale-95 transition"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push("/kasir/keranjang");
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#E52424] text-xs font-semibold text-white hover:bg-[#D91F1F] active:scale-95 transition"
              >
                Lihat Keranjang
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}