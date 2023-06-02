'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("CustomerMonsantoProducts", "pickLaterProductId", {
      type: Sequelize.INTEGER,

    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("CustomerMonsantoProducts", "pickLaterProductId")
  }
};
