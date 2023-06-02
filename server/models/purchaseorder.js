'use strict';

module.exports = (sequelize, DataTypes) => {
  var PurchaseOrder = sequelize.define(
    'PurchaseOrder',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        // defaultValue: Math.floor(1000000 + Math.random() * 900000)
      },
      purchaseOrderStatementStatementId: DataTypes.INTEGER,
      customerId: DataTypes.INTEGER,
      organizationId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      dealerDiscounts: DataTypes.JSON,
      farmData: DataTypes.JSON,
      isQuote: DataTypes.BOOLEAN,
      isSimple: DataTypes.BOOLEAN,
      isArchive: DataTypes.BOOLEAN,
      isDeleted: DataTypes.BOOLEAN,
      notes: DataTypes.TEXT,
      addNotesDate: DataTypes.DATE,
      invoiceNote: DataTypes.JSON,
      salesOrderReference: DataTypes.STRING,
      shareholderData: DataTypes.JSON,
      invoiceDueDate: DataTypes.DATE,
      invoiceDate: DataTypes.DATE,
      isReplant: DataTypes.BOOLEAN,
    },
    {
      // hooks: {
      //   beforeCreate(order, options) {
      //     console.log('inside');
      //     return new Promise((resolve, reject) => {
      //       order.id = Math.floor(1000000 + Math.random() * 900000);
      //       console.log('Promise',order.id);
      //       return resolve(order, options);
      //     })
      //   }
      // }
    },
  );

  PurchaseOrder.associate = function (models) {
    // associations can be defined here
    PurchaseOrder.belongsTo(models.Customer, { foreignKey: 'customerId' });
    PurchaseOrder.hasMany(models.Payment, { foreignKey: 'purchaseOrderId' });
    PurchaseOrder.hasMany(models.CustomerProduct, { foreignKey: 'purchaseOrderId' });
    PurchaseOrder.hasMany(models.CustomerMonsantoProduct, { foreignKey: 'purchaseOrderId' });
    PurchaseOrder.hasMany(models.DeliveryReceipt, { foreignKey: 'purchaseOrderId' });
    PurchaseOrder.hasMany(models.CustomerCustomProduct, { foreignKey: 'purchaseOrderId' });
    PurchaseOrder.hasMany(models.ProductPackaging, { foreignKey: 'purchaseOrderId' });
    PurchaseOrder.hasMany(models.Note, { foreignKey: 'purchaseOrderId' });
    PurchaseOrder.hasMany(models.CustomEarlyPay, { foreignKey: 'purchaseOrderId' });
    PurchaseOrder.belongsToMany(models.Statement, {
      through: 'PurchaseOrderStatement',
      // as:'statements',
      foreignKey: 'purchaseOrderStatementStatementId',
      // otherKey: 'purchaseOrderId',
    });
  };

  PurchaseOrder.hardDestroy = function (ids) {
    return new Promise((resolve, reject) => {
      return Promise.all([
        sequelize.models.CustomerCustomProduct.destroy({
          where: { purchaseOrderId: ids },
        }),
        sequelize.models.CustomerProduct.destroy({
          where: { purchaseOrderId: ids },
        }),
        sequelize.models.DeliveryReceipt.destroy({
          where: { purchaseOrderId: ids },
        }),
        sequelize.models.Payment.destroy({ where: { purchaseOrderId: ids } }),
        sequelize.models.ProductPackaging.destroy({
          where: { purchaseOrderId: ids },
        }),
        sequelize.models.PurchaseOrder.destroy({ where: { id: ids } }),
      ])
        .then(() => resolve())
        .catch((e) => reject(e));
    });
  };

  PurchaseOrder.prototype.softDestroy = function () {
    return new Promise((resolve, reject) => {
      return Promise.all([
        sequelize.models.CustomerCustomProduct.softDestroy({
          purchaseOrderId: this.id,
        }),
        sequelize.models.CustomerProduct.softDestroy({
          purchaseOrderId: this.id,
        }),
        sequelize.models.DeliveryReceipt.softDestroy({
          purchaseOrderId: this.id,
        }),
        sequelize.models.Payment.softDestroy({ purchaseOrderId: this.id }),
        sequelize.models.ProductPackaging.softDestroy({
          purchaseOrderId: this.id,
        }),
      ])
        .then(() => resolve(this))
        .catch((e) => reject(e));
    });
  };

  PurchaseOrder.prototype.updateEarlyPays = function (modifiedEarlyPays = [], organizationId) {
    let t = this;

    return new Promise((resolve, reject) => {
      let promises = modifiedEarlyPays.map((modifiedEarlyPay) => {
        if (modifiedEarlyPay.removeMe === true) {
          return () =>
            sequelize.models.CustomEarlyPay.destroy({
              where: { id: modifiedEarlyPay.id },
            });
        } else {
          let query = {
            customerId: modifiedEarlyPay.customerId,
            purchaseOrderId: t.id,
            organizationId,
            payByDate: modifiedEarlyPay.payByDate,
            payingLessAmount: modifiedEarlyPay.payingLessAmount,
            remainingTotal: modifiedEarlyPay.remainingTotal,
          };

          return () =>
            sequelize.models.CustomEarlyPay.findCreateFind({ where: query })
              .then((response) => {
                let customEarlyPay = response[0];
                return customEarlyPay.update({
                  payByDate: modifiedEarlyPay.payByDate,
                  payingLessAmount: modifiedEarlyPay.payingLessAmount,
                  remainingTotal: modifiedEarlyPay.remainingTotal,
                });
              })
              .catch(reject);
        }
      });

      // Promise.all(promises)
      //   .then(() => resolve(t))
      promises
        .reduce((promiseChain, currentTask) => {
          return promiseChain.then((chainResults) =>
            currentTask().then((currentResults) => [...chainResults, currentResults]),
          );
        }, Promise.resolve([]))
        .then((results) => {
          resolve(t);
        })
        .catch((e) => {
          console.log('error : ', e);
          res.status(422).json({ error: 'Error updating purchase order' });
        });
    });
  };

  return PurchaseOrder;
};
