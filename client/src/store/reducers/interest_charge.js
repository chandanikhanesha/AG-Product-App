import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_INTEREST_CHARGES,
  CREATE_INTEREST_CHARGE_SUCCESS,
  DELETE_INTEREST_CHARGE_SUCCESS,
  UPDATE_INTEREST_CHARGE_SUCCESS,
  DELETE_SEED_COMPANY_SUCCESS,
} from '../constants';

const initialState = {
  interestCharges: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let interestChargeReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        interestCharges: action.payload.interestChargeReducer
          ? action.payload.interestChargeReducer.interestCharges
          : state.interestCharges,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_INTEREST_CHARGES.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_INTEREST_CHARGES.COMMIT:
      return {
        ...state,
        interestCharges: action.payload.items,
        loadingStatus: LoadingStatus.Loaded,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_INTEREST_CHARGES.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_INTEREST_CHARGE_SUCCESS:
      return Object.assign({}, state, { interestCharges: [...state.interestCharges, action.payload] });
    case UPDATE_INTEREST_CHARGE_SUCCESS:
      return Object.assign({}, state, {
        interestCharge: state.interestCharges.map((d) => (d.id === action.payload.id ? action.payload : d)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_INTEREST_CHARGE_SUCCESS:
      return Object.assign({}, state, {
        interestCharge: state.interestCharges.filter((dd) => dd.id !== action.payload),
      });
    case DELETE_SEED_COMPANY_SUCCESS:
      return Object.assign({}, state, {
        interestCharge: state.interestCharges.filter((dd) => dd.seedCompanyId !== action.payload.id),
      });
    default:
      return state;
  }
};

export default interestChargeReducer;
