import axios from 'axios';
import {
  LIST_DISCOUNT_PACKAGES,
  CREATE_DISCOUNT_PACKAGE_SUCCESS,
  UPDATE_DISCOUNT_PACKAGE_SUCCESS,
  DELETE_DISCOUNT_PACKAGE_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listDiscountPackages = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().discountPackageReducer,
      LIST_DISCOUNT_PACKAGES,
      'setting/discount_packages',
      'setting/discount_packages/last_update',
      dispatch,
    );
  };
};

export const createDiscountPackage = (data) => {
  return (dispatch) => {
    return axios
      .post(`${process.env.REACT_APP_API_BASE}/setting/discount_packages`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: CREATE_DISCOUNT_PACKAGE_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const updateDiscountPackage = (updatedData) => {
  return (dispatch) => {
    return axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/setting/discount_packages/${updatedData.id}`,
        updatedData,
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: UPDATE_DISCOUNT_PACKAGE_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteDiscountPackage = (discountPackageId) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/setting/discount_packages/${discountPackageId}`, _authHeaders())
      .then(() => {
        return dispatch({
          type: DELETE_DISCOUNT_PACKAGE_SUCCESS,
          payload: discountPackageId,
        });
      });
  };
};
