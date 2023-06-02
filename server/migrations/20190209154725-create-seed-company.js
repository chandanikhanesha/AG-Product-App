'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('SeedCompanies', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      cornBrandName: {
        type: Sequelize.STRING
      },
      soybeanBrandName: {
        type: Sequelize.STRING
      },
      sorghumBrandName: {
        type: Sequelize.STRING
      },
      OrganizationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Organizations',
          key: 'id'
        }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    })
      .then(() => queryInterface.addColumn(
        'Products',
        'SeedCompanyId',
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'SeedCompanies',
            key: 'id'
          }
        }
      ))
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('SeedCompanies');
  }
};