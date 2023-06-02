import React, { Component } from 'react';
import { isUnloadedOrLoading } from '../../utilities';

// components
import CircularProgress from '@material-ui/core/CircularProgress';
import InvoicePreviewPresenter from './presenter';

class InvoicePreview extends Component {
  state = {
    purchaseOrder: null,
    customer: null,
    isPrinting: false,
  };

  componentDidMount() {
    this.props.listCustomerProducts();
    this.props.listPurchaseOrders();
    this.props.listCustomers(true, 0, this.props.totalItemsOfCustomers);
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
      this.props.customersStatus,
      this.props.shareholdersStatus,
      this.props.dealerDiscountsStatus,
      this.props.productsStatus,
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

  render() {
    if (this.isLoading) return <CircularProgress />;

    const { customers, getCustomerShareholders } = this.props;
    const currentCustId = parseInt(this.props.match.params.customer_id);
    const { purchaseOrder } = this.state;
    const shareholders = getCustomerShareholders(currentCustId);

    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <InvoicePreviewPresenter
          {...this.state}
          {...this.props}
          shareholders={shareholders}
          removePayment={this.removePayment}
          updatePayment={this.updatePayment}
          createPayment={this.createPayment}
          print={this.print}
        />
      </div>
    );
  }
}

export default InvoicePreview;
