'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return  queryInterface.addColumn(
      'TempGPOs',
      'purchaseOrderId',
      {
  
        type: Sequelize.INTEGER,
      }
    ).then(()=> queryInterface.addColumn(
      'TempGPOs',
      'indivisualDeliveryId',
      {
  
        type: Sequelize.STRING,
      }
    ))
    
   ;
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("TempGPOs", "purchaseOrderId").then(()=> queryInterface.removeColumn("TempGPOs", "indivisualDeliveryId"))
    


  }
};
