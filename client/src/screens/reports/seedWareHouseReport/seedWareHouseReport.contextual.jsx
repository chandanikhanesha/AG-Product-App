import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import seedWareHouseReport from './seedWareHouseReport';

import {
  listCompanies,
  listSeedCompanies,
  listApiSeedCompanies,
  listRetailerOrderSummary,
  updateCurrentCropType,
  listDeliveryReceipts,
  fetchZoneIds,
  listCustomerMonsantoProducts,
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
    isOnline: state.offline.online,
    totalItemsOfCustomers: state.customerReducer.totalItems,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchZoneIds,
      listCompanies,
      listSeedCompanies,
      listApiSeedCompanies,
      listRetailerOrderSummary,
      updateCurrentCropType,
      listDeliveryReceipts,
      listCustomerMonsantoProducts,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(seedWareHouseReport);
