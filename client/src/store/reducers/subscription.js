import { SUBSCRIPTION_PLAN_LIST } from '../constants';

const initialState = {
  subscriptionPlanList: [],
  fetched: false,
};

let subscriptionReducer = (state = initialState, action) => {
  switch (action.type) {
    case SUBSCRIPTION_PLAN_LIST:
      return {
        ...state,
        subscriptionPlanList: action.payload.data,
        fetched: true,
      };
    default:
      return state;
  }
};

export default subscriptionReducer;
