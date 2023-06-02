const AccessControl = require('accesscontrol');
const ac = new AccessControl();

ac.grant('salesman') // define salesman
  .readAny('inventory')
  .readAny('discount')
  .readAny('interestCharge')
  .readAny('discountPackage')
  .readAny('seedCompany')
  .readAny('seedSize')
  .readAny('packaging')

  .readAny('customer')
  .createAny('customer')
  .updateAny('customer')
  .deleteAny('customer')

  .readAny('purchaseOrder')
  .createAny('purchaseOrder')
  .updateAny('purchaseOrder')
  .deleteAny('purchaseOrder')

  .readAny('delivery')
  .createAny('delivery')
  .updateAny('delivery')
  .deleteAny('delivery')

  .readAny('payment')
  .createAny('payment')
  .updateAny('payment')
  .deleteAny('payment')

  .grant('admin') // Continue with admin that can delete
  .extend('salesman')

  .readAny('organization')
  .createAny('organization')
  .updateAny('organization')
  .deleteAny('organization')

  .readAny('user')
  .createAny('user')
  .updateAny('user')
  .deleteAny('user')

  .createAny('inventory')
  .updateAny('inventory')
  .deleteAny('inventory')

  .createAny('discount')
  .updateAny('discount')
  .deleteAny('discount')

  .createAny('interestCharge')
  .updateAny('interestCharge')
  .deleteAny('interestCharge')

  .createAny('discountPackage')
  .updateAny('discountPackage')
  .deleteAny('discountPackage')

  .createAny('seedCompany')
  .updateAny('seedCompany')
  .deleteAny('seedCompany')

  .createAny('seedSize')
  .updateAny('seedSize')
  .deleteAny('seedSize')

  .createAny('packaging')
  .updateAny('packaging')
  .deleteAny('packaging');

module.exports = ac;
