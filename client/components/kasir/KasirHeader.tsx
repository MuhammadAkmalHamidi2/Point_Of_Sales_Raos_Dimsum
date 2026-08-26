"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type KasirHeaderProps = {
  title: string;
  showBack?: boolean;
};

type CartItem = {
  pax?: number;
  quantity?: number;
};

export default function KasirHeader({
  title,
  showBack = false,
}: KasirHeaderProps) {
  const router = useRouter();

  const [cartCount, setCartCount] = useState(0);

  // =====================================================
  // AMBIL JUMLAH ITEM DARI LOCAL STORAGE
  // =====================================================

  const updateCartCount = () => {
    try {
      const storedCart = localStorage.getItem("kasir-cart");

      if (!storedCart) {
        setCartCount(0);
        return;
      }

      const cart: CartItem[] = JSON.parse(storedCart);

      if (!Array.isArray(cart)) {
        setCartCount(0);
        return;
      }

      /*
       * Pax = Quantity
       *
       * Contoh:
       * Dimsum 2 Pax
       * Siomay 3 Pax
       *
       * Badge = 5
       */

      const total = cart.reduce((sum, item) => {
        return (
          sum +
          Number(item.pax ?? item.quantity ?? 0)
        );
      }, 0);

      setCartCount(total);
    } catch (error) {
      console.error(
        "Gagal membaca jumlah keranjang:",
        error
      );

      setCartCount(0);
    }
  };

  // =====================================================
  // LOAD AWAL
  // =====================================================

  useEffect(() => {
    updateCartCount();

    // Event custom dari Product Detail
    const handleCartUpdated = () => {
      updateCartCount();
    };

    // Event storage jika berubah dari tab lain
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "kasir-cart") {
        updateCartCount();
      }
    };

    window.addEventListener(
      "cart-updated",
      handleCartUpdated
    );

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "cart-updated",
        handleCartUpdated
      );

      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);

  // =====================================================
  // KE KERANJANG
  // =====================================================

  const goToCart = () => {
    router.push("/kasir/keranjang");
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-zinc-200">

      <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto">

        <div className="h-16 px-4 sm:px-6 flex items-center justify-between">

          {/* =================================================
              LEFT
          ================================================= */}

          <div className="flex items-center min-w-0">

            {showBack && (
              <button
                type="button"
                onClick={() => router.back()}
                aria-label="Kembali"
                className="w-9 h-9 mr-2 rounded-xl flex items-center justify-center text-[#212121] hover:bg-[#F5F5F5] active:scale-95 transition"
              >
                <span className="text-xl leading-none">
                  ←
                </span>
              </button>
            )}

            <div className="min-w-0">

              <h1 className="text-base sm:text-lg font-bold text-[#212121] truncate">
                {title}
              </h1>

              <p className="text-[10px] sm:text-xs text-zinc-400">
                Kasir
              </p>

            </div>

          </div>

          {/* =================================================
              RIGHT
          ================================================= */}

          <div className="flex items-center gap-2 ml-3">


            {/* =================================================
                CART
            ================================================= */}

            <button
              type="button"
              onClick={goToCart}
              aria-label="Keranjang"
              className="relative w-10 h-10 rounded-xl flex items-center justify-center hover:bg-[#F5F5F5] active:scale-95 transition"
            >

              {/* CART ICON */}

              <span className="text-[22px] leading-none">
                🛒
              </span>


              {/* BADGE */}

              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#E52424] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}

            </button>

          </div>

        </div>

      </div>

    </header>
  );
}