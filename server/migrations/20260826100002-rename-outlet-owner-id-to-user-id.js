"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.renameColumn("Outlets", "ownerId", "userId");
  },

  async down(queryInterface) {
    await queryInterface.renameColumn("Outlets", "userId", "ownerId");
  },
};
