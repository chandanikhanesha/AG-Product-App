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
import CircularProgress from '@material-ui/core/CircularProgress';

import { DatePicker } from '@material-ui/pickers';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import moment from 'moment';

import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';

export default class LotField extends Component {
  state = {
    originalLot: null,
    lot: null,
    ableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,
    activeTableItem: null,
    orderDate: new Date(),
    source: null,
    uniqueLots: null,
  };

  componentDidMount = async () => {
    const addLots = [];
    this.props.lots.map((c) => addLots.push(c.lotNumber));
    this.setState({ uniqueLots: [...new Set(addLots)] });
    const { lot } = this.props;
    let orderDate = lot.orderDate ? lot.orderDate : new Date();
    let deliveryDate = lot.deliveryDate ? lot.deliveryDate : new Date();

    this.setState({
      originalLot: { ...lot, orderDate, deliveryDate },
      lot: { ...lot, orderDate, deliveryDate },
    });
  };

  handleDateChange = (field) => (date) => {
    this.setState((state) => ({
      lot: {
        ...state.lot,
        [field]: moment.utc(date._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
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
      addNewLotClose,
      removeNewLot,
      isSeedCompanyProduct,
      productDealers,
      isMonsantoProduct,
      renderLotsData,
      lots,
      isLoading,
    } = this.props;

    const { lot, originalLot, tableItemActionMenuOpen, tableItemActionAnchorEl, activeTableItem, uniqueLots } =
      this.state;
    if (!lot) {
      return null;
    }
    const isSourceSeedCompany = lot.source === 'Seed Company';
    let checkSame, sourceSet;
    if (!isMonsantoProduct && isSeedCompanyProduct) {
      checkSame =
        lot.id === undefined
          ? false
          : lot.lotNumber === originalLot.lotNumber &&
            lot.seedSizeId === originalLot.seedSizeId &&
            lot.packagingId === originalLot.packagingId &&
            lot.orderDate === originalLot.orderDate &&
            lot.deliveryDate === originalLot.deliveryDate &&
            lot.quantity === originalLot.quantity &&
            lot.receivedQty === originalLot.receivedQty &&
            lot.shipNotice === originalLot.shipNotice &&
            lot.source === originalLot.source &&
            ((isSourceSeedCompany && lot.orderAmount === originalLot.orderAmount) ||
              (!isSourceSeedCompany &&
                lot.dealerId === originalLot.dealerId &&
                lot.dealerName === originalLot.dealerName));
      sourceSet = ['Seed Company', 'Seed Dealer Transfer In', 'Seed Dealer Transfer Out'];
    } else if (isMonsantoProduct) {
      checkSame =
        lot.id === undefined
          ? false
          : lot.receivedQty === originalLot.receivedQty &&
            lot.packagingId === originalLot.packagingId &&
            lot.lotNumber === originalLot.lotNumber &&
            lot.orderDate === originalLot.orderDate &&
            lot.deliveryDate === originalLot.deliveryDate &&
            lot.quantity === originalLot.quantity &&
            lot.source === originalLot.source &&
            lot.dealerId === originalLot.dealerId &&
            lot.dealerName === originalLot.dealerName &&
            lot.netWeight === originalLot.netWeight &&
            lot.shipNotice === originalLot.shipNotice;
      sourceSet = ['Transfer In', 'Transfer Out'];
    } else {
      checkSame =
        lot.id === undefined
          ? false
          : lot.lotNumber === originalLot.lotNumber &&
            lot.orderDate === originalLot.orderDate &&
            product &&
            lot.receivedQty === originalLot.receivedQty &&
            lot.packagingId === originalLot.packagingId &&
            lot.lotNumber === originalLot.lotNumber &&
            lot.orderDate === originalLot.orderDate &&
            lot.quantity === originalLot.quantity &&
            lot.source === originalLot.source &&
            lot.dealerId === originalLot.dealerId &&
            lot.netWeight === originalLot.netWeight &&
            lot.dealerName === originalLot.dealerName &&
            lot.shipNotice === originalLot.shipNotice;
      sourceSet = ['Transfer In', 'Transfer Out'];
    }

    const availableSeedSizes = seedSizes.filter(
      (ss) => ss.seedCompanyId === product.seedCompanyId && ss.seedType === product.seedType,
    );
    const availablePackagings = packagings.filter(
      (p) => p.seedCompanyId === product.seedCompanyId && p.seedType === product.seedType,
    );

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
        {!isMonsantoProduct && (
          <FormControl className={classes.lotGridItemWidth2}>
            <DatePicker
              leftArrowIcon={<NavigateBefore />}
              rightArrowIcon={<NavigateNext />}
              format="MMMM Do YYYY"
              disablePast={false}
              value={
                isMonsantoProduct ? lot.shipDate : lot.orderDate || moment.utc().format('YYYY-MM-DD') + 'T00:00:00.000Z'
              }
              onChange={this.handleDateChange(isMonsantoProduct ? 'shipDate' : 'orderDate')}
              className={classes.itemWidth}
            />
          </FormControl>
        )}
        {isMonsantoProduct && (
          <FormControl className={classes.lotGridItemWidth2}>
            <DatePicker
              leftArrowIcon={<NavigateBefore />}
              rightArrowIcon={<NavigateNext />}
              format="MMMM Do YYYY"
              disablePast={false}
              value={lot.deliveryDate || new Date()}
              onChange={this.handleDateChange('deliveryDate')}
              className={classes.itemWidth}
            />
          </FormControl>
        )}

        {!isMonsantoProduct ? (
          <FormControl className={classes.lotGridItemWidth2}>
            <Select
              value={lot.source}
              onChange={this.handleLotChange('source')}
              inputProps={{
                required: true,
                id: 'Source',
                name: 'Source',
              }}
              className={classes.itemWidth}
            >
              {sourceSet.map((source) => (
                <MenuItem key={source} value={source}>
                  {source}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <FormControl className={classes.lotGridItemWidth2}>
            <Select
              value={lot.source}
              onChange={this.handleLotChange('source')}
              inputProps={{
                required: true,
                id: 'Source',
                name: 'Source',
              }}
              className={classes.itemWidth}
            >
              {sourceSet.map((source) => (
                <MenuItem key={source} value={source}>
                  {source}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {lot.source !== 'Transfer Out' && lot.source !== 'Seed Dealer Transfer Out' && (
          <FormControl className={classes.lotGridItemWidth2}>
            <CustomInput
              id={'lot-number'}
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
                // disabled: isMonsantoProduct ? true : false,
                style: { color: 'black' },
              }}
            />
          </FormControl>
        )}
        {(lot.source === 'Transfer Out' || lot.source === 'Seed Dealer Transfer Out') && (
          <FormControl className={classes.lotGridItemWidth2}>
            <InputLabel htmlFor="lotNumber" shrink>
              Lot
            </InputLabel>
            <Select
              value={lot.lotNumber}
              onChange={this.handleLotChange('lotNumber')}
              inputProps={{
                required: true,
                id: 'lotNumber',
                name: 'lotNumber',
              }}
              className={classes.itemWidth}
            >
              {/* {lots.map(
                (lots) =>
                  lots.lotNumber && (
                    <MenuItem value={lots.lotNumber && lots.lotNumber}>{lots.lotNumber && lots.lotNumber}</MenuItem>
                  ),
              )} */}
              {uniqueLots.map((lots) => lots && <MenuItem value={lots}>{lots}</MenuItem>)}
            </Select>
          </FormControl>
        )}
        {!isMonsantoProduct && isSeedCompanyProduct && (
          <FormControl className={classes.lotGridItemWidth1}>
            <Select
              value={lot.seedSizeId}
              onChange={this.handleLotChange('seedSizeId')}
              inputProps={{
                required: true,
                id: 'seedSizeId',
                name: 'seedSizeId',
              }}
              className={classes.itemWidth}
            >
              {availableSeedSizes.map((seedSize) => (
                <MenuItem key={seedSize.id} value={seedSize.id}>
                  {seedSize.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {!isMonsantoProduct && isSeedCompanyProduct && (
          <FormControl className={classes.lotGridItemWidth1}>
            <Select
              value={lot.packagingId}
              onChange={this.handleLotChange('packagingId')}
              inputProps={{
                required: true,
                id: 'packagingId',
                name: 'packagingId',
              }}
              className={classes.itemWidth}
            >
              {availablePackagings.map((packaging) => (
                <MenuItem key={packaging.id} value={packaging.id}>
                  {packaging.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {!isMonsantoProduct && isSourceSeedCompany && (
          <FormControl className={classes.lotGridItemWidth2}>
            <InputLabel htmlFor="orderAmount" shrink>
              Dealer Order
            </InputLabel>
            <CustomInput
              id={'orderAmount'}
              formControlProps={{
                fullWidth: true,
                classes: { root: classes.textItemStyles },
              }}
              inputProps={{
                type: 'number',
                value: lot.orderAmount,
                classes: { root: classes.itemWidth },
                name: 'orderAmount',
                onChange: this.handleLotChange('orderAmount'),
              }}
            />
          </FormControl>
        )}
        {!isSourceSeedCompany && (
          <React.Fragment>
            {/* <Creatable
              backspaceRemovesValue={true}
              isClearable={true}
              classes={classes}
              styles={selectStyles}
              components={components}
              onChange={this.handleProductsChange("name", props.value)}
              onInputChange={this.handleProductsInputChange(
                "name",
                props.value
              )}
              placeholder="Dealer ID"
              options={suggestions.name}
              isValidNewOption={() => true}
              //isDisabled={false}
              value={{ label: name, value: name }}
              textFieldProps={{
                label: "Name",
                InputLabelProps: {
                  shrink: true,
                },
              }}
              menuPortalTarget={document.body}
              menuPosition={"absolute"}
            /> */}
            <FormControl className={isSeedCompanyProduct ? classes.lotGridItemWidth2 : classes.lotGridItemWidth4}>
              <InputLabel htmlFor="dealerName" shrink>
                Dealer Name
              </InputLabel>
              <Select
                value={lot.dealerId}
                onChange={this.handleLotChange('dealerId')}
                inputProps={{
                  required: true,
                  id: 'dealerId',
                  name: 'dealerId',
                }}
                className={classes.itemWidth}
              >
                {productDealers.map((productDealer) => (
                  <MenuItem value={productDealer.id} id={productDealer.name}>
                    {productDealer.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </React.Fragment>
        )}
        <FormControl className={classes.lotGridItemWidth1}>
          {/* <InputLabel htmlFor="quantity" shrink>
            {isSourceSeedCompany ? 'Qty Shipped' : 'Quantity'}
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
              style: { color: 'black', marginLeft: '20px' },
              onChange: this.handleLotChange('quantity'),
              step: 0.1,
              min: 0,
            }}
            style={{ width: '80px' }}
          />
        </FormControl>

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

        {/* {isMonsantoProduct && (
          <FormControl className={classes.lotGridItemWidth2}>
            <CustomInput
              id={'dealerName'}
              formControlProps={{
                fullWidth: true,
                classes: { root: classes.textItemStyles },
              }}
              inputProps={{
                type: 'text',
                value: lot.dealerName,
                onChange: this.handleLotChange('dealerName'),
                name: 'dealerName',
                classes: { root: classes.itemWidth },
                style: { color: 'black' },
              }}
            />
          </FormControl>
        )} */}

        <div>
          {!checkSame ? (
            <Fragment>
              {isLoading && <CircularProgress size={24} style={{ position: 'absolute', marginLeft: '-35px' }} />}
              <CheckIcon
                id="checkTransfer"
                onClick={() => {
                  this.setState({
                    originalLot: { ...this.state.lot },
                  });
                  onSave(this.state.lot);
                  addNewLotClose();
                }}
                style={{ color: 'green' }}
              />
              <CloseIcon
                style={{ color: 'red' }}
                onClick={() => {
                  if (lot.id === undefined) {
                    removeNewLot();
                    addNewLotClose();
                  } else {
                    const { originalLot } = this.state;
                    this.setState({
                      lot: { ...originalLot },
                    });
                    addNewLotClose();
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
                  addNewLotClose();
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
