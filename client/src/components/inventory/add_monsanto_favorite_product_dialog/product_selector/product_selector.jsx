import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { uniq } from 'lodash/array';

// material-ui core components
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { getMonsantoQty, getMonsantoGrowerOrder } from '../../../../utilities/monsanto_product';

const styles = {
  listHeader: {
    padding: 10,
    background: 'gray',
    textAlign: 'center',
    color: 'white',
  },
  selected: {
    padding: '8px 13px',
    background: '#eaeaea',
    cursor: 'pointer',
    '&:hover': {
      background: '#eaeaea',
    },
  },
  listItem: {
    padding: '8px 13px',
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
    justifyContent: 'flex-end',
    padding: '0 25px 20px 0',
  },
  addToOrderBtn: {
    padding: 12,
    marginTop: 44,
  },
  formControlStyle: {
    padding: 0,
  },
};

class ProductSelector extends Component {
  state = {
    allFieldsSelected: false,
    columns: [],
    description: '',
    amountPerBag: null,
  };

  componentWillUnmount() {}

  componentDidMount() {
    const { seedType } = this.props;
    switch (seedType) {
      case 'CORN':
        return this.setCornState();
      case 'SORGHUM':
        return this.setSorghumState();
      case 'SOYBEAN':
        return this.setSoybeanState();
      default:
        throw new Error('Need to pass CORN, SORGHUM, or SOYBEAN to ProductSelector');
    }
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

    columns.push({
      id: 'seedSize',
      name: 'Seed Size',
    });

    columns.push({
      id: 'packaging',
      name: 'Packaging',
    });

    this.setState({ columns });
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

    columns.push({
      id: 'seedSize',
      name: 'Seed Size',
    });

    columns.push({
      id: 'packaging',
      name: 'Packaging',
    });

    this.setState({ columns });
  }
  setSoybeanState() {
    this.setState({
      columns: [
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
      ],
    });
  }

  availableItems() {
    const { products } = this.props;
    let available = products;

    this.state.columns.forEach((column) => {
      let selected = this.state[column.id];

      if (selected && selected !== 'All SeedSizes' && selected !== 'All Packagings')
        available = available.filter((p) => p[column.id] === selected);
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

  seedTypeClassificationMap = { CORN: 'C', SOYBEAN: 'B', SORGHUM: 'S' };

  // setDefaultValuesSelect = () => {
  //   const { products, seedType } = this.props;
  //   if (products.length < 1) return;
  //   const availableBrand = this.availableTypes("brand", 0);
  //   const availableBlend = this.availableTypes("blend", 1);
  //   const availableTreatment = this.availableTypes("treatment", 2);
  // };

  availableTypes(itemType, i) {
    const { products } = this.props;
    const { columns } = this.state;

    let types;
    let available = products;

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
    types.sort((a, b) => a.localeCompare(b));
    if (itemType === 'seedSize' || itemType === 'packaging')
      types.push(`All ${itemType[0].toUpperCase()}${itemType.slice(1)}s`);
    return types;
  }

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
    this.setState(update, this.setSelectProduct);
  }

  setSelectProduct() {
    let allFieldsSelected = true;

    this.state.columns.forEach((column) => {
      let selected = this.state[column.id];
      if (selected === null) {
        allFieldsSelected = false;
        this.props.setAllFieldsSelected(false);
      }
    });

    if (allFieldsSelected) {
      this.props.setAllFieldsSelected(true);
      this.props.setSelectedProducts(this.availableItems());

      // this.onEditProductChange();
    } else {
      this.props.setSelectedProducts(null);
    }
  }

  previousColumnSelected(i) {
    const { columns } = this.state;

    if (columns[i].id === 'blend') return true;
    return i === 0 || this.state[columns[i - 1].id];
  }

  getProductQuantity(item, i) {
    const { products, seedType, seedCompany } = this.props;
    const { columns } = this.state;
    let available = products.filter((p) => p[columns[i].id] === item);

    available = available.filter((p) => p.classification === this.seedTypeClassificationMap[seedType]);
    if (i === 0) {
      const quantity = available.reduce((accumulator, product) => {
        const _quantity = getMonsantoQty(product, seedCompany.Products);
        if (_quantity) {
          return (accumulator ? accumulator : 0) + parseInt(_quantity, 10);
        } else {
          if (accumulator === 0 || !accumulator) return null;
          else return accumulator;
        }
      }, 0);
      const growerOrder = available.reduce((accumulator, product) => {
        return accumulator + getMonsantoGrowerOrder(product, seedCompany.summaryProducts);
      }, 0);

      return (
        <span>
          {quantity ? quantity : '-'} / {quantity ? quantity : 0 - growerOrder}
        </span>
      );
    }

    for (let x = 0; x < i; x++) {
      let selected = this.state[columns[x].id];
      if (selected) available = available.filter((p) => p[columns[x].id] === selected);
    }

    const quantity = available.reduce((accumulator, product) => {
      const _quantity = getMonsantoQty(product, seedCompany.Products);
      if (_quantity) {
        return (accumulator ? accumulator : 0) + parseInt(_quantity, 10);
      } else {
        if (accumulator === 0 || !accumulator) return null;
        else return accumulator;
      }
    }, 0);
    const growerOrder = available.reduce((accumulator, product) => {
      return accumulator + getMonsantoGrowerOrder(product, seedCompany.summaryProducts);
    }, 0);

    return (
      <span>
        {quantity ? quantity : '-'} / {quantity ? quantity : 0 - growerOrder}
      </span>
    );
  }

  render() {
    const { columns } = this.state;
    const { classes } = this.props;
    return (
      <div>
        <div style={{ display: 'flex', borderBottom: '1px solid #CCCCCC' }}>
          {columns.map((column, i) => {
            return (
              <Grid item xs={i < 2 ? 3 : 2} key={column.id} className={classes.gridHeaderBorderStyle}>
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
                          <span className={classes.count}>{this.getProductQuantity(item, i)}</span>
                        </ListItemText>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Grid>
            );
          })}
        </div>
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

  // provided by withStyles HoC
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ProductSelector);
