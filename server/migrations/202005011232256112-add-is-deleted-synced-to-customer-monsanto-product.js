"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("CustomerMonsantoProducts", "isDeteleSynced", {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn("CustomerMonsantoProducts", "isDeteleSynced");
  }
};
