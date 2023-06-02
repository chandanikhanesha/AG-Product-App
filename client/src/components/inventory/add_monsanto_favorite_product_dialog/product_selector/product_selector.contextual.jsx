import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ProductSelector from './product_selector';

import {} from '../../../../store/actions';

const mapStateToProps = (state) => {
  return {
    customerProducts: state.customerProductReducer.customerProducts,
    customers: state.customerReducer.customers.filter(
      (customer) => customer.organizationId === parseInt(state.userReducer.organizationId, 10),
    ),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ProductSelector);
