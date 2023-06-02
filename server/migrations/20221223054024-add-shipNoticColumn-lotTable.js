'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
 return Promise.all([
   queryInterface.addColumn(
    'Lots',
    'shipNotice', {
      type: Sequelize.STRING,

    }
  ),
  queryInterface.addColumn(
    'CustomLots',
    'shipNotice', {
      type: Sequelize.STRING,
      
    }
  )
 ])
  },

  down: (queryInterface, Sequelize) => {
 return  Promise.all([
     queryInterface.removeColumn("Lots", "shipNotice"),
     queryInterface.removeColumn("CustomLots", "shipNotice"),
])
  }
};
