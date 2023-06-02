import { LOAD_ORGANIZATION_SUCCESS, UPDATE_ORGANIZATION_SUCCESS } from '../constants';

const initialState = {
  name: '',
  address: '',
  email: '',
  logo: '',
  phoneNumber: '',
  businessStreet: '',
  businessCity: '',
  businessState: '',
  businessZip: '',
  hiddenLots: [],
  daysToInvoiceDueDateDefault: null,
  subscription: null,
  subscriptionPlan: [],
  stripCustomerId: '',
  message: '',
};

let organizationReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_ORGANIZATION_SUCCESS:
      return Object.assign({}, state, {
        ...action.payload.organization,
        subscription: action.payload.subscription,
        // subscriptionPlan: JSON.parse(action.payload.subscription.planNames),
        subscriptionPlan:
          action.payload.subscription.length > 0
            ? JSON.parse(action.payload.subscription.planNames)
            : ['Seed Company', 'Regular Company', 'Bayer API Connectivity', 'Advanced Purchase Order'],
        // uncommnet this code when you get back the subscription
        // subscriptionPlan: ['Seed Company', 'Regular Company', 'Bayer API Connectivity', 'Advanced Purchase Order'],
      });
    case UPDATE_ORGANIZATION_SUCCESS:
      return Object.assign({}, state, { ...action.payload.organization });
    default:
      return state;
  }
};

export default organizationReducer;
