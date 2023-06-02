import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isUnloadedOrLoading } from '../../../utilities';
import DeliveryList from './deliveryList';
import {
  listCustomers,
  listProducts,
  listCustomerProducts,
  listAllCustomProducts,
  listCustomerCustomProducts,
  listPurchaseOrders,
  listDeliveryReceipts,
  createDeliveryReceipt,
  listPackagings,
  listSeedSizes,
  loadOrganization,
  listProductPackagings,
  getPurchaseOrderById,
  movementReport,
  createCustomerMonsantoProduct,
  updateDeliveryReceipt,
  deleteDeliveryReceipt,
  createCustomerProduct,
  createCustomerCustomProduct,
  createAllReturnProduct,
  shipNoticeList,
} from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    currentPurchaseOrder: state.purchaseOrderReducer.current,
    customers: state.customerReducer.customers,
    business: state.customProductReducer.products,
    products: state.productReducer.products,
    productsStatus: state.productReducer.loadingStatus,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
    purchaseOrdersStatus: state.purchaseOrderReducer.loadingStatus,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    deliveryReceiptsStatus: state.deliveryReceiptReducer.loadingStatus,
    relatedProducts: state.customerProductReducer.customerProducts,
    recentCreatedCustomerProductId: state.customerProductReducer.recentCreatedCustomerProductId,
    relatedProductsStatus: state.customerProductReducer.loadingStatus,
    relatedCustomProducts: state.customerCustomProductReducer.customerCustomProducts,
    relatedCustomProductsStatus: state.customerCustomProductReducer.loadingStatus,
    packagings: state.packagingReducer.packagings,
    packagingsStatus: state.packagingReducer.loadingStatus,
    seedSizes: state.seedSizeReducer.seedSizes,
    seedSizesStatus: state.seedSizeReducer.loadingStatus,
    organizationId: state.userReducer.organizationId,
    organization: state.organizationReducer,
    productPackagings: state.productPackagingReducer.productPackagings,
    productPackagingsStatus: state.productPackagingReducer.loadingStatus,
    isOnline: state.offline.online,
    ship_notice_list: state.shipNoticeReducer.data,

    isLoading: function () {
      return (
        this.props.isOnline &&
        [
          this.props.productsStatus,
          this.props.discountPackagesStatus,
          this.props.packagingsStatus,
          this.props.deliveryReceiptsStatus,
          this.props.relatedProductsStatus,
          this.props.seedSizesStatus,
          this.props.relatedCustomProductsStatus,
          this.props.purchaseOrdersStatus,
          this.props.productPackagingsStatus,
        ].some(isUnloadedOrLoading)
      );
    },

    getCustomerOrders: function () {
      const { purchaseOrder } = this.state;
      const { relatedProducts, relatedCustomProducts, match } = this.props;

      const customerOrders = relatedProducts.filter((rp) => rp.customerId.toString() === match.params.customer_id);
      const customProductOrders = relatedCustomProducts.filter(
        (rcp) => rcp.customerId.toString() === match.params.customer_id,
      );

      return customerOrders.concat(customProductOrders).filter((orders) => orders.purchaseOrderId === purchaseOrder.id);
    },
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomers,
      listProducts,
      listAllCustomProducts,
      listRelatedProducts: listCustomerProducts,
      listRelatedCustomProducts: listCustomerCustomProducts,
      listPurchaseOrders,
      listDeliveryReceipts,
      createDeliveryReceipt,
      listSeedSizes,
      updateDeliveryReceipt,
      deleteDeliveryReceipt,
      shipNoticeList,
      listPackagings,
      loadOrganization,
      listProductPackagings,
      getPurchaseOrderById,
      movementReport,
      linkRelatedMonsantoProduct: createCustomerMonsantoProduct,
      linkRelatedProduct: createCustomerProduct,
      linkRelatedCustomProduct: createCustomerCustomProduct,
      createAllReturnProduct,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryList);
