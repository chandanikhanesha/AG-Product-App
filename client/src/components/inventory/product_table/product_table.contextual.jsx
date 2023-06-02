import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ProductTable from './product_table';

import { listProductPackagings, listProducts, listDeliveryReceipts, listCustomers } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    productDealers: state.productDealerReducer.productDealers,
    packagings: state.packagingReducer.packagings,
    productPackagings: state.productPackagingReducer.productPackagings,
    seedSizes: state.seedSizeReducer.seedSizes,
    customers: state.customerReducer.customers,
    totalItemsOfCustomers: state.customerReducer.totalItems,

    products: state.productReducer.products,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    customerProducts: state.customerProductReducer.customerProducts,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listProductPackagings,
      listProducts,
      listDeliveryReceipts,
      listCustomers,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProductTable);
