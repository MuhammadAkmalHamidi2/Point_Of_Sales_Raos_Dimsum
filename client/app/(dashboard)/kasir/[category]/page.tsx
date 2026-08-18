import Link from "next/link";
import KasirHeader from "@/components/kasir/KasirHeader";
import BottomNavigation from "@/components/kasir/BottomNavigation";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;

  // FORMAT RUPIAH
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // DATA DUMMY PRODUK
  const products = [
    {
      id: "siomay",
      categoryId: "makanan",
      name: "Siomay",
      description:
        "Siomay ayam dengan tekstur lembut dan rasa gurih.",
      price: 12000,
      icon: "🥟",
    },
  ];

  const categoryName =
    category.charAt(0).toUpperCase() + category.slice(1);

  const categoryProducts = products.filter(
    (product) => product.categoryId === category
  );

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

          {categoryProducts.map((product) => (

            <Link
              key={product.id}
              href={`/kasir/${category}/${product.id}`}
            >
              <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden transition-all hover:border-[#E52424] hover:shadow-md">

                {/* Image */}
                <div className="aspect-square bg-[#F5F5F5] flex items-center justify-center text-6xl">
                  {product.icon}
                </div>

                {/* Information */}
                <div className="p-3">

                  <h3 className="font-semibold text-sm text-[#212121]">
                    {product.name}
                  </h3>

                  <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mt-3">

                    <span className="text-sm font-bold text-[#E52424]">
                      {formatRupiah(product.price)}
                    </span>

                    <span className="w-7 h-7 rounded-lg bg-[#E52424] text-white flex items-center justify-center">
                      +
                    </span>

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