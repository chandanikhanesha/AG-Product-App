import React, { Component } from 'react';
// material ui components
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import GridContainer from '../../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../../components/material-dashboard/Grid/GridItem';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import ShareholderDialog from '../../shareholder_dialog';

import { styles } from './farm_edit_shareholder.styles';
import { withStyles } from '@material-ui/core';
import Divider from '@material-ui/core/Divider';
import ShareholderField from './shareholder_field';
// material dashboard components

class FarmEditShareholder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      changedShareHolders: [],
      showShareholderForm: false,
      tableItemActionMenuOpen: false,
      shareholderType: 'percentage',
    };
  }

  handleTableItemActionMenuOpen = (event) => {
    this.setState({
      tableItemActionMenuOpen: true,
      tableItemActionAnchorEl: event.target,
    });
  };

  handleTableItemActionMenuClose = () => {
    this.setState({ tableItemActionMenuOpen: false, activeTableItem: null });
  };

  loadNewData = () => {
    const { shareholders, customerProduct, customer } = this.props;
    const oldData = [];
    [{ name: customer.name, id: 'theCustomer' }, ...shareholders].forEach((shareholder) => {
      let shareholderData = {};
      let currentOrderShareholderData = customerProduct.shareholderData.find(
        (data) => data.shareholderId === shareholder.id,
      );

      let type =
        currentOrderShareholderData !== undefined
          ? currentOrderShareholderData.hasOwnProperty('percentage')
            ? 'percentage'
            : 'units'
          : 'percentage';

      shareholderData = {
        name: shareholder.name,

        shareholderId: currentOrderShareholderData ? currentOrderShareholderData.shareholderId : shareholder.id,
        [type]:
          currentOrderShareholderData !== undefined
            ? currentOrderShareholderData.hasOwnProperty('percentage')
              ? currentOrderShareholderData.percentage
              : currentOrderShareholderData.units
            : 0,
      };
      oldData.push(shareholderData);
    });

    this.setState({
      changedShareHolders: oldData,
      shareholderType: oldData[0].hasOwnProperty('percentage') ? 'percentage' : 'units',
    });
  };

  componentDidMount = () => {
    this.loadNewData();
  };

  createShareholder = (data) => {
    const { customerProduct, createShareholder, customer } = this.props;
    const customerId = customer.id;
    createShareholder(customerId, data).then(async (data) => {
      this.setState({
        showShareholderForm: false,
      });
    });
  };

  cancelShareholderDialog = async () => {
    this.setState({
      showShareholderForm: false,
    });
  };

  updateCustomerPercentage = async (customerData, shareholderId) => {
    const { changedShareHolders, shareholderType } = this.state;

    changedShareHolders.forEach((item) => {
      if (item.shareholderId === shareholderId) {
        if (shareholderType === 'units') {
          item.units = parseFloat(customerData.units || 0);
          item.name = customerData.name;
        } else {
          item.percentage = parseFloat(customerData.percent || 0);
          item.name = customerData.name;
        }
      }
    });
    this.setState({
      changedShareHolders: changedShareHolders,
    });
  };

  getShareHoldersData = () => this.props.purchaseOrder.farmData.find((data) => data.farmId === this.props.farmId);

  getCustomerPercentage = () => {
    const { changedShareHolders, shareholderType } = this.state;

    return shareholderType === 'units'
      ? changedShareHolders
          .filter((p) => p.units !== undefined)
          .map((item) => item.units)
          .reduce((partial_sum, a) => partial_sum + a, 0)
      : changedShareHolders
          .filter((p) => p.percentage !== undefined)
          .map((item) => item.percentage)
          .reduce((partial_sum, a) => partial_sum + a, 0);
  };

  saveCustomerPercentage = async () => {
    const { customer, closeDialog, shareholders, customerProduct } = this.props;
    const { changedShareHolders, shareholderType } = this.state;

    customerProduct.shareholderData = changedShareHolders.map((item) =>
      shareholderType === 'percentage'
        ? { shareholderId: item.shareholderId, percentage: item.percentage }
        : { shareholderId: item.shareholderId, units: item.units },
    );

    if (this.props.isWholeOrderShareHolderPercentage) {
      await this.props.updatePurchaseOrder(customer.id, customerProduct.id, {
        shareholderData: customerProduct.shareholderData,
      });
    } else {
      if (customerProduct.hasOwnProperty('customProductId')) {
        await this.props.editRelatedCustomProduct(customer.id, customerProduct.id, customerProduct);
      } else {
        await this.props.editRelatedProduct(customer.id, customerProduct.id, customerProduct);
      }
    }

    await Promise.all(
      changedShareHolders.map(async (item) => {
        let isNameChanged = shareholders.find(
          (initem) => item.name !== initem.name && initem.id === item.shareholderId,
        );
        if (isNameChanged) {
          await this.props.updateShareholder(customer.id, {
            id: item.shareholderId,
            name: item.name,
          });
        }
      }),
    );

    this.props.listShareholders();
    closeDialog();
  };

  render() {
    const { shareholders, classes, customerProduct, closeDialog, open, customer } = this.props;
    const { showShareholderForm, shareholderType } = this.state;

    const percentError = this.getCustomerPercentage();

    return (
      <div>
        <React.Fragment>
          <Dialog open={open} onClose={() => closeDialog()} maxWidth="md">
            <DialogTitle>
              <div className={classes.dialogHeaderTitle}>
                Shareholders
                <div className={classes.dialogHeaderActions}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {!this.props.isWholeOrderShareHolderPercentage && (
                      <Select
                        value={shareholderType}
                        onChange={(e) => this.setState({ shareholderType: e.target.value })}
                        autoWidth
                        inputProps={{
                          className: classes.packagingSelect,
                          required: true,
                          name: 'shareHolder Type',
                          id: 'shareHolderType',
                        }}
                        style={{ width: '120px' }}
                      >
                        <MenuItem value={'percentage'} key={'percentage'}>
                          Percentage
                        </MenuItem>
                        <MenuItem value={'units'} key={'units'}>
                          Units
                        </MenuItem>
                      </Select>
                    )}
                  </div>
                  <div>
                    <Button
                      id="addShareHolders"
                      color="primary"
                      variant="text"
                      className={classes.button + ' ' + classes.white + ' ' + classes.primary + ' ' + classes.addButton}
                      classes={{ label: classes.addButtonLabel }}
                      onClick={() => this.setState({ showShareholderForm: true })}
                    >
                      Add Shareholder
                    </Button>
                  </div>

                  <IconButton color="inherit" onClick={closeDialog} aria-label="Close">
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>
            </DialogTitle>
            <Divider />
            <DialogContent>
              <GridContainer className={classes.gridContainer}>
                <GridItem xs={12} style={{ display: 'flex', alignItems: 'center' }}>
                  <b className={classes.customerNameCol}>Shareholder name</b>

                  <b>Share {shareholderType == 'units' ? 'units' : '%'}</b>
                </GridItem>
                {[{ name: customer.name, id: 'theCustomer' }, ...shareholders].map((shareholder) => {
                  let currentOrderShareholderData = customerProduct.shareholderData.find(
                    (data) => data.shareholderId === shareholder.id,
                  );

                  let type =
                    currentOrderShareholderData !== undefined &&
                    currentOrderShareholderData.hasOwnProperty('percentage')
                      ? 'percent'
                      : 'units';
                  const shareholderData = {
                    name: shareholder.name,
                    [type]:
                      currentOrderShareholderData !== undefined
                        ? currentOrderShareholderData.hasOwnProperty('percentage')
                          ? currentOrderShareholderData.percentage
                          : currentOrderShareholderData.units
                        : 0,
                  };
                  return (
                    <ShareholderField
                      onSave={(shareholderData) => this.updateCustomerPercentage(shareholderData, shareholder.id)}
                      classes={classes}
                      shareholder={shareholderData}
                      isCustomer={shareholderData.id === 'theCustomer'}
                      type={shareholderType}
                      shareholderType={shareholderType}
                    />
                  );
                })}
              </GridContainer>
            </DialogContent>
            <Divider />

            {shareholderType && shareholderType === 'percentage' ? (
              <div className={classes.warningBlockStyles}>
                <p className={classes.shareHolderPercentageText}>
                  Total Share
                  <span
                    className={classes.shareHolderPercentage}
                    style={{
                      color: percentError > 100 ? '#F44336' : '#000000',
                    }}
                  >
                    {percentError ? percentError : 0}%
                  </span>
                </p>
                <span
                  className={classes.shareHolderPercentageAlert}
                  style={{
                    opacity: percentError > 100 ? 1 : 0,
                    transition: 'opacity .4s',
                  }}
                >
                  Total Percentage exceeds 100%
                </span>
              </div>
            ) : (
              <div className={classes.warningBlockStyles}>
                <p className={classes.shareHolderPercentageText}>
                  Total Share
                  <span
                    className={classes.shareHolderPercentage}
                    style={{
                      color: parseFloat(percentError) > parseFloat(customerProduct.orderQty) ? '#F44336' : '#000000',
                    }}
                  >
                    {percentError ? parseFloat(percentError).toFixed(2) : 0}{' '}
                    {shareholderType == 'units' ? 'Units' : '%'}
                  </span>
                </p>

                <span
                  className={classes.shareHolderPercentageAlert}
                  style={{
                    opacity: parseFloat(percentError) > parseFloat(customerProduct.orderQty) ? 1 : 0,
                    transition: 'opacity .4s',
                  }}
                >
                  Total Units exceeds {customerProduct.orderQty} units
                </span>
              </div>
            )}

            <DialogActions>
              <Button
                onClick={this.saveCustomerPercentage}
                color="primary"
                className={classes.saveButton + ' ' + classes.button + ' ' + classes.primary + ' ' + classes.saveButton}
                disabled={
                  shareholderType === 'units'
                    ? parseFloat(percentError).toFixed(2) == parseFloat(customerProduct.orderQty).toFixed(2)
                      ? false
                      : true
                    : percentError === 100
                    ? false
                    : true
                }
              >
                SAVE
              </Button>
            </DialogActions>
          </Dialog>
        </React.Fragment>
        <ShareholderDialog
          showShareholderForm={showShareholderForm}
          createShareholder={this.createShareholder}
          cancelShareholderDialog={this.cancelShareholderDialog}
        />
      </div>
    );
  }
}

export default withStyles(styles)(FarmEditShareholder);
