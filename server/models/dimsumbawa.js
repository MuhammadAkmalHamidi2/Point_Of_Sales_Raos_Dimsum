'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DimsumBawa extends Model {
    static associate(models) {
      // Pastikan nama properti di `models` sesuai dengan nama model di file masing-masing

      // 1. Relasi ke Outlet
      if (models.outlet) {
        DimsumBawa.belongsTo(models.outlet, { foreignKey: 'outlet_id', as: 'outlet' });
      } else if (models.Outlet) {
        DimsumBawa.belongsTo(models.Outlet, { foreignKey: 'outlet_id', as: 'outlet' });
      }

      // 2. Relasi ke Produk
      if (models.produk) {
        DimsumBawa.belongsTo(models.produk, { foreignKey: 'produk_id', as: 'produk' });
      } else if (models.Produk) {
        DimsumBawa.belongsTo(models.Produk, { foreignKey: 'produk_id', as: 'produk' });
      }

      // 3. Relasi ke Category
      if (models.category) {
        DimsumBawa.belongsTo(models.category, { foreignKey: 'category_id', as: 'category' });
      } else if (models.Category) {
        DimsumBawa.belongsTo(models.Category, { foreignKey: 'category_id', as: 'category' });
      }

      // 4. Relasi ke Karyawan / User
      if (models.karyawan) {
        DimsumBawa.belongsTo(models.karyawan, { foreignKey: 'karyawan_id', as: 'karyawan' });
      } else if (models.user) {
        DimsumBawa.belongsTo(models.user, { foreignKey: 'karyawan_id', as: 'karyawan' });
      }
    }
  }

  DimsumBawa.init({
    outlet_id: DataTypes.INTEGER,
    produk_id: DataTypes.INTEGER,
    category_id: DataTypes.INTEGER,
    karyawan_id: DataTypes.INTEGER,
    jumlah_bawa: DataTypes.INTEGER,
    tanggal: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'DimsumBawa',
  });

  return DimsumBawa;
};