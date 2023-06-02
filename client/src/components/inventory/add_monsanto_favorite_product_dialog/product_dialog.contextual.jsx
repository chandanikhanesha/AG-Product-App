import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ProductDialog from './product_dialog';

import { createMonsantoFavoriteProducts } from '../../../store/actions';

const mapDispatchToProps = (dispatch) => bindActionCreators({ createMonsantoFavoriteProducts }, dispatch);

export default connect(null, mapDispatchToProps)(ProductDialog);
