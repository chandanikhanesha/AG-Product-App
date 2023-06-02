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
} from '../../store/actions';

const mapStateToProps = (state) => {
  return {
    isOnline: state.offline.online,
    customers: state.customerReducer.customers.filter(
      (customer) => customer.organizationId === parseInt(state.userReducer.organizationId, 10),
    ),
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
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
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
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(CustomersList);
