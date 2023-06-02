'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
return queryInterface.addColumn(
      'Farms',
      'shareholderData', {
        type: Sequelize.JSON,
        defaultValue: []
      }
    )
  
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Farms", "shareholderData")
  }
};
