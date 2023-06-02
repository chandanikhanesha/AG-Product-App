import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CustomersList from './customers';

import {
  listSeedCompanies,
  listShareholders,
  updateShareholder,
  listCustomers,
  listPayments,
  listCustomerProducts,
  listCustomerCustomProducts,
  listDealerDiscounts,
  listProducts,
  listAllCustomProducts,
  searchCustomers,
  removeRecentCreatedCustomer,
  deleteCustomer,
  downloadDiscountReport,
  listBackupCustomer,
  listBackupCustomerHistory,
  listDeliveryReceipts,
  syncAllMonsantoOrders,
  updateCustomer,
} from '../../store/actions';

const mapStateToProps = (state) => {
  return {
    isOnline: state.offline.online,
    customers: state.customerReducer.customers.filter(
      (customer) => customer.organizationId === parseInt(state.userReducer.organizationId, 10),
    ),
    totalPages: state.customerReducer.totalPages,
    totalItemsOfCustomers: state.customerReducer.totalItems,
    imported: state.customerReducer.imported,
    payments: state.paymentReducer.payments,
    customersLoadingStatus: state.customerReducer.loadingStatus,
    recentCreatedCustomerMetaId: state.customerReducer.recentCreatedCustomerMetaId,
    products: state.productReducer.products,
    productsStatus: state.productReducer.loadingStatus,
    customProducts: state.customProductReducer.products,
    customProductsStatus: state.customProductReducer.loadingStatus,
    customerProducts: state.customerProductReducer.customerProducts,
    customerMonsantoProduct: state.customerMonsantoProductReducer.customerMonsantoProducts,
    customerProductsStatus: state.customerProductReducer.loadingStatus,
    dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
    dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
    customerCustomProducts: state.customerCustomProductReducer.customerCustomProducts,
    customerCustomProductsStatus: state.customerCustomProductReducer.loadingStatus,
    shareholders: state.shareholderReducer.shareholders,
    discountReportsList: state.discountReportReducer.discountReports,
    organizationId: state.userReducer.organizationId,
    apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
    backupCustomersHistory: state.backupCustomerHistoryReducer.backupCustomersHistory,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    isapiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies.length > 0 ? true : false,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listSeedCompanies,
      updateCustomer,

      listShareholders,
      updateShareholder,
      listCustomers,
      listPayments,
      listCustomerProducts,
      listCustomerCustomProducts,
      listDealerDiscounts,
      listProducts,
      listAllCustomProducts,
      searchCustomers,
      removeRecentCreatedCustomer,
      deleteCustomer,
      downloadDiscountReport,
      listBackupCustomer,
      listBackupCustomerHistory,
      listDeliveryReceipts,
      syncAllMonsantoOrders,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(CustomersList);
