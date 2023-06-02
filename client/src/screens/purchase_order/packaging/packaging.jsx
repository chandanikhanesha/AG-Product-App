import React, { Component, Fragment } from 'react';

import { withStyles } from '@material-ui/core/styles';
import ReactTable from 'react-table';
import { withRouter } from 'react-router-dom';

// icons

// material ui
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Popover from '@material-ui/core/Popover';
import Paper from '@material-ui/core/Paper';
import NotificationsIcon from '@material-ui/icons/Notifications';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import LocalOfferIcon from '@material-ui/icons/LocalOffer';

import {
  isUnloadedOrLoading,
  // customerProductDiscountsTotals,
  // numberToDollars
} from '../../../utilities';
import {
  getProductName,
  // getProductFromOrder,
  getProductSeedBrand,
} from '../../../utilities/product.v2';
//import { getAppliedDiscounts } from '../../../utilities/purchase_order'

import { packagingStyles } from './packaging.styles';
import { Divider, Button, Tooltip, Typography } from '@material-ui/core';
import PackagingField from './packaging_field';

class PurchaseOrderPackaging extends Component {
  state = {
    newPackagingGroups: {},
    addNewPackagingGroups: {},
    columns: [
      {
        Header: 'Product',
        accessor: 'productName',
        width: 200,
      },
      {
        Header: 'No. of Units',
        id: 'quantity',
        //accessor: 'quantity',
        minWidth: 150,
        headerStyle: {
          textAlign: 'left',
        },
        accessor: (d) => d,
        Cell: (props) => this.renderQty(props),
      },
      {
        Header: 'Seed Size & Packaging',
        accessor: (d) => d,
        id: 'packaging',
        sortable: false,
        minWidth: 400,
        headerStyle: {
          textAlign: 'left',
        },
        Cell: (props) => this.renderPackagingCell(props),
      },
    ],
    openingDetailAnchorEl: null,
  };

  componentWillMount() {
    const { match, getPurchaseOrderById } = this.props;
    const purchaseOrderId = match.params.id;
    this.props.listDealerDiscounts();
    this.props.listPackagings();
    getPurchaseOrderById(purchaseOrderId);
    // this.props.listProductPackagings()
  }

  get isLoading() {
    const {
      dealerDiscountsStatus,
      packagingsStatus,
      // productPackagingsStatus
    } = this.props;

    return [
      dealerDiscountsStatus,
      packagingsStatus,
      // productPackagingsStatus
    ].some(isUnloadedOrLoading);
  }

  reload() {
    const { match, getPurchaseOrderById } = this.props;
    const purchaseOrderId = match.params.id;
    getPurchaseOrderById(purchaseOrderId);
  }

  /**
   * Builds an object of {key: productId, value: Product[]}
   */
  getGroupedProducts() {
    let groupedProducts = {};
    const { products } = this.props;
    products.forEach((product) => {
      if (!groupedProducts[product.id]) groupedProducts[product.id] = [];
      groupedProducts[product.id].push(product);
    });
    return groupedProducts;
  }

  /**
   * Builds an array of grouped product objects for the table render
   */
  getTableData() {
    const { currentPurchaseOrder } = this.props;
    const orders = currentPurchaseOrder.CustomerProducts;

    // build groupings of customer order / product information
    const groupedProducts = {};
    const seedGroupsHash = {};

    const { ProductPackagings } = currentPurchaseOrder;
    let ProductPackagingsCustomerProductIds = [];
    ProductPackagings.forEach((productPackaging) => {
      productPackaging.packagingGroups.forEach((packagingGroup) =>
        ProductPackagingsCustomerProductIds.push(packagingGroup.CustomerProductId),
      );
    });

    orders
      .sort((a, b) => a.id - b.id)
      .forEach((order) => {
        if (!groupedProducts[order.id]) groupedProducts[order.id] = [];
        const product = order.Product;
        const productName = getProductName(product);
        const seedBrand = getProductSeedBrand(product);
        const qty = order.orderQty;
        const total = parseFloat(product.msrp || product.costUnit) || 0.0 * order.orderQty;
        groupedProducts[order.id].push({
          product,
          productName,
          qty,
          total,
        });
        if (!seedGroupsHash[seedBrand]) {
          seedGroupsHash[seedBrand] = [];
        }
        if (seedGroupsHash[seedBrand].find((product) => product.CustomerProductId === order.id)) {
          seedGroupsHash[seedBrand].map((product) => {
            if (product.CustomerProductId === order.id) {
              return {
                ...product,
                total: (product.total += total),
                quantity: (product.quantity += qty),
              };
            }
            return null;
          });
          return;
        }
        seedGroupsHash[seedBrand].push({
          CustomerProductId: order.id,
          productId: order.productId,
          product,
          order,
          productName,
          quantity: qty,
          total,
        });
      });
    const seedGroups = [];

    Object.keys(seedGroupsHash).forEach((seedGroup) => {
      let productGrouping = seedGroupsHash[seedGroup];
      seedGroups.push({
        title: seedGroup,
        data: productGrouping,
      });
    });

    const demo = seedGroups.map((item) => {
      const filterData = item.data.filter(
        (inneritem, index, self) => index === self.findIndex((t) => t.productId === inneritem.productId),
      );
      return {
        ...item,
        data: filterData,
      };
    });
    // return seedGroups;
    return demo;
  }

  /**
   * Creates or Updates a productPackaging from the state.newPackagingGroups object
   * @param {string} productId
   */
  async handleNewPackagingGroup(productId, CustomerProductId) {
    const { newPackagingGroups } = this.state;
    const {
      createProductPackaging,
      updateProductPackaging,
      currentPurchaseOrder: { ProductPackagings },
    } = this.props;

    // if we dont have a complete packaging group then return (packaging group is {seedSizeId: number, packagingId: number})
    if (!newPackagingGroups[CustomerProductId].packagingId || !newPackagingGroups[CustomerProductId].seedSizeId) return;

    let newPackagingGroup = {
      CustomerProductId,
      packagingId: newPackagingGroups[CustomerProductId].packagingId,
      seedSizeId: newPackagingGroups[CustomerProductId].seedSizeId,
      quantity: newPackagingGroups[CustomerProductId].quantity,
    };
    let existingProductPackaging = ProductPackagings.find(
      (pp) => pp.productId === productId && pp.purchaseOrderId.toString() === this.props.match.params.id,
    );
    let actionFunction = existingProductPackaging ? updateProductPackaging : createProductPackaging;
    let data = {
      purchaseOrderId: this.props.match.params.id,
      productId,
    };

    // if we already have a productPackaging update its attributes, else create a new array
    if (existingProductPackaging) {
      data.id = existingProductPackaging.id;
      data.packagingGroups = existingProductPackaging.packagingGroups.concat([newPackagingGroup]);
    } else {
      data.packagingGroups = [newPackagingGroup];
    }
    await actionFunction(data);

    this.setState({
      newPackagingGroups: {},
    });

    this.reload();
  }

  async updateProductPackaging(data, productId, CustomerProductId, i) {
    const {
      currentPurchaseOrder: { ProductPackagings },
      updateProductPackaging,
    } = this.props;
    let existingProductPackaging = ProductPackagings.find(
      (pp) => pp.productId === productId && pp.purchaseOrderId.toString() === this.props.match.params.id,
    );
    if (!existingProductPackaging) return console.warn('should have found a packaging');
    existingProductPackaging.packagingGroups[i] = {
      ...data,
      CustomerProductId,
    };
    await updateProductPackaging(existingProductPackaging);
    this.reload();
  }

  handlePackagingGroupObjectChange = async (data, productId, CustomerProductId, i) => {
    if (i !== undefined) {
      await this.updateProductPackaging(data, productId, CustomerProductId, i);
      this.reload();
    } else {
      let newPackagingGroups = Object.assign({}, this.state.newPackagingGroups);
      if (!newPackagingGroups[CustomerProductId]) newPackagingGroups[CustomerProductId] = {};
      newPackagingGroups[CustomerProductId] = { ...data, CustomerProductId };
      console.log(newPackagingGroups);
      this.setState({ newPackagingGroups }, () => {
        this.handleNewPackagingGroup(productId, CustomerProductId);
      });
    }
  };

  /**
   * Removes a row from a `productPackaging.packagingGroups`
   */
  deleteproductPackagingGroup = async (productPackaging, i) => {
    const { updateProductPackaging } = this.props;
    productPackaging.packagingGroups.splice(i, 1);
    await updateProductPackaging(productPackaging);
    this.reload();
  };

  /**
   * Returns the amount of backs packaged
   * @param {ProductPackaging} productPackaging
   */
  getTotalPackaged(productPackaging, CustomerProductId) {
    const { packagings } = this.props;
    if (!productPackaging) return 0;
    return (
      productPackaging.packagingGroups
        // .filter(
        //   (_packagingGroup) =>
        //     _packagingGroup.CustomerProductId === CustomerProductId
        // )
        .reduce((acc, packagingGroup) => {
          let packaging = packagings.find((p) => p.id === packagingGroup.packagingId);
          if (!packaging) return acc;
          return acc + (packaging.numberOfBags || 0) * (packagingGroup.quantity || 0);
        }, 0)
    );
  }

  renderQty = (p) => {
    const { classes, currentPurchaseOrder } = this.props;
    const { openingDetailsId } = this.state;
    return (
      <div>
        <p style={{ textAlign: 'left' }}>{p.value.quantity}</p>
        <br />
        {!currentPurchaseOrder.isSimple && (
          <div
            className={classes.detailButton}
            onClick={(e) => {
              this.setState({
                openingDetailsId: p.value.productId,
                openingDetailAnchorEl: e.currentTarget,
                openingDetailData: p.value,
              });
            }}
          >
            {openingDetailsId === p.value.productId ? 'Hide details' : 'View details'}
          </div>
        )}
      </div>
    );
  };

  /**
   * Render the packaging cell within the table
   */
  renderPackagingCell = (p) => {
    const { classes } = this.props;
    const { newPackagingGroups, addNewPackagingGroups } = this.state;
    const productPackaging = p.value.product.ProductPackaging;
    const seedCompany = p.value.product.SeedCompany;
    let totalPackaged = this.getTotalPackaged(productPackaging, p.value.CustomerProductId);
    const availableSeedSizes = seedCompany.SeedSizes.filter(
      (seedSize) => seedSize.seedType === p.value.product.seedType,
    );
    const availablePackagings = seedCompany.Packagings.filter(
      (packaging) => packaging.seedType === p.value.product.seedType,
    );

    const { lots } = p.value.product;
    let warehouseValue = 0;
    // let transferInText = "Transfer In Lot:";
    let transferInTexts = [];
    lots.forEach((lot) => {
      switch (lot.source) {
        case 'Seed Company':
          warehouseValue += parseInt(lot.quantity, 10);
          transferInTexts.push(`${lot.lotNumber} : ${parseInt(lot.quantity, 10)}`);
          break;
        case 'Seed Dealer Transfer In':
          warehouseValue += parseInt(lot.quantity, 10);
          transferInTexts.push(`${lot.lotNumber} : ${parseInt(lot.quantity, 10)}`);
          break;
        case 'Seed Dealer Transfer Out':
          warehouseValue -= parseInt(lot.quantity, 10);
          break;
        default:
          break;
      }
    });
    // transferInText = transferInText.substr(0, transferInText.length - 2);
    return (
      <div>
        <div className={classes.detailRow}>
          <div>
            {productPackaging &&
              productPackaging.packagingGroups
                // .filter(
                //   (_packagingGroup) =>
                //     _packagingGroup.CustomerProductId ===
                //     p.value.CustomerProductId
                // )
                .map((packagingGroup, i) => (
                  <PackagingField
                    onSave={(data) => {
                      this.handlePackagingGroupObjectChange(data, p.value.productId, p.value.CustomerProductId, i);
                    }}
                    key={i}
                    index={i}
                    packagingGroup={packagingGroup}
                    classes={classes}
                    availableSeedSizes={availableSeedSizes}
                    availablePackagings={availablePackagings}
                    onDelete={() => {
                      this.deleteproductPackagingGroup(productPackaging, i);
                    }}
                  />
                ))}

            {!addNewPackagingGroups[p.value.CustomerProductId] ? (
              <Button
                variant="text"
                color="primary"
                onClick={() => {
                  this.setState((state) => ({
                    addNewPackagingGroups: {
                      ...state.addNewPackagingGroups,
                      [p.value.CustomerProductId]: true,
                    },
                  }));
                }}
              >
                + Add
              </Button>
            ) : (
              <PackagingField
                onSave={async (data) => {
                  await this.handlePackagingGroupObjectChange(data, p.value.productId, p.value.CustomerProductId);
                  this.setState((state) => ({
                    addNewPackagingGroups: {
                      ...state.addNewPackagingGroups,
                      [p.value.CustomerProductId]: false,
                    },
                    newPackagingGroups: {
                      ...state.newPackagingGroups,
                      [p.value.CustomerProductId]: {},
                    },
                  }));
                }}
                index={99}
                packagingGroup={newPackagingGroups[p.value.CustomerProductId]}
                classes={classes}
                availableSeedSizes={availableSeedSizes}
                availablePackagings={availablePackagings}
                onDelete={() => {
                  this.setState((state) => ({
                    addNewPackagingGroups: {
                      ...state.addNewPackagingGroups,
                      [p.value.CustomerProductId]: false,
                    },
                    newPackagingGroups: {
                      ...state.newPackagingGroups,
                      [p.value.CustomerProductId]: {},
                    },
                  }));
                }}
              />
            )}
          </div>
          {totalPackaged < p.value.quantity && (
            <Tooltip title="Seed size and packaging information is still pending for this product item">
              <IconButton className={classes.alertButton}>
                <NotificationsIcon />
              </IconButton>
            </Tooltip>
          )}
          {totalPackaged >= p.value.quantity && (
            <Tooltip title="Seed size and packaging information for this product item has been assigned for the entire order">
              <IconButton className={classes.checkButton}>
                <CheckCircleIcon />
              </IconButton>
            </Tooltip>
          )}
          {lots.length > 0 && (
            <Tooltip
              classes={{
                tooltip: classes.customTooltip,
              }}
              // style={{ backgroundColor: "yellow", maxWidth: 220 }}
              title={
                <React.Fragment>
                  {transferInTexts.map((transferInText) => {
                    return <Typography>{transferInText}</Typography>;
                  })}
                  {/* <Typography>{transferInText}</Typography> */}
                  <Typography>Quantity in warehouse: {warehouseValue}</Typography>
                </React.Fragment>
              }
            >
              <IconButton className={classes.checkButton}>
                <LocalOfferIcon />
              </IconButton>
            </Tooltip>
          )}
        </div>
        <Divider></Divider>

        <div>
          <br />
          <strong>Total Packaged : </strong> <span>{totalPackaged}</span>
          {totalPackaged > p.value.quantity && (
            <React.Fragment>
              <br />
              <span className={classes.warning}>The packaged amount is larger than the quantity</span>
            </React.Fragment>
          )}
        </div>
      </div>
    );
  };

  render() {
    const { classes, currentPurchaseOrder } = this.props;
    const { ProductPackagings } = currentPurchaseOrder;
    if (ProductPackagings.length < 1) return null;
    if (this.isLoading) return <CircularProgress />;
    const seedGroups = this.getTableData();
    const { openingDetailAnchorEl, openingDetailData } = this.state;
    return (
      <div>
        <h2>Package & Seed Size</h2>
        {seedGroups.map((group) => (
          <Fragment key={group.title}>
            <h4>{group.title}</h4>
            <Paper className={classes.root}>
              <ReactTable
                loading={this.isLoading}
                columns={this.state.columns}
                data={group.data}
                defaultPageSize={group.data.length}
                showPagination={false}
                getTrProps={(state, rowInfo, column) => {
                  return {
                    style: {
                      borderBottom: '1px solid lightgray',
                    },
                  };
                }}
              />
            </Paper>
          </Fragment>
        ))}

        {openingDetailAnchorEl && (
          <Popover
            open={true}
            anchorEl={openingDetailAnchorEl}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            onClose={() => {
              this.setState({
                openingDetailAnchorEl: null,
                openingDetailsId: null,
                openingDetailData: null,
              });
            }}
          >
            <Paper classes={{ root: classes.detailFarmPaper }}>
              {openingDetailData.order && openingDetailData.order.Farm && <b>{openingDetailData.order.Farm.name}</b>}
              <div className={classes.detailFarmRow}>
                {openingDetailData.order && openingDetailData.order.Farm && (
                  <span>{openingDetailData.order.fieldName}</span>
                )}
                <span>{openingDetailData.order.orderQty}</span>
              </div>
            </Paper>
          </Popover>
        )}
      </div>
    );
  }
}

export default withRouter(withStyles(packagingStyles)(PurchaseOrderPackaging));
