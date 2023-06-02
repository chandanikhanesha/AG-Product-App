import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Actionbar from './action_bar';

import {
  listCustomers,
  listCustomerProducts,
  listCustomerCustomProducts,
  listStatements,
  listPurchaseOrders,
  listPurchaseOrderStatements,
  getStatementById,
  deleteStatement,
} from '../../../../store/actions';

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
    currentStatement: state.statementReducer.current,
    statementStatus: state.statementReducer.loadingStatus,
    statements: state.statementReducer.statements.sort((a, b) => a.id - b.id),
    purchaseOrderStatementsStatus: state.purchaseOrderStatementReducer.loadingStatus,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomers,
      listCustomerProducts,
      listCustomerCustomProducts,
      listStatements,
      listPurchaseOrders,
      listPurchaseOrderStatements,
      getStatementById,
      deleteStatement,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Actionbar);
