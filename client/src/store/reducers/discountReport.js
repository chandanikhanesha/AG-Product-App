import { LoadingStatus, PERSIST_REHYDRATE, LIST_DISCOUNT_REPORTS, DOWANLOAD_DISCOUNT_REPORT } from '../constants';

const initialState = {
  discountReports: [],
  loadingStatus: LoadingStatus.Unloaded,
  dowanloadReport: [],
};

const discountReportReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_DISCOUNT_REPORTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_DISCOUNT_REPORTS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        discountReports: action.payload,
      };
    case LIST_DISCOUNT_REPORTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    //report

    case DOWANLOAD_DISCOUNT_REPORT:
      return {
        ...state,
        dowanloadReport: action.payload,
      };

    default:
      return state;
  }
};

export default discountReportReducer;
