'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('TempPBRs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      organizationId: {type:Sequelize.INTEGER},
      purchaseOrderId: {type:Sequelize.INTEGER},
      salesOrderReferenceNumber:{type: Sequelize.STRING},
      lineNumber:{type: Sequelize.STRING},
      lineItemNumber: {type:Sequelize.STRING},
      crossReferenceId: {type:Sequelize.STRING},
      productDetail:{type: Sequelize.STRING},
      quanity: {type:Sequelize.FLOAT},
      createdAt: {

        type: Sequelize.DATE
      },
      updatedAt: {

        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('TempPBRs');
  }
};