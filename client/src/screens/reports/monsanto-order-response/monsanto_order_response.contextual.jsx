import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import MonsantoOrderResponse from './MonsantoOrderResponse';

import { orderResponseList } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    order_response_list: state.orderResponseReducer.data,
    isLoading: state.orderResponseReducer.isLoading,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ orderResponseList }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(MonsantoOrderResponse);
