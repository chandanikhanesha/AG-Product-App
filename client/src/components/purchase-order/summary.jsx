import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import ReactTable from 'react-table';
import { Link } from 'react-router-dom';

// material ui
import CircularProgress from '@material-ui/core/CircularProgress';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';

import { customerProductDiscountsTotals, numberToDollars, isUnloadedOrLoading } from '../../utilities';
import { getProductName, getProductFromOrder } from '../../utilities/product';
import { getAppliedDiscounts } from '../../utilities/purchase_order';
import {
  listShareholders,
  listCustomerProducts,
  listCustomers,
  listProducts,
  listDealerDiscounts,
  listPurchaseOrders,
  getCustomerShareholders,
} from '../../store/actions';

const styles = (theme) => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  table: {
    '& .rt-thead .rt-th:last-child': {
      textAlign: 'left',
    },
  },
});

class PurchaseOrderSummary extends Component {
  state = {
    shareholderId: 'all',
  };

  componentWillMount() {
    this.props.listProducts();
    this.props.listShareholders(this.props.match.params.customer_id);
    this.props.listCustomerProducts();
    this.props.listCustomers();
    this.props.listDealerDiscounts();
    this.props.listPurchaseOrders();
  }

  get customerShareholders() {
    return this.props.getCustomerShareholders(this.props.match.params.customer_id);
  }

  get isLoading() {
    const {
      productsStatus,
      shareholdersStatus,
      customerProductStatus,
      customersStatus,
      dealerDiscountsStatus,
      purchaseOrdersStatus,
    } = this.props;

    return [
      productsStatus,
      customersStatus,
      shareholdersStatus,
      customerProductStatus,
      dealerDiscountsStatus,
      purchaseOrdersStatus,
    ].some(isUnloadedOrLoading);
  }

  getShareholderPercentage(order) {
    const { shareholderId } = this.state;
    if (shareholderId === 'all') return 100;
    if (shareholderId === 'theCustomer') {
      if (order.shareholderData.length) {
        let customerData = order.shareholderData.find((sd) => sd.shareholderId === 'theCustomer');
        if (customerData) return customerData.percentage;
        return 0;
      } else {
        return 100;
      }
    }
  }

  // TODO: refactor this mess
  // a lot of this calculation should be moved into utility functions and then shared with
  // purchase order calculations
  getTableData() {
    const { shareholderId } = this.state;
    const { customerProducts, seedCompanies, purchaseOrders, dealerDiscounts, products } = this.props;

    const purchaseOrder = purchaseOrders.find((po) => po.id.toString() === this.props.match.params.id);
    let discountIds = [];
    let columns = [
      {
        Header: 'Product',
        accessor: 'productName',
      },
      {
        Header: 'Quantity',
        accessor: 'quantity',
      },
    ];

    let groupedProducts = {};
    customerProducts
      .filter((cp) => cp.purchaseOrderId === purchaseOrder.id)
      .forEach((order) => {
        if (!order.farmId) return;
        // load necessary information
        const product = getProductFromOrder(order, products);
        const shareholder = this.customerShareholders.find((sh) => sh.id === shareholderId);
        const discounts = getAppliedDiscounts(order, dealerDiscounts);
        let customerDiscountTotals = customerProductDiscountsTotals(
          order,
          discounts,
          product,
          false,
          false,
          shareholder,
          purchaseOrder,
        );
        const shareholderPercentage =
          this.getShareholderPercentage(order) || customerDiscountTotals.shareholderPercentage;
        const productName = getProductName(product, seedCompanies);

        // if the shareholder doesn't have any % for this order, just return
        if (shareholderPercentage === 0) return;

        // keep a running list of all discount ids used
        Object.keys(customerDiscountTotals.discounts).forEach((discountId) => {
          if (!discountIds.includes(discountId)) discountIds.push(discountId);
        });

        // make sure we have an array in our grouped products for this product id
        if (!groupedProducts[order.productId]) groupedProducts[order.productId] = [];

        // add the data to the grouped producs
        let qty = order.orderQty;
        let total = customerDiscountTotals.total;

        // apply the shareholder percentage
        qty = qty * (shareholderPercentage / 100.0);
        if (!shareholder) total = total * (shareholderPercentage / 100.0);

        let data = {
          product,
          productName,
          qty,
          total,
        };
        Object.keys(customerDiscountTotals.discounts).forEach((discountId) => {
          let discountAmount = customerDiscountTotals.discounts[discountId].amount;
          // apply the shareholder percentage
          if (!shareholder) discountAmount = discountAmount * (shareholderPercentage / 100.0);
          data[`discount${discountId}`] = discountAmount;
        });
        groupedProducts[order.productId].push(data);
      });

    // build the table data
    let tableData = Object.keys(groupedProducts).map((productId) => {
      let productGrouping = groupedProducts[productId];

      let quantity = productGrouping.reduce((acc, obj) => {
        return acc + obj.qty;
      }, 0);
      quantity = quantity.toFixed(2);
      let split = quantity.split('.');
      if (split[1] === '00') quantity = split[0];

      let data = {
        productId: productId,
        product: productGrouping[0].product,
        productName: productGrouping[0].productName,
        quantity,
        total: numberToDollars(
          productGrouping.reduce((acc, obj) => {
            return acc + obj.total;
          }, 0),
        ),
      };

      // add the discount information
      discountIds.forEach((discountId) => {
        data[`discount${discountId}`] = numberToDollars(
          productGrouping.reduce((acc, obj) => {
            return acc + (obj[`discount${discountId}`] || 0);
          }, 0),
        );
      });

      return data;
    });

    // add the discount columns
    discountIds.forEach((discountId) => {
      let dealerDiscount = dealerDiscounts.find((dd) => dd.id.toString() === discountId);
      if (!dealerDiscount) return;
      columns.push({
        Header: dealerDiscount.name,
        accessor: `discount${dealerDiscount.id}`,
      });
    });

    // add the total column
    columns.push({
      Header: 'Total',
      accessor: 'total',
    });

    return { tableData, columns };
  }

  selectShareholder = (e) => {
    this.setState({
      shareholderId: e.target.value,
    });
  };

  render() {
    const { shareholderId } = this.state;
    const { classes, customers, match } = this.props;
    const { customer_id, id } = match.params;
    if (this.isLoading) return <CircularProgress />;

    let { tableData, columns } = this.getTableData();
    const customerId = this.props.match.params.customer_id;
    const customer = customers.find((c) => c.id.toString() === customerId);

    return (
      <div>
        <Paper className={classes.root}>
          <Link to={`/app/customers/${customer_id}/purchase_order/${id}`}>Back to Purchase Order</Link>
          <h4>Purchase Order Summary</h4>

          <FormControl>
            <InputLabel htmlFor={'shareholders'}>Shareholder:</InputLabel>
            <Select
              value={shareholderId}
              onChange={this.selectShareholder}
              input={<Input name="shareholders" id={'shareholders'} />}
            >
              <MenuItem value="all">All Shareholders</MenuItem>
              <MenuItem value="theCustomer">{customer.name}</MenuItem>
              {this.customerShareholders.map((shareholder) => (
                <MenuItem key={shareholder.id} value={shareholder.id}>
                  {shareholder.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <ReactTable
            loading={this.isLoading}
            columns={columns}
            data={tableData}
            defaultPageSize={500}
            showPagination={false}
            className={classes.table + ' -striped -highlight'}
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
      listShareholders,
      listCustomers,
      listDealerDiscounts,
      listPurchaseOrders,
      getCustomerShareholders,
    },
    dispatch,
  );

const mapStateToProps = (state) => {
  return {
    products: state.productReducer.products,
    productsStatus: state.productReducer.loadingStatus,
    shareholders: state.shareholderReducer.shareholders,
    shareholdersStatus: state.shareholderReducer.loadingStatus,
    customerProducts: state.customerProductReducer.customerProducts,
    customerProductStatus: state.customerProductReducer.loadingStatus,
    customers: state.customerReducer.customers,
    customersStatus: state.customerReducer.loadingStatus,
    dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
    dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
    purchaseOrdersStatus: state.purchaseOrderReducer.loadingStatus,
  };
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(PurchaseOrderSummary));
