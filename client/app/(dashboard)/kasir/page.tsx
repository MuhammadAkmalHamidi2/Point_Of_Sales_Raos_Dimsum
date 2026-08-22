"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

import KasirHeader from "@/components/kasir/KasirHeader";
import BottomNavigation from "@/components/kasir/BottomNavigation";

type Category = {
  id: number;
  name: string;
};

export default function KasirPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const getCategories = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/categories`
      );

      setCategories(response.data.data || []);
    } catch (error) {
      console.error("GET CATEGORIES ERROR:", error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <main className="min-h-screen bg-[#F5F5F5] pb-20">

      <KasirHeader title="Kasir" />

      <div className="max-w-md mx-auto px-4 py-5">

        {/* Greeting */}
        <div className="mb-6">
          <p className="text-xs text-zinc-500">
            Selamat bekerja 👋
          </p>

          <h2 className="mt-1 text-xl font-bold text-[#212121]">
            Mau pesan apa hari ini?
          </h2>
        </div>

        {/* Search */}
        <div className="relative mb-6">

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
            🔍
          </span>

          <input
            type="text"
            placeholder="Cari produk..."
            className="w-full h-11 bg-white border border-zinc-200 rounded-xl pl-11 pr-4 text-sm outline-none focus:border-[#E52424] focus:ring-4 focus:ring-[#E52424]/10"
          />

        </div>

        {/* Category */}
        <section>

          <div className="flex items-center justify-between mb-3">

            <h3 className="font-semibold text-[#212121]">
              Kategori
            </h3>

            <span className="text-xs text-zinc-400">
              {categories.length} kategori
            </span>

          </div>

          {/* Loading */}
          {loading ? (

            <div className="space-y-3">

              {[1, 2, 3].map((item) => (

                <div
                  key={item}
                  className="bg-white rounded-2xl border border-zinc-200 p-4 animate-pulse"
                >

                  <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-xl bg-zinc-200" />

                    <div className="flex-1">

                      <div className="w-32 h-4 bg-zinc-200 rounded" />

                      <div className="w-20 h-3 bg-zinc-200 rounded mt-2" />

                    </div>

                  </div>

                </div>

              ))}

            </div>

          ) : categories.length === 0 ? (

            /* Empty */
            <div className="bg-white rounded-2xl border border-zinc-200 p-6 text-center">

              <div className="text-3xl mb-2">
                📂
              </div>

              <p className="text-sm font-medium text-zinc-600">
                Belum ada kategori
              </p>

              <p className="text-xs text-zinc-400 mt-1">
                Belum ada kategori yang tersedia
              </p>

            </div>

          ) : (

            /* Category List */
            <div className="space-y-3">

              {categories.map((category) => (

                <Link
                  key={category.id}
                  href={`/kasir/${category.id}`}
                  className="block"
                >

                  <div className="bg-white rounded-2xl border border-zinc-200 p-4 hover:border-[#E52424] hover:shadow-md transition">

                    <div className="flex items-center gap-4">

                      <div className="w-14 h-14 rounded-xl bg-[#E52424]/10 flex items-center justify-center text-2xl">
                        🍽️
                      </div>

                      <div className="flex-1">

                        <h4 className="font-semibold text-[#212121]">
                          {category.name}
                        </h4>

                        <p className="text-xs text-zinc-400 mt-1">
                          Lihat produk
                        </p>

                      </div>

                      <span className="text-zinc-400 text-lg">
                        →
                      </span>

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </section>

      </div>

      <BottomNavigation />

    </main>
  );
}