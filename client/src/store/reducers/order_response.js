import { ORDER_RESPONSE, SET_ISLOADING_ORDER_RESPONSE } from '../constants';

const initialState = {
  data: [],
  isLoading: true,
};

const orderResponseReducer = (state = initialState, action) => {
  switch (action.type) {
    case ORDER_RESPONSE:
      return {
        ...state,
        data: action.payload.data,
        isLoading: false,
      };
    case SET_ISLOADING_ORDER_RESPONSE:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

export default orderResponseReducer;
