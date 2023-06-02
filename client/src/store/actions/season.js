import axios from 'axios';
import { cachedListAction } from '../../utilities';
import {
  LIST_SEASONS,
  CREATE_SEASON_SUCCESS,
  UPDATE_SEASON_SUCCESS,
  DELETE_SEASON_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';

export const createSeason = (data) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/seasons`, data, _authHeaders()).then((response) => {
      return dispatch({
        type: CREATE_SEASON_SUCCESS,
        payload: response.data,
      });
    });
  };
};

export const listSeasons = (force = false) => {
  return (dispatch, getState) => {
    return cachedListAction(force, getState().seasonReducer, LIST_SEASONS, 'seasons', 'seasons/last_update', dispatch);
  };
};

export const updateSeason = (updatedSeason) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/seasons/${updatedSeason.id}`, updatedSeason, _authHeaders())
      .then((response) =>
        dispatch({
          type: UPDATE_SEASON_SUCCESS,
          payload: response.data,
        }),
      );
  };
};

export const deleteSeason = (seasonId) => {
  return (dispatch) => {
    return axios.delete(`${process.env.REACT_APP_API_BASE}/seasons/${seasonId}`, _authHeaders()).then(() =>
      dispatch({
        type: DELETE_SEASON_SUCCESS,
        payload: seasonId,
      }),
    );
  };
};
