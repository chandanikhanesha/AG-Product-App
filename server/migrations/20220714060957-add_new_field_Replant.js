'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
  
     queryInterface.addColumn("PurchaseOrders", "isReplant", {
      type : Sequelize.BOOLEAN,
      defaultValue : false
    });
    queryInterface.addColumn("CustomerMonsantoProducts", "isReplant", {
      type : Sequelize.BOOLEAN,
      defaultValue : false
    });
    queryInterface.addColumn("CustomerProducts", "isReplant", {
      type : Sequelize.BOOLEAN,
      defaultValue : false
    });
    queryInterface.addColumn("CustomerCustomProducts", "isReplant", {
      type : Sequelize.BOOLEAN,
      defaultValue : false
    });
    queryInterface.addColumn("Organizations", "message", {
      type:Sequelize.STRING

    });
  
    return;
  },

  async down (queryInterface, Sequelize) {
     queryInterface.removeColumn("PurchaseOrders", "isReplant");
     queryInterface.removeColumn("CustomerMonsantoProducts", "isReplant");

     queryInterface.removeColumn("CustomerProducts", "isReplant");

   
     queryInterface.removeColumn("CustomerCustomProducts", "isReplant");
     queryInterface.removeColumn("Organizations", "message");

     return;
  }
};
