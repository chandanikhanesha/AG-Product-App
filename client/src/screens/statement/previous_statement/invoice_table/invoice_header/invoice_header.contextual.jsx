import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import InvoiceHeader from './invoice_header';

import { getStatementById } from '../../../../../store/actions';

const mapStateToProps = (state) => {
  return {
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders.filter(
      (po) => po.isDeleted === false && !po.isQuote && po.farmData.length > 0,
    ),
    purchaseOrderStatements: state.purchaseOrderStatementReducer.purchaseOrderStatements,
    currentStatement: state.statementReducer.current,
    statements: state.statementReducer.statements,
    organizationId: state.userReducer.organizationId,
    organization: state.organizationReducer,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getStatementById,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(InvoiceHeader);
