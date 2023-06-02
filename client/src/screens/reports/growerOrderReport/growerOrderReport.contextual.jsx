import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import GrowerOrderReport from './growerOrderReport';

import { listDeliveryReceipts, listCompanies, listSeedCompanies, listApiSeedCompanies } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers.filter(
      (customer) => customer.organizationId === parseInt(state.userReducer.organizationId, 10),
    ),
    totalPages: state.customerReducer.totalPages,
    organizationId: state.userReducer.organizationId,
    totalItemsOfCustomers: state.customerReducer.totalItems,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
    organizationId: state.userReducer.organizationId,
    companies: state.companyReducer.companies,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    apiSeedCompaniesloadingStatus: state.apiSeedCompanyReducer.apiSeedCompanies,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listDeliveryReceipts,
      listCompanies,
      listSeedCompanies,
      listApiSeedCompanies,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(GrowerOrderReport);
