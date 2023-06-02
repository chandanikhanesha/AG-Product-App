import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import EditInterestCharge from './edit_interest_charge';

import { updateInterestCharge } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    companies: state.companyReducer.companies,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    organizationId: state.userReducer.organizationId,
    interestCharges: state.interestChargeReducer.interestCharges,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateInterestCharge,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(EditInterestCharge);
