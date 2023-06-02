import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_SEED_COMPANIES,
  CREATE_SEED_COMPANY_SUCCESS,
  UPDATE_SEED_COMPANY_SUCCESS,
  DELETE_SEED_COMPANY_SUCCESS,
} from '../../store/constants';

const initialState = {
  seedCompanies: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let seedCompanyReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_SEED_COMPANIES.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_SEED_COMPANIES.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        seedCompanies: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_SEED_COMPANIES.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_SEED_COMPANY_SUCCESS:
      return Object.assign({}, state, {
        seedCompanies: [...state.seedCompanies, action.payload],
      });
    case UPDATE_SEED_COMPANY_SUCCESS:
      return Object.assign({}, state, {
        seedCompanies: state.seedCompanies.map((c) => (c.id === action.payload.id ? action.payload : c)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_SEED_COMPANY_SUCCESS:
      return Object.assign({}, state, {
        seedCompanies: state.seedCompanies.filter((sc) => sc.id !== action.payload.id),
        lastUpdate: action.payload.updatedAt,
      });
    default:
      return state;
  }
};

export default seedCompanyReducer;
