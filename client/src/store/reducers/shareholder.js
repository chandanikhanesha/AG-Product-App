import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_SHAREHOLDERS,
  CREATE_SHAREHOLDER_SUCCESS,
  DELETE_SHAREHOLDER_SUCCESS,
  UPDATE_SHAREHOLDER_SUCCESS,
} from '../constants';
import { getLastUpdatedDate } from '../../utilities';

const initialState = {
  shareholders: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
};

const shareholdersReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case LIST_SHAREHOLDERS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_SHAREHOLDERS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        shareholders: action.payload,
        lastUpdate: getLastUpdatedDate(action.payload),
      };
    case LIST_SHAREHOLDERS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case UPDATE_SHAREHOLDER_SUCCESS:
      return state;
    case CREATE_SHAREHOLDER_SUCCESS:
      return Object.assign({}, state, { shareholders: [...state.shareholders, action.payload] });
    case DELETE_SHAREHOLDER_SUCCESS:
      return Object.assign({}, state, {
        shareholders: state.shareholders.filter((shareholder) => shareholder.id !== action.payload),
      });
    default:
      return state;
  }
};

export default shareholdersReducer;
