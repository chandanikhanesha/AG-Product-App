import axios from 'axios';
import { ORDER_RESPONSE, SET_ISLOADING_ORDER_RESPONSE } from '../../store/constants';
import { _authHeaders } from './helpers';

export const orderResponseList = () => {
  return (dispatch) => {
    dispatch({
      type: SET_ISLOADING_ORDER_RESPONSE,
      payload: true,
    });
    return axios
      .get(`${process.env.REACT_APP_API_BASE}/monsanto/order_response_log/list`, _authHeaders())
      .then((response) => {
        dispatch({
          type: ORDER_RESPONSE,
          payload: response,
        });
      })
      .catch((e) => {
        dispatch({
          type: SET_ISLOADING_ORDER_RESPONSE,
          payload: false,
        });
      });
  };
};
