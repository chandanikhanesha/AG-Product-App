import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_PRODUCT_DEALERS,
  CREATE_PRODUCT_DEALER_SUCCESS,
  DELETE_PRODUCT_DEALER_SUCCESS,
  UPDATE_PRODUCT_DEALER_SUCCESS,
} from '../../store/constants';
import { getLastUpdatedDate } from '../../utilities';

const initialState = {
  productDealers: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let productDealerReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_PRODUCT_DEALERS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_PRODUCT_DEALERS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        productDealers: action.payload,
        lastUpdate: getLastUpdatedDate(action.payload),
      };
    case LIST_PRODUCT_DEALERS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_PRODUCT_DEALER_SUCCESS:
      return Object.assign({}, state, { productDealers: [...state.productDealers, action.payload] });
    case UPDATE_PRODUCT_DEALER_SUCCESS:
      return Object.assign({}, state, {
        productDealers: state.productDealers.map((p) => (p.id === action.payload.id ? action.payload : p)),
      });
    case DELETE_PRODUCT_DEALER_SUCCESS:
      return Object.assign({}, state, {
        productDealers: state.productDealers.filter((productDealer) => productDealer.id !== action.payload),
        lastUpdate: action.payload.updatedAt,
      });
    default:
      return state;
  }
};

export default productDealerReducer;
