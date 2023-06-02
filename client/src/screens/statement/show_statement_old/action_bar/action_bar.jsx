import React, { Component } from 'react';
import SweetAlert from 'react-bootstrap-sweetalert';
//import ReactToPrint from "react-to-print";

import { withStyles, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@material-ui/core';
import Button from '../../../../components/material-dashboard/CustomButtons/Button';
import Print from '@material-ui/icons/Print';

import { isUnloadedOrLoading } from '../../../../utilities';
import { actionBarStyles } from './action_bar.styles';

class ActionBar extends Component {
  state = {
    statementId: '',
    showStatementSettingDialog: false,
    showCreateStatementDialog: false,
    removeStatementConfirm: null,
    currentStatement: null,
  };

  componentDidMount = async () => {
    const { listCustomerProducts, listCustomerCustomProducts, listCustomers } = this.props;
    listCustomers();
    listCustomerProducts();
    listCustomerCustomProducts();
    await this.renderData();
  };
  renderData = () => {
    const { listPurchaseOrders, listStatements, listPurchaseOrderStatements } = this.props;
    listPurchaseOrders(true);
    listStatements(true);
    listPurchaseOrderStatements(true);
  };

  get isLoading() {
    const loading = [this.props.statementStatus, this.props.purchaseOrderStatementsStatus].some(isUnloadedOrLoading);

    return loading;
  }

  setCreatedStatement = async (statementId) => {
    const currentStatement = await this.props.getStatementById(statementId);
    this.setState({
      statementId: statementId,
      currentStatement: currentStatement.payload,
    });
    this.renderData();
  };

  handleSelectChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSelectStatementChange = async (event) => {
    const { getStatementById } = this.props;
    const statementId = event.target.value;
    const currentStatement = await getStatementById(statementId);
    this.setState({
      statementId: statementId,
      currentStatement: currentStatement.payload,
    });
    this.renderData();
  };

  handleStatementSettingDialogOpen = () => {
    this.setState({ showStatementSettingDialog: true });
  };
  handleStatementSettingDialogClose = () => {
    this.setState({ showStatementSettingDialog: false });
    this.renderData();
  };
  handleCreateStatementDialogOpen = () => {
    this.setState({ showCreateStatementDialog: true });
  };
  handleCreateStatementDialogClose = () => {
    this.setState({ showCreateStatementDialog: false });
    this.renderData();
  };

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

  render() {
    if (this.isLoading) return <CircularProgress />;
    const {
      showStatementSettingDialog,
      showCreateStatementDialog,
      removeStatementConfirm,
      statementId,
      currentStatement,
    } = this.state;

    const { statements = [], classes, customers } = this.props;
    return (
      <React.Fragment>
        <h1></h1>
        <div className={classes.actionBarStyles}>
          <div className={classes.buttonStyles}>
            <Button className="hide-print" onClick={this.print} color="info">
              <Print />
            </Button>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(actionBarStyles)(ActionBar);
