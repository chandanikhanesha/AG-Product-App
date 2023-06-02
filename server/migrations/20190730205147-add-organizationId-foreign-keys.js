'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'CustomProducts',
      'OrganizationId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Organizations',
          key: 'id'
        }
      }
    ).then(() => queryInterface.addColumn(
      'DealerDiscounts',
      'OrganizationId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Organizations',
          key: 'id'
        }
      }
    )).then(() => queryInterface.addColumn(
      'Products',
      'OrganizationId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Organizations',
          key: 'id'
        }
      }
    )).then(() => queryInterface.addColumn(
      'CustomerProducts',
      'OrganizationId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Organizations',
          key: 'id'
        }
      }
    ))
    .then(() => queryInterface.addColumn(
      'CustomerCustomProducts',
      'OrganizationId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Organizations',
          key: 'id'
        }
      }
    )).then(() => queryInterface.addColumn(
      'DeliveryReceipts',
      'OrganizationId',
      {
        type: Sequelize.INTEGER,
        references: {
          model: 'Organizations',
          key: 'id'
        }
      }
    ))
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
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
