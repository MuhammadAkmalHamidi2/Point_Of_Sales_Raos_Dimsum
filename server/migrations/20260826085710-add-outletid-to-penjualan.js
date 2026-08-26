'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('penjualans', 'outletId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Outlets',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('penjualans', 'outletId');
  }
};