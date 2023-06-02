import axios from 'axios';
import { cachedListAction } from '../../../utilities';
import {
  LIST_MONSANTO_RETAILER_SUMMARY,
  UPDATE_ROS_CURRENT_SEED_COMPANY_ID,
  UPDATE_ROS_CURRENT_CROP_TYPE,
  UPDATE_MONSANTO_RETAILER_SUMMARY_FILTERS,
} from '../../constants';
// import {_authHeaders} from '../helpers';

// const BASE_URL = `${process.env.REACT_APP_API_BASE}/monsanto/products`;

//

export const listRetailerOrderSummary = (queryParams) => {
  return (dispatch, getState) => {
    const reducer = getState().monsantoRetailerOrderSummaryReducer;
    const isDifferentSeedCompany = queryParams.seedCompanyId !== reducer.seedCompanyId;
    const isDifferentCropType = queryParams.cropType !== reducer.cropType;
    let force = isDifferentSeedCompany || isDifferentCropType;
    return cachedListAction(
      force,
      reducer,
      LIST_MONSANTO_RETAILER_SUMMARY,
      'monsanto/retailer_orders/summary',
      'monsanto/retailer_orders/last_update',
      dispatch,
      queryParams,
    );
  };
};

export const updateCurrentSeedCompany = (seedCompanyId) => {
  return (dispatch) => {
    dispatch({
      type: UPDATE_ROS_CURRENT_SEED_COMPANY_ID,
      payload: seedCompanyId,
    });
  };
};

export const updateCurrentCropType = (cropType) => {
  return (dispatch) => {
    dispatch({
      type: UPDATE_ROS_CURRENT_CROP_TYPE,
      payload: cropType,
    });
  };
};

export const updateRetailerOrderSummaryFilters = ({ seedCompanyId, cropType }) => {
  return (dispatch) => {
    dispatch({
      type: UPDATE_MONSANTO_RETAILER_SUMMARY_FILTERS,
      payload: { seedCompanyId, cropType },
    });
  };
};

export const checkMonsantoProductsSyncState = ({ seedCompanyId }) => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_BASE}/monsanto/sync/inventory?seedCompanyId=${seedCompanyId}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => response.data);
  };
};
