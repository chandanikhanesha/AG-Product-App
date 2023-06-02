import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_SEED_SIZES,
  CREATE_SEED_SIZE_SUCCESS,
  DELETE_SEED_SIZE_SUCCESS,
  UPDATE_SEED_SIZE_SUCCESS,
} from '../../store/constants';
import { getLastUpdatedDate } from '../../utilities';

const initialState = {
  seedSizes: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let seedSizeReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_SEED_SIZES.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_SEED_SIZES.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        seedSizes: action.payload,
        lastUpdate: getLastUpdatedDate(action.payload),
      };
    case LIST_SEED_SIZES.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_SEED_SIZE_SUCCESS:
      return Object.assign({}, state, { seedSizes: [...state.seedSizes, action.payload] });
    case UPDATE_SEED_SIZE_SUCCESS:
      return Object.assign({}, state, {
        seedSizes: state.seedSizes.map((p) => (p.id === action.payload.id ? action.payload : p)),
      });
    case DELETE_SEED_SIZE_SUCCESS:
      return Object.assign({}, state, {
        seedSizes: state.seedSizes.filter((seedSize) => seedSize.id !== action.payload),
        lastUpdate: action.payload.updatedAt,
      });
    default:
      return state;
  }
};

export default seedSizeReducer;
