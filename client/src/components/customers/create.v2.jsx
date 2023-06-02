import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
//import Button from "@material-ui/core/Button"
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
  },
  NewPurchaseOrderButton: {
    textAlign: 'center',
    textTransform: 'none',
  },
};

class CreateCustomer extends Component {
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
    showAddQuoteDialog: false,
  };

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  createCustomer = (e) => {
    e.preventDefault();

    const { createCustomer, organizationId, createCustomerDone } = this.props;
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
      showAddQuoteDialog,
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
    this.props.onClose();
  };

  render() {
    const { classes, onClose, open } = this.props;
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
      showAddQuoteDialog,
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
        <DialogTitle>Add New Customer</DialogTitle>
        <Divider />
        <DialogContent>
          <div>
            <form action="#" onSubmit={this.createCustomer}>
              <CustomerForm {...formProps} handleChange={this.handleChange} />
              <Divider />
              <br />
              <div>
                <Button type="submit" color="primary" className={classes.addButton} value="Add" onClick={this.onSubmit}>
                  ADD
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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createCustomer,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CreateCustomer));
