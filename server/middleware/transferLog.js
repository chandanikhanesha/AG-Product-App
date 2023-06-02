const { TransferLog, ...db } = require('models');

module.exports = {
  create: async ({ req, productName, action, otherDetail, purchaseOrderId, productId, rowId }) => {
    try {
      let transferLog = new TransferLog({
        organizationId: req.user.organizationId,
        userName: `${req.user.firstName} - ${req.user.lastName}`,
        productName: productName,
        action: action,
        otherDetail: otherDetail,
        purchaseOrderId: purchaseOrderId,
        productId: productId,
        rowId: rowId,
      });
      await transferLog.save();
    } catch (err) {
      console.log(err.message);
    }
  },
};
