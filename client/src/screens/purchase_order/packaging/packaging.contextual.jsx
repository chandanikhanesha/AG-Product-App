import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import {
  listProducts,
  listCustomerProducts,
  listDealerDiscounts,
  listPackagings,
  listSeedSizes,
  listProductPackagings,
  createProductPackaging,
  updateProductPackaging,
  getPurchaseOrderById,
} from '../../../store/actions';

import PurchaseOrderPackaging from './packaging';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listProducts,
      listCustomerProducts,
      listDealerDiscounts,
      listPackagings,
      listSeedSizes,
      listProductPackagings,
      createProductPackaging,
      updateProductPackaging,
      getPurchaseOrderById,
    },
    dispatch,
  );

const mapStateToProps = (state) => {
  return {
    currentPurchaseOrder: state.purchaseOrderReducer.current,
    products: state.productReducer.products,
    productsStatus: state.productReducer.loadingStatus,
    customerProducts: state.customerProductReducer.customerProducts,
    customerProductStatus: state.customerProductReducer.loadingStatus,
    dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
    dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    packagings: state.packagingReducer.packagings,
    packagingsStatus: state.packagingReducer.loadingStatus,
    seedSizes: state.seedSizeReducer.seedSizes,
    seedSizesStatus: state.seedSizeReducer.loadingStatus,
    productPackagings: state.productPackagingReducer.productPackagings,
    productPackagingsStatus: state.productPackagingReducer.loadingStatus,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(PurchaseOrderPackaging);
