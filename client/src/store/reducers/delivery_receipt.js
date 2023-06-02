import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_DELIVERY_RECEIPT,
  CREATE_DELIVERY_RECEIPT_SUCCESS,
  DELETE_PURCHASE_ORDER_SUCCESS,
  UPDATE_DELIVERY_RECEIPT_SUCCESS,
  DELETE_DELIVERY_RECEIPT_SUCCESS,
} from '../../store/constants';

const initialState = {
  deliveryReceipts: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let deliveryReceiptReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_DELIVERY_RECEIPT.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_DELIVERY_RECEIPT.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        deliveryReceipts: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_DELIVERY_RECEIPT.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case UPDATE_DELIVERY_RECEIPT_SUCCESS:
      return Object.assign({}, state, {
        deliveryReceipts: state.deliveryReceipts.map((d) => (d.id === action.payload.id ? action.payload : d)),
        lastUpdate: action.payload.updatedAt,
      });
    case CREATE_DELIVERY_RECEIPT_SUCCESS:
      return Object.assign({}, state, {
        deliveryReceipts: action.payload.id ? [...state.deliveryReceipts, action.payload] : [...state.deliveryReceipts],
      });
    case DELETE_DELIVERY_RECEIPT_SUCCESS:
      return Object.assign({}, state, {
        deliveryReceipts: state.deliveryReceipts.filter((dr) => dr.id !== action.payload),
      });
    case DELETE_PURCHASE_ORDER_SUCCESS:
      return Object.assign({}, state, {
        deliveryReceipts: state.deliveryReceipts.filter((dr) => dr.purchaseOrderId !== action.payload),
      });
    default:
      return state;
  }
};

export default deliveryReceiptReducer;
