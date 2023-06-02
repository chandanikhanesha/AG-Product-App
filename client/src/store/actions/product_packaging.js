import axios from 'axios';
import {
  LIST_PRODUCT_PACKAGINGS,
  CREATE_PRODUCT_PACKAGING_SUCCESS,
  UPDATE_PRODUCT_PACKAGING_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listProductPackagings = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().productPackagingReducer,
      LIST_PRODUCT_PACKAGINGS,
      'product_packagings',
      'product_packagings/last_update',
      dispatch,
    );
  };
};

export const createProductPackaging = (data) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/product_packagings`, data, _authHeaders()).then((response) => {
      return dispatch({
        type: CREATE_PRODUCT_PACKAGING_SUCCESS,
        payload: response.data,
      });
    });
  };
};

export const updateProductPackaging = (updatedData) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/product_packagings/${updatedData.id}`, updatedData, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_PRODUCT_PACKAGING_SUCCESS,
          payload: response.data,
        });
      });
  };
};
