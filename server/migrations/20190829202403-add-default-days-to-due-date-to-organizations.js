"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn("Organizations", "daysToInvoiceDueDateDefault", {
        type: Sequelize.INTEGER,
        defaultValue: 10
      })
      .catch(err => console.log(err));
  },

  down: queryInterface => {
    return queryInterface
      .removeColumn("Organizations", "daysToInvoiceDueDateDefault")
      .catch(err => console.log(err));
  }
};
