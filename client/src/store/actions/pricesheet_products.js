import axios from 'axios';
import { LIST_PRICESHEET_PRODUCTS, UPDATE_PRICESHEET_PRODUCT_SUCCESS } from '../../store/constants';
import { _authHeaders } from './helpers';

export const listPricesheetProducts = () => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_BASE}/monsanto/pricesheet/getPriceSheet`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: LIST_PRICESHEET_PRODUCTS,
          payload: response.data,
        });
      });
  };
};

export const updatePricesheetProduct = (data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/monsanto/pricesheet/patchPriceSheet`, data, _authHeaders())
      .then((response) => {
        return dispatch({
          type: UPDATE_PRICESHEET_PRODUCT_SUCCESS,
          payload: response.data,
        });
      });
  };
};
