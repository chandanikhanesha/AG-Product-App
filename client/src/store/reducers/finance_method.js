import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_FINANCE_METHODS,
  CREATE_FINANCE_METHOD_SUCCESS,
  DELETE_FINANCE_METHOD_SUCCESS,
  UPDATE_FINANCE_METHOD_SUCCESS,
  GET_FINANCE_METHOD_SUCCESS,
} from '../constants';

const initialState = {
  current: null,
  currentloadingStatus: LoadingStatus.Unloaded,
  financeMethods: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let financeMethodReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        financeMethods: action.payload.financeMethodReducer
          ? action.payload.financeMethodReducer.financeMethods
          : state.financeMethods,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_FINANCE_METHODS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_FINANCE_METHODS.COMMIT:
      return {
        ...state,
        financeMethods: action.payload.items,
        loadingStatus: LoadingStatus.Loaded,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_FINANCE_METHODS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case GET_FINANCE_METHOD_SUCCESS:
      return Object.assign({}, state, {
        current: action.payload,
        currentLoadingStatus: LoadingStatus.Loaded,
      });
    case CREATE_FINANCE_METHOD_SUCCESS:
      return Object.assign({}, state, {
        financeMethods: [...state.financeMethods, action.payload],
      });
    case UPDATE_FINANCE_METHOD_SUCCESS:
      return Object.assign({}, state, {
        financeMethod: state.financeMethods.map((d) => (d.id === action.payload.id ? action.payload : d)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_FINANCE_METHOD_SUCCESS:
      return Object.assign({}, state, {
        financeMethod: state.financeMethods.filter((dd) => dd.id !== action.payload),
      });
    default:
      return state;
  }
};

export default financeMethodReducer;
