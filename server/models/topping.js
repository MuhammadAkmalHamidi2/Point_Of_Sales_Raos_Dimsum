'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class topping extends Model {
    static associate(models) {
      topping.belongsTo(models.produk, {
        foreignKey: 'produkId',
        as: 'produk',
      });
    }
  }

  topping.init(
    {
      namaTopping: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      harga: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      produkId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'topping',
      tableName: 'toppings',
    }
  );

  return topping;
};