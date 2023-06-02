import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CreateCustomerFromQTPO from './create_from_qt_po';

import { createCustomer } from '../../../store/actions';

const mapStateToProps = (state) => ({
  organizationId: state.userReducer.organizationId,
  recentCreatedCustomerMetaId: state.customerReducer.recentCreatedCustomerMetaId,
  apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
  recentCreatedCustomerId: state.customerReducer.recentCreatedCustomerId,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createCustomer,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(CreateCustomerFromQTPO);
