import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Divider from '@material-ui/core/Divider';

import Button from '../../components/material-dashboard/CustomButtons/Button';

// custom components
import CustomerForm from './form';

import { createCustomer } from '../../store/actions';

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
  divider: {
    paddingLeft: 0,
    position: 'absolute',
    variant: 'fullWidth',
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

class CreateCustomerFromQTPO extends Component {
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

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  createCustomer = (e) => {
    e.preventDefault();

    const { createCustomer, organizationId, createCustomerDone, handleCreatePurchaseOrderDialogOpen } = this.props;
    const {
      name,
      organizationName,
      email,
      officePhoneNumber,
      cellPhoneNumber,
      deliveryAddress,
      businessStreet,
      businessCity,
      businessState,
      businessZip,
      monsantoTechnologyId,
      notes,
    } = this.state;

    const action = createCustomer({
      organizationId: organizationId,
      notes,
      name,
      organizationName,
      email,
      officePhoneNumber,
      cellPhoneNumber,
      deliveryAddress,
      businessStreet,
      businessCity,
      businessState,
      businessZip,
      monsantoTechnologyId,
      PurchaseOrders: [],
      Quotes: [],
      Shareholders: [],
    });
    createCustomerDone();
    setTimeout(() => {
      const { recentCreatedCustomerId, CreateCustomerDialogstyle } = this.props;
      const isQuote = CreateCustomerDialogstyle === 'Quote' ? true : false;
      console.log(recentCreatedCustomerId);
      handleCreatePurchaseOrderDialogOpen(parseInt(recentCreatedCustomerId, 10), isQuote)();
      this.props.onClose();
    }, 1500);
  };

  render() {
    const {
      classes,
      onClose,
      open,
      handleAddNewQuoteDialogOpen,
      handleAddNewPurchaseOrderDialogOpen,
      CreateCustomerDialogstyle,
    } = this.props;
    const {
      name,
      organizationName,
      email,
      officePhoneNumber,
      cellPhoneNumber,
      deliveryAddress,
      businessStreet,
      businessCity,
      businessState,
      businessZip,
      monsantoTechnologyId,
      notes,
    } = this.state;
    const formProps = {
      name,
      organizationName,
      email,
      officePhoneNumber,
      cellPhoneNumber,
      deliveryAddress,
      businessStreet,
      businessCity,
      businessState,
      businessZip,
      monsantoTechnologyId,
      notes,
    };

    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle className={classes.dialogTitle}>
          {CreateCustomerDialogstyle === 'Quote' && (
            <div className={classes.dialogHeaderTitle}>
              <div className={classes.dialogHeaderActions}>
                <Button
                  className={classes.NewQuoteButton}
                  simple={true}
                  onClick={() => {
                    handleAddNewQuoteDialogOpen();
                    onClose();
                  }}
                >
                  {`< New Quote`}
                </Button>
              </div>
            </div>
          )}
          {CreateCustomerDialogstyle === 'Purchase Order' && (
            <div className={classes.dialogHeaderTitle}>
              <div className={classes.dialogHeaderActions}>
                <Button
                  className={classes.NewPurchaseOrderButton}
                  simple={true}
                  onClick={() => {
                    handleAddNewPurchaseOrderDialogOpen();
                    onClose();
                  }}
                >
                  {`< New Purchase Order`}
                </Button>
              </div>
            </div>
          )}
          Add New Customer
        </DialogTitle>
        <Divider />
        <DialogContent>
          <div>
            <form action="#" onSubmit={this.createCustomer}>
              <CustomerForm {...formProps} handleChange={this.handleChange} />
              <Divider className={classes.divider} />
              <br />
              <div>
                <Button type="submit" color="primary" className={classes.addButton} value="Add" onClick={this.onSubmit}>
                  DONE
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}

const mapStateToProps = (state) => ({
  organizationId: state.userReducer.organizationId,
  recentCreatedCustomerMetaId: state.customerReducer.recentCreatedCustomerMetaId,
  recentCreatedCustomerId: state.customerReducer.recentCreatedCustomerId,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createCustomer,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CreateCustomerFromQTPO));
