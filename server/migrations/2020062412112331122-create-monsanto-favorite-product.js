"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("MonsantoFavoriteProducts", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        ProductId: {
          // productIdentification
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "MonsantoProducts",
            key: "id",
          },
        },
        ApiSeedCompanyId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "ApiSeedCompanies",
            key: "id",
          },
        },
        isDeleted: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      })
      .catch((err) => console.log(err));
  },
  down: (queryInterface) => {
    return queryInterface
      .dropTable("MonsantoFavoriteProduct")
      .catch((err) => console.log(err));
  },
};
