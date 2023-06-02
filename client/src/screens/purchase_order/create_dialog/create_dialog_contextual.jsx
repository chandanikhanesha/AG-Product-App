import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import CreatePurchaseOrderDialog from './create_dialog';
import { createPurchaseOrderForCustomer } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    subscriptionPlan: state.organizationReducer.subscriptionPlan,
    customers: state.customerReducer.customers,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createPurchaseOrderForCustomer,
    },
    dispatch,
  );

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(CreatePurchaseOrderDialog));
