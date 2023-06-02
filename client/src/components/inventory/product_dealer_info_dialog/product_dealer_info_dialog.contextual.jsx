import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ProductDealerInfoDialog from './product_dealer_info_dialog';

import {
  listProductDealers,
  createProductDealer,
  updateProductDealer,
  deleteProductDealer,
} from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    productDealers: state.productDealerReducer.productDealers,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ listProductDealers, createProductDealer, updateProductDealer, deleteProductDealer }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ProductDealerInfoDialog);
