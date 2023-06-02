module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn("MonsantoProducts", "productDetail", {
        type: Sequelize.STRING
      });
    } catch (e) {
      console.log(e);
    }
  },
  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeColumn("MonsantoProducts", "productDetail");
    } catch (e) {
      console.log(e);
    }
  }
};
