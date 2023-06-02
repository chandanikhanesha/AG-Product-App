import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_STATEMENTS,
  CREATE_STATEMENT_SUCCESS,
  DELETE_STATEMENT_SUCCESS,
  UPDATE_STATEMENT_SUCCESS,
  GET_STATEMENT_SUCCESS,
} from '../constants';

const initialState = {
  current: null,
  currentloadingStatus: LoadingStatus.Unloaded,
  statements: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let statementReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        statements: action.payload.statementReducer ? action.payload.statementReducer.statements : state.statements,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_STATEMENTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_STATEMENTS.COMMIT:
      return {
        ...state,
        statements: action.payload.items,
        loadingStatus: LoadingStatus.Loaded,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_STATEMENTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case GET_STATEMENT_SUCCESS:
      return Object.assign({}, state, {
        current: action.payload,
        currentLoadingStatus: LoadingStatus.Loaded,
      });
    case CREATE_STATEMENT_SUCCESS:
      return Object.assign({}, state, {
        statements: [...state.statements, action.payload],
      });
    case UPDATE_STATEMENT_SUCCESS:
      return Object.assign({}, state, {
        statement: state.statements.map((d) => (d.id === action.payload.id ? action.payload : d)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_STATEMENT_SUCCESS:
      return Object.assign({}, state, {
        statement: state.statements.filter((dd) => dd.id !== action.payload),
      });
    default:
      return state;
  }
};

export default statementReducer;
