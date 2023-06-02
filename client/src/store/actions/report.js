import axios from 'axios';
import {
  LIST_REPORTS,
  CREATE_REPORT_SUCCESS,
  DELETE_REPORT_SUCCESS,
  UPDATE_REPORT_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from './../../utilities';

export const listReports = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(force, getState().reportReducer, LIST_REPORTS, 'reports', 'reports/last_update', dispatch);
  };
};

export const createReport = () => (dispatch) => {
  return axios.post(`${process.env.REACT_APP_API_BASE}/reports`, _authHeaders()).then((response) => {
    return dispatch({
      type: CREATE_REPORT_SUCCESS,
      payload: response.data,
    });
  });
};

export const deleteReport = (id) => {
  return (dispatch) => {
    return axios.delete(`${process.env.REACT_APP_API_BASE}/reports/${id}`, _authHeaders()).then(() => {
      return dispatch({
        type: DELETE_REPORT_SUCCESS,
        payload: id,
      });
    });
  };
};

export const updateReport = (id, data) => {
  return (dispatch) => {
    return axios.patch(`${process.env.REACT_APP_API_BASE}/reports/${id}`, data, _authHeaders()).then((response) => {
      dispatch({
        type: UPDATE_REPORT_SUCCESS,
        payload: response.data,
      });
    });
  };
};
