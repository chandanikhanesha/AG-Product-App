import axios from 'axios';
import {
  SIGN_IN_SUCCESS,
  ACCEPT_INVITE_SUCCESS,
  UPDATE_USER_SUCCESS,
  LIST_USERS,
  DELETE_USER_SUCCESS,
  CREATE_USER_SUCCESS,
} from '../../store/constants';
import { isUnloaded } from '../../utilities';
import { _authHeaders, apiActionBuilder } from './helpers';

export const logIn = (data) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/auth/sign_in`, data).then((response) => {
      if (response.data.success) {
        return dispatch({
          type: SIGN_IN_SUCCESS,
          payload: response.data.user,
        });
      } else {
        console.log('nope ; ', response);
      }
    });
  };
};

export const acceptInvite = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/auth/accept_invite`, data, _authHeaders())
      .then((response) => {
        if (response.status === 200) {
          return dispatch({
            type: ACCEPT_INVITE_SUCCESS,
            payload: response.data.user,
          });
        } else {
          console.log('nope : ', response);
        }
      })
      .catch((e) => console.log('e : ', e));
  };
};

export const updateUser = (userId, data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/users/${userId}`, data, _authHeaders())
      .then((response) => {
        if (response.status === 200) {
          return dispatch({
            type: UPDATE_USER_SUCCESS,
            payload: response.data.user,
          });
        } else {
          console.log('nope : ', response);
        }
      })
      .catch((e) => console.log('e : ', e));
  };
};

// Admin

export const listUsers = (force = false) => {
  return (dispatch, getState) => {
    const loadingStatus = getState().userReducer.usersStatus;
    if (force || isUnloaded(loadingStatus)) {
      dispatch(
        apiActionBuilder.get({
          types: LIST_USERS,
          url: 'admin/users',
        }),
      );
    }
  };
};

export const deleteUser = (userId) => {
  return (dispatch) => {
    return axios.delete(`${process.env.REACT_APP_API_BASE}/admin/users/${userId}`, _authHeaders()).then((response) => {
      if (response.status === 200) {
        return dispatch({
          type: DELETE_USER_SUCCESS,
          payload: userId,
        });
      } else {
        console.log('nope : ', response);
      }
    });
  };
};

export const inviteUser = (data) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/admin/users/invite`, data, _authHeaders()).then((response) => {
      if (response.status === 200) {
        return dispatch({
          type: CREATE_USER_SUCCESS,
          payload: response.data,
        });
      } else {
        console.log('nope : ', response);
      }
    });
  };
};
