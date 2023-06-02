"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */

    await queryInterface.addColumn("DealerDiscounts", "SeedCompanyIds", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: []
    });

    await queryInterface.addColumn("DealerDiscounts", "APISeedCompanyIds", {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      defaultValue: []
    });

    await queryInterface.removeColumn('DealerDiscounts', 'SeedCompanyId')

    await queryInterface.removeColumn('DealerDiscounts', 'productCategories')

    await queryInterface.addColumn('DealerDiscounts', 'productCategories', {
      type: Sequelize.JSONB,
      defaultValue: {}
    })

    return
  },

  down: async (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    await queryInterface.removeColumn('DealerDiscounts', 'productCategories')

    await queryInterface.changeColumn('DealerDiscounts', 'productCategories', {
      type: Sequelize.ARRAY(Sequelize.STRING)
    })

    await queryInterface.removeColumn('DealerDiscounts', 'SeedCompanyIds')
    await queryInterface.removeColumn('DealerDiscounts', 'APISeedCompanyIds')


    await queryInterface.addColumn("DealerDiscounts", "SeedCompanyId", {
      type: Sequelize.INTEGER
    });
  },
};
