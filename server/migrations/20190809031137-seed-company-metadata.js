"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn("SeedCompanies", "metadata", {
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
      })
      .catch(err => console.log(err));
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface
      .removeColumn("SeedCompanies", "metadata")
      .catch(err => console.log(err));
  }
};
