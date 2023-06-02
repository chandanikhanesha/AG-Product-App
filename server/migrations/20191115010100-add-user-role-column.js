'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('Users', 'role', {
      type: Sequelize.STRING,
      defaultValue: 'admin'
    })
  },

  down: queryInterface => {
    return queryInterface.removeColumn('Users', 'role')
  }
}
