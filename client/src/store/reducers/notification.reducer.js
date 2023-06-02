import { CLEAR_ALL_NOTIFICATION, CLEAR_NOTIFICATION, ADD_NOTIFICATION } from '../constants';

const initialState = {
  notifications: [],
};

let notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.concat([action.payload]),
      };
    case CLEAR_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter((notification) => notification.id !== action.payload),
      };
    case CLEAR_ALL_NOTIFICATION:
      return initialState;
    default:
      return state;
  }
};

export default notificationReducer;
