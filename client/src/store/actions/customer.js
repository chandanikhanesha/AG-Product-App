import axios from 'axios';
import shortid from 'shortid';
import { cachedListAction } from '../../utilities';
import * as constants from '../../store/constants';
import {
  LIST_CUSTOMERS,
  CREATE_CUSTOMER,
  REMOVE_RECENT_CREATED_CUSTOMER,
  CREATE_CUSTOMER_FROM_CSV,
  CHANGE_IMPORTED,
} from '../../store/constants';
import { _authHeaders, apiActionBuilder } from './helpers';

export const listCustomers = (force = false, pageNo, pageSize, filterValue) => {
  return (dispatch, getState) => {
    return cachedListAction(
      force,
      getState().customerReducer,
      LIST_CUSTOMERS,
      pageNo || pageSize
        ? filterValue
          ? `customers?page=${pageNo}&size=${pageSize}&filter=${filterValue}`
          : `customers?page=${pageNo}&size=${pageSize}`
        : `customers`,
      'customers/last_update',
      dispatch,
    );
  };
};

export const downloadCustomers = () => {
  return axios({
    url: `${process.env.REACT_APP_API_BASE}/customers?toCSV=true`,
    ..._authHeaders(),
    method: 'GET',
    responseType: 'blob', // important
  }).then((response) => {
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'customers.csv');
    document.body.appendChild(link);
    link.click();
    setTimeout(() => document.body.removeChild(link), 1000);
  });
};

export const searchCustomers = (searchName) => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?searchName=${searchName}`, _authHeaders())
      .then(({ data }) => {
        return dispatch({
          type: constants.LIST_CUSTOMERS.COMMIT,
          payload: data,
        });
      });
  };
};

export const createCustomer = (body) => {
  // console.log({body})
  if (Array.isArray(body)) {
    return apiActionBuilder.post({
      types: CREATE_CUSTOMER_FROM_CSV,
      url: 'customers',
      id: shortid.generate(),
      body,
    });
  } else {
    return apiActionBuilder.post({
      types: CREATE_CUSTOMER,
      url: 'customers',
      id: shortid.generate(),
      body,
    });
  }
};

export const createCustomersFromCsv = (customers) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/customers`, customers, _authHeaders()).then((response) => {
      return dispatch({
        type: constants.CREATE_CUSTOMER_FROM_CSV,
        payload: response.data,
      });
    });
  };
};

export const changeImported = () => {
  return (dispatch) => {
    dispatch({ type: CHANGE_IMPORTED });
  };
};

export const deleteCustomer = (customerId) => {
  return (dispatch) => {
    return axios.delete(`${process.env.REACT_APP_API_BASE}/customers/${customerId}`, _authHeaders()).then(() => {
      return dispatch({
        type: constants.DELETE_CUSTOMER_SUCCESS,
        payload: customerId,
      });
    });
  };
};

export const updateCustomer = (customerId, data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/customers/${customerId}`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: constants.UPDATE_CUSTOMER_SUCCESS,
          payload: response.data.customer,
        });
      });
  };
};

export const removeRecentCreatedCustomer = (id) => {
  return (dispatch) => {
    dispatch({
      type: REMOVE_RECENT_CREATED_CUSTOMER,
      payload: id,
    });
  };
};
