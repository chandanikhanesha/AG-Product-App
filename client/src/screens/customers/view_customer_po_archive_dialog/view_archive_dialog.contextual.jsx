import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import ViewArchiveDialog from './view_archive_dialog';

import { updateCustomer } from '../../../store/actions';

// const mapStateToProps = state => {
//   return {
//     customers: state.customerReducer.customers,
//     customersLoadingStatus: state.customerReducer.loadingStatus
//   };
// };

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateCustomer,
    },
    dispatch,
  );

export default connect(null, mapDispatchToProps)(ViewArchiveDialog);
