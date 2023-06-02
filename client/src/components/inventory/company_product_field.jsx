import React, { Component, Fragment } from 'react';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';

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
  };

  componentDidMount = () => {
    const { lot } = this.props;
    this.setState({
      originalLot: { ...lot },
      lot: { ...lot },
    });
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
    const { classes, onSave, seedSizes, packagings, product, deleteLot } = this.props;

    const { lot, originalLot, tableItemActionMenuOpen, tableItemActionAnchorEl, activeTableItem } = this.state;

    if (!lot) {
      return null;
    }

    const checkSame =
      lot.lotNumber === originalLot.lotNumber &&
      lot.seedSizeId === originalLot.seedSizeId &&
      lot.packagingId === originalLot.packagingId &&
      lot.quantity === originalLot.quantity;

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
            }}
          />
        </FormControl>
        <FormControl className={classes.lotGridItemWidth3}>
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
        <FormControl className={classes.lotGridItemWidth2}>
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
        <FormControl className={classes.lotGridItemWidth2}>
          <CustomInput
            id={'quantity'}
            formControlProps={{
              fullWidth: true,
              classes: { root: classes.textItemStyles },
            }}
            inputProps={{
              type: 'number',
              value: lot.quantity,
              classes: { root: classes.itemWidth },
              name: 'quantity',
              onChange: this.handleLotChange('quantity'),
            }}
          />
        </FormControl>
        <div>
          {!checkSame ? (
            <Fragment>
              <CheckIcon
                onClick={() => {
                  this.setState({
                    originalLot: { ...this.state.lot },
                  });
                  onSave(this.state.lot);
                }}
                style={{ color: 'green' }}
              />
              <CloseIcon
                style={{ color: 'red' }}
                onClick={() => {
                  const { originalLot } = this.state;
                  this.setState({
                    lot: { ...originalLot },
                  });
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
