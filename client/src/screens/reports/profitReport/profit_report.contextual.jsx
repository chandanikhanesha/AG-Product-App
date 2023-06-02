import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ProfitReport from './profitReport';

import {
  listCompanies,
  listSeedCompanies,
  listApiSeedCompanies,
  listRetailerOrderSummary,
  listCustomerMonsantoProducts,
  listCustomerCustomProducts,
  listCustomerProducts,
} from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
    organizationId: state.userReducer.organizationId,
    companies: state.companyReducer.companies,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    apiSeedCompaniesloadingStatus: state.apiSeedCompanyReducer.apiSeedCompanies,
    monsantoRetailerOrderSummaryProducts: state.monsantoRetailerOrderSummaryReducer.products,
    monsantoRetailerOrderSummaryStatus: state.monsantoRetailerOrderSummaryReducer.loadingStatus,
    productDealers: state.productDealerReducer.productDealers,
    customers: state.customerReducer.customers,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    zoneIds: state.monsantoProductReducer.zoneIds,
    customerMonsantoProduct: state.customerMonsantoProductReducer.customerMonsantoProducts,
    customerProducts: state.customerProductReducer.customerProducts,
    customerCustomProducts: state.customerCustomProductReducer.customerCustomProducts,
    dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,

    isOnline: state.offline.online,
    totalPages: state.customerReducer.totalPages,
    totalItemsOfCustomers: state.customerReducer.totalItems,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCompanies,
      listSeedCompanies,
      listApiSeedCompanies,

      listCustomerMonsantoProducts,
      listCustomerProducts,
      listCustomerCustomProducts,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProfitReport);
