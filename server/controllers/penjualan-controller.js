const { penjualan, sequelize } = require("../models");

const checkoutTransaksi = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { totalBayar, metodePembayaran, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Data keranjang kosong",
      });
    }

    // 1. Generate Kode Invoice Unik
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const invoice = `INV-${dateStr}-${randomNum}`;

    // 2. Mapping data keranjang langsung ke struktur 1 tabel
    const dataPenjualan = items.map((item) => ({
      invoice,
      idProduk: Number(item.productId),
      namaProduk: item.name,
      pcs: Number(item.pcs),
      pax: Number(item.pax),
      saus: Array.isArray(item.sauce) ? item.sauce : (item.sauce ? [item.sauce] : []),
      subtotal: Number(item.price * item.pax),
      totalBayar: Number(totalBayar),
      metodePembayaran,
    }));

    // 3. Simpan semua baris barang sekaligus
    const result = await penjualan.bulkCreate(dataPenjualan, { transaction });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Transaksi berhasil disimpan",
      data: {
        invoice,
        totalBayar,
        metodePembayaran,
        totalItems: result.length,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("CHECKOUT ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Gagal memproses transaksi",
      error: error.message,
    });
  }
};

module.exports = { checkoutTransaksi };