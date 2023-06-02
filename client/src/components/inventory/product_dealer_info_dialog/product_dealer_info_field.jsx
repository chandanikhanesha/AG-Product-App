import React, { Component, Fragment } from 'react';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';
import IconButton from '@material-ui/core/IconButton';

import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';

export default class ProductDealerInfoField extends Component {
  state = {
    originalProductDealer: null,
    productDealer: null,
    ableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,
    activeTableItem: null,
  };

  componentDidMount = () => {
    const { productDealer } = this.props;
    this.setState({
      originalProductDealer: { ...productDealer },
      productDealer: { ...productDealer },
    });
  };

  handleProductDealerChange = (field) => (event) => {
    const value = event.target.value;
    this.setState((state) => ({
      productDealer: {
        ...state.productDealer,
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
      createProductDealer,
      updateProductDealer,
      deleteProductDealer,
      addNewProductDealerClose,
      removeNewProductDealer,
    } = this.props;

    const { tableItemActionMenuOpen, tableItemActionAnchorEl, activeTableItem, productDealer, originalProductDealer } =
      this.state;

    if (!productDealer) {
      return null;
    }

    const checkSame =
      productDealer.id === undefined
        ? false
        : productDealer.name === originalProductDealer.name &&
          productDealer.notes === originalProductDealer.notes &&
          productDealer.phone === originalProductDealer.phone &&
          productDealer.email === originalProductDealer.email &&
          productDealer.address === originalProductDealer.address;

    const canAdd = productDealer.name !== null && productDealer.name !== '';

    return (
      <Grid
        item
        xs={12}
        key={productDealer.id}
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Grid container>
          <Grid xs={2}>
            <FormControl className={classes.productDealerGridItemWidth6}>
              <CustomInput
                id={'name'}
                formControlProps={{
                  fullWidth: true,
                  classes: { root: classes.textItemStyles },
                }}
                inputProps={{
                  type: 'text',
                  value: productDealer.name,
                  onChange: this.handleProductDealerChange('name'),
                  name: 'name',
                  classes: { root: classes.itemWidth },
                }}
              />
            </FormControl>
          </Grid>

          <Grid xs={2}>
            <FormControl className={classes.productDealerGridItemWidth6}>
              <CustomInput
                id={'notes'}
                formControlProps={{
                  fullWidth: true,
                  classes: { root: classes.textItemStyles },
                }}
                inputProps={{
                  type: 'text',
                  value: productDealer.notes,
                  onChange: this.handleProductDealerChange('notes'),
                  name: 'notes',
                  classes: { root: classes.itemWidth },
                }}
              />
            </FormControl>
          </Grid>

          <Grid xs={2}>
            <FormControl className={classes.productDealerGridItemWidth6}>
              <CustomInput
                id={'phone'}
                formControlProps={{
                  fullWidth: true,
                  classes: { root: classes.textItemStyles },
                }}
                inputProps={{
                  type: 'text',
                  value: productDealer.phone,
                  onChange: this.handleProductDealerChange('phone'),
                  name: 'phone',
                  classes: { root: classes.itemWidth },
                }}
              />
            </FormControl>
          </Grid>

          <Grid xs={2}>
            <FormControl className={classes.productDealerGridItemWidth6}>
              <CustomInput
                id={'email'}
                formControlProps={{
                  fullWidth: true,
                  classes: { root: classes.textItemStyles },
                }}
                inputProps={{
                  type: 'email',
                  value: productDealer.email,
                  onChange: this.handleProductDealerChange('email'),
                  name: 'email',
                  classes: { root: classes.itemWidth },
                }}
              />
            </FormControl>
          </Grid>

          <Grid xs={2}>
            <FormControl className={classes.productDealerGridItemWidth6}>
              <CustomInput
                id={'address'}
                formControlProps={{
                  fullWidth: true,
                  classes: { root: classes.textItemStyles },
                }}
                inputProps={{
                  type: 'text',
                  value: productDealer.address,
                  onChange: this.handleProductDealerChange('address'),
                  name: 'address',
                  classes: { root: classes.itemWidth },
                }}
              />
            </FormControl>
          </Grid>

          <Grid xs={2}>
            <div style={{ display: 'flex' }}>
              <div>
                {!checkSame ? (
                  <Fragment>
                    <IconButton
                      id="dealerCheck"
                      onClick={() => {
                        this.setState({
                          originalProductDealer: { ...this.state.productDealer },
                        });
                        productDealer.id
                          ? updateProductDealer(this.state.productDealer)
                          : createProductDealer(this.state.productDealer);
                        productDealer.id && addNewProductDealerClose();
                      }}
                      style={canAdd ? { color: 'green' } : { color: 'grey' }}
                      disabled={!canAdd}
                    >
                      <CheckIcon />
                    </IconButton>

                    <IconButton
                      style={{ color: 'red' }}
                      onClick={() => {
                        if (productDealer.id) {
                          const { originalProductDealer } = this.state;
                          this.setState({
                            productDealer: { ...originalProductDealer },
                          });
                        } else {
                          removeNewProductDealer();
                          addNewProductDealerClose();
                        }
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Fragment>
                ) : (
                  <IconButton aria-label="delete" onClick={this.handleTableItemActionMenuOpen(productDealer)}>
                    <MoreHorizontalIcon fontSize="small" />
                  </IconButton>
                )}
              </div>

              <div>
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
                          deleteProductDealer(activeTableItem);
                          addNewProductDealerClose();
                          this.handleTableItemActionMenuClose();
                        }}
                      >
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Paper>
                </Popover>
              </div>
            </div>
          </Grid>
        </Grid>
      </Grid>
    );
  }
}
