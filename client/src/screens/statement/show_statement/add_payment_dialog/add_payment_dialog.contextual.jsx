import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AddPaymentDialog from './add_payment_dialog';

import { createPayment, listPayments } from '../../../../store/actions';

const mapStateToProps = (state) => {
  return {
    companies: state.companyReducer.companies,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    organizationId: state.userReducer.organizationId,
    payments: state.paymentReducer.payments,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders
      .filter((po) => po.isDeleted === false && !po.isQuote && po.farmData.length > 0)
      .sort((a, b) => a.id - b.id),
  };
};

const mapDispatchToProps = (dispatch) => bindActionCreators({ createPayment, listPayments }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AddPaymentDialog);
