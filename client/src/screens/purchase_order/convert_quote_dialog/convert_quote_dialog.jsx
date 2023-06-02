import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';

// core components
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';

import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';

import { convertQuoteDialogStyles } from './convert_quote_dialog.styles';

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

class ConvertQuoteDialog extends Component {
  constructor(props) {
    super(props);

    this.state = {
      purchaseOrderName: '',
      selectedPurchaseOrderId: '',
      customerProducts: [],
    };
    this.customerID = parseInt(props.match.params.customer_id, 10);
  }

  componentWillMount = () => {
    const { purchaseOrder } = this.props;
    this.setState({ purchaseOrderName: purchaseOrder.name });
  };

  onPurchaseOrderInputChange(name) {
    this.setState({
      selectedPurchaseOrderId: '',
      purchaseOrderName: name,
    });
  }

  onSelectChange = (event) => {
    this.setState({
      purchaseOrderName: '',
      selectedPurchaseOrderId: event.target.value,
    });
  };

  close = () => {
    this.setState({
      purchaseOrderName: '',
      selectedPurchaseOrderId: '',
    });
    this.props.onClose();
  };

  editProduct = (customerId, customerProductId, quantity, discounts) => {
    const data = {
      productId: customerProductId,
      orderQty: quantity,
      discounts,
    };
    this.props.editCustomerProduct(customerId, customerProductId, data);
  };

  addProducts = (data) => {
    const { selectedPurchaseOrderId } = this.state;
    const { createCustomerProduct, createCustomerCustomProduct } = this.props;

    data.productsToAdd.forEach((product) => {
      const purchaseOrderId = selectedPurchaseOrderId || product.purchaseOrderId;
      const discounts = product.discounts || [];
      const linkFunction = product.hasOwnProperty('companyId') ? createCustomerCustomProduct : createCustomerProduct;
      linkFunction(purchaseOrderId, this.customerID, product.id, product.orderQty, discounts);
    });
  };

  convertQuote = (purchaseOrderId) => {
    const { updatePurchaseOrder, history, convertQuoteToExistingPurchaseOrder, reload } = this.props;
    const { selectedPurchaseOrderId, purchaseOrderName } = this.state;

    if (purchaseOrderName === '' && selectedPurchaseOrderId !== '') {
      convertQuoteToExistingPurchaseOrder(this.customerID, purchaseOrderId, selectedPurchaseOrderId).then(() => {
        history.push(`/app/customers/${this.customerID}/purchase_order/${selectedPurchaseOrderId}`);
        reload();
        this.close();
      });
    } else {
      let data = {
        isQuote: false,
        name: purchaseOrderName,
      };
      updatePurchaseOrder(this.customerId, purchaseOrderId, data).then(() => {
        history.push(`/app/customers/${this.customerID}/purchase_order/${purchaseOrderId}`);
        reload();
        this.close();
      });
    }
  };

  render() {
    const { open, classes, match, purchaseOrders } = this.props;

    const { purchaseOrderName, selectedPurchaseOrderId } = this.state;

    const selectItems = purchaseOrders
      .filter((po) => !po.isQuote && `${po.customerId}` === match.params.customer_id)
      .map((po) => {
        return (
          <MenuItem value={po.id} key={po.id}>
            {po.id} - {po.name}
          </MenuItem>
        );
      });

    return (
      <Dialog
        open={open}
        onClose={() => this.close()}
        TransitionComponent={Transition}
        maxWidth="md"
        classes={{
          paper: classes.paper,
        }}
      >
        <DialogTitle>Convert Quote into Purchase Order</DialogTitle>
        <DialogContent className={classes.contentContainer}>
          <React.Fragment>
            <section className={classes.convertSection}>
              <Typography variant="subheading" color="inherit">
                Create New
              </Typography>
              <FormControl className={classes.purchaseOrderInput}>
                <CustomInput
                  labelText="New Purchase Order"
                  id="name"
                  value={purchaseOrderName}
                  inputProps={{
                    className: classes.nameInput,
                    defaultValue: purchaseOrderName,
                    onChange: (e) => this.onPurchaseOrderInputChange(e.target.value),
                  }}
                />
              </FormControl>
            </section>

            <span className={classes.separator}>OR</span>
            <section className={classes.convertSection}>
              <Typography variant="subheading" color="inherit">
                Existing Purchase Order
              </Typography>
              <FormControl className={`${classes.purchaseOrderInput} ${classes.selectFormControl}`}>
                <InputLabel className={classes.selectLabel} htmlFor="existing-order">
                  Select Purchase Order
                </InputLabel>
                <Select
                  value={selectedPurchaseOrderId}
                  onChange={this.onSelectChange}
                  className={classes.selectContainer}
                  inputProps={{
                    id: 'existing-order',
                  }}
                >
                  {selectItems}
                </Select>
              </FormControl>
            </section>
          </React.Fragment>
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <Button
            id="convertQuote"
            color="primary"
            disabled={!purchaseOrderName && !selectedPurchaseOrderId}
            className={classes.cta}
            onClick={() => this.convertQuote(parseInt(match.params.id, 10))}
          >
            Convert Quote
          </Button>
          <Button onClick={() => this.close()}>Close</Button>
        </DialogActions>
      </Dialog>
    );
  }
}
export default withStyles(convertQuoteDialogStyles)(ConvertQuoteDialog);
