import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';

// icons
import DeleteIcon from '@material-ui/icons/Delete';

// material ui
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import Button from '../../components/material-dashboard/CustomButtons/Button';

import Print from '@material-ui/icons/Print';

import { isUnloadedOrLoading, customerProductDiscountsTotals, numberToDollars } from '../../utilities';
import { getProductName, getProductFromOrder } from '../../utilities/product';
import { getAppliedDiscounts } from '../../utilities/purchase_order';

import {
  listProducts,
  listCustomerProducts,
  listDealerDiscounts,
  listPackagings,
  listSeedSizes,
  listProductPackagings,
  createProductPackaging,
  updateProductPackaging,
} from '../../store/actions';

const styles = (theme) => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  packagingFormControl: {
    paddingRight: 10,
    width: 125,
  },
  quantityInput: {
    width: 65,
  },
  warning: {
    color: '#f44336',
  },
  printButton: {
    marginLeft: 10,
  },
});

class PurchaseOrderPackaging extends Component {
  state = {
    newPackagingGroups: {},
    columns: [
      {
        Header: 'Product',
        accessor: 'productName',
      },
      {
        Header: 'Quantity',
        accessor: 'quantity',
        width: 150,
      },
      {
        Header: 'Total',
        id: 'total',
        accessor: (d) => d.total,
        Cell: (props) => <span>{numberToDollars(props.value)}</span>,
        width: 150,
      },
      {
        Header: 'Packaging',
        accessor: (d) => d,
        id: 'packaging',
        sortable: false,
        headerStyle: {
          textAlign: 'left',
        },
        Cell: (props) => this.renderPackagingCell(props),
      },
    ],
  };

  componentWillMount() {
    this.props.listProducts();
    this.props.listCustomerProducts();
    this.props.listDealerDiscounts();
    this.props.listPackagings();
    this.props.listSeedSizes();
    this.props.listProductPackagings();
  }

  print() {
    window.print();
  }

  get isLoading() {
    const {
      productsStatus,
      customerProductStatus,
      dealerDiscountsStatus,
      packagingsStatus,
      seedSizesStatus,
      productPackagingsStatus,
    } = this.props;

    return [
      productsStatus,
      customerProductStatus,
      dealerDiscountsStatus,
      packagingsStatus,
      seedSizesStatus,
      productPackagingsStatus,
    ].some(isUnloadedOrLoading);
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
    const { customerProducts, seedCompanies, products, dealerDiscounts } = this.props;
    let orders = customerProducts.filter(
      (order) =>
        order.farmId !== null &&
        order.farmId !== undefined &&
        order.purchaseOrderId.toString() === this.props.match.params.id,
    );

    // build groupings of customer order / product information
    const groupedProducts = {};
    orders.forEach((order) => {
      if (!groupedProducts[order.productId]) groupedProducts[order.productId] = [];
      const product = getProductFromOrder(order, products);
      const discounts = getAppliedDiscounts(order, dealerDiscounts);
      let customerProductDiscounts = customerProductDiscountsTotals(order, discounts, product);
      const productName = getProductName(product, seedCompanies);
      const qty = order.orderQty;
      const total = customerProductDiscounts.total;
      groupedProducts[order.productId].push({ product, productName, qty, total });
    });

    // return the sum of information (qty, total) for each product grouping
    return Object.keys(groupedProducts).map((productId) => {
      let productGrouping = groupedProducts[productId];

      return {
        productId: productId,
        product: productGrouping[0].product,
        productName: productGrouping[0].productName,
        quantity: productGrouping.reduce((acc, obj) => {
          return acc + obj.qty;
        }, 0),
        total: productGrouping.reduce((acc, obj) => {
          return acc + obj.total;
        }, 0),
      };
    });
  }

  /**
   * Creates or Updates a productPackaging from the state.newPackagingGroups object
   * @param {string} productId
   */
  handleNewPackagingGroup(productId) {
    const { newPackagingGroups } = this.state;
    const { createProductPackaging, updateProductPackaging, productPackagings } = this.props;

    // if we dont have a complete packaging group then return (packaging group is {seedSizeId: number, packagingId: number})
    if (!newPackagingGroups[productId].packagingId || !newPackagingGroups[productId].seedSizeId) return;

    let newPackagingGroup = {
      packagingId: newPackagingGroups[productId].packagingId,
      seedSizeId: newPackagingGroups[productId].seedSizeId,
    };
    let existingProductPackaging = productPackagings.find(
      (pp) => pp.productId.toString() === productId && pp.purchaseOrderId.toString() === this.props.match.params.id,
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

    actionFunction(data).then(() => {
      this.setState({
        newPackagingGroups: {},
      });
    });
  }

  /**
   * Updates a `packagingGroup` row for a productPackaging
   * @param {string} attribute packagingId or seedSizeId
   * @param {string} productId Product id for the productPackaging
   * @param {number} i packagingGroup row index to update
   * @param {number} value new value for the ``attribute`
   */
  updateProductPackagingRow(attribute, productId, i, value) {
    const { productPackagings, updateProductPackaging } = this.props;
    let existingProductPackaging = productPackagings.find(
      (pp) => pp.productId.toString() === productId && pp.purchaseOrderId.toString() === this.props.match.params.id,
    );
    if (!existingProductPackaging) return console.warn('should have found a packaging');
    existingProductPackaging.packagingGroups[i][attribute] = value;
    updateProductPackaging(existingProductPackaging);
  }

  /**
   * Handle select change and update an attribute for a `productPackaging.packagingGroups` row
   */
  handlePackagingGroupChange = (attribute, productId, i) => (event) => {
    if (i !== undefined) {
      this.updateProductPackagingRow(attribute, productId, i, event.target.value);
    } else {
      let newPackagingGroups = Object.assign({}, this.state.newPackagingGroups);
      if (!newPackagingGroups[productId]) newPackagingGroups[productId] = {};
      newPackagingGroups[productId][attribute] = event.target.value;
      this.setState({ newPackagingGroups }, () => {
        this.handleNewPackagingGroup(productId);
      });
    }
  };

  /**
   * Removes a row from a `productPackaging.packagingGroups`
   */
  deleteproductPackagingGroup = (productPackaging, i) => (event) => {
    const { updateProductPackaging } = this.props;
    productPackaging.packagingGroups.splice(i, 1);
    updateProductPackaging(productPackaging);
  };

  /**
   * Returns the amount of backs packaged
   * @param {ProductPackaging} productPackaging
   */
  getTotalPackaged(productPackaging) {
    const { packagings } = this.props;
    if (!productPackaging) return 0;
    return productPackaging.packagingGroups.reduce((acc, packagingGroup) => {
      let packaging = packagings.find((p) => p.id === packagingGroup.packagingId);
      if (!packaging) return acc;
      return acc + (packaging.numberOfBags || 0) * (packagingGroup.quantity || 0);
    }, 0);
  }

  /**
   * Render the packaging cell within the table
   */
  renderPackagingCell = (p) => {
    const { newPackagingGroups } = this.state;
    const { classes, packagings, seedSizes } = this.props;
    let productPackaging = this.props.productPackagings.find(
      (pp) =>
        pp.productId.toString() === p.value.productId && pp.purchaseOrderId.toString() === this.props.match.params.id,
    );
    let totalPackaged = this.getTotalPackaged(productPackaging);
    const availableSeedSizes = seedSizes.filter(
      (ss) => ss.seedCompanyId === p.value.product.seedCompanyId && ss.seedType === p.value.product.seedType,
    );
    const availablePackagings = packagings.filter(
      (pkg) => pkg.seedCompanyId === p.value.product.seedCompanyId && pkg.seedType === p.value.product.seedType,
    );
    return (
      <div>
        {productPackaging &&
          productPackaging.packagingGroups.map((packagingGroup, i) => (
            <div key={i}>
              <FormControl className={classes.packagingFormControl}>
                <InputLabel htmlFor={`packagings-${i}`}>Packaging</InputLabel>
                <Select
                  value={packagingGroup.packagingId}
                  onChange={this.handlePackagingGroupChange('packagingId', p.value.productId, i)}
                  input={<Input name="packaging" id={`packagings-${i}`} />}
                >
                  {availablePackagings.map((packaging) => (
                    <MenuItem key={packaging.id} value={packaging.id}>
                      {packaging.name} - {packaging.numberOfBags}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl className={classes.packagingFormControl}>
                <InputLabel htmlFor={`seedsizes-${i}`}>Seed Size</InputLabel>
                <Select
                  value={packagingGroup.seedSizeId}
                  onChange={this.handlePackagingGroupChange('seedSizeId', p.value.productId, i)}
                  input={<Input name="packaging" id={`seedsizes-${i}`} />}
                >
                  {availableSeedSizes.map((seedSize) => (
                    <MenuItem key={seedSize.id} value={seedSize.id}>
                      {seedSize.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                className={classes.quantityInput}
                label="Quantity"
                value={packagingGroup.quantity}
                id={`quantity-${i}`}
                type="number"
                onChange={this.handlePackagingGroupChange('quantity', p.value.productId, i)}
              />

              <IconButton
                className="hide-print"
                aria-label="Delete"
                onClick={this.deleteproductPackagingGroup(productPackaging, i)}
              >
                <DeleteIcon />
              </IconButton>
            </div>
          ))}

        <div className="hide-print">
          <FormControl className={classes.packagingFormControl}>
            <InputLabel htmlFor={`packagings`}>Packaging</InputLabel>
            <Select
              value={(newPackagingGroups[p.value.productId] || {}).packagingId || ''}
              onChange={this.handlePackagingGroupChange('packagingId', p.value.productId)}
              input={<Input name="packaging" id={`packagings`} />}
            >
              {availablePackagings.map((packaging) => (
                <MenuItem key={packaging.id} value={packaging.id}>
                  {packaging.name} - {packaging.numberOfBags}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl className={classes.packagingFormControl}>
            <InputLabel htmlFor={`seedsizes`}>Seed Size</InputLabel>
            <Select
              value={(newPackagingGroups[p.value.productId] || {}).seedSizeId || ''}
              onChange={this.handlePackagingGroupChange('seedSizeId', p.value.productId)}
              input={<Input name="packaging" id={`seedsizes`} />}
            >
              {availableSeedSizes.map((seedSize) => (
                <MenuItem key={seedSize.id} value={seedSize.id}>
                  {seedSize.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </div>

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
    const { classes, match } = this.props;
    if (this.isLoading) return <CircularProgress />;
    const { customer_id, id } = match.params;
    const tableData = this.getTableData();

    return (
      <div>
        <div>
          <Link className="hide-print" to={`/app/customers/${customer_id}/purchase_order/${id}`}>
            Back to Purchase Order
          </Link>
          <Button className={'hide-print ' + classes.printButton} onClick={this.print} color="info">
            <Print />
          </Button>
        </div>
        <Paper className={classes.root}>
          <h4>Purchase Order Packaging</h4>
          <ReactTable
            loading={this.isLoading}
            columns={this.state.columns}
            data={tableData}
            defaultPageSize={tableData.length}
            showPagination={false}
            className={'-striped -highlight'}
          />
        </Paper>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listProducts,
      listCustomerProducts,
      listDealerDiscounts,
      listPackagings,
      listSeedSizes,
      listProductPackagings,
      createProductPackaging,
      updateProductPackaging,
    },
    dispatch,
  );

const mapStateToProps = (state) => {
  return {
    products: state.productReducer.products,
    productsStatus: state.productReducer.loadingStatus,
    customerProducts: state.customerProductReducer.customerProducts,
    customerProductStatus: state.customerProductReducer.loadingStatus,
    dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
    dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    packagings: state.packagingReducer.packagings,
    packagingsStatus: state.packagingReducer.loadingStatus,
    seedSizes: state.seedSizeReducer.seedSizes,
    seedSizesStatus: state.seedSizeReducer.loadingStatus,
    productPackagings: state.productPackagingReducer.productPackagings,
    productPackagingsStatus: state.productPackagingReducer.loadingStatus,
  };
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(PurchaseOrderPackaging));
