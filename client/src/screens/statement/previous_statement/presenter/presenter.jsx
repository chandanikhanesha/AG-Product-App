import React, { Component } from 'react';
import { differenceInDays } from 'date-fns';
import moment from 'moment';

import { withStyles, CircularProgress } from '@material-ui/core';
import InvoiceTable from '../invoice_table';
import StatementTable from '../statement_table';
import { presenterStyles } from './presenter.styles';

import { isUnloadedOrLoading } from '../../../../utilities';

class Presenter extends Component {
  state = {
    presenterData: [],
  };
  componentWillMount = () => {
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
  };

  componentDidMount = () => {
    const { customers, purchaseOrderStatements, statement, getPurchaseOrderById } = this.props;
    const currentPurchaseOrderStatements = purchaseOrderStatements
      .filter(
        (purchaseOrderStatement) =>
          purchaseOrderStatement.statementId === statement.id &&
          purchaseOrderStatement.isRemoved === false &&
          (purchaseOrderStatement.isDeferred
            ? differenceInDays(moment.utc().format(), purchaseOrderStatement.deferredDate) === 0
            : true),
      )
      .sort((a, b) => {
        return a.purchaseOrderId - b.purchaseOrderId;
      });
    let map = currentPurchaseOrderStatements.map(async (purchaseOrderStatement) => {
      await getPurchaseOrderById(purchaseOrderStatement.purchaseOrderId);
      const { currentPurchaseOrder } = this.props;
      const customer = customers.find((customer) => customer.id === purchaseOrder.customerId);
      return (
        <InvoiceTable
          purchaseOrder={currentPurchaseOrder}
          currentstatement={statement}
          purchaseOrderStatement={purchaseOrderStatement}
          customer={customer}
          {...this.props}
        />
      );
    });
    map.push(
      <StatementTable
        currentstatement={statement}
        currentpurchaseOrderStatements={currentPurchaseOrderStatements}
        {...this.props}
      />,
    );
    this.setState({ presenterData: map });
  };

  renderInvoiceDone = false;

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

    return loading;
  }

  render() {
    if (this.isLoading) return <CircularProgress />;
    const { presenterData } = this.state;

    return <React.Fragment>{presenterData}</React.Fragment>;
  }
}

export default withStyles(presenterStyles)(Presenter);
