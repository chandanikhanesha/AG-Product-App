'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addColumn(
      'SeedCompanies',
      'isDeleted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    ).then(() => queryInterface.addColumn(
      'DealerDiscounts',
      'isDeleted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    )).then(() => queryInterface.addColumn(
      'Packagings',
      'isDeleted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    )).then(() => queryInterface.addColumn(
      'Products',
      'isDeleted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    )).then(() => queryInterface.addColumn(
      'SeedSizes',
      'isDeleted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    )).then(() => queryInterface.addColumn(
      'DiscountPackages',
      'isDeleted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    )).then(() => queryInterface.addColumn(
      'CustomerProducts',
      'isDeleted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    )).then(() => queryInterface.addColumn(
      'Lots',
      'isDeleted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    )).then(() => queryInterface.addColumn(
      'DeliveryReceiptDetails',
      'isDeleted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    )).then(() => queryInterface.addColumn(
      'ProductPackagings',
      'isDeleted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    )).then(() => queryInterface.addColumn(
      'CustomerCustomProducts',
      'isDeleted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    )).then(() => queryInterface.addColumn(
      'DeliveryReceipts',
      'isDeleted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    )).then(() => queryInterface.addColumn(
      'Payments',
      'isDeleted',
      {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    ))
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
