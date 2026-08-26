'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('owner123', 10);
    const budiPassword = await bcrypt.hash('budisantoso123', 10);
    const sitiPassword = await bcrypt.hash('sitiaminah123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        id: 3,
        username: 'ownerA',
        password: hashedPassword,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 5,
        username: 'budisantoso',
        password: budiPassword,
        roleId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 6,
        username: 'sitiaminah',
        password: sitiPassword,
        roleId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkUpdate('Outlets', { userId: 3 }, { id: [4, 2] });

    await queryInterface.bulkInsert('Karyawans', [
      {
        name: 'Budi Santoso',
        category: 'Tenant',
        phone: '081234567811',
        outletId: 4,
        userId: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Siti Aminah',
        category: 'Tenant',
        phone: '081234567822',
        outletId: 2,
        userId: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Karyawans', { userId: [5, 6] });
    await queryInterface.bulkDelete('Users', { id: [3, 5, 6] });
    await queryInterface.bulkUpdate('Outlets', { userId: null }, { id: [4, 2] });
  },
};
