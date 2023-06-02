import axios from 'axios';
import {
  LIST_FINANCE_METHODS,
  CREATE_FINANCE_METHOD_SUCCESS,
  DELETE_FINANCE_METHOD_SUCCESS,
  UPDATE_FINANCE_METHOD_SUCCESS,
  GET_FINANCE_METHOD_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listFinanceMethods = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().financeMethodReducer,
      LIST_FINANCE_METHODS,
      'setting/statement_setting/finance_method',
      'setting/statement_setting/finance_method/last_update',
      dispatch,
    );
  };
};

export const getFinanceMethodById = (id) => {
  return (dispatch, getState) => {
    return axios
      .get(`${process.env.REACT_APP_API_BASE}/setting/statement_setting/finance_method/detail/${id}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: GET_FINANCE_METHOD_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const createFinanceMethod = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/setting/statement_setting/finance_method`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: CREATE_FINANCE_METHOD_SUCCESS,
          payload: response.data,
        });
      })
      .catch((e) => console.log('e: ', e));
  };
};

export const updateFinanceMethod = (financeMethodId, data) => {
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/setting/statement_setting/finance_method/${financeMethodId}`,
        data,
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: UPDATE_FINANCE_METHOD_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteFinanceMethod = (financeMethodId) => {
  return (dispatch) => {
    return axios
      .delete(
        `${process.env.REACT_APP_API_BASE}/setting/statement_setting/finance_method/${financeMethodId}`,
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: DELETE_FINANCE_METHOD_SUCCESS,
          payload: financeMethodId,
        });
      });
  };
};
