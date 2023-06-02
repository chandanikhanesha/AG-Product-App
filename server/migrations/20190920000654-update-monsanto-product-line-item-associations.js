module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addConstraint(
        "MonsantoProductLineItems",
        ["ProductId"],
        {
          type: "FOREIGN KEY",
          name: "FK_monsantoProductLineItem_monsantoProduct", // useful if using queryInterface.removeConstraint
          references: {
            table: "MonsantoProducts",
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
        "MonsantoProductLineItems",
        "FK_monsantoProductLineItem_monsantoProduct"
      );
    } catch (e) {
      console.log(e);
    }
  }
};
