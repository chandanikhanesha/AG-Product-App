import axios from 'axios';
import {
  LIST_MONSANTO_FAVORITE_PRODUCTS,
  CREATE_MONSANTO_FAVORITE_PRODUCT_SUCCESS,
  DELETE_MONSANTO_FAVORITE_PRODUCT_SUCCESS,
} from '../../constants';
import { _authHeaders } from '../helpers';
import { cachedListAction } from '../../../utilities';

export const listMonsantoFavoriteProducts = (force = false) => {
  return (dispatch, getState) => {
    return cachedListAction(
      force,
      getState().monsantoFavoriteProductReducer,
      LIST_MONSANTO_FAVORITE_PRODUCTS,
      'monsanto/monsanto_favorite_products',
      'monsanto/monsanto_favorite_products/last_update',
      dispatch,
    );
  };
};

export const createMonsantoFavoriteProducts = (apiSeedCompanyId, products) => {
  return (dispatch) => {
    return axios
      .post(
        `${process.env.REACT_APP_API_BASE}/monsanto/monsanto_favorite_products`,
        {
          apiSeedCompanyId,
          products,
        },
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: CREATE_MONSANTO_FAVORITE_PRODUCT_SUCCESS,
          payload: response.data,
        });
      });
  };
};

export const deleteMonsantoFavoriteProduct = (monsantoFavoriteProductId) => {
  return (dispatch) => {
    return axios
      .delete(
        `${process.env.REACT_APP_API_BASE}/monsanto/monsanto_favorite_products/${monsantoFavoriteProductId}`,
        _authHeaders(),
      )
      .then((response) => {
        return dispatch({
          type: DELETE_MONSANTO_FAVORITE_PRODUCT_SUCCESS,
          payload: monsantoFavoriteProductId,
        });
      });
  };
};
