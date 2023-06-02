import { cachedListAction } from '../../../utilities';
import axios from 'axios';
import {
  LIST_MONSANTO_PRODUCTS,
  UPDATE_MONSANTO_PRODUCT_CURRENT_SEED_COMPANY_ID,
  UPDATE_MONSANTO_PRODUCT_CURRENT_CROP_TYPE,
  UPDATE_MONSANTO_PRODUCT_CURRENT_ZONE_IDS,
  UPDATE_MONSANTO_PRODUCT,
} from '../../constants';
import { _authHeaders } from '../helpers';

const PRICESHEET_URL = `${process.env.REACT_APP_API_BASE}/monsanto/pricesheet`;

export const listMonsantoProducts = (queryParams, force = true) => {
  return (dispatch, getState) => {
    // const reducer = getState().monsantoProductReducer;
    // const isDifferentSeedCompany = queryParams.seedCompanyId !== reducer.seedCompanyId;
    // const isDifferentCropType = queryParams.cropType !== reducer.cropType;
    // let force = isDifferentSeedCompany || isDifferentCropType;

    return cachedListAction(
      force,
      getState().monsantoProductReducer,
      LIST_MONSANTO_PRODUCTS,
      'monsanto/products',
      'monsanto/products/last_update',
      dispatch,
      queryParams,
    );
  };
};

export const updateCurrentSeedCompany = (seedCompanyId) => {
  return (dispatch) => {
    dispatch({
      type: UPDATE_MONSANTO_PRODUCT_CURRENT_SEED_COMPANY_ID,
      payload: seedCompanyId,
    });
  };
};

export const updateCurrentCropType = (cropType) => {
  return (dispatch) => {
    dispatch({
      type: UPDATE_MONSANTO_PRODUCT_CURRENT_CROP_TYPE,
      payload: cropType,
    });
  };
};

export const fetchZoneIds = (cropType) => {
  return (dispatch, getState) => {
    return axios.get(`${PRICESHEET_URL}?cropType=${cropType}`, _authHeaders()).then((response) => {
      return dispatch({
        type: UPDATE_MONSANTO_PRODUCT_CURRENT_ZONE_IDS,
        payload: response.data,
      });
    });
  };
};

export const updateMonsantoProduct = (data) => {
  return (dispatch) => {
    return axios
      .patch(`${process.env.REACT_APP_API_BASE}/monsanto/products/update_monsanto_lot`, data, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        return dispatch({
          type: UPDATE_MONSANTO_PRODUCT,
          payload: response.data.items,
        });
      });
  };
};
