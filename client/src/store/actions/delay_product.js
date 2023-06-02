import axios from 'axios';
import {
  LIST_DELAY_PRODUCTS,
  CREATE_DELAY_PRODUCT_SUCCESS,
  DELETE_DELAY_PRODUCT_SUCCESS,
  UPDATE_DELAY_PRODUCT_SUCCESS,
  GET_DELAY_PRODUCT_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listDelayProducts = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().delayProductReducer,
      LIST_DELAY_PRODUCTS,
      'setting/statement_setting/delay_product',
      'setting/statement_setting/delay_product/last_update',
      dispatch,
    );
  };
};

export const getDelayProductById = (id) => {
  return (dispatch, getState) => {
    return axios
      .get(`${process.env.REACT_APP_API_BASE}/setting/statement_setting/delay_product/detail/${id}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: GET_DELAY_PRODUCT_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const createDelayProduct = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/setting/statement_setting/delay_product`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: CREATE_DELAY_PRODUCT_SUCCESS,
          payload: response.data,
        });
      })
      .catch((e) => console.log('e: ', e));
  };
};

export const updateDelayProduct = (delayProductId, data) => {
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/setting/statement_setting/delay_product/${delayProductId}`,
        data,
        _authHeaders(),
      )
      .then((response) => {
        console.log('updated');
        // console.log(response)
        return dispatch({
          type: UPDATE_DELAY_PRODUCT_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteDelayProduct = (delayProductId) => {
  return (dispatch) => {
    return axios
      .delete(
        `${process.env.REACT_APP_API_BASE}/setting/statement_setting/delay_product/${delayProductId}`,
        _authHeaders(),
      )
      .then((response) => {
        console.log('deleted');
        return dispatch({
          type: DELETE_DELAY_PRODUCT_SUCCESS,
          payload: delayProductId,
        });
      });
  };
};
