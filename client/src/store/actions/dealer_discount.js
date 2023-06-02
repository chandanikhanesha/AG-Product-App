import axios from 'axios';
import {
  LIST_DEALER_DISCOUNTS,
  CREATE_DEALER_DISCOUNT_SUCCESS,
  UPDATE_DEALER_DISCOUNT_SUCCESS,
  DELETE_DEALER_DISCOUNT_SUCCESS,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listDealerDiscounts = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().dealerDiscountReducer,
      LIST_DEALER_DISCOUNTS,
      'dealer_discounts',
      'dealer_discounts/last_update',
      dispatch,
    );
    // const dealerDiscountsStatus = getState().dealerDiscountReducer.loadingStatus
    // if (force || isUnloaded(dealerDiscountsStatus)) {
    //   dispatch(apiActionBuilder.get({
    //     types: LIST_DEALER_DISCOUNTS,
    //     url: 'dealer_discounts'
    //   }))
    // }
  };
};

export const createDealerDiscount = (data) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/dealer_discounts`, data, _authHeaders()).then((response) => {
      return dispatch({
        type: CREATE_DEALER_DISCOUNT_SUCCESS,
        payload: response.data,
      });
    });
  };
};

export const updateDealerDiscount = (dealerDiscountId, data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/dealer_discounts/${dealerDiscountId}`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_DEALER_DISCOUNT_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteDealerDiscount = (dealerDiscountId) => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/dealer_discounts/${dealerDiscountId}`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: DELETE_DEALER_DISCOUNT_SUCCESS,
          payload: dealerDiscountId,
        });
      });
  };
};
