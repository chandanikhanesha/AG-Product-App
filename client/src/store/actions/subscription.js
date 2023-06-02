import axios from 'axios';
import { SUBSCRIPTION_PLAN_LIST, CREATE_PAYMENT_SUCCESS } from '../../store/constants';
import { _authHeaders } from './helpers';

// Admin

export const createSubsciptionPayment = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/admin/subscription/charge`, data, _authHeaders())
      .then((response) => {
        dispatch({
          type: CREATE_PAYMENT_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const getSubscriptionPlans = () => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_BASE}/admin/subscription/allPlans`, _authHeaders())
      .then((response) => {
        dispatch({
          type: SUBSCRIPTION_PLAN_LIST,
          payload: response.data,
        });
      });
  };
};
