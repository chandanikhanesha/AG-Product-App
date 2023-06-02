import * as constants from '../constants';

export const clearNotification = (notificationId) => {
  return {
    type: constants.CLEAR_NOTIFICATION,
    payload: notificationId,
  };
};

export const addNotification = (newNotification) => {
  return {
    type: constants.ADD_NOTIFICATION,
    payload: newNotification,
  };
};

export const clearNotifications = () => {
  return {
    type: constants.CLEAR_ALL_NOTIFICATION,
  };
};
