import React, { Component } from 'react';
import moment from 'moment';

import { withStyles, Grid } from '@material-ui/core';

import { invoiceHeaderStyles } from './invoice_header.styles';

class InvoiceHeader extends Component {
  state = {};

  componentDidMount = () => {};

  render() {
    const { classes, organization, statementNo, purchaseOrder } = this.props;
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
              <div>
                <p>PO BOX 356</p>
                <p>MIINDEN NE 68959</p>
              </div>
            </Grid>
            <Grid item xs={4} />
            <Grid item xs={4} className={classes.invoiceTitle}>
              <h1>Invoice</h1>
            </Grid>
          </Grid>
          <Grid container spacing={0} className={classes.gridStyles}>
            <Grid item xs={8} />
            <Grid container xs={4} direction="row">
              <Grid item xs={6} className={classes.gridBorder}>
                <p>Ph: 1-308-832-0220</p>
                <p>Fax: 1-308-832-1340</p>
              </Grid>
              <Grid container xs={3} direction="column">
                <Grid item className={classes.gridBorderMiddleTop}>
                  Date
                </Grid>
                <Grid item className={classes.gridBorderMiddleBottom}>
                  {moment.utc(purchaseOrder.createdAt).format('MM/DD/YYYY')}
                </Grid>
              </Grid>
              <Grid container xs={3} direction="column">
                <Grid item className={classes.gridBorderRightTop}>
                  Invoice #
                </Grid>
                <Grid item className={classes.gridBorderRightBottom}>
                  {`#${statementNo}`}
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid container spacing={0} className={classes.gridStyles}>
            <Grid item xs={4} />
            <Grid container xs={3} direction="column">
              <Grid item className={classes.gridBorderTop}>
                Bill To
              </Grid>
              <Grid item className={classes.gridBorderBottom}>
                <p>SHAWN SULLIVAN</p>
                <p>74971 AVE, 358</p>
                <p>WALLACE NE 69169</p>
              </Grid>
            </Grid>
            <Grid item xs={2} />
            <Grid container xs={3} direction="column">
              <Grid item className={classes.gridBorderTop}>
                Ship To
              </Grid>
              <Grid item className={classes.gridBorderBottom}>
                <p>SHAWN SULLIVAN</p>
                <p>74971 AVE, 358</p>
                <p>WALLACE NE 69169</p>
              </Grid>
            </Grid>
          </Grid>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(invoiceHeaderStyles)(InvoiceHeader);
