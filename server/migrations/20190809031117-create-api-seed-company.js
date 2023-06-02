"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("ApiSeedCompanies", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        name: {
          type: Sequelize.STRING
        },
        lastSelectedFavOption:{
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        lastSelectedColumnSummaryOption:{
          type: Sequelize.ARRAY(Sequelize.STRING)
        },
        lastSelectedColumnDetailOption:{
          type: Sequelize.ARRAY(Sequelize.STRING)
        },
        lastSelectedColumnPricesheetOption:{
          type: Sequelize.ARRAY(Sequelize.STRING)
        },
        cornBrandName: {
          type: Sequelize.STRING
        },
        soybeanBrandName: {
          type: Sequelize.STRING
        },
        alfalfaBrandName:{
          type: Sequelize.STRING
        },
        sorghumBrandName: {
          type: Sequelize.STRING
        },
        canolaBrandName: {
          type: Sequelize.STRING
        },
        OrganizationId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Organizations",
            key: "id"
          }
        },
        isDeleted: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        technologyId: {
          type: Sequelize.STRING
        },
        glnId: {
          type: Sequelize.STRING
        },
        password: {
          type: Sequelize.STRING
        },
        username: {
          type: Sequelize.STRING
        },
        metadata: {
          type: Sequelize.JSON,
          defaultValue: JSON.stringify({
            corn: {
              brand: true,
              blend: true,
              rm: true,
              treatment: true,
              msrp: true,
              seedCompany: true,
              grower: true,
              longShort: true,
              qtyWarehouse: true
            },
            soybean: {
              brand: true,
              blend: true,
              rm: false,
              treatment: true,
              msrp: true,
              seedCompany: true,
              grower: true,
              longShort: true,
              qtyWarehouse: true
            },
            sorghum: {
              brand: false,
              blend: true,
              rm: false,
              treatment: true,
              msrp: true,
              seedCompany: true,
              grower: true,
              longShort: true,
              qtyWarehouse: true
            }
          })
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE
        },
        zoneIds: {
          allowNull: false,
          type: Sequelize.JSON
        }
      })
      .catch(err => console.log(err));
  },
  down: queryInterface => {
    return queryInterface
      .dropTable("ApiSeedCompanies")
      .catch(err => console.log(err));
  }
};
