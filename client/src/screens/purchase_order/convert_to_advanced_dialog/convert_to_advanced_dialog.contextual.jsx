import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import convertToAdvancedDialog from './convert_to_advanced_dialog';

import {
  updatePurchaseOrder,
  createFarm,
  editCustomerProduct,
  editCustomerMonsantoProduct,
  updateCustomerCustomProduct,
} from '../../../store/actions';

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updatePurchaseOrder,
      createFarm,
      editRelatedProduct: editCustomerProduct,
      updateCustomerCustomProduct,
      editCustomerMonsantoProduct,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(convertToAdvancedDialog);
