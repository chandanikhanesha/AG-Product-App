import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
// import * as html2pdf from 'html2pdf.js'

// actions
import {
  listPurchaseOrders,
  listCustomerProducts,
  listCustomers,
  listShareholders,
  loadOrganization,
  listDealerDiscounts,
  listProducts,
  listAllCustomProducts,
  listSeedCompanies,
  listPayments,
  listCompanies,
  listCustomerCustomProducts,
  listProductPackagings,
  listSeedSizes,
  listPackagings,
  createPayment,
  updatePayment,
  deletePayment,
  getCustomerShareholders,
} from '../../store/actions';

// components
import CircularProgress from '@material-ui/core/CircularProgress';
import InvoicePresenter from './presenter';
import { isUnloadedOrLoading } from '../../utilities';

class Invoice extends Component {
  state = {
    purchaseOrder: null,
    customer: null,
  };

  componentDidMount() {
    this.props.listCustomerProducts();
    this.props.listPurchaseOrders();
    this.props.listCustomers();
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
  }

  componentDidUpdate() {
    if (!this.state.purchaseOrder) this.setPurchaseOrderState();
    if (!this.state.customer) this.setCustomerState();
  }

  setPurchaseOrderState() {
    const { purchaseOrders, match } = this.props;
    const purchaseOrder = purchaseOrders.find((po) => `${po.id}` === `${match.params.id}`);
    this.setState({
      purchaseOrder,
    });
    return purchaseOrder;
  }

  setCustomerState() {
    const { customers, match } = this.props;
    const customer = customers.find((c) => c.id.toString() === match.params.customer_id);
    this.setState({
      customer,
    });
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
    ].some(isUnloadedOrLoading);

    return loading || this.state.purchaseOrder === null || this.state.customer === null;
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

  print() {
    // console.log('print')
    // TODO: if we dont end up using html2pdf.js, remove it as a dependency
    // html2pdf(document.getElementById('invoice'))
    window.print();
  }

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

const mapStateToProps = (state) => {
  return {
    customerProducts: state.customerProductReducer.customerProducts,
    customerProductsStatus: state.customerProductReducer.loadingStatus,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
    purchaseOrdersStatus: state.purchaseOrderReducer.loadingStatus,
    customers: state.customerReducer.customers,
    customersStatus: state.customerReducer.loadingStatus,

    shareholdersStatus: state.shareholderReducer.loadingStatus,
    organizationId: state.userReducer.organizationId,
    organization: state.organizationReducer,
    dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
    dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
    products: state.productReducer.products,
    productsStatus: state.productReducer.loadingStatus,
    customProducts: state.customProductReducer.products,
    customProductsStatus: state.customProductReducer.loadingStatus,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    seedCompaniesStatus: state.seedCompanyReducer.loadingStatus,
    payments: state.paymentReducer.payments,
    paymentsStatus: state.paymentReducer.loadingStatus,
    companies: state.companyReducer.companies,
    companiesStatus: state.companyReducer.loadingStatus,
    customerCustomProducts: state.customerCustomProductReducer.customerCustomProducts,
    customerCustomProductsLoadingStatus: state.customerCustomProductReducer.loadingStatus,
    productPackagings: state.productPackagingReducer.productPackagings,
    productPackagingsStatus: state.productPackagingReducer.loadingStatus,
    seedSizes: state.seedSizeReducer.seedSizes,
    seedSizesStatus: state.seedSizeReducer.loadingStatus,
    packagings: state.packagingReducer.packagings,
    packagingsStatus: state.packagingReducer.loadingStatus,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomerProducts,
      listPurchaseOrders,
      listCustomers,
      listShareholders,
      loadOrganization,
      listDealerDiscounts,
      listProducts,
      listAllCustomProducts,
      listSeedCompanies,
      listPayments,
      listCompanies,
      listCustomerCustomProducts,
      listProductPackagings,
      listSeedSizes,
      listPackagings,
      createPayment,
      updatePayment,
      deletePayment,
      getCustomerShareholders,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Invoice);
