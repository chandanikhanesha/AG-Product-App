import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  LIST_MONSANTO_PRODUCTS,
  UPDATE_MONSANTO_PRODUCT_CURRENT_SEED_COMPANY_ID,
  UPDATE_MONSANTO_PRODUCT_CURRENT_CROP_TYPE,
  UPDATE_MONSANTO_PRODUCT_CURRENT_ZONE_IDS,
  UPDATE_MONSANTO_PRODUCT,
} from '../../../store/constants';

const initialState = {
  seedCompanyId: null,
  cropType: null,
  monsantoProducts: [],
  zoneIds: [],
  loadingStatus: LoadingStatus.Unloaded,
  lastUpdate: null,
};

let monsantoProductReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    case UPDATE_MONSANTO_PRODUCT_CURRENT_SEED_COMPANY_ID:
      return {
        ...state,
        seedCompanyId: action.payload,
      };

    case UPDATE_MONSANTO_PRODUCT_CURRENT_ZONE_IDS:
      return {
        ...state,
        zoneIds: action.payload,
      };

    case UPDATE_MONSANTO_PRODUCT_CURRENT_CROP_TYPE:
      return {
        ...state,
        cropType: action.payload,
      };
    case UPDATE_MONSANTO_PRODUCT:
      return {
        ...state,
        monsantoProducts: action.payload,
      };

    case LIST_MONSANTO_PRODUCTS.REQUEST:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loading,
      };
    case LIST_MONSANTO_PRODUCTS.COMMIT:
      return {
        ...state,
        loadingStatus: LoadingStatus.Loaded,
        monsantoProducts: action.payload.items,
        lastUpdate: action.payload.lastUpdate,
      };
    case LIST_MONSANTO_PRODUCTS.ROLLBACK:
      return {
        ...state,
        loadingStatus: LoadingStatus.Unloaded,
      };

    default:
      return state;
  }
};

export default monsantoProductReducer;
