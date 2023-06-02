import { getLastUpdatedDate } from '../../utilities';
import { LoadingStatus, PERSIST_REHYDRATE, LIST_BACKUP_CUSTOMER } from '../../store/constants';

const initialState = {
  backupCustomers: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
};

let backupCustomerReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        backupCustomers: action.payload.backupCustomerReducer
          ? action.payload.backupCustomerReducer.backupCustomers
          : state.backupCustomers,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_BACKUP_CUSTOMER.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_BACKUP_CUSTOMER.COMMIT:
      return {
        ...state,
        backupCustomers: action.payload,
        imported: false,
        loadingStatus: LoadingStatus.Loaded,
        lastUpdate: getLastUpdatedDate(action.payload),
      };
    case LIST_BACKUP_CUSTOMER.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    default:
      return state;
  }
};

export default backupCustomerReducer;
