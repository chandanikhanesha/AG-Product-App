"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {

    return queryInterface.addColumn("Organizations", "stripCustomerId", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: (queryInterface, Sequelize) => {
  },
};
