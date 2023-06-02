import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_PAYMENTS,
  CREATE_PAYMENT_SUCCESS,
  DELETE_PAYMENT_SUCCESS,
  UPDATE_PAYMENT_SUCCESS,
  DELETE_PURCHASE_ORDER_SUCCESS,
} from '../constants';

const initialState = {
  payments: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
};

const paymentReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case LIST_PAYMENTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_PAYMENTS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        payments: payload.items,
        lastUpdate: payload.lastUpdate,
      };
    case LIST_PAYMENTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case CREATE_PAYMENT_SUCCESS:
      return Object.assign({}, state, { payments: [...state.payments, payload] });
    case DELETE_PAYMENT_SUCCESS:
      return Object.assign({}, state, {
        payments: state.payments.filter((payment) => payment.id !== payload),
      });
    case UPDATE_PAYMENT_SUCCESS:
      return Object.assign({}, state, {
        payments: state.payments.map((payment) => (payment.id === payload.id ? payload : payment)),
        lastUpdate: payload.updatedAt,
      });
    case DELETE_PURCHASE_ORDER_SUCCESS:
      return Object.assign({}, state, {
        payments: state.payments.filter((payment) => payment.purchaseOrderId !== payload),
      });
    default:
      return state;
  }
};

export default paymentReducer;
