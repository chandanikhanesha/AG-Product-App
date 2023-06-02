'use strict';
module.exports = (sequelize, DataTypes) => {
  var Product = sequelize.define('Product', {
    seedType: DataTypes.STRING,
    brand: DataTypes.STRING,
    blend: DataTypes.STRING,
    treatment: DataTypes.STRING,
    quantity: DataTypes.INTEGER, // not being used ?
    msrp: DataTypes.DECIMAL,
    amountPerBag: DataTypes.STRING,
    organizationId: DataTypes.INTEGER,
    seedCompanyId: DataTypes.INTEGER,
    isDeleted: DataTypes.BOOLEAN,
    seasonId: DataTypes.INTEGER,
    rm: DataTypes.FLOAT,
    isFavorite: DataTypes.BOOLEAN,
    seedSource: DataTypes.STRING,
    dealerPrice: DataTypes.DECIMAL,

    // orderAmount: DataTypes.INTEGER,     // TODO: remove, not being used
    // deliveredAmount: DataTypes.INTEGER  // TODO: remove, not being used
  });
  Product.associate = function (models) {
    // associations can be defined here
    Product.hasMany(models.CustomerProduct, { foreignKey: 'productId' });
    Product.hasMany(models.Lot, { as: 'lots', foreignKey: 'productId' });
    Product.hasOne(models.ProductPackaging, { foreignKey: 'productId' });
    Product.belongsTo(models.SeedCompany, { foreignKey: 'seedCompanyId' });
    Product.belongsTo(models.Season, { foreignKey: 'seasonId' });
  };

  Product.softDestroy = (whereQuery) => {
    let productIds;
    return Product.all({ where: whereQuery }).then((products) => {
      productIds = products.map((p) => p.id);
      return Promise.all([
        Product.update({ isDeleted: true }, { where: whereQuery }),
        sequelize.models.CustomerProduct.softDestroy({ productId: productIds }),
        sequelize.models.Lot.softDestroy({ productId: productIds }),
        sequelize.models.ProductPackaging.softDestroy({
          productId: productIds,
        }),
      ]);
    });
  };

  Product.prototype.updateLots = function (modifiedLotRows = [], organizationId) {
    let t = this;

    return new Promise((resolve, reject) => {
      let promises = modifiedLotRows.map((modifiedLotRow) => {
        if (modifiedLotRow.removeMe === true) {
          return () => sequelize.models.Lot.destroy({ where: { id: modifiedLotRow.id } });
        } else {
          let query = {
            seedSizeId: modifiedLotRow.seedSizeId,
            packagingId: modifiedLotRow.packagingId,
            organizationId,
            productId: t.id,
            duplicate: modifiedLotRow.duplicate,
          };

          return () =>
            sequelize.models.Lot.findCreateFind({ where: query })
              .then((response) => {
                let lot = response[0];
                return lot.update({
                  lotNumber: modifiedLotRow.lotNumber,
                  quantity: modifiedLotRow.quantity,
                  orderAmount: modifiedLotRow.orderAmount,
                  transfer: modifiedLotRow.transfer,
                  transferInfo: modifiedLotRow.transferInfo,
                  source: modifiedLotRow.source || 'Seed Company',
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

  return Product;
};
