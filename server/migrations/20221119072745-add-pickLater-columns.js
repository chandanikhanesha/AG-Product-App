'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("CustomerMonsantoProducts", "pickLaterQty", {
      type: Sequelize.FLOAT,

    }).then(() =>
      queryInterface.addColumn("CustomerMonsantoProducts", "isPickLater", {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      })
    )


  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("CustomerMonsantoProducts", "pickLaterQty").then(() =>
      queryInterface.removeColumn("CustomerMonsantoProducts", "isPickLater")

    )


  }
};
