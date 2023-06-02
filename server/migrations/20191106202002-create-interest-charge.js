'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('InterestCharges', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      SeedCompanyId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'SeedCompanies',
          key: 'id'
        }
      },
      certainDays: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      compoundingDays: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue:15,
      },
      interestCharge: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue:0,
      },
      productCategories: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      companyIds: {
        type: Sequelize.ARRAY(Sequelize.INTEGER)
      },
      name: {
        type: Sequelize.STRING
      },
      fixedDate: {
        type: Sequelize.DATE
      },
      applyToWholeOrder: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      applyToFixedDate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      applyToCertainDate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      OrganizationId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Organizations',
          key: 'id'
        }
      },
      useByDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
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
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('InterestCharges')
  }
}
