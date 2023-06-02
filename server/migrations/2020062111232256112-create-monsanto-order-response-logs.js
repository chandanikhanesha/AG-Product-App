"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("MonsantoOrderResponseLogs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      quantity: {
        type: Sequelize.DECIMAL,
      },
      increaseDecrease: {
        type: Sequelize.STRING
      },
      increaseDecreaseDateTime: {
        type:  Sequelize.DATE,
      },
      MonsantoProductId: {
        type: Sequelize.INTEGER,
        references: {
          model: "MonsantoProducts",
          key: "id",
        },
      },
      OrganizationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Organizations",
          key: "id",
        },
      },
      crossReferenceId: { type: Sequelize.STRING },
      comments: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      soldTo: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("MonsantoOrderResponseLogs");
  },
};
