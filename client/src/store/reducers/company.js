import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_COMPANIES,
  CREATE_COMPANY_SUCCESS,
  UPDATE_COMPANY_SUCCESS,
  DELETE_COMPANY_SUCCESS,
} from '../../store/constants';

const initialState = {
  companies: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let companyReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_COMPANIES.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_COMPANIES.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        companies: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_COMPANIES.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_COMPANY_SUCCESS:
      return Object.assign({}, state, { companies: [...state.companies, action.payload] });
    case UPDATE_COMPANY_SUCCESS:
      return Object.assign({}, state, {
        companies: state.companies.map((c) => (c.id === action.payload.id ? action.payload : c)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_COMPANY_SUCCESS:
      return Object.assign({}, state, {
        companies: state.companies.filter((sc) => sc.id !== action.payload.id),
        lastUpdate: action.payload.lastUpdate,
      });
    default:
      return state;
  }
};

export default companyReducer;
