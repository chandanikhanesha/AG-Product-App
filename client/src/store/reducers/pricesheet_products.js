import { LoadingStatus, LIST_PRICESHEET_PRODUCTS, UPDATE_PRICESHEET_PRODUCT_SUCCESS } from '../../store/constants';

const initialState = {
  pricesheetproducts: [],
  loadingStatus: LoadingStatus.Unloaded,
  organizationId: localStorage.getItem('organizationId'),
};

let pricesheetProductReducer = (state = initialState, { type, payload }) => {
  switch (type) {
    case LIST_PRICESHEET_PRODUCTS:
      return {
        ...state,
        pricesheetproducts: payload.monsantoProduct,
      };

    case UPDATE_PRICESHEET_PRODUCT_SUCCESS:
      return Object.assign({}, state, {
        pricesheetproducts: state.pricesheetproducts.map((p) => (p.id === payload.id ? payload : p)),
      });

    default:
      return state;
  }
};
// switch (type) {
//   case LIST_PRICESHEET_PRODUCTS:
//     return Object.assign({}, state, payload);

//   default:
//     return state
// }

export default pricesheetProductReducer;
