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

export default class SeedCompanyProductField extends Component {
  state = {
    originalSeedCompanyProduct: null,
    seedCompanyProduct: null,
    ableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,
    activeTableItem: null,
  };

  componentDidMount = () => {
    const { seedCompanyProduct } = this.props;
    this.setState({
      originalSeedCompanyProduct: { ...seedCompanyProduct },
      seedCompanyProduct: { ...seedCompanyProduct },
    });
  };

  handleLotChange = (field) => (event) => {
    const value = event.target.value;
    this.setState((state) => ({
      seedCompanyProduct: {
        ...state.seedCompanyProduct,
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

    const {
      seedCompanyProduct,
      originalSeedCompanyProduct,
      tableItemActionMenuOpen,
      tableItemActionAnchorEl,
      activeTableItem,
    } = this.state;

    if (!seedCompanyProduct) {
      return null;
    }

    const checkSame =
      seedCompanyProduct.lotNumber === originalSeedCompanyProduct.lotNumber &&
      seedCompanyProduct.seedSizeId === originalSeedCompanyProduct.seedSizeId &&
      seedCompanyProduct.packagingId === originalSeedCompanyProduct.packagingId &&
      seedCompanyProduct.quantity === originalSeedCompanyProduct.quantity;

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
        key={seedCompanyProduct.id}
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <FormControl className={classes.lotGridItemWidth2}>
          <CustomInput
            id={'seedCompanyProduct-number'}
            formControlProps={{
              fullWidth: true,
              classes: { root: classes.textItemStyles },
            }}
            inputProps={{
              type: 'text',
              value: seedCompanyProduct.lotNumber,
              onChange: this.handleLotChange('lotNumber'),
              name: 'lotNumber',
              classes: { root: classes.itemWidth },
            }}
          />
        </FormControl>
        <FormControl className={classes.lotGridItemWidth3}>
          <Select
            value={seedCompanyProduct.seedSizeId}
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
            value={seedCompanyProduct.packagingId}
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
              value: seedCompanyProduct.quantity,
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
                    originalSeedCompanyProduct: { ...this.state.seedCompanyProduct },
                  });
                  onSave(this.state.seedCompanyProduct);
                }}
                style={{ color: 'green' }}
              />
              <CloseIcon
                style={{ color: 'red' }}
                onClick={() => {
                  const { originalSeedCompanyProduct } = this.state;
                  this.setState({
                    seedCompanyProduct: { ...originalSeedCompanyProduct },
                  });
                }}
              />
            </Fragment>
          ) : (
            <IconButton aria-label="delete" onClick={this.handleTableItemActionMenuOpen(seedCompanyProduct)}>
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
