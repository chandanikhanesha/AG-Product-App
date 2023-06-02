import React, { Component } from 'react';
import axios from 'axios';
import Snackbar from '@material-ui/core/Snackbar';

import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Button from '../../../components/material-dashboard/CustomButtons/Button';

import { withStyles, DialogContent, Grid } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';

import CloseIcon from '@material-ui/icons/Close';
import { FetchUnitsDialogStyles } from './fetch_units_dialog.styles';

class FetchUnitsDialog extends Component {
  state = {
    fetchQtyValue: '',
    isFetch: false,
    fetchData: '',
    showSnackBar: false,
    messageForSnackBar: '',
  };

  openInNewtab = (url) => {
    let win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  };

  fetchProductBookingSummary = (id) => {
    const { seedCompanyId, product } = this.props;
    this.setState({ isFetch: true });

    axios
      .get(
        `${process.env.REACT_APP_API_BASE}/monsanto/sync/fetchQtyProductBookingSummary?seedCompanyId=${seedCompanyId}&fetchQty=${this.state.fetchQtyValue}&productId=${product.crossReferenceId}`,
        {
          headers: { 'x-access-token': localStorage.getItem('authToken') },
        },
      )
      .then((response) => {
        if (response.data.data.identifier == 'E') {
          this.setState({ showSnackBar: true, messageForSnackBar: response.data.data.description });
        } else {
          this.setState({ showSnackBar: true, messageForSnackBar: 'Product fetch succesfully' });
        }
        this.setState({ isFetch: false });
      })
      .catch((e) => {
        console.log('e : ', e);
      });
  };

  render() {
    const { classes, onClose, open, product, context, seedCompanyId, isDublicate, tableData } = this.props;
    const headerData = tableData && tableData.filter((p) => p.productId == product.id)[0];
    const vertical = 'top';
    const horizontal = 'right';
    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="md">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            <h3 id="productInfo">Fetch Additional or Return Supply</h3>
            <div className={classes.dialogHeaderActions}>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <Grid container className={classes.productGridContainer}>
          <Grid item xs={2} className={classes.productGrid}>
            <p className={classes.productGridHeader}>ProductDetail</p>
            <h3 className={classes.productGridBody}>{headerData.productDetail}</h3>
          </Grid>
          <Grid item xs={2} className={classes.productGrid}>
            <p className={classes.productGridHeader}>
              DemandAll <br></br>GrowersQty
            </p>
            <h3 className={classes.productGridBody}>{headerData.allGrowerQty}</h3>
          </Grid>
          <Grid item xs={1} className={classes.productGrid}>
            <p className={classes.productGridHeader}>Long/Short</p>
            <h3 className={classes.productGridBody}>{headerData.longShort}</h3>
          </Grid>
          <Grid item xs={2} className={classes.productGrid}>
            <p className={classes.productGridHeader}>
              BayerDealer<br></br> BucketQty
            </p>
            <h3 className={classes.productGridBody}>{headerData.bayerDealerBucketQty}</h3>
          </Grid>
          <Grid item xs={1} className={classes.productGrid}>
            <p className={classes.productGridHeader}>
              Total<br></br>Demand
            </p>
            <h3 className={classes.productGridBody}>{headerData.demand}</h3>
          </Grid>
          <Grid item xs={1} className={classes.productGrid}>
            <p className={classes.productGridHeader}>Supply</p>
            <h3 className={classes.productGridBody}>{headerData.supply}</h3>
          </Grid>
          <Grid item xs={2} className={classes.productGrid}>
            <p className={classes.productGridHeader}>LastSyncDate</p>
            <h3 className={classes.productGridBody}>{headerData.action.retailOrderSummaryLasySyncDate}</h3>
          </Grid>
          <Grid item xs={1} className={classes.productGrid}>
            <p className={classes.productGridHeader}>
              Product<br></br> AvailableQty
            </p>
            <h3 className={classes.productGridBody}>{headerData.availableQuantity}</h3>
          </Grid>
        </Grid>
        <Divider />
        <DialogContent>
          <div className={classes.fetchDiv}>
            <CustomInput
              labelText="Fetch Qty"
              id="fetchQty"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                className: classes.fetchInput,
                type: 'number',
                max: headerData.longShort > 0 ? 0 : Math.abs(headerData.longShort),
                min: 0,

                value: this.state.fetchQtyValue,
                onChange: (e) => {
                  this.setState({
                    fetchQtyValue:
                      headerData.longShort > 0
                        ? ''
                        : e.target.value <= Math.abs(headerData.longShort)
                        ? e.target.value
                        : '',
                  });
                },
              }}
            />

            <Button
              id="fetchQtyBtn"
              color="primary"
              className={classes.fetchbtn}
              disabled={this.state.fetchQtyValue == '' || 0 || this.state.isFetch ? true : false}
              value="Add"
              onClick={() => this.fetchProductBookingSummary()}
            >
              Fetch Additional Quantity
            </Button>
          </div>
        </DialogContent>
        <Snackbar
          open={this.state.showSnackBar}
          autoHideDuration={null}
          onClose={() => this.setState({ showSnackBar: false })}
          anchorOrigin={{ vertical, horizontal }}
          message={this.state.messageForSnackBar}
          key={vertical + horizontal}
          onClick={() => this.setState({ showSnackBar: false })}
        ></Snackbar>
      </Dialog>
    );
  }
}

export default withStyles(FetchUnitsDialogStyles)(FetchUnitsDialog);
