import { buildOfflineTypes } from '../actions/helpers';

export const LIST_CUSTOMERS = buildOfflineTypes('LIST_CUSTOMERS');
export const CREATE_CUSTOMER = buildOfflineTypes('CREATE_CUSTOMER');
export const CREATE_CUSTOMER_FROM_CSV = buildOfflineTypes('CREATE_CUSTOMER_FROM_CSV');
export const DELETE_CUSTOMER_SUCCESS = 'DELETE_CUSTOMER_SUCCESS';
export const UPDATE_CUSTOMER_SUCCESS = 'UPDATE_CUSTOMER_SUCCESS';
export const REMOVE_RECENT_CREATED_CUSTOMER = 'REMOVE_RECENT_CREATED_CUSTOMER';
export const CHANGE_IMPORTED = 'CHANGE_IMPORTED';
