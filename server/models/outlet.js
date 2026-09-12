"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Outlet extends Model {
    static associate(models) {
      // 🔍 TES DEBUG: Cetak semua nama model yang tersedia
      console.log("=== KEY MODEL TERDAFTAR ===", Object.keys(models));

      // Gunakan penanganan aman (optional chaining) atau pastikan nama key sesuai hasil console.log
      if (models.User) {
        Outlet.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      }
      if (models.Karyawan) {
        Outlet.hasMany(models.Karyawan, { foreignKey: "outletId", as: "karyawans" });
      }
      if (models.Produk) {
        Outlet.hasMany(models.Produk, { foreignKey: "outletId", as: "produks" });
      }
    }
  }

  Outlet.init(
    {
      outletName: DataTypes.STRING,
      address: DataTypes.TEXT,
      status: DataTypes.BOOLEAN,
      userId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Outlet",
    }
  );

  return Outlet;
};