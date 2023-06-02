module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.removeConstraint(
        "MonsantoRetailerOrderSummaryProducts",
        "MonsantoRetailerOrderSummaryProducts_ProductId_fkey"
      );
    } catch (e) {
      console.log(e);
    }

    try {
      await queryInterface.addConstraint(
        "MonsantoRetailerOrderSummaryProducts",
        ["ProductId"],
        {
          type: "FOREIGN KEY",
          name: "FK_monsantoRetailerOrderSummaryProducts_monsantoProducts", // useful if using queryInterface.removeConstraint
          references: {
            table: "MonsantoProducts",
            field: "crossReferenceId"
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
        "MonsantoRetailerOrderSummaryProducts",
        "FK_monsantoRetailerOrderSummaryProducts_monsantoProducts"
      );
    } catch (e) {
      console.log(e);
    }
  }
};
