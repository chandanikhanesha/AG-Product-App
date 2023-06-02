import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Statement from './statement';

import { listStatements, listPurchaseOrders, listPurchaseOrderStatements } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    currentStatement: state.statementReducer.current,
    statements: state.statementReducer.statements,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listStatements,
      listPurchaseOrders,
      listPurchaseOrderStatements,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Statement);
