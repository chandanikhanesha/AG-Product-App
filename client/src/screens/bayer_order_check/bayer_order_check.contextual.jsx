import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import BayerOrderCheck from './BayerOrderCheck';

import { getBayer_order_check } from '../../store/actions';

const mapStateToProps = (state) => {
  return {
    bayer_order_check_data: state.bayerOrderCheckReducer.data,
    isLoading: state.bayerOrderCheckReducer.isLoading,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ getBayer_order_check }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(BayerOrderCheck);
