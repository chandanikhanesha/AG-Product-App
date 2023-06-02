import { connect } from 'react-redux';

import NewPurchaseOrder from './new_purchase_order';

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
    totalItemsOfCustomers: state.customerReducer.totalItemsOfCustomers,
  };
};

export default connect(mapStateToProps, null)(NewPurchaseOrder);
