import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import csvPreview from './csv_preview';

// actions
import { downloadDiscountReport } from '../../store/actions';

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
      downloadDiscountReport,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(csvPreview);
