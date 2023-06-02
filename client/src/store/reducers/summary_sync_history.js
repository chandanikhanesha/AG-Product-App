import { SUMMARY_SYNC_HISTORY, SET_ISLOADING_SUMMARY_SYNC_HISTORY } from '../constants';

const initialState = {
  data: [],
  isLoading: true,
};

const summarySyncHistoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUMMARY_SYNC_HISTORY:
      return {
        ...state,
        data: action.payload.data,
        isLoading: false,
      };
    case SET_ISLOADING_SUMMARY_SYNC_HISTORY:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export default summarySyncHistoryReducer;
