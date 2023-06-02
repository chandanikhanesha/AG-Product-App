import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_FARMS,
  CREATE_FARM_SUCCESS,
  DELETE_FARM_SUCCESS,
  UPDATE_FARM_SUCCESS,
} from '../../store/constants';
import { getLastUpdatedDate } from '../../utilities';

const initialState = {
  farms: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
};

const farmReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case LIST_FARMS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_FARMS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        farms: action.payload,
        lastUpdate: getLastUpdatedDate(action.payload),
      };
    case LIST_FARMS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case CREATE_FARM_SUCCESS:
      return Object.assign({}, state, { farms: [...state.farms, action.payload] });
    case DELETE_FARM_SUCCESS:
      return Object.assign({}, state, {
        farms: state.farms.filter((farm) => farm.id !== action.payload),
      });
    case UPDATE_FARM_SUCCESS:
      return Object.assign({}, state, {
        farms: state.farms.map((f) => (f.id === action.payload.id ? action.payload : f)),
        lastUpdate: action.payload.updatedAt,
      });
    default:
      return state;
  }
};

export default farmReducer;
