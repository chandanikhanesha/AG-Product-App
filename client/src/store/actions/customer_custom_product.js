import axios from 'axios';
import {
  LIST_CUSTOMER_CUSTOM_PRODUCTS,
  CREATE_CUSTOMER_CUSTOM_PRODUCT_SUCCESS,
  DELETE_CUSTOMER_CUSTOM_PRODUCT_SUCCESS,
  UPDATE_CUSTOMER_CUSTOM_PRODUCT_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listCustomerCustomProducts = (customerId, force = false) => {
  return (disptach, getState) => {
    cachedListAction(
      force,
      getState().customerCustomProductReducer,
      LIST_CUSTOMER_CUSTOM_PRODUCTS,
      `customers/${customerId}/custom_products`,
      `customers/${customerId}/custom_products/last_update`,
      disptach,
    );
  };
};

export const createCustomerCustomProduct = (
  price,
  purchaseOrderId,
  customerId,
  productId,
  quantity,
  discounts,
  shareholderData,
  farmId,
  packagingId,
  seedSizeId,
  fieldName,
  orderDate,
  unit,
  _,
  comment,
) => {
  return (dispatch) => {
    return axios
      .post(
        `${process.env.REACT_APP_API_BASE}/customers/${customerId}/custom_products`,
        {
          purchaseOrderId,
          productId,
          quantity,
          discounts,
          shareholderData,
          farmId,
          fieldName,
          orderDate,
          comment,
          price,
        },
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: CREATE_CUSTOMER_CUSTOM_PRODUCT_SUCCESS,
          payload: response.data,
          customerId,
        });
      });
  };
};

export const deleteCustomerCustomProduct = (customerId, purchaseOrderId, customerCustomProductId) => {
  return (dispatch) => {
    return axios
      .delete(
        `${process.env.REACT_APP_API_BASE}/customers/${customerId}/custom_products/${customerCustomProductId}`,
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: DELETE_CUSTOMER_CUSTOM_PRODUCT_SUCCESS,
          payload: customerCustomProductId,
          customerId,
        });
      });
  };
};

export const updateCustomerCustomProduct = (customerId, id, data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/customers/${customerId}/custom_products/${id}`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_CUSTOMER_CUSTOM_PRODUCT_SUCCESS,
          payload: response.data,
          customerId,
        });
      });
  };
};
