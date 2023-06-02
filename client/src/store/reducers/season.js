import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_SEASONS,
  CREATE_SEASON_SUCCESS,
  DELETE_SEASON_SUCCESS,
  UPDATE_SEASON_SUCCESS,
} from '../../store/constants';

const initialState = {
  seasons: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
};

let seasonReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case LIST_SEASONS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_SEASONS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        seasons: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_SEASONS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case CREATE_SEASON_SUCCESS:
      return Object.assign({}, state, {
        seasons: [...state.seasons, action.payload],
      });
    case UPDATE_SEASON_SUCCESS:
      return Object.assign({}, state, {
        seasons: state.seasons.map((season) => (season.id === action.payload.id ? action.payload : season)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_SEASON_SUCCESS: {
      return Object.assign({}, state, {
        seasons: state.seasons.filter((season) => season.id !== action.payload),
      });
    }

    default:
      return state;
  }
};

export default seasonReducer;
