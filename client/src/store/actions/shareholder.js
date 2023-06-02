import axios from 'axios';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';
import {
  LIST_SHAREHOLDERS,
  CREATE_SHAREHOLDER_SUCCESS,
  DELETE_SHAREHOLDER_SUCCESS,
  UPDATE_SHAREHOLDER_SUCCESS,
} from '../constants';

export const listShareholders = (customerId, force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().shareholderReducer,
      LIST_SHAREHOLDERS,
      `customers/${customerId}/shareholders`,
      `customers/${customerId}/shareholders/last_update`,
      dispatch,
    );
  };
};

// get without fetch
export const getCustomerShareholders = (customerId) => {
  return (dispatch, getState) =>
    getState().shareholderReducer.shareholders.filter((shareholder) => shareholder.customerId === +customerId);
};

export const createShareholder = (customerId, data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/customers/${customerId}/shareholders`, data, _authHeaders())
      .then((response) => {
        dispatch({
          type: CREATE_SHAREHOLDER_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const updateShareholder = (customerId, data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/customers/${customerId}/shareholders`, data, _authHeaders())
      .then((response) => {
        dispatch({
          type: UPDATE_SHAREHOLDER_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteShareholder = (customerId, shareholder) => {
  return (dispatch) => {
    return axios
      .delete(
        `${process.env.REACT_APP_API_BASE}/customers/${customerId}/shareholders/${shareholder.id}`,
        _authHeaders(),
      )
      .then((response) => {
        dispatch({
          type: DELETE_SHAREHOLDER_SUCCESS,
          payload: shareholder.id,
        });
      });
  };
};
