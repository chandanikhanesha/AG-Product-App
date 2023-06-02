import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import { flatten } from 'lodash/array';
import { Link } from 'react-router-dom';

//icons
import Assignment from '@material-ui/icons/Assignment';

// core components
import Table from '../material-dashboard/Table/Table';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import TextField from '@material-ui/core/TextField';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../components/material-dashboard/Card/CardFooter';
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import { warningColor, cardTitle, dangerColor } from '../../assets/jss/material-dashboard-pro-react';

import { getProductName, getGrowerOrderDelivered } from '../../utilities/product';

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

const styles = {
  svg: {
    marginLeft: 8,
    position: 'absolute',
    bottom: '-3px',
  },
  productDelivered: {
    position: 'relative',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    display: 'inline-block',
    fontSize: 30,
  },
  select: {
    width: 200,
  },
  cardContainer: {
    marginBottom: 0,
    boxShadow: 'none',
  },
  CTABar: {
    marginRight: 20,
  },
  secondaryCta: {
    backgroundColor: '#999',
  },
  paperFullScreen: {
    overflowX: 'hidden',
  },
  cardIconTitle: {
    ...cardTitle,
    marginTop: '15px',
    marginBottom: '0px',
  },
  nameInput: {
    float: 'right',
  },
  deliveryInput: {
    width: 50,
  },
  warning: {
    color: warningColor,
  },
  danger: {
    color: dangerColor,
  },
};

const emptyCell = () => {
  return <span>&nbsp;</span>;
};

class DeliveryModal extends Component {
  state = {
    updatedData: [],
    data: [],
    deliveredBy: '',
    tableHeaders: [
      'Product',
      'Packaging',
      'Seed Size',
      'Order',
      'Yet to be delivered',
      'Lot No',
      'Qty at warehouse',
      'Delivery amt',
    ],
  };

  onChangeAmount = (event, lotOrCustomProduct) => {
    let val = event.target.value;
    this.onSetAmountDelivered(lotOrCustomProduct, val);
  };

  getOriginalAmountDelivered(lot) {
    const { deliveryReceipts } = this.props;

    return deliveryReceipts.reduce((acc, deliveryReceipt) => {
      return (
        acc +
        deliveryReceipt.DeliveryReceiptDetails.reduce((x, detail) => {
          return detail.lotId === lot.id ? x + detail.amountDelivered : x;
        }, 0)
      );
    }, 0);
  }

  getUpdatedAmountDelivered(lot) {
    const { updatedData } = this.state;

    let existingUpdate = updatedData.find((d) => d.lotId === lot.id);
    if (existingUpdate !== undefined) return existingUpdate.amount;
    return 0;
  }

  getAmountDeliveredCustom(customProduct) {
    const { updatedData } = this.state;
    const { deliveryReceipts } = this.props;

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

  customProductInput(product) {
    return (
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
            className: this.props.classes.deliveryInput,
            type: 'number',
            inputProps: {
              step: 1,
            },
          }}
        />
      </React.Fragment>
    );
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

  tableData = () => {
    const {
      getTableData,
      customerOrders,
      seedCompanies,
      deliveryReceipts,
      purchaseOrder,
      classes,
      productPackagings,
      customerId,
    } = this.props;
    let deliveryReceiptDetails = flatten(
      deliveryReceipts.filter((dr) => dr.purchaseOrderId === purchaseOrder.id).map((dr) => dr.DeliveryReceiptDetails),
    );

    let productGroupings = {};

    // returns an array of {customerOrder, product} for every customer order
    getTableData(customerOrders).forEach((data) => {
      if (!productGroupings[data.product.id]) {
        productGroupings[data.product.id] = { product: data.product, customerOrders: [data.customerOrder] };
        return;
      }

      productGroupings[data.product.id].customerOrders.push(data.customerOrder);
    });

    let data = [];

    Object.keys(productGroupings).forEach((id) => {
      let grouping = productGroupings[id];
      let ordered = grouping.customerOrders.reduce((acc, order) => {
        return acc + parseInt(order.orderQty, 10);
      }, 0);

      // if custom product
      if (grouping.product.hasOwnProperty('companyId')) {
        data.push([
          getProductName(grouping.product, seedCompanies),
          emptyCell(),
          emptyCell(),
          ordered,
          ordered - getGrowerOrderDelivered(grouping.product, deliveryReceiptDetails),
          emptyCell(),
          emptyCell(),
          this.customProductInput(grouping.product),
        ]);
      } else {
        let productPackaging = productPackagings
          .filter((pp) => pp.purchaseOrderId === purchaseOrder.id)
          .find((pp) => pp.productId === grouping.product.id);
        if (!productPackaging || productPackaging.packagingGroups.length === 0) {
          data.push([
            getProductName(grouping.product, seedCompanies),
            emptyCell(),
            emptyCell(),
            <Link to={`/app/customers/${customerId}/purchase_order/${purchaseOrder.id}/packaging`}>
              Create packaging to make a delivery
            </Link>,
            emptyCell(),
            emptyCell(),
            emptyCell(),
          ]);
        } else {
          productPackaging.packagingGroups.forEach((packaging) => {
            let lots = grouping.product.lots.filter(
              (lot) => lot.packagingId === packaging.packagingId && lot.seedSizeId === packaging.seedSizeId,
            );
            if (lots.length === 0) {
              data.push([
                getProductName(grouping.product, seedCompanies),
                this.getLotPackagingName(packaging),
                this.getLotSeedSizeName(packaging),
                packaging.quantity,
                emptyCell(),
                <Link to={`/app/seed_companies/${grouping.product.seedCompanyId}/${grouping.product.id}/edit`}>
                  Add a lot to make a delivery
                </Link>,
                emptyCell(),
                emptyCell(),
              ]);
              return;
            }
            let allLotsDelivered = lots.reduce(
              (acc, lot) =>
                acc + this.getOriginalAmountDelivered(lot) + (parseInt(this.getUpdatedAmountDelivered(lot), 0) || 0),
              0,
            );
            let yetToBeDelivered = packaging.quantity - allLotsDelivered;
            lots.forEach((lot, idx) => {
              let lotAmountDelivered =
                this.getOriginalAmountDelivered(lot) + (parseInt(this.getUpdatedAmountDelivered(lot), 0) || 0);
              if (idx === 0) {
                data.push([
                  getProductName(grouping.product, seedCompanies),
                  this.getLotPackagingName(lot),
                  this.getLotSeedSizeName(lot),
                  packaging.quantity,
                  <span className={yetToBeDelivered < 0 ? classes.danger : ''}>{yetToBeDelivered}</span>,
                  <span>
                    <b>{lot.lotNumber}</b>
                  </span>,
                  lot.orderAmount - lotAmountDelivered,
                  <CustomInput
                    id={`${lot.id}`}
                    formControlProps={{
                      required: true,
                    }}
                    inputProps={{
                      value: this.getUpdatedAmountDelivered(lot),
                      onChange: (e) => {
                        this.onChangeAmount(e, lot);
                      },
                      className: classes.deliveryInput,
                      type: 'number',
                      inputProps: {
                        step: 1,
                      },
                    }}
                  />,
                ]);
              } else {
                data.push([
                  emptyCell(),
                  this.getLotPackagingName(lot),
                  this.getLotSeedSizeName(lot),
                  emptyCell(),
                  emptyCell(),
                  <span>
                    <b>{lot.lotNumber}</b>
                  </span>,
                  lot.orderAmount - lotAmountDelivered,
                  <CustomInput
                    id={`${lot.id}`}
                    formControlProps={{
                      required: true,
                    }}
                    inputProps={{
                      value: this.getUpdatedAmountDelivered(lot),
                      onChange: (e) => {
                        this.onChangeAmount(e, lot);
                      },
                      className: classes.deliveryInput,
                      type: 'number',
                      inputProps: {
                        step: 1,
                      },
                    }}
                  />,
                ]);
              }
            });
          });
        }
      }
    });

    data.push(
      this.state.tableHeaders.map((th) => {
        return <span style={{ fontWeight: 600, fontSize: '1.25em' }}>{th}</span>;
      }),
    );

    return data;
  };

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  onCancel = () => {
    this.setState({
      updatedData: [],
    });
    this.close();
  };

  close = () => {
    this.props.onClose();
  };

  onSetAmountDelivered = (lotOrCustomProduct, amount) => {
    let updatedData = Object.assign([], [...this.state.updatedData]);

    if (lotOrCustomProduct.hasOwnProperty('lotNumber')) {
      let existing = updatedData.find((d) => d.lotId === lotOrCustomProduct.id);
      if (existing) {
        existing.amount = amount;
      } else {
        updatedData.push({ lotId: lotOrCustomProduct.id, amount });
      }
    } else {
      let existing = updatedData.find((d) => d.customProductId === lotOrCustomProduct.id);
      if (existing) {
        existing.amount = amount;
      } else {
        updatedData.push({ customProductId: lotOrCustomProduct.id, amount });
      }
    }

    this.setState({
      updatedData,
    });
  };

  submitProduct = () => {
    const { updatedData, deliveredBy } = this.state;
    const { purchaseOrder, addDeliveryReceipt, listProducts } = this.props;

    listProducts();
    addDeliveryReceipt(purchaseOrder.id, updatedData, deliveredBy);
    this.onCancel();
  };

  render() {
    const { classes, open } = this.props;

    return (
      <Dialog
        open={open}
        onEnter={this.clear}
        onBackdropClick={this.onCancel}
        onEscapeKeyDown={this.onCancel}
        TransitionComponent={Transition}
        maxWidth={false}
        fullScreen={true}
        classes={{
          paperFullScreen: classes.paperFullScreen,
        }}
      >
        <GridContainer>
          <GridItem xs={12}>
            <Card className={classes.cardContainer}>
              <CardHeader color="gray" icon>
                <CardIcon color="gray">
                  <Assignment />
                </CardIcon>

                <h4 className={classes.cardIconTitle}>Log Deliveries Made</h4>
                <TextField
                  id="name"
                  className={classes.nameInput}
                  label="Delivered by (optional):"
                  value={this.state.deliveredBy}
                  onChange={this.handleChange('deliveredBy')}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  margin="normal"
                />
              </CardHeader>

              <CardBody>
                <Table tableHead={this.state.tableHeaders} tableData={this.tableData()} />
              </CardBody>
              <CardFooter>
                <div>
                  <Button color="primary" className={classes.CTABar} disabled={false} onClick={this.submitProduct}>
                    Submit
                  </Button>
                  <Button className={classes.secondaryCta} onClick={this.onCancel}>
                    Cancel
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </GridItem>
        </GridContainer>
      </Dialog>
    );
  }
}

export default withStyles(styles)(DeliveryModal);
