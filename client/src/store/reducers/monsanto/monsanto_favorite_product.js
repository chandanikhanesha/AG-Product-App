import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_MONSANTO_FAVORITE_PRODUCTS,
  CREATE_MONSANTO_FAVORITE_PRODUCT_SUCCESS,
  DELETE_MONSANTO_FAVORITE_PRODUCT_SUCCESS,
} from '../../constants';

const initialState = {
  monsantoFavoriteProducts: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
  organizationId: localStorage.getItem('organizationId'),
};

let productReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case LIST_MONSANTO_FAVORITE_PRODUCTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_MONSANTO_FAVORITE_PRODUCTS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        monsantoFavoriteProducts: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_MONSANTO_FAVORITE_PRODUCTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case CREATE_MONSANTO_FAVORITE_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        monsantoFavoriteProducts: [...state.monsantoFavoriteProducts, ...action.payload],
      });
    case DELETE_MONSANTO_FAVORITE_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        monsantoFavoriteProducts: state.monsantoFavoriteProducts.filter((p) => p.id !== action.payload.id),
      });
    default:
      return state;
  }
};

export default productReducer;
