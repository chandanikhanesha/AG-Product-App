import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ConvertQuoteDialog from './convert_quote_dialog';

import {
  createPurchaseOrderForCustomer,
  updatePurchaseOrder,
  editCustomerProduct,
  createCustomerProduct,
  createCustomerCustomProduct,
} from '../../../store/actions';

const mapStateToProps = (state) => ({
  purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
  customerProducts: state.customerProductReducer.customerProducts,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      editCustomerProduct,
      createPurchaseOrderForCustomer,
      updatePurchaseOrder,
      createCustomerProduct,
      createCustomerCustomProduct,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ConvertQuoteDialog);
