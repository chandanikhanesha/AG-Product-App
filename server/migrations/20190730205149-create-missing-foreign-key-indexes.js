'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return queryInterface.addIndex(
      'CustomerCustomProducts',
      ['PurchaseOrderId']
    ).then(() => queryInterface.addIndex(
      'CustomerProducts',
      ['PurchaseOrderId']
    )).then(() => queryInterface.addIndex(
      'DeliveryReceipts',
      ['PurchaseOrderId']
    )).then(() => queryInterface.addIndex(
      'Payments',
      ['PurchaseOrderId']
    )).then(() => queryInterface.addIndex(
      'ProductPackagings',
      ['PurchaseOrderId']
    )).then(() => queryInterface.addIndex(
      'Companies',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'CustomProducts',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'Customers',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'CustomerCustomProducts',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'CustomerProducts',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'DealerDiscounts',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'DeliveryReceipts',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'DiscountPackages',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'Lots',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'Packagings',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'Products',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'ProductPackagings',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'PurchaseOrders',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'Reports',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'SeedCompanies',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'SeedSizes',
      ['OrganizationId']
    )).then(() => queryInterface.addIndex(
      'Users',
      ['OrganizationId']
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
