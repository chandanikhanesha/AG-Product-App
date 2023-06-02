'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.addColumn("DeliveryReceipts", "isSynce", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
 
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
     return queryInterface.removeColumn("DeliveryReceipts", "isSynce");
  }
};
