import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';

// core components
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  listPurchaseOrders,
  listProducts,
  listCustomerProducts,
  listCustomerCustomProducts,
  listDealerDiscounts,
  listCustomers,
  listShareholders,
  listAllCustomProducts,
  getCustomerShareholders,
} from '../../store/actions';
import { isUnloadedOrLoading } from '../../utilities';
import { getOrderTotals } from '../../utilities/purchase_order';

import DiscountsSummary from './discounts_summary';

const styles = {
  discountSummaryCard: {
    marginBottom: 20,
  },
};

class DiscountSummaryContextual extends Component {
  componentWillMount() {
    this.props.listCustomers();
    this.props.listPurchaseOrders();
    this.props.listProducts();
    this.props.listCustomerCustomProducts(this.props.match.params.customer_id);
    this.props.listCustomerProducts();
    this.props.listDealerDiscounts();
    this.props.listShareholders(this.props.match.params.customer_id);
    this.props.listAllCustomProducts();
  }

  get isLoading() {
    const {
      purchaseOrdersStatus,
      productsStatus,
      customerProductsStatus,
      customerCustomProductsStatus,
      dealerDiscountsStatus,
      businessStatus,
    } = this.props;

    return [
      purchaseOrdersStatus,
      customerProductsStatus,
      customerCustomProductsStatus,
      dealerDiscountsStatus,
      productsStatus,
      businessStatus,
    ].some(isUnloadedOrLoading);
  }

  getPurchaseOrder() {
    return this.props.purchaseOrders.find((po) => `${po.id}` === `${this.props.match.params.id}`);
  }

  getCustomerOrders() {
    const { customerProducts, customerCustomProducts, match } = this.props;
    const purchaseOrder = this.getPurchaseOrder();

    let orders = customerProducts.filter((rp) => rp.customerId.toString() === match.params.customer_id);
    let customOrders = customerCustomProducts.filter((ccp) => ccp.customerId.toString() === match.params.customer_id);

    return orders.concat(customOrders).filter((orders) => orders.purchaseOrderId === purchaseOrder.id);
  }

  render() {
    const { products, business, dealerDiscounts, getCustomerShareholders, customers } = this.props;
    const purchaseOrder = this.getPurchaseOrder();
    const customer = customers.find((customer) => customer.id === purchaseOrder.customerId);
    if (!purchaseOrder || this.isLoading) {
      return <CircularProgress />;
    }

    const customerOrders = this.getCustomerOrders();
    const shareholders = getCustomerShareholders(customer.id);

    return (
      <div>
        <DiscountsSummary
          {...this.props}
          shareholders={shareholders}
          purchaseOrder={purchaseOrder}
          customerOrders={customerOrders}
          discountTotals={getOrderTotals({
            customerOrders,
            products,
            customProducts: business,
            dealerDiscounts,
          })}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
    products: state.productReducer.products,
    productsStatus: state.productReducer.loadingStatus,
    business: state.customProductReducer.products,
    businessStatus: state.customProductReducer.loadingStatus,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
    purchaseOrdersStatus: state.purchaseOrderReducer.loadingStatus,
    customerProducts: state.customerProductReducer.customerProducts,
    customerProductsStatus: state.customerProductReducer.loadingStatus,
    customerCustomProducts: state.customerCustomProductReducer.customerCustomProducts,
    customerCustomProductsStatus: state.customerCustomProductReducer.loadingStatus,
    dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
    dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listPurchaseOrders,
      listProducts,
      listCustomerCustomProducts,
      listCustomerProducts,
      listDealerDiscounts,
      listCustomers,
      listShareholders,
      listAllCustomProducts,
      getCustomerShareholders,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(DiscountSummaryContextual));
