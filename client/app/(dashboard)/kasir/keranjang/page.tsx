"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import KasirHeader from "@/components/kasir/KasirHeader";

// =====================================================
// FORMAT RUPIAH
// =====================================================

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// =====================================================
// TYPE CART
// =====================================================

type CartItem = {
  id: string;
  productId: string;
  name: string;
  price: number;
  pcs: number;
  pax: number;
  sauce: string;
  icon: string;
};

// =====================================================
// PAYMENT TYPE
// =====================================================

type PaymentMethod = "cash" | "qris";

// =====================================================
// CART PAGE
// =====================================================

export default function CartPage() {
  const router = useRouter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash");

  // ===================================================
  // AMBIL DATA CART DARI LOCAL STORAGE
  // ===================================================

  useEffect(() => {
    const storedCart = localStorage.getItem("kasir-cart");

    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      } catch (error) {
        console.error(
          "Gagal membaca data keranjang:",
          error
        );
      }
    }

    setLoaded(true);
  }, []);

  // ===================================================
  // UPDATE LOCAL STORAGE
  // ===================================================

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      "kasir-cart",
      JSON.stringify(cart)
    );
  }, [cart, loaded]);

  // ===================================================
  // TAMBAH PAX
  // ===================================================

  const increasePax = (id: string) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
            ...item,
            pax: item.pax + 1,
          }
          : item
      )
    );
  };

  // ===================================================
  // KURANGI PAX
  // ===================================================

  const decreasePax = (id: string) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
            ...item,
            pax: Math.max(1, item.pax - 1),
          }
          : item
      )
    );
  };

  // ===================================================
  // HAPUS PRODUK DARI KERANJANG
  // ===================================================

  const removeItem = (id: string) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  // ===================================================
  // TOTAL ITEM
  // ===================================================

  const getItemTotal = (item: CartItem) => {
    return item.price * item.pax;
  };

  // ===================================================
  // SUBTOTAL & TOTAL
  // ===================================================

  const subtotal = cart.reduce(
    (total, item) => total + getItemTotal(item),
    0
  );

  const tax = 0;
  const total = subtotal + tax;

  // ===================================================
  // PROSES PEMBAYARAN
  // ===================================================

  const handlePayment = () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong.");
      return;
    }

    const orderId = `ORDER-${Date.now()}`;

    const paymentData = {
      orderId,
      items: cart.map((item) => ({
        productId: item.productId,
        productName: item.name,
        price: item.price,
        pcs: item.pcs,
        pax: item.pax,
        sauce: item.sauce,
        subtotal: getItemTotal(item),
      })),
      subtotal,
      tax,
      total,
      paymentMethod:
        paymentMethod === "cash" ? "Cash" : "QRIS",
      createdAt: new Date().toLocaleString("id-ID"),
    };

    const detailProduk = paymentData.items
      .map(
        (item, index) =>
          `${index + 1}. ${item.productName}
   Harga     : ${formatRupiah(item.price)}
   PCS       : ${item.pcs}
   Pax       : ${item.pax}
   Saus      : ${item.sauce}
   Subtotal  : ${formatRupiah(item.subtotal)}`
      )
      .join("\n\n");

    alert(
      `PEMBAYARAN BERHASIL\n\nOrder ID\n${paymentData.orderId}\n\n================================\n\nDETAIL PESANAN\n\n${detailProduk}\n\n================================\n\nRINGKASAN\n\nSubtotal\n${formatRupiah(
        paymentData.subtotal
      )}\n\nPajak\n${formatRupiah(
        paymentData.tax
      )}\n\nTOTAL\n${formatRupiah(
        paymentData.total
      )}\n\n================================\n\nMETODE PEMBAYARAN\n\n${paymentData.paymentMethod
      }\n\n================================\n\nWaktu\n${paymentData.createdAt}`
    );

    localStorage.removeItem("kasir-cart");
    setCart([]);
    router.push("/kasir");
  };

  // ===================================================
  // LOADING STATE
  // ===================================================

  if (!loaded) {
    return (
      <main className="min-h-screen bg-[#F5F5F5]">
        <KasirHeader title="Keranjang" showBack />
        <div className="min-h-[70vh] flex items-center justify-center">
          <p className="text-sm text-zinc-400">
            Memuat keranjang...
          </p>
        </div>
      </main>
    );
  }

  // ===================================================
  // EMPTY CART STATE
  // ===================================================

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-[#F5F5F5]">
        <KasirHeader title="Keranjang" showBack />
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-lg font-bold text-[#212121]">
              Keranjang masih kosong
            </h2>
            <p className="text-sm text-zinc-500 mt-2">
              Silakan pilih produk terlebih dahulu.
            </p>
            <button
              type="button"
              onClick={() => router.push("/kasir")}
              className="mt-5 px-5 py-2.5 rounded-xl bg-[#E52424] text-white text-sm font-semibold hover:bg-[#D91F1F] transition"
            >
              Pilih Produk
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ===================================================
  // RENDER MAIN CART
  // ===================================================

  return (
    <main className="min-h-screen bg-[#F5F5F5] pb-40">
      <KasirHeader title="Keranjang" showBack />

      <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        {/* PESANAN */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-semibold text-[#212121]">
              Pesanan
            </h2>
            <span className="text-[11px] sm:text-xs text-zinc-400">
              {cart.length} Produk
            </span>
          </div>

          <div className="space-y-3">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-zinc-200 p-3 sm:p-4"
              >
                <div className="flex gap-3 sm:gap-4">
                  {/* ICON/IMAGE */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xl bg-[#F5F5F5] flex items-center justify-center text-4xl sm:text-5xl">
                    {item.icon}
                  </div>

                  {/* INFORMATION */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-[#212121]">
                          {item.name}
                        </h3>
                        <p className="text-[11px] sm:text-xs text-zinc-400 mt-1">
                          {item.pcs} PCS · {item.pax} Pax
                        </p>
                        <p className="text-[11px] sm:text-xs text-zinc-400">
                          {item.sauce}
                        </p>
                      </div>

                      {/* TOTAL ITEM PRICE */}
                      <span className="shrink-0 text-sm sm:text-base font-bold text-[#212121]">
                        {formatRupiah(getItemTotal(item))}
                      </span>
                    </div>

                    {/* CONTROLS (PAX + HAPUS) */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => decreasePax(item.id)}
                          disabled={item.pax <= 1}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#F5F5F5] text-[#212121] font-bold hover:bg-zinc-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          −
                        </button>

                        <span className="w-8 text-center text-xs sm:text-sm font-semibold">
                          {item.pax}
                        </span>

                        <button
                          type="button"
                          onClick={() => increasePax(item.id)}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#E52424] text-white font-bold hover:bg-[#D91F1F] active:scale-95 transition"
                        >
                          +
                        </button>

                        <span className="text-[10px] text-zinc-400 ml-1">
                          Pax
                        </span>
                      </div>

                      {/* TOMBOL HAPUS */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg active:scale-95 transition"
                        title="Hapus Produk"
                      >
                        <span className="text-sm">🗑️</span>
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* METODE PEMBAYARAN */}
        <section className="mt-5">
          <h2 className="text-sm sm:text-base font-semibold text-[#212121] mb-3">
            Metode Pembayaran
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {/* CASH */}
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`relative min-h-24 sm:min-h-28 rounded-2xl border p-4 text-left transition active:scale-[0.98] ${paymentMethod === "cash"
                  ? "border-[#E52424] bg-[#E52424]/5"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
            >
              {paymentMethod === "cash" && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#E52424] text-white flex items-center justify-center text-xs">
                  ✓
                </span>
              )}

              <div className="text-2xl mb-2">💵</div>
              <p
                className={`text-sm font-semibold ${paymentMethod === "cash"
                    ? "text-[#E52424]"
                    : "text-[#212121]"
                  }`}
              >
                Cash
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">
                Pembayaran tunai
              </p>
            </button>

            {/* QRIS */}
            <button
              type="button"
              onClick={() => setPaymentMethod("qris")}
              className={`relative min-h-24 sm:min-h-28 rounded-2xl border p-4 text-left transition active:scale-[0.98] ${paymentMethod === "qris"
                  ? "border-[#E52424] bg-[#E52424]/5"
                  : "border-zinc-200 bg-white hover:border-zinc-300"
                }`}
            >
              {paymentMethod === "qris" && (
                <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#E52424] text-white flex items-center justify-center text-xs">
                  ✓
                </span>
              )}

              <div className="text-2xl mb-2">📱</div>
              <p
                className={`text-sm font-semibold ${paymentMethod === "qris"
                    ? "text-[#E52424]"
                    : "text-[#212121]"
                  }`}
              >
                QRIS
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">
                Pembayaran QRIS
              </p>
            </button>
          </div>
        </section>

        {/* RINGKASAN */}
        <section className="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 mt-4">
          <h3 className="text-sm sm:text-base font-semibold text-[#212121] mb-4">
            Ringkasan
          </h3>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between">
              <span className="text-zinc-500">Subtotal</span>
              <span className="font-medium">
                {formatRupiah(subtotal)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-zinc-500">Pajak</span>
              <span className="font-medium">
                {formatRupiah(tax)}
              </span>
            </div>

            <div className="border-t border-zinc-100 pt-3 flex justify-between items-center">
              <span className="font-bold text-sm sm:text-base">
                Total
              </span>
              <span className="text-[#E52424] font-bold text-base sm:text-lg">
                {formatRupiah(total)}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* BOTTOM PAYMENT BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-200 p-3 sm:p-4 z-50">
        <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs text-zinc-400">
                Total Pembayaran
              </p>
              <p className="font-bold text-sm sm:text-base truncate">
                {formatRupiah(total)}
              </p>
              <p className="text-[10px] text-zinc-400">
                Metode:{" "}
                {paymentMethod === "cash" ? "Cash" : "QRIS"}
              </p>
            </div>

            <button
              type="button"
              onClick={handlePayment}
              className="shrink-0 min-h-11 sm:h-12 px-5 sm:px-7 rounded-xl bg-[#E52424] text-white text-xs sm:text-sm font-semibold hover:bg-[#D91F1F] active:scale-[0.98] transition"
            >
              <span className="sm:hidden">Bayar</span>
              <span className="hidden sm:inline">
                Bayar Sekarang
              </span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}