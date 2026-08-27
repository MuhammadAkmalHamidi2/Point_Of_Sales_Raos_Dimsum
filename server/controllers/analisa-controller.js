const { Op } = require("sequelize");
const db = require("../models");

const Penjualan = db.penjualan;
const Outlet = db.Outlet;
const Produk = db.produk;
const Topping = db.topping;
const HargaProduk = db.hargaProduk;
const DetailSaus = db.DetailSaus || db.detailSaus || db.detailsaus;

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonday(date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);

  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  return result;
}

function createEmptySummary(packageGroups, sauceOptions) {
  return {
    packages: packageGroups.map((group) => ({
      categoryName: group.categoryName,
      packages: group.packages.map((item) => ({ ...item })),
    })),
    sauces: sauceOptions.map((name) => ({
      name,
      count: 0,
    })),
  };
}

function findSauceName(sauce, sauceOptions) {
  return sauceOptions.find(
    (name) => name.toLowerCase() === sauce.toLowerCase(),
  );
}

function addSaleToSummary(summary, sale, sauceOptions, productCategories) {
  const pcs = Number(sale.pcs) || 0;
  const pax = Number(sale.pax) || 0;

  const product = productCategories.find(
    (item) => item.productId === Number(sale.idProduk),
  );
  const categoryName = product?.categoryName;
  const categoryData = summary.packages.find(
    (item) => item.categoryName === categoryName,
  );
  const packageData = categoryData?.packages.find((item) => item.qty === pcs);

  if (packageData) {
    packageData.pax += pax;
  }

  const sauceDetails = sale.detailSaus || [];

  for (const detail of sauceDetails) {
    const sauceName = findSauceName(detail.namaSaus, sauceOptions);

    if (!sauceName) {
      continue;
    }

    const sauceData = summary.sauces.find((item) => item.name === sauceName);

    if (sauceData) {
      sauceData.count += Number(detail.qty) || 0;
    }
  }
}

async function getAnalisa(req, res) {
  try {
    const monday = getMonday(new Date());
    const nextMonday = new Date(monday);
    nextMonday.setDate(nextMonday.getDate() + 7);

    const outlets = await Outlet.findAll({
      where: { userId: req.user.id },
      attributes: ["id"],
    });

    const outletIds = outlets.map((outlet) => outlet.id);

    const products = await Produk.findAll({
      include: [
        {
          model: Topping,
          as: "toppings",
          attributes: ["namaTopping"],
        },
        {
          model: HargaProduk,
          as: "hargaproduks",
          attributes: ["qty"],
        },
      ],
    });

    const productCategories = [];
    const packageGroups = [];

    products.forEach((product) => {
      const categoryName = product.namaProduk;
      productCategories.push({ productId: product.id, categoryName });

      let categoryGroup = packageGroups.find(
        (group) => group.categoryName === categoryName,
      );

      if (!categoryGroup) {
        categoryGroup = { categoryName, packages: [] };
        packageGroups.push(categoryGroup);
      }

      product.hargaproduks.forEach((item) => {
        const qty = Number(item.qty);
        const packageExists = categoryGroup.packages.some(
          (packageItem) => packageItem.qty === qty,
        );

        if (!packageExists) {
          categoryGroup.packages.push({ qty, pax: 0 });
        }
      });
    });

    packageGroups.forEach((group) => {
      group.packages.sort((first, second) => first.qty - second.qty);
    });
    packageGroups.sort((first, second) => {
      const firstName = first.categoryName.toLowerCase();
      const secondName = second.categoryName.toLowerCase();
      const firstOrder = firstName.includes("kukus")
        ? 0
        : firstName.includes("goreng")
          ? 1
          : 2;
      const secondOrder = secondName.includes("kukus")
        ? 0
        : secondName.includes("goreng")
          ? 1
          : 2;

      return (
        firstOrder - secondOrder ||
        first.categoryName.localeCompare(second.categoryName)
      );
    });

    const sauceOptions = [];
    products.forEach((product) => {
      product.toppings.forEach((topping) => {
        const exists = sauceOptions.some(
          (name) => name.toLowerCase() === topping.namaTopping.toLowerCase(),
        );

        if (!exists) sauceOptions.push(topping.namaTopping);
      });
    });

    const sales = outletIds.length
      ? await Penjualan.findAll({
          where: {
            outletId: {
              [Op.in]: outletIds,
            },
            createdAt: {
              [Op.gte]: monday,
              [Op.lt]: nextMonday,
            },
          },
          attributes: ["id", "idProduk", "pcs", "pax", "createdAt"],
          include: DetailSaus
            ? [
                {
                  model: DetailSaus,
                  as: "detailSaus",
                  attributes: ["namaSaus", "qty"],
                  required: false,
                },
              ]
            : [],
        })
      : [];

    const days = [];

    for (let index = 0; index < 7; index += 1) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);

      const key = getDateKey(date);

      const dayData = {
        date: key,
        label: date.toLocaleDateString("id-ID", {
          weekday: "long",
        }),
        ...createEmptySummary(packageGroups, sauceOptions),
      };

      days.push(dayData);
    }

    const totals = createEmptySummary(packageGroups, sauceOptions);

    for (const sale of sales) {
      const saleDate = new Date(sale.createdAt);
      const dayData = days.find((day) => day.date === getDateKey(saleDate));

      if (dayData) {
        addSaleToSummary(dayData, sale, sauceOptions, productCategories);
      }

      addSaleToSummary(totals, sale, sauceOptions, productCategories);
    }

    return res.status(200).json({
      success: true,
      data: {
        period: "week",
        startDate: getDateKey(monday),
        endDate: getDateKey(new Date(monday.getTime() + 6 * 86400000)),
        totals,
        days,
      },
    });
  } catch (error) {
    console.error("GET ANALISA ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data analisa",
      error: error.message,
    });
  }
}

module.exports = {
  getAnalisa,
};
