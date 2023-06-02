import React, { Component } from 'react';
//import { flatten } from "lodash/array";

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';

import Button from '../../../components/material-dashboard/CustomButtons/Button';
import { productDealerInfoDialogStyles } from './product_dealer_info_dialog.styles';
import ProductDealerInfoField from './product_dealer_info_field';
//import { getQtyShipped, getGrowerOrderDelivered } from "utilities/product";

class ProductDealerInfoDialog extends Component {
  state = {
    productDealers: [],
    addingProductDealer: false,
    showSnackBar: false,
    messageForSnackBar: '',
  };

  componentWillMount = () => {
    this.renderProductDealersData();
  };

  renderProductDealersData = async () => {
    await this.props.listProductDealers();
    const { productDealers, companyType, companyId } = this.props;
    this.setState({
      productDealers: productDealers
        .filter((productDealer) => productDealer.companyType === companyType && productDealer.companyId === companyId)
        .sort((a, b) => a.id - b.id),
    });
  };

  addNewProductDealer = () => {
    const { productDealers } = this.state;
    let newProductDealer = {
      name: null,
    };
    let newProductDealers = [newProductDealer, ...productDealers];
    this.setState({
      productDealers: newProductDealers,
      addingProductDealer: true,
    });
  };

  removeNewProductDealer = () => {
    const { productDealers } = this.state;
    let newproductDealers = productDealers.filter((productDealer) => productDealer.id !== undefined);
    this.setState({ productDealers: newproductDealers });
  };

  addNewProductDealerClose = () => {
    this.setState({ addingProductDealer: false });
  };

  createProductDealer = (productDealer) => {
    const { createProductDealer, companyType, companyId } = this.props;

    const createData = {
      name: productDealer.name,
      notes: productDealer.notes,
      phone: productDealer.phone,
      email: productDealer.email,
      address: productDealer.address,
      companyType,
      companyId,
    };

    createProductDealer(createData)
      .then((res) => {
        this.addNewProductDealerClose();
        this.renderProductDealersData();
      })
      .catch((e) => {
        const msg = `${e}`;
        this.setState({ showSnackBar: true, messageForSnackBar: msg.includes(404) ? 'Dealer name alredy exits' : msg });
      });
  };

  updateProductDealer = (productDealer) => {
    const { updateProductDealer } = this.props;

    const updateData = {
      id: productDealer.id,
      name: productDealer.name,
      notes: productDealer.notes,
      phone: productDealer.phone,
      email: productDealer.email,
      address: productDealer.address,
    };

    updateProductDealer(updateData).then(() => {
      this.renderProductDealersData();
    });
  };

  deleteProductDealer = (productDealer) => {
    const { deleteProductDealer } = this.props;

    deleteProductDealer(productDealer.id).then(() => {
      this.renderProductDealersData();
    });
  };

  render() {
    const { classes, onClose, open, dialogType } = this.props;
    const { productDealers, addingProductDealer, transfer, showSnackBar, messageForSnackBar } = this.state;
    const vertical = 'top';
    const horizontal = 'right';
    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="md">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            <h3>{dialogType !== 'transfer' ? 'Product Dealer' : 'Dealer'}</h3>
            <div className={classes.dialogHeaderActions}>
              <Button
                id="addDealer2"
                color="primary"
                className={classes.addButton}
                value="Add"
                onClick={this.addNewProductDealer}
                disabled={addingProductDealer}
              >
                {dialogType !== 'transfer' ? 'Add Product Dealer' : 'Add Dealer'}
              </Button>
              <IconButton color="inherit" onClick={onClose} aria-label="Close" id="closeDealer">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />

        <Grid container className={classes.lotGridContainer}>
          <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Name</h4>
          </Grid>
          <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Notes</h4>
          </Grid>
          <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Phone</h4>
          </Grid>
          <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Email</h4>
          </Grid>
          <Grid item xs={2} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Address</h4>
          </Grid>

          {productDealers.map((productDealer) => {
            return (
              <ProductDealerInfoField
                key={productDealer.id}
                productDealer={productDealer}
                classes={classes}
                createProductDealer={this.createProductDealer}
                updateProductDealer={this.updateProductDealer}
                deleteProductDealer={this.deleteProductDealer}
                addNewProductDealerClose={this.addNewProductDealerClose}
                removeNewProductDealer={this.removeNewProductDealer}
              />
            );
          })}

          <Snackbar
            open={showSnackBar}
            autoHideDuration={null}
            onClose={() => this.setState({ showSnackBar: false })}
            anchorOrigin={{ vertical, horizontal }}
            message={messageForSnackBar}
            key={vertical + horizontal}
            onClick={() => this.setState({ showSnackBar: false })}
          ></Snackbar>
        </Grid>
      </Dialog>
    );
  }
}

export default withStyles(productDealerInfoDialogStyles)(ProductDealerInfoDialog);
