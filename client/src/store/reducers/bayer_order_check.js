import { BAYER_ORDER_CHECK, SET_ISLOADING_BAYER_ORDER_CHECK } from '../constants';

const initialState = {
  data: [],
  isLoading: true,
};

const bayerOrderCheckReducer = (state = initialState, action) => {
  switch (action.type) {
    case BAYER_ORDER_CHECK:
      return {
        ...state,
        data: action.payload.data,
        isLoading: false,
      };
    case SET_ISLOADING_BAYER_ORDER_CHECK:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export default bayerOrderCheckReducer;
