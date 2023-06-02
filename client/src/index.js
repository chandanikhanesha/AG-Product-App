import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import '@fortawesome/fontawesome-free/css/all.css';
import App from './components/app';
import { unregister } from './registerServiceWorker';

import configureStore from './store/configureStore';

configureStore((store) => {
  ReactDOM.render(React.createElement(App, { store }), document.getElementById('root'));
});
unregister();
