"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

import KasirHeader from "@/components/kasir/KasirHeader";

// =====================================================
// API
// =====================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// =====================================================
// TYPE
// =====================================================

type Category = {
  id: number;
  name: string;
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
  category: Category;
};

type ProductResponse = {
  success: boolean;
  message: string;
  data: Product;
};

// =====================================================
// CART TYPE
// =====================================================

type CartItem = {
  id: string;
  productId: number;
  name: string;
  price: number;
  pcs: number;
  pax: number;
  sauce: string[];
  image: string | null;
  quantity: number;
};

// =====================================================
// SAUCE
// =====================================================

const sauceOptions = [
  {
    id: "mentai",
    name: "Saus Mentai",
  },
  {
    id: "tar-tar",
    name: "Saus Tar-Tar",
  },
  {
    id: "brullee",
    name: "Saus Brullee",
  },
  {
    id: "hot-volcano",
    name: "Saus Hot Volcano",
  },
  {
    id: "original",
    name: "Original",
  },
];

// =====================================================
// PCS
// =====================================================

const pcsOptions = [4, 6, 16];

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
// PAGE
// =====================================================

export default function ProductDetailPage() {

  // ===================================================
  // PARAMS
  // ===================================================

  const params = useParams();
  const router = useRouter();

  const productId = params.produk as string;

  // ===================================================
  // STATE PRODUCT
  // ===================================================

  const [product, setProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);

  // ===================================================
  // STATE ORDER
  // ===================================================

  const [selectedSauces, setSelectedSauces] =
    useState<string[]>(["mentai"]);

  const [pax, setPax] = useState(1);

  const [pcs, setPcs] = useState(4);

  // ===================================================
  // GET PRODUCT
  // ===================================================

  const getProduct = async () => {

    try {

      const response = await axios.get<ProductResponse>(
        `${API_URL}/api/products/detail/${productId}`
      );

      console.log(
        "PRODUCT DETAIL:",
        response.data.data
      );

      if (response.data.success) {

        setProduct(response.data.data);

      } else {

        setProduct(null);

      }

    } catch (error) {

      console.error(
        "GET PRODUCT DETAIL ERROR:",
        error
      );

      setProduct(null);

    } finally {

      setLoading(false);

    }
  };

  // ===================================================
  // USE EFFECT
  // ===================================================

  useEffect(() => {

    if (productId) {
      getProduct();
    }

  }, [productId]);

  // ===================================================
  // TOTAL
  // ===================================================

  const total = product
    ? product.harga * pax
    : 0;

  // ===================================================
  // TOGGLE SAUCE
  // ===================================================

  const toggleSauce = (sauceId: string) => {

    setSelectedSauces((current) => {

      if (current.includes(sauceId)) {

        return current.filter(
          (id) => id !== sauceId
        );

      }

      return [
        ...current,
        sauceId,
      ];

    });

  };

  // ===================================================
  // ADD TO CART
  // ===================================================

  const handleAddToCart = () => {

    if (!product) {
      return;
    }

    // Minimal 1 saus
    if (selectedSauces.length === 0) {

      alert(
        "Silakan pilih minimal satu saus."
      );

      return;

    }

    // =================================================
    // GET CART
    // =================================================

    const existingCart =
      localStorage.getItem("kasir-cart");

    let cart: CartItem[] = [];

    if (existingCart) {

      try {

        const parsedCart =
          JSON.parse(existingCart);

        if (Array.isArray(parsedCart)) {
          cart = parsedCart;
        }

      } catch {

        cart = [];

      }

    }

    // =================================================
    // SAUCE NAMES
    // =================================================

    const sauceNames =
      sauceOptions
        .filter((option) =>
          selectedSauces.includes(
            option.id
          )
        )
        .map(
          (option) => option.name
        );

    // =================================================
    // SORT SAUCE
    // =================================================

    const sortedSauces =
      [...selectedSauces].sort();

    // =================================================
    // CART ITEM ID
    // =================================================

    const cartItemId =
      `${product.id}-${sortedSauces.join("-")}-${pcs}`;

    // =================================================
    // NEW ITEM
    // =================================================

    const newItem: CartItem = {

      id: cartItemId,

      productId: product.id,

      name: product.namaProduk,

      price: product.harga,

      pcs,

      pax,

      sauce: sauceNames,

      image: product.produkImg,

      quantity: pax,

    };

    // =================================================
    // CHECK EXISTING
    // =================================================

    const existingIndex =
      cart.findIndex(
        (item) =>
          item.id === cartItemId
      );

    // =================================================
    // UPDATE EXISTING
    // =================================================

    if (existingIndex !== -1) {

      cart[existingIndex].pax += pax;

      cart[existingIndex].quantity += pax;

    }

    // =================================================
    // ADD NEW
    // =================================================

    else {

      cart.push(newItem);

    }

    // =================================================
    // SAVE
    // =================================================

    localStorage.setItem(
      "kasir-cart",
      JSON.stringify(cart)
    );

    // =================================================
    // UPDATE CART BADGE
    // =================================================

    window.dispatchEvent(
      new Event("cart-updated")
    );

    // =================================================
    // FEEDBACK
    // =================================================

    alert(
      `${product.namaProduk} berhasil ditambahkan ke keranjang.\n\n` +
      `Pax: ${pax}\n` +
      `PCS: ${pcs}\n` +
      `Saus: ${sauceNames.join(", ")}\n` +
      `Total: ${formatRupiah(total)}`
    );

  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (
      <main className="min-h-screen bg-[#F5F5F5]">

        <KasirHeader
          title="Produk"
          showBack
        />

        <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto">

          {/* IMAGE SKELETON */}
          <div className="h-56 sm:h-64 bg-zinc-200 animate-pulse" />

          <div className="px-4 sm:px-6 py-5">

            <div className="w-32 h-6 bg-zinc-200 rounded animate-pulse" />

            <div className="w-24 h-5 bg-zinc-200 rounded mt-3 animate-pulse" />

            <div className="w-full h-12 bg-zinc-200 rounded mt-6 animate-pulse" />

            <div className="w-full h-12 bg-zinc-200 rounded mt-2 animate-pulse" />

            <div className="w-full h-12 bg-zinc-200 rounded mt-2 animate-pulse" />

          </div>

        </div>

      </main>
    );

  }

  // ===================================================
  // PRODUCT NOT FOUND
  // ===================================================

  if (!product) {

    return (
      <main className="min-h-screen bg-[#F5F5F5] flex items-center justify-center px-4">

        <div className="text-center">

          <div className="text-6xl mb-4">
            🥟
          </div>

          <h2 className="text-lg font-bold text-[#212121]">
            Produk tidak ditemukan
          </h2>

          <p className="text-sm text-zinc-500 mt-2">
            Produk yang kamu pilih tidak tersedia.
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#E52424] text-white text-sm font-semibold hover:bg-[#D91F1F] transition"
          >
            Kembali
          </button>

        </div>

      </main>
    );

  }

  // ===================================================
  // MAIN
  // ===================================================

  return (
    <main className="min-h-screen bg-[#F5F5F5] pb-28">

      {/* =================================================
          HEADER
      ================================================= */}

      <KasirHeader
        title={product.namaProduk}
        showBack
      />

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto">

        {/* =================================================
            PRODUCT IMAGE
        ================================================= */}

        <div className="h-56 sm:h-64 bg-white flex items-center justify-center border-b border-zinc-200 overflow-hidden">

          {product.produkImg ? (

            <img
              src={`${API_URL}/public/produk/${product.produkImg}`}
              alt={product.namaProduk}
              className="w-full h-full object-cover"
            />

          ) : (

            <div className="text-8xl sm:text-9xl">
              🥟
            </div>

          )}

        </div>

        <div className="px-4 sm:px-6 py-5">

          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <div className="mb-7">

            <div className="flex items-start justify-between gap-3">

              <div>

                <h2 className="text-xl sm:text-2xl font-bold text-[#212121]">
                  {product.namaProduk}
                </h2>

              </div>

              <span className="shrink-0 px-2.5 py-1 rounded-md bg-[#35A853]/10 text-[#35A853] text-[10px] font-semibold">
                Tersedia
              </span>

            </div>

            <p className="text-xs sm:text-sm leading-5 text-zinc-500 mt-3">
              {product.keterangan ||
                "Tidak ada keterangan produk."}
            </p>

          </div>

          {/* =================================================
              PILIH SAUS
          ================================================= */}

          <section className="mb-7">

            <div className="flex items-end justify-between mb-3">

              <div>

                <h3 className="text-sm font-semibold text-[#212121]">
                  Pilih Saus
                </h3>

                <p className="text-[10px] text-zinc-400 mt-1">
                  Pilih satu atau lebih saus
                </p>

              </div>

              <span className="text-[10px] font-semibold text-[#E52424]">
                Wajib
              </span>

            </div>

            <div className="space-y-2">

              {sauceOptions.map(
                (option) => {

                  const isSelected =
                    selectedSauces.includes(
                      option.id
                    );

                  return (

                    <label
                      key={option.id}
                      className={`
                        flex
                        items-center
                        gap-3
                        w-full
                        min-h-[52px]
                        px-3.5
                        rounded-xl
                        border
                        cursor-pointer
                        select-none
                        transition-all
                        duration-200
                        ${
                          isSelected
                            ? "border-[#E52424] bg-[#E52424]/5"
                            : "border-zinc-200 bg-white hover:border-zinc-300"
                        }
                      `}
                    >

                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          toggleSauce(
                            option.id
                          )
                        }
                        className="w-5 h-5 shrink-0 accent-[#E52424] cursor-pointer"
                      />

                      <span
                        className={`
                          flex-1
                          text-xs
                          sm:text-sm
                          font-medium
                          ${
                            isSelected
                              ? "text-[#E52424]"
                              : "text-zinc-700"
                          }
                        `}
                      >
                        {option.name}
                      </span>

                      {isSelected && (

                        <span className="text-[10px] font-semibold text-[#E52424]">
                          Dipilih
                        </span>

                      )}

                    </label>

                  );

                }
              )}

            </div>

            {/* SELECTED SAUCE */}

            <div className="mt-3 rounded-xl border border-zinc-200 bg-white p-3">

              <div className="flex items-center justify-between mb-2">

                <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wide">
                  Saus dipilih
                </span>

                <span className="text-[10px] font-semibold text-[#E52424]">
                  {selectedSauces.length} pilihan
                </span>

              </div>

              {selectedSauces.length > 0 ? (

                <p className="text-xs font-semibold text-[#212121] leading-5">

                  {sauceOptions
                    .filter((option) =>
                      selectedSauces.includes(
                        option.id
                      )
                    )
                    .map(
                      (option) =>
                        option.name
                    )
                    .join(" + ")}

                </p>

              ) : (

                <p className="text-xs text-zinc-400">
                  Belum ada saus dipilih
                </p>

              )}

            </div>

          </section>

          {/* =================================================
              PAX
          ================================================= */}

          <section className="mb-7">

            <h3 className="text-sm font-semibold text-[#212121] mb-3">
              Berapa Pax?
            </h3>

            <div className="flex items-center justify-between bg-white border border-zinc-200 rounded-xl p-2">

              <button
                type="button"
                onClick={() =>
                  setPax(
                    Math.max(
                      1,
                      pax - 1
                    )
                  )
                }
                className="w-10 h-10 rounded-lg bg-[#F5F5F5] text-[#212121] font-bold hover:bg-zinc-200 active:scale-95 transition"
              >
                −
              </button>

              <div className="text-center">

                <span className="text-sm font-bold text-[#212121]">
                  {pax}
                </span>

                <p className="text-[9px] text-zinc-400">
                  Pax
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setPax(
                    (current) =>
                      current + 1
                  )
                }
                className="w-10 h-10 rounded-lg bg-[#E52424] text-white font-bold hover:bg-[#D91F1F] active:scale-95 transition"
              >
                +
              </button>

            </div>

          </section>

          {/* =================================================
              PCS
          ================================================= */}

          <section>

            <h3 className="text-sm font-semibold text-[#212121] mb-3">
              Berapa PCS?
            </h3>

            <div className="grid grid-cols-3 gap-2">

              {pcsOptions.map(
                (value) => (

                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setPcs(value)
                    }
                    className={`
                      h-11
                      rounded-xl
                      border
                      text-sm
                      font-semibold
                      transition-all
                      active:scale-[0.98]
                      ${
                        pcs === value
                          ? "border-[#E52424] bg-[#E52424] text-white"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                      }
                    `}
                  >
                    {value} PCS
                  </button>

                )
              )}

            </div>

          </section>

        </div>

      </div>

      {/* =================================================
          BOTTOM ACTION
      ================================================= */}

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-zinc-200 p-3 sm:p-4 z-50">

        <div className="w-full max-w-md sm:max-w-xl lg:max-w-2xl mx-auto flex items-center gap-3">

          <div className="flex-1 min-w-0">

            <p className="text-[10px] sm:text-xs text-zinc-400">
              Total
            </p>

            <p className="font-bold text-sm sm:text-base truncate">
              {formatRupiah(total)}
            </p>

            <p className="text-[10px] text-zinc-400 truncate">
              {pax} Pax · {pcs} PCS
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

    </main>
  );
}