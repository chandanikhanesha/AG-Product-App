import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CustomEarlyPaysDialog from './custom_early_pays_dialog';

import { updatePurchaseOrder, getPurchaseOrderById, listPurchaseOrders } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
    currentPurchaseOrder: state.purchaseOrderReducer.current,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ updatePurchaseOrder, getPurchaseOrderById, listPurchaseOrders }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(CustomEarlyPaysDialog);
