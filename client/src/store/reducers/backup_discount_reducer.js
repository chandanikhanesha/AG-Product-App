import { LoadingStatus, PERSIST_REHYDRATE, LIST_BACKUP_DEALER_DISCOUNTS } from '../constants';

const initialState = {
  backupDealerDiscounts: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let backupDiscountReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        backupDealerDiscounts: action.payload.backupDiscountReducer
          ? action.payload.backupDiscountReducer.backupDealerDiscounts
          : state.backupDealerDiscounts,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_BACKUP_DEALER_DISCOUNTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_BACKUP_DEALER_DISCOUNTS.COMMIT:
      return {
        ...state,
        backupDealerDiscounts: action.payload,
        loadingStatus: LoadingStatus.Loaded,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_BACKUP_DEALER_DISCOUNTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    default:
      return state;
  }
};

export default backupDiscountReducer;
