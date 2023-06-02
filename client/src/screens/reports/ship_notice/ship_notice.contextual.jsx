import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ShipNotice from './shipNotice';

import { shipNoticeList, updateMonsantoProduct, updateAcceptStatus, syncShipNotice } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    ship_notice_list: state.shipNoticeReducer.data,
    isLoading: state.shipNoticeReducer.isLoading,
    organizationId: state.userReducer.organizationId,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ shipNoticeList, updateMonsantoProduct, updateAcceptStatus, syncShipNotice }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ShipNotice);
