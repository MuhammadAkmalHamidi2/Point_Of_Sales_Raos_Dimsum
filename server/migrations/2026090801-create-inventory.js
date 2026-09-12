'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Inventories', {
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
      nama: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      satuan: {
        type: Sequelize.STRING,
        defaultValue: 'pcs',
      },
      stok: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      stokMinimum: {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      aktif: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Inventories');
  },
};