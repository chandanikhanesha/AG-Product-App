import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_DISCOUNT_PACKAGES,
  CREATE_DISCOUNT_PACKAGE_SUCCESS,
  UPDATE_DISCOUNT_PACKAGE_SUCCESS,
  DELETE_DISCOUNT_PACKAGE_SUCCESS,
} from '../constants';
import { getLastUpdatedDate } from '../../utilities';

const initialState = {
  discountPackages: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let discountPackageReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_DISCOUNT_PACKAGES.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_DISCOUNT_PACKAGES.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        discountPackages: action.payload,
        lastUpdate: getLastUpdatedDate(action.payload),
      };
    case LIST_DISCOUNT_PACKAGES.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_DISCOUNT_PACKAGE_SUCCESS:
      return Object.assign({}, state, {
        discountPackages: [...state.discountPackages, action.payload],
      });
    case UPDATE_DISCOUNT_PACKAGE_SUCCESS:
      return Object.assign({}, state, {
        discountPackages: state.discountPackages.map((dp) => (dp.id === action.payload.id ? action.payload : dp)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_DISCOUNT_PACKAGE_SUCCESS:
      return Object.assign({}, state, {
        discountPackages: state.discountPackages.filter((discountPackage) => discountPackage.id !== action.payload),
      });
    default:
      return state;
  }
};

export default discountPackageReducer;
