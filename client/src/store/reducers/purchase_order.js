import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_PURCHASE_ORDERS,
  CREATE_PURCHASE_ORDER_SUCCESS,
  UPDATE_PURCHASE_ORDER_SUCCESS,
  DELETE_PURCHASE_ORDER_SUCCESS,
  GET_PURCHASE_ORDER_SUCCESS,
  GET_PURCHASE_ORDER_ERROR,
} from '../../store/constants';

const initialState = {
  purchaseOrders: [],
  loadingStatus: LoadingStatus.Unloaded,
  current: null,
  currentLoadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
  noFound: false,
};

let purchaseOrderReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        // ...state,
        purchaseOrders: action.payload.purchaseOrderReducer
          ? action.payload.purchaseOrderReducer.purchaseOrders
          : state.purchaseOrders,
        loadingStatus: LoadingStatus.Unloaded,
        currentLoadingStatus: LoadingStatus.Unloaded,
        noFound: false,
      };

    case LIST_PURCHASE_ORDERS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_PURCHASE_ORDERS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        purchaseOrders: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_PURCHASE_ORDERS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case GET_PURCHASE_ORDER_SUCCESS:
      return Object.assign({}, state, {
        current: action.payload,
        currentLoadingStatus: LoadingStatus.Loaded,
      });
    case GET_PURCHASE_ORDER_ERROR:
      return Object.assign({}, state, {
        currentLoadingStatus: LoadingStatus.Loaded,
        noFound: true,
      });
    case CREATE_PURCHASE_ORDER_SUCCESS:
      return Object.assign({}, state, {
        purchaseOrders: [...state.purchaseOrders, action.payload],
      });
    case UPDATE_PURCHASE_ORDER_SUCCESS:
      return Object.assign({}, state, {
        purchaseOrders: state.purchaseOrders.map((po) => (po.id === action.payload.id ? action.payload : po)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_PURCHASE_ORDER_SUCCESS:
      return Object.assign({}, state, {
        purchaseOrders: state.purchaseOrders.filter((po) => po.id !== action.payload),
      });
    default:
      return state;
  }
};

export default purchaseOrderReducer;
