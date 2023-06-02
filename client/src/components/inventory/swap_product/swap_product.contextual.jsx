import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import SwapProduct from './swap_product';

import {
  listDeliveryReceipts,
  listMonsantoProducts,
  listCustomers,
  checkinOrderProductAvailability,
  listProducts,
  editCustomerMonsantoProduct,
  syncMonsantoOrders,
  createCustomerMonsantoProduct,
} from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    monsantoProducts: state.monsantoProductReducer.monsantoProducts,
    totalItemsOfCustomers: state.customerReducer.totalItems,

    customersStatus: state.customerReducer.loadingStatus,
    customers: state.customerReducer.customers,
    business: state.customProductReducer.products,
    products: state.productReducer.products,
    productsStatus: state.productReducer.loadingStatus,
    dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
    dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,

    apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,

    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    deliveryReceiptsStatus: state.deliveryReceiptReducer.loadingStatus,
    relatedProducts: state.customerProductReducer.customerProducts,

    packagings: state.packagingReducer.packagings,
    seedSizes: state.seedSizeReducer.seedSizes,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomers,
      checkinOrderProductAvailability,
      listProducts,
      syncMonsantoOrders,
      listDeliveryReceipts,
      listMonsantoProducts,
      editCustomerMonsantoProduct,
      linkRelatedMonsantoProduct: createCustomerMonsantoProduct,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(SwapProduct);
