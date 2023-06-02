import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_DELAY_PRODUCTS,
  CREATE_DELAY_PRODUCT_SUCCESS,
  DELETE_DELAY_PRODUCT_SUCCESS,
  UPDATE_DELAY_PRODUCT_SUCCESS,
  GET_DELAY_PRODUCT_SUCCESS,
} from '../constants';

const initialState = {
  current: null,
  currentloadingStatus: LoadingStatus.Unloaded,
  delayProducts: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let delayProductReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        delayProducts: action.payload.delayProductReducer
          ? action.payload.delayProductReducer.delayProducts
          : state.delayProducts,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_DELAY_PRODUCTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_DELAY_PRODUCTS.COMMIT:
      return {
        ...state,
        delayProducts: action.payload.items,
        loadingStatus: LoadingStatus.Loaded,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_DELAY_PRODUCTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case GET_DELAY_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        current: action.payload,
        currentLoadingStatus: LoadingStatus.Loaded,
      });
    case CREATE_DELAY_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        delayProducts: [...state.delayProducts, action.payload],
      });
    case UPDATE_DELAY_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        delayProduct: state.delayProducts.map((d) => (d.id === action.payload.id ? action.payload : d)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_DELAY_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        delayProduct: state.delayProducts.filter((dd) => dd.id !== action.payload),
      });
    default:
      return state;
  }
};

export default delayProductReducer;
