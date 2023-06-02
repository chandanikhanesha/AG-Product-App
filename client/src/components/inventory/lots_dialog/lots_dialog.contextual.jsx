import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import LotsDialog from './lots_dialog';

import {
  listProducts,
  updateProduct,
  updateCustomProduct,
  updateMonsantoProduct,
  listMonsantoProducts,
  listProductDealers,
  listApiSeedCompanies,
  listSeedSizes,
  listPackagings,
} from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    monsantoProducts: state.monsantoProductReducer.monsantoProducts,
    packagings: state.packagingReducer.packagings,
    seedSizes: state.seedSizeReducer.seedSizes,
    products: state.productReducer.products,
    productDealers: state.productDealerReducer.productDealers,
    customProducts: state.customProductReducer.products,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listProducts,
      updateProduct,
      updateCustomProduct,
      updateMonsantoProduct,
      listMonsantoProducts,
      listProductDealers,
      listApiSeedCompanies,
      listSeedSizes,
      listPackagings,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(LotsDialog);
