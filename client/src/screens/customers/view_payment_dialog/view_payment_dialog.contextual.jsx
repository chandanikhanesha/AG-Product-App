import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ViewPaymentDialog from './view_payment_dialog';

import {
  listPayments,
  createPayment,
  updatePayment,
  deletePayment,
  getCustomerShareholders,
} from '../../../store/actions';
const mapStateToProps = (state) => ({
  organizationId: state.userReducer.organizationId,
  payments: state.paymentReducer.payments,
  products: state.productReducer.products,
  productsStatus: state.productReducer.loadingStatus,
  customProducts: state.customProductReducer.products,
  customProductsStatus: state.customProductReducer.loadingStatus,
  customerProducts: state.customerProductReducer.customerProducts,
  customerMonsantoProduct: state.customerMonsantoProductReducer.customerMonsantoProducts,
  customerProductsStatus: state.customerProductReducer.loadingStatus,
  dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
  dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
  customerCustomProducts: state.customerCustomProductReducer.customerCustomProducts,
  customerCustomProductsStatus: state.customerCustomProductReducer.loadingStatus,
});
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listPayments,
      createPayment,
      updatePayment,
      deletePayment,
      getCustomerShareholders,
    },
    dispatch,
  );
export default connect(mapStateToProps, mapDispatchToProps)(ViewPaymentDialog);
