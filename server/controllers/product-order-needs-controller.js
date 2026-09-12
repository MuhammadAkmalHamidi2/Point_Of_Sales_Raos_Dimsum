const { ProductOrderNeed, Inventory, sequelize } = require('../models');

// GET Kebutuhan untuk 1 Varian Produk
exports.getByVariant = async (req, res) => {
  try {
    const { hargaProdukId } = req.params;

    if (!hargaProdukId) {
      return res.status(400).json({ success: false, message: 'hargaProdukId wajib diisi.' });
    }

    const needs = await ProductOrderNeed.findAll({
      where: { hargaProdukId: Number(hargaProdukId) },
      include: [
        {
          model: Inventory,
          as: 'inventory',
          attributes: ['id', 'nama', 'satuan', 'stok'],
        },
      ],
    });

    return res.json({ success: true, data: needs });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// SAVE / UPDATE Batch Kebutuhan Varian
exports.saveVariantNeeds = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { produkId, hargaProdukId, needs } = req.body;

    if (!hargaProdukId) {
      await transaction.rollback();
      return res.status(400).json({ success: false, message: 'hargaProdukId wajib diisi.' });
    }

    // 1. Hapus settingan lama untuk varian ini (dengan Transaction)
    await ProductOrderNeed.destroy({
      where: { hargaProdukId: Number(hargaProdukId) },
      transaction,
    });

    // 2. Insert settingan baru jika ada item yang dikirim
    if (Array.isArray(needs) && needs.length > 0) {
      const records = needs.map((item) => ({
        // Hapus line 'produkId' di bawah ini jika di DB tidak ada kolom produkId
        ...(produkId && { produkId: Number(produkId) }),
        hargaProdukId: Number(hargaProdukId),
        inventoryId: Number(item.inventoryId),
        jumlah: Number(item.jumlah) || 1,
      }));

      await ProductOrderNeed.bulkCreate(records, { transaction });
    }

    // 3. Commit jika semua proses sukses
    await transaction.commit();

    return res.json({
      success: true,
      message: 'Kebutuhan varian berhasil diperbarui',
    });
  } catch (error) {
    // Rollback jika terjadi kegagalan
    if (transaction) await transaction.rollback();
    return res.status(500).json({ success: false, message: error.message });
  }
};