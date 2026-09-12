'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('StockOpnames', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      outletId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tanggal: {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      catatan: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });

    await queryInterface.createTable('StockOpnameDetails', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      stockOpnameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'StockOpnames', key: 'id' },
        onDelete: 'CASCADE',
      },
      inventoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      stokSistem: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      stokFisik: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      selisih: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('StockOpnameDetails');
    await queryInterface.dropTable('StockOpnames');
  },
};