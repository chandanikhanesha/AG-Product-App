import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ProductSelector from './product_selector-v2';

import { checkinOrderProductAvailability, listFarms, listCustomers } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    farms: state.farmReducer.farms,
    customerProducts: state.customerProductReducer.customerProducts,
    customers: state.customerReducer.customers.filter(
      (customer) => customer.organizationId === parseInt(state.userReducer.organizationId, 10),
    ),
    totalItemsOfCustomers: state.customerReducer.totalItems,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ checkinOrderProductAvailability, listFarms, listCustomers }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ProductSelector);
