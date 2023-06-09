import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

// actions
import {
  listPurchaseOrders,
  listCustomerProducts,
  listCustomers,
  listShareholders,
  loadOrganization,
  listDealerDiscounts,
  listProducts,
  listAllCustomProducts,
  listSeedCompanies,
  listPayments,
  listCompanies,
  listCustomerCustomProducts,
  listProductPackagings,
  listSeedSizes,
  listPackagings,
  listFarms,
  createPayment,
  updatePayment,
  deletePayment,
  getCustomerShareholders,
  getPurchaseOrderById,
  updateDefaultDaysToDueDate,
} from '../../store/actions';

import InvoicePreview from './invoice_preview';

const mapStateToProps = (state) => {
  return {
    currentPurchaseOrder: state.purchaseOrderReducer.current,
    currentPurchaseOrderLoadingStatus: state.purchaseOrderReducer.currentLoadingStatus,
    customerProducts: state.customerProductReducer.customerProducts,
    customerProductsStatus: state.customerProductReducer.loadingStatus,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
    purchaseOrdersStatus: state.purchaseOrderReducer.loadingStatus,
    customers: state.customerReducer.customers,
    customersStatus: state.customerReducer.loadingStatus,
    totalItemsOfCustomers: state.customerReducer.totalItems,
    shareholdersStatus: state.shareholderReducer.loadingStatus,
    organizationId: state.userReducer.organizationId,
    organization: state.organizationReducer,
    dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
    dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
    products: state.productReducer.products,
    productsStatus: state.productReducer.loadingStatus,
    customProducts: state.customProductReducer.products,
    customProductsStatus: state.customProductReducer.loadingStatus,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    seedCompaniesStatus: state.seedCompanyReducer.loadingStatus,
    payments: state.paymentReducer.payments,
    paymentsStatus: state.paymentReducer.loadingStatus,
    companies: state.companyReducer.companies,
    companiesStatus: state.companyReducer.loadingStatus,
    apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
    apiSeedCompaniesStatus: state.apiSeedCompanyReducer.loadingStatus,
    customerCustomProducts: state.customerCustomProductReducer.customerCustomProducts,
    customerCustomProductsLoadingStatus: state.customerCustomProductReducer.loadingStatus,
    customerMonsantoProduct: state.customerMonsantoProductReducer.customerMonsantoProducts,
    customerMonsantoProductStatus: state.customerMonsantoProductReducer.loadingStatus,
    productPackagings: state.productPackagingReducer.productPackagings,
    productPackagingsStatus: state.productPackagingReducer.loadingStatus,
    seedSizes: state.seedSizeReducer.seedSizes,
    seedSizesStatus: state.seedSizeReducer.loadingStatus,
    packagings: state.packagingReducer.packagings,
    packagingsStatus: state.packagingReducer.loadingStatus,
    farms: state.farmReducer.farms,
    farmsStatus: state.farmReducer.loadingStatus,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomerProducts,
      listPurchaseOrders,
      listCustomers,
      listShareholders,
      loadOrganization,
      listDealerDiscounts,
      listProducts,
      listAllCustomProducts,
      listSeedCompanies,
      listPayments,
      listCompanies,
      listCustomerCustomProducts,
      listProductPackagings,
      listSeedSizes,
      listPackagings,
      listFarms,
      createPayment,
      updatePayment,
      deletePayment,
      getCustomerShareholders,
      getPurchaseOrderById,
      updateDefaultDaysToDueDate,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(InvoicePreview);
