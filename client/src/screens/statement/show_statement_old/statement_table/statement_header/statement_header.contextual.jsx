import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import StatementHeader from './statement_header';

import {
  listStatements,
  listPurchaseOrders,
  listPurchaseOrderStatements,
  getStatementById,
  deleteStatement,
} from '../../../../../store/actions';

const mapStateToProps = (state) => {
  return {
    organizationId: state.userReducer.organizationId,
    organization: state.organizationReducer,
    currentStatement: state.statementReducer.current,
    statements: state.statementReducer.statements,
    purchaseOrderStatements: state.purchaseOrderStatementReducer.purchaseOrderStatements,
    purchaseOrderStatementsStatus: state.purchaseOrderStatementReducer.loadingStatus,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listStatements,
      listPurchaseOrders,
      listPurchaseOrderStatements,
      getStatementById,
      deleteStatement,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(StatementHeader);
