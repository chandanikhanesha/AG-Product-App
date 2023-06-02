'use strict';
module.exports = (sequelize, DataTypes) => {
  var CustomProduct = sequelize.define('CustomProduct', {
    companyId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    unit: DataTypes.STRING,
    costUnit: DataTypes.DECIMAL,
    quantity: DataTypes.DECIMAL,
    organizationId: DataTypes.INTEGER,
    orderAmount: DataTypes.INTEGER,
    deliveredAmount: DataTypes.INTEGER,
    type: DataTypes.STRING,
    customId: DataTypes.STRING,
    isDeleted: DataTypes.BOOLEAN,
    seasonId: DataTypes.INTEGER,
    dealerPrice: DataTypes.DECIMAL,
  });
  CustomProduct.associate = function (models) {
    // associations can be defined here
    CustomProduct.belongsTo(models.Company, { as: 'Company', foreignKey: 'companyId' });

    CustomProduct.hasMany(models.CustomLot, { as: 'customLots', foreignKey: 'customProductId' });
  };

  CustomProduct.softDestroy = (whereQuery) => {
    let customProductIds;
    return CustomProduct.all({ where: whereQuery }).then((customProducts) => {
      customProductIds = customProducts.map((cp) => cp.id);
      return Promise.all([
        CustomProduct.update({ isDeleted: true }, { where: whereQuery }),
        sequelize.models.CustomerCustomProduct.softDestroy({
          customProductId: customProductIds,
        }),
        sequelize.models.CustomLot.softDestroy({ customProductId: customProductIds }),
        sequelize.models.DeliveryReceiptDetails.softDestroy({
          customProductId: customProductIds,
        }),
      ]);
    });
  };
  CustomProduct.prototype.updateLots = function (modifiedLotRows = [], organizationId) {
    let t = this;

    return new Promise((resolve, reject) => {
      let promises = modifiedLotRows.map((modifiedLotRow) => {
        if (modifiedLotRow.removeMe === true) {
          return () => sequelize.models.CustomLot.destroy({ where: { id: modifiedLotRow.id } });
        } else {
          let query = {
            seedSizeId: modifiedLotRow.seedSizeId,
            packagingId: modifiedLotRow.packagingId,
            organizationId,
            customProductId: t.id,
            duplicate: modifiedLotRow.duplicate,
          };

          return () =>
            sequelize.models.CustomLot.findCreateFind({ where: query })
              .then((response) => {
                let lot = response[0];
                return lot.update({
                  lotNumber: modifiedLotRow.lotNumber,
                  quantity: modifiedLotRow.quantity,
                  orderAmount: modifiedLotRow.orderAmount,
                  transfer: modifiedLotRow.transfer,
                  transferInfo: modifiedLotRow.transferInfo,
                  source: modifiedLotRow.source || '',
                  orderDate: modifiedLotRow.orderDate || new Date(),
                  dealerId: modifiedLotRow.dealerId,
                  dealerName: modifiedLotRow.dealerName,
                  dealerAddress: modifiedLotRow.dealerAddress,
                  isReturn: modifiedLotRow.isReturn,
                  shipNotice: modifiedLotRow.shipNotice,
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
          res.status(422).json({ error: 'Error updating product' });
        });
    });
  };
  return CustomProduct;
};
