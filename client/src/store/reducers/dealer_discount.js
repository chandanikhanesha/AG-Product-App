import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_DEALER_DISCOUNTS,
  CREATE_DEALER_DISCOUNT_SUCCESS,
  DELETE_DEALER_DISCOUNT_SUCCESS,
  UPDATE_DEALER_DISCOUNT_SUCCESS,
  DELETE_SEED_COMPANY_SUCCESS,
} from '../constants';

const initialState = {
  dealerDiscounts: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let dealerDiscountReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        dealerDiscounts: action.payload.dealerDiscountReducer
          ? action.payload.dealerDiscountReducer.dealerDiscounts
          : state.dealerDiscounts,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_DEALER_DISCOUNTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_DEALER_DISCOUNTS.COMMIT:
      return {
        ...state,
        dealerDiscounts: action.payload.items,
        loadingStatus: LoadingStatus.Loaded,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_DEALER_DISCOUNTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_DEALER_DISCOUNT_SUCCESS:
      return Object.assign({}, state, { dealerDiscounts: [...state.dealerDiscounts, action.payload] });
    case UPDATE_DEALER_DISCOUNT_SUCCESS:
      return Object.assign({}, state, {
        dealerDiscounts: state.dealerDiscounts.map((d) => (d.id === action.payload.id ? action.payload : d)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_DEALER_DISCOUNT_SUCCESS:
      return Object.assign({}, state, {
        dealerDiscounts: state.dealerDiscounts.filter((dd) => dd.id !== action.payload),
      });
    case DELETE_SEED_COMPANY_SUCCESS:
      return Object.assign({}, state, {
        dealerDiscounts: state.dealerDiscounts.filter((dd) => dd.seedCompanyId !== action.payload.id),
      });
    default:
      return state;
  }
};

export default dealerDiscountReducer;
