import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_NOTES,
  CREATE_NOTE_SUCCESS,
  DELETE_NOTE_SUCCESS,
  UPDATE_NOTE_SUCCESS,
} from '../constants';

const initialState = {
  notes: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let noteReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_NOTES.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };

    case LIST_NOTES.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        notes: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };

    case LIST_NOTES.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_NOTE_SUCCESS:
      return Object.assign({}, state, { notes: [...state.notes, action.payload] });

    case DELETE_NOTE_SUCCESS:
      return Object.assign({}, state, {
        notes: state.notes.filter((note) => note.id !== action.payload),
      });

    case UPDATE_NOTE_SUCCESS:
      return {
        ...state,
        notes: state.notes.map((note) => (note.id === action.payload.id ? action.payload : note)),
        lastUpdate: action.payload.updatedAt,
      };

    default:
      return state;
  }
};

export default noteReducer;
