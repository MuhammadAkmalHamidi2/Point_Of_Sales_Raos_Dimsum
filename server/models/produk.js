'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class produk extends Model {
    static associate(models) {
      // Relasi Kategori
      produk.belongsTo(models.category, {
        foreignKey: 'categoryId',
        as: 'category',
      });

      // Relasi Saus / Topping
      produk.hasMany(models.topping, {
        foreignKey: 'produkId',
        as: 'toppings',
      });

      // Relasi Qty & Harga
      produk.hasMany(models.hargaProduk, {
        foreignKey: 'produkId',
        as: 'hargaproduks',
      });
    }
  }

  produk.init(
    {
      namaProduk: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      keterangan: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      produkImg: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'produk',
      tableName: 'produks',
    }
  );

  return produk;
};