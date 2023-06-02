import axios from 'axios';
import {
  LIST_PURCHASE_ORDERS,
  CREATE_PURCHASE_ORDER_SUCCESS,
  UPDATE_PURCHASE_ORDER_SUCCESS,
  DELETE_PURCHASE_ORDER_SUCCESS,
  CONVERT_QUOTE_TO_EXISTING_PO_SUCCESS,
  GET_PURCHASE_ORDER_SUCCESS,
  GET_PURCHASE_ORDER_ERROR,
} from '../../store/constants';
import { cachedListAction } from '../../utilities';
import { _authHeaders } from './helpers';

export const listPurchaseOrders = (force = false) => {
  return (dispatch, getState) => {
    return cachedListAction(
      force,
      getState().purchaseOrderReducer,
      LIST_PURCHASE_ORDERS,
      'purchase_orders',
      'purchase_orders/last_update',
      dispatch,
    );
  };
};

export const syncMonsantoOrders = (
  orderId,
  customerId,
  notAvailableProducts,
  syncMonsantoProductIds,
  isDealerBucket,
) => {
  return () => {
    return axios
      .post(
        `${process.env.REACT_APP_API_BASE}/purchase_orders/${orderId}/confirm_monsanto_orders`,
        {
          customerId,
          notAvailableProducts,
          syncMonsantoProductIds,
          isDealerBucket,
        },
        _authHeaders(),
      )
      .then((response) => response.data);
  };
};

export const syncAllMonsantoOrders = (OrganizationID) => {
  return () => {
    return axios
      .post(
        `${process.env.REACT_APP_API_BASE}/purchase_orders/all/confirm_all_monsanto_orders`,
        {
          OrganizationID,
        },
        _authHeaders(),
      )
      .then((response) => response.data);
  };
};

export const deleteMonsantoInvoices = (data) => {
  return () => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/purchase_orders/deleteinvoices`, data, _authHeaders())
      .then((response) => response.data);
  };
};

export const getPurchaseOrderById = (id) => {
  return (dispatch, getState) => {
    return axios
      .get(`${process.env.REACT_APP_API_BASE}/purchase_orders/detail/${id}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: GET_PURCHASE_ORDER_SUCCESS,
          payload: response.data,
        });
      })
      .catch((e) => {
        dispatch({
          type: GET_PURCHASE_ORDER_ERROR,
          payload: {},
        });
      });
  };
};

export const createPurchaseOrderForCustomer = (customerId, data = {}) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/customers/${customerId}/purchase_orders`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: CREATE_PURCHASE_ORDER_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const updatePurchaseOrder = (customerId, purchaseOrderId, data) => {
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/customers/${customerId}/purchase_orders/${purchaseOrderId}`,
        data,
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: UPDATE_PURCHASE_ORDER_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deletePurchaseOrder = (customerId, purchaseOrderId, history) => {
  return (dispatch) => {
    return axios
      .delete(
        `${process.env.REACT_APP_API_BASE}/customers/${customerId}/purchase_orders/${purchaseOrderId}`,
        _authHeaders(),
      )
      .then(() => {
        if (history) history.push('/app/customers');
        return dispatch({
          type: DELETE_PURCHASE_ORDER_SUCCESS,
          payload: purchaseOrderId,
        });
      });
  };
};

export const convertQuoteToExistingPurchaseOrder = (customerId, quoteId, existingPurchaseOrderId) => {
  const data = { to: existingPurchaseOrderId };
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/customers/${customerId}/purchase_orders/${quoteId}/convert`,
        data,
        _authHeaders(),
      )
      .then(() => {
        return dispatch({
          type: CONVERT_QUOTE_TO_EXISTING_PO_SUCCESS,
          payload: { quoteId, existingPurchaseOrderId },
        });
      });
  };
};
