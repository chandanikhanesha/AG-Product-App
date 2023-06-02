import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import InterestCharge from './interest_charge';

import { listInterestCharges, deleteInterestCharge } from '../../store/actions';

const mapStateToProps = (state) => {
  return {
    interestCharges: state.interestChargeReducer.interestCharges,
    isAdmin: state.userReducer.isAdmin,
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

export default connect(mapStateToProps, mapDispatchToProps)(InterestCharge);
