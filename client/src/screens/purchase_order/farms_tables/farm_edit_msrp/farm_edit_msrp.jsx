import React, { Component } from 'react';
import { withStyles, Grid } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import FormControl from '@material-ui/core/FormControl';

// material dashboard components
import CustomInput from '../../../../components/material-dashboard/CustomInput/CustomInput';
import Button from '../../../../components/material-dashboard/CustomButtons/Button';

import { numberToDollars } from '../../../../utilities';

import { farmEditMSRPStyles } from './farm_edit_msrp.styles';
const typesMap = {
  B: 'SOYBEAN',
  C: 'CORN',
  S: 'SORGHUM',
  // A: 'ALFALFA',
  L: 'CANOLA',
};

class FarmEditMSRP extends Component {
  state = {
    originalMSRP: 0,
    editMSRP: null,
    product: null,
    name: '',
  };

  componentWillMount = () => {
    const { product } = this.props;
    if (product.hasOwnProperty('customProductId')) {
      this.setState({
        product: product.CustomProduct,
        originalMSRP: parseFloat(product.CustomProduct.costUnit),
        editMSRP: product.msrpEdited,
        name: `${product.CustomProduct.name} / ${product.CustomProduct.description}`,
      });
    } else if (product.hasOwnProperty('monsantoProductId')) {
      const seedProduct = product.MonsantoProduct;
      const seedCompanyBrand = typesMap[seedProduct.classification];
      // const order = props.value;
      // const product = order.Product;
      // const msrpEdited = order.order.msrpEdited;
      // const msrp = product.hasOwnProperty('classification')
      //   ? parseFloat(order.preTotal) / parseFloat(order.qty)
      //   : product.hasOwnProperty('customId')
      //   ? product.costUnit
      //   : product.msrp;
      this.setState({
        product: seedProduct,
        originalMSRP: parseFloat(product.price),
        editMSRP: product.msrpEdited,
        name: `${seedCompanyBrand} / ${seedProduct.blend} / ${seedProduct.brand} / ${seedProduct.treatment}`,
      });
    } else {
      let seedProduct = product.Product;
      const seedCompany = seedProduct.SeedCompany;
      const metadata = JSON.parse(seedCompany.metadata);
      let st = seedProduct.seedType.toLowerCase();
      let seedCompanyBrand = '';
      let metadataKeys = Object.keys(metadata);
      let matchingIdx = metadataKeys.map((key) => key.toLowerCase()).indexOf(st);
      if (matchingIdx > -1) seedCompanyBrand = metadata[metadataKeys[matchingIdx]].brandName;
      this.setState({
        product: seedProduct,
        originalMSRP: parseFloat(seedProduct.msrp),
        editMSRP: product.msrpEdited,
        name: `${seedCompanyBrand} / ${seedProduct.blend} / ${seedProduct.brand} / ${seedProduct.treatment}`,
      });
    }
  };

  updateEditMSRP = () => {
    const { product, updateProductMSRP, onClose } = this.props;
    const { editMSRP } = this.state;
    if (editMSRP) {
      updateProductMSRP(product, editMSRP);
      onClose();
    } else {
      onClose();
    }
  };

  render() {
    const { classes, onClose, open } = this.props;
    const { name, originalMSRP, editMSRP } = this.state;

    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="md" style={{ padding: '10px 20px' }}>
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            Edit MSRP for {name}
            <div className={classes.dialogHeaderActions}>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <Grid container className={classes.gridContainer}>
          <Grid item xs={6} className={classes.gridItem}>
            <span className={classes.gridTextTitle}>
              Original MSRP :<span className={classes.gridText}> {numberToDollars(originalMSRP)}</span>
            </span>
          </Grid>
          <Grid item xs={6} className={classes.gridItem}>
            <span className={classes.gridTextTitle}>Edited MSRP : </span>$
            <FormControl className={classes.select}>
              <CustomInput
                //labelText={"Paid By"}
                id="editMSRP"
                inputProps={{
                  className: classes.input,
                  type: 'number',
                  defaultValue: editMSRP,
                  onChange: (e) => this.setState({ editMSRP: e.target.value }),
                }}
              />
            </FormControl>
          </Grid>
        </Grid>
        <Divider />
        <DialogActions style={{ marginBottom: '20px' }}>
          <Button onClick={this.updateEditMSRP} color="primary" className={classes.addButton} id="saveMSRP">
            SAVE
          </Button>
          <Button
            onClick={() => {
              this.setState({
                originalMSRP: 0,
                editMSRP: null,
                product: null,
                name: '',
              });
              onClose();
            }}
            color="primary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default withStyles(farmEditMSRPStyles)(FarmEditMSRP);
