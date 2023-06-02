"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn("Payments", "method", {
        type: Sequelize.STRING,
        defaultValue: "Cash"
      })
      .catch(err => console.log(err));
  },

  down: queryInterface => {
    return queryInterface
      .removeColumn("Payments", "method")
      .catch(err => console.log(err));
  }
};
