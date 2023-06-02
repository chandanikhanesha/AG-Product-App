import React, { Component } from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';
import { createBrowserHistory } from 'history';

import { MuiThemeProvider, createTheme } from '@material-ui/core/styles';

import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';

import Routes from '../layout/routes';
import agriDealerGreenImage from '../../assets/img/agridealer-all-green.png';

import '../../assets/scss/material-dashboard-pro-react.css?v=1.2.0';

const hist = createBrowserHistory();

const theme = createTheme({
  palette: {
    primary: {
      light: '#85B354',
      main: '#38A154',
    },
    secondary: {
      extraLight: '#DDDDDD',
      light: '#CCCCCC',
      main: '#999',
      dark: '#605E5E',
    },
  },
  typography: {
    fontFamily: ['Nunito Sans', '"Helvetica Neue"', 'Arial', 'sans-serif'],
  },
});

class App extends Component {
  render() {
    return (
      <Provider store={this.props.store}>
        <MuiThemeProvider theme={theme}>
          <MuiPickersUtilsProvider utils={MomentUtils}>
            <div className="show-print print-logo-wrapper">
              <img className="print-logo" src={agriDealerGreenImage} />
            </div>
            <Router history={hist}>
              <Routes />
            </Router>
          </MuiPickersUtilsProvider>
        </MuiThemeProvider>
      </Provider>
    );
  }
}

export default App;
