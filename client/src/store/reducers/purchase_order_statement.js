import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_PURCHASE_ORDER_STATEMENTS,
  CREATE_PURCHASE_ORDER_STATEMENT_SUCCESS,
  DELETE_PURCHASE_ORDER_STATEMENT_SUCCESS,
  UPDATE_PURCHASE_ORDER_STATEMENT_SUCCESS,
} from '../constants';

const initialState = {
  purchaseOrderStatements: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let purchaseOrderStatementReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        purchaseOrderStatements: action.payload.statementReducer
          ? action.payload.statementReducer.purchaseOrderStatements
          : state.purchaseOrderStatements,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_PURCHASE_ORDER_STATEMENTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_PURCHASE_ORDER_STATEMENTS.COMMIT:
      return {
        ...state,
        purchaseOrderStatements: action.payload.items,
        loadingStatus: LoadingStatus.Loaded,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_PURCHASE_ORDER_STATEMENTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case CREATE_PURCHASE_ORDER_STATEMENT_SUCCESS:
      return Object.assign({}, state, {
        purchaseOrderStatements: [...state.purchaseOrderStatements, action.payload],
      });
    case UPDATE_PURCHASE_ORDER_STATEMENT_SUCCESS:
      return Object.assign({}, state, {
        purchaseOrderStatement: state.purchaseOrderStatements.map((d) =>
          d.id === action.payload.id ? action.payload : d,
        ),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_PURCHASE_ORDER_STATEMENT_SUCCESS:
      return Object.assign({}, state, {
        purchaseOrderStatement: state.purchaseOrderStatements.filter((dd) => dd.id !== action.payload),
      });
    default:
      return state;
  }
};

export default purchaseOrderStatementReducer;
