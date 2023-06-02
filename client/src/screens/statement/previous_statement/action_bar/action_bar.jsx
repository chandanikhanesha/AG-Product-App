import React, { Component } from 'react';
import SweetAlert from 'react-bootstrap-sweetalert';
//import ReactToPrint from "react-to-print";

import { withStyles, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@material-ui/core';
import Button from '../../../../components/material-dashboard/CustomButtons/Button';
import Print from '@material-ui/icons/Print';

import { isUnloadedOrLoading } from '../../../../utilities';
import { actionBarStyles } from './action_bar.styles';
import StatementSetting from './statement_setting';
import CreateStatement from './create_statement';
import Presenter from '../presenter';

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
        <div className={classes.actionBarStyles}>
          {statements.length > 0 && (
            <div>
              <FormControl className={`${classes.formControl} hide-print`}>
                <InputLabel htmlFor="statement">Statement</InputLabel>
                <Select
                  value={statementId}
                  onChange={this.handleSelectStatementChange}
                  inputProps={{
                    required: true,
                    name: 'statementId',
                    id: 'statement',
                  }}
                >
                  {statements.map((statement) => (
                    <MenuItem key={statement.id} value={statement.id}>
                      #{statement.statementNo} -{' '}
                      {customers.find((customer) => customer.id === statement.customerId).name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {statementId && (
                <Button color="primary" className="hide-print" onClick={this.handleStatementSettingDialogOpen}>
                  Statement Setting
                </Button>
              )}
              {statementId && (
                <Button color="primary" className="hide-print" onClick={this.removeConfirm}>
                  Remove Statement
                </Button>
              )}
              {removeStatementConfirm}
            </div>
          )}
          <div className={classes.buttonStyles}>
            <Button color="primary" className="hide-print" onClick={this.handleCreateStatementDialogOpen}>
              Create Statement
            </Button>
            <Button className="hide-print" onClick={this.print} color="info">
              <Print />
            </Button>
            {/* <ReactToPrint
              trigger={() => (
                <Button className="hide-print" color="info">
                  <Print />
                </Button>
              )}
              content={() => this.componentRef}
            /> */}
          </div>

          {showStatementSettingDialog && (
            <StatementSetting
              open={showStatementSettingDialog}
              onClose={this.handleStatementSettingDialogClose}
              statementId={statementId}
            />
          )}
          {showCreateStatementDialog && (
            <CreateStatement
              open={showCreateStatementDialog}
              onClose={this.handleCreateStatementDialogClose}
              setCreatedStatement={this.setCreatedStatement}
            />
          )}
        </div>
        {statementId && (
          <Presenter
            ref={(el) => {
              this.componentRef = el;
            }}
            statement={currentStatement}
          />
        )}
      </React.Fragment>
    );
  }
}

export default withStyles(actionBarStyles)(ActionBar);
