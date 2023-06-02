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
import TextField from '@material-ui/core/TextField';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';

export default class AddReturnField extends Component {
  state = {
    originalLot: null,
    lot: null,
    ableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,
    activeTableItem: null,
    shipDate: new Date(),
    deliveryDate: new Date(),
    source: null,
  };

  componentDidMount = () => {
    const { lot } = this.props;
    let deliveryDate = lot.deliveryDate ? lot.deliveryDate : new Date();
    this.setState({
      originalLot: { ...lot, deliveryDate },
      lot: { ...lot, deliveryDate },
    });
  };

  handleDateChange = (date) => {
    this.setState((state) => ({
      lot: {
        ...state.lot,
        deliveryDate: moment.utc(date._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
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
      onSaveReturn,
      seedSizes,
      packagings,
      product,
      deleteLot,
      addReturnLotClose,
      removeNewLot,
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
        : lot.netWeight === originalLot.netWeight &&
          lot.lotNumber === originalLot.lotNumber &&
          lot.quantity === originalLot.quantity &&
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
        {/* date2 */}

        <FormControl className={classes.lotGridItemWidth2}>
          <DatePicker
            leftArrowIcon={<NavigateBefore />}
            rightArrowIcon={<NavigateNext />}
            format="MMMM Do YYYY"
            isDisabled={true}
            value={lot.deliveryDate || new Date()}
            onChange={this.handleDateChange}
            className={classes.itemWidth}
          />
        </FormControl>

        <FormControl className={classes.lotGridItemWidth2}>
          <InputLabel htmlFor="lotNumber" shrink>
            Lot
          </InputLabel>
          <Select
            id="chooseLot"
            value={lot.lotNumber}
            onChange={this.handleLotChange('lotNumber')}
            inputProps={{
              required: true,
              id: 'lotNumber',
              name: 'lotNumber',
            }}
            className={classes.itemWidth}
          >
            {lots.map(
              (lots) =>
                lots.lotNumber && (
                  <MenuItem value={lots.lotNumber && lots.lotNumber} id={lots.lotNumber}>
                    {lots.lotNumber && lots.lotNumber}
                  </MenuItem>
                ),
            )}
          </Select>
        </FormControl>

        {/* lot */}
        {/* <FormControl className={classes.lotGridItemWidth2}>
          <CustomInput
            id={'lotNumber'}
            formControlProps={{
              fullWidth: true,
              classes: { root: classes.textItemStyles },
            }}
            inputProps={{
              type: 'text',
              value: lot.lotNumber,
              onChange: this.handleLotChange('lotNumber'),
              name: 'lotNumber',
              classes: { root: classes.itemWidth },
              style: { color: 'black' },
            }}
          />
        </FormControl> */}

        <FormControl className={classes.lotGridItemWidth2}>
          {/* <InputLabel htmlFor="quantity" shrink>
            Qty
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

              classes: { root: classes.itemWidth },
              name: 'quantity',
              onChange: this.handleLotChange('quantity'),
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

                style: { color: 'black' },
              }}
            />
          </FormControl>
        )}

        <FormControl className={classes.lotGridItemWidth2}>
          <InputLabel htmlFor="billOfLanding" shrink>
            Bill of Landing
          </InputLabel>
          <CustomInput
            id={'shipNotice'}
            formControlProps={{
              fullWidth: true,
              classes: { root: classes.textItemStyles },
            }}
            inputProps={{
              value: lot.shipNotice,
              classes: { root: classes.itemWidth },
              name: 'shipNotice',
              onChange: this.handleLotChange('shipNotice'),
            }}
          />
        </FormControl>

        <div>
          {!checkSame ? (
            <Fragment>
              <CheckIcon
                id="checkReturn"
                onClick={() => {
                  this.setState({
                    originalLot: { ...this.state.lot },
                  });
                  onSaveReturn(this.state.lot);
                  addReturnLotClose();
                }}
                style={{ color: 'green' }}
              />
              <CloseIcon
                style={{ color: 'red' }}
                onClick={() => {
                  if (lot.id === undefined) {
                    removeNewLot();
                    addReturnLotClose();
                  } else {
                    const { originalLot } = this.state;
                    this.setState({
                      lot: { ...originalLot },
                    });
                    addReturnLotClose();
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
                  addReturnLotClose();
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
