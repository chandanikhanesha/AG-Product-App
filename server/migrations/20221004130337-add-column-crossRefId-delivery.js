'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn('DeliveryReceiptDetails','crossReferenceId', Sequelize.STRING)
    
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.removeColumn(
      'DeliveryReceiptDetails',
      'crossReferenceId'
    )
  }
};
