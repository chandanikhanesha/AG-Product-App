import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';

// components
import PaymentDialog from '../../components/payment_dialog';
import InvoiceActionBar from '../action_bar';
import InvoiceHeader from '../invoice_header';
import CropSummaryTable from '../crop_summary_table';
import PaymentsTable from '../payment_table';
import EarlyPayTable from '../early_pay_table';
import InvoiceBreakdown from '../breakdown';
import FinanceMethodTable from '../finance_method';
import Tabs from '../../../components/material-dashboard/CustomTabsWithoutBody/CustomTabsWithoutBody';
import moment from 'moment';

import { invoicePresenterStyles } from './presenter.styles';

// import CustomEarlyPayTable from "../custom_early_pay_table";

class Presenter extends Component {
  state = {
    showPaymentDialog: false,
    editingPayment: null,
    currentInvoiceDate: new Date(),
    selectedShareholder: '',
    selectedTabIndex: 0,
    selectedMenuTabIndex: 2,
  };

  handleInvoiceDateChange = (date) => {
    this.setState({ currentInvoiceDate: moment.utc(date).format('YYYY-MM-DD') + 'T00:00:00.000Z' });
  };

  createPayment = (data) => {
    this.props.createPayment(data).then(() => this.setState({ showPaymentDialog: false }));
  };

  setSelectedShareholder = (e) => {
    const { shareholders } = this.props;
    let selectedShareholder;
    if (!e.target.value) {
      selectedShareholder = '';
    } else if (e.target.value === 'theCustomer') {
      selectedShareholder = { id: 'theCustomer' };
    } else {
      selectedShareholder = shareholders.find((shareholder) => shareholder.id === e.target.value);
    }

    this.setState({ selectedShareholder });
  };

  onTabChange = (selectedTabIndex) => {
    this.setState({ selectedTabIndex });
  };

  onMenuTabChange = (selectedMenuTabIndex) => {
    const { purchaseOrder, customer } = this.props;
    const { currentPurchaseOrder } = this.props;

    let path = '';
    if (this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket' && c.id == customer.id)) {
      path = '/app/dealers';
    } else {
      path = '/app/customers';
    }
    if (selectedMenuTabIndex === 0) {
      this.props.history.push(
        `${path}/${customer.id}/${purchaseOrder.isQuote ? 'quote' : 'purchase_order'}/${
          purchaseOrder.id
        }?selectedTab=${selectedMenuTabIndex}`,
      );
    }
    if (selectedMenuTabIndex === 3) {
      this.props.history.push(`${path}/${customer.id}/purchase_order/${purchaseOrder.id}/deliveries`);
    }

    if (selectedMenuTabIndex == 1) {
      this.props.history.push(`${path}/${currentPurchaseOrder.Customer.id}/preview/${currentPurchaseOrder.id}`);
    }

    if (selectedMenuTabIndex === 2) {
      this.props.history.push(`${path}/${customer.id}/invoice/${purchaseOrder.id}`);
    }
    this.setState({ selectedMenuTabIndex });
  };

  render() {
    const {
      print,
      purchaseOrder,
      customer,
      shareholders,
      organization,
      payments,
      customerProducts,
      dealerDiscounts,
      products,
      customProducts,
      seedCompanies,
      companies,
      apiSeedCompanies,
      customerCustomProducts,
      productPackagings,
      seedSizes,
      packagings,
      isPrinting,
      farms,
      customerMonsantoProduct,
      currentPurchaseOrder,
    } = this.props;

    const { showPaymentDialog, currentInvoiceDate, selectedShareholder, selectedTabIndex, selectedMenuTabIndex } =
      this.state;

    let menuTabs = purchaseOrder.isSimple
      ? [{ tabName: 'Products', tabIndex: 'products' }]
      : [{ tabName: 'Farms', tabIndex: 'farms' }];
    menuTabs = menuTabs.concat([
      // { tabName: "Package & Seed Size", tabIndex: "packaging" },
      // !purchaseOrder.isSimple && { tabName: 'Simple Products View', tabIndex: 'simpleView' },
      { tabName: 'Invoice Preview', tabIndex: 'preview' },

      { tabName: 'Invoice', tabIndex: 'invoice' },
      // { tabName: "Grower Delivery/Return", tabIndex: "delivery" },
    ]);
    const tabs = [
      { tabName: 'Show All', tabIndex: 'all' },
      { tabName: 'Crop Summary', tabIndex: 'crop' },
      { tabName: 'Breakdown', tabIndex: 'breakdown' },
      { tabName: 'Payments', tabIndex: 'payment' },
      { tabName: 'Early Pay', tabIndex: 'early' },
      { tabName: 'Finance Method', tabIndex: 'finance' },
    ];
    const selectedTab = tabs[selectedTabIndex].tabIndex;
    const showAll = isPrinting || selectedTab === 'all';

    return (
      <div id="invoice">
        <Tabs
          headerColor="gray"
          selectedTab={selectedMenuTabIndex || 2}
          onTabChange={this.onMenuTabChange}
          tabs={menuTabs}
        />
        <InvoiceActionBar
          selectedShareholder={selectedShareholder}
          shareholders={shareholders}
          customer={customer}
          print={print}
          isQuote={purchaseOrder.isQuote}
          showPaymentDialog={() => this.setState({ showPaymentDialog: true })}
          setSelectedShareholder={this.setSelectedShareholder}
        />

        <InvoiceHeader
          organization={organization}
          customer={customer}
          selectedShareholder={selectedShareholder}
          purchaseOrder={purchaseOrder}
          daysToDueDate={organization.daysToInvoiceDueDateDefault}
          handleInvoiceDateChange={this.handleInvoiceDateChange}
          currentInvoiceDate={currentInvoiceDate}
        />
        <Tabs headerColor="gray" selectedTab={selectedTabIndex || 0} onTabChange={this.onTabChange} tabs={tabs} />
        {(selectedTab === 'crop' || showAll) && (
          <CropSummaryTable
            customerProducts={customerProducts}
            purchaseOrder={purchaseOrder}
            seedCompanies={seedCompanies}
            apiSeedCompanies={apiSeedCompanies}
            products={products}
            selectedShareholder={selectedShareholder}
            customProducts={customProducts}
            dealerDiscounts={dealerDiscounts}
            companies={companies}
            customerCustomProducts={customerCustomProducts}
            payments={payments}
          />
        )}

        {(selectedTab === 'breakdown' || showAll) && (
          <InvoiceBreakdown
            customerProducts={customerProducts}
            purchaseOrder={purchaseOrder}
            selectedShareholder={selectedShareholder}
            seedCompanies={seedCompanies}
            products={products}
            customProducts={customProducts}
            dealerDiscounts={dealerDiscounts}
            companies={companies}
            customerCustomProducts={customerCustomProducts}
            customerMonsantoProduct={customerMonsantoProduct}
            currentPurchaseOrder={currentPurchaseOrder}
            productPackagings={productPackagings}
            seedSizes={seedSizes}
            packagings={packagings}
            farms={farms}
          />
        )}

        {(selectedTab === 'payment' || showAll) && (
          <PaymentsTable
            customer={customer}
            selectedShareholder={selectedShareholder}
            payments={payments}
            purchaseOrder={purchaseOrder}
            shareholders={shareholders}
            currentPurchaseOrder={purchaseOrder}
            dealerDiscounts={dealerDiscounts}
            customProducts={customProducts}
            customerCustomProducts={customerCustomProducts}
          />
        )}

        {(selectedTab === 'early' || showAll) && (
          <EarlyPayTable
            purchaseOrder={purchaseOrder}
            selectedShareholder={selectedShareholder}
            customer={customer}
            payments={payments}
            customerProducts={customerProducts}
            dealerDiscounts={dealerDiscounts}
            products={products}
            customProducts={customProducts}
            customerCustomProducts={customerCustomProducts}
            customerMonsantoProduct={customerMonsantoProduct}
          />
          // <CustomEarlyPayTable
          //   purchaseOrder={purchaseOrder}
          //   selectedShareholder={selectedShareholder}
          //   customer={customer}
          //   payments={payments}
          //   customerProducts={customerProducts}
          //   dealerDiscounts={dealerDiscounts}
          //   products={products}
          //   customProducts={customProducts}
          //   customerCustomProducts={customerCustomProducts}
          // />
        )}

        {(selectedTab === 'finance' || showAll) && (
          <FinanceMethodTable
            customerProducts={customerProducts}
            customerCustomProducts={customerCustomProducts}
            purchaseOrder={purchaseOrder}
            products={products}
            customProducts={customProducts}
            seedCompanies={seedCompanies}
            companies={companies}
          />
        )}

        <PaymentDialog
          customer={customer}
          // updatePayment={this.updatePayment}
          editingPayment={this.state.editingPayment}
          shareholders={shareholders}
          open={showPaymentDialog}
          createPayment={this.createPayment}
          onClose={() => this.setState({ showPaymentDialog: false, editingPayment: null })}
        />
      </div>
    );
  }
}

Presenter.propTypes = {
  purchaseOrder: PropTypes.object.isRequired,
  customer: PropTypes.object.isRequired,

  classes: PropTypes.object.isRequired,
  shareholders: PropTypes.array.isRequired,
};

export default withStyles(invoicePresenterStyles)(Presenter);
