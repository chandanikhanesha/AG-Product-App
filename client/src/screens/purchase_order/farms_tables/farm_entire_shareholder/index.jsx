import React, { Component } from 'react';
// material ui components
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import GridContainer from '../../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../../components/material-dashboard/Grid/GridItem';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import ShareholderDialog from '../../shareholder_dialog/index';
import {
  createShareholder,
  updateShareholder,
  listShareholders,
  updatePurchaseOrder,
  editCustomerProduct,
  updateCustomerCustomProduct,
  updateFarm,
} from '../../../../store/actions';

import { styles } from '../farm_edit_shareholder/farm_edit_shareholder.styles';
import Divider from '@material-ui/core/Divider';
import ShareholderField from '../farm_edit_shareholder/shareholder_field';
// material dashboard components

class FarmEntireShareholder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      changedShareHolders: [],
      showShareholderForm: false,
    };
  }

  loadNewData = () => {
    const { shareholders, customerProducts, customer, farms, farmId } = this.props;

    const oldData = [];
    [{ name: customer.name, id: 'theCustomer' }, ...shareholders].forEach((shareholder) => {
      let shareholderData = {};
      const isExit = this.state.changedShareHolders.find(
        (s) => s.name === shareholder.name && s.shareholderId == shareholder.id,
      );
      let currentOrderShareholderData = farms[0].shareholderData.find((data) => data.shareholderId === shareholder.id);

      if (!isExit) {
        shareholderData = {
          name: shareholder.name,
          percentage: currentOrderShareholderData
            ? currentOrderShareholderData.percentage || currentOrderShareholderData.percent
            : 0,

          shareholderId: currentOrderShareholderData ? currentOrderShareholderData.shareholderId : shareholder.id,
        };
      } else {
        shareholderData = isExit;
      }

      oldData.push(shareholderData);
    });
    this.setState({ changedShareHolders: oldData });
  };

  componentDidMount = () => {
    this.loadNewData();
  };

  createShareholder = (data) => {
    const { createShareholder, customer } = this.props;
    const customerId = customer.id;
    createShareholder(customerId, data).then(() => {
      this.loadNewData();

      this.setState({
        showShareholderForm: false,
      });
    });
  };

  cancelShareholderDialog = () => {
    this.setState({
      showShareholderForm: false,
    });
  };

  updateCustomerPercentage = async (customerData, shareholderId) => {
    const val = customerData.percent;
    const { changedShareHolders } = this.state;
    changedShareHolders.forEach((item) => {
      if (item.shareholderId === shareholderId) {
        item.percentage = parseFloat(val);
        item.name = customerData.name;
      }
    });
    this.setState({
      changedShareHolders: changedShareHolders,
    });
  };

  saveCustomerPercentage = async () => {
    const { customer, customerProducts, closeDialog, shareholders, updateFarm, farmId } = this.props;
    const { changedShareHolders } = this.state;

    const shareholderData = changedShareHolders.map((item) => ({
      shareholderId: item.shareholderId,
      percentage: item.percentage || 0,
      name: item.name,
    }));

    await updateFarm(customer.id, { id: farmId, shareholderData: shareholderData });
    await Promise.all(
      customerProducts.map(async (customerProduct) => {
        customerProduct.shareholderData = changedShareHolders.map((item) => ({
          shareholderId: item.shareholderId,
          percentage: item.percentage || 0,
          name: item.name,
        }));

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
      }),
    );

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
    this.props.reload();
    closeDialog();
  };

  getShareHoldersData = () => this.props.purchaseOrder.farmData.find((data) => data.farmId === this.props.farmId);

  getCustomerPercentage = () => {
    const { changedShareHolders } = this.state;

    return changedShareHolders
      .filter((item) => item.percentage !== undefined)
      .map((item) => item.percentage)
      .reduce((partial_sum, a) => partial_sum + a, 0);
  };

  render() {
    const { shareholders, classes, customerProducts, closeDialog, open, customer, farms } = this.props;
    const { showShareholderForm } = this.state;

    const percentError = this.getCustomerPercentage();
    let isMsgShow = false;
    // console.log(customerProducts, 'customerProducts', farms[0].shareholderData);
    customerProducts.map((c) => {
      const results = farms[0].shareholderData.filter(
        ({ percentage: id1 }) => !c.shareholderData.some(({ percentage: id2 }) => id2 === id1),
      );
      isMsgShow = results.length > 0 ? true : false;
    });
    return (
      <div>
        <React.Fragment>
          <Dialog open={open} onClose={() => closeDialog()} maxWidth="md">
            <DialogTitle>
              <div className={classes.dialogHeaderTitle}>
                Shareholder distribution for Entire Farm
                <div className={classes.dialogHeaderActions}>
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
                  <b>Share %</b>
                </GridItem>
                {[{ name: customer.name, id: 'theCustomer' }, ...shareholders].map((shareholder, index) => {
                  let shareholderData = {
                    name: shareholder.name,
                    percent: 0,
                  };

                  const currentOrderShareholderData = farms[0].shareholderData.find(
                    (data) => data.shareholderId === shareholder.id,
                  );
                  shareholderData['percent'] = currentOrderShareholderData ? currentOrderShareholderData.percentage : 0;

                  return (
                    <ShareholderField
                      shareHolderIndex={index}
                      onSave={(shareholderData) => this.updateCustomerPercentage(shareholderData, shareholder.id)}
                      classes={classes}
                      shareholder={shareholderData}
                      isCustomer={shareholderData.id === 'theCustomer'}
                      type="percentage"
                    />
                  );
                })}
              </GridContainer>
            </DialogContent>
            <Divider />
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
            {isMsgShow && (
              <a style={{ margin: '0px 30px 0px 30px' }}>
                One or more of the products in this Farm have different share holder breakdown than what you initially
                set for the entire Farm. If you update this, it will override that and set this % breakdown for all
                products in this Farm
              </a>
            )}
            <DialogActions>
              <Button
                id="save"
                onClick={this.saveCustomerPercentage}
                color="primary"
                className={classes.saveButton + ' ' + classes.button + ' ' + classes.primary + ' ' + classes.saveButton}
                disabled={percentError === 100 ? false : true}
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

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createShareholder,
      updateShareholder,
      listShareholders,
      updatePurchaseOrder,
      editRelatedProduct: editCustomerProduct,
      editRelatedCustomProduct: updateCustomerCustomProduct,
      updateFarm,
    },
    dispatch,
  );

const StyledFarmEntireShareholder = withStyles(styles)(FarmEntireShareholder);
export default connect(null, mapDispatchToProps)(StyledFarmEntireShareholder);
