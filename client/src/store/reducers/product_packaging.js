import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_PRODUCT_PACKAGINGS,
  CREATE_PRODUCT_PACKAGING_SUCCESS,
  DELETE_PRODUCT_PACKAGING_SUCCESS,
  UPDATE_PRODUCT_PACKAGING_SUCCESS,
  DELETE_PURCHASE_ORDER_SUCCESS,
} from '../../store/constants';

const initialState = {
  productPackagings: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let productPackagingReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_PRODUCT_PACKAGINGS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_PRODUCT_PACKAGINGS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        productPackagings: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_PRODUCT_PACKAGINGS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_PRODUCT_PACKAGING_SUCCESS:
      return Object.assign({}, state, { productPackagings: [...state.productPackagings, action.payload] });
    case UPDATE_PRODUCT_PACKAGING_SUCCESS:
      return Object.assign({}, state, {
        productPackagings: state.productPackagings.map((p) => (p.id === action.payload.id ? action.payload : p)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_PRODUCT_PACKAGING_SUCCESS:
      return Object.assign({}, state, {
        productPackagings: state.productPackagings.filter((productPackaging) => productPackaging.id !== action.payload),
      });
    case DELETE_PURCHASE_ORDER_SUCCESS:
      return Object.assign({}, state, {
        productPackagings: state.productPackagings.filter((pp) => pp.purchaseOrderId !== action.payload),
      });
    default:
      return state;
  }
};

export default productPackagingReducer;
