'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Karyawan extends Model {
    static associate(models) {
      Karyawan.belongsTo(models.Outlet, { foreignKey: 'outletId', as: 'outlet' });
      Karyawan.belongsTo(models.User, { foreignKey: 'userId', as: 'account' });
    }
  }
  Karyawan.init({
    name: DataTypes.STRING,
    category: DataTypes.ENUM('Produksi', 'Tenant'),
    phone: DataTypes.STRING,
    outletId: DataTypes.INTEGER,
    userId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Karyawan',
  });
  return Karyawan;
};