module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .changeColumn('MonsantoProducts', 'SeedCompanyId', {
        allowNull: false,
        type: 'INTEGER USING CAST("SeedCompanyId" as INTEGER)',
        defaultValue: 1
      });

  },

  down: (queryInterface, Sequelize) => {
    return queryInterface
      .changeColumn('MonsantoProducts', 'SeedCompanyId', {
        allowNull: false,
        type: 'INTEGER USING CAST("SeedCompanyId" as INTEGER)',
        defaultValue: 1
      });

  }
};
