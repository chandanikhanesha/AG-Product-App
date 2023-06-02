import axios from 'axios';
import { cachedListAction } from '../../utilities';
import { LIST_FARMS, CREATE_FARM_SUCCESS, DELETE_FARM_SUCCESS, UPDATE_FARM_SUCCESS } from '../../store/constants';
import { _authHeaders } from './helpers';

export const listFarms = (customerId, force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().farmReducer,
      LIST_FARMS,
      `customers/${customerId}/farms`,
      `customers/${customerId}/farms/last_update`,
      dispatch,
    );
  };
};

export const createFarm = (customerId, data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/customers/${customerId}/farms`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: CREATE_FARM_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const updateFarm = (customerId, farm) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/customers/${customerId}/farms/${farm.id}`, farm, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_FARM_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteFarm = (customerId, farm) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/customers/${customerId}/farms/${farm.id}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: DELETE_FARM_SUCCESS,
          payload: farm.id,
        });
      });
  };
};
