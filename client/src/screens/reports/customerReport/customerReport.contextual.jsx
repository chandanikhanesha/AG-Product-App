import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import customerReport from './customerReport';

import { listDeliveryReceipts } from '../../../store/actions';

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
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(customerReport);
