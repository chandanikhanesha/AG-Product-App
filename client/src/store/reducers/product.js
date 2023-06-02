import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_PRODUCTS,
  CREATE_PRODUCT_SUCCESS,
  DELETE_PRODUCT_SUCCESS,
  UPDATE_PRODUCT_SUCCESS,
  DELETE_SEED_COMPANY_SUCCESS,
} from '../../store/constants';

const initialState = {
  products: [],
  loadingStatus: LoadingStatus.Unloaded,
  recentCreatedProductId: null,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let productReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        LoadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_PRODUCTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };

    case LIST_PRODUCTS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        products: payload.items,
        lastUpdate: payload.lastUpdate,
      };

    case LIST_PRODUCTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_PRODUCT_SUCCESS:
      return Object.assign(
        {},
        {
          products: [...state.products, payload],
        },
      );

    case UPDATE_PRODUCT_SUCCESS:
      return Object.assign(
        {},
        {
          products: state.products.map((p) => (p.id === payload.id ? payload : p)),
        },
      );

    case DELETE_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        products: state.products.filter((product) => product.id !== payload.id),
      });

    case DELETE_SEED_COMPANY_SUCCESS:
      return Object.assign({}, state, {
        products: state.products.filter((p) => p.seedCompanyId !== payload.id),
      });

    default:
      return state;
  }
};

export default productReducer;
