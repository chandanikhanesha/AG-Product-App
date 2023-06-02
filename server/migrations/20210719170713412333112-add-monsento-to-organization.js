"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .addColumn("Organizations", "PartnerName", Sequelize.STRING)
      .then(() => queryInterface.addColumn("Organizations", "PartnerIdentifier", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Organizations", "PartnerAddressLine", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Organizations", "PartnerCityName", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Organizations", "PartnerStateOrProvince", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Organizations", "PartnerPostalCode", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Organizations", "PartnerPostalCountry", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Organizations", "ZoneID", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Organizations", "GLNnumber", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Organizations", "DeliveryAddressLine", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Organizations", "DeliveryCityName", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Organizations", "DeliveryStateOrProvince", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Organizations", "DeliveryPostalCode", Sequelize.STRING))
      .then(() => queryInterface.addColumn("Organizations", "DeliveryPostalCountry", Sequelize.STRING))
  },
  down: (queryInterface, Sequelize) => { },
};
