import React, { Component } from 'react';
import ReactTable from 'react-table';

import { DatePicker } from '@material-ui/pickers';

// icons
import CloseIcon from '@material-ui/icons/Close';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';

// core components
import Button from '../../../../components/material-dashboard/CustomButtons/Button';
import CustomInput from '../../../../components/material-dashboard/CustomInput/CustomInput';
import GridContainer from '../../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../../components/material-dashboard/Grid/GridItem';
import TextField from '@material-ui/core/TextField';

import { withStyles, Divider, Paper } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';

import { addPaymentDialogStyles } from './add_payment_dialog.styles';
import { numberToDollars } from '../../../../utilities';
import moment from 'moment';

class AddPaymentDialog extends Component {
  state = {
    shareholderId: 0, // 0: is for customer
    purchaseId: null,
    amount: 0.0,
    paymentDate: new Date(),
    method: 'Cash',
    note: '',
    payBy: '',
    payments: [],
    paymentsShow: [],
    purchaseOrders: [],
  };
  paymentsTableHeader = [
    {
      Header: 'Purchase Order',
      show: true,
      accessor: 'purchaseOrder',
      minWidth: 150,
      headerStyle: {
        textAlign: 'left',
      },
    },
    {
      Header: 'Paid By',
      show: true,
      accessor: 'paidBy',
      headerStyle: {
        textAlign: 'left',
      },
    },
    {
      Header: 'Method',
      show: true,
      accessor: 'method',
      headerStyle: {
        textAlign: 'left',
      },
    },
    {
      Header: 'Amount',
      show: true,
      id: 'amount',
      headerStyle: {
        textAlign: 'left',
      },
      accessor: (d) => d,
      Cell: (props) => {
        return numberToDollars(props.value.amount);
      },
    },
    {
      Header: 'Paid At',
      show: true,
      accessor: 'paidAt',
      headerStyle: {
        textAlign: 'left',
      },
    },
  ];

  componentWillMount = () => {
    this.reloadPayments();
  };

  reloadPayments = async () => {
    await this.props.listPayments(true);
    this.renderData();
  };

  renderData = () => {
    const { customer, shareholders } = this.props;
    let purchaseOrderIds = [];
    this.props.currentPurchaseOrderStatements.forEach((purchaseOrderStatement) => {
      purchaseOrderIds.push(purchaseOrderStatement.purchaseOrderId);
    });
    let payments = this.props.payments.filter((payment) => purchaseOrderIds.includes(payment.purchaseOrderId));
    let purchaseOrders = this.props.purchaseOrders.filter((purchaseOrder) =>
      purchaseOrderIds.includes(purchaseOrder.id),
    );
    let paymentsShow = [];
    payments.forEach((payment) => {
      const po = purchaseOrders.find((purchaseOrder) => purchaseOrder.id === payment.purchaseOrderId);
      let purchaseOrder = `PO#${po.id} - ${po.name}`;
      let shareholderId = payment.shareholderId;
      let paidBy = '';
      let method = '';
      if (shareholderId === 0 || shareholderId === null) {
        paidBy = customer.name;
      } else {
        let shareholder = shareholders.find((shareholder) => shareholder.id === payment.shareholderId);
        paidBy = shareholder.name;
      }
      if (payment.method === 'Return') {
        paidBy = payment.payBy;
      }
      if (payment.note) {
        method = `${payment.method} - #${payment.note}`;
      }
      paymentsShow.push({
        purchaseOrder: purchaseOrder,
        paidBy: paidBy,
        method: method,
        amount: parseFloat(payment.amount * (payment.method === 'Return' ? -1 : 1)),
        paidAt: moment.utc(payment.paymentDate).format('DD/MM/YYYY'),
      });
    });
    this.setState({
      payments,
      paymentsShow,
      purchaseOrders,
      purchaseId: purchaseOrders[0] ? purchaseOrders[0].id : null,
    });
  };

  submit = async () => {
    const { purchaseId, shareholderId, amount, paymentDate, method } = this.state;

    if (amount === 0) {
      this.props.onClose();
      return;
    }

    let data = { amount, paymentDate, method };
    if (!isNaN(shareholderId)) data.shareholderId = shareholderId;

    await this.props.createPayment(purchaseId, data);

    this.setState(
      {
        shareholderId: 0,
        amount: 0.0,
        paymentDate: new Date(),
        method: 'Cash',
      },
      () => {
        this.props.onClose();
      },
    );
  };

  addAnotherSubmit = async () => {
    const { purchaseId, shareholderId, amount, paymentDate, method, payBy, note } = this.state;

    if (amount === 0) {
      this.renderData();
    }
    let data = { amount, paymentDate, method, payBy, note };
    if (!isNaN(shareholderId)) data.shareholderId = shareholderId;

    await this.props.createPayment(purchaseId, data);

    this.setState(
      {
        shareholderId: 0,
        amount: 0.0,
        paymentDate: new Date(),
        method: 'Cash',
        payBy: '',
        note: '',
      },
      () => {
        this.reloadPayments();
      },
    );
  };

  onSelectShareholderChange = (shareholderId) => {
    this.setState({
      shareholderId,
    });
  };

  onSelectPurchaseOrderChange = (purchaseId) => {
    this.setState({
      purchaseId,
    });
  };

  onSelectMethodChange = (method) => {
    this.setState({
      method,
    });
  };

  render() {
    const { classes, open, onClose, shareholders, customer } = this.props;
    const {
      amount,
      shareholderId,
      purchaseId,
      paymentDate,
      method,
      note,
      payBy,
      // payments,
      paymentsShow,
      purchaseOrders,
    } = this.state;
    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="md">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            <h4>Add Payment</h4>
            <div className={classes.dialogHeaderActions}>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <GridContainer justifyContent="center" style={{ padding: '10px 50px' }}>
          <GridItem xs={6} className={classes.row}>
            <FormControl className={classes.select}>
              <InputLabel htmlFor="shareholder">Paid By (Customer)</InputLabel>
              <Select
                name="shareholder"
                value={shareholderId}
                onChange={(e) => this.onSelectShareholderChange(e.target.value)}
              >
                <MenuItem value={0}>{customer.name}</MenuItem>
                {shareholders.map((shareholder) => (
                  <MenuItem value={shareholder.id} key={shareholder.id}>
                    {shareholder.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </GridItem>
          <GridItem xs={6} className={classes.row}>
            <FormControl className={classes.select}>
              <InputLabel htmlFor="purechaseOrder">Purchase Order</InputLabel>
              <Select
                name="purechaseOrder"
                value={purchaseId}
                onChange={(e) => this.onSelectPurchaseOrderChange(e.target.value)}
              >
                {purchaseOrders.map((purchaseOrder) => (
                  <MenuItem value={purchaseOrder.id} key={purchaseOrder.id}>
                    {`PO#${purchaseOrder.id} - ${purchaseOrder.name}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </GridItem>
          <GridItem xs={4} className={classes.secondRow}>
            <DatePicker
              className={classes.select}
              style={{ marginTop: 8 }}
              leftArrowIcon={<NavigateBefore />}
              rightArrowIcon={<NavigateNext />}
              format="MMMM Do YYYY"
              label="Date"
              value={paymentDate}
              onChange={(e) => this.setState({ paymentDate: moment.utc(e._d).format('YYYY-MM-DD') + 'T00:00:00.000Z' })}
            />
          </GridItem>
          <GridItem xs={4} className={classes.secondRow}>
            <FormControl className={classes.select}>
              <TextField
                className={classes.select}
                label="Amount"
                id="amount"
                inputProps={{
                  type: 'number',
                  defaultValue: amount,
                  step: 0.1,
                  min: 0,

                  onChange: (e) => this.setState({ amount: e.target.value }),
                }}
              />
            </FormControl>
          </GridItem>
          <GridItem xs={4} className={classes.secondRow + ' ' + classes.paymentMethod}>
            <FormControl className={classes.select} style={{ marginBottom: '17px' }}>
              <InputLabel htmlFor="method">Payment method </InputLabel>
              <Select name="method" value={method} onChange={(e) => this.onSelectMethodChange(e.target.value)}>
                {['Cash', 'Credit', 'Return'].map((method) => (
                  <MenuItem value={method} key={method}>
                    {method}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </GridItem>
          <GridItem xs={12} className={classes.row}>
            <FormControl className={classes.select}>
              <CustomInput
                className={classes.select}
                labelText={'Note'}
                id="note"
                inputProps={{
                  type: 'text',
                  defaultValue: note,
                  onChange: (e) => this.setState({ note: e.target.value }),
                }}
              />
            </FormControl>
          </GridItem>
          {method === 'Return' && (
            <GridItem xs={4} className={classes.row}>
              <FormControl className={classes.select}>
                <CustomInput
                  labelText={'Paid By (User)'}
                  id="payBy"
                  inputProps={{
                    type: 'text',
                    defaultValue: payBy,
                    onChange: (e) => this.setState({ payBy: e.target.value }),
                  }}
                />
              </FormControl>
            </GridItem>
          )}
          {method === 'Return' && <GridItem xs={8} />}
        </GridContainer>
        <GridContainer justifyContent="center" style={{ padding: '10px 50px', marginBottom: 20 }}>
          <GridItem xs={12} style={{ marginBottom: '10px' }}>
            <span className={classes.paperHeader}>Payments</span>
          </GridItem>
          <GridItem xs={12}>
            <Paper className={classes.farmPaper}>
              <ReactTable
                data={paymentsShow}
                columns={this.paymentsTableHeader}
                minRows={1}
                resizable={false}
                showPagination={false}
                //getTrProps={this.getPendingTableRowProps}
                //getTheadProps={this.getPendingTableHeaderProps}
              />
            </Paper>
          </GridItem>
        </GridContainer>
        <Divider />
        <div className={classes.footer}>
          <Button color="primary" className={classes.addAnotherButton} onClick={this.addAnotherSubmit}>
            SAVE AND ADD ANOTHER
          </Button>
          <Button color="primary" className={classes.editButton} onClick={this.submit}>
            SAVE
          </Button>
        </div>
      </Dialog>
    );
  }
}

export default withStyles(addPaymentDialogStyles)(AddPaymentDialog);
