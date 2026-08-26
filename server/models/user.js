"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Role, { foreignKey: "roleId" });
      User.hasMany(models.Outlet, { foreignKey: "userId", as: "outlets" });
      User.hasOne(models.Karyawan, { foreignKey: "userId", as: "karyawan" });
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      password: DataTypes.STRING,
      roleId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "User",
    },
  );
  return User;
};
