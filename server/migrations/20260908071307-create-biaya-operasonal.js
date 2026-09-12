"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("biaya_operasional", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      outletId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },

      tanggal: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },

      deskripsi: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },

      biaya: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Index untuk mempercepat pencarian biaya
    // berdasarkan outlet dan tanggal
    await queryInterface.addIndex(
      "biaya_operasional",
      ["outletId", "tanggal"],
      {
        name: "idx_biaya_operasional_outlet_tanggal",
      }
    );

    // Index user
    await queryInterface.addIndex(
      "biaya_operasional",
      ["userId"],
      {
        name: "idx_biaya_operasional_user",
      }
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable("biaya_operasional");
  },
};