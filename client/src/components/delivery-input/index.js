import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';

// material-ui core components
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Grid from '@material-ui/core/Grid';

const styles = {
  deliveryInput: {
    width: 75,
  },
  deliveryLabel: {
    width: 75,
    color: 'rgba(0, 0, 0, 0.6)',
    transform: 'translate(0, 28.5px) scale(0.75)',
  },
  mutedSpan: {
    color: 'rgba(0, 0, 0, 0.4)',
  },
};

class DeliveryInput extends Component {
  onChangeAmount = (event, lotOrCustomProduct) => {
    let val = event.target.value;

    let amount = val === '' ? 0 : parseInt(val, 10);

    this.props.onSetAmountDelivered(lotOrCustomProduct, amount);
  };

  onButtonClick = (lotOrCustomProduct) => {
    const { orderedQuantity } = this.props;
    let remaining = lotOrCustomProduct.hasOwnProperty('lotNumber')
      ? orderedQuantity - this.getAmountDelivered(lotOrCustomProduct) // is a lot
      : lotOrCustomProduct.quantity - this.getAmountDeliveredCustom(lotOrCustomProduct); // is a custom product
    this.props.onSetAmountDelivered(lotOrCustomProduct, remaining);
  };

  getAmountDelivered(lot) {
    const { updatedData, deliveryReceipts } = this.props;

    let existingUpdate = updatedData.find((d) => d.lotId === lot.id);
    if (existingUpdate !== undefined) return existingUpdate.amount;

    return deliveryReceipts.reduce((acc, deliveryReceipt) => {
      return (
        acc +
        deliveryReceipt.DeliveryReceiptDetails.reduce((x, detail) => {
          return detail.lotId === lot.id ? x + detail.amountDelivered : x;
        }, 0)
      );
    }, 0);
  }

  getAmountDeliveredCustom(customProduct) {
    const { deliveryReceipts, updatedData } = this.props;

    let existingUpdate = updatedData.find((d) => d.customProductId === customProduct.id);
    if (existingUpdate !== undefined) return existingUpdate.amount;

    return deliveryReceipts.reduce((acc, deliveryReceipt) => {
      return (
        acc +
        deliveryReceipt.DeliveryReceiptDetails.reduce((x, detail) => {
          return detail.customProductId === customProduct.id ? x + detail.amountDelivered : x;
        }, 0)
      );
    }, 0);
  }

  getLotPackagingName(lot) {
    let packaging = this.props.packagings.find((p) => p.id === lot.packagingId);
    if (packaging) return packaging.name;
    return '';
  }

  getLotSeedSizeName(lot) {
    let seedSize = this.props.seedSizes.find((ss) => ss.id === lot.seedSizeId);
    if (seedSize) return seedSize.name;
    return '';
  }

  render() {
    const { classes, product, customerOrder, productPackagings, purchaseOrder, orderedQuantity } = this.props;
    let lots = [];
    if (purchaseOrder.isSimple) {
      lots = (product.lots || []).filter(
        (lot) => lot.seedSizeId === customerOrder.seedSizeId && lot.packagingId === customerOrder.packagingId,
      );
    } else {
      let productPackaging = productPackagings.find(
        (pp) => pp.purchaseOrderId === purchaseOrder.id && pp.productId === product.id,
      );
      if (productPackaging) {
        lots = (product.lots || []).filter((lot) =>
          productPackaging.packagingGroups.find(
            (pg) => pg.seedSizeId === lot.seedSizeId && pg.packagingId === lot.packagingId,
          ),
        );
      }
    }
    return (
      <span>
        {!product.hasOwnProperty('companyId') && (
          <React.Fragment>
            {lots.length === 0 && (
              <span className={classes.mutedSpan}>
                please choose a packaging and seed size for this product to make a delivery
              </span>
            )}
            {lots.map((lot) => {
              let amountDelivered = this.getAmountDelivered(lot);

              return (
                <div key={lot.id}>
                  <div>
                    <strong>
                      <Grid container spacing={24}>
                        <Grid item xs={6}>
                          <label>Lot No : {lot.lotNumber} </label> <br />
                          <label>Packaging: {this.getLotPackagingName(lot)}</label> <br />
                          <label>Seed Size: {this.getLotSeedSizeName(lot)}</label>
                        </Grid>

                        <Grid item xs={6}>
                          <label>Order amount: </label>
                          {orderedQuantity - amountDelivered}
                        </Grid>
                      </Grid>
                    </strong>
                  </div>
                  <React.Fragment>
                    <CustomInput
                      id={`${lot.id}`}
                      formControlProps={{
                        required: true,
                      }}
                      inputProps={{
                        value: amountDelivered,
                        onChange: (e) => {
                          this.onChangeAmount(e, lot);
                        },
                        className: classes.deliveryInput,
                        type: 'number',
                        inputProps: {
                          step: 1,
                        },
                      }}
                    />
                    <Button
                      color="info"
                      size="lg"
                      simple
                      onClick={() => {
                        this.onButtonClick(lot);
                      }}
                    >
                      Fill
                    </Button>
                  </React.Fragment>
                </div>
              );
            })}
          </React.Fragment>
        )}

        {product.hasOwnProperty('companyId') && (
          <div>
            <div>
              <strong>
                <label>Order amount: </label>
                {product.quantity - this.getAmountDeliveredCustom(product)}
              </strong>
            </div>
            <React.Fragment>
              <CustomInput
                id={`${product.id}`}
                formControlProps={{
                  required: true,
                }}
                inputProps={{
                  value: this.getAmountDeliveredCustom(product),
                  onChange: (e) => {
                    this.onChangeAmount(e, product);
                  },
                  className: classes.deliveryInput,
                  type: 'number',
                  inputProps: {
                    step: 1,
                  },
                }}
              />
              <Button
                color="info"
                size="lg"
                simple
                onClick={() => {
                  this.onButtonClick(product);
                }}
              >
                Fill
              </Button>
            </React.Fragment>
          </div>
        )}
      </span>
    );
  }
}

export default withStyles(styles)(DeliveryInput);
