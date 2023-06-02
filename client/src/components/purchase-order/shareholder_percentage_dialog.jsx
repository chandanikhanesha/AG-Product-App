import React, { Component } from 'react';
// material ui components
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';

// material dashboard components

class ShareholderPercentageForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      shareHolderValues: {},
      customerValue: null,
    };
  }

  updateCustomerPercentage(val) {
    const { customerProduct } = this.props;
    const currentOrderCustomerData = customerProduct.shareholderData.find(
      (data) => data.shareholderId === 'theCustomer',
    );
    if (currentOrderCustomerData) {
      currentOrderCustomerData.percentage = parseInt(val, 0);
    } else {
      customerProduct.shareholderData.push({
        shareholderId: 'theCustomer',
        percentage: parseInt(val, 0),
      });
    }
    if (customerProduct.hasOwnProperty('customProductId')) {
      this.props.editRelatedCustomProduct(customerProduct.customerId, customerProduct.id, customerProduct);
    } else {
      this.props.editRelatedProduct(customerProduct.customerId, customerProduct.id, customerProduct);
    }
  }

  getShareHoldersData = () => this.props.purchaseOrder.farmData.find((data) => data.farmId === this.props.farmId);

  getCustomerPercentage = () => {
    const { customerProduct } = this.props;
    const customerData = this.getShareHoldersData().shareholderData.find(
      (data) => data.shareholderId === 'theCustomer',
    ) || { shareholderId: 'theCustomer' };

    const currentOrderCustomerData = customerProduct.shareholderData.find(
      (data) => data.shareholderId === 'theCustomer',
    );

    if (
      currentOrderCustomerData &&
      currentOrderCustomerData.hasOwnProperty('percentage') &&
      !Number.isNaN(Number(currentOrderCustomerData.percentage))
    ) {
      return Number(currentOrderCustomerData.percentage);
    } else if (
      customerData &&
      customerData.hasOwnProperty('percentage') &&
      !Number.isNaN(Number(customerData.percentage))
    ) {
      return Number(customerData.percentage);
    }
  };

  getShareHolderPercentage = () =>
    this.props.shareholders
      .map((shareholder) =>
        this.props.customerProduct.shareholderData.find((data) => data.shareholderId === shareholder.id),
      )
      .reduce((initial, shareholder) => {
        if (shareholder && shareholder.hasOwnProperty('percentage') && !Number.isNaN(Number(shareholder.percentage))) {
          return initial + Number(shareholder.percentage);
        } else {
          return initial;
        }
      }, 0);

  render() {
    const { shareholders, classes, subjectName, customer, customerProduct, closeDialog, open } = this.props;
    const { customerValue, shareHolderValues } = this.state;

    const customerDefaultValue = this.getCustomerPercentage();
    const percentError = this.getCustomerPercentage() + this.getShareHolderPercentage();

    return (
      <React.Fragment>
        <Dialog open={open} onClose={closeDialog}>
          <DialogTitle>Add Shareholder %</DialogTitle>

          <DialogContent>
            <p
              style={{
                color: '#f44336',
                opacity: percentError > 100 ? 1 : 0,
                transition: 'opacity .4s',
              }}
            >
              The distributed sharehold percentage is over 100%
            </p>
            <GridContainer>
              <GridItem xs={4}>
                <strong>{customer.name}</strong>
                <br />
                <CustomInput
                  labelText={'percent'}
                  id={'theCustomer-percentage'}
                  formControlProps={{
                    fullWidth: true,
                  }}
                  inputProps={{
                    type: 'number',
                    className: classes.shareHolderInput,
                    inputProps: { min: 0, max: 100 },
                    value: customerValue || customerDefaultValue || '',
                    onChange: (e) => {
                      let inputVal = Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value);
                      this.setState((state) => ({ customerValue: inputVal }));
                      this.updateCustomerPercentage(inputVal);
                    },
                    disabled: subjectName === 'Invoice',
                  }}
                />
              </GridItem>
              {shareholders.map((shareholder) => {
                let currentOrderShareholderData = customerProduct.shareholderData.find(
                  (data) => data.shareholderId === shareholder.id,
                );
                let purchaseOrderShareholderData = this.getShareHoldersData().shareholderData.find(
                  (data) => data.shareholderId === shareholder.id,
                ) || { shareholderId: shareholder.id };

                let updateShareholderPercentage = (val) => {
                  if (currentOrderShareholderData) {
                    currentOrderShareholderData.percentage = parseInt(val, 0);
                  } else {
                    customerProduct.shareholderData.push({
                      shareholderId: shareholder.id,
                      percentage: parseInt(val, 0),
                    });
                  }

                  if (customerProduct.hasOwnProperty('customProductId')) {
                    this.props.editRelatedCustomProduct(
                      customerProduct.customerId,
                      customerProduct.id,
                      customerProduct,
                    );
                  } else {
                    this.props.editRelatedProduct(customerProduct.customerId, customerProduct.id, customerProduct);
                  }
                };

                let shareholderDefaultValue =
                  currentOrderShareholderData && !Number.isNaN(Number(currentOrderShareholderData.percentage))
                    ? Number(currentOrderShareholderData.percentage)
                    : purchaseOrderShareholderData && !Number.isNaN(Number(purchaseOrderShareholderData.percentage))
                    ? Number(purchaseOrderShareholderData.percentage)
                    : '';

                return (
                  <GridItem xs={4} key={shareholder.id}>
                    <strong>{shareholder.name}</strong>
                    <br />
                    <CustomInput
                      labelText={'percent'}
                      id={`${shareholder.id}-percentage`}
                      formControlProps={{
                        fullWidth: true,
                      }}
                      inputProps={{
                        type: 'number',
                        className: classes.shareHolderInput,
                        inputProps: { min: 0, max: 100 },
                        value: shareHolderValues[shareholder.id] || shareholderDefaultValue || '',
                        onChange: (e) => {
                          const inputVal = Number.isNaN(Number(e.target.value)) ? 0 : Number(e.target.value);
                          this.setState((state) => ({ shareHolderValues: { [shareholder.id]: inputVal } }));
                          updateShareholderPercentage(inputVal);
                        },
                        disabled: subjectName === 'Invoice',
                      }}
                    />
                  </GridItem>
                );
              })}
            </GridContainer>
          </DialogContent>

          <DialogActions>
            <Button onClick={closeDialog} color="secondary">
              Cancel
            </Button>
            <Button onClick={closeDialog} color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default ShareholderPercentageForm;
