import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Divider from '@material-ui/core/Divider';

import Button from '../../components/material-dashboard/CustomButtons/Button';

const styles = {
  cardIcon: {
    color: 'white',
  },
  addButton: {
    width: 100,
    float: 'right',
    color: 'white',
    background: '#38A154',
    transition: 'none',
    marginBottom: 24,
    marginRight: 16,
    textTransform: 'none',
  },
  dialogTitle: {
    marginTop: -20,
  },
  dialogHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: -30,
    marginBottom: -20,
  },
  dialogHeaderActions: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  NewQuoteButton: {
    textAlign: 'center',
    textTransform: 'none',
    color: '#0000EE',
    '&:hover': {
      color: '#0000EE',
    },
  },
  NewPurchaseOrderButton: {
    textAlign: 'center',
    textTransform: 'none',
    color: '#0000EE',
    '&:hover': {
      color: '#0000EE',
    },
  },
};

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
    const { classes, onClose, open, customer, openViewCustomerDialog } = this.props;

    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="xs">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeaderTitle}>
            <div className={classes.dialogHeaderActions}>
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
          </div>
          Archived
        </DialogTitle>
        <Divider />
        <Divider />
        <div>
          <Button type="submit" color="primary" className={classes.addButton} value="Add" onClick={onClose}>
            DONE
          </Button>
        </div>
      </Dialog>
    );
  }
}

const mapStateToProps = (state) => ({
  organizationId: state.userReducer.organizationId,
  recentCreatedCustomerMetaId: state.customerReducer.recentCreatedCustomerMetaId,
  recentCreatedCustomerId: state.customerReducer.recentCreatedCustomerId,
});

export default withStyles(styles)(connect(mapStateToProps, null)(ViewArchivedDialog));
