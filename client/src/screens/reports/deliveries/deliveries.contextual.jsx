import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Deliveries from './deliveries';

// actions
import { listDeliveryReceipts } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    deliveryReceiptsStatus: state.deliveryReceiptReducer.loadingStatus,
    customers: state.customerReducer.customers,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ listDeliveryReceipts }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Deliveries);
