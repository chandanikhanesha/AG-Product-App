const { MonsantoProduct, MonsantoProductLineItem } = require('models');
const products = require('./monsantoProducts');
const { convertProductDescriptionToProps } = require('utilities/xml').products;

module.exports = async () => {
  console.log('\nseeding bayer products...\n');

  const insertPromises = products.map((_product) => {
    const product = new MonsantoProduct({
      //UpcId: _product.UpcId,
      //AssignedBySellerId: _product.AssignedBySellerId,
      AgiisId: _product.AgiisId,
      classification: _product.classification,
      ...convertProductDescriptionToProps(_product.description, _product.classification),
      organizationId: 1,
      seedCompanyId: 1,
    });

    return product.save().then((newProduct) => {
      const zoneIds = Array.isArray(_product.zoneId) ? _product.zoneId : [_product.zoneId];
      const productLineItem = new MonsantoProductLineItem({
        zoneIds,
        lineNumber: _product.lineNumber,
        productId: newProduct.id,
        crossReferenceProductId: _product.AgiisId,
        effectiveFrom: _product.effectiveFrom,
        effectiveTo: _product.effectiveFrom,
        suggestedDealerPrice: _product.suggestedDealerPrice,
        SuggestedDealerCurrencyId: _product.SuggestedDealerCurrencyId,
        suggestedDealerMeasurementValue: _product.suggestedDealerMeasurementValue,
        SuggestedDealerMeasurementUnitId: _product.SuggestedDealerMeasurementUnitId,
        suggestedEndUserPrice: _product.suggestedEndUserPrice,
        suggestedEndUserCurrencyId: _product.suggestedEndUserCurrencyId,
        suggestedEndUserMeasurementValue: _product.suggestedEndUserMeasurementValue,
        suggestedEndUserMeasurementUnitId: _product.suggestedEndUserMeasurementUnitId,
      });
      return productLineItem.save();
    });
  });
  return Promise.all(insertPromises);
};
