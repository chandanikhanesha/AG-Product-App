import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_STATEMENT_SETTINGS,
  CREATE_STATEMENT_SETTING_SUCCESS,
  DELETE_STATEMENT_SETTING_SUCCESS,
  UPDATE_STATEMENT_SETTING_SUCCESS,
  GET_STATEMENT_SETTING_SUCCESS,
} from '../constants';

const initialState = {
  current: null,
  currentloadingStatus: LoadingStatus.Unloaded,
  statementSettings: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let statementSettingReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        statementSettings: action.payload.statementSettingReducer
          ? action.payload.statementSettingReducer.statementSettings
          : state.statementSettings,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_STATEMENT_SETTINGS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_STATEMENT_SETTINGS.COMMIT:
      return {
        ...state,
        statementSettings: action.payload.items,
        loadingStatus: LoadingStatus.Loaded,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_STATEMENT_SETTINGS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case GET_STATEMENT_SETTING_SUCCESS:
      return Object.assign({}, state, {
        current: action.payload,
        currentLoadingStatus: LoadingStatus.Loaded,
      });
    case CREATE_STATEMENT_SETTING_SUCCESS:
      return Object.assign({}, state, {
        statementSettings: [...state.statementSettings, action.payload],
      });
    case UPDATE_STATEMENT_SETTING_SUCCESS:
      return Object.assign({}, state, {
        statementSetting: state.statementSettings.map((d) => (d.id === action.payload.id ? action.payload : d)),
        lastUpdate: action.payload.updatedAt,
      });
    case DELETE_STATEMENT_SETTING_SUCCESS:
      return Object.assign({}, state, {
        statementSetting: state.statementSettings.filter((dd) => dd.id !== action.payload),
      });
    default:
      return state;
  }
};

export default statementSettingReducer;
