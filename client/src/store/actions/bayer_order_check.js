import axios from 'axios';
import { BAYER_ORDER_CHECK, SET_ISLOADING_BAYER_ORDER_CHECK } from '../../store/constants';
import { _authHeaders } from './helpers';

export const getBayer_order_check = () => {
  return (dispatch) => {
    dispatch({
      type: SET_ISLOADING_BAYER_ORDER_CHECK,
      payload: true,
    });
    return axios
      .get(`${process.env.REACT_APP_API_BASE}/monsanto/retailer_orders/bayer_order_check`, _authHeaders())
      .then((response) => {
        dispatch({
          type: BAYER_ORDER_CHECK,
          payload: response.data,
        });
      })
      .catch((e) => {
        dispatch({
          type: SET_ISLOADING_BAYER_ORDER_CHECK,
          payload: false,
        });
      });
  };
};
