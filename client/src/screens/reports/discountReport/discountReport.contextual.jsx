import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import discountReport from './discountReport';

import { listDeliveryReceipts, downloadDiscountReport } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers.filter(
      (customer) => customer.organizationId === parseInt(state.userReducer.organizationId, 10),
    ),
    totalPages: state.customerReducer.totalPages,
    organizationId: state.userReducer.organizationId,
    totalItemsOfCustomers: state.customerReducer.totalItems,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listDeliveryReceipts,
      downloadDiscountReport,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(discountReport);
