import React, { Component } from 'react';

import { withStyles, Grid } from '@material-ui/core';
import { format } from 'date-fns';

import { statementHeaderStyles } from './statement_header.styles';

class StatementHeader extends Component {
  state = {};

  componentDidMount = () => {};

  render() {
    const { classes, organization, statement } = this.props;
    return (
      <React.Fragment>
        <div className={classes.root}>
          <Grid container spacing={16} className={classes.invoiceHeader}>
            <Grid item xs={4}>
              <img
                className={classes.logo}
                alt={organization.logo}
                src={`${process.env.REACT_APP_DO_BUCKET}/${organization.logo}`}
              />
            </Grid>
            <Grid item xs={4}>
              <h1>Statement</h1>
              <p>MINDEN NE 68959</p>
              <p>1302 K ROAD</p>
            </Grid>
            <Grid item xs={4} className={classes.invoiceTitle}>
              <img
                className={classes.logo}
                alt={organization.logo}
                src={`${process.env.REACT_APP_DO_BUCKET}/${organization.logo}`}
              />
            </Grid>
            <Grid item xs={4}>
              <p>1-308-832-0220</p>
              <p>Fax 1-308-832-1340</p>
            </Grid>
            <Grid container xs={4} />
            <Grid container xs={4} direction="column">
              <Grid item className={classes.gridBorderTop}>
                Date
              </Grid>
              <Grid item className={classes.gridBorderBottom}>
                {format(statement.startDate, 'MM/DD/YYYY')}
              </Grid>
            </Grid>
            <Grid item xs={4}>
              <p>SHAWN SULLIVAN</p>
              <p>74971 AVE, 358</p>
              <p>WALLACE NE 69169</p>
            </Grid>
          </Grid>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(statementHeaderStyles)(StatementHeader);
