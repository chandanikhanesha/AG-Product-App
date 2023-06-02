import React, { Component } from 'react';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';

import CloseIcon from '@material-ui/icons/Close';

import Button from '../../../components/material-dashboard/CustomButtons/Button';
import { customEarlyPaysDialogStyles } from './custom_early_pays_dialog.styles';
import EarlyPayField from './custom_early_pay_field';

class CustomEarlyPaysDialog extends Component {
  state = {
    purchaseOrder: null,
    customEarlyPays: [],
    isUnmodified: true,
    addingCustomEarlyPay: false,
  };

  componentWillMount = () => {};
  componentDidMount = () => {
    this.renderEarlyPaysData({ isFirstTime: true });
  };

  renderEarlyPaysData = async ({ isFirstTime } = {}) => {
    const { getPurchaseOrderById, purchaseOrderId, currentPurchaseOrder, listPurchaseOrders, purchaseOrders } =
      this.props;
    await listPurchaseOrders();
    await getPurchaseOrderById(purchaseOrderId);
    const po = purchaseOrders.find((_po) => _po.id === purchaseOrderId);
    this.setState({
      purchaseOrder: isFirstTime ? currentPurchaseOrder : po,
      customEarlyPays: isFirstTime ? currentPurchaseOrder.CustomEarlyPays : po.CustomEarlyPays,
      isUnmodified: isFirstTime,
    });
  };

  updatePurchaseOrder = (earlyPay) => {
    const { purchaseOrder } = this.state;
    const { updatePurchaseOrder } = this.props;
    let modifiedEarlyPayRows = [];
    modifiedEarlyPayRows.push({
      ...earlyPay,
      customerId: purchaseOrder.customerId,
      removeMe: false,
    });
    updatePurchaseOrder(purchaseOrder.customerId, purchaseOrder.id, {
      modifiedEarlyPayRows,
    }).then(() => {
      this.renderEarlyPaysData();
    });
  };

  addNewEarlyPay = () => {
    const { customEarlyPays } = this.state;
    let newEarlyPay = {
      payByDate: new Date(),
      payingLessAmount: 0,
      remainingTotal: 0,
    };
    let newEarlyPays = [newEarlyPay, ...customEarlyPays];
    this.setState({ customEarlyPays: newEarlyPays, addingEarlyPay: true });
  };

  removeNewEarlyPay = () => {
    const { customEarlyPays } = this.state;
    let newearlyPays = customEarlyPays.filter((earlyPay) => earlyPay.id !== undefined);
    this.setState({ customEarlyPays: newearlyPays });
  };

  addNewEarlyPayClose = () => {
    this.setState({ addingEarlyPay: false });
  };

  deleteEarlyPay = (earlyPay) => {
    const { purchaseOrder } = this.state;
    const { updatePurchaseOrder } = this.props;
    let modifiedEarlyPayRows = [];
    modifiedEarlyPayRows.push({ ...earlyPay, removeMe: true });

    updatePurchaseOrder(purchaseOrder.customerId, purchaseOrder.id, {
      modifiedEarlyPayRows,
    }).then(() => {
      this.renderEarlyPaysData();
    });
  };

  render() {
    const { classes, onClose, open } = this.props;
    const { customEarlyPays, isUnmodified, addingEarlyPay } = this.state;
    return (
      <Dialog open={open} onClose={() => onClose(isUnmodified)} fullWidth={true} maxWidth="lg">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            <h3>Custom Early Pay</h3>
            <div className={classes.dialogHeaderActions}>
              <Button
                color="primary"
                className={classes.addButton}
                value="Add"
                onClick={this.addNewEarlyPay}
                disabled={addingEarlyPay}
              >
                ADD EARLY PAY
              </Button>
              <IconButton color="inherit" onClick={() => onClose(isUnmodified)} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <Grid container className={classes.earlyPayGridContainer}>
          <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Pay By</h4>
          </Grid>
          <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Paying less</h4>
          </Grid>
          <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Remaining Total</h4>
          </Grid>
          <Grid item xs={1} style={{ display: 'flex', alignItems: 'center' }} />
          {customEarlyPays.map((earlyPay) => {
            return (
              <EarlyPayField
                key={earlyPay.id}
                earlyPay={earlyPay}
                classes={classes}
                onSave={this.updatePurchaseOrder}
                deleteEarlyPay={this.deleteEarlyPay}
                addNewEarlyPayClose={this.addNewEarlyPayClose}
                removeNewEarlyPay={this.removeNewEarlyPay}
              />
            );
          })}
        </Grid>
      </Dialog>
    );
  }
}

export default withStyles(customEarlyPaysDialogStyles)(CustomEarlyPaysDialog);
