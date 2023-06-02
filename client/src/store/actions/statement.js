import axios from 'axios';
import {
  LIST_STATEMENTS,
  CREATE_STATEMENT_SUCCESS,
  DELETE_STATEMENT_SUCCESS,
  UPDATE_STATEMENT_SUCCESS,
  GET_STATEMENT_SUCCESS,
  CREATE_STATEMENTS_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listStatements = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().statementReducer,
      LIST_STATEMENTS,
      'statement',
      'statement/last_update',
      dispatch,
    );
  };
};

export const createStatementsNow = (force = false) => {
  return (dispatch, getState) => {
    return axios.get(`${process.env.REACT_APP_API_BASE}/statement/create_now`, _authHeaders()).then((response) => {
      return dispatch({
        type: CREATE_STATEMENTS_SUCCESS,
      });
    });
  };
};

export const getStatementById = (id) => {
  return (dispatch, getState) => {
    return axios.get(`${process.env.REACT_APP_API_BASE}/statement/detail/${id}`, _authHeaders()).then((response) => {
      return dispatch({
        type: GET_STATEMENT_SUCCESS,
        payload: response.data,
      });
    });
  };
};

export const createStatement = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/statement`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: CREATE_STATEMENT_SUCCESS,
          payload: response.data,
        });
      })
      .catch((e) => console.log('e: ', e));
  };
};

export const updateStatement = (statementId, data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/statement/${statementId}`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_STATEMENT_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteStatement = (statementId) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/statement/${statementId}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: DELETE_STATEMENT_SUCCESS,
          payload: statementId,
        });
      });
  };
};
