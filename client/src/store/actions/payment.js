import axios from 'axios';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';
import { LIST_PAYMENTS, CREATE_PAYMENT_SUCCESS, DELETE_PAYMENT_SUCCESS, UPDATE_PAYMENT_SUCCESS } from '../constants';

export const listPayments = (purchaseOrderId, force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().paymentReducer,
      LIST_PAYMENTS,
      `purchase_orders/${purchaseOrderId}/payments`,
      `purchase_orders/${purchaseOrderId}/payments/last_update`,
      dispatch,
    );
  };
};

export const createPayment = (purchaseOrderId, data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/purchase_orders/${purchaseOrderId}/payments`, data, _authHeaders())
      .then((response) => {
        dispatch({
          type: CREATE_PAYMENT_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deletePayment = (purchaseOrderId, payment) => {
  return (dispatch) => {
    return axios
      .delete(
        `${process.env.REACT_APP_API_BASE}/purchase_orders/${purchaseOrderId}/payments/${payment.id}`,
        _authHeaders(),
      )
      .then((response) => {
        dispatch({
          type: DELETE_PAYMENT_SUCCESS,
          payload: payment.id,
        });
      });
  };
};

export const updatePayment = (purchaseOrderId, paymentId, data) => {
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/purchase_orders/${purchaseOrderId}/payments/${paymentId}`,
        data,
        _authHeaders(),
      )
      .then((response) => {
        dispatch({
          type: UPDATE_PAYMENT_SUCCESS,
          payload: response.data,
        });
      });
  };
};
