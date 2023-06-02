'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Subscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      planNames: {
        type: Sequelize.STRING
      },
      OrganizationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Organizations',
          key: 'id'
        }
      },
      subscription_start_timestamp: {
        type: Sequelize.DATE
      },
      subscription_end_timestamp: {
        type: Sequelize.DATE
      },
      paymentMode:{
        allowNull:false,
        type:Sequelize.STRING,
        defaultValue:'credit'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Subscriptions');
  }
};