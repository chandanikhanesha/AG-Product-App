import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import PagesHeader from '../../../components/public/pages-header';
import Footer from '../../../components/public/footer';

import publicRoutes from './public_routes';

import pagesStyle from '../../../assets/jss/material-dashboard-pro-react/layouts/pagesStyle';

import bgImage from '../../../assets/img/background.jpg';

class PublicLayout extends Component {
  constructor(props) {
    super(props);

    this.goToApp = this.goToApp.bind(this);
    this.logOut = this.logOut.bind(this);
    this.goToLogIn = this.goToLogIn.bind(this);
  }

  get userIsLoggedIn() {
    return localStorage.getItem('authToken') !== null;
  }

  componentDidMount() {
    if (this.userIsLoggedIn) {
      this.props.history.push('/app/customers');
    }
  }

  goToApp() {
    return this.props.history.push('/app/home');
  }

  logOut() {
    //localStorage.removeItem('authToken')
    localStorage.clear();
    return this.props.history.push('/');
  }

  goToLogIn() {
    return this.props.history.push('/log_in');
  }

  render() {
    const { classes, ...rest } = this.props;

    return (
      <div>
        <PagesHeader {...rest} />
        <div className={classes.wrapper} ref="wrapper">
          <div className={classes.fullPage}>
            <Switch>
              {publicRoutes.map((prop, key) => {
                return <Route path={prop.path} component={prop.component} exact={prop.exact === true} key={key} />;
              })}
            </Switch>
            <Footer white />
            <div className={classes.fullPageBackground} style={{ backgroundImage: 'url(' + bgImage + ')' }} />
          </div>
        </div>
      </div>
    );
  }
}

PublicLayout.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(pagesStyle)(PublicLayout);
