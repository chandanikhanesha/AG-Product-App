import React, { Component } from 'react';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import FormControl from '@material-ui/core/FormControl';
import Axios from 'axios';
import CloseIcon from '@material-ui/icons/Close';

import Button from '../../../components/material-dashboard/CustomButtons/Button';

import { newPurchaseOrderStyles } from './new_purchase_order.styles';

class NewPurchaseOrder extends Component {
  state = {
    selectedCustomerId: null,
    customers: [],
  };

  componentDidMount = async () => {
    Axios.get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
      headers: { 'x-access-token': localStorage.getItem('authToken') },
    });
    if (this.props.customers !== null) {
      const filteredCustomer = this.props.customers.filter((item) => item.name !== 'Bayer Dealer Bucket');
      this.setState({ customers: [...filteredCustomer] }, () => {
        if (this.state.customers.length > 0) {
          this.setState({ selectedCustomerId: this.state.customers[0].id });
        }
      });
    }
  };

  handleChange = (event) => {
    this.setState({ selectedCustomerId: parseInt(event.target.value, 10) });
  };

  render() {
    const {
      classes,
      onClose,
      open,
      handleCreateCustomerDialogStyle,
      handleCreateCustomerFromQTPODialogOpen,
      handleCreatePurchaseOrderDialogOpen,
    } = this.props;
    const { customers } = this.state;
    const { selectedCustomerId } = this.state;

    handleCreateCustomerDialogStyle('PurchaseOrder');

    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ classes: { root: classes.dialogStyle } }}
      >
        <DialogTitle>
          <div className={classes.dialogHeaderTitle}>
            New Purchase Order
            <div className={classes.dialogHeaderActions}>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
          {/* <Typography
            variant="caption"
            display="block"
            gutterBottomclassName={classes.dialogHeaderSubTitle}
          >
            New Quote creates a new set of quote for the customer. If it is a
            revision of one of the existing quotes, then you can click on “Add
            Version”
          </Typography> */}
          <Divider />
        </DialogTitle>

        <DialogContent>
          <div>
            {/* ["display4","display3","display2","display1","headline","title",
          "subheading","body2","body1","caption","button"] */}
            <Typography variant="subheading" gutterBottom className={classes.dialogContentTitle}>
              Select Customer
              <Button
                className={classes.addNewCustomerButton}
                simple={true}
                color="primary"
                onClick={() => {
                  handleCreateCustomerDialogStyle('Purchase Order');
                  handleCreateCustomerFromQTPODialogOpen();
                  onClose();
                }}
              >
                Add New Customer
              </Button>
            </Typography>
          </div>
          <FormControl component="fieldset">
            <Grid container>
              {customers
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((customer) => (
                  <React.Fragment>
                    <Grid item xs={4}>
                      <Radio
                        key={customer.id}
                        checked={selectedCustomerId === customer.id}
                        onChange={this.handleChange}
                        value={customer.id}
                        id={`${customer.name}-radio`}
                      />
                      <span className={classes.radioLabel}>{customer.name.substring(0, 25)}</span>
                    </Grid>
                  </React.Fragment>
                ))}
            </Grid>
          </FormControl>
        </DialogContent>
        <Divider />
        <DialogTitle>
          <div className={classes.dialogFooter}>
            <Button
              id="addPo"
              color="primary"
              className={classes.doneButton}
              onClick={() => {
                handleCreatePurchaseOrderDialogOpen(parseInt(selectedCustomerId, 10), false)();
                onClose();
              }}
            >
              CREATE PURCHASE ORDER
            </Button>
          </div>
        </DialogTitle>
      </Dialog>
    );
  }
}

export default withStyles(newPurchaseOrderStyles)(NewPurchaseOrder);
