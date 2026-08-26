"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Absen extends Model {
    static associate(models) {
      // Relasi: Absen milik satu User
      Absen.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Absen.init(
    {
      userId: {
        type: DataTypes.INTEGER, // Ubah ke DataTypes.UUID jika ID User menggunakan UUID
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
      },
      foto: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    },
    {
      sequelize,
      modelName: "Absen",
      tableName: "Absens", // Nama tabel di database
    }
  );

  return Absen;
};