import axios from 'axios';
import {
  SUMMARY_SYNC_HISTORY,
  SET_ISLOADING_SUMMARY_SYNC_HISTORY,
  LIST_MONSANTO_RETAILER_SUMMARY,
} from '../../store/constants';
import { _authHeaders } from './helpers';

export const summarySyncHistoryList = () => {
  return (dispatch) => {
    dispatch({
      type: SET_ISLOADING_SUMMARY_SYNC_HISTORY,
      payload: true,
    });
    return axios
      .get(`${process.env.REACT_APP_API_BASE}/monsanto/summary_sync_history/list`, _authHeaders())
      .then((response) => {
        dispatch({
          type: SUMMARY_SYNC_HISTORY,
          payload: response,
        });
      })
      .catch((e) => {
        dispatch({
          type: SET_ISLOADING_SUMMARY_SYNC_HISTORY,
          payload: false,
        });
      });
  };
};

export const updateIsChange = () => {
  return (dispatch) => {
    dispatch({
      type: SET_ISLOADING_SUMMARY_SYNC_HISTORY,
      payload: true,
    });
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/monsanto/summary_sync_history/update_is_changed`, '', _authHeaders())
      .then((response) => {
        dispatch({
          type: LIST_MONSANTO_RETAILER_SUMMARY,
          payload: response,
        });
      })
      .catch((e) => {
        console.log(e);
      });
  };
};
