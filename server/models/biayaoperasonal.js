"use strict";

const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class biayaoperasional extends Model {
    static associate(models) {
      // Hubungan ke outlet
      if (models.outlet) {
        biayaoperasional.belongsTo(models.outlet, {
          foreignKey: "outletId",
          as: "outlet",
        });
      }

      // Hubungan ke user
      if (models.user) {
        biayaoperasional.belongsTo(models.user, {
          foreignKey: "userId",
          as: "user",
        });
      }
    }
  }

  biayaoperasional.init(
    {
      outletId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      tanggal: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      deskripsi: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },

      biaya: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "biayaoperasional",
      tableName: "biaya_operasional",
      timestamps: true,
    }
  );

  return biayaoperasional;
};