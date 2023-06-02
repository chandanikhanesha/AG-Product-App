import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_REPORTS,
  CREATE_REPORT_SUCCESS,
  DELETE_REPORT_SUCCESS,
  UPDATE_REPORT_SUCCESS,
} from '../constants';
import { getLastUpdatedDate } from '../../utilities';

const initialState = {
  reports: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let reportReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_REPORTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };

    case LIST_REPORTS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        reports: action.payload,
        lastUpdate: getLastUpdatedDate(action.payload),
      };

    case LIST_REPORTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_REPORT_SUCCESS:
      return Object.assign({}, state, { reports: [...state.reports, action.payload] });

    case DELETE_REPORT_SUCCESS:
      return Object.assign({}, state, {
        reports: state.reports.filter((report) => report.DiscountPackageId !== action.payload),
      });

    case UPDATE_REPORT_SUCCESS:
      return {
        ...state,
        reports: state.reports.map((report) => (report.id === action.payload.id ? action.payload : report)),
        lastUpdate: action.payload.updatedAt,
      };

    default:
      return state;
  }
};

export default reportReducer;
