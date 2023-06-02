import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import DeliveryListPreview from './delivery_preview';

// actions
import {
  listPurchaseOrders,
  listCustomerProducts,
  listCustomers,
  listShareholders,
  listDeliveryReceipts,
  loadOrganization,
  getPurchaseOrderById,
} from '../../store/actions';

const mapStateToProps = (state) => {
  return {
    currentPurchaseOrder: state.purchaseOrderReducer.current,
    currentPurchaseOrderLoadingStatus: state.purchaseOrderReducer.currentLoadingStatus,
    customerProducts: state.customerProductReducer.customerProducts,
    customerProductsStatus: state.customerProductReducer.loadingStatus,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
    purchaseOrdersStatus: state.purchaseOrderReducer.loadingStatus,
    customers: state.customerReducer.customers,
    customersStatus: state.customerReducer.loadingStatus,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    organizationId: state.userReducer.organizationId,
    organization: state.organizationReducer,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomerProducts,
      listPurchaseOrders,
      listDeliveryReceipts,
      loadOrganization,
      getPurchaseOrderById,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryListPreview);
