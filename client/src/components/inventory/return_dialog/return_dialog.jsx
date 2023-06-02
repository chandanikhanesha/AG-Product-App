import React, { Component, Fragment } from 'react';
import { flatten } from 'lodash/array';
import { filter, isNumber } from 'lodash';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';

import CloseIcon from '@material-ui/icons/Close';

import Button from '../../../components/material-dashboard/CustomButtons/Button';
import ProductDealerInfoDialog from '../product_dealer_info_dialog';

import { ReturnDialogStyles } from './return_dialog_styles';
import ReturnField from './return_field';
import AddReturnField from './add_return_field';
import {
  getQtyShipped,
  getGrowerOrderDelivered,
  getTransferInAmount,
  getTransferOutAmount,
} from '../../../utilities/product';

class ReturnDialog extends Component {
  state = {
    product: {},
    lots: [],
    returnLots: [],
    isUnmodified: true,
    qtyOfWarehouse: null,
    addReturnLot: false,
    addReceivedLot: false,
    isCustomProduct: false,
    suggestions: [],
    productDealerInfoDialogOpen: false,
    productDealers: [],
    dialogType: '',
  };

  componentWillMount = () => {
    const isCustomProduct = this.props.productType === 'custom';
    this.setState({ isCustomProduct });
  };
  componentDidMount = () => {
    this.renderLotsData({ isFirstTime: true });
    this.renderLotsReceiveData({ isFirstTime: true });
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
      // lots: isCustomProduct ? product.customLots : product.lots || [],
      returnLots: isCustomProduct ? product.customLots : product.lots || [],
      qtyOfWarehouse: qtyOfWarehouse,
      isUnmodified: isFirstTime,
      productDealers: productDealers
        .filter((productDealer) => productDealer.companyType === companyType && productDealer.companyId === companyId)
        .sort((a, b) => a.id - b.id),
    });
  };
  renderLotsReceiveData = async ({ isFirstTime } = {}) => {
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
      // returnLots: isCustomProduct ? product.customLots : product.lots || [],
      qtyOfWarehouse: qtyOfWarehouse,
      isUnmodified: isFirstTime,
      productDealers: productDealers
        .filter((productDealer) => productDealer.companyType === companyType && productDealer.companyId === companyId)
        .sort((a, b) => a.id - b.id),
    });
  };
  onUpdate = (lot) => {
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

    // const filterData = this.state.lots.filter((item) => item.lotNumber === lot.lotNumber);

    if (isMonsantoProduct) {
      const data = {
        quantity: lot.quantity,
        lotNumber: lot.lotNumber,
        monsantoProductId: id,
        lotId: lot.id,
        isReturn: true,
        crossReferenceId: crossReferenceId,

        netWeight: lot.netWeight,
        deliveryDate: lot.deliveryDate,
        shipNotice: lot.shipNotice,
      };

      updateMonsantoProduct(data)
        .then(() => {
          this.props.listMonsantoProducts();
          setTimeout(() => {
            lot.isReturn !== true ? this.renderLotsReceiveData() : this.renderLotsData();
          }, 100);
        })
        .catch((error) => {
          console.log('error', error);
        });
    } else {
      let updateFunction = isCustomProduct ? updateCustomProduct : updateProduct;
      let modifiedLotRows = [];

      if (lot.source === ('Seed Dealer Transfer In' || 'Seed Dealer Transfer Out')) {
        modifiedLotRows.push({ ...lot, orderAmount: 0, removeMe: false, isReturn: lot.isReturn });
      } else {
        modifiedLotRows.push({ ...lot, removeMe: false, isReturn: lot.isReturn });
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
      }).then(() => {
        setTimeout(() => {
          lot.isReturn !== true ? this.renderLotsReceiveData() : this.renderLotsData();
        }, 100);
      });
    }
  };

  addReturnNewLot = () => {
    const { returnLots, isCustomProduct } = this.state;
    let newLot = {
      lotNumber: null,
      quantity: 0,
      deliveryDate: new Date(),
      isReturn: true,
      shipNotice: 0,
    };
    let newLots = [newLot, ...returnLots];
    this.setState({ returnLots: newLots, addReturnLot: true });
  };
  addReceivedNewLot = () => {
    const { lots, isCustomProduct } = this.state;
    let newLot = {
      lotNumber: null,
      quantity: 0,
      netWeight: null,
      deliveryDate: new Date(),
      isReturn: false,
      shipDate: new Date(),
      deliveryNoteNumber: null,
      shipNotice: 0,
    };
    let newLots = [newLot, ...lots];
    this.setState({ lots: newLots, addReceivedLot: true });
  };

  removeNewReturnLot = () => {
    const { returnLots } = this.state;
    let newlots = returnLots.filter((lot) => lot.id !== undefined);
    this.setState({ returnLots: newlots });
  };
  removeNewReceivedLot = () => {
    const { lots } = this.state;
    let newlots = lots.filter((lot) => lot.id !== undefined);
    this.setState({ lots: newlots });
  };

  addReturnLotClose = () => {
    this.setState({ addReturnLot: false });
  };

  addReceivedLotClose = () => {
    this.setState({ addReceivedLot: false });
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
        .then(() => {
          this.props.listMonsantoProducts();
          setTimeout(() => {
            lot.isReturn !== true ? this.renderLotsReceiveData() : this.renderLotsData();
          }, 100);
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
        lot.isReturn !== true ? this.renderLotsReceiveData() : this.renderLotsData();
      });
    }
  };

  render() {
    const { classes, onClose, open, seedSizes, packagings, companyId, companyType, isMonsantoProduct } = this.props;
    const {
      product,
      lots,
      qtyOfWarehouse,
      isUnmodified,
      addReturnLot,
      addReceivedLot,
      isCustomProduct,
      productDealers,
      productDealerInfoDialogOpen,
      dialogType,
      returnLots,
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
            <h3>Dealer Received & Returns</h3>

            <div className={classes.dialogHeaderActions}>
              <IconButton color="inherit" onClick={() => onClose(isUnmodified)} aria-label="Close">
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
        </Grid>
        <Divider />
        <div className={classes.return_Title}>
          <h4>Received</h4>
          {!isMonsantoProduct && (
            <Button
              id="addReceived"
              color="primary"
              className={classes.addDealerButton}
              value="Add"
              onClick={this.addReceivedNewLot}
              disabled={addReceivedLot}
            >
              Add Received
            </Button>
          )}
        </div>
        <Grid container className={classes.lotGridContainer}>
          <div style={{ display: 'flex' }}>
            <Grid item>
              <h4 className={isMonsantoProduct ? classes.customerNameCol : classes.regularCol}>Shipping Date</h4>
            </Grid>

            <Grid item>
              <h4 className={isMonsantoProduct ? classes.customerNameCol : classes.regularCol}>Delivery Date</h4>
            </Grid>
            {isMonsantoProduct && (
              <Grid item>
                <h4 className={isMonsantoProduct ? classes.customerNameCol : classes.regularCol}>Delivery Note</h4>
              </Grid>
            )}

            <Grid item>
              <h4 className={isMonsantoProduct ? classes.customerNameCol : classes.regularCol}>Bill of Lading</h4>
            </Grid>

            <Grid item>
              <h4 className={isMonsantoProduct ? classes.customerNameCol : classes.regularCol}>Lot#</h4>
            </Grid>

            {isMonsantoProduct && (
              <Grid item>
                <h4 className={isMonsantoProduct ? classes.customerNameCol : classes.regularCol}>Shipped Qty</h4>
              </Grid>
            )}

            {!isMonsantoProduct && (
              <Grid item>
                <h4 className={isMonsantoProduct ? classes.customerNameCol : classes.regularCol}>Ordered Qty</h4>
              </Grid>
            )}

            <Grid item>
              <h4 className={isMonsantoProduct ? classes.customerNameCol : classes.regularCol}>Received Qty </h4>
            </Grid>
            {isMonsantoProduct && (
              <Grid item>
                <h4 className={isMonsantoProduct ? classes.customerNameCol : classes.regularCol}>Net Weight</h4>
              </Grid>
            )}
          </div>

          <Grid item xs={1} style={{ display: 'flex', alignItems: 'center' }}></Grid>

          {(isMonsantoProduct
            ? lots.filter(
                (item) => item.isReturn === false && item.isAccepted == true && item.source == 'Monsanto Seed Company',
              )
            : lots.filter((item) => item.isReturn === false)
          ).map((lot) => (
            <ReturnField
              key={lot.id}
              lot={lot}
              product={product}
              seedSizes={seedSizes}
              packagings={packagings}
              classes={classes}
              onSave={this.onUpdate}
              deleteLot={this.deleteLot}
              addReceivedLotClose={this.addReceivedLotClose}
              removeNewReceivedLot={this.removeNewReceivedLot}
              isSeedCompanyProduct={isSeedCompanyProduct}
              productDealers={productDealers}
              isMonsantoProduct={isMonsantoProduct}
              renderLotsData={this.renderLotsData}
              lots={lots}
            />
          ))}
        </Grid>
        <div className={classes.return_Title}>
          <h4>Return</h4>
          <Button
            id="addReturn"
            color="primary"
            className={classes.addDealerButton}
            value="Add"
            onClick={this.addReturnNewLot}
            disabled={addReturnLot}
          >
            Add Return
          </Button>
        </div>

        <Grid container className={classes.lotGridContainer}>
          <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Delivery Date</h4>
          </Grid>

          <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Lot#</h4>
          </Grid>

          <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}> Qty</h4>
          </Grid>

          {isMonsantoProduct && (
            <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
              <h4 className={classes.customerNameCol}>Net Weight</h4>
            </Grid>
          )}
          <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Bill of Lading</h4>
          </Grid>

          <Grid item xs={1} style={{ display: 'flex', alignItems: 'center' }}></Grid>
          {returnLots
            .filter((item) => item.isReturn === true)
            .map((lot) => (
              <AddReturnField
                key={lot.id}
                lot={lot}
                product={product}
                seedSizes={seedSizes}
                packagings={packagings}
                classes={classes}
                onSaveReturn={this.onUpdate}
                deleteLot={this.deleteLot}
                addReturnLotClose={this.addReturnLotClose}
                removeNewLot={this.removeNewReturnLot}
                isSeedCompanyProduct={isSeedCompanyProduct}
                productDealers={productDealers}
                isMonsantoProduct={isMonsantoProduct}
                lots={returnLots}
              />
            ))}
        </Grid>
      </Dialog>
    );
  }
}

export default withStyles(ReturnDialogStyles)(ReturnDialog);
