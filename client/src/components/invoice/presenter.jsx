import React, { Component } from 'react';
import PropTypes from 'prop-types';

// components
import PaymentDialog from '../../components/purchase-order/payment_dialog';
import InvoiceActionBar from '../../components/invoice/actionBar';
import InvoiceHeader from '../../components/invoice/header';
import CropSummaryTable from './crop_summary_table';
import PaymentsTable from './payments_table';
import EarlyPayTable from './early_pay_table';
import InvoiceBreakdown from './breakdown';
import moment from 'moment';

class InvoicePresenter extends Component {
  state = {
    showPaymentDialog: false,
    editingPayment: null,
    currentInvoiceDate: new Date(),
    selectedShareholder: '',
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
      customerCustomProducts,
      productPackagings,
      seedSizes,
      packagings,
    } = this.props;

    const { showPaymentDialog, currentInvoiceDate, selectedShareholder } = this.state;

    return (
      <div id="invoice">
        <InvoiceActionBar
          selectedShareholder={selectedShareholder}
          shareholders={shareholders}
          customer={customer}
          print={print}
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

        <CropSummaryTable
          customerProducts={customerProducts}
          purchaseOrder={purchaseOrder}
          seedCompanies={seedCompanies}
          products={products}
          selectedShareholder={selectedShareholder}
          customProducts={customProducts}
          dealerDiscounts={dealerDiscounts}
          companies={companies}
          customerCustomProducts={customerCustomProducts}
        />

        <PaymentsTable
          customer={customer}
          selectedShareholder={selectedShareholder}
          payments={payments}
          purchaseOrder={purchaseOrder}
          shareholders={shareholders}
        />

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
        />

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
          productPackagings={productPackagings}
          seedSizes={seedSizes}
          packagings={packagings}
        />

        <PaymentDialog
          customer={customer}
          // updatePayment={this.updatePayment}
          editingPayment={this.state.editingPayment}
          shareholders={shareholders}
          showPaymentDialog={showPaymentDialog}
          createPayment={this.createPayment}
          cancelPaymentDialog={() => this.setState({ showPaymentDialog: false, editingPayment: null })}
        />
      </div>
    );
  }
}

InvoicePresenter.propTypes = {
  purchaseOrder: PropTypes.object.isRequired,
  customer: PropTypes.object.isRequired,
  shareholders: PropTypes.array.isRequired,
};

export default InvoicePresenter;
