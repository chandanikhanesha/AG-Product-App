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
import TextField from '@material-ui/core/TextField';
import moment from 'moment';

import { DatePicker } from '@material-ui/pickers';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';

import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';

export default class ReturnField extends Component {
  state = {
    originalLot: null,
    lot: null,
    tableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,
    activeTableItem: null,
    shipDate: new Date(),
    deliveryDate: new Date(),
    source: null,
  };

  componentDidMount = () => {
    const { lot } = this.props;
    let shipDate = lot.shipDate ? lot.shipDate : new Date();
    let deliveryDate = lot.deliveryDate ? lot.deliveryDate : new Date();
    this.setState({
      originalLot: { ...lot, shipDate, deliveryDate },
      lot: { ...lot, shipDate, deliveryDate },
    });
  };

  handleDateChange = (date) => {
    this.setState((state) => ({
      lot: {
        ...state.lot,
        deliveryDate: moment.utc(date._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
        shipDate: moment.utc(date._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
      },
    }));
  };

  handleLotChange = (field) => (event) => {
    const value = event.target.value;
    this.setState((state) => ({
      lot: {
        ...state.lot,
        [field]: value,
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
    const {
      classes,
      onSave,
      seedSizes,
      packagings,
      product,
      deleteLot,
      addReceivedLotClose,
      removeNewReceivedLot,
      isSeedCompanyProduct,
      productDealers,
      isMonsantoProduct,
      lots,
    } = this.props;

    const { lot, originalLot, tableItemActionMenuOpen, tableItemActionAnchorEl, activeTableItem } = this.state;
    if (!lot) {
      return null;
    }
    let checkSame;
    checkSame =
      lot.id === undefined
        ? false
        : lot.lotNumber === originalLot.lotNumber &&
          lot.shipDate === originalLot.shipDate &&
          lot.quantity === originalLot.quantity &&
          lot.receivedQty === originalLot.receivedQty &&
          lot.deliveryDate === originalLot.deliveryDate &&
          lot.deliveryNoteNumber === originalLot.deliveryNoteNumber &&
          lot.shipNotice === originalLot.shipNotice;

    return (
      <Grid
        item
        xs={12}
        key={lot.id}
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* shipdate */}
        <FormControl className={classes.lotGridItemWidth2}>
          <DatePicker
            leftArrowIcon={<NavigateBefore />}
            rightArrowIcon={<NavigateNext />}
            format="MMMM Do YYYY"
            value={lot.shipDate || new Date()}
            className={classes.itemWidth}
            onChange={this.handleDateChange}
            disabled={isMonsantoProduct ? true : false}
          />
        </FormControl>
        {/* deliverydate2 */}

        <FormControl className={classes.lotGridItemWidth2}>
          <DatePicker
            leftArrowIcon={<NavigateBefore />}
            rightArrowIcon={<NavigateNext />}
            format="MMMM Do YYYY"
            value={lot.deliveryDate || new Date()}
            className={classes.itemWidth}
            onChange={this.handleDateChange}
            disabled={isMonsantoProduct ? true : false}
          />
        </FormControl>

        {/* Delivery note */}

        {isMonsantoProduct && (
          <FormControl className={classes.lotGridItemWidth2}>
            <CustomInput
              id={'deliveryNoteNumber'}
              formControlProps={{
                fullWidth: true,
                classes: { root: classes.textItemStyles },
              }}
              inputProps={{
                type: 'text',
                value: lot.deliveryNoteNumber,
                onChange: this.handleLotChange('deliveryNoteNumber'),
                name: 'deliveryNoteNumber',
                classes: { root: classes.itemWidth },
                style: { color: 'black' },
                disabled: isMonsantoProduct ? true : false,
              }}
            />
          </FormControl>
        )}

        {/* shipNotice */}

        <FormControl className={classes.lotGridItemWidth2}>
          <CustomInput
            id={'shipNotice'}
            formControlProps={{
              fullWidth: true,
              classes: { root: classes.textItemStyles },
            }}
            inputProps={{
              type: 'text',
              value: lot.shipNotice,
              onChange: this.handleLotChange('shipNotice'),
              name: 'shipNotice',
              classes: { root: classes.itemWidth },
              disabled: isMonsantoProduct ? true : false,
              style: { color: 'black' },
            }}
          />
        </FormControl>

        {/* lot */}
        <FormControl className={classes.lotGridItemWidth2}>
          <CustomInput
            id={'lotNumber'}
            formControlProps={{
              fullWidth: true,
              classes: { root: classes.textItemStyles },
            }}
            inputProps={{
              type: 'text',
              value: lot.lotNumber,
              name: 'lotNumber',
              onChange: this.handleLotChange('lotNumber'),
              classes: { root: classes.itemWidth },
              disabled: isMonsantoProduct ? true : false,
              style: { color: 'black' },
            }}
          />
        </FormControl>

        {isMonsantoProduct && (
          <FormControl className={classes.lotGridItemWidth2}>
            {/* <InputLabel htmlFor="quantity" shrink>
              Shipped Qty
            </InputLabel> */}
            <TextField
              id={'quantity'}
              formControlProps={{
                fullWidth: true,
                classes: { root: classes.textItemStyles },
              }}
              inputProps={{
                type: 'number',
                value: lot.quantity === 0 ? '' : lot.quantity,

                onChange: this.handleLotChange('quantity'),
                classes: { root: classes.itemWidth },
                name: 'quantity',
                disabled: isMonsantoProduct ? true : false,
                step: 0.1,
                min: 0,
              }}
              style={{ width: '130px' }}
            />
          </FormControl>
        )}

        {!isMonsantoProduct && (
          <FormControl className={classes.lotGridItemWidth2}>
            {/* <InputLabel htmlFor="quantity" shrink>
              Ordered Qty
            </InputLabel> */}
            <CustomInput
              id={'orderAmount'}
              formControlProps={{
                fullWidth: true,
                classes: { root: classes.textItemStyles },
              }}
              inputProps={{
                type: 'number',
                value: lot.orderAmount,
                onChange: this.handleLotChange('orderAmount'),
                classes: { root: classes.itemWidth },
                name: 'orderAmount',
                disabled: true,
              }}
            />
          </FormControl>
        )}

        {/* receivedQty */}

        <FormControl className={classes.lotGridItemWidth2}>
          {/* <InputLabel htmlFor="receivedQty" shrink>
            Received Qty
          </InputLabel> */}
          <TextField
            id={'receivedQty'}
            formControlProps={{
              // fullWidth: true,
              classes: { root: classes.textItemStyles },
            }}
            inputProps={{
              type: 'number',
              value: lot.quantity === 0 ? '' : lot.quantity,

              classes: { root: classes.itemWidth },
              onChange: this.handleLotChange('quantity'),
              name: 'quantity',
              disabled: isMonsantoProduct ? true : false,
              step: 0.1,
              min: 0,
            }}
            style={{ width: '130px' }}
          />
        </FormControl>

        {/* netWeight */}
        {isMonsantoProduct && (
          <FormControl className={classes.lotGridItemWidth2}>
            <CustomInput
              id={'netWeight'}
              formControlProps={{
                fullWidth: true,
                classes: { root: classes.textItemStyles },
              }}
              inputProps={{
                type: 'text',
                value: lot.netWeight,
                onChange: this.handleLotChange('netWeight'),

                name: 'netWeight',
                classes: { root: classes.itemWidth },
                disabled: isMonsantoProduct ? true : false,
                style: { color: 'black' },
              }}
            />
          </FormControl>
        )}

        <div>
          {!checkSame ? (
            <Fragment>
              <CheckIcon
                id="checkSave"
                onClick={() => {
                  this.setState({
                    originalLot: { ...this.state.lot },
                  });
                  onSave(this.state.lot);
                  addReceivedLotClose();
                }}
                style={{ color: 'green' }}
              />
              <CloseIcon
                style={{ color: 'red' }}
                onClick={() => {
                  if (lot.id === undefined) {
                    removeNewReceivedLot();
                    addReceivedLotClose();
                  } else {
                    const { originalLot } = this.state;
                    this.setState({
                      lot: { ...originalLot },
                    });
                    addReceivedLotClose();
                  }
                }}
              />
            </Fragment>
          ) : (
            <IconButton aria-label="delete" onClick={this.handleTableItemActionMenuOpen(lot)}>
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
                  deleteLot(activeTableItem);
                  addReceivedLotClose();
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
