import React, { Component } from 'react';
import { Route } from 'react-router-dom';

import Layout from '.';
import Admin from './admin';

class PrivateApp extends Component {
  render() {
    return (
      <React.Fragment>
        <Route path="/app/admin" component={Admin} />
        <Route path="/app" component={Layout} />
      </React.Fragment>
    );
  }
}

export default PrivateApp;
