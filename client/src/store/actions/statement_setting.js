import axios from 'axios';
import {
  LIST_STATEMENT_SETTINGS,
  CREATE_STATEMENT_SETTING_SUCCESS,
  DELETE_STATEMENT_SETTING_SUCCESS,
  UPDATE_STATEMENT_SETTING_SUCCESS,
  GET_STATEMENT_SETTING_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listStatementSettings = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().statementSettingReducer,
      LIST_STATEMENT_SETTINGS,
      'setting/statement_setting',
      'setting/statement_setting/last_update',
      dispatch,
    );
  };
};

export const getStatementSettingById = (id) => {
  return (dispatch, getState) => {
    return axios
      .get(`${process.env.REACT_APP_API_BASE}/setting/statement_setting/detail/${id}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: GET_STATEMENT_SETTING_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const createStatementSetting = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/setting/statement_setting`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: CREATE_STATEMENT_SETTING_SUCCESS,
          payload: response.data,
        });
      })
      .catch((e) => console.log('e: ', e));
  };
};

export const updateStatementSetting = (statementSettingId, data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/setting/statement_setting/${statementSettingId}`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_STATEMENT_SETTING_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteStatementSetting = (statementSettingId) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/setting/statement_setting/${statementSettingId}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: DELETE_STATEMENT_SETTING_SUCCESS,
          payload: statementSettingId,
        });
      });
  };
};
