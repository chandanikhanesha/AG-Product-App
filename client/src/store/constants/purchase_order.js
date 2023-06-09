import { buildOfflineTypes } from '../actions/helpers';

export const LIST_PURCHASE_ORDERS = buildOfflineTypes('LIST_PURCHASE_ORDERS');
export const CREATE_PURCHASE_ORDER_SUCCESS = 'CREATE_PURCHASE_ORDER_SUCCESS';
export const UPDATE_PURCHASE_ORDER_SUCCESS = 'UPDATE_PURCHASE_ORDER_SUCCESS';
export const DELETE_PURCHASE_ORDER_SUCCESS = 'DELETE_PURCHASE_ORDER_SUCCESS';
export const CONVERT_QUOTE_TO_EXISTING_PO_SUCCESS = 'CONVERT_QUOTE_TO_EXISTING_PO_SUCCESS';
export const GET_PURCHASE_ORDER_SUCCESS = 'GET_PURCHASE_ORDER_SUCCESS';
export const GET_PURCHASE_ORDER_ERROR = 'GET_PURCHASE_ORDER_ERROR';
