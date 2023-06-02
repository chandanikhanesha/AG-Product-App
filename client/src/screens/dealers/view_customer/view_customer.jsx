import React, { Component } from 'react';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import CloseIcon from '@material-ui/icons/Close';
import Tabs from '../../../components/material-dashboard/CustomTabsWithoutBody/CustomTabsWithoutBody';
import { DatePicker } from '@material-ui/pickers';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import moment from 'moment';

// custom components
import CustomerForm from '../customer_form';

import { viewCustomerStyles } from './view_customer.styles';

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
    isDefferedProduct: false,
    archiveDialogOpen: false,
    isQuote: false,
    licences: [{ classification: '', zoneId: '' }],
    willUseSeedDealerZones: false,
    glnId: null,
    selectedTabIndex: 0,
    reminderDate: null,
    currentApiSeedCompany: '',
    selectedCustomerzoneIds: [],
  };

  tabs = [
    { tabName: 'Basic Information', tabIndex: 'basic' },
    { tabName: 'Address', tabIndex: 'address' },
    { tabName: 'Add Note', tabIndex: 'note' },
    { tabName: 'Notes', tabIndex: 'noteall' },
    { tabName: 'Shareholders', tabIndex: 'shareholders' },
  ];

  componentWillMount() {
    this.props.listShareholders(this.props.customer.id);
  }

  onTabChange = (selectedTabIndex) => {
    this.setState({ selectedTabIndex });
  };

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleDefferedProductChange = (event) => {
    this.setState({ isDefferedProduct: event.target.checked });
  };

  componentDidMount() {
    const { apiSeedCompanies, organizationId } = this.props;
    const currentApiSeedCompany = apiSeedCompanies.filter(
      (item) => parseInt(item.organizationId) === parseInt(organizationId),
    )[0];
    this.setState({ currentApiSeedCompany });
    if (this.props.customer !== null) this.initFormFields();
  }

  initFormFields() {
    const { customer } = this.props;
    if (customer !== null) {
      this.setState({
        id: customer.id,
        name: customer.name || '',
        organizationName: (customer.organizationName && customer.organizationName) || '',
        email: customer.email || '',
        officePhoneNumber: customer.officePhoneNumber || '',
        cellPhoneNumber: customer.cellPhoneNumber || '',
        deliveryAddress: customer.deliveryAddress || '',
        businessStreet: customer.businessStreet || '',
        businessCity: customer.businessCity || '',
        businessState: customer.businessState || '',
        businessZip: customer.businessZip || '',
        monsantoTechnologyId: customer.monsantoTechnologyId || '',
        notes: customer.Notes && customer.Notes.length > 0 ? customer.Notes[0].note : '',
        reminderDate: customer.Notes && customer.Notes.length > 0 ? customer.Notes[0].reminderDate : null,
        isDefferedProduct: customer.isDefferedProduct,
        licences: customer.zoneIds ? customer.zoneIds : [{ classification: '', zoneId: '' }],
        customerLicenceList: customer.zoneIds ? customer.zoneIds : [{ classification: '', zoneId: '' }],
        glnId: customer.glnId || null,
      });
    }
  }

  setCustomerLicenceList = (licences) => {
    this.setState({ licences });
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

  updateCustomer = (type) => (e) => {
    e.preventDefault();

    const { customer, organizationId, updateCustomer, createNote, updateNote } = this.props;
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
      isDefferedProduct,
      licences,
      willUseSeedDealerZones,
      glnId,
      notes,
      reminderDate,
      selectedCustomerzoneIds,
    } = this.state;
    switch (type) {
      case 'all':
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
          isDefferedProduct,
          glnId,
          // zoneIds: Array.isArray(licences)
          //   ? JSON.stringify(licences)
          //   : licences,
          zoneIds: selectedCustomerzoneIds,
          willUseSeedDealerZones,
        })
          .then(() => {
            this.props.onClose();
          })
          .catch((e) => {
            console.log(e);
          });
        break;
      case 'basic':
        updateCustomer(this.state.id, {
          name,
          organizationName,
          monsantoTechnologyId,
          isDefferedProduct,
          glnId,
          zoneIds: Array.isArray(licences) ? JSON.stringify(licences) : licences,
          willUseSeedDealerZones,
        }).catch((e) => {
          console.log(e);
        });
        break;
      case 'address':
        updateCustomer(this.state.id, {
          email,
          officePhoneNumber,
          cellPhoneNumber,
          deliveryAddress,
          businessStreet,
          businessCity,
          businessState,
          businessZip,
        }).catch((e) => {
          console.log(e);
        });
        break;
      case 'note':
        customer.Notes.length > 0
          ? updateNote(customer.Notes[0].id, {
              note: notes,
              relatedType: 'customer',
              reminderDate: reminderDate,
            }).catch((e) => {
              console.log(e);
            })
          : createNote({
              organizationId: organizationId,
              note: notes,
              relatedType: 'customer',
              reminderDate: reminderDate,
              customerId: customer.id,
            })
              .then(() => {
                this.props.onClose();
              })
              .catch((e) => {
                console.log(e);
              });
        break;
      default:
        break;
    }
  };

  handleDateChange = (date) => {
    this.setState({
      reminderDate: moment.utc(date).format('YYYY-MM-DD') + 'T00:00:00.000Z',
    });
  };

  // for future refrence

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
  customerZonesAndCrop = (notCheckItemsArray, notIncludeList, latestlicences) => {
    if (latestlicences.length == 1 && latestlicences[0].classification == '') {
      return;
    }
    const notCheckItemsArrayInt = notCheckItemsArray.map((item) => parseInt(item));
    const checkItems = latestlicences.filter((item, index) => !notCheckItemsArrayInt.includes(index));
    const selectedRows = checkItems.filter((item, index) => !notIncludeList.includes(item));
    this.setState({ selectedCustomerzoneIds: [...selectedRows] });
  };

  setLicencelist = (licences, notIncludeList) => {
    const selectedRows = licences.filter((item) => !notIncludeList.includes(item));
    this.setState({ selectedCustomerzoneIds: [...selectedRows] });
  };

  render() {
    const { classes, onClose, open, customer, handleViewCustomerArchivePODialogOpen, shareholders, updateShareholder } =
      this.props;
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
      isDefferedProduct,
      licences,
      willUseSeedDealerZones,
      glnId,
      selectedTabIndex,
      reminderDate,
      currentApiSeedCompany,
      customerLicenceList,
      // archiveDialogOpen,
      // isQuote,
      selectedCustomerzoneIds,
    } = this.state;
    const formProps = {
      customerId: customer.id,
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
      shareholders,
    };
    const selectedTab = this.tabs[selectedTabIndex].tabIndex;
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle onClose={onClose}>
          <div className={classes.dialogHeaderTitle}>
            {customer ? customer.name : ''}
            <div className={classes.dialogHeaderActions}>
              {/* <Button
                className={`${classes.viewArchButton} hide-print`}
                color="primary"
                onClick={() => {
                  openViewArchivedDialog();
                  onClose();
                }}
              >
                <span>VIEW ARCHIVED</span>
              </Button> */}
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
          <Tabs headerColor="gray" selectedTab={selectedTabIndex} onTabChange={this.onTabChange} tabs={this.tabs} />
        </DialogTitle>
        <Divider />
        <form action="#" onSubmit={this.updateCustomer(selectedTab)}>
          <DialogContent style={{ maxHeight: '300px', minHeight: '300px', display: 'block !important' }}>
            <CustomerForm
              {...formProps}
              updateShareholder={updateShareholder}
              handleChange={this.handleChange}
              selectedTab={selectedTab}
              edit={true}
              licences={licences}
              currentApiSeedCompany={currentApiSeedCompany}
              customerZonesAndCrop={this.customerZonesAndCrop}
              customerLicenceList={customerLicenceList}
              setLicencelist={this.setLicencelist}
            />
            {/* <Divider/> */}
            {(selectedTab === 'basic' || !selectedTab) && (
              <React.Fragment>
                <FormControlLabel
                  key={isDefferedProduct}
                  label="Deffer Product"
                  control={
                    <Checkbox
                      checked={isDefferedProduct}
                      onChange={this.handleDefferedProductChange}
                      value={isDefferedProduct}
                    />
                  }
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Button
                    simple={true}
                    className={classes.viewArchiveButton}
                    value="done"
                    onClick={() => {
                      handleViewCustomerArchivePODialogOpen(true)();
                    }}
                  >
                    View Archived Quote
                  </Button>
                  <Button
                    simple={true}
                    className={classes.viewArchiveButton}
                    value="done"
                    onClick={() => {
                      handleViewCustomerArchivePODialogOpen(false)();
                    }}
                  >
                    View Archived Purchase Order
                  </Button>
                </div>
              </React.Fragment>
            )}
            {selectedTab === 'note' || !selectedTab ? (
              <DatePicker
                className={classes.datePicker}
                label="Reminder Date"
                style={{ width: '100%', padding: 0 }}
                leftArrowIcon={<NavigateBefore />}
                rightArrowIcon={<NavigateNext />}
                value={reminderDate}
                format="MMMM Do YYYY"
                disablePast={false}
                onChange={this.handleDateChange}
              />
            ) : (
              ''
            )}
          </DialogContent>
          {selectedTab !== 'noteall' || !selectedTab ? (
            <DialogActions>
              <Button
                type="submit"
                color="primary"
                className={classes.saveButton}
                value="done"
                onClick={this.props.handleViewArchivedDialogOpen}
              >
                Archived
              </Button>
              <Button
                type="submit"
                // color="primary"
                className={classes.saveButton}
                value="done"
                onClick={this.onSubmit}
              >
                SAVE
              </Button>
            </DialogActions>
          ) : (
            <DialogActions>
              <Button className={classes.saveButton} style={{ backgroundColor: 'white' }} />
              <Button className={classes.saveButton} style={{ backgroundColor: 'white' }} />
            </DialogActions>
          )}
        </form>
      </Dialog>
    );
  }
}

export default withStyles(viewCustomerStyles)(ViewCustomer);
