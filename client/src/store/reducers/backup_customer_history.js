import { getLastUpdatedDate } from '../../utilities';
import { LoadingStatus, PERSIST_REHYDRATE, LIST_BACKUP_CUSTOMER_HISTORY } from '../../store/constants';

const initialState = {
  backupCustomersHistory: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
};

let backupCustomerHistoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        backupCustomersHistory: action.payload.backupCustomerHistoryReducer
          ? action.payload.backupCustomerHistoryReducer.backupCustomersHistory
          : state.backupCustomersHistory,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_BACKUP_CUSTOMER_HISTORY.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_BACKUP_CUSTOMER_HISTORY.COMMIT:
      return {
        ...state,
        backupCustomersHistory: action.payload,
        imported: false,
        loadingStatus: LoadingStatus.Loaded,
        lastUpdate: getLastUpdatedDate(action.payload),
      };
    case LIST_BACKUP_CUSTOMER_HISTORY.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    default:
      return state;
  }
};

export default backupCustomerHistoryReducer;
