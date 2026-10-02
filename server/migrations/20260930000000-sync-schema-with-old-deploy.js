'use strict';

/**
 * Menyamakan kolom DB deploy baru (sparkling-prosperity) dengan deploy lama
 * (practical-stillness), berdasarkan perbandingan information_schema.COLUMNS.
 * Aman dijalankan ulang: tiap langkah cek kondisi tabel/kolom dulu.
 *
 * Taruh di: server/migrations/20260930000000-sync-schema-with-old-deploy.js
 *
 * Catatan: hanya menyamakan kolom, tipe, dan nullability. Foreign key, index,
 * dan unique constraint tidak ikut dibandingkan.
 */

async function hasTable(qi, name) {
  const tables = await qi.showAllTables();
  return tables
    .map((t) => (typeof t === 'string' ? t : t.tableName))
    .includes(name);
}

async function dropForeignKeysOn(qi, table, column) {
  const [rows] = await qi.sequelize.query(
    `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table
       AND COLUMN_NAME = :column AND REFERENCED_TABLE_NAME IS NOT NULL`,
    { replacements: { table, column } }
  );
  for (const r of rows) {
    await qi.removeConstraint(table, r.CONSTRAINT_NAME);
  }
}

async function addIfMissing(qi, table, column, definition) {
  const desc = await qi.describeTable(table);
  if (!desc[column]) await qi.addColumn(table, column, definition);
}

async function removeIfExists(qi, table, column) {
  const desc = await qi.describeTable(table);
  if (desc[column]) {
    await dropForeignKeysOn(qi, table, column);
    await qi.removeColumn(table, column);
  }
}

async function changeIfExists(qi, table, column, definition) {
  const desc = await qi.describeTable(table);
  if (desc[column]) await qi.changeColumn(table, column, definition);
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const { DataTypes } = Sequelize;

    // 1. Categories: categoryName -> name (NOT NULL), hapus status
    if (await hasTable(qi, 'Categories')) {
      const desc = await qi.describeTable('Categories');
      if (desc.categoryName && !desc.name) {
        await qi.renameColumn('Categories', 'categoryName', 'name');
      } else if (!desc.name) {
        await qi.addColumn('Categories', 'name', {
          type: DataTypes.STRING,
          allowNull: false,
        });
      }
      await changeIfExists(qi, 'Categories', 'name', {
        type: DataTypes.STRING,
        allowNull: false,
      });
      await removeIfExists(qi, 'Categories', 'status');
    }

    // 2. DetailSaus: transaksiId -> penjualanId + invoice, namaSaus & qty NOT NULL
    if (await hasTable(qi, 'DetailSaus')) {
      await removeIfExists(qi, 'DetailSaus', 'transaksiId');
      await addIfMissing(qi, 'DetailSaus', 'penjualanId', {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
      await addIfMissing(qi, 'DetailSaus', 'invoice', {
        type: DataTypes.STRING,
        allowNull: true,
      });
      await changeIfExists(qi, 'DetailSaus', 'namaSaus', {
        type: DataTypes.STRING,
        allowNull: false,
      });
      await changeIfExists(qi, 'DetailSaus', 'qty', {
        type: DataTypes.INTEGER,
        allowNull: false,
      });
    }

    // 3. Karyawans: category boleh NULL
    if (await hasTable(qi, 'Karyawans')) {
      await changeIfExists(qi, 'Karyawans', 'category', {
        type: DataTypes.ENUM('Produksi', 'Tenant'),
        allowNull: true,
      });
    }

    // 4. hargaProduks: tambah produkId, harga & qty NOT NULL
    if (await hasTable(qi, 'hargaProduks')) {
      await addIfMissing(qi, 'hargaProduks', 'produkId', {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
      await changeIfExists(qi, 'hargaProduks', 'harga', {
        type: DataTypes.INTEGER,
        allowNull: false,
      });
      await changeIfExists(qi, 'hargaProduks', 'qty', {
        type: DataTypes.INTEGER,
        allowNull: false,
      });
    }

    // 5. penjualans: hapus pembayaran, tambah kolom transaksi
    if (await hasTable(qi, 'penjualans')) {
      const usersExist = await hasTable(qi, 'Users');

      await removeIfExists(qi, 'penjualans', 'pembayaran');
      await addIfMissing(qi, 'penjualans', 'invoice', {
        type: DataTypes.STRING,
        allowNull: false,
      });
      await addIfMissing(qi, 'penjualans', 'idProduk', {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
      await addIfMissing(qi, 'penjualans', 'userId', {
        type: DataTypes.INTEGER,
        allowNull: true,
        ...(usersExist && { references: { model: 'Users', key: 'id' } }),
      });
      await addIfMissing(qi, 'penjualans', 'namaProduk', {
        type: DataTypes.STRING,
        allowNull: true,
      });
      await addIfMissing(qi, 'penjualans', 'pcs', {
        type: DataTypes.INTEGER,
        allowNull: false,
      });
      await addIfMissing(qi, 'penjualans', 'pax', {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
      await addIfMissing(qi, 'penjualans', 'saus', {
        type: DataTypes.JSON,
        allowNull: true,
      });
      await addIfMissing(qi, 'penjualans', 'subtotal', {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
      await addIfMissing(qi, 'penjualans', 'totalBayar', {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
      await addIfMissing(qi, 'penjualans', 'metodePembayaran', {
        type: DataTypes.STRING,
        allowNull: false,
      });
    }

    // 6. produks: namaProduk NOT NULL
    if (await hasTable(qi, 'produks')) {
      await changeIfExists(qi, 'produks', 'namaProduk', {
        type: DataTypes.STRING,
        allowNull: false,
      });
    }

    // 7. toppings: tambah produkId, namaTopping & harga NOT NULL
    if (await hasTable(qi, 'toppings')) {
      await addIfMissing(qi, 'toppings', 'produkId', {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
      await changeIfExists(qi, 'toppings', 'namaTopping', {
        type: DataTypes.STRING,
        allowNull: false,
      });
      await changeIfExists(qi, 'toppings', 'harga', {
        type: DataTypes.INTEGER,
        allowNull: false,
      });
    }

    // 8. product_order_needs: tabel baru (ProductOrderNeeds dibiarkan,
    //    karena di deploy lama tabel itu juga masih ada)
    if (!(await hasTable(qi, 'product_order_needs'))) {
      await qi.createTable('product_order_needs', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: DataTypes.INTEGER,
        },
        hargaProdukId: { type: DataTypes.INTEGER, allowNull: false },
        inventoryId: { type: DataTypes.INTEGER, allowNull: false },
        jumlah: { type: DataTypes.INTEGER, allowNull: false },
        createdAt: { allowNull: false, type: DataTypes.DATE },
        updatedAt: { allowNull: false, type: DataTypes.DATE },
      });
    }
  },

  async down() {
    // Migration penyamaan skema, tidak dibuat reversible.
  },
};
