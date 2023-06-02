import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_CUSTOM_PRODUCTS,
  CREATE_CUSTOM_PRODUCT_SUCCESS,
  DELETE_CUSTOM_PRODUCT_SUCCESS,
  UPDATE_CUSTOM_PRODUCT_SUCCESS,
  DELETE_COMPANY_SUCCESS,
} from '../constants';

const initialState = {
  products: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let productReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_CUSTOM_PRODUCTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_CUSTOM_PRODUCTS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        products: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_CUSTOM_PRODUCTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_CUSTOM_PRODUCT_SUCCESS:
      return Object.assign({}, state, { products: [...state.products, action.payload] });
    case DELETE_CUSTOM_PRODUCT_SUCCESS:
      return Object.assign({}, state, { products: state.products.filter((p) => p.id !== action.payload.id) });
    case UPDATE_CUSTOM_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_COMPANY_SUCCESS:
      return Object.assign({}, state, {
        products: state.products.filter((p) => p.companyId !== action.payload.id),
      });
    default:
      return state;
  }
};

export default productReducer;
