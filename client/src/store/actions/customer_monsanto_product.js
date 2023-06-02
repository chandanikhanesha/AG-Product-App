import axios from 'axios';
import {
  LIST_CUSTOMER_MONSANTO_PRODUCTS,
  CREATE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS,
  UPDATE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS,
  DELETE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS,
  REMOVE_RECENT_CREATED_CUSTOMER_MONSANTO_PRODUCT,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listCustomerMonsantoProducts = (force = true) => {
  return (dispatch, getState) => {
    return cachedListAction(
      force,
      getState().customerProductReducer,
      LIST_CUSTOMER_MONSANTO_PRODUCTS,
      'monsanto/customer_products',
      'monsanto/customer_products/last_update',
      dispatch,
    );
  };
};

export const createCustomerMonsantoProduct = (
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
  monsantoProductReduceTransferInfo,
  comment,
  isSent,
  isPickLater,
  pickLaterQty,
  pickLaterProductId,
) => {
  return (dispatch) => {
    return axios
      .post(
        `${process.env.REACT_APP_API_BASE}/monsanto/customer_products`,
        {
          purchaseOrderId,
          productId,
          quantity,
          discounts,
          shareholderData,
          farmId,
          unit,
          fieldName,
          orderDate,
          price,
          monsantoProductReduceTransferInfo,
          comment,
          isSent,
          isPickLater,
          pickLaterQty,
          pickLaterProductId,
        },
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: CREATE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS,
          payload: response.data,
        });
      })
      .catch((err) => {
        console.log(err, 'erroe while  create monsanto');
      });
  };
};

export const editCustomerMonsantoProduct = (customerId, customerProductId, data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/monsanto/customer_products/${customerProductId}`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS,
          payload: response.data,
        });
      });
    // .catch((err) => {
    //   console.log(err, 'error while update monstanto');
    // });
  };
};

export const updateQuoteMonsantoProduct = (customerId, customerProductId, data, IDname) => {
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/monsanto/customer_products/update_quote/${customerProductId}`,
        { data, IDname },
        _authHeaders(),
      )
      .then((response) =>
        dispatch({
          type: UPDATE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS,
          payload: response.data,
        }),
      );
  };
};

export const transferPo = (data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/monsanto/customer_products/transfer_po/delete`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: DELETE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS,
          payload: data.toPurchaseOrderId,
        });
      });
  };
};

export const deleteCustomerMonsantoProduct = (customerId, purchaseOrderId, customerProductId) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/monsanto/customer_products/${customerProductId}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: DELETE_CUSTOMER_MONSANTO_PRODUCT_SUCCESS,
          payload: customerProductId,
        });
      });
  };
};

export const removeRecentCreatedCustomerMonsantoProduct = (id) => {
  return (dispatch) => {
    dispatch({
      type: REMOVE_RECENT_CREATED_CUSTOMER_MONSANTO_PRODUCT,
      payload: id,
    });
  };
};
