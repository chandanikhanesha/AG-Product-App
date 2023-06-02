"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("StatementSettings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      period: {
        allowNull: false,
        type: Sequelize.STRING
      },
      compoundingDays: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      OrganizationId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Organizations",
          key: "id"
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("StatementSettings");
  }
};
