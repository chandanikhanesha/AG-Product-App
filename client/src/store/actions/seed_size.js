import axios from 'axios';
import {
  LIST_SEED_SIZES,
  CREATE_SEED_SIZE_SUCCESS,
  UPDATE_SEED_SIZE_SUCCESS,
  DELETE_SEED_SIZE_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listSeedSizes = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().seedSizeReducer,
      LIST_SEED_SIZES,
      'seed_sizes',
      'seed_sizes/last_update',
      dispatch,
    );
  };
};

export const createSeedSize = (data) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/seed_sizes`, data, _authHeaders()).then((response) => {
      return dispatch({
        type: CREATE_SEED_SIZE_SUCCESS,
        payload: response.data,
      });
    });
  };
};

export const updateSeedSize = (updatedData) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/seed_sizes/${updatedData.id}`, updatedData, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_SEED_SIZE_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteSeedSize = (seed_size) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/seed_sizes/${seed_size.id}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: DELETE_SEED_SIZE_SUCCESS,
          payload: seed_size.id,
        });
      });
  };
};
