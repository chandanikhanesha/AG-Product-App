import axios from 'axios';
import { cachedListAction } from '../../utilities';
import {
  LIST_API_SEED_COMPANIES,
  CREATE_API_SEED_COMPANY_SUCCESS,
  UPDATE_API_SEED_COMPANY_SUCCESS,
  DELETE_API_SEED_COMPANY_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { eventEmitter } from '../../event_emitter';

const BASE_URL = `${process.env.REACT_APP_API_BASE}/api_seed_companies`;

export const createApiSeedCompany = (data) => {
  return (dispatch) => {
    // return axios.post(`${TECHNOLOGY_ID_VALIDATION_URL}`, data, _authHeaders())
    //   .then((response) => {
    //     const _data = {
    //       ...data,
    //       zoneIds: JSON.stringify(response.data.licences[0].statusDetails)
    //     }
    //     return axios.post(`${BASE_URL}`, _data, _authHeaders())
    //   })
    //   .then(response => {
    //     return dispatch({
    //       type: CREATE_API_SEED_COMPANY_SUCCESS,
    //       payload: response.data
    //     });
    //   })

    return axios.post(`${BASE_URL}`, data, _authHeaders()).then((response) => {
      return dispatch({
        type: CREATE_API_SEED_COMPANY_SUCCESS,
        payload: response.data,
      });
    });
  };
};

export const listApiSeedCompanies = (force = true) => {
  return (dispatch, getState) => {
    return cachedListAction(
      force,
      getState().apiSeedCompanyReducer,
      LIST_API_SEED_COMPANIES,
      'api_seed_companies',
      'api_seed_companies/last_update',
      dispatch,
    );
  };
};

export const listLicences = (info) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/monsanto/grower_licence/check`, info, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        return response;
      });
    // .catch((e) => console.log("e: ", e));
  };
};
export const updateApiSeedCompany = (updatedData) => {
  return (dispatch) => {
    return axios.patch(`${BASE_URL}/${updatedData.id}`, updatedData, _authHeaders()).then((response) => {
      return dispatch({
        type: UPDATE_API_SEED_COMPANY_SUCCESS,
        payload: response.data,
      });
    });
  };
};

export const deleteApiSeedCompany = (apiSeedCompanyId, history) => {
  return (dispatch) => {
    return axios.delete(`${BASE_URL}/${apiSeedCompanyId}`, _authHeaders()).then((response) => {
      if (history) history.push('/app/customers');
      dispatch({
        type: DELETE_API_SEED_COMPANY_SUCCESS,
        payload: response.data,
      });

      return eventEmitter.emit('removeApiSeedCompany', response.data.id);
    });
  };
};
