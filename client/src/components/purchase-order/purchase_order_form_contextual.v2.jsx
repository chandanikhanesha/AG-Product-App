import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import PurchaseOrderForm from './purchase_order_form.v2';
import {
  listCustomers,
  listProducts,
  listCustomerProducts,
  createCustomerProduct,
  editCustomerProduct,
  deleteCustomerProduct,
  listCustomerMonsantoProducts,
  createCustomerMonsantoProduct,
  editCustomerMonsantoProduct,
  deleteCustomerMonsantoProduct,
  listDealerDiscounts,
  listAllCustomProducts,
  listCustomerCustomProducts,
  createCustomerCustomProduct,
  deleteCustomerCustomProduct,
  updateCustomerCustomProduct,
  listPurchaseOrders,
  updatePurchaseOrder,
  deletePurchaseOrder,
  convertQuoteToExistingPurchaseOrder,
  listDeliveryReceipts,
  createDeliveryReceipt,
  createPurchaseOrderForCustomer,
  listDiscountPackages,
  listPackagings,
  listSeedSizes,
  listFarms,
  createFarm,
  updateFarm,
  listShareholders,
  createShareholder,
  getPdfForPage,
  listPayments,
  createPayment,
  updatePayment,
  deletePayment,
  loadOrganization,
  listProductPackagings,
  removeRecentCreatedCustomerProduct,
} from '../../store/actions';

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
    business: state.customProductReducer.products,
    products: state.productReducer.products,
    productsStatus: state.productReducer.loadingStatus,
    dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
    dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
    companies: state.companyReducer.companies,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    items: state.purchaseOrderReducer.purchaseOrders,
    itemsStatus: state.purchaseOrderReducer.loadingStatus,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    deliveryReceiptsStatus: state.deliveryReceiptReducer.loadingStatus,
    relatedProducts: state.customerProductReducer.customerProducts,
    recentCreatedCustomerProductId: state.customerProductReducer.recentCreatedCustomerProductId,
    relatedProductsStatus: state.customerProductReducer.loadingStatus,
    relatedCustomProducts: state.customerCustomProductReducer.customerCustomProducts,
    relatedCustomProductsStatus: state.customerCustomProductReducer.loadingStatus,
    discountPackages: state.discountPackageReducer.discountPackages,
    discountPackagesStatus: state.discountPackageReducer.loadingStatus,
    packagings: state.packagingReducer.packagings,
    seedSizes: state.seedSizeReducer.seedSizes,
    farms: state.farmReducer.farms,
    shareholders: state.shareholderReducer.shareholders,
    packagingsStatus: state.packagingReducer.loadingStatus,
    payments: state.paymentReducer.payments,
    organizationId: state.userReducer.organizationId,
    organization: state.organizationReducer,
    productPackagings: state.productPackagingReducer.productPackagings,
    productPackagingsStatus: state.productPackagingReducer.loadingStatus,
    isOnline: state.offline.online,

    getCustomerOrders: function () {
      const { purchaseOrder } = this.state;
      const { relatedProducts, relatedCustomProducts, match } = this.props;

      const customerOrders = relatedProducts.filter((rp) => rp.customerId.toString() === match.params.customer_id);
      const customProductOrders = relatedCustomProducts.filter(
        (rcp) => rcp.customerId.toString() === match.params.customer_id,
      );

      return customerOrders.concat(customProductOrders).filter((orders) => orders.purchaseOrderId === purchaseOrder.id);
    },
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomers,
      listProducts,
      listAllCustomProducts,
      listRelatedProducts: listCustomerProducts,
      linkRelatedProduct: createCustomerProduct,
      editRelatedProduct: editCustomerProduct,
      removeRelatedProduct: deleteCustomerProduct,

      listRelatedMonsantoProducts: listCustomerMonsantoProducts,
      linkRelatedMonsantoProduct: createCustomerMonsantoProduct,
      editRelatedMonsantoProduct: editCustomerMonsantoProduct,
      removeRelatedMonsantoProduct: deleteCustomerMonsantoProduct,

      listDealerDiscounts,
      listRelatedCustomProducts: listCustomerCustomProducts,
      linkRelatedCustomProduct: createCustomerCustomProduct,
      removeRelatedCustomProduct: deleteCustomerCustomProduct,
      editRelatedCustomProduct: updateCustomerCustomProduct,
      listPurchaseOrders,
      updatePurchaseOrder,
      deletePurchaseOrder,
      convertQuoteToExistingPurchaseOrder,
      listDeliveryReceipts,
      linkDeliveryReceipt: createDeliveryReceipt,
      createItemForCustomer: createPurchaseOrderForCustomer,
      removeItemForCustomer: deletePurchaseOrder,
      listDiscountPackages,
      listPackagings,
      listSeedSizes,
      listFarms,
      createFarm,
      updateFarm,
      listShareholders,
      createShareholder,
      getPdfForPage,
      listPayments,
      createPayment,
      updatePayment,
      deletePayment,
      loadOrganization,
      listProductPackagings,
      removeRecentCreatedCustomerProduct,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseOrderForm);
