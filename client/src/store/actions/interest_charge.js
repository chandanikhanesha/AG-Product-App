import axios from 'axios';
import {
  LIST_INTEREST_CHARGES,
  CREATE_INTEREST_CHARGE_SUCCESS,
  DELETE_INTEREST_CHARGE_SUCCESS,
  UPDATE_INTEREST_CHARGE_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listInterestCharges = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().interestChargeReducer,
      LIST_INTEREST_CHARGES,
      'setting/interest_charge',
      'setting/interest_charge/last_update',
      dispatch,
    );
  };
};

export const createInterestCharge = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/setting/interest_charge`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: CREATE_INTEREST_CHARGE_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const updateInterestCharge = (interestChargeId, data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/setting/interest_charge/${interestChargeId}`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_INTEREST_CHARGE_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteInterestCharge = (interestChargeId) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/setting/interest_charge/${interestChargeId}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: DELETE_INTEREST_CHARGE_SUCCESS,
          payload: interestChargeId,
        });
      });
  };
};
