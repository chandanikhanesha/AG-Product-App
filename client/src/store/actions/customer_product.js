import axios from 'axios';
import {
  LIST_CUSTOMER_PRODUCTS,
  CREATE_CUSTOMER_PRODUCT_SUCCESS,
  UPDATE_CUSTOMER_PRODUCT_SUCCESS,
  DELETE_CUSTOMER_PRODUCT_SUCCESS,
  REMOVE_RECENT_CREATED_CUSTOMER_PRODUCT,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listCustomerProducts = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().customerProductReducer,
      LIST_CUSTOMER_PRODUCTS,
      'customers/x/products',
      'customers/x/products/last_update',
      dispatch,
    );
  };
};

export const createCustomerProduct = (
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
        `${process.env.REACT_APP_API_BASE}/customers/${customerId}/products`,
        {
          purchaseOrderId,
          productId,
          quantity,
          discounts,
          shareholderData,
          farmId,
          packagingId,
          seedSizeId,
          fieldName,
          orderDate,
          comment,
          price,
        },
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: CREATE_CUSTOMER_PRODUCT_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const editCustomerProduct = (customerId, customerProductId, data) => {
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/customers/${customerId}/products/${customerProductId}`,
        data,
        _authHeaders(),
      )
      .then((response) =>
        dispatch({
          type: UPDATE_CUSTOMER_PRODUCT_SUCCESS,
          payload: response.data,
        }),
      );
  };
};

export const deleteCustomerProduct = (customerId, purchaseOrderId, customerProductId) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/customers/${customerId}/products/${customerProductId}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: DELETE_CUSTOMER_PRODUCT_SUCCESS,
          payload: customerProductId,
        });
      });
  };
};

export const removeRecentCreatedCustomerProduct = (id) => {
  return (dispatch) => {
    dispatch({
      type: REMOVE_RECENT_CREATED_CUSTOMER_PRODUCT,
      payload: id,
    });
  };
};
