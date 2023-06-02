module.exports = {
  async up(queryInterface) {
    try {
      await queryInterface.addConstraint(
        "MonsantoProducts",
        ["SeedCompanyId"],
        {
          type: "FOREIGN KEY",
          name: "FK_monsantoproduct_apiseedcompany",
          references: {
            table: "ApiSeedCompanies",
            field: "id"
          }
        }
      );
    } catch (e) {
      console.log(e);
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.removeConstraint(
        "MonsantoProducts",
        "FK_monsantoproduct_apiseedcompany"
      );
    } catch (e) {
      console.log(e);
    }
  }
};
