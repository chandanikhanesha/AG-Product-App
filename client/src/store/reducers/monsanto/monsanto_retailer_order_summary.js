import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_MONSANTO_RETAILER_SUMMARY,
  UPDATE_ROS_CURRENT_SEED_COMPANY_ID,
  UPDATE_ROS_CURRENT_CROP_TYPE,
  UPDATE_MONSANTO_RETAILER_SUMMARY_FILTERS,
} from '../../../store/constants';

const initialState = {
  seedCompanyId: null,
  cropType: null,
  products: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
};

let monsantoRetailerOrderSummaryReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case UPDATE_ROS_CURRENT_SEED_COMPANY_ID:
      return {
        ...state,
        seedCompanyId: action.payload,
      };

    case UPDATE_ROS_CURRENT_CROP_TYPE:
      return {
        ...state,
        cropType: action.payload,
      };

    case UPDATE_MONSANTO_RETAILER_SUMMARY_FILTERS:
      return {
        ...state,
        ...action.payload,
      };
    case LIST_MONSANTO_RETAILER_SUMMARY.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_MONSANTO_RETAILER_SUMMARY.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        products: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_MONSANTO_RETAILER_SUMMARY.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    default:
      return state;
  }
};

export default monsantoRetailerOrderSummaryReducer;
