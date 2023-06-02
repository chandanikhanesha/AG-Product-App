import { createStore, applyMiddleware } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';
import { offline } from '@redux-offline/redux-offline';
import defaultOffline from '@redux-offline/redux-offline/lib/defaults';
import defaultQueue from '@redux-offline/redux-offline/lib/defaults/queue';
import thunkMiddleware from 'redux-thunk';
import get from 'lodash/get';
import reducers from './reducers';

let globalStore;
export const getStore = () => {
  return globalStore;
};

export default (cb) => {
  const offlineConfig = {
    ...defaultOffline,
    persistCallback: renderWithStore,
    queue: {
      ...defaultQueue,
      discard(error, action) {
        const status = get(error, 'response.status');
        return (status >= 400 && status < 500) || get(action, 'meta.offline.effect.method') === 'GET';
      },
    },
    persistOptions: {
      blacklist: ['notificationReducer'],
    },
  };

  const store = createStore(reducers, composeWithDevTools(applyMiddleware(thunkMiddleware), offline(offlineConfig)));

  function renderWithStore() {
    globalStore = store;
    cb(store);
  }
};
