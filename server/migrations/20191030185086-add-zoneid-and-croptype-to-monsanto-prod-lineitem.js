module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn("MonsantoProductLineItems", "cropType", {
        type: Sequelize.STRING
      });
     
      await queryInterface.removeColumn("MonsantoProductLineItems", "zoneIds");
    } catch (e) {
      console.log(e);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn("MonsantoProductLineItems", "cropType");
      await queryInterface.addColumn("MonsantoProductLineItems", "zoneId", {
        type: Sequelize.STRING
      });
    } catch (e) {
      console.log(e);
    }
  }
};
