import axios from 'axios';
import {
  LIST_PRODUCTS,
  CREATE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listProducts = (force = false) => {
  return (dispatch, getState) => {
    return cachedListAction(
      force,
      getState().productReducer,
      LIST_PRODUCTS,
      'products',
      'products/last_update',
      dispatch,
    );
  };
};

export const createProduct = (data) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/products`, data, _authHeaders()).then((response) => {
      return dispatch({
        type: CREATE_PRODUCT_SUCCESS,
        payload: response.data,
      });
    });
  };
};

export const deleteProduct = (product) => {
  return (dispatch) => {
    return axios.delete(`${process.env.REACT_APP_API_BASE}/products/${product.id}`, _authHeaders()).then((response) => {
      if (response.data && response.data.error && response.data.error === 'Existing quotes or purchase orders') {
        throw response.data;
      } else {
        return dispatch({
          type: DELETE_PRODUCT_SUCCESS,
          payload: product,
        });
      }
    });
  };
};

export const updateProduct = (data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/products/${data.id}`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_PRODUCT_SUCCESS,
          payload: response.data,
        });
      });
  };
};
