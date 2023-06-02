import React, { Component } from 'react';

import { format } from 'date-fns';
import moment from 'moment';

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

import { statementSettingStyles } from './statement_setting.styles';

class StatementSetting extends Component {
  state = {
    statementNo: '',
    compoundingDays: 30,
    startDate: moment.utc().format(),
    poRemoved: {},
    poDeferred: {},
    poDeferredDate: {},
    poChanged: [],
    compoundingDaysChanged: false,
    startDateChanged: false,
    poStatementDetail: [],
  };

  componentDidMount = async () => {
    this.setPOStatementData();
  };

  setPOStatementData = async () => {
    const { statementId, getStatementById, purchaseOrders } = this.props;
    const { purchaseOrderStatements } = this.props;
    let poRemoved = {},
      poDeferred = {},
      poDeferredDate = {},
      poStatementData = [],
      currentStatement;
    let currentPurchaseOrderStatements = purchaseOrderStatements
      .filter((poStatement) => poStatement.statementId === statementId)
      .sort((a, b) => {
        return a.purchaseOrderId - b.purchaseOrderId;
      });
    await getStatementById(statementId).then((response) => {
      currentStatement = response.payload;
      currentPurchaseOrderStatements.forEach((poStatement) => {
        const purchaseOrder = purchaseOrders.find((po) => po.id === poStatement.purchaseOrderId);
        let poId = poStatement.purchaseOrderId;
        if (poStatement.isRemoved) {
          poRemoved = { ...poRemoved, [poId]: true };
        } else {
          poRemoved = { ...poRemoved, [poId]: false };
        }
        if (poStatement.isDeferred) {
          poDeferred = { ...poDeferred, [poId]: true };
          poDeferredDate = {
            ...poDeferredDate,
            [poId]: poStatement.deferredDate,
          };
        } else {
          poDeferred = { ...poDeferred, [poId]: false };
        }
        poStatementData.push(purchaseOrder);
      });
      return null;
    });
    this.setState({
      statementNo: currentStatement.statementNo,
      compoundingDays: currentStatement.compoundingDays,
      startDate: currentStatement.startDate,
      poRemoved: poRemoved,
      poDeferred: poDeferred,
      poDeferredDate: poDeferredDate,
      poStatementDetail: poStatementData,
    });
  };

  handleSelectChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
      compoundingDaysChanged: true,
    });
  };

  handleDateChange = (date) => {
    this.setState({
      startDate: date,
      startDateChanged: true,
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
      const { poChanged } = this.state;
      poChanged.push([{ id: poId }]);
      this.setState((prevState) => ({
        poRemoved: {
          ...prevState.poRemoved,
          [poId]: true,
        },
        poChanged: poChanged,
      }));
    }
    if (!checked) {
      const { poChanged } = this.state;
      poChanged.push([{ id: poId }]);
      this.setState((prevState) => ({
        poRemoved: {
          ...prevState.poRemoved,
          [poId]: false,
        },
        poChanged: poChanged,
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
      const { poChanged } = this.state;
      poChanged.push([{ id: poId }]);
      this.setState((prevState) => ({
        poDeferred: {
          ...prevState.poDeferred,
          [poId]: true,
        },
        poChanged: poChanged,
      }));
    }
    if (!checked) {
      const { poChanged } = this.state;
      poChanged.push([{ id: poId }]);
      this.setState((prevState) => ({
        poDeferred: {
          ...prevState.poDeferred,
          [poId]: false,
        },
        poChanged: poChanged,
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

  updateStatement = () => {
    const { updateStatement, updatePurchaseOrderStatement, statementId, purchaseOrderStatements, onClose } = this.props;
    const {
      compoundingDaysChanged,
      startDateChanged,
      compoundingDays,
      startDate,
      poRemoved,
      poDeferred,
      poDeferredDate,
      poChanged,
    } = this.state;
    if (compoundingDaysChanged || startDateChanged) {
      let data = { compoundingDays, startDate };
      updateStatement(statementId, data);
    }
    if (poChanged) {
      poChanged.map((poChange) => {
        let poId = poChange[0].id;
        let poStatement = purchaseOrderStatements.find(
          (POS) => POS.statementId === statementId && POS.purchaseOrderId === poId,
        );
        let data = {
          statementId: statementId,
          purchaseOrderId: poId,
          isRemoved: poRemoved[poId] != 'undefined' ? poRemoved[poId] : poStatement.isRemoved,
          isDeferred: poDeferred[poId] != 'undefined' ? poDeferred[poId] : poStatement.isDeferred,
          deferredDate: poDeferredDate[poId] != 'undefined' ? poDeferredDate[poId] : poStatement.deferredDate,
        };
        updatePurchaseOrderStatement(data);
      });
    }
    onClose();
  };

  render() {
    const { open, onClose, classes, customers, currentStatement } = this.props;
    const { statementNo, compoundingDays, startDate, poStatementDetail } = this.state;
    const poMap = poStatementDetail.map((po) => [
      po.name,
      format(po.createdAt, 'MMMM Do YYYY'),
      format(po.updatedAt, 'MMMM Do YYYY'),
      this.renderRemoveAction(po),
      this.renderDefferedAction(po),
    ]);
    const customer = customers.find((customer) => customer.id === currentStatement.customerId);
    return (
      <React.Fragment>
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
          <DialogTitle>
            <div className={classes.dialogHeaderTitle}>
              Setting Statement #{statementNo} For {customer.name}
              <div className={classes.dialogHeaderActions}>
                <IconButton color="inherit" onClick={onClose} aria-label="Close">
                  <CloseIcon />
                </IconButton>
              </div>
            </div>
          </DialogTitle>
          <Divider classes={{ root: classes.dividerStyles }} />
          <DialogContent>
            <form action="#" onSubmit={this.updateStatement}>
              <div className={classes.actionBarStyles}>
                <div>
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
                  />
                </div>
                <div className={classes.buttonStyles}>
                  <Button type="submit" color="primary" className={classes.saveButton} value="done">
                    UPDATE
                  </Button>
                </div>
              </div>
              <Divider />
              <Table
                hover={true}
                tableHeaderColor="primary"
                tableHead={['Purchase Order', 'Create Time', 'Update Time', 'Remove', 'Deferred']}
                tableData={poMap}
              />
            </form>
          </DialogContent>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default withStyles(statementSettingStyles)(StatementSetting);
