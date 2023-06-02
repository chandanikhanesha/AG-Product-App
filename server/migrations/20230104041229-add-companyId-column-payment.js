'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Payments", "companyId", {
      type: Sequelize.INTEGER,

    }).then(()=>{
      queryInterface.addColumn("Payments", "companyType", {
        type: Sequelize.STRING,
  
      })
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Payments", "companyId").then(()=>{
      queryInterface.removeColumn("Payments", "companyType")
    })

  }
};
