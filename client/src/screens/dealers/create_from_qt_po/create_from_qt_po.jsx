import React, { Component } from 'react';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import Button from '../../../components/material-dashboard/CustomButtons/Button';

// custom components
import CustomerForm from '../customer_form';

import { createFromQtPoStyles } from './create_from_qt_po.styles';

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
    selectedCustomerzoneIds: [],
    currentApiSeedCompany: '',
    willUseSeedDealerZones: false,
    glnId: null,
    licences: [{ classification: '', zoneId: '' }],
  };

  componentDidMount() {
    const { apiSeedCompanies, organizationId } = this.props;
    const currentApiSeedCompany = apiSeedCompanies.filter(
      (item) => parseInt(item.organizationId) === parseInt(organizationId),
    )[0];
    this.setState({ currentApiSeedCompany });
  }

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
      selectedCustomerzoneIds,
      willUseSeedDealerZones,
      glnId,
    } = this.state;

    createCustomer({
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
      zoneIds: selectedCustomerzoneIds,
      willUseSeedDealerZones,
      glnId,
    });
    createCustomerDone();
    setTimeout(() => {
      const { recentCreatedCustomerId, CreateCustomerDialogstyle } = this.props;
      const isQuote = CreateCustomerDialogstyle === 'Quote' ? true : false;
      handleCreatePurchaseOrderDialogOpen(parseInt(recentCreatedCustomerId, 10), isQuote)();
      this.props.onClose();
    }, 1500);
  };

  customerZonesAndCrop = (notCheckItemsArray, notIncludeList, licences) => {
    const notCheckItemsArrayInt = notCheckItemsArray.map((item) => parseInt(item));
    const checkedItem = licences.filter((item, index) => !notCheckItemsArrayInt.includes(index));

    const selectedRows = checkedItem.filter((item) => !notIncludeList.includes(item));

    this.setState({ selectedCustomerzoneIds: [...selectedRows] });
  };

  setLicencelist = (licences, notIncludeList) => {
    const selectedRows = licences.filter((item) => !notIncludeList.includes(item));

    this.setState({ selectedCustomerzoneIds: [...selectedRows] });
  };

  handleLicenseChange = (name, i) => (event) => {
    let value = event.target.value;
    let rows = this.state.licences.slice();
    rows[i][name] = value;
    this.setState({
      licences: rows,
    });
  };

  addLicense = () => {
    const { licences } = this.state;
    let newLicense = { classification: '', zoneId: '' };
    this.setState({
      licences: [...licences, newLicense],
    });
  };

  removeLicense = (index) => (_) => {
    let rows = this.state.licences;
    rows.splice(index, 1);
    this.setState({
      detail: rows,
    });
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
      currentApiSeedCompany,
      licences,
      willUseSeedDealerZones,
      glnId,
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
      handleLicenseChange: this.handleLicenseChange,
      addLicense: this.addLicense,
      removeLicense: this.removeLicense,
      licences,
      classes,
      willUseSeedDealerZones,
      glnId,
    };

    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            <div>
              <div className={classes.dialogHeaderTitle}>
                {CreateCustomerDialogstyle === 'Quote' && (
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
                )}
                {CreateCustomerDialogstyle === 'Purchase Order' && (
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
                )}
              </div>
              Add New Customer
            </div>
            <div className={classes.dialogHeaderActions}>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <div>
            <form action="#" onSubmit={this.createCustomer}>
              <CustomerForm
                {...formProps}
                handleChange={this.handleChange}
                customerZonesAndCrop={this.customerZonesAndCrop}
                currentApiSeedCompany={currentApiSeedCompany}
                flag={{ flag: 'create customer' }}
                setLicencelist={this.setLicencelist}
              />
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

export default withStyles(createFromQtPoStyles)(CreateCustomerFromQTPO);
