'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class penjualan extends Model {
    static associate(models) {
      // Relasi idProduk ke tabel produk
      penjualan.belongsTo(models.produk, {
        foreignKey: 'idProduk',
        as: 'produk'
      });
    }
  }
  penjualan.init({
    invoice: {
      type: DataTypes.STRING,
      allowNull: false
    },
    idProduk: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'produks', // Nama tabel produk di database
        key: 'id'
      }
    },
    namaProduk: DataTypes.STRING,
    pcs: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pax: DataTypes.INTEGER,
    saus: {
      type: DataTypes.JSON, // Menyimpan Array of String ["saus mentai", "saus tar-tar"]
      allowNull: true,
      defaultValue: []
    },
    subtotal: DataTypes.INTEGER,
    totalBayar: DataTypes.INTEGER,
    metodePembayaran: {
      type: DataTypes.STRING, // String ("Cash" / "QRIS")
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'penjualan',
  });
  return penjualan;
};