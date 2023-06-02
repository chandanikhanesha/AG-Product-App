import { connect } from 'react-redux';

import ShowMoreStatementsDialog from './show_more_statements_dialog';

const mapStateToProps = (state) => ({
  organizationId: state.userReducer.organizationId,
});

export default connect(mapStateToProps, null)(ShowMoreStatementsDialog);
