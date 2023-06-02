import React, { Component } from 'react';

import { DialogContent, withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import Button from '../../../components/material-dashboard/CustomButtons/Button';

import { viewArchivedDialogStyles } from './view_archived_dialog.styles';

class ViewArchivedDialog extends Component {
  state = {
    name: '',
    organizationName: '',
    email: '',
    officePhoneNumber: '',
    cellPhoneNumber: '',
    deliveryAddress: '',
    businessStreet: '',
    businessCity: '',
    businessState: '',
    businessZip: '',
    monsantoTechnologyId: '',
    notes: '',
  };

  render() {
    const { classes, onClose, open, openViewCustomerDialog } = this.props;

    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="md">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            <div>
              <div className={classes.dialogHeaderTitle}>
                <Button
                  className={classes.NewPurchaseOrderButton}
                  simple={true}
                  onClick={() => {
                    openViewCustomerDialog();
                    onClose();
                  }}
                >
                  {`< ${this.props.customer.name}`}
                </Button>
              </div>
              Archive {this.props.customer.name}
            </div>
            <div className={classes.dialogHeaderActions}>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>Are you sure you want to archived customer {this.props.customer.name}?</DialogContent>
        <Divider />
        <div className={classes.dialogFooter}>
          <Button
            type="submit"
            color="primary"
            className={classes.addButton}
            value="Add"
            onClick={() => {
              this.props.deleteCustomer(this.props.customer.id);
            }}
          >
            Archived
          </Button>
          <Button type="submit" color="primary" className={classes.addButton} value="Add" onClick={onClose}>
            Close
          </Button>
        </div>
      </Dialog>
    );
  }
}

export default withStyles(viewArchivedDialogStyles)(ViewArchivedDialog);
