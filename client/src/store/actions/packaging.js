import axios from 'axios';
import {
  LIST_PACKAGINGS,
  CREATE_PACKAGING_SUCCESS,
  UPDATE_PACKAGING_SUCCESS,
  DELETE_PACKAGING_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listPackagings = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().packagingReducer,
      LIST_PACKAGINGS,
      'packagings',
      'packagings/last_update',
      dispatch,
    );
  };
};

export const createPackaging = (data) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/packagings`, data, _authHeaders()).then((response) => {
      return dispatch({
        type: CREATE_PACKAGING_SUCCESS,
        payload: response.data,
      });
    });
  };
};

export const updatePackaging = (updatedData) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/packagings/${updatedData.id}`, updatedData, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_PACKAGING_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deletePackaging = (packaging) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/packagings/${packaging.id}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: DELETE_PACKAGING_SUCCESS,
          payload: packaging.id,
        });
      });
  };
};
