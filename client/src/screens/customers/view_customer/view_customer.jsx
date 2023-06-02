import React, { Component } from 'react';
import fileDownload from 'js-file-download';
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
import ReactTable from 'react-table';
import CloseIcon from '@material-ui/icons/Close';
import Tabs from '../../../components/material-dashboard/CustomTabsWithoutBody/CustomTabsWithoutBody';
import { DatePicker } from '@material-ui/pickers';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';

// custom components
import CustomerForm from '../customer_form';

import { viewCustomerStyles } from './view_customer.styles';
import Axios from 'axios';

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
    isArchive: false,
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
    isLoading: false,
    cronCurrentZone: '',
  };

  tabs = [
    { tabName: 'Information', tabIndex: 'basic' },
    { tabName: 'Bayer Licence', tabIndex: 'licence' },
    { tabName: 'Add Note', tabIndex: 'note' },
    { tabName: 'Notes', tabIndex: 'noteall' },
    { tabName: 'Shareholders', tabIndex: 'shareholders' },
    { tabName: 'Customer History', tabIndex: 'customerHistory' },
  ];

  componentWillMount() {
    if (!this.props.isCreateCust) {
      this.props.listShareholders(this.props.customer.id);
    }
  }

  onTabChange = (selectedTabIndex) => {
    this.setState({ selectedTabIndex });
  };

  handleChange = (name) => (event) => {
    let value = event.target.value;
    if (event.target.type === 'checkbox') {
      value = event.target.checked;
    }

    if (name === 'isArchive') {
      value = !this.state.isArchive;
    }
    this.setState({
      [name]: value,
    });
  };

  handleDefferedProductChange = (event) => {
    this.setState({ isDefferedProduct: event.target.checked });
  };

  componentDidMount = async () => {
    const { apiSeedCompanies, organizationId, customer, listBackupCustomerHistory } = this.props;
    this.props.listBackupCustomerHistory();
    const currentApiSeedCompany = apiSeedCompanies.filter(
      (item) => parseInt(item.organizationId) === parseInt(organizationId),
    )[0];

    const DealerZone =
      currentApiSeedCompany !== undefined
        ? JSON.parse(currentApiSeedCompany.zoneIds).find((d) => d.classification == 'C')
        : '';

    await this.setState({
      currentApiSeedCompany,
    });
    await this.setState({
      cronCurrentZone: Array.isArray(DealerZone.zoneId) ? DealerZone.zoneId[0] : DealerZone.zoneId || '',
    });

    if (customer.zoneIds && JSON.parse(customer.zoneIds).length !== 1) {
      if (JSON.parse(customer.zoneIds).length > 0) {
        const currentCustZone = JSON.parse(customer.zoneIds).find(
          (d) => d.classification == 'C' || d.classification == 'CORN',
        );

        this.setState({
          licences: customer.zoneIds ? JSON.parse(customer.zoneIds) : [],
          cronCurrentZone: currentCustZone.zoneId,
        });
      }
    }

    if (this.props.customer !== null) this.initFormFields();
  };

  initFormFields() {
    const { customer: customers, searchText } = this.props;
    Axios.get(
      searchText !== ''
        ? `${process.env.REACT_APP_API_BASE}/customers?searchName=${searchText}`
        : `${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`,
      {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      },
    ).then(async (response) => {
      if (response.data) {
        const customer =
          (response.data.customersdata && response.data.customersdata.filter((c) => c.id == customers.id)[0]) ||
          customers;

        if (customer && customer !== null) {
          this.setState({
            id: customer.id,
            name: customer.name || '',
            organizationName: (customer.organizationName && customer.organizationName) || '',
            email: customer.email || '',
            officePhoneNumber: customer.officePhoneNumber || '',
            cellPhoneNumber: customer.cellPhoneNumber || '',
            deliveryAddress: customer.deliveryAddress || '',
            businessStreet: customer.businessStreet || '',
            isArchive: customer.isArchive || false,
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
    });
  }

  setCustomerLicenceList = (licences) => {
    this.setState({ licences });
  };
  getCustomerHistoryTableData() {
    const { backupCustomersHistory, customer } = this.props;

    let data = [];

    backupCustomersHistory &&
      this.state.id !== undefined &&
      backupCustomersHistory
        .filter((item) => item.customerId === this.state.id)
        .map((historyData) => {
          const currentPo =
            customer &&
            customer.PurchaseOrders.length > 0 &&
            customer.PurchaseOrders.filter((p) => p.id == historyData.purchaseOrderId);

          return (
            currentPo &&
            currentPo[0] &&
            data.push({
              seasonYear: historyData.seasonYear,
              purchaseOrderId: `${historyData.pdfLink.includes('Quote') == true ? 'Quote' : 'PO'}#${
                historyData.purchaseOrderId
              }-${currentPo[0].name}`,
              pdfLink: (
                <a
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    Axios.get(historyData.pdfLink, {
                      responseType: 'blob',
                    }).then((res) => {
                      fileDownload(
                        res.data,
                        `${
                          historyData.isDelivery == true
                            ? `Delivery#${historyData.purchaseOrderId}.pdf`
                            : `Invoice#${historyData.purchaseOrderId}.pdf`
                        }`,
                      );
                    });
                  }}
                >
                  Link
                </a>
              ),
              type:
                historyData.isDelivery == true
                  ? `Delivery ${currentPo[0].isQuote == true ? 'Quote' : 'PurchaseOrder'}`
                  : `Invoice ${currentPo[0].isQuote == true ? 'Quote' : 'PurchaseOrder'}`,
            })
          );
        });

    const finalData = data.reduce((unique, o) => {
      if (!unique.some((obj) => obj.purchaseOrderId === o.purchaseOrderId && obj.type === o.type)) {
        unique.push(o);
      }
      return unique;
    }, []);

    return {
      customerHistoryTableHeader: [
        {
          Header: 'SeasonYear',
          accessor: 'seasonYear',
          width: 100,
        },
        {
          Header: 'Quote/PO ID',
          accessor: 'purchaseOrderId',
          width: 150,
        },
        {
          Header: 'PdfLink',
          accessor: 'pdfLink',
          width: 150,
          // textAlign: 'left',
        },
        {
          Header: 'Type',
          accessor: 'type',
          width: 150,
          textAlign: 'right',
        },
      ],
      customerHistoryTableData: finalData,
    };
  }

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

  createCustomers = () => {
    const {
      name,
      organizationName,
      email,
      officePhoneNumber,
      cellPhoneNumber,
      deliveryAddress,
      businessStreet,
      isArchive,
      businessCity,
      businessState,
      businessZip,
      monsantoTechnologyId,
      isDefferedProduct,

      willUseSeedDealerZones,
      glnId,
      notes,
      reminderDate,
      selectedCustomerzoneIds,
      currentApiSeedCompany,
      cronCurrentZone,
    } = this.state;

    const licences =
      currentApiSeedCompany !== '' && currentApiSeedCompany !== undefined
        ? JSON.parse(currentApiSeedCompany.zoneIds).filter((d) => d.classification != 'C')
        : [];
    licences.length > 0 && licences.unshift({ classification: 'C', zoneId: cronCurrentZone });

    const action = this.props.createCustomer({
      organizationId: this.props.organizationId,
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
      isArchive,

      glnId,
      zoneIds: Array.isArray(licences) ? JSON.stringify(licences) : licences,
    });

    if (action) {
      if (notes) {
        // this.props
        //   .createNote({
        //     organizationId: this.props.organizationId,
        //     note: notes,
        //     relatedType: 'customer',
        //     reminderDate: reminderDate,
        //     customerId: customer.id,
        //   })
        //   .then(() => {
        //     this.props.onClose();
        //   })
        //   .catch((e) => {
        //     console.log(e);
        //   });
      }
    }

    this.props.createCustomerDone();

    this.props.onClose();
  };

  updateCustomer = (type) => (e) => {
    e.preventDefault();
    this.setState({
      isLoading: true,
    });
    const { customer, organizationId, updateCustomer, createNote, updateNote } = this.props;
    const {
      name,
      organizationName,
      email,
      officePhoneNumber,
      cellPhoneNumber,
      deliveryAddress,
      businessStreet,
      isArchive,
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
      currentApiSeedCompany,
      cronCurrentZone,
    } = this.state;

    if (this.state.id == undefined || customer == null) {
      this.createCustomers();
    } else {
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
            isArchive,
            businessCity,
            businessState,
            businessZip,
            monsantoTechnologyId,
            isDefferedProduct,
            glnId,
            // zoneIds: Array.isArray(licences)
            //   ? JSON.stringify(licences)
            //   : licences,
            // zoneIds: selectedCustomerzoneIds,
            zoneIds: JSON.parse(currentApiSeedCompany.zoneIds),

            willUseSeedDealerZones,
          })
            .then((res) => {
              if (res && res.payload) {
                this.props.onClose();
                this.initFormFields();
                this.setState({
                  isLoading: false,
                });
              }
            })
            .catch((e) => {
              console.log(e);
              this.setState({
                isLoading: false,
              });
            });
          break;
        case 'basic':
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
            isArchive,
          })
            .then((res) => {
              if (res && res.payload) {
                this.props.onClose();
                this.initFormFields();
                this.setState({
                  isLoading: false,
                });
              }
            })
            .catch((e) => {
              console.log(e);
              this.setState({
                isLoading: false,
              });
            });
          break;
        case 'licence':
          updateCustomer(this.state.id, {
            monsantoTechnologyId,
            isDefferedProduct,
            glnId,
            zoneIds: Array.isArray(licences) ? JSON.stringify(licences) : licences,
            // zoneIds: selectedCustomerzoneIds,
            willUseSeedDealerZones,
          })
            .then((res) => {
              if (res && res.payload) {
                this.props.onClose();
                this.initFormFields();
                this.setState({
                  isLoading: false,
                });
              }
            })
            .catch((e) => {
              console.log(e);
              this.setState({
                isLoading: false,
              });
            });
          break;
        case 'note':
          // customer.Notes.length > 0
          //   ? updateNote(customer.Notes[0].id, {
          //       note: notes,
          //       relatedType: "customer",
          //       reminderDate: reminderDate
          //     }).catch(e => {
          //       console.log(e);
          //     })
          //   :
          createNote({
            organizationId: organizationId,
            note: notes,
            relatedType: 'customer',
            reminderDate: reminderDate,
            customerId: customer.id,
          })
            .then((res) => {
              if (res && res.payload) {
                this.props.onClose();
                this.initFormFields();
                this.setState({
                  isLoading: false,
                });
              }
            })
            .catch((e) => {
              console.log(e);
              this.setState({
                isLoading: false,
              });
            });
          break;
        default:
          break;
      }
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
  cronCurrentZone = (data) => {
    this.setState({ cronCurrentZone: data });
  };
  customerZonesAndCrop = (notCheckItemsArray, notIncludeList, latestlicences) => {
    // if (latestlicences.length == 1 && latestlicences[0].classification == "") {
    //   return;
    // }
    // const notCheckItemsArrayInt = notCheckItcustomerHistoryTableDatasArray.map(item =>
    //   parseInt(item)
    // );
    // const checkItems = latestlicences.filter(
    //   (item, index) => !notCheckItemsArrayInt.includes(index)
    // );
    // const selectedRows = checkItems.filter(
    //   (item, index) => !notIncludeList.includes(item)
    // );
    // this.setState({ selectedCustomerzoneIds: selectedRows });
  };
  render() {
    const { classes, onClose, open, customer, shareholders, updateShareholder } = this.props;
    const {
      name,
      organizationName,
      email,
      officePhoneNumber,
      cellPhoneNumber,
      deliveryAddress,
      businessStreet,
      isArchive,
      businessCity,
      businessState,
      businessZip,
      monsantoTechnologyId,
      notes,
      licences,
      willUseSeedDealerZones,
      glnId,
      selectedTabIndex,
      reminderDate,
      currentApiSeedCompany,
      customerLicenceList,
      cronCurrentZone,
      // archiveDialogOpen,
      // isQuote,
    } = this.state;
    const formProps = {
      customerId: customer ? customer.id : '',
      name,
      organizationName,
      email,
      officePhoneNumber,
      cellPhoneNumber,
      deliveryAddress,
      businessStreet,
      isArchive,
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
    const { customerHistoryTableHeader, customerHistoryTableData } = this.getCustomerHistoryTableData();

    const selectedTab = this.tabs[selectedTabIndex].tabIndex;

    const DealerZone =
      currentApiSeedCompany == undefined || currentApiSeedCompany == ''
        ? ''
        : JSON.parse(currentApiSeedCompany.zoneIds).find((d) => d.classification == 'C');

    return (
      <Dialog open={open} fullWidth maxWidth="md" onClose={onClose}>
        <DialogTitle onClose={onClose}>
          <div className={classes.dialogHeaderTitle}>
            {customer ? customer.name : 'Create Customer'}
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

          <Tabs
            headerColor="gray"
            selectedTab={selectedTabIndex}
            onTabChange={this.onTabChange}
            tabs={this.tabs}
            id={selectedTab}
            disable={customer ? false : true}
          />
        </DialogTitle>
        <Divider style={{ marginTop: '-20px' }} />
        <form action="#" onSubmit={this.updateCustomer(selectedTab)}>
          <DialogContent
            style={{
              maxHeight: '300px',
              minHeight: '300px',
              display: 'block !important',
            }}
          >
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
              setCustomerLicenceList={this.setCustomerLicenceList}
              isCreateCust={this.props.isCreateCust}
              DealerZone={DealerZone}
              cronCurrentZone={cronCurrentZone}
              setCronCurrentZone={this.cronCurrentZone}
            />
            {/* <Divider/> */}
            {/* {(selectedTab === "basic" || !selectedTab) && (
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
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Button
                    simple={"true"}
                    className={classes.viewArchiveButton}
                    value="done"
                    onClick={() => {
                      handleViewCustomerArchivePODialogOpen(true)();
                    }}
                  >
                    View Archived Quote
                  </Button>
                  <Button
                    simple={"true"}
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
            )} */}
            {selectedTab === 'customerHistory' || !selectedTab ? (
              <ReactTable
                data={customerHistoryTableData || []}
                columns={customerHistoryTableHeader}
                minRows={1}
                resizable={false}
                showPagination={false}
              />
            ) : null}
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
              {/* <Button
                type="submit"
                color="primary"
                className={classes.saveButton}
                value="done"
                onClick={this.props.handleViewArchivedDialogOpen}
              >
                Archived
              </Button> */}

              <Button
                id="viewCustomer"
                type="submit"
                // color="primary"
                style={{ background: this.state.isLoading ? '#b5bbb7' : '#38A154' }}
                className={classes.saveButton}
                value="done"
                onClick={this.onSubmit}
                disabled={
                  this.props.isCreateCust
                    ? this.state.id == undefined && selectedTab === 'basic'
                      ? false
                      : true
                    : this.state.isLoading
                }
              >
                SAVE
              </Button>
              {this.state.isLoading && (
                <CircularProgress size={24} style={{ position: 'absolute', left: '90%', marginTop: -25 }} />
              )}
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
