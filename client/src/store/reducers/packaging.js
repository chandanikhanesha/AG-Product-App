import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_PACKAGINGS,
  CREATE_PACKAGING_SUCCESS,
  DELETE_PACKAGING_SUCCESS,
  UPDATE_PACKAGING_SUCCESS,
  DELETE_SEED_COMPANY_SUCCESS,
} from '../../store/constants';

const initialState = {
  packagings: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let packagingReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_PACKAGINGS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_PACKAGINGS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        packagings: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_PACKAGINGS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_PACKAGING_SUCCESS:
      return Object.assign({}, state, { packagings: [...state.packagings, action.payload] });
    case UPDATE_PACKAGING_SUCCESS:
      return Object.assign({}, state, {
        packagings: state.packagings.map((p) => (p.id === action.payload.id ? action.payload : p)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_PACKAGING_SUCCESS:
      return Object.assign({}, state, {
        packagings: state.packagings.filter((packaging) => packaging.id !== action.payload),
      });
    case DELETE_SEED_COMPANY_SUCCESS:
      return Object.assign({}, state, {
        packagings: state.packagings.filter((p) => p.seedCompanyId !== action.payload.id),
      });
    default:
      return state;
  }
};

export default packagingReducer;
