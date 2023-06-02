import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ViewCustomer from './view_customer';

import {
  listCustomers,
  updateCustomer,
  createCustomer,
  createNote,
  updateNote,
  listBackupCustomerHistory,
} from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    organizationId: state.userReducer.organizationId,
    apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
    backupCustomersHistory: state.backupCustomerHistoryReducer.backupCustomersHistory,
    recentCreatedCustomerId: state.customerReducer.recentCreatedCustomerId,
    totalItemsOfCustomers: state.customerReducer.totalItems,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomers,
      updateCustomer,
      createNote,
      updateNote,
      listBackupCustomerHistory,
      createCustomer,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ViewCustomer);
