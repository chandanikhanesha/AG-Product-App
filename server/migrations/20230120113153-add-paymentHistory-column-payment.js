'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Payments", "paymentHistory", {
      type: Sequelize.STRING,

    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Payments", "paymentHistory")
  }
};
