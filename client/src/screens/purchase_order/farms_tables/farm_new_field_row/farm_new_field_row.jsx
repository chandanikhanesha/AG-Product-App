import React, { Component } from 'react';
import FarmRowExtra from '../farm_row_extra';
import { withStyles, Button } from '@material-ui/core';

import ArrowDown from '@material-ui/icons/KeyboardArrowDown';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

import CustomInput from '../../../../components/material-dashboard/CustomInput/CustomInput';

import { getProductName, getProductSeedBrand } from '../../../../utilities/product.v2';

import { styles } from './farm_new_field_row.styles';

class FarmNewFieldRow extends Component {
  state = {
    fieldName: '',
  };

  renderProductType = (product) => {
    const { classes, seedCompanies } = this.props;
    const seedBrand = getProductSeedBrand(product, seedCompanies);
    return (
      <div className={classes.productDetailItem}>
        <div style={{ marginRight: '20px' }}>
          {seedBrand && <b>{seedBrand}</b>}
          {seedBrand && <br />}
          <b>{getProductName(product)}</b>
          <br />
          MSRP-${product.msrp}
        </div>
        <div>{product.orderQty}</div>
      </div>
    );
  };

  render() {
    const { fieldName } = this.props;
    const { classes, onAddProducts, onOpenProductDialog, selectedProducts, handleFieldNameChange } = this.props;
    return (
      <div className={classes.root}>
        <div className={classes.newFieldRow}>
          <div className={classes.checkItem}>
            <ArrowDown />
          </div>
          <div className={classes.fieldNameItem}>
            <CustomInput
              id="FieldName"
              labelText={'Field Name'}
              inputProps={{
                value: fieldName,
                onChange: handleFieldNameChange,
              }}
            />
          </div>
          <div className={classes.productTypeItem}>
            {selectedProducts ? (
              <div
                style={{
                  flexDirection: 'column',
                }}
              >
                {selectedProducts.productsToOrder.map((product) => {
                  return this.renderProductType(product);
                })}
              </div>
            ) : (
              <Button onClick={onOpenProductDialog} id="addProduct">
                Add Products
              </Button>
            )}
          </div>

          <div className={classes.actionItem}>
            <CloseIcon
              classes={{ root: classes.closeIcon }}
              onClick={() => {
                this.props.onCancel();
              }}
            ></CloseIcon>
            <CheckIcon
              onClick={() => {
                onAddProducts();
              }}
              classes={{ root: classes.checkIcon }}
            ></CheckIcon>
          </div>
        </div>
        <FarmRowExtra shareholders={[]} onAddShareholder={() => {}}></FarmRowExtra>
      </div>
    );
  }
}

export default withStyles(styles)(FarmNewFieldRow);
