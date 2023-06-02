"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("CsvMonsantoProducts", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        classification: {
          allowNull: false,
          type: Sequelize.STRING
        },
        packaging: {
          type: Sequelize.STRING
        },
        seedSize: {
          type: Sequelize.STRING
        },
        brand: {
          type: Sequelize.STRING
        },
        blend: {
          type: Sequelize.STRING
        },
        
        // UpcId: {
        //   type: Sequelize.STRING
        // },
        // AssignedBySellerId: {
        //   type: Sequelize.STRING
        // },
        crossReferenceId: {
          type: Sequelize.STRING
        },
        organizationId: {
          allowNull: false,
          type: Sequelize.INTEGER
        },
        SeedCompanyId: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        isFavorite: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        isDeletedInBayer : {
          type : Sequelize.BOOLEAN,
          default : false
        }
      })
      .catch(err => console.log(err));
  },
  down: queryInterface => {
    return queryInterface
      .dropTable("CsvMonsantoProducts")
      .catch(err => console.log(err));
  }
};
