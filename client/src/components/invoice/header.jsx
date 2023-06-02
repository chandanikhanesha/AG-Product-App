import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core';

import InvoiceDatePicker from '../../components/invoice/invoiceDatePicker';
import InvoiceDueDate from '../../components/invoice/dueDate';

const styles = {
  logo: {
    maxHeight: '100px',
    maxWidth: '120px',
  },
  invoiceHeader: {
    marginTop: '18px',
    marginBottom: '18px',
    borderBottom: '3px solid',
  },
  invoiceTitle: {
    textAlign: 'right',
  },
  invoiceDetailsHeader: {
    width: 100,
    display: 'inline-block',
  },
};

const ToInfo = ({ to: { deliveryAddress, businessCity, businessState, email } }) => {
  const businessCityState = `${businessCity}, ${businessState}`;

  const _businessCityState = businessCityState !== ', ' && (
    <React.Fragment>
      {deliveryAddress} <br />
    </React.Fragment>
  );

  const _deliveryAddress = deliveryAddress && (
    <React.Fragment>
      {deliveryAddress} <br />
    </React.Fragment>
  );

  return (
    <p>
      {_businessCityState}
      {_deliveryAddress}
      {email}
    </p>
  );
};

class InvoiceHeader extends Component {
  get to() {
    const { selectedShareholder, customer } = this.props;
    return this.grower && selectedShareholder.id !== 'theCustomer' ? selectedShareholder : customer;
  }

  get grower() {
    const { selectedShareholder, customer } = this.props;
    return selectedShareholder ? customer : null;
  }

  render() {
    const { classes, organization, purchaseOrder, handleInvoiceDateChange, currentInvoiceDate, updateDaysToDueDate } =
      this.props;

    return (
      <React.Fragment>
        <Grid container spacing={16}>
          <Grid container spacing={16} className={classes.invoiceHeader}>
            <Grid item xs={4}>
              <img
                className={classes.logo}
                alt={organization.logo}
                src={`${process.env.REACT_APP_DO_BUCKET}/${organization.logo}`}
              />
            </Grid>
            <Grid item xs={4} />
            <Grid item xs={4} className={classes.invoiceTitle}>
              {purchaseOrder.isQuote ? <h1>Quote</h1> : <h1>Invoice</h1>}
            </Grid>
          </Grid>
          <Grid item xs={this.grower ? 3 : 4}>
            <h4>From</h4>
            <h3>{organization.name}</h3>
            <p>
              {organization.address}
              <br />
              {organization.email}
            </p>
          </Grid>
          <Grid item xs={this.grower ? 3 : 4}>
            <h4>To</h4>
            <h3>{this.to.name}</h3>
            <ToInfo to={this.to} />
          </Grid>
          {this.grower && (
            <Grid item xs={3}>
              <h4>Grower</h4>
              <h3>{this.grower.name}</h3>
              <ToInfo to={this.grower} />
            </Grid>
          )}
          <Grid item xs={this.grower ? 3 : 4}>
            <h4>&nbsp;</h4>
            <span className={classes.invoiceDetailsHeader}>{purchaseOrder.isQuote ? 'Quote:' : 'Invoice:'}</span>
            <span>{purchaseOrder.name}</span>
            <br />
            <span className={classes.invoiceDetailsHeader}>Date:</span>
            <InvoiceDatePicker
              currentInvoiceDate={currentInvoiceDate}
              handleInvoiceDateChange={handleInvoiceDateChange}
            />
            <br />
            <span className={classes.invoiceDetailsHeader}>Due on:</span>
            <InvoiceDueDate
              currentInvoiceDate={currentInvoiceDate}
              updateDefaultDaysToDueDate={updateDaysToDueDate}
              organization={organization}
              purchaseOrder={purchaseOrder}
            />
            <br />
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(InvoiceHeader);
