import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import StatementTable from './statement_table';

import {} from '../../../../store/actions';

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(StatementTable);
