import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CreateCustomerFromQTPO from './create_from_qt_po';

import { createCustomer, listCustomers } from '../../../store/actions';

const mapStateToProps = (state) => ({
  organizationId: state.userReducer.organizationId,
  recentCreatedCustomerMetaId: state.customerReducer.recentCreatedCustomerMetaId,
  apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
  recentCreatedCustomerId: state.customerReducer.recentCreatedCustomerId,
  totalItemsOfCustomers: state.customerReducer.totalItemsOfCustomers,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createCustomer,
      listCustomers,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(CreateCustomerFromQTPO);
