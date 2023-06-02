'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Payments", "multiCompanyData", {
      type: Sequelize.JSON,
      defaultValue: []


    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Payments", "multiCompanyData")

  }
};
