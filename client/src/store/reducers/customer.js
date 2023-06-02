import { metaId, getLastUpdatedDate } from '../../utilities';
import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_CUSTOMERS,
  CREATE_CUSTOMER,
  DELETE_CUSTOMER_SUCCESS,
  UPDATE_CUSTOMER_SUCCESS,
  REMOVE_RECENT_CREATED_CUSTOMER,
  CREATE_CUSTOMER_FROM_CSV,
  CHANGE_IMPORTED,
} from '../../store/constants';

const initialState = {
  customers: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  recentCreatedCustomerMetaId: null,
  recentCreatedCustomerId: null,
  imported: false,
  totalItems: null,
  totalPages: null,
};

let customerReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        totalItems: action.payload.customerReducer ? action.payload.customerReducer.totalItems : state.totalItems,
        totalPages: action.payload.customerReducer ? action.payload.customerReducer.totalPages : state.totalPages,
        customers: action.payload.customerReducer ? action.payload.customerReducer.customers : state.customers,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_CUSTOMERS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_CUSTOMERS.COMMIT:
      return {
        ...state,
        customers: action.payload.customersdata,
        imported: false,
        loadingStatus: LoadingStatus.Loaded,
        lastUpdate: getLastUpdatedDate(action.payload.customersdata),
        totalItems: action.payload.totalItems,
        totalPages: action.payload.totalPages,
      };
    case LIST_CUSTOMERS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_CUSTOMER.REQUEST:
      return {
        ...state,
        recentCreatedCustomerMetaId: action.meta.id,
        customers: [
          {
            ...action.payload,
            meta: {
              pending: true,
              id: action.meta.id,
            },
          },
          ...state.customers,
        ],
      };
    case CREATE_CUSTOMER.COMMIT:
      return {
        ...state,
        recentCreatedCustomerId: action.payload.id,
        customers: [
          {
            ...action.payload,
            meta: {
              pending: false,
              id: action.meta.id,
            },
          },
          ...state.customers.filter((customer) => metaId(customer) !== action.meta.id),
        ],
      };
    case CREATE_CUSTOMER.ROLLBACK:
      return {
        ...state,
        customers: state.customers.filter((customer) => metaId(customer) !== action.meta.id),
      };

    case DELETE_CUSTOMER_SUCCESS:
      return Object.assign({}, state, {
        customers: state.customers.filter((c) => c.id !== action.payload),
      });
    case UPDATE_CUSTOMER_SUCCESS:
      return Object.assign({}, state, {
        customers:
          action.payload && action.payload.isArchive === true
            ? state.customers.filter((c) => c.id !== action.payload.id)
            : state.customers.map((c) => (c.id === action.payload.id ? action.payload : c)),
        lastUpdate: action.payload.updatedAt,
      });
    case REMOVE_RECENT_CREATED_CUSTOMER:
      return {
        ...state,
        recentCreatedCustomerMetaId: null,
      };
    case CREATE_CUSTOMER_FROM_CSV.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case CREATE_CUSTOMER_FROM_CSV.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        imported: true,
        lastUpdate: getLastUpdatedDate(action.payload),
      };
    case CREATE_CUSTOMER_FROM_CSV.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };
    case CHANGE_IMPORTED:
      return {
        ...state,
        imported: false,
      };
    default:
      return state;
  }
};

export default customerReducer;
