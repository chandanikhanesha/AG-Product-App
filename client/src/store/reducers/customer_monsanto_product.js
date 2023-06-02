import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_CUSTOMER_MONSANTO_PRODUCTS,
  CREATE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS,
  DELETE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS,
  UPDATE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS,
  DELETE_PURCHASE_ORDER_SUCCESS,
  REMOVE_RECENT_CREATED_CUSTOMER_MONSANTO_PRODUCT,
} from '../../store/constants';

const initialState = {
  customerMonsantoProducts: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  recentCreatedCustomerProductId: null,
  organizationId: localStorage.getItem('organizationId'),
};

let customerMonsantoProductReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        customerMonsantoProducts: action.payload.customerMonsantoProductReducer
          ? action.payload.customerMonsantoProductReducer.customerMonsantoProducts
          : state.customerMonsantoProducts,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_CUSTOMER_MONSANTO_PRODUCTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_CUSTOMER_MONSANTO_PRODUCTS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        customerMonsantoProducts: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_CUSTOMER_MONSANTO_PRODUCTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        customerMonsantoProducts: [...state.customerMonsantoProducts, action.payload],
        recentCreatedCustomerProductId: action.payload.id,
      });
    case UPDATE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        customerMonsantoProducts: state.customerMonsantoProducts.map((cp) =>
          cp.id === action.payload.id ? action.payload : cp,
        ),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        customerMonsantoProducts: state.customerMonsantoProducts.filter(
          (customerProduct) => customerProduct.id !== action.payload,
        ),
      });
    case DELETE_PURCHASE_ORDER_SUCCESS:
      return Object.assign({}, state, {
        customerMonsantoProducts: state.customerMonsantoProducts.filter((cp) => cp.purchaseOrderId !== action.payload),
      });

    case REMOVE_RECENT_CREATED_CUSTOMER_MONSANTO_PRODUCT:
      return {
        ...state,
        recentCreatedCustomerProductId: null,
      };

    default:
      return state;
  }
};

export default customerMonsantoProductReducer;
