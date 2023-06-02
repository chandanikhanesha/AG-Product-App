import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_API_SEED_COMPANIES,
  CREATE_API_SEED_COMPANY_SUCCESS,
  UPDATE_API_SEED_COMPANY_SUCCESS,
  DELETE_API_SEED_COMPANY_SUCCESS,
  API_SEED_COMPANY_DEFAULT_TABS,
} from '../../store/constants';

const initialState = {
  apiSeedCompanies: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  default_tabs: {},
  dynamic_crop_codes: [],
};

let apiSeedCompanyReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_API_SEED_COMPANIES.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_API_SEED_COMPANIES.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        apiSeedCompanies: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_API_SEED_COMPANIES.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_API_SEED_COMPANY_SUCCESS:
      return Object.assign({}, state, {
        apiSeedCompanies: [...state.apiSeedCompanies, action.payload],
      });
    case UPDATE_API_SEED_COMPANY_SUCCESS:
      return Object.assign({}, state, {
        apiSeedCompanies: state.apiSeedCompanies.map((c) => (c.id === action.payload.id ? action.payload : c)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_API_SEED_COMPANY_SUCCESS:
      return Object.assign({}, state, {
        apiSeedCompanies: state.apiSeedCompanies.filter((sc) => sc.id !== action.payload.id),
        lastUpdate: action.payload.updatedAt,
      });
    default:
      return state;
  }
};

export default apiSeedCompanyReducer;
