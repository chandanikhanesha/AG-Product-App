'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('DealerDiscounts',
    'applyToParticularProducts',
    {
      type: Sequelize.BOOLEAN,
    });

    await queryInterface.addColumn('DealerDiscounts',
    'applyParticularProducts',
    {
      type: Sequelize.JSONB,
    });
  },

  down: async queryInterface => {
    await queryInterface.removeColumn("DealerDiscounts", "applyToParticularProducts");
    await queryInterface.removeColumn("DealerDiscounts", "applyParticularProducts");
  }
};
