import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CreateCustomer from './create_customer';
import { createCustomer } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    organizationId: state.userReducer.organizationId,
    apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createCustomer,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(CreateCustomer);
