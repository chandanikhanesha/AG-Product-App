import React from 'react';
import { Route, Switch } from 'react-router-dom';

import PublicLayout from '../../components/public/layout';
import PrivateApp from './app';
import SnackBarContextual from '../../components/snackbar/snackbar_contextual';
import ServiceWorkerContextual from '../../components/service-worker/service_worker_contextual';

const Routes = () => {
  return (
    <React.Fragment>
      <Switch>
        <Route path="/app" component={PrivateApp} />
        <Route path="/" component={PublicLayout} />
        <Route path="/preview/customers/:customer_id/purchase_order/:id" component={PublicLayout} />
      </Switch>
      <SnackBarContextual />
      <ServiceWorkerContextual />
    </React.Fragment>
  );
};

export default Routes;
