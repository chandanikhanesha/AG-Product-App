import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import SuperAdminInfo from './SuperAdminInfo';

import { getSubscriptionPlans } from '../../store/actions';

const mapStateToProps = (state) => {
  return {
    planList: state.subscriptionReducer.subscriptionPlanList,
    subscriptionPlan: state.organizationReducer.subscriptionPlan,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ getSubscriptionPlans }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SuperAdminInfo);
