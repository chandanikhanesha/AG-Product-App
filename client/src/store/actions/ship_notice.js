import axios from 'axios';
import { SHIP_NOTICE, SET_ISLOADING_SHIP_NOTICE } from '../../store/constants';
import { _authHeaders } from './helpers';

export const shipNoticeList = () => {
  return (dispatch) => {
    dispatch({
      type: SET_ISLOADING_SHIP_NOTICE,
      payload: true,
    });
    return axios.get(`${process.env.REACT_APP_API_BASE}/monsanto/ship_notice/list`, _authHeaders()).then((response) => {
      dispatch({
        type: SHIP_NOTICE,
        payload: response,
      });
    });
  };
};

export const updateAcceptStatus = (data) => {
  console.log(data);
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/monsanto/ship_notice/update_accept_status`, data, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        return response;
      });
  };
};

export const syncShipNotice = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/monsanto/ship_notice/ship_notice`, '', {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        return response;
      });
  };
};
