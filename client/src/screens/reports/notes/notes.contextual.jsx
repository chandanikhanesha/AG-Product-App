import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Notes from './notes';

// actions
import { listNotes, deleteNote } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    isOnline: state.offline.online,
    customers: state.customerReducer.customers,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
    notes: state.noteReducer.notes,
    notesStatus: state.noteReducer.loadingStatus,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listNotes,
      deleteNote,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Notes);
