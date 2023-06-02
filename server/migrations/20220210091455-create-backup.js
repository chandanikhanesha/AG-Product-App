'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Backups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      OrganizationId: {
        type: Sequelize.INTEGER
      },
      customerId: {
        type: Sequelize.INTEGER
      },
      purchaseOrderId: {
        type: Sequelize.INTEGER
      },
      pdfLink:{
        type:Sequelize.STRING(999)
      },
      seasonYear:{
        type:Sequelize.STRING
      },
      isDelivery: {
        type: Sequelize.BOOLEAN,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).catch((e)=>{
      console.log(e);
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Backups');
  }
};