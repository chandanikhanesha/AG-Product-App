import axios from 'axios';
import * as constants from '../constants';
import { _authHeaders } from './helpers';

export const loadOrganization = (organizationId) => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_BASE}/admin/organizations/${organizationId}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: constants.LOAD_ORGANIZATION_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const updateOrganization = (organizationId, data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/admin/organizations/${organizationId}`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: constants.UPDATE_ORGANIZATION_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const addHiddenLot = (organizationId, hiddenLot) => {
  console.log('add hidden : ', hiddenLot);
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/admin/organizations/${organizationId}/add_hidden_lot`,
        { hiddenLot },
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: constants.UPDATE_ORGANIZATION_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const updateDefaultDaysToDueDate = ({ purchaseOrderId, date, isInvoiceDueDate }) => {
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/admin/organizations/${purchaseOrderId}/default-days-to-due-date`,
        { date, isInvoiceDueDate },
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: constants.UPDATE_ORGANIZATION_SUCCESS,
          payload: response.data,
        });
      });
  };
};
