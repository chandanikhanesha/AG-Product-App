import React, { Component } from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { getFutureDiscountTotals, getOrderSummary } from '../../utilities/purchase_order';

// material-dashboard
import Table from '../../components/material-dashboard/Table/Table';

// material-ui
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import { customerProductDiscountsTotals } from '../../utilities';
import { getProductFromOrder } from '../../utilities/product';
import { getAppliedDiscounts } from '../../utilities/purchase_order';

class DiscountsSummary extends Component {
  state = {
    customer: null,
    view: 'default',
  };

  componentWillMount() {
    const customer = this.props.customers.find((customer) => customer.id === this.props.purchaseOrder.customerId);
    this.setState({
      customer,
    });
  }

  containsEarlyPayDiscount(discountTotals) {
    const { dealerDiscounts } = this.props;
    let earlyDiscount = dealerDiscounts
      .filter((dd) => new Date() <= new Date(dd.lastDate))
      .find((dd) => dd.discountStrategy === 'Early Pay Discount');
    if (!earlyDiscount) return false;

    const usingEarlyPayDiscount = discountTotals.some((discountTotal) =>
      Object.keys(discountTotal.discounts).includes(earlyDiscount.id.toString()),
    );

    if (!usingEarlyPayDiscount) return false;

    return earlyDiscount;
  }

  tableHeaders(shareholder) {
    const { dealerDiscounts } = this.props;
    let discountTotals;
    if (shareholder) {
      const customerOrders = this.props.customerOrders.filter((order) => order.farmId !== null);
      discountTotals = this.getShareholderDiscountTotals(customerOrders, shareholder);
    } else {
      discountTotals = this.props.discountTotals;
    }

    let headers = dealerDiscounts
      .filter((discount) => {
        return discountTotals.map((total) => Object.keys(total.discounts).includes(discount.id.toString()));
      })
      .map((discount) => discount.name);

    headers.push('Total Discount');
    headers.push('MSRP');
    headers.push('Total');

    // append leading column if we're dealing with early pay discounts
    if (this.containsEarlyPayDiscount(discountTotals)) headers = ['pay by:'].concat(headers);

    return headers;
  }

  getShareholderDiscountTotals(customerOrders, shareholder) {
    const { purchaseOrder, products, business, dealerDiscounts } = this.props;
    let discountTotals = [];
    customerOrders.forEach((order) => {
      const product = getProductFromOrder(order, products, business);
      let appliedDiscounts = getAppliedDiscounts(order, dealerDiscounts);
      let customerProductDiscounts = customerProductDiscountsTotals(
        order,
        appliedDiscounts,
        product,
        false,
        false,
        shareholder,
        purchaseOrder,
      );
      discountTotals.push(customerProductDiscounts);
    });
    return discountTotals;
  }

  getTableDataForShareholder(shareholder) {
    const { dealerDiscounts, purchaseOrder, business, products } = this.props;
    const customerOrders = this.props.customerOrders.filter((order) => order.farmId !== null);
    const discountTotals = this.getShareholderDiscountTotals(customerOrders, shareholder);
    let dataRow = getOrderSummary({ discountTotals, dealerDiscounts });
    let earlyDiscount = this.containsEarlyPayDiscount(discountTotals);

    if (!earlyDiscount) return [dataRow];

    dataRow = [format(earlyDiscount.detail[0].date, 'MM/DD/YYYY')].concat(dataRow);

    let tableData = [dataRow];
    let futureDiscountTotals = getFutureDiscountTotals({
      customerOrders,
      shareholder,
      dealerDiscounts,
      purchaseOrder,
      products,
      customProducts: business,
    });

    Object.keys(futureDiscountTotals).forEach((date) => {
      let discountTotals = futureDiscountTotals[date];
      const hasDiscount = (discountTotal) => discountTotal.total !== discountTotal.originalPrice;
      if (discountTotals.some(hasDiscount)) {
        // show only is has at least ONE applicable  discount
        if (discountTotals.length) {
          let dataRow = getOrderSummary({ discountTotals, dealerDiscounts });
          dataRow = [format(date, 'MM/DD/YY')].concat(dataRow);
          tableData.push(dataRow);
        }
      }
    });

    return tableData;
  }

  tableData() {
    const { discountTotals, customerOrders, dealerDiscounts, purchaseOrder, products, business } = this.props;
    const futureDiscountTotals = getFutureDiscountTotals({
      customerOrders,
      shareholder: null,
      dealerDiscounts,
      purchaseOrder,
      products,
      customProducts: business,
    });

    let dataRow = getOrderSummary({ discountTotals, dealerDiscounts });
    let earlyDiscount = this.containsEarlyPayDiscount(discountTotals);
    if (earlyDiscount) {
      dataRow = [format(earlyDiscount.detail[0].date, 'MM/DD/YYYY')].concat(dataRow);
    }

    let tableData = [dataRow];

    if (!earlyDiscount) return tableData;

    Object.keys(futureDiscountTotals).forEach((date) => {
      let discountTotals = futureDiscountTotals[date];
      let dataRow = getOrderSummary({ discountTotals, dealerDiscounts });
      dataRow = [format(date, 'MM/DD/YY')].concat(dataRow);
      tableData.push(dataRow);
    });

    return tableData;
  }

  setView(view) {
    this.setState({
      view,
    });
  }

  get selectedShareholders() {
    const { view, customer } = this.state;
    const { shareholders } = this.props;

    let selectedShareholders = [];
    if (view === 'default') {
      selectedShareholders = shareholders.filter((sh) => sh.customerId === customer.id);
    } else if (view !== 'customer') {
      selectedShareholders = shareholders.filter((sh) => sh.id === view && sh.customerId === customer.id);
    }
    return selectedShareholders;
  }

  render() {
    const { shareholders, classes, subjectName, match } = this.props;
    const { customer, view } = this.state;
    const { customer_id, id } = match.params;
    const customerShareholders = shareholders.filter((shareholder) => customer.id === shareholder.customerId);

    return (
      <div>
        <Link style={{ display: 'block', marginBottom: 10 }} to={`/app/customers/${customer_id}/purchase_order/${id}`}>
          Back to Purchase Order
        </Link>
        {subjectName !== 'Invoice' && (
          <React.Fragment>
            <Select value={view} onChange={(e) => this.setView(e.target.value)}>
              <MenuItem value={'default'}>All Shareholders</MenuItem>
              <MenuItem value={'customer'}>{customer.name}</MenuItem>
              {customerShareholders.map((shareholder) => (
                <MenuItem key={shareholder.id} value={shareholder.id}>
                  {shareholder.name}
                </MenuItem>
              ))}
            </Select>

            <br />
            <br />
          </React.Fragment>
        )}

        {view === 'default' && (
          <Card className={classes.discountSummaryCard}>
            <CardContent>
              <h4>Overall Discounts Summary</h4>

              <Table tableHead={this.tableHeaders()} tableData={this.tableData()} />
            </CardContent>
          </Card>
        )}

        {subjectName !== 'Invoice' && (view === 'default' || view === 'customer') && (
          <Card className={classes.discountSummaryCard}>
            <CardContent>
              <h4>{customer.name}</h4>

              <Table
                tableHead={this.tableHeaders({ id: 'theCustomer' })}
                tableData={this.getTableDataForShareholder({ id: 'theCustomer' })}
              ></Table>
            </CardContent>
          </Card>
        )}

        {subjectName !== 'Invoice' &&
          this.selectedShareholders.map((shareholder) => (
            <Card key={shareholder.id} className={classes.discountSummaryCard}>
              <CardContent>
                <h4>{shareholder.name}</h4>

                <Table
                  tableHead={this.tableHeaders(shareholder)}
                  tableData={this.getTableDataForShareholder(shareholder)}
                />
              </CardContent>
            </Card>
          ))}
      </div>
    );
  }
}

export default DiscountsSummary;
