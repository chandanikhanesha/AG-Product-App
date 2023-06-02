'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Users',
      'isAccessOrg',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Users", "isAccessOrg");
  }
};