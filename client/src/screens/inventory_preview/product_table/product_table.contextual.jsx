import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ProductTable from './product_table';

import {} from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    productDealers: state.productDealerReducer.productDealers,
    packagings: state.packagingReducer.packagings,
    seedSizes: state.seedSizeReducer.seedSizes,
    customers: state.customerReducer.customers,
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ProductTable);
