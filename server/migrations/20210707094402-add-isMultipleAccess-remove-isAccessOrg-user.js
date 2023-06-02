'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'Users',
      'isMultipleAccess',
      {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    );
    await queryInterface.removeColumn("Users", "isAccessOrg");
  },
  down: (queryInterface, Sequelize) => {

  }
};