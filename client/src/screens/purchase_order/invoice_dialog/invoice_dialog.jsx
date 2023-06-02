import React, { Component } from 'react';
import { Dialog, Button } from '@material-ui/core';

export default class InvoiceDialog extends Component {
  render() {
    const { purchaseOrderId, classes = {}, onClose, customerId } = this.props;
    return (
      <Dialog open={open} onClose={onClose}>
        <h2>
          Invoice #{purchaseOrderId}
          <br />
          has been generated
        </h2>
        <p>You can access it from the customers listing</p>

        <div className={classes.dialogActions}>
          <Button onClick={onClose}>Okay</Button>
          <Link to={`/app/customers/${customerId}/invoice/${purchaseOrderId}`}>
            <Button onClick={onClose}>Go To Invoice</Button>
          </Link>
        </div>
      </Dialog>
    );
  }
}
