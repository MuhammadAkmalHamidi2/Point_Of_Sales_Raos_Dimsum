'use strict';

const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class produk extends Model {
    static associate(models) {
      produk.belongsTo(models.category, {
        foreignKey: 'categoryId',
        as: 'category',
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
        type : DataTypes.STRING,
        allowNull: false,
      }
    },
    {
      sequelize,
      modelName: 'produk',
      tableName: 'produks',
    }
  );

  return produk;
};