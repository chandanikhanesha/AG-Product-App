import {
  LoadingStatus,
  PERSIST_REHYDRATE,
  SIGN_IN_SUCCESS,
  LIST_USERS,
  DELETE_USER_SUCCESS,
  ACCEPT_INVITE_SUCCESS,
  UPDATE_USER_SUCCESS,
} from '../constants';

const initialState = {
  authToken: localStorage.getItem('authToken'),
  firstName: localStorage.getItem('firstName'),
  lastName: localStorage.getItem('lastName'),
  id: localStorage.getItem('id'),
  isAdmin: localStorage.getItem('isAdmin'),
  isSuperAdmin: localStorage.getItem('isSuperAdmin'),
  organizationId: localStorage.getItem('organizationId'),
  users: [],
  usersStatus: LoadingStatus.Unloaded,
  role: localStorage.getItem('role'),
};

let userReducer = (state = initialState, action) => {
  switch (action.type) {
    case PERSIST_REHYDRATE:
      return {
        ...state,
        usersStatus: LoadingStatus.Unloaded,
      };

    case SIGN_IN_SUCCESS:
      localStorage.setItem('authToken', action.payload.authToken);
      localStorage.setItem('firstName', action.payload.firstName);
      localStorage.setItem('lastName', action.payload.lastName);
      localStorage.setItem('isAdmin', action.payload.isAdmin);
      localStorage.setItem('isSuperAdmin', action.payload.isSuperAdmin);
      localStorage.setItem('organizationId', action.payload.organizationId);
      localStorage.setItem('id', action.payload.id);
      localStorage.setItem('role', action.payload.role);
      localStorage.setItem('userEmail', action.payload.email);
      return Object.assign({}, state, {
        authToken: action.payload.authToken,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        id: action.payload.id,
        isAdmin: action.payload.isAdmin,
        isSuperAdmin: action.payload.isSuperAdmin,
        organizationId: action.payload.organizationId,
        role: action.payload.role,
      });

    case LIST_USERS.REQUEST:
      return {
        ...state,
        usersStatus: LoadingStatus.Loading,
      };
    case LIST_USERS.COMMIT:
      return {
        ...state,
        usersStatus: LoadingStatus.Loaded,
        users: action.payload,
      };
    case LIST_USERS.ROLLBACK:
      return {
        ...state,
        usersStatus: LoadingStatus.Unloaded,
      };

    case DELETE_USER_SUCCESS:
      return Object.assign({}, state, {
        users: state.users.filter((user) => user.id !== action.payload),
      });
    case ACCEPT_INVITE_SUCCESS:
      localStorage.setItem('authToken', action.payload.authToken);
      localStorage.setItem('firstName', action.payload.firstName);
      localStorage.setItem('lastName', action.payload.lastName);
      localStorage.setItem('organizationId', action.payload.organizationId);
      localStorage.setItem('isAdmin', action.payload.isAdmin);
      localStorage.setItem('isSuperAdmin', action.payload.isSuperAdmin);
      localStorage.setItem('id', action.payload.id);
      localStorage.setItem('role', action.payload.role);
      return Object.assign({}, state, {
        users: state.users.map((user) => (user.id === action.payload.id ? action.payload : user)),
        authToken: action.payload.authToken,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        id: action.payload.id,
        isAdmin: action.payload.isAdmin,
        isSuperAdmin: action.payload.isSuperAdmin,
        organizationId: action.payload.organizationId,
        role: action.payload.role,
      });
    case UPDATE_USER_SUCCESS:
      localStorage.setItem('firstName', action.payload.firstName);
      localStorage.setItem('lastName', action.payload.lastName);
      return Object.assign({}, state, {
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
      });
    default:
      return state;
  }
};

export default userReducer;
