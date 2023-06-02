import axios from 'axios';
import { cachedListAction } from '../../utilities';
import {
  LIST_COMPANIES,
  CREATE_COMPANY_SUCCESS,
  UPDATE_COMPANY_SUCCESS,
  DELETE_COMPANY_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { eventEmitter } from '../../event_emitter';

export const createCompany = (data) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/companies`, data, _authHeaders()).then((response) => {
      return dispatch({
        type: CREATE_COMPANY_SUCCESS,
        payload: response.data,
      });
    });
  };
};

export const listCompanies = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(force, getState().companyReducer, LIST_COMPANIES, 'companies', 'companies/last_update', dispatch);
  };
};

export const updateCompany = (updatedData) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/companies/${updatedData.id}`, updatedData, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_COMPANY_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteCompany = (companyId, history) => {
  return (dispatch) => {
    return axios.delete(`${process.env.REACT_APP_API_BASE}/companies/${companyId}`, _authHeaders()).then((response) => {
      if (history) history.push('/app/customers');
      dispatch({
        type: DELETE_COMPANY_SUCCESS,
        payload: response.data,
      });
      return eventEmitter.emit('removeCompany', response.data.id);
    });
  };
};
