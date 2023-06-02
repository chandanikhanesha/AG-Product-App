import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import CreateStatement from './create_statement';

import { createStatement, updateStatement, createPurchaseOrderStatement } from '../../../../../store/actions';

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers.sort((a, b) => a.name.localeCompare(b.name)),
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders
      .filter((po) => po.isDeleted === false && !po.isQuote && po.farmData.length > 0)
      .sort((a, b) => {
        return a.id - b.id;
      }),
    organizationId: state.userReducer.organizationId,
    customerProducts: state.customerProductReducer.customerProducts,
    customerCustomProducts: state.customerCustomProductReducer.customerCustomProducts,
    statements: state.statementReducer.statements.sort((a, b) => a.id - b.id),
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createNewStatement: createStatement,
      updateStatement,
      createPurchaseOrderStatement,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(CreateStatement);
