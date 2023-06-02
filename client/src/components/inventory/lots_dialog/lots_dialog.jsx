import React, { Component, Fragment } from 'react';
import { flatten } from 'lodash/array';
import { isNumber } from 'lodash';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';

import CloseIcon from '@material-ui/icons/Close';

import Button from '../../../components/material-dashboard/CustomButtons/Button';
import ProductDealerInfoDialog from '../product_dealer_info_dialog';

import { lotsDialogStyles } from './lots_dialog.styles';
import LotField from './lot_field';
import {
  getQtyShipped,
  getGrowerOrderDelivered,
  getTransferInAmount,
  getTransferOutAmount,
} from '../../../utilities/product';

class LotsDialog extends Component {
  state = {
    product: {},
    lots: [],
    isUnmodified: true,
    qtyOfWarehouse: null,
    addingLot: false,
    isCustomProduct: false,
    suggestions: [],
    productDealerInfoDialogOpen: false,
    productDealers: [],
    dialogType: '',
    isLoading: false,
  };

  componentWillMount = () => {
    const isCustomProduct = this.props.productType === 'custom';
    this.setState({ isCustomProduct });
  };
  componentDidMount = async () => {
    this.renderLotsData({ isFirstTime: true });
    await this.props.listSeedSizes();
    await this.props.listPackagings();
  };

  renderLotsData = async ({ isFirstTime } = {}) => {
    const {
      productId,
      deliveryReceipts,
      customProducts,
      products,
      listAllCustomProducts,
      productDealers,
      companyType,
      companyId,
      isMonsantoProduct,
      monsantoProducts,
    } = this.props;
    this.props.listProductDealers();

    const { isCustomProduct } = this.state;

    const relatedProducts = isMonsantoProduct ? monsantoProducts : isCustomProduct ? customProducts : products;

    let product = relatedProducts.find((_product) => _product.id === productId);

    const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));

    let qtyOfWarehouse =
      getQtyShipped(product) +
      getTransferInAmount(product) -
      getTransferOutAmount(product) -
      getGrowerOrderDelivered(product, deliveryReceiptDetails) +
      (isCustomProduct ? parseInt(product.quantity, 10) : 0);

    this.setState({
      product: product,
      lots: isCustomProduct ? product.customLots : product.lots || [],
      qtyOfWarehouse: qtyOfWarehouse,
      isUnmodified: isFirstTime,
      productDealers: productDealers
        .filter((productDealer) => productDealer.companyType === companyType && productDealer.companyId === companyId)
        .sort((a, b) => a.id - b.id),
    });
  };

  updateProduct = (lot) => {
    const { isCustomProduct, product } = this.state;
    const {
      id,
      seedType,
      brand,
      blend,
      treatment,
      quantity,
      msrp,
      seedCompanyId: seedCompanyId,
      crossReferenceId,
    } = product;
    const { updateProduct, updateCustomProduct, updateMonsantoProduct, isMonsantoProduct } = this.props;
    this.setState({ isLoading: true });
    if (isMonsantoProduct) {
      const data = {
        quantity: lot.quantity,
        receivedQty: lot.receivedQty,
        lotNumber: lot.lotNumber,
        monsantoProductId: id,
        crossReferenceId: crossReferenceId,
        source: lot.source,
        seedCompanyId: seedCompanyId,
        dealerName: lot.dealerName,
        dealerId: lot.dealerId,
        shipDate: lot.shipDate,
        lotId: lot.id,
        netWeight: lot.netWeight,
        deliveryDate: lot.deliveryDate,
        isReturn: null,
        isAccepted: true,
        shipNotice: lot.shipNotice,
      };

      updateMonsantoProduct(data)
        .then((res) => {
          if (res) {
            this.setState({ isLoading: false });

            this.renderLotsData();
          }
        })
        .catch((error) => {
          this.setState({ isLoading: false });

          console.log('error :"', error);
        });
    } else {
      let updateFunction = isCustomProduct ? updateCustomProduct : updateProduct;
      let modifiedLotRows = [];
      if (lot.source === ('Seed Dealer Transfer In' || 'Seed Dealer Transfer Out')) {
        modifiedLotRows.push({ ...lot, orderAmount: 0, removeMe: false });
      } else {
        modifiedLotRows.push({ ...lot, removeMe: false });
      }
      updateFunction({
        id,
        seedType,
        brand,
        blend,
        treatment,
        quantity,
        msrp,
        modifiedLotRows,
        seedCompanyId,
      }).then((res) => {
        this.setState({ isLoading: false });

        this.renderLotsData();
      });
    }
  };

  addNewLot = () => {
    this.renderLotsData();
    const { lots, isCustomProduct } = this.state;
    const { isMonsantoProduct } = this.props;
    let newLot = {
      lotNumber: null,
      quantity: 0,
      orderAmount: 0,
      seedCompanyId: null,
      packagingId: null,
      source: isCustomProduct ? 'Transfer In' : isMonsantoProduct ? 'Transfer In' : 'Seed Company',
      orderDate: new Date(),
      isReturn: null,
      shipNotice: 0,
    };
    let newLots = [newLot, ...lots];
    this.setState({ lots: newLots, addingLot: true });
  };

  removeNewLot = () => {
    const { lots } = this.state;

    let newlots = lots.filter((lot) => lot.id !== undefined);
    this.setState({ lots: newlots });
  };

  addNewLotClose = () => {
    this.setState({ addingLot: false });
  };

  deleteLot = (lot) => {
    const { isCustomProduct, product } = this.state;
    const { id, seedType, brand, blend, treatment, quantity, msrp, seedCompanyId: seedCompanyId } = product;
    const { updateProduct, updateCustomProduct, updateMonsantoProduct, isMonsantoProduct } = this.props;

    if (isMonsantoProduct) {
      const data = {
        removeMe: true,
        lotId: lot.id,
      };

      updateMonsantoProduct(data)
        .then((res) => {
          if (res) {
            this.renderLotsData();
          }
        })
        .catch((error) => {
          console.log('error', error);
        });
    } else {
      let updateFunction = isCustomProduct ? updateCustomProduct : updateProduct;
      let modifiedLotRows = [];
      modifiedLotRows.push({ removeMe: true, ...lot });

      updateFunction({
        id,
        seedType,
        brand,
        blend,
        treatment,
        quantity,
        msrp,
        modifiedLotRows,
        seedCompanyId,
      }).then(() => {
        this.renderLotsData();
      });
    }
  };

  handleProductDealerInfoDialogOpen = (type) => {
    this.setState({ productDealerInfoDialogOpen: true, dialogType: type });
  };

  handleProductDealerInfoDialogClose = () => {
    this.setState({ productDealerInfoDialogOpen: false });
    this.props.listApiSeedCompanies();
  };

  render() {
    const { classes, onClose, open, seedSizes, packagings, companyId, companyType, isMonsantoProduct } = this.props;
    const {
      product,
      lots,
      qtyOfWarehouse,
      isUnmodified,
      addingLot,
      isCustomProduct,
      productDealers,
      productDealerInfoDialogOpen,
      dialogType,
      isLoading,
    } = this.state;

    const isSeedCompanyProduct = !isCustomProduct;
    let msrp = isSeedCompanyProduct ? product.msrp : product.costUnit;
    if (product.LineItem) {
      if (JSON.parse(product.LineItem.suggestedEndUserPrice)['NZI']) {
        msrp = JSON.parse(product.LineItem.suggestedEndUserPrice)['NZI'];
      } else {
        msrp = JSON.parse(product.LineItem.suggestedEndUserPrice)[product.LineItem.zoneId[0]];
      }
    }

    let traits = isSeedCompanyProduct ? product.brand : product.name,
      variety = isSeedCompanyProduct ? product.blend : product.type,
      treatment = isSeedCompanyProduct ? product.treatment : product.description,
      seedSize = isSeedCompanyProduct ? product.seedSize : product.seedSize,
      packaging = isSeedCompanyProduct ? product.packaging : product.packaging;

    return (
      <Dialog open={open} onClose={() => onClose(isUnmodified)} fullWidth={true} maxWidth="lg">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            <h3>Dealer To Dealer Transfers</h3>
            <div className={classes.dialogHeaderActions}>
              {/* <Button
                color="primary"
                className={
                  classes.button +
                  " " +
                  classes.white +
                  " " +
                  classes.primary +
                  " " +
                  classes.addButton
                }
                value="Add"
                //onClick={onClose}
              >
                SCAN
              </Button> */}

              <div>
                <Button
                  id="addDealer"
                  color="primary"
                  className={classes.addDealerButton}
                  value="Add"
                  onClick={() =>
                    this.handleProductDealerInfoDialogOpen(isMonsantoProduct ? 'transfer' : 'productDealer')
                  }
                >
                  Add Dealer
                </Button>
                <Button
                  id="addTransfer"
                  color="primary"
                  className={classes.addDealerButton}
                  value="Add"
                  onClick={this.addNewLot}
                  disabled={addingLot}
                >
                  Add Transfer
                </Button>
              </div>
              <IconButton color="inherit" onClick={() => onClose(isUnmodified)} aria-label="Close" id="close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <Grid container className={classes.productGridContainer}>
          <Grid item xs={2} className={classes.productGrid}>
            <p className={classes.productGridHeader}>{isSeedCompanyProduct ? 'Traits' : 'Product'}</p>
            <h4 className={classes.productGridBody}>{traits}</h4>
          </Grid>
          <Grid item xs={2} className={classes.productGrid}>
            <p className={classes.productGridHeader}>{isSeedCompanyProduct ? 'Variety' : 'Type'}</p>
            <h4 className={classes.productGridBody}>{variety}</h4>
          </Grid>
          <Grid item xs={2} className={classes.productGrid}>
            <p className={classes.productGridHeader}>{isSeedCompanyProduct ? 'Treatment' : 'Description'}</p>
            <h4 className={classes.productGridBody}>{treatment}</h4>
          </Grid>
          <Grid item xs={1} className={classes.productGrid}>
            <p className={classes.productGridHeader}>MSRP</p>
            <h4 className={classes.productGridBody}>{msrp}</h4>
          </Grid>

          <Grid item xs={1} className={classes.productGrid}>
            <p className={classes.productGridHeader}>Seed Size</p>
            <h4 className={classes.productGridBody}>{seedSize}</h4>
          </Grid>

          <Grid item xs={1} className={classes.productGrid}>
            <p className={classes.productGridHeader}>Packaging</p>
            <h4 className={classes.productGridBody}>{packaging}</h4>
          </Grid>

          {!isMonsantoProduct && (
            <Grid item xs={3} className={classes.productGrid}>
              <p className={classes.productGridHeader}>Qty of Warehouse</p>
              <h4 className={classes.productGridBody}>{parseFloat(qtyOfWarehouse).toFixed(2)}</h4>
            </Grid>
          )}
        </Grid>
        <Divider />
        <Grid container className={classes.lotGridContainer}>
          {!isMonsantoProduct && (
            <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
              <h4 className={classes.customerNameCol}>{!isMonsantoProduct ? 'Date' : 'shipping Date'}</h4>
            </Grid>
          )}
          {isMonsantoProduct && (
            <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
              <h4 className={classes.customerNameCol}>{!isMonsantoProduct ? 'Date' : 'Delivery Date'}</h4>
            </Grid>
          )}

          {isMonsantoProduct && (
            <Grid item xs={2} className={classes.transferType}>
              <h4 className={classes.customerNameCol}>{'Transfer Type'}</h4>
            </Grid>
          )}

          {!isMonsantoProduct && (
            <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
              <h4 className={classes.customerNameCol}>{isSeedCompanyProduct ? 'Source' : 'Type'}</h4>
            </Grid>
          )}
          <Grid item xs={1} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Lot#</h4>
          </Grid>

          {!isMonsantoProduct && !isSeedCompanyProduct && (
            <Grid item xs={1} style={{ display: 'flex', alignItems: 'center' }}></Grid>
          )}
          {!isMonsantoProduct && (
            <Fragment>
              {isSeedCompanyProduct && (
                <Grid item xs={1} style={{ display: 'flex', alignItems: 'center' }}>
                  <h4 className={classes.customerNameCol}>Seed Size</h4>
                </Grid>
              )}
              {isSeedCompanyProduct && (
                <Grid item xs={1} style={{ display: 'flex', alignItems: 'center' }}>
                  <h4 className={classes.customerNameCol}>Package</h4>
                </Grid>
              )}
              <Grid item xs={isSeedCompanyProduct ? 2 : 3} style={{ display: 'flex', alignItems: 'center' }}>
                <h4 className={classes.customerNameCol}>Dealer Info</h4>
              </Grid>
            </Fragment>
          )}

          {isMonsantoProduct && (
            <Grid item xs={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <h4 className={classes.customerNameCol}>Dealer Name</h4>
            </Grid>
          )}
          <Grid item xs={1} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Quantity</h4>
          </Grid>

          {isMonsantoProduct && (
            <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
              <h4 className={classes.customerNameCol}>NetWeight</h4>
            </Grid>
          )}

          <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>BillOfLanding</h4>
          </Grid>

          <Grid item xs={1} style={{ display: 'flex', alignItems: 'center' }}></Grid>
          {lots &&
            lots
              .filter((item) => item.isReturn === null && item.source !== 'Monsanto Seed Company')
              .map((lot) => (
                <LotField
                  key={lot.id}
                  lot={lot}
                  product={product}
                  seedSizes={seedSizes}
                  packagings={packagings}
                  classes={classes}
                  onSave={this.updateProduct}
                  deleteLot={this.deleteLot}
                  addNewLotClose={this.addNewLotClose}
                  removeNewLot={this.removeNewLot}
                  isSeedCompanyProduct={isSeedCompanyProduct}
                  productDealers={productDealers}
                  isMonsantoProduct={isMonsantoProduct}
                  renderLotsData={this.renderLotsData}
                  lots={lots}
                  isLoading={isLoading}
                />
              ))}
        </Grid>
        {productDealerInfoDialogOpen && (
          <ProductDealerInfoDialog
            open={productDealerInfoDialogOpen}
            onClose={this.handleProductDealerInfoDialogClose}
            companyType={companyType}
            companyId={isNumber(companyId) ? companyId : companyId.id}
            dialogType={dialogType}
          />
        )}
      </Dialog>
    );
  }
}

export default withStyles(lotsDialogStyles)(LotsDialog);
