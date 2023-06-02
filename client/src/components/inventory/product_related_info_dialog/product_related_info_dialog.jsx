import React, { Component } from 'react';
import ReactTable from 'react-table';
import { flatten } from 'lodash/array';
import WarningIcon from '@material-ui/icons/Warning';
import {
  getWareHouseValue,
  getCustomerProducts,
  getDeliveryLotsQty,
  getDeliveryLotsQtyReturn,
} from '../../../utilities/product';
import { withStyles, DialogContent, Grid, Button } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';
import { productRelatedInfoDialogStyles } from './product_related_info_dialog.styles';
import { Link } from 'react-router-dom';
import {
  getQtyShipped,
  getGrowerOrderDelivered,
  getTransferInAmount,
  getTransferOutAmount,
} from '../../../utilities/product';

class ProductRelatedInfoDialog extends Component {
  state = {};

  columns = [
    {
      Header: 'Purchase Order / Quote',
      id: 'purchaseOrder',
      accessor: (d) => d,
      Cell: (props) => {
        const { purchaseOrder, customer, isSent } = props.value;

        return (
          <Button
            simple={true}
            className={this.props.classes.statementNoButton}
            onClick={() => {
              purchaseOrder.isQuote
                ? this.openInNewtab(`/app/customers/${customer.id}/quote/${purchaseOrder.id}`)
                : this.openInNewtab(`/app/customers/${customer.id}/purchase_order/${purchaseOrder.id}`);
            }}
          >
            {isSent !== true && <WarningIcon style={{ color: '#ff7700' }} />}
            {purchaseOrder.isQuote ? 'Quote' : 'PO'}#{purchaseOrder.id}
          </Button>
        );
      },
    },
    {
      Header: 'Customer',
      id: 'customer',
      accessor: (d) => d,
      Cell: (props) => {
        return props.value.customer.name;
      },
    },
    {
      Header: 'Quantity',
      id: 'quantity',
      accessor: (d) => d,
      headerStyle: { textAlign: 'left' },
      Cell: (props) => {
        return parseFloat(props.value.quantity).toFixed(2);
      },
    },
    {
      Header: 'Qty Delivered',
      id: 'qtyDelivered',
      accessor: (d) => d,
      headerStyle: { textAlign: 'left' },
      Cell: (props) => {
        return parseFloat(props.value.qtyDelivered).toFixed(2);
      },
    },
  ];

  openInNewtab = (url) => {
    let win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  };

  getQtyWarehouse() {
    const { companyType, product, deliveryReceipts } = this.props;
    const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));
    const isSeedCompanyProduct = companyType === 'Seed Company';
    const quatityID = deliveryReceiptDetails.filter(
      (data) =>
        (data.monsantoProductId !== null
          ? data.monsantoProductId
          : data.customProductId !== null
          ? data.customProductId
          : data.productId) === product.id,
    );

    const deliveryQtyisReturn = getDeliveryLotsQtyReturn(quatityID, deliveryReceipts);
    const deliveryQty = getDeliveryLotsQty(quatityID, deliveryReceipts);
    const value = getWareHouseValue(product);
    const productOriginalQuantity = Number.parseInt(0);

    return (
      productOriginalQuantity + value - deliveryQty + deliveryQtyisReturn
      // getQtyShipped(product) +
      // getTransferInAmount(product) -
      // getTransferOutAmount(product) -
      // getGrowerOrderDelivered(product, deliveryReceiptDetails) +
      // (isSeedCompanyProduct ? 0 : parseInt(product.quantity, 10))
    );
  }
  getQtyDelivered() {
    const { companyType, product, deliveryReceipts } = this.props;
    let deliveredQty = 0;
    const deliveryReceiptDetails = flatten(
      deliveryReceipts.filter((d) => d.isReturn == false).map((dr) => dr.DeliveryReceiptDetails),
    );

    const isSeedCompanyProduct = companyType === 'Seed Company';
    const isregularComopany = companyType === 'Company';
    deliveryReceiptDetails
      .filter(
        (item) =>
          (item.monsantoProductId !== null
            ? item.monsantoProductId
            : isSeedCompanyProduct && item.productId !== null
            ? item.productId
            : isregularComopany && item.customProductId !== null && item.customProductId) === product.id,
      )
      .map((item) => {
        deliveredQty += parseFloat(item.amountDelivered);
      });
    return parseFloat(deliveredQty).toFixed(2);
  }
  render() {
    const {
      classes,
      onClose,
      open,
      productRelatedPurchaseOrders,
      companyType,
      product,
      context,
      seedCompanyId,
      isDublicate,
    } = this.props;

    const isSeedCompanyProduct = companyType === 'Seed Company';
    let traits = isSeedCompanyProduct ? product.brand : product.name,
      variety = isSeedCompanyProduct ? product.blend : product.type,
      treatment = isSeedCompanyProduct ? product.treatment : product.description,
      msrp = isSeedCompanyProduct ? product.msrp : product.costUnit;
    const { suggestedDealerPrice, suggestedEndUserPrice } = product.LineItem || {};
    const { zoneIds, selectedZoneId } = this.props;
    let DealerPrice = '';
    let EndUserPrice = '';
    if (!product.msrp && !product.costUnit) {
      if (
        suggestedDealerPrice !== undefined &&
        JSON.parse(suggestedDealerPrice) &&
        JSON.parse(suggestedEndUserPrice)['NZI']
      ) {
        DealerPrice = JSON.parse(suggestedDealerPrice)['NZI'];
        EndUserPrice = JSON.parse(suggestedEndUserPrice)['NZI'];
      } else if (suggestedDealerPrice !== undefined) {
        DealerPrice = JSON.parse(suggestedDealerPrice)[selectedZoneId || zoneIds[0]];
        EndUserPrice = JSON.parse(suggestedEndUserPrice)[selectedZoneId || zoneIds[0]];
      } else {
        DealerPrice = 0;
        EndUserPrice = 0;
      }
      // msrp = DealerPrice || EndUserPrice;
      msrp = EndUserPrice;
    }
    const qtyOfWarehouse = this.getQtyWarehouse();
    const qtyDelivered = this.getQtyDelivered();
    const quotes = productRelatedPurchaseOrders
      ? productRelatedPurchaseOrders
          .filter((product) => product.purchaseOrder.isQuote)
          .sort((a, b) => a.purchaseOrder.id - b.purchaseOrder.id)
      : [];

    const purchaseOrders = productRelatedPurchaseOrders
      ? productRelatedPurchaseOrders
          .filter((product) => product.purchaseOrder.isQuote === false)
          .sort((a, b) => a.purchaseOrder.id - b.purchaseOrder.id)
      : [];

    const data = context === 'purchase_orders' ? [...purchaseOrders] : [...quotes];
    const tableData = data;

    const link = isDublicate
      ? `/app/swapProduct/${seedCompanyId}/${product.id}/${product.crossReferenceId}`
      : `/app/swapProduct/${seedCompanyId}/${product.id}/000`;

    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="md">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            <h3 id="productInfo">Product Related Info</h3>
            <div className={classes.dialogHeaderActions}>
              {isSeedCompanyProduct && product.hasOwnProperty('classification') && (
                <Button id="swapProduct">
                  <a href={link}>Swap Product</a>
                </Button>
              )}
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <Grid container className={classes.productGridContainer}>
          <Grid item xs={2} className={classes.productGrid}>
            <p className={classes.productGridHeader}>{isSeedCompanyProduct ? 'Traits' : 'Product'}</p>
            <h3 className={classes.productGridBody}>{traits}</h3>
          </Grid>
          <Grid item xs={2} className={classes.productGrid}>
            <p className={classes.productGridHeader}>{isSeedCompanyProduct ? 'Variety' : 'Type'}</p>
            <h3 className={classes.productGridBody}>{variety}</h3>
          </Grid>
          <Grid item xs={2} className={classes.productGrid}>
            <p className={classes.productGridHeader}>{isSeedCompanyProduct ? 'Treatment' : 'Description'}</p>
            <h3 className={classes.productGridBody}>{treatment}</h3>
          </Grid>
          <Grid item xs={2} className={classes.productGrid}>
            <p className={classes.productGridHeader}>MSRP</p>
            <h3 className={classes.productGridBody}>{msrp}</h3>
          </Grid>
          <Grid item xs={2} className={classes.productGrid}>
            <p className={classes.productGridHeader}>Qty of Warehouse</p>
            <h3 className={classes.productGridBody}>{parseFloat(qtyOfWarehouse).toFixed(2)}</h3>
          </Grid>
          <Grid item xs={2} className={classes.productGrid}>
            <p className={classes.productGridHeader}>QtyDelivered</p>
            <h3 className={classes.productGridBody}>{qtyDelivered}</h3>
          </Grid>
        </Grid>
        <Divider />
        <DialogContent>
          {tableData.filter((f) => f.quantity > 0 && f.isSent == true).length > 0 && (
            <div>
              {' '}
              <h5>Synced</h5>
              <ReactTable
                data={tableData.filter((f) => f.quantity > 0 && f.isSent == true)}
                resizable={true}
                pageSize={tableData ? tableData.length : 0}
                columns={this.columns}
                showPagination={false}
              />
            </div>
          )}
          {tableData.filter((f) => f.quantity > 0 && f.isSent !== true).length > 0 && (
            <div>
              <h5>Not Synced</h5>
              <ReactTable
                data={tableData.filter((f) => f.quantity > 0 && f.isSent !== true)}
                resizable={true}
                pageSize={tableData ? tableData.length : 0}
                columns={this.columns}
                showPagination={false}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }
}

export default withStyles(productRelatedInfoDialogStyles)(ProductRelatedInfoDialog);
