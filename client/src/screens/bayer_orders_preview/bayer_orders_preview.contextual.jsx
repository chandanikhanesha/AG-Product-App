import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import BayerOrderPreview from './bayer_orders_preview';

// actions

import { listSeedCompanies, listCompanies, listDeliveryReceipts } from '../../store/actions';

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
    companies: state.companyReducer.companies,
    apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,

    seedCompanies: state.seedCompanyReducer.seedCompanies,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    totalItemsOfCustomers: state.customerReducer.totalItems,

    // customers: state.customerReducer.customers,
    // companies: state.companyReducer.companies,
    // organizationId: state.userReducer.organizationId,
    // seedCompanies: state.seedCompanyReducer.seedCompanies,
    // customerProductsStatus: state.customerProductReducer.loadingStatus,
    // customerCustomProductsLoadingStatus: state.customerCustomProductReducer.load,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listSeedCompanies,
      listCompanies,
      listDeliveryReceipts,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(BayerOrderPreview);
