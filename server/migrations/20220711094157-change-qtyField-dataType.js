'use strict';

module.exports = {
  up: async(queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
     await  queryInterface.changeColumn("Lots", "quantity", {
        type: Sequelize.FLOAT,
      
      });
      await queryInterface.changeColumn("CustomLots", "quantity", {
        type: Sequelize.FLOAT,
      
      });
      await  queryInterface.changeColumn("CustomerProducts", "orderQty", {
        type: Sequelize.FLOAT,
      
      });
      await  queryInterface.changeColumn("DeliveryReceiptDetails", "amountDelivered", {
        type: Sequelize.FLOAT,
      
      });
   
   
      
      return
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
      await  queryInterface.removeColumn("CustomLots", "quantity");
      await   queryInterface.removeColumn("CustomerProducts", "orderQty");

      await  queryInterface.removeColumn("Lots", "quantity");
      await  queryInterface.changeColumn("DeliveryReceiptDetails", "amountDelivered",)
       return
  }
};
