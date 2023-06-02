import axios from 'axios';
import {
  LIST_PURCHASE_ORDER_STATEMENTS,
  CREATE_PURCHASE_ORDER_STATEMENT_SUCCESS,
  DELETE_PURCHASE_ORDER_STATEMENT_SUCCESS,
  UPDATE_PURCHASE_ORDER_STATEMENT_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listPurchaseOrderStatements = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().purchaseOrderStatementReducer,
      LIST_PURCHASE_ORDER_STATEMENTS,
      'purchase_order_statements',
      'purchase_order_statements/last_update',
      dispatch,
    );
  };
};

export const createPurchaseOrderStatement = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/purchase_order_statements`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: CREATE_PURCHASE_ORDER_STATEMENT_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const updatePurchaseOrderStatement = (data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/purchase_order_statements/update`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_PURCHASE_ORDER_STATEMENT_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deletePurchaseOrderStatement = (statementId) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/purchase_order_statements/${statementId}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: DELETE_PURCHASE_ORDER_STATEMENT_SUCCESS,
          payload: response.data,
        });
      });
  };
};
