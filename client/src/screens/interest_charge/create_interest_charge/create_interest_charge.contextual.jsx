import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CreateInterestCharge from './create_interest_charge';

//import { LoadingStatus } from '../../store/constants'
import { createInterestCharge } from '../../../store/actions';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createInterestCharge,
    },
    dispatch,
  );

const mapStateToProps = (state) => {
  return {
    companies: state.companyReducer.companies,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    organizationId: state.userReducer.organizationId,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateInterestCharge);
