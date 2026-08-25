'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('owner123', 10);
    const ahmadPassword = await bcrypt.hash('ahmadfauzi123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        id: 4,
        username: 'ownerB',
        password: hashedPassword,
        roleId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 7,
        username: 'ahmadfauzi',
        password: ahmadPassword,
        roleId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkUpdate('Outlets', { userId: 4 }, { id: 3 });

    await queryInterface.bulkInsert('Karyawans', [
      {
        name: 'Ahmad Fauzi',
        category: 'Tenant',
        phone: '081234567833',
        outletId: 3,
        userId: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Karyawans', { userId: [7] });
    await queryInterface.bulkDelete('Users', { id: [4, 7] });
    await queryInterface.bulkUpdate('Outlets', { userId: null }, { id: 3 });
  },
};
