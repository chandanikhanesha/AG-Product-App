import axios from 'axios';
import {
  LIST_DELIVERY_RECEIPT,
  CREATE_DELIVERY_RECEIPT_SUCCESS,
  UPDATE_DELIVERY_RECEIPT_SUCCESS,
  DELETE_DELIVERY_RECEIPT_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

// TODO: this list action should not be scoped to purchase order id, added the `x` as a quick fix.
//  Complete solution would require a server route change.
export const listDeliveryReceipts = (purchaseOrderId, force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().deliveryReceiptReducer,
      LIST_DELIVERY_RECEIPT,
      purchaseOrderId
        ? `purchase_orders/${purchaseOrderId}/delivery_receipts`
        : `purchase_orders/purchase_order_id/delivery_receipts`,

      `purchase_orders/purchase_order_id/delivery_receipts/last_update`,
      dispatch,
    );
  };
};

export const createDeliveryReceipt = (purchaseOrderId, isReturnChecked, updatedRecords, name = 'Not specified') => {
  const data = {
    isReturnChecked,
    name,
    ...updatedRecords,
  };

  return (dispatch) => {
    return axios
      .post(
        `${process.env.REACT_APP_API_BASE}/purchase_orders/${purchaseOrderId}/delivery_receipts`,
        data,
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: CREATE_DELIVERY_RECEIPT_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const updateDeliveryReceipt = (purchaseOrderId, id, updatedRecords) => {
  const data =
    updatedRecords !== undefined
      ? {
          ...updatedRecords,
        }
      : { delete: true };
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/purchase_orders/${purchaseOrderId}/delivery_receipts/${id}`,
        data,
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: UPDATE_DELIVERY_RECEIPT_SUCCESS,
          payload: response.data,
        });
      })
      .catch((e) => console.log('e: ', e));
  };
};

export const movementReport = (purchaseOrderId, name = 'Not specified') => {
  const data = {
    purchaseOrderId,
  };

  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/monsanto/product_movement_report`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: CREATE_DELIVERY_RECEIPT_SUCCESS,
          payload: response.data,
        });
      });
  };
};
export const deleteDeliveryReceipt = (purchaseOrderId, id) => {
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/purchase_orders/${purchaseOrderId}/delivery_receipts/${id}`,
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: DELETE_DELIVERY_RECEIPT_SUCCESS,
          payload: id,
        });
      });
  };
};
