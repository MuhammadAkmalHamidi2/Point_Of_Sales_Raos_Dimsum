'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProductOrderNeeds', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      produkId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      hargaProdukId: {
        type: Sequelize.INTEGER,
        allowNull: false, // Menunjuk ke Varian/Harga Produk
      },
      inventoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'Inventories', key: 'id' },
        onDelete: 'CASCADE',
      },
      jumlah: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      createdAt: { allowNull: false, type: Sequelize.DATE },
      updatedAt: { allowNull: false, type: Sequelize.DATE },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('ProductOrderNeeds');
  },
};