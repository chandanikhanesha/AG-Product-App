import React, { Component } from 'react';
import { differenceInDays } from 'date-fns';
import moment from 'moment';
import SweetAlert from 'react-bootstrap-sweetalert';
//import ReactToPrint from "react-to-print";

import { withStyles, CircularProgress } from '@material-ui/core';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Print from '@material-ui/icons/Print';

import { isUnloadedOrLoading } from '../../../utilities';
import { showStatementStyles } from './show_statement.styles';

import InvoiceTable from './invoice_table';
import StatementTable from './statement_table';

class ShowStatement extends Component {
  state = {
    statementId: null,
    removeStatementConfirm: null,
    currentStatement: null,
    customerId: null,
    renderTablesDone: false,
  };

  componentDidMount = async () => {
    const customerId = this.props.match.params.customer_id;
    const statementId = this.props.match.params.id;
    const currentStatement = await this.props.getStatementById(statementId);
    await this.props.listCustomerProducts();
    await this.props.listCustomers();
    await this.props.listShareholders();
    await this.props.loadOrganization(this.props.organizationId);
    await this.props.listDealerDiscounts();
    await this.props.listProducts();
    await this.props.listAllCustomProducts();
    await this.props.listSeedCompanies();
    await this.props.listPayments();
    await this.props.listCompanies();
    await this.props.listCustomerCustomProducts();
    await this.props.listProductPackagings();
    await this.props.listSeedSizes();
    await this.props.listPackagings();
    await this.props.listPurchaseOrders();
    await this.props.listStatements();
    await this.props.listPurchaseOrderStatements();
    await this.props.listStatementSettings();
    await this.props.listDelayProducts();
    await this.props.listFinanceMethods();
    setTimeout(() => {
      this.renderTables();
    }, 1000);
    this.setState({
      statementId,
      currentStatement: currentStatement.payload,
      customerId,
    });
    //this.renderTables();
  };

  componentDidUpdate = () => {
    //this.renderTables();
  };

  renderData = () => {
    const { listPurchaseOrders, listStatements, listPurchaseOrderStatements } = this.props;
    listPurchaseOrders(true);
    listStatements(true);
    listPurchaseOrderStatements(true);
  };

  get isLoading() {
    const loading = [
      this.props.statementStatus,
      this.props.purchaseOrderStatementsStatus,
      this.props.customerProductsStatus,
      this.props.customerCustomProductsLoadingStatus,
      this.props.productsStatus,
      this.props.seedCompaniesStatus,
      this.props.dealerDiscountsStatus,
      this.props.companiesStatus,
      this.props.paymentsStatus,
      this.props.seedSizesStatus,
      this.props.packagingsStatus,
      this.props.statementSettingsLoadingStatus,
      this.props.delayProductsLoadingStatus,
      this.props.financeMethodsLoadingStatus,
    ].some(isUnloadedOrLoading);

    return loading;
  }

  // componentWillUpdate = async () => {
  //   const { renderTablesDone, statementId } = this.state;
  //   if (!this.isLoading && !renderTablesDone) {
  //     if (!statementId) {
  //       const customerId = this.props.match.params.customer_id;
  //       const statementId = this.props.match.params.id;
  //       const currentStatement = await this.props.getStatementById(statementId);
  //       this.setState({
  //         statementId,
  //         currentStatement: currentStatement.payload,
  //         customerId
  //       });
  //     }
  //     this.renderTables();
  //   }
  // };

  removeConfirm = async () => {
    const { classes, deleteStatement, customers } = this.props;

    const { statementId, currentStatement } = this.state;

    const statementNo = currentStatement.statementNo;

    const customer = customers.find((customer) => customer.id === currentStatement.customerId);

    this.setState({
      removeStatementConfirm: (
        <SweetAlert
          showCancel
          title={'Remove Statement #' + statementNo}
          onConfirm={async () => {
            await deleteStatement(statementId);
            this.setState({ removeStatementConfirm: null, statementId: '' }, () => {
              this.renderData();
            });
          }}
          onCancel={() => this.setState({ removeStatementConfirm: null })}
          confirmBtnText="Remove"
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnText="Cancel"
          cancelBtnCssClass={classes.button + ' ' + classes.white + ' ' + classes.primary}
        >
          You are going to remove Statement #{statementNo} For {customer.name}
        </SweetAlert>
      ),
    });
  };

  print() {
    // console.log('print')
    // TODO: if we dont end up using html2pdf.js, remove it as a dependency
    // html2pdf(document.getElementById('invoice'))
    window.print();
  }

  renderTables = () => {
    const { customers, purchaseOrderStatements, purchaseOrders } = this.props;
    const { currentStatement, customerId } = this.state;
    //console.log(this.state);
    if (!purchaseOrderStatements) return;
    const currentPurchaseOrderStatements = purchaseOrderStatements
      .filter(
        (purchaseOrderStatement) =>
          purchaseOrderStatement.statementId === currentStatement.id &&
          purchaseOrderStatement.isRemoved === false &&
          (purchaseOrderStatement.isDeferred
            ? differenceInDays(moment.utc().format(), purchaseOrderStatement.deferredDate) === 0
            : true),
      )
      .sort((a, b) => {
        return a.purchaseOrderId - b.purchaseOrderId;
      });
    let map = currentPurchaseOrderStatements.map((purchaseOrderStatement) => {
      const purchaseOrder = purchaseOrders.find((po) => po.id === purchaseOrderStatement.purchaseOrderId);
      const customer = customers.find((customer) => parseInt(customer.id, 10) === parseInt(customerId, 10));
      return (
        <InvoiceTable
          purchaseOrder={purchaseOrder}
          currentstatement={currentStatement}
          purchaseOrderStatement={purchaseOrderStatement}
          customer={customer}
          {...this.props}
        />
      );
    });
    map.push(
      <StatementTable
        currentstatement={currentStatement}
        currentpurchaseOrderStatements={currentPurchaseOrderStatements}
        {...this.props}
      />,
    );
    this.setState({ presenterData: map, renderTablesDone: true });

    //return map;
  };

  render() {
    const { statementId, removeStatementConfirm, currentStatement, presenterData, renderTablesDone } = this.state;
    if (this.isLoading || !renderTablesDone) return <CircularProgress />;

    const { classes } = this.props;
    return (
      <React.Fragment>
        <div className={classes.actionBarStyles}>
          <div className={classes.title}>
            <h1 style={{ marginRight: 20 }}> Statement {currentStatement.statementNo}</h1>
            <div>
              {statementId && (
                <Button color="primary" className="hide-print" onClick={this.removeConfirm}>
                  Remove Statement
                </Button>
              )}
              {removeStatementConfirm}
            </div>
          </div>
          <div className={classes.buttonStyles}>
            <Button className="hide-print" onClick={this.print} color="info">
              <Print />
            </Button>
          </div>
        </div>
        {presenterData}
      </React.Fragment>
    );
  }
}

export default withStyles(showStatementStyles)(ShowStatement);
