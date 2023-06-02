import axios from 'axios';
import {
  LIST_CUSTOM_PRODUCTS,
  CREATE_CUSTOM_PRODUCT_SUCCESS,
  DELETE_CUSTOM_PRODUCT_SUCCESS,
  UPDATE_CUSTOM_PRODUCT_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listAllCustomProducts = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().customProductReducer,
      LIST_CUSTOM_PRODUCTS,
      'custom_products',
      'custom_products/last_update',
      dispatch,
    );
  };
};

export const createCustomProduct = (data) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/custom_products`, data, _authHeaders()).then((response) => {
      return dispatch({
        type: CREATE_CUSTOM_PRODUCT_SUCCESS,
        payload: response.data,
      });
    });
  };
};

export const deleteCustomProduct = (customProduct) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/custom_products/${customProduct.id}`, _authHeaders())
      .then(() => {
        return dispatch({
          type: DELETE_CUSTOM_PRODUCT_SUCCESS,
          payload: customProduct,
        });
      });
  };
};

export const updateCustomProduct = (data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/custom_products/${data.id}`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_CUSTOM_PRODUCT_SUCCESS,
          payload: response.data,
        });
      });
  };
};
