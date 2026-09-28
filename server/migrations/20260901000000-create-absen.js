"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Absens", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users", // Menyesuaikan dengan nama tabel relasi
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      foto: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tipe: {
        type: Sequelize.ENUM("Masuk", "Keberangkatan"),
        allowNull: false,
        defaultValue: "Masuk",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Absens");
  },
};