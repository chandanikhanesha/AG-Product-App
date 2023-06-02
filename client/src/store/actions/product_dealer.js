import axios from 'axios';
import {
  LIST_PRODUCT_DEALERS,
  CREATE_PRODUCT_DEALER_SUCCESS,
  UPDATE_PRODUCT_DEALER_SUCCESS,
  DELETE_PRODUCT_DEALER_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listProductDealers = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().productDealerReducer,
      LIST_PRODUCT_DEALERS,
      'product_dealers',
      'product_dealers/last_update',
      dispatch,
    );
  };
};

export const createProductDealer = (data) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/product_dealers`, data, _authHeaders()).then((response) => {
      return dispatch({
        type: CREATE_PRODUCT_DEALER_SUCCESS,
        payload: response.data,
      });
    });
  };
};

export const updateProductDealer = (updatedData) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/product_dealers/${updatedData.id}`, updatedData, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_PRODUCT_DEALER_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteProductDealer = (id) => {
  return (dispatch) => {
    return axios.delete(`${process.env.REACT_APP_API_BASE}/product_dealers/${id}`, _authHeaders()).then((response) => {
      return dispatch({
        type: DELETE_PRODUCT_DEALER_SUCCESS,
        payload: id,
      });
    });
  };
};
