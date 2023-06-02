import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_CUSTOMER_RETURN_PRODUCTS,
  CREATE_CUSTOMER_RETURN_PRODUCT_SUCCESS,
  DELETE_CUSTOMER_RETURN_PRODUCT_SUCCESS,
  UPDATE_CUSTOMER_RETURN_PRODUCT_SUCCESS,
} from '../constants';

const initialState = {
  customerReturnProducts: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  recentCreatedCustomerProductId: null,
  organizationId: localStorage.getItem('organizationId'),
};

let customerReturnProductReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        customerReturnProducts: action.payload.customerReturnProductReducer
          ? action.payload.customerReturnProductReducer.customerReturnProducts
          : state.customerReturnProducts,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_CUSTOMER_RETURN_PRODUCTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_CUSTOMER_RETURN_PRODUCTS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        customerReturnProducts: action.payload,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_CUSTOMER_RETURN_PRODUCTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_CUSTOMER_RETURN_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        customerReturnProducts: [...state.customerReturnProducts, action.payload],
        recentCreatedCustomerProductId: action.payload.id,
      });
    case UPDATE_CUSTOMER_RETURN_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        customerReturnProducts: state.customerReturnProducts.map((cp) =>
          cp.id === action.payload.id ? action.payload : cp,
        ),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_CUSTOMER_RETURN_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        customerReturnProducts: state.customerReturnProducts.filter(
          (customerProduct) => customerProduct.id !== action.payload,
        ),
      });
    // case DELETE_PURCHASE_ORDER_SUCCESS:
    //   return Object.assign({}, state, {
    //     customerReturnProducts: state.customerReturnProducts.filter((cp) => cp.purchaseOrderId !== action.payload),
    //   });

    // case REMOVE_RECENT_CREATED_CUSTOMER_MONSANTO_PRODUCT:
    //   return {
    //     ...state,
    //     recentCreatedCustomerProductId: null,
    //   };

    default:
      return state;
  }
};

export default customerReturnProductReducer;
