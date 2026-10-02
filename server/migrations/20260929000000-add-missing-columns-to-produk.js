'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('produks', 'categoryId', {
      type: Sequelize.INTEGER,
      allowNull: true, // sementara true biar aman kalau sudah ada data produk lama
      references: {
        model: 'Categories',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });

    await queryInterface.addColumn('produks', 'outletId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Outlets',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addColumn('produks', 'produkImg', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('produks', 'categoryId');
    await queryInterface.removeColumn('produks', 'outletId');
    await queryInterface.removeColumn('produks', 'produkImg');
  },
};
