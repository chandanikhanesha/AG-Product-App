'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ActionLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      OrganizationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Organizations',
          key: 'id'
        }
      },
      type: {
        allowNull: false,
        type: Sequelize.STRING
      },
      typeId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      user: {
        allowNull: false,
        type: Sequelize.STRING
      },
      userId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      operation: {
        allowNull: false,
        type: Sequelize.STRING
      },
      operationTime: {
        allowNull: false,
        type: Sequelize.DATE
      },
      previousData: {
        allowNull: false,
        type: Sequelize.JSON
      },
      changedData: {
        allowNull: false,
        type: Sequelize.JSON
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ActionLogs')
  }
}
