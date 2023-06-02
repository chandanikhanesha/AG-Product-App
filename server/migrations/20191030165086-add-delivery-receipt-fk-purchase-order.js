module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addConstraint(
        "DeliveryReceipts",
        ["PurchaseOrderId"],
        {
          type: "FOREIGN KEY",
          name: "FK_deliveryreceipts_purchaseOrder", // useful if using queryInterface.removeConstraint
          references: {
            table: "PurchaseOrders",
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
        "DeliveryReceipts",
        "FK_deliveryreceipts_monsantoProduct"
      );
    } catch (e) {
      console.log(e);
    }
  }
};
