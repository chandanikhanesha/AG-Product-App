import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { uniq } from 'lodash/array';

// material-ui core components
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { numberToDollars } from '../../../utilities';
import { getQtyOrdered, getGrowerOrder } from '../../../utilities/product';
import { getGrowerCustomOrder } from '../../../utilities/custom_product';

const styles = {
  listHeader: {
    padding: 10,
    background: 'gray',
    textAlign: 'center',
    color: 'white',
  },
  selected: {
    background: '#eaeaea',
    cursor: 'pointer',
    '&:hover': {
      background: '#eaeaea',
    },
  },
  listItem: {
    cursor: 'pointer',
    '&:hover': {
      background: '#eaeaea',
    },
  },
  list: {
    maxHeight: 400,
    overflowY: 'auto',
  },
  paddedPaper: {
    padding: 10,
  },
  packagingSelect: {
    width: 200,
  },
  quantityInput: {
    width: 100,
  },
  quantityLabel: {
    width: 75,
    color: 'rgba(0, 0, 0, 0.6)',
    transform: 'translate(0, 28.5px) scale(0.75)',
  },
  count: {
    float: 'right',
  },
  center: {
    textAlign: 'center',
  },
  addToOrderBtn: {
    padding: 12,
    marginTop: 44,
  },
};

class ProductSelector extends Component {
  state = {
    editMode: false,
    selectedProduct: null,
    quantity: 0,
    allFieldsSelected: false,
    columns: [],
    packagingId: '',
    seedSizeId: '',
    description: '',
  };

  setDefaultValues() {
    const { selectedProduct, quantity, discounts, packagingId, seedSizeId } = this.props;
    if (!selectedProduct) {
      return;
    }
    const { brand, blend, treatment, amountPerBag, description, name, costUnit } = selectedProduct;
    this.setState(
      {
        editMode: true,
        brand,
        blend,
        treatment,
        amountPerBag,
        name,
        description,
        costUnit,
        quantity,
        discounts,
        selectedProduct,
        packagingId,
        seedSizeId,
      },
      () => this.addProduct(),
    );
  }

  setCornState() {
    const columns = [
      {
        id: 'brand',
        name: 'Trait',
      },
      {
        id: 'blend',
        name: 'Variety',
      },
      {
        id: 'treatment',
        name: 'Treatment',
      },
    ];

    if (this.props.isApiSeedCompany) {
      columns.push({
        id: 'seedSize',
        name: 'Seed Size',
      });

      columns.push({
        id: 'packaging',
        name: 'Packaging',
      });
    }
    this.setState({ columns }, this.setDefaultValues);
  }

  setSorghumState() {
    const columns = [
      {
        id: 'blend',
        name: 'Variety',
      },
      {
        id: 'treatment',
        name: 'Treatment',
      },
    ];

    if (this.props.isApiSeedCompany) {
      columns.push({
        id: 'seedSize',
        name: 'Seed Size',
      });

      columns.push({
        id: 'packaging',
        name: 'Packaging',
      });
    }
    this.setState({ columns }, this.setDefaultValues);
  }

  setBusinessProductsState() {
    this.setState(
      {
        columns: [
          {
            id: 'name',
            name: 'Product',
          },
          {
            id: 'type',
            name: 'Type',
          },
          {
            id: 'description',
            name: 'Product Description',
          },
        ],
        name: null,
      },
      this.setDefaultValues,
    );
  }

  setSoybeanState() {
    const columns = [
      {
        id: 'brand',
        name: 'Trait',
      },
      {
        id: 'blend',
        name: 'Variety',
      },
      {
        id: 'treatment',
        name: 'Treatment',
      },
    ];

    if (this.props.isApiSeedCompany) {
      columns.push({
        id: 'packaging',
        name: 'Packaging',
      });
    }

    this.setState({ columns }, this.setDefaultValues);
  }

  componentDidMount() {
    const { seedType } = this.props;
    switch (seedType) {
      case 'CORN':
        return this.setCornState();
      case 'SORGHUM':
        return this.setSorghumState();
      case 'SOYBEAN':
        return this.setSoybeanState();
      case 'BUSINESS':
        return this.setBusinessProductsState();
      default:
        throw new Error('Need to pass CORN, SORGHUM, or SOYBEAN to ProductSelector');
    }
  }

  availableItems() {
    const { products } = this.props;

    let available = products;

    this.state.columns.forEach((column) => {
      let selected = this.state[column.id];
      if (selected) available = available.filter((p) => p[column.id] === selected);
    });

    return available;
  }

  classificationSeedTypeMap = {
    B: 'SOYBEAN',
    C: 'CORN',
    S: 'SORGHUM',
    // A: 'ALFALFA',
    L: 'CANOLA',
    P: 'PACKAGING',
  };

  availableTypes(itemType, i) {
    const { products, seedType } = this.props;
    const { columns } = this.state;

    let types;
    let available = products;

    if (seedType !== 'BUSINESS')
      available = available.filter((p) => {
        if (p.seedType) return p.seedType === seedType;
        if (p.classification) return this.classificationSeedTypeMap[p.classification] === seedType;
      });

    if (i === 0) {
      types = uniq(available.map((p) => p[itemType]));
      if (itemType === 'blend' || itemType === 'brand') types.sort((a, b) => a.localeCompare(b));
      return types;
    }

    for (let x = 0; x < i; x++) {
      let selected = this.state[columns[x].id];
      if (selected) available = available.filter((p) => p[columns[x].id] === selected);
    }

    types = uniq(available.map((product) => product[itemType]));
    if (itemType === 'blend' || itemType === 'brand') types.sort((a, b) => a.localeCompare(b));
    return types;
  }

  setDiscountsProduct() {
    const { selectDiscountProduct } = this.props;

    let allFieldsSelected = true;

    this.state.columns.forEach((column) => {
      let selected = this.state[column.id];
      if (selected === null) allFieldsSelected = false;
    });

    if (allFieldsSelected) {
      this.setState(
        {
          selectedProduct: this.availableItems()[0],
        },
        this.onEditProductChange,
      );
      selectDiscountProduct(this.availableItems()[0]);
    } else {
      this.setState({
        selectedProduct: null,
      });
      selectDiscountProduct(null);
    }
  }

  addProduct = () => {
    const { selectedProduct, quantity, packagingId, seedSizeId } = this.state;
    const { addProductToOrder, classes, isApiSeedCompany } = this.props;

    // if using packaged product, input will have a step attribute (the number of bags in package)
    // check if input value is divisible by step value
    let quantityInput = document.querySelector(`.${classes.quantityInput} input`);
    if (quantityInput && quantityInput.value && quantityInput.step) {
      if (parseInt(quantityInput.value, 0) % parseInt(quantityInput.step, 0) !== 0) {
        return;
      }
    }

    if (selectedProduct && `${quantity}` !== '0') {
      const productToAdd = {
        ...selectedProduct,
        orderQty: quantity,
        packagingId: packagingId,
        seedSizeId: seedSizeId,
        isMonsantoProduct: isApiSeedCompany,
      };
      if (isApiSeedCompany) {
        productToAdd.msrp = this.getMSRP();
      }

      addProductToOrder(productToAdd);
    }
  };

  onEditProductChange = () => {
    const { selectedProduct, quantity, packagingId, seedSizeId } = this.state;
    const { onEditProductChange } = this.props;
    if (selectedProduct && `${quantity}` !== '0') {
      selectedProduct.orderQty = quantity;
      selectedProduct.packagingId = packagingId;
      selectedProduct.seedSizeId = seedSizeId;
      onEditProductChange(selectedProduct);
    }
  };

  setItem(property, value, i) {
    const { columns } = this.state;
    const { products } = this.props;

    let update = {
      [property]: value,
    };

    // allow customer to select 'blend' (2nd column) before 'blend' (1st column)
    if (i === 1 && !this.state[columns[i - 1].id]) {
      let product = products.find((p) => p[property] === value);
      update[columns[i - 1].id] = product[columns[i - 1].id];
    }

    // null all following columns
    for (let x = i + 1; x < columns.length; x++) {
      update[columns[x].id] = null;
    }

    this.setState(update, this.setDiscountsProduct);
  }

  previousColumnSelected(i) {
    const { columns } = this.state;

    if (columns[i].id === 'blend') return true;
    return i === 0 || this.state[columns[i - 1].id];
  }

  onInputChange = (name) => (event) => {
    this.setState(
      {
        [name]: event.target.value,
      },
      this.onEditProductChange,
    );
  };

  getCustomProductQuantity(available, i) {
    const { customerOrders } = this.props;
    const { columns } = this.state;

    if (i !== 0) {
      for (let x = 0; x < i; x++) {
        let selected = this.state[columns[x].id];
        if (selected) available = available.filter((p) => p[columns[x].id] === selected);
      }
    }

    return available.reduce((accumulator, product) => {
      return accumulator + product.quantity - getGrowerCustomOrder(product, customerOrders);
    }, 0);
  }

  getProductQuantity(item, i) {
    const { products, seedType, customerOrders } = this.props;
    const { columns } = this.state;

    let available = products.filter((p) => p[columns[i].id] === item);

    if (seedType === 'BUSINESS') return this.getCustomProductQuantity(available, i);

    if (i === 0) {
      return available.reduce((accumulator, product) => {
        return accumulator + (getQtyOrdered(product) - getGrowerOrder(product, customerOrders));
      }, 0);
    }

    for (let x = 0; x < i; x++) {
      let selected = this.state[columns[x].id];
      if (selected) available = available.filter((p) => p[columns[x].id] === selected);
    }

    return available.reduce((accumulator, product) => {
      return accumulator + (getQtyOrdered(product) - getGrowerOrder(product, customerOrders));
    }, 0);
  }

  handleSelectChange = (event) => {
    this.setState({ [event.target.name]: event.target.value }, () => this.onEditProductChange());
  };

  get showSeedSizeAndPackaging() {
    const { seedType, purchaseOrder, isApiSeedCompany } = this.props;
    return !isApiSeedCompany && seedType !== 'BUSINESS' && purchaseOrder.isSimple === true;
  }

  getMSRP() {
    const { selectedProduct } = this.state;
    let msrp = selectedProduct.msrp || selectedProduct.costUnit;
    if (this.props.isApiSeedCompany && selectedProduct.LineItem) {
      msrp = msrp || selectedProduct.LineItem.suggestedEndUserPrice;
    }
    return msrp;
  }

  getMSRPInDollars() {
    return numberToDollars(this.getMSRP());
  }

  render() {
    const { editMode, columns, selectedProduct, quantity, packagingId, seedSizeId } = this.state;
    const { classes, seedType, packagings, seedSizes, seedCompany, isApiSeedCompany } = this.props;
    let availablePackagings, availableSeedSizes;
    if (seedType !== 'BUSINESS') {
      availablePackagings = packagings.filter((p) => p.seedCompanyId === seedCompany.id && p.seedType === seedType);

      availableSeedSizes = seedSizes.filter((p) => p.seedCompanyId === seedCompany.id && p.seedType === seedType);
    }

    return (
      <div id="ProductSelector">
        <Grid container spacing={8}>
          {columns.map((column, i) => {
            return (
              <Grid item xs key={column.id}>
                <Paper className={classes.list}>
                  <Typography className={classes.listHeader}>{column.name}</Typography>
                  <Divider />

                  {this.previousColumnSelected(i) && (
                    <List dense={true}>
                      {this.availableTypes(column.id, i).map((item) => (
                        <ListItem
                          key={item}
                          onClick={() => this.setItem(column.id, item, i)}
                          className={this.state[column.id] === item ? classes.selected : classes.listItem}
                        >
                          <ListItemText>
                            {item}
                            {!isApiSeedCompany && (
                              <span className={classes.count}>{this.getProductQuantity(item, i)}</span>
                            )}
                          </ListItemText>
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Grid>
            );
          })}

          <Grid item xs>
            <Paper className={classes.list}>
              <Typography className={classes.listHeader}>MSRP</Typography>
              <Divider />
              <List dense={true}>
                <ListItem>
                  {selectedProduct && (
                    <div>
                      <div>MSRP: {this.getMSRPInDollars()}</div>
                      <div>
                        <CustomInput
                          labelText="Quantity"
                          id="quantity"
                          formControlProps={{
                            required: true,
                          }}
                          labelProps={{
                            className: classes.quantityLabel,
                          }}
                          inputProps={{
                            value: quantity,
                            onChange: (e) => {
                              const value = {
                                target: {
                                  value: e.target.value < 0 && e.target.value !== '' ? 0 : e.target.value,
                                },
                              };
                              this.onInputChange('quantity')(value);
                            },
                            className: classes.quantityInput,
                            type: 'number',
                          }}
                        />
                        {selectedProduct.unit || 'bags'}
                      </div>
                    </div>
                  )}
                </ListItem>
              </List>
            </Paper>
          </Grid>

          {this.showSeedSizeAndPackaging && (
            <Grid item xs>
              <Paper className={classes.paddedPaper}>
                <FormControl className={classes.selectWrapper}>
                  <InputLabel htmlFor="packaging">Packaging</InputLabel>
                  <Select
                    value={packagingId}
                    onChange={(e) => this.handleSelectChange(e)}
                    autoWidth
                    inputProps={{
                      className: classes.packagingSelect,
                      required: true,
                      name: 'packagingId',
                      id: 'packaging',
                    }}
                  >
                    <MenuItem value={''}>None</MenuItem>
                    {availablePackagings.map((packaging) => (
                      <MenuItem value={packaging.id} key={packaging.id}>
                        {packaging.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl>
                  <InputLabel htmlFor="seedSize">Seed Size</InputLabel>
                  <Select
                    value={seedSizeId}
                    onChange={(e) => this.handleSelectChange(e)}
                    autoWidth
                    inputProps={{
                      className: classes.packagingSelect,
                      required: true,
                      name: 'seedSizeId',
                      id: 'seedSize',
                    }}
                  >
                    <MenuItem value={''}>None</MenuItem>
                    {availableSeedSizes.map((seedSize) => (
                      <MenuItem value={seedSize.id} key={seedSize.id}>
                        {seedSize.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Paper>
            </Grid>
          )}

          {!editMode && (
            <Grid item xs={1} className={classes.center}>
              <Button
                aria-label="Add Product"
                color="primary"
                onClick={this.addProduct}
                disabled={!selectedProduct || !quantity}
                className={classes.addToOrderBtn}
              >
                Add to order
              </Button>
            </Grid>
          )}
        </Grid>
      </div>
    );
  }
}

ProductSelector.displayName = 'ProductSelector';
ProductSelector.propTypes = {
  selectedProduct: PropTypes.object,
  quantity: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  discounts: PropTypes.object,
  products: PropTypes.array,
  customerOrders: PropTypes.array.isRequired,
  orderFieldName: PropTypes.string,
  selectDiscountProduct: PropTypes.func.isRequired,
  seedType: PropTypes.string,
  addProductToOrder: PropTypes.func.isRequired,
  onEditProductChange: PropTypes.func.isRequired,

  // provided by withStyles HoC
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ProductSelector);
