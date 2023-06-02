import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Presenter from './presenter';

import {
  listStatements,
  listPurchaseOrders,
  listPurchaseOrderStatements,
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
  getPurchaseOrderById,
} from '../../../../store/actions';

const mapStateToProps = (state) => {
  return {
    currentPurchaseOrder: state.purchaseOrderReducer.current,
    currentPurchaseOrderLoadingStatus: state.purchaseOrderReducer.currentLoadingStatus,
    organizationId: state.userReducer.organizationId,
    organization: state.organizationReducer,
    currentStatement: state.statementReducer.current,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders.filter(
      (po) => po.isDeleted === false && !po.isQuote && po.farmData.length > 0,
    ),
    purchaseOrderStatements: state.purchaseOrderStatementReducer.purchaseOrderStatements,
    statements: state.statementReducer.statements,
    customers: state.customerReducer.customers.sort((a, b) => b.id - a.id),
    customerProducts: state.customerProductReducer.customerProducts,
    customerProductsStatus: state.customerProductReducer.loadingStatus,
    customerCustomProducts: state.customerCustomProductReducer.customerCustomProducts,
    customerCustomProductsLoadingStatus: state.customerCustomProductReducer.load,
    products: state.productReducer.products,
    productsStatus: state.productReducer.loadingStatus,
    customProducts: state.customProductReducer.products,
    customProductsStatus: state.customProductReducer.loadingStatus,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    seedCompaniesStatus: state.seedCompanyReducer.loadingStatus,
    dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
    dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
    companies: state.companyReducer.companies,
    companiesStatus: state.companyReducer.loadingStatus,
    payments: state.paymentReducer.payments,
    paymentsStatus: state.paymentReducer.loadingStatus,
    seedSizes: state.seedSizeReducer.seedSizes,
    seedSizesStatus: state.seedSizeReducer.loadingStatus,
    packagings: state.packagingReducer.packagings,
    packagingsStatus: state.packagingReducer.loadingStatus,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listStatements,
      listPurchaseOrders,
      listPurchaseOrderStatements,
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
      getPurchaseOrderById,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Presenter);
