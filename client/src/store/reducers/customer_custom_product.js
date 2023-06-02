import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_CUSTOMER_CUSTOM_PRODUCTS,
  CREATE_CUSTOMER_CUSTOM_PRODUCT_SUCCESS,
  DELETE_CUSTOMER_CUSTOM_PRODUCT_SUCCESS,
  UPDATE_CUSTOMER_CUSTOM_PRODUCT_SUCCESS,
  DELETE_PURCHASE_ORDER_SUCCESS,
} from '../constants';

const initialState = {
  customerCustomProducts: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let customerProductReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_CUSTOMER_CUSTOM_PRODUCTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_CUSTOMER_CUSTOM_PRODUCTS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        customerCustomProducts: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_CUSTOMER_CUSTOM_PRODUCTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_CUSTOMER_CUSTOM_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        customerCustomProducts: [...state.customerCustomProducts, action.payload],
      });
    case DELETE_CUSTOMER_CUSTOM_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        customerCustomProducts: state.customerCustomProducts.filter((cp) => cp.id !== action.payload),
      });
    case UPDATE_CUSTOMER_CUSTOM_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        customerCustomProducts: state.customerCustomProducts.map((cp) =>
          cp.id === action.payload.id ? action.payload : cp,
        ),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_PURCHASE_ORDER_SUCCESS:
      return Object.assign({}, state, {
        customerCustomProducts: state.customerCustomProducts.filter((ccp) => ccp.purchaseOrderId !== action.payload),
      });
    default:
      return state;
  }
};

export default customerProductReducer;
