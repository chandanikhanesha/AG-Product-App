import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

import CloseIcon from '@material-ui/icons/Close';

// custom components
import CustomerForm from './form';

import { updateCustomer } from '../../store/actions';

const styles = {
  cardIcon: {
    color: 'white',
  },
  saveButton: {
    width: 100,
    float: 'right',
    color: 'white',
    background: '#38A154',
    transition: 'none',
    marginBottom: 24,
    marginRight: 16,
    fontWeight: 600,
  },
  viewArchButton: {
    width: 150,
    float: 'right',
    color: 'white',
    background: '#38A154',
    transition: 'none',
    textAlign: 'left',
    // marginBottom: 24,
    // marginRight: 16,
    fontWeight: 600,
    fontSize: 8,
  },
  dialogHeaderTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialogHeaderActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dialogFooter: {
    marginTop: 14,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
};

class ViewCustomer extends Component {
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

  componentDidMount() {
    if (this.props.customer !== null) this.initFormFields();
  }

  initFormFields() {
    if (this.props.customer !== null) {
      const { customer } = this.props;
      this.setState({
        id: customer.id,
        name: customer.name || '',
        organizationName: customer.organizationName || '',
        email: customer.email || '',
        officePhoneNumber: customer.officePhoneNumber || '',
        cellPhoneNumber: customer.cellPhoneNumber || '',
        deliveryAddress: customer.deliveryAddress || '',
        businessStreet: customer.businessStreet || '',
        businessCity: customer.businessCity || '',
        businessState: customer.businessState || '',
        businessZip: customer.businessZip || '',
        monsantoTechnologyId: customer.monsantoTechnologyId || '',
        notes: customer.notes || '',
      });
    }
  }

  updateCustomer = (e) => {
    e.preventDefault();

    const { updateCustomer } = this.props;
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

    updateCustomer(this.state.id, {
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
    })
      .then(() => {
        this.props.onClose();
      })
      .catch((e) => {
        console.log(e);
      });
  };

  render() {
    const { classes, onClose, open, customer, openViewArchivedDialog } = this.props;
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
        <DialogTitle onClose={onClose}>
          <div className={classes.dialogHeaderTitle}>
            {customer ? customer.name : ''}
            <div className={classes.dialogHeaderActions}>
              <Button
                className={`${classes.viewArchButton} hide-print`}
                color="primary"
                onClick={() => {
                  openViewArchivedDialog();
                  onClose();
                }}
              >
                <span>VIEW ARCHIVED</span>
              </Button>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <form action="#" onSubmit={this.updateCustomer}>
            <CustomerForm {...formProps} handleChange={this.handleChange} />
            {/* <Divider/> */}
            <div className={classes.dialogFooter}>
              <Button type="submit" color="primary" className={classes.saveButton} value="done" onClick={this.onSubmit}>
                SAVE
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }
}

// const mapStateToProps = state => {
//   return {
//     customers: state.customerReducer.customers,
//     customersLoadingStatus: state.customerReducer.loadingStatus
//   }
// }

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateCustomer,
    },
    dispatch,
  );

export default withStyles(styles)(connect(null, mapDispatchToProps)(ViewCustomer));
