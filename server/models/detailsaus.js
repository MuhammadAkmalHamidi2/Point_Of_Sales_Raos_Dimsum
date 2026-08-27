'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DetailSaus extends Model {
    static associate(models) {
      // Relasi ke model penjualan
      const PenjualanModel = models.penjualan || models.Penjualan;
      if (PenjualanModel) {
        DetailSaus.belongsTo(PenjualanModel, {
          foreignKey: 'penjualanId',
          as: 'penjualan',
        });
      }
    }
  }

  DetailSaus.init(
    {
      penjualanId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'penjualans', // Relasi ke tabel penjualans
          key: 'id',
        },
      },
      invoice: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      namaSaus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      qty: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'DetailSaus',
      tableName: 'detail_saus',
    }
  );

  return DetailSaus;
};