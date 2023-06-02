import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ReturnDialog from './return_dialog';
import {
  listProducts,
  updateProduct,
  listMonsantoProducts,
  updateCustomProduct,
  updateMonsantoProduct,
} from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    monsantoProducts: state.monsantoProductReducer.monsantoProducts,
    monsantoProductStatus: state.monsantoProductReducer.loadingStatus,
    packagings: state.packagingReducer.packagings,
    seedSizes: state.seedSizeReducer.seedSizes,
    products: state.productReducer.products,
    productDealers: state.productDealerReducer.productDealers,
    customProducts: state.customProductReducer.products,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    { listProducts, listMonsantoProducts, updateProduct, updateCustomProduct, updateMonsantoProduct },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ReturnDialog);
