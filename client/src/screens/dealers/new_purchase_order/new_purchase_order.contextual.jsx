import { connect } from 'react-redux';

import NewPurchaseOrder from './new_purchase_order';

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
  };
};

export default connect(mapStateToProps, null)(NewPurchaseOrder);
