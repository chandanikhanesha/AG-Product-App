'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
   return queryInterface.addColumn("MonsantoLots", "transferId", {
      type : Sequelize.STRING,
     
    });
  },

  async down (queryInterface, Sequelize) {
   return queryInterface.removeColumn("MonsantoLots", "transferId");
  }
};
