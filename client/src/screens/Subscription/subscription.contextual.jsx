import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Subscription from './Subscription';

import { getSubscriptionPlans, createSubsciptionPayment } from '../../store/actions';

const mapStateToProps = (state) => {
  return {
    isOnline: state.offline.online,
    planList: state.subscriptionReducer.subscriptionPlanList,
    subscriptionPlan: state.organizationReducer.subscriptionPlan,
    apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ createSubsciptionPayment, getSubscriptionPlans }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Subscription);
