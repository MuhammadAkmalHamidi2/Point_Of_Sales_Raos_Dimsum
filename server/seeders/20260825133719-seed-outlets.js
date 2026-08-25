"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Outlets", [
      {
        id: 4,
        outletName: "Raos Dimsum DU",
        address: "Dipatiukur",
        status: true,
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 2,
        outletName: "Raos Dimsum UPI",
        address: "Universitas Pendidikan Indonesia",
        status: true,
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 3,
        outletName: "Raos Dimsum UNPAS",
        address: "Universitas Pasundan",
        status: true,
        userId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Outlets", {
      outletName: [
        "Raos Dimsum DU",
        "Raos Dimsum UPI",
        "Raos Dimsum UNPAS",
      ],
    });
  },
};