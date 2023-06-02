import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ShowStatement from './show_statement';

import {
  listAllCustomProducts,
  listCompanies,
  listCustomers,
  listCustomerProducts,
  listCustomerCustomProducts,
  listDealerDiscounts,
  listDelayProducts,
  listFinanceMethods,
  listProducts,
  listPayments,
  listPackagings,
  listPurchaseOrders,
  listPurchaseOrderStatements,
  listProductPackagings,
  listSeedCompanies,
  listSeedSizes,
  listStatements,
  listShareholders,
  listStatementSettings,
  getCustomerShareholders,
  getStatementById,
  deleteStatement,
  loadOrganization,
} from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    currentStatement: state.statementReducer.current,
    statementStatus: state.statementReducer.loadingStatus,
    purchaseOrderStatementsStatus: state.purchaseOrderStatementReducer.loadingStatus,
    organizationId: state.userReducer.organizationId,
    organization: state.organizationReducer,
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
    statementSettings: state.statementSettingReducer.statementSettings,
    statementSettingsLoadingStatus: state.statementSettingReducer.loadingStatus,
    delayProducts: state.delayProductReducer.delayProducts,
    delayProductsLoadingStatus: state.delayProductReducer.loadingStatus,
    financeMethods: state.financeMethodReducer.financeMethods,
    financeMethodsLoadingStatus: state.financeMethodReducer.loadingStatus,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listAllCustomProducts,
      listCompanies,
      listCustomers,
      listCustomerProducts,
      listCustomerCustomProducts,
      listDealerDiscounts,
      listDelayProducts,
      listFinanceMethods,
      listProducts,
      listPayments,
      listPackagings,
      listPurchaseOrders,
      listPurchaseOrderStatements,
      listProductPackagings,
      listSeedCompanies,
      listSeedSizes,
      listStatements,
      listStatementSettings,
      listShareholders,
      getCustomerShareholders,
      getStatementById,
      deleteStatement,
      loadOrganization,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ShowStatement);
