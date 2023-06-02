import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ViewCustomer from './view_customer';

import { listCustomers, updateCustomer, createNote, updateNote } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    organizationId: state.userReducer.organizationId,
    apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomers,
      updateCustomer,
      createNote,
      updateNote,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(ViewCustomer);
