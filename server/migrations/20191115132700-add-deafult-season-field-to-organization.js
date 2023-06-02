"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn("Organizations", "defaultSeason", {
        type: Sequelize.INTEGER
      })
      .catch(err => console.log(err));
  },

  down: queryInterface => {
    return queryInterface
      .removeColumn("Organizations", "defaultSeason")
      .catch(err => console.log(err));
  }
};
