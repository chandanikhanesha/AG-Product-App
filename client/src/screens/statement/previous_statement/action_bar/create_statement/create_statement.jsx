import React, { Component } from 'react';
import { format } from 'date-fns';

import {
  withStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
} from '@material-ui/core';

import { DatePicker } from '@material-ui/pickers';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import CloseIcon from '@material-ui/icons/Close';

import Table from '../../../../../components/material-dashboard/Table/Table';
import Button from '../../../../../components/material-dashboard/CustomButtons/Button';

import { createStatementStyles } from './create_statement.styles';

import moment from 'moment';

class CreateStatement extends Component {
  state = {
    customerId: null,
    compoundingDays: 30,
    startDate: moment.utc().format(),
    poRemoved: {},
    poDeferred: {},
    poDeferredDate: {},
    currentPurchaseOrders: [],
    customers: [],
  };

  // componentDidMount = async () => {
  // };

  componentWillMount = () => {
    const { customers, purchaseOrders, statements } = this.props;
    console.log(purchaseOrders);
    let suitableCustomers = customers.filter((customer) => {
      if (purchaseOrders.find((purchaseOrder) => purchaseOrder.customerId === customer.id)) {
        return customer;
      } else {
        return null;
      }
    });
    console.log(suitableCustomers);
    suitableCustomers = suitableCustomers.filter((customer) => {
      if (statements.find((statement) => statement.customerId === customer.id)) {
        return null;
      } else {
        return customer;
      }
    });
    console.log(suitableCustomers);

    this.setState({ customers: suitableCustomers });
  };

  handleSelectChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  handleSelectCustomerChange = (event) => {
    const { purchaseOrders, customerProducts, customerCustomProducts } = this.props;
    const customerId = event.target.value;
    let currentPurchaseOrders = purchaseOrders
      .filter((purchaseOrder) => purchaseOrder.customerId === customerId)
      .filter(
        (purchaseOrder) =>
          [...customerProducts, ...customerCustomProducts].filter((cp) => cp.purchaseOrderId === purchaseOrder.id)
            .length > 0,
      );
    this.setState({
      customerId: customerId,
      currentPurchaseOrders: currentPurchaseOrders,
    });
  };

  handleDateChange = (date) => {
    this.setState({
      startDate: date,
    });
  };

  renderRemoveAction = (po) => {
    const { poRemoved } = this.state;
    const poId = po.id;
    return (
      <React.Fragment>
        <FormControlLabel
          key={poId}
          control={<Checkbox checked={poRemoved[poId]} onChange={this.handleRemovePo(poId)} value={poRemoved[poId]} />}
          label="Remove"
        />
      </React.Fragment>
    );
  };

  handleRemovePo = (poId) => (event) => {
    const checked = event.target.checked;
    if (checked) {
      this.setState((prevState) => ({
        poRemoved: {
          ...prevState.poRemoved,
          [poId]: true,
        },
      }));
    }
    if (!checked) {
      this.setState((prevState) => ({
        poRemoved: {
          ...prevState.poRemoved,
          [poId]: false,
        },
      }));
    }
  };

  renderDefferedAction = (po) => {
    const { poDeferred, poDeferredDate } = this.state;
    const { classes } = this.props;
    const poId = po.id;
    return (
      <React.Fragment>
        <FormControlLabel
          key={poId}
          control={
            <Checkbox checked={poDeferred[poId]} onChange={this.handleDeferredPo(poId)} value={poDeferred[poId]} />
          }
          label="Deferred"
        />
        {poDeferred[poId] ? (
          <DatePicker
            className={classes.lastDatePicker}
            leftArrowIcon={<NavigateBefore />}
            rightArrowIcon={<NavigateNext />}
            format="MMMM Do YYYY"
            disablePast={true}
            label="Deferred Date"
            value={poDeferredDate[poId] ? poDeferredDate[poId] : moment.utc().format()}
            onChange={this.handleDefferedDateChange(poId)}
            fullWidth
          />
        ) : null}
      </React.Fragment>
    );
  };

  handleDeferredPo = (poId) => (event) => {
    const checked = event.target.checked;
    if (checked) {
      this.setState((prevState) => ({
        poDeferred: {
          ...prevState.poDeferred,
          [poId]: true,
        },
      }));
    }
    if (!checked) {
      this.setState((prevState) => ({
        poDeferred: {
          ...prevState.poDeferred,
          [poId]: false,
        },
      }));
    }
  };

  handleDefferedDateChange = (poId) => (date) => {
    this.setState((prevState) => ({
      poDeferredDate: {
        ...prevState.poDeferredDate,
        [poId]: moment.utc(date).format('YYYY-MM-DD') + 'T00:00:00.000Z',
      },
    }));
  };

  // create = async () => {
  //   await this.createAStatement();
  //   //this.props.onClose();
  // }

  create = async (event) => {
    event.preventDefault();

    const { compoundingDays, startDate, poRemoved, poDeferred, poDeferredDate, customerId, currentPurchaseOrders } =
      this.state;
    const {
      createNewStatement,
      createPurchaseOrderStatement,
      organizationId: organizationId,
      //onClose
    } = this.props;
    let createData = {
      compoundingDays,
      startDate,
      organizationId,
      customerId: customerId,
    };
    const data = await createNewStatement(createData);

    const statementId = data.payload.id;
    const statementNo = data.payload.statementNo;
    currentPurchaseOrders.forEach((po) => {
      let purchaseOrderId = po.id;
      let isRemoved = poRemoved[purchaseOrderId] ? poRemoved[purchaseOrderId] : false;
      let isDeferred = poDeferred[purchaseOrderId] ? poDeferred[purchaseOrderId] : false;
      let deferredDate = isDeferred ? poDeferredDate[purchaseOrderId] : null;
      let poStatementData = {
        statementId: statementId,
        statementNo,
        purchaseOrderId: purchaseOrderId,
        isRemoved,
        isDeferred,
        deferredDate,
        organizationId,
      };
      createPurchaseOrderStatement(poStatementData);
    });
    this.props.setCreatedStatement(statementId);
    this.props.onClose();
  };

  render() {
    const { open, onClose, classes } = this.props;
    const { compoundingDays, startDate, customerId, currentPurchaseOrders, customers } = this.state;

    let poMap = [];
    if (customerId) {
      poMap = currentPurchaseOrders.map((po) => [
        po.name,
        format(po.createdAt, 'MMMM Do YYYY'),
        format(po.updatedAt, 'MMMM Do YYYY'),
        this.renderRemoveAction(po),
        this.renderDefferedAction(po),
      ]);
    }
    return (
      <React.Fragment>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
          <DialogTitle>
            <div className={classes.dialogHeaderTitle}>
              Create New Statement
              <div className={classes.dialogHeaderActions}>
                <IconButton color="inherit" onClick={onClose} aria-label="Close">
                  <CloseIcon />
                </IconButton>
              </div>
            </div>
          </DialogTitle>
          <Divider classes={{ root: classes.dividerStyles }} />
          <DialogContent>
            <form onSubmit={this.create}>
              <div className={classes.actionBar}>
                <div>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="customer" className={classes.dateLabel} shrink={customerId}>
                      Select A Customer
                    </InputLabel>
                    <Select
                      value={customerId}
                      onChange={this.handleSelectCustomerChange}
                      inputProps={{
                        required: true,
                        name: 'customerId',
                        id: 'customer',
                      }}
                      fullWidth
                    >
                      {customers.map((customer) => (
                        <MenuItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl className={classes.formControl}>
                    <InputLabel htmlFor="compounding-day" className={classes.dateLabel}>
                      Compounding Creating Statement
                    </InputLabel>
                    <Select
                      value={compoundingDays}
                      onChange={this.handleSelectChange}
                      inputProps={{
                        required: true,
                        name: 'compoundingDays',
                        id: 'compounding-day',
                      }}
                      fullWidth
                    >
                      <MenuItem key={compoundingDays} value={15}>
                        2 weeks
                      </MenuItem>
                      <MenuItem key={compoundingDays} value={30}>
                        1 month
                      </MenuItem>
                      <MenuItem key={compoundingDays} value={90}>
                        3 months
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <DatePicker
                    className={classes.lastDatePicker}
                    leftArrowIcon={<NavigateBefore />}
                    rightArrowIcon={<NavigateNext />}
                    format="MMMM Do YYYY"
                    disablePast={true}
                    label="Statement Start Date"
                    value={startDate}
                    onChange={this.handleDateChange}
                    fullWidth
                    //required={true}
                  />
                </div>
                <div className={classes.buttonStyles}>
                  <Button
                    type="submit"
                    color="primary"
                    className={classes.saveButton}
                    value="done"
                    disabled={customerId === null || poMap.length < 1}
                  >
                    CREATE
                  </Button>
                </div>
              </div>
              <Divider />
              {customerId ? (
                poMap.length > 0 ? (
                  <Table
                    hover={true}
                    tableHeaderColor="primary"
                    tableHead={['Purchase Order', 'Create Time', 'Update Time', 'Remove', 'Deferred']}
                    tableData={poMap}
                  />
                ) : (
                  <h1>No Purchase Order with data for this customer!</h1>
                )
              ) : (
                <h1>Please select a customer!</h1>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(createStatementStyles)(CreateStatement);
