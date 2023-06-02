import React, { Component } from 'react';
import { connect } from 'react-redux';

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

import CloseIcon from '@material-ui/icons/Close';

import Button from '../../components/material-dashboard/CustomButtons/Button';

const styles = {
  cardIcon: {
    color: 'white',
  },
  doneButton: {
    color: 'white',
    background: '#38A154',
  },
  viewArchButton: {
    color: 'white',
    background: '#38A154',
  },
  dialogHeaderTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialogHeaderActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dialogFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  addNewCustomerButton: {
    width: 160,
    textAlign: 'left',
    margin: 'auto',
    textTransform: 'none',
  },
};

class NewPurchaseOrder extends Component {
  state = {
    selectedCustomerId: null,
  };

  componentDidMount() {
    if (this.props.customer !== null) this.setState({ selectedCustomerId: this.props.customers[0].id });
  }

  handleChange = (event) => {
    this.setState({ selectedCustomerId: parseInt(event.target.value, 10) });
  };

  render() {
    const {
      classes,
      onClose,
      open,
      customers,
      handleCreateCustomerDialogStyle,
      handleCreateCustomerFromQTPODialogOpen,
      handleCreatePurchaseOrderDialogOpen,
    } = this.props;

    const { selectedCustomerId } = this.state;

    handleCreateCustomerDialogStyle('PurchaseOrder');

    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="md">
        <DialogTitle>
          <div className={classes.dialogHeaderTitle}>
            New Purchase Order
            <div className={classes.dialogHeaderActions}>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
          {/* <Typography variant="caption" display="block" gutterBottom>
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
            <Typography variant="subheading" gutterBottom>
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
              {customers.map((customer) => (
                <React.Fragment>
                  <Grid item xs={4}>
                    <Radio
                      key={customer.id}
                      checked={selectedCustomerId === customer.id}
                      onChange={this.handleChange}
                      value={customer.id}
                      id={`${customer.name}-radio`}
                    />
                    {customer.name.substring(0, 25)}
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

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
  };
};

export default withStyles(styles)(connect(mapStateToProps, null)(NewPurchaseOrder));
