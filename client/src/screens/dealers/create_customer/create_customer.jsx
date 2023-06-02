import React, { Component } from 'react';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
//import Button from "@material-ui/core/Button"
import Divider from '@material-ui/core/Divider';

import Button from '../../../components/material-dashboard/CustomButtons/Button';

// custom components
import CustomerForm from '../customer_form';

import { createCustomerStyles } from './create_customer.styles';

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
    licences: [{ classification: '', zoneId: '' }],
    willUseSeedDealerZones: false,
    glnId: null,
    currentApiSeedCompany: '',
    selectedCustomerzoneIds: [],
  };

  componentDidMount() {
    const { apiSeedCompanies, organizationId } = this.props;
    const currentApiSeedCompany = apiSeedCompanies.filter(
      (item) => parseInt(item.organizationId) === parseInt(organizationId),
    )[0];
    this.setState({ currentApiSeedCompany });
  }

  handleChange = (name) => (event) => {
    let value = event.target.value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked;
    }
    this.setState({
      [name]: value,
    });
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
      willUseSeedDealerZones,
      glnId,
      selectedCustomerzoneIds,
    } = this.state;
    //debugger
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
      willUseSeedDealerZones,
      glnId,
      // zoneIds: Array.isArray(licences) ? JSON.stringify(licences) : licences
      zoneIds: selectedCustomerzoneIds,
    });
    createCustomerDone();
    this.props.onClose();
  };

  // customerZonesAndCrop = (notCheckItemsArray, selectedZoneObj) => {
  //   const { currentApiSeedCompany } = this.state;
  //   const companyCropZonelist = JSON.parse(currentApiSeedCompany.zoneIds);
  //   const latestZoneClassificationList = [];
  //   const latestnotCheckItemsArray = notCheckItemsArray.map(item => {
  //     return parseInt(item);
  //   });
  //   for (let i = 0; i < companyCropZonelist.length; i++) {
  //     if (latestnotCheckItemsArray.includes(i)) {
  //       continue;
  //     } else {
  //       const obj = {};
  //       obj.classification = companyCropZonelist[i].classification;
  //       if (selectedZoneObj[i]) {
  //         obj.zoneId = selectedZoneObj[i];
  //       } else {
  //         obj.zoneId = companyCropZonelist[i].zoneId;
  //       }
  //       latestZoneClassificationList.push(obj);
  //     }
  //   }
  //   this.setState({
  //     selectedCustomerzoneIds: [...latestZoneClassificationList]
  //   });
  // };

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
      licences,
      willUseSeedDealerZones,
      glnId,
      currentApiSeedCompany,
      selectedCustomerzoneIds,
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
        <DialogTitle>
          <div className={classes.dialogHeaderTitle}>
            Add New Customer
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
              {currentApiSeedCompany !== '' ? (
                <CustomerForm
                  {...formProps}
                  handleChange={this.handleChange}
                  customerZonesAndCrop={this.customerZonesAndCrop}
                  currentApiSeedCompany={currentApiSeedCompany}
                  flag={{ flag: 'create customer' }}
                  setLicencelist={this.setLicencelist}
                />
              ) : (
                <CustomerForm {...formProps} handleChange={this.handleChange} />
              )}
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

export default withStyles(createCustomerStyles)(CreateCustomer);
