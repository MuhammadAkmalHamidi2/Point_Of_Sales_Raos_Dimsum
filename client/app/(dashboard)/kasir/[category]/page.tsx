"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";

import KasirHeader from "@/components/kasir/KasirHeader";
import BottomNavigation from "@/components/kasir/BottomNavigation";

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

export default function CategoryPage() {

  // =========================
  // PARAMS
  // =========================

  const { category } = useParams();

  // =========================
  // STATE
  // =========================

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // GET PRODUCTS
  // =========================

  const getProducts = async () => {
    try {

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products/${category}`
      );

      console.log("PRODUCT DATA:", response.data.data);

      setProducts(response.data.data || []);

    } catch (error) {

      console.error("GET PRODUCTS ERROR:", error);

      setProducts([]);

    } finally {

      setLoading(false);

    }
  };

  // =========================
  // USE EFFECT
  // =========================

  useEffect(() => {

    if (category) {
      getProducts();
    }

  }, [category]);

  // =========================
  // FORMAT RUPIAH
  // =========================

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // =========================
  // CATEGORY NAME
  // =========================

  const categoryName =
    products.length > 0
      ? products[0].category.name
      : "Produk";

  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <main className="min-h-screen bg-[#F5F5F5] pb-20">

        <KasirHeader
          title="Produk"
          showBack
        />

        <div className="max-w-md mx-auto px-4 py-5">

          <div className="mb-5">

            <div className="w-16 h-3 bg-zinc-200 rounded animate-pulse" />

            <div className="w-32 h-6 bg-zinc-200 rounded mt-2 animate-pulse" />

          </div>

          <div className="grid grid-cols-2 gap-3">

            {[1, 2, 3, 4].map((item) => (

              <div
                key={item}
                className="bg-white rounded-2xl border border-zinc-200 overflow-hidden animate-pulse"
              >

                <div className="aspect-square bg-zinc-200" />

                <div className="p-3">

                  <div className="w-3/4 h-4 bg-zinc-200 rounded" />

                  <div className="w-full h-3 bg-zinc-200 rounded mt-2" />

                  <div className="w-1/2 h-4 bg-zinc-200 rounded mt-3" />

                </div>

              </div>

            ))}

          </div>

        </div>

        <BottomNavigation />

      </main>
    );
  }

  // =========================
  // EMPTY
  // =========================

  if (products.length === 0) {

    return (
      <main className="min-h-screen bg-[#F5F5F5] pb-20">

        <KasirHeader
          title="Produk"
          showBack
        />

        <div className="max-w-md mx-auto px-4 py-10 text-center">

          <div className="text-5xl mb-4">
            🍽️
          </div>

          <h2 className="text-lg font-bold text-[#212121]">
            Belum ada produk
          </h2>

          <p className="text-sm text-zinc-400 mt-2">
            Produk untuk kategori ini belum tersedia.
          </p>

        </div>

        <BottomNavigation />

      </main>
    );
  }

  // =========================
  // MAIN
  // =========================

  return (
    <main className="min-h-screen bg-[#F5F5F5] pb-20">

      <KasirHeader
        title={categoryName}
        showBack
      />

      <div className="max-w-md mx-auto px-4 py-5">

        {/* Header */}
        <div className="mb-5">

          <p className="text-xs text-zinc-400">
            Kategori
          </p>

          <h2 className="text-xl font-bold text-[#212121] mt-1">
            {categoryName}
          </h2>

        </div>

        {/* Product */}
        <div className="grid grid-cols-2 gap-3">

          {products.map((product) => (

            <Link
              key={product.id}
              href={`/kasir/${category}/${product.id}`}
            >

              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden transition-all hover:border-[#E52424] hover:shadow-md">

                {/* Image */}
                <div className="aspect-square bg-[#F5F5F5] overflow-hidden">

                  {product.produkImg ? (

                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}/public/produk/${product.produkImg}`}
                      alt={product.namaProduk}
                      className="w-full h-full object-cover"
                    />

                  ) : (

                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🥟
                    </div>

                  )}

                </div>

                {/* Information */}
                <div className="p-3">

                  <h3 className="font-semibold text-sm text-[#212121]">
                    {product.namaProduk}
                  </h3>

                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                    {product.keterangan || "Tidak ada keterangan"}
                  </p>

                  <div className="flex items-center justify-between mt-3">

                  </div>

                </div>

              </div>

            </Link>

          ))}

        </div>

      </div>

      <BottomNavigation />

    </main>
  );
}