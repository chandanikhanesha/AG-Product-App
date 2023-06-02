import React, { Component } from 'react';

import { withStyles } from '@material-ui/core';

import { statementStyles } from './statement.styles';

//import ActionBar from "./action_bar";
import StatementPresenter from './action_bar';

class Statement extends Component {
  state = {};

  render() {
    return <StatementPresenter />;
  }
}

export default withStyles(statementStyles)(Statement);
