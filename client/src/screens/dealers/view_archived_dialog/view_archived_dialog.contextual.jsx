import { connect } from 'react-redux';

import ViewArchivedDialog from './view_archived_dialog';

const mapStateToProps = (state) => ({
  organizationId: state.userReducer.organizationId,
  recentCreatedCustomerMetaId: state.customerReducer.recentCreatedCustomerMetaId,
  recentCreatedCustomerId: state.customerReducer.recentCreatedCustomerId,
});

export default connect(mapStateToProps, null)(ViewArchivedDialog);
