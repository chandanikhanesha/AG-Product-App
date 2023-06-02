import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_CUSTOMER_PRODUCTS,
  CREATE_CUSTOMER_PRODUCT_SUCCESS,
  DELETE_CUSTOMER_PRODUCT_SUCCESS,
  UPDATE_CUSTOMER_PRODUCT_SUCCESS,
  DELETE_PURCHASE_ORDER_SUCCESS,
  REMOVE_RECENT_CREATED_CUSTOMER_PRODUCT,
} from '../../store/constants';

const initialState = {
  customerProducts: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  recentCreatedCustomerProductId: null,
  organizationId: localStorage.getItem('organizationId'),
};

let customerProductReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        customerProducts: action.payload.customerProductReducer
          ? action.payload.customerProductReducer.customerProducts
          : state.customerProducts,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_CUSTOMER_PRODUCTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_CUSTOMER_PRODUCTS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        customerProducts: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_CUSTOMER_PRODUCTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_CUSTOMER_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        customerProducts: [...state.customerProducts, action.payload],
        recentCreatedCustomerProductId: action.payload.id,
      });
    case UPDATE_CUSTOMER_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        customerProducts: state.customerProducts.map((cp) => (cp.id === action.payload.id ? action.payload : cp)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_CUSTOMER_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        customerProducts: state.customerProducts.filter((customerProduct) => customerProduct.id !== action.payload),
      });
    case DELETE_PURCHASE_ORDER_SUCCESS:
      return Object.assign({}, state, {
        customerProducts: state.customerProducts.filter((cp) => cp.purchaseOrderId !== action.payload),
      });

    case REMOVE_RECENT_CREATED_CUSTOMER_PRODUCT:
      return {
        ...state,
        recentCreatedCustomerProductId: null,
      };

    default:
      return state;
  }
};

export default customerProductReducer;
