import React, { Component, Fragment } from 'react';
//import { Creatable } from "react-select";

import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import moment from 'moment';

import { DatePicker } from '@material-ui/pickers';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';

import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';

export default class CustomEarlyPayField extends Component {
  state = {
    originalEarlyPay: null,
    earlyPay: null,
    ableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,
    activeTableItem: null,
    payByDate: new Date(),
    source: null,
  };

  componentDidMount = () => {
    const { earlyPay } = this.props;
    let payByDate = earlyPay.payByDate ? earlyPay.payByDate : new Date();
    this.setState({
      originalEarlyPay: { ...earlyPay, payByDate },
      earlyPay: { ...earlyPay, payByDate },
    });
  };

  handleDateChange = (date) => {
    this.setState((state) => ({
      earlyPay: {
        ...state.earlyPay,
        payByDate: moment.utc(date._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
      },
    }));
  };

  handleEarlyPayChange = (field) => (event) => {
    const value = event.target.value;
    this.setState((state) => ({
      earlyPay: {
        ...state.earlyPay,
        [field]: parseInt(value, 10),
      },
    }));
  };

  handleTableItemActionMenuOpen = (item) => (event) => {
    this.setState({
      tableItemActionMenuOpen: true,
      tableItemActionAnchorEl: event.target,
      activeTableItem: item,
    });
  };

  handleTableItemActionMenuClose = () => {
    this.setState({ tableItemActionMenuOpen: false, activeTableItem: null });
  };

  render() {
    const { classes, onSave, deleteEarlyPay, addNewEarlyPayClose, removeNewEarlyPay } = this.props;

    const { earlyPay, originalEarlyPay, tableItemActionMenuOpen, tableItemActionAnchorEl, activeTableItem } =
      this.state;

    if (!earlyPay) {
      return null;
    }

    let checkSame =
      earlyPay.id === undefined
        ? false
        : earlyPay.payByDate === originalEarlyPay.payByDate &&
          earlyPay.payingLessAmount === originalEarlyPay.payingLessAmount &&
          earlyPay.remainingTotal === originalEarlyPay.remainingTotal;

    return (
      <Grid
        item
        xs={12}
        key={earlyPay.id}
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <FormControl className={classes.earlyPayGridItemWidth4}>
          <DatePicker
            leftArrowIcon={<NavigateBefore />}
            rightArrowIcon={<NavigateNext />}
            format="MMMM Do YYYY"
            disablePast={false}
            value={earlyPay.payByDate || new Date()}
            onChange={this.handleDateChange}
            className={classes.itemWidth}
          />
        </FormControl>
        <FormControl className={classes.earlyPayGridItemWidth4}>
          <CustomInput
            id={'paying-less'}
            formControlProps={{
              fullWidth: true,
              classes: { root: classes.textItemStyles },
            }}
            inputProps={{
              type: 'number',
              value: earlyPay.payingLessAmount,
              onChange: this.handleEarlyPayChange('payingLessAmount'),
              name: 'payingLessAmount',
              classes: { root: classes.itemWidth },
            }}
          />
        </FormControl>
        <FormControl className={classes.earlyPayGridItemWidth3}>
          <CustomInput
            id={'remaining-total'}
            formControlProps={{
              fullWidth: true,
              classes: { root: classes.textItemStyles },
            }}
            inputProps={{
              type: 'number',
              value: earlyPay.remainingTotal,
              onChange: this.handleEarlyPayChange('remainingTotal'),
              name: 'remainingTotal',
              classes: { root: classes.itemWidth },
            }}
          />
        </FormControl>
        <div>
          {!checkSame ? (
            <Fragment>
              <CheckIcon
                onClick={() => {
                  this.setState({
                    originalEarlyPay: { ...this.state.earlyPay },
                  });
                  onSave(this.state.earlyPay);
                  addNewEarlyPayClose();
                }}
                style={{ color: 'green' }}
              />
              <CloseIcon
                style={{ color: 'red' }}
                onClick={() => {
                  if (earlyPay.id === undefined) {
                    removeNewEarlyPay();
                    addNewEarlyPayClose();
                  } else {
                    const { originalEarlyPay } = this.state;
                    this.setState({
                      earlyPay: { ...originalEarlyPay },
                    });
                    addNewEarlyPayClose();
                  }
                }}
              />
            </Fragment>
          ) : (
            <IconButton aria-label="delete" onClick={this.handleTableItemActionMenuOpen(earlyPay)}>
              <MoreHorizontalIcon fontSize="small" />
            </IconButton>
          )}
        </div>
        <Divider />
        <Popover
          open={tableItemActionMenuOpen}
          anchorEl={tableItemActionAnchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          onClose={this.handleTableItemActionMenuClose}
        >
          <Paper>
            <MenuList>
              <MenuItem
                className={classes.addNewMenuItem}
                onClick={() => {
                  deleteEarlyPay(activeTableItem);
                  addNewEarlyPayClose();
                  this.handleTableItemActionMenuClose();
                }}
              >
                Delete
              </MenuItem>
            </MenuList>
          </Paper>
        </Popover>
      </Grid>
    );
  }
}
