import axios from 'axios';
import {
  LIST_CUSTOMER_RETURN_PRODUCTS,
  CREATE_CUSTOMER_RETURN_PRODUCT_SUCCESS,
  UPDATE_CUSTOMER_RETURN_PRODUCT_SUCCESS,
  DELETE_CUSTOMER_RETURN_PRODUCT_SUCCESS,
} from '../constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listCustomerAllReturnProducts = (force = true) => {
  return (dispatch, getState) => {
    return cachedListAction(
      force,
      getState().customerReturnProductReducer,
      LIST_CUSTOMER_RETURN_PRODUCTS,
      'customer_return_products',
      'customer_return_products/last_update',
      dispatch,
    );
  };
};

export const createAllReturnProduct = (data) => {
  return (dispatch) => {
    return axios
      .post(
        `${process.env.REACT_APP_API_BASE}/customer_return_products/returnData`,
        {
          data,
        },
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: CREATE_CUSTOMER_RETURN_PRODUCT_SUCCESS,
          payload: response.data,
        });
      })
      .catch((err) => {
        console.log(err, 'erroe while  create monsanto');
      });
  };
};
export const editCustomerAllReturnProduct = (customerId, customerProductId, data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/customer_return_products/${customerProductId}`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_CUSTOMER_RETURN_PRODUCT_SUCCESS,
          payload: response.data,
        });
      });
    // .catch((err) => {
    //   console.log(err, 'error while update monstanto');
    // });
  };
};

export const deleteCustomerAllReturnProduct = (customerId, purchaseOrderId, customerProductId) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/customer_return_products/${customerProductId}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: DELETE_CUSTOMER_RETURN_PRODUCT_SUCCESS,
          payload: customerProductId,
        });
      });
  };
};
