import axios from 'axios';
import { cachedListAction } from '../../utilities';
import {
  LIST_SEED_COMPANIES,
  CREATE_SEED_COMPANY_SUCCESS,
  UPDATE_SEED_COMPANY_SUCCESS,
  DELETE_SEED_COMPANY_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { eventEmitter } from '../../event_emitter';

export const createSeedCompany = (data) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/seed_companies`, data, _authHeaders()).then((response) => {
      return dispatch({
        type: CREATE_SEED_COMPANY_SUCCESS,
        payload: response.data,
      });
    });
  };
};

export const listSeedCompanies = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().seedCompanyReducer,
      LIST_SEED_COMPANIES,
      'seed_companies',
      'seed_companies/last_update',
      dispatch,
    );
  };
};

export const updateSeedCompany = (updatedData) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/seed_companies/${updatedData.id}`, updatedData, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_SEED_COMPANY_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteSeedCompany = (seedCompanyId, history) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/seed_companies/${seedCompanyId}`, _authHeaders())
      .then((response) => {
        if (history) history.push('/app/customers');
        dispatch({
          type: DELETE_SEED_COMPANY_SUCCESS,
          payload: response.data,
        });
        return eventEmitter.emit('removeSeedCompany', response.data.id);
      });
  };
};
