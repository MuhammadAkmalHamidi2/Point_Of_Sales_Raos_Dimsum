"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Outlet extends Model {
    static associate(models) {
      Outlet.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      Outlet.hasMany(models.Karyawan, { foreignKey: "outletId", as: "karyawans" });
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
    },
  );
  return Outlet;
};
