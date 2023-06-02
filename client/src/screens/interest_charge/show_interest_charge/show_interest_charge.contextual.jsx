import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ShowInterestCharge from './show_interest_charge';

import { listInterestCharges, deleteInterestCharge } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    companies: state.companyReducer.companies,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    organizationId: state.userReducer.organizationId,
    //interestCharges: state.interestChargeReducer.interestCharges
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listInterestCharges,
      deleteInterestCharge,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ShowInterestCharge);
