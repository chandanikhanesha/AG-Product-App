import {
  LIST_BACKUP_DEALER_DISCOUNTS,
  LIST_BACKUP_CUSTOMER,
  LIST_BACKUP_CUSTOMER_HISTORY,
} from '../../store/constants';
import { _authHeaders } from './helpers';
import axios from 'axios';

import { cachedListAction } from '../../utilities';

export const listBackupDealerDiscounts = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().backupDiscountReducer,
      LIST_BACKUP_DEALER_DISCOUNTS,
      'backup_data/backup_discount',
      'backup_data/backup_discount/last_update',
      dispatch,
    );
  };
};

export const listBackupCustomer = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().backupCustomerReducer,
      LIST_BACKUP_CUSTOMER,
      'backup_data/backup_customer',
      'backup_data/backup_customer/last_update',
      dispatch,
    );
  };
};
export const listBackupCustomerHistory = (force = false) => {
  return (dispatch, getState) => {
    cachedListAction(
      force,
      getState().backupCustomerHistoryReducer,
      LIST_BACKUP_CUSTOMER_HISTORY,
      'backup_data/backup_customer_history',
      'backup_data/backup_customer_history/last_update',
      dispatch,
    );
  };
};

//${process.env.REACT_APP_API_BASE}/invoiceSend/inovice-download
// http://localhost:4000/inovice-download

export const createBackupPdf = (orgName, orgId, customersData) => {
  return (dispatch) => {
    return axios
      .post(
        `${process.env.REACT_APP_API_BASE}/invoiceSend/inovice-download`,
        { orgName, orgId, customersData },
        _authHeaders(),
      )
      .then((response) => {
        console.log(response);
        return response;
      })
      .catch((e) => {
        console.log(e, 'Error in backup');
      });
  };
};

export const deleteAllRecord = () => {
  return (dispatch) => {
    return axios
      .delete(`${process.env.REACT_APP_API_BASE}/backup_data/deleteAll`, _authHeaders())
      .then((response) => {
        return response;
      })
      .catch((e) => {
        console.log(e, 'Error in delte all record');
      });
  };
};
