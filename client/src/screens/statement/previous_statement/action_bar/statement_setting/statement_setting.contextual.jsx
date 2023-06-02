import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import StatementSetting from './statement_setting';

import { getStatementById, updateStatement, updatePurchaseOrderStatement } from '../../../../../store/actions';

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders.filter(
      (po) => po.isDeleted === false && !po.isQuote && po.farmData.length > 0,
    ),
    purchaseOrderStatements: state.purchaseOrderStatementReducer.purchaseOrderStatements,
    currentStatement: state.statementReducer.current,
    organizationId: state.userReducer.organizationId,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getStatementById,
      updateStatement,
      updatePurchaseOrderStatement,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(StatementSetting);
