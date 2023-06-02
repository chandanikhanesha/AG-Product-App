import { SHIP_NOTICE, SET_ISLOADING_SHIP_NOTICE } from '../constants';

const initialState = {
  data: [],
  isLoading: true,
};

const shipNoticeReducer = (state = initialState, action) => {
  switch (action.type) {
    case SHIP_NOTICE:
      return {
        ...state,
        data: action.payload.data,
        isLoading: false,
      };
    case SET_ISLOADING_SHIP_NOTICE:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export default shipNoticeReducer;
