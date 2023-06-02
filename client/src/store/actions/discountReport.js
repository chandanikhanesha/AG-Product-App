import axios from 'axios';
import { LIST_DISCOUNT_REPORTS, DOWANLOAD_DISCOUNT_REPORT } from '../../store/constants';
import { _authHeaders } from './helpers';
import { cachedListAction } from '../../utilities';

export const listDiscountReports = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().discountReportReducer,
      LIST_DISCOUNT_REPORTS,
      'discountReport',
      'discountReport/last_update',
      dispatch,
    );
  };
};

export const createDiscounReport = (data) => {
  return (dispatch) => {
    return axios.post(`${process.env.REACT_APP_API_BASE}/discountReport`, data, _authHeaders()).then((response) => {
      return dispatch(listDiscountReports());
    });
  };
};

export const downloadDiscountReport = () => {
  return (dispatch) => {
    return axios
      .get(`${process.env.REACT_APP_API_BASE}/discountReport/generateReport`, _authHeaders())
      .then((response) => {
        return dispatch({
          type: DOWANLOAD_DISCOUNT_REPORT,
          payload: response.data,
        });
      })
      .catch((error) => {
        console.log(error, 'error');
      });
  };
};
