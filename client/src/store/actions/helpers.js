import set from 'lodash/set';

export const _authHeaders = () => {
  return { headers: { 'x-access-token': localStorage.getItem('authToken') } };
};

/**
 * @typedef {object} ApiActionTypes
 * @property {string} REQUEST - Request action type
 * @property {string} COMMIT - Commit action type
 * @property {string} ROLLBACK - Rollback action type
 */

/**
 * Build redux-offline compatible action types
 * @param {string} type - Base string used to build action types
 * @returns {ApiActionTypes} Action types generated from base type string
 */
export const buildOfflineTypes = (type) => ({
  REQUEST: `${type}.REQUEST`,
  COMMIT: `${type}.COMMIT`,
  ROLLBACK: `${type}.ROLLBACK`,
});

const buildApiAction = ({ id, types, url, body, method, meta, query }) => {
  const { REQUEST, COMMIT, ROLLBACK } = types;
  let link = query ? `${process.env.REACT_APP_API_BASE}/${url}${query}` : `${process.env.REACT_APP_API_BASE}/${url}`;
  return {
    type: REQUEST,
    payload: body,
    meta: {
      ...meta,
      id,
      offline: {
        effect: {
          method,
          url: link,
          headers: { 'x-access-token': localStorage.getItem('authToken') },
        },
        commit: {
          type: COMMIT,
          meta: { ...meta, id },
        },
        rollback: {
          type: ROLLBACK,
          meta: { ...meta, id },
        },
      },
    },
  };
};

const buildApiActionWithBody = ({ body, ...params }) => {
  const apiAction = buildApiAction(params);
  return set(apiAction, 'meta.offline.effect.body', JSON.stringify(body));
};

/**
 * Parameters used to build redux-offline API actions
 * @typedef {object} ApiActionParams
 * @property {ApiActionTypes} types
 * @property {string} url - URL extension of the base API path
 * @property {object} [meta] - Additional meta properties to attach to the REQUEST, COMMIT & ROLLBACK actions
 * @property {object} [body] - Request body; only used in POST, PUT, & PATCH requests
 */

export const apiActionBuilder = {
  /**
   * Builds a redux-offline compatible action to perform a GET request
   * @param {ApiActionParams} params - Parameters used to build redux-offline API actions
   */
  get: (params) => buildApiAction({ method: 'GET', ...params }),
  /**
   * Builds a redux-offline compatible action to perform a DELETE request
   * @param {ApiActionParams} params - Parameters used to build redux-offline API actions
   */
  delete: (params) => buildApiAction({ method: 'DELETE', ...params }),

  /**
   * Builds a redux-offline compatible action to perform a POST request
   * @param {ApiActionParams} params - Parameters used to build redux-offline API actions
   */
  post: (params) => buildApiActionWithBody({ method: 'POST', ...params }),
  /**
   * Builds a redux-offline compatible action to perform a PUT request
   * @param {ApiActionParams} params - Parameters used to build redux-offline API actions
   */
  put: (params) => buildApiActionWithBody({ method: 'PUT', ...params }),
  /**
   * Builds a redux-offline compatible action to perform a PATCH request
   * @param {ApiActionParams} params - Parameters used to build redux-offline API actions
   */
  patch: (params) => buildApiActionWithBody({ method: 'PATCH', ...params }),
};

buildOfflineTypes();
