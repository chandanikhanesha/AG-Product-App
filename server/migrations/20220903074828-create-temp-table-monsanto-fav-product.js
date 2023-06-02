'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('TempTableMonsantoFavProducts', {
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
      treatment: {
        type: Sequelize.STRING
      },
      // UpcId: {
      //   type: Sequelize.STRING
      // },
      // AssignedBySellerId: {
      //   type: Sequelize.STRING
      // },
      productDetail:{
        type: Sequelize.STRING

      },

      quantity:{
        type : Sequelize.FLOAT,
        },
      crossReferenceId: {
        type: Sequelize.STRING
      },
      syncQuantityDate:{
        type:Sequelize.DATE
      },
      organizationId: {
        allowNull: false,
        type: Sequelize.INTEGER
      },
      seedCompanyId: {
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
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('TempTableMonsantoFavProducts');
  }
};