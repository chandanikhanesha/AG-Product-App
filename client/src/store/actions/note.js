import axios from 'axios';
import { LIST_NOTES, CREATE_NOTE_SUCCESS, DELETE_NOTE_SUCCESS, UPDATE_NOTE_SUCCESS } from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from './../../utilities';

export const listNotes = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(force, getState().reportReducer, LIST_NOTES, 'notes', 'notes/last_update', dispatch);
  };
};

export const createNote = (data) => (dispatch) => {
  return axios.post(`${process.env.REACT_APP_API_BASE}/notes`, data, _authHeaders()).then((response) => {
    return dispatch({
      type: CREATE_NOTE_SUCCESS,
      payload: response.data,
    });
  });
};

export const deleteNote = (id) => {
  return (dispatch) => {
    return axios.delete(`${process.env.REACT_APP_API_BASE}/notes/${id}`, _authHeaders()).then(() => {
      return dispatch({
        type: DELETE_NOTE_SUCCESS,
        payload: id,
      });
    });
  };
};

export const updateNote = (id, data) => {
  return (dispatch) => {
    return axios.patch(`${process.env.REACT_APP_API_BASE}/notes/${id}`, data, _authHeaders()).then((response) => {
      dispatch({
        type: UPDATE_NOTE_SUCCESS,
        payload: response.data,
      });
    });
  };
};
