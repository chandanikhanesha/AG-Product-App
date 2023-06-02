import React, { Component } from 'react';

// import * as html2pdf from 'html2pdf.js'

import { isUnloadedOrLoading } from '../../utilities';

// components
import CircularProgress from '@material-ui/core/CircularProgress';
import InvoicePresenter from './presenter';

class Invoice extends Component {
  state = {
    purchaseOrder: null,
    customer: null,
    isPrinting: false,
  };

  componentDidMount() {
    this.props.listCustomerProducts();
    this.props.listPurchaseOrders();
    // this.props.listCustomers();
    this.props.listShareholders();
    this.props.loadOrganization(this.props.organizationId);
    this.props.listDealerDiscounts();
    this.props.listProducts();
    this.props.listAllCustomProducts();
    this.props.listSeedCompanies();
    this.props.listPayments();
    this.props.listCompanies();
    this.props.listCustomerCustomProducts();
    this.props.listProductPackagings();
    this.props.listSeedSizes();
    this.props.listPackagings();
    this.props.listFarms(this.props.match.params.customer_id);
  }

  componentDidUpdate() {
    if (!this.state.purchaseOrder) this.setPurchaseOrderState();
    if (!this.state.customer) this.setCustomerState();
  }

  setPurchaseOrderState = async () => {
    const { getPurchaseOrderById, match } = this.props;
    await getPurchaseOrderById(match.params.id);
    const { currentPurchaseOrder } = this.props;
    if (currentPurchaseOrder) {
      this.setState({
        purchaseOrder: currentPurchaseOrder,
      });
    }
    return currentPurchaseOrder;
  };

  setCustomerState() {
    const { customers, match } = this.props;
    const customer = customers.find((c) => c.id.toString() === match.params.customer_id);
    if (customer) {
      this.setState({
        customer,
      });
    }
    return customer;
  }

  get isLoading() {
    const loading = [
      this.props.purchaseOrdersStatus,
      this.props.customerProductsStatus,
      // this.props.customersStatus,
      this.props.shareholdersStatus,
      this.props.dealerDiscountsStatus,
      // this.props.productsStatus,
      this.props.customProductsStatus,
      this.props.seedCompaniesStatus,
      this.props.paymentsStatus,
      this.props.companiesStatus,
      this.props.customerCustomProductsLoadingStatus,
      this.props.productPackagingsStatus,
      this.props.seedSizesStatus,
      this.props.packagingsStatus,
      this.props.farmsStatus,
    ].some(isUnloadedOrLoading);

    return loading || this.state.purchaseOrder === null;
  }

  createPayment = (data) => {
    const { createPayment } = this.props;
    const { purchaseOrder } = this.state;
    return createPayment(purchaseOrder.id, data);
  };

  updatePayment = (data) => {
    const { updatePayment } = this.props;

    updatePayment(this.state.purchaseOrder.id, this.state.editingPayment.id, data).then(() => {
      this.setState({
        editingPayment: null,
        showPaymentDialog: false,
      });
    });
  };

  removePayment = (payment) => {
    const { deletePayment } = this.props;
    deletePayment(this.state.purchaseOrder.id, payment);
  };

  print = () => {
    // console.log('print')
    // TODO: if we dont end up using html2pdf.js, remove it as a dependency
    // html2pdf(document.getElementById('invoice'))
    this.setState({ isPrinting: true });
    setTimeout(() => {
      window.print();
      this.setState({ isPrinting: false });
    }, 500);
  };

  render() {
    if (this.isLoading) return <CircularProgress />;
    const { customers, getCustomerShareholders } = this.props;
    const { purchaseOrder } = this.state;
    const customer = customers.find((customer) => customer.id === purchaseOrder.customerId);
    const shareholders = getCustomerShareholders(customer.id);
    return (
      <InvoicePresenter
        {...this.state}
        {...this.props}
        shareholders={shareholders}
        removePayment={this.removePayment}
        updatePayment={this.updatePayment}
        createPayment={this.createPayment}
        print={this.print}
      />
    );
  }
}

export default Invoice;
