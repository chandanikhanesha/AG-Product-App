import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import moment from 'moment';

// icons
import RemoveCircle from '@material-ui/icons/RemoveCircle';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import PlaylistAdd from '@material-ui/icons/PlaylistAdd';

// core components
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import Grow from '@material-ui/core/Grow';
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import IconButton from '@material-ui/core/IconButton';
import Table from '../../components/material-dashboard/Table/Table';

// utilities
import { discountMatchesProductType, customerProductDiscountsTotals, numberToDollars } from '../../utilities';

import ProductSelector from '../../components/product-selector';
import DiscountSelector from './discount_selector';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

const getCompanyId = (identifier) => {
  let split = identifier.split('-');
  return parseInt(split[split.length - 1], 10);
};

const FADE_DURATION = 500;

const styles = {
  wrapper: {
    padding: 50,
  },
  select: {
    width: 200,
  },
  selectWrapper: {
    marginRight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  CTABar: {
    marginRight: 20,
  },
  secondaryCta: {
    backgroundColor: '#999',
  },
};

class PurchaseOrderDialog extends Component {
  state = {
    editMode: false,
    company: '',
    seedType: '',
    productToCheckAgainstDiscounts: null,
    productsToOrder: [],
    discounts: [],
    packagingId: '',
    seedSizeId: '',
    businessProductSelected: null,
    orderDate: new Date(),
    orderFieldName: '',
    tableHeaders: [],
    tableData: [],
  };

  componentDidMount() {
    const { editingProduct, business, products } = this.props;
    if (!editingProduct) {
      return;
    }

    let selectedProduct, company, businessProductSelected;

    if (editingProduct.hasOwnProperty('customProductId')) {
      selectedProduct = business.find((product) => product.id === editingProduct.customProductId);
      company = `company-${selectedProduct.companyId}`;
      businessProductSelected = true;
    } else {
      selectedProduct = products.find((product) => product.id === editingProduct.productId);
      company = `seedCompany-${selectedProduct.seedCompanyId}`;
      businessProductSelected = false;
    }

    setTimeout(() => {
      this.setState(
        {
          selectedProduct,
          editMode: true,
          company,
          businessProductSelected,
          description: selectedProduct.description,
          seedType: selectedProduct.seedType || 'BUSINESS',
          quantity: editingProduct.orderQty || 0,
          discounts: editingProduct.discounts || [],
          packagingId: editingProduct.packagingId,
          seedSizeId: editingProduct.seedSizeId,
          orderFieldName: editingProduct.fieldName,
          orderDate: editingProduct.orderDate,
        },
        () => {
          this.selectDiscountProduct(selectedProduct);
        },
      );
    }, 100);
  }

  close = () => {
    this.props.onClose();
  };

  getDefaultDiscounts() {
    const { dealerDiscounts } = this.props;
    return dealerDiscounts.filter((dd) => dd.useByDefault === true).map((dd, i) => ({ order: i, DiscountId: dd.id }));
  }

  initDialog = () => {
    const { editingProduct } = this.props;
    this.setState(
      {
        company: '',
        seedType: '',
        productToCheckAgainstDiscounts: null,
        productsToOrder: [],
        discounts: editingProduct ? [] : this.getDefaultDiscounts(),
        packagingId: '',
        seedSizeId: '',
      },
      () => {
        this.getTableData();
      },
    );
  };

  handleSelectChange = (event) => {
    let $target = event.currentTarget;

    this.setState(
      {
        productToCheckAgainstDiscounts: null,
        [event.target.name]: '',
      },
      () => {
        let newState = { [event.target.name]: event.target.value };
        if (event.target.name === 'company') {
          newState.businessProductSelected = !$target.classList.contains('seedCompany');
        }
        this.setState({ ...newState });
      },
    );
  };

  handleDateChange = (date) => {
    this.setState(
      {
        orderDate: moment.utc(date._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
      },
      () => this.getTableData(),
    );
  };

  handleOnChange = (event) => {
    const newFieldName = event.target.value;

    this.setState({ orderFieldName: newFieldName }, () => {
      this.getTableData();
    });
  };

  handleFieldChange = (id, idx) => (event) => {
    const { productsToOrder } = this.state;
    const updatedProductsToOrder = productsToOrder.map((product, _idx) => {
      if (product.id === id && _idx === idx) {
        product.fieldName = event.target.value;
        return product;
      } else {
        return product;
      }
    });
    this.setState((state) => ({
      productsToOrder: [...updatedProductsToOrder],
    }));
    this.getTableData();
  };

  selectDiscountProduct = (product) => {
    this.setState({
      productToCheckAgainstDiscounts: product,
    });
  };

  onEditProductChange = (productOrder) => {
    if (this.state.editMode) {
      this.setState(
        {
          productsToOrder: [productOrder],
        },
        () => {
          this.getTableData();
        },
      );
    }
  };

  addProductToOrder = (productOrder) => {
    const { productsToOrder, orderFieldName } = this.state;
    if (this.props.type === 'farm') {
      productOrder.fieldName = orderFieldName;
    }
    this.setState(
      {
        productsToOrder: [...productsToOrder, productOrder],
      },
      () => {
        this.setState({ orderFieldName: '' });
        this.getTableData();
      },
    );
  };

  removeProductFromOrder = (productOrder) => {
    const { productsToOrder } = this.state;
    let orders = productsToOrder;
    const index = orders.indexOf(productOrder);
    orders.splice(index, 1);
    this.setState(
      {
        productsToOrder: orders,
      },
      () => {
        this.getTableData();
      },
    );
  };

  submitProduct = () => {
    const { editMode, productsToOrder, discounts, description, orderDate } = this.state;
    if (editMode) {
      const selectedProduct = { ...productsToOrder[0] };
      let data = {
        description,
        discounts,
        ...selectedProduct,
        packagingId: selectedProduct.packagingId,
        seedSizeId: selectedProduct.seedSizeId,
        orderDate,
      };
      this.props.onEditProduct(this.props.editingProduct.id, selectedProduct.id, data);
    } else {
      this.props.onAddProducts({ productsToOrder, discounts, orderDate });
    }
  };

  onDiscountsUpdate = (discounts) => {
    this.setState(
      {
        discounts,
      },
      () => this.getTableData(),
    );
  };

  applyDiscountPackage = (discountPackage) => (event) => {
    const { dealerDiscounts } = this.props;
    const { productToCheckAgainstDiscounts, discounts } = this.state;
    const existingDiscountIds = discounts.map((d) => d.DiscountId);
    const discountsToAppend = discountPackage.dealerDiscountIds
      .filter((discountId) => !existingDiscountIds.includes(discountId))
      .filter((discountId) =>
        discountMatchesProductType(
          dealerDiscounts.find((d) => d.id === discountId),
          productToCheckAgainstDiscounts,
        ),
      )
      .map((discountId, index) => ({
        DiscountId: discountId,
        order: discounts.length + index,
      }));

    this.setState({
      discounts: [...discounts, ...discountsToAppend],
    });
  };

  addedProductLabel(product) {
    return (
      <span>
        {product.name && (
          <span>
            {product.name && `${product.name} `}
            {product.description && `${product.description} `}
            {product.unit && `${product.unit} `}
            {product.costUnit && `${product.costUnit} `}
          </span>
        )}

        {!product.name && (
          <span>
            {product.brand && `${product.brand} `}
            {product.blend && `${product.blend} `}
            {product.size && `${product.size} `}
            {product.treatment && `${product.treatment} `}
            {product.amountPerBag && `${product.amountPerBag} `}
          </span>
        )}
      </span>
    );
  }

  getTableData() {
    const { productsToOrder, discounts, editMode, orderDate } = this.state;
    const { dealerDiscounts, packagings, seedSizes, type, classes, editingProduct, purchaseOrder } = this.props;
    const discountsToCalc = discounts
      .map((discount) => {
        return dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
      })
      .filter((el) => el);
    let tableHeaders = ['Product', 'Quantity', 'MSRP', 'Before Discount'];
    tableHeaders = tableHeaders.concat(discountsToCalc.map((d) => d.name));
    tableHeaders = tableHeaders.concat(['Total Discount', 'Total After Discount']);
    if (purchaseOrder.isSimple) {
      tableHeaders = tableHeaders.concat(['Packaging', 'Seed Size']);
    }
    if (!editMode) tableHeaders = tableHeaders.concat(['']);
    if (type === 'farm') tableHeaders.unshift('Field');
    let tableData = productsToOrder.map((productOrder, idx) => {
      let customerProduct = { orderQty: parseInt(productOrder.orderQty, 0) || 0, orderDate };
      if (editMode) customerProduct = editingProduct;
      let data = customerProductDiscountsTotals(customerProduct, discountsToCalc, productOrder);
      let packaging = packagings.find((p) => p.id === productOrder.packagingId);
      let seedSize = seedSizes.find((ss) => ss.id === productOrder.seedSizeId);

      let row = [
        this.addedProductLabel(productOrder),
        productOrder.orderQty,
        numberToDollars(productOrder.msrp || productOrder.costUnit),
        numberToDollars(data.originalPrice),
      ];

      row = row.concat(
        discountsToCalc.map((discount) => {
          if (data.discounts[discount.id]) {
            return numberToDollars(data.discounts[discount.id].amount);
          } else {
            return numberToDollars(0);
          }
        }),
      );

      row = row.concat([numberToDollars(data.discountAmount), numberToDollars(data.total)]);

      if (purchaseOrder.isSimple) {
        row = row.concat([packaging ? packaging.name : '', seedSize ? seedSize.name : '']);
      }

      if (!editMode)
        row = row.concat([
          <IconButton aria-label="Remove" onClick={() => this.removeProductFromOrder(productOrder)}>
            <RemoveCircle />
          </IconButton>,
        ]);

      if (type === 'farm') {
        row.unshift(
          <FormControl className={classes.selectWrapper}>
            <CustomInput
              labelText={'Field Name'}
              id={`field-name_${idx}`}
              inputProps={{
                value: productOrder.fieldName,
                onChange: this.handleFieldChange(productOrder.id, idx),
              }}
            />
          </FormControl>,
        );
      }
      return row;
    });
    this.setState({ tableHeaders, tableData });
  }

  render() {
    const {
      editMode,
      company,
      seedType,
      orderFieldName,
      discounts,
      productsToOrder,
      selectedProduct,
      quantity,
      packagingId,
      seedSizeId,
      businessProductSelected,
      productToCheckAgainstDiscounts,
      orderDate,
      tableHeaders,
      tableData,
    } = this.state;
    const {
      classes,
      companies,
      seedCompanies,
      products,
      business,
      dealerDiscounts,
      customerOrders,
      packagings,
      seedSizes,
      type,
      discountPackages,
      purchaseOrder,
    } = this.props;

    let seedCompany;
    if (businessProductSelected === false) {
      seedCompany = seedCompanies.find((sc) => sc.id === getCompanyId(company));
    }

    return (
      <Dialog fullScreen open={true} onEnter={this.initDialog} TransitionComponent={Transition}>
        <div className={classes.wrapper}>
          {type === 'farm' && (
            <FormControl className={classes.selectWrapper}>
              <CustomInput
                labelText={'Field Name'}
                id={`field-name`}
                inputProps={{
                  value: orderFieldName,
                  onChange: this.handleOnChange,
                }}
              />
            </FormControl>
          )}

          <FormControl className={classes.selectWrapper}>
            <InputLabel htmlFor="company">Company</InputLabel>
            <Select
              value={company}
              onChange={this.handleSelectChange}
              autoWidth
              inputProps={{
                className: classes.select,
                required: true,
                name: 'company',
                id: 'company',
              }}
            >
              {seedCompanies.map((seedCompany) => (
                <MenuItem
                  className="seedCompany"
                  value={`seedCompany-${seedCompany.id}`}
                  key={`seedCompany-${seedCompany.id}`}
                >
                  {seedCompany.name}
                </MenuItem>
              ))}
              {companies.map((company) => (
                <MenuItem className="company" value={`company-${company.id}`} key={`company-${company.id}`}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {businessProductSelected === false && seedCompany !== undefined && (
            <FormControl className={classes.selectWrapper}>
              <InputLabel htmlFor="seed-type">Seed Type</InputLabel>
              <Select
                value={seedType}
                onChange={this.handleSelectChange}
                autoWidth
                inputProps={{
                  className: classes.select,
                  required: true,
                  name: 'seedType',
                  id: 'seed-type',
                }}
              >
                {['Corn', 'Sorghum', 'Soybean']
                  .filter((seedType) => seedCompany[`${seedType.toLowerCase()}BrandName`].trim() !== '')
                  .map((seedType) => (
                    <MenuItem key={seedType} value={seedType.toUpperCase()}>
                      {seedCompany[`${seedType.toLowerCase()}BrandName`]}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          )}

          <br />
          <br />

          <Grow in={businessProductSelected === true} timeout={FADE_DURATION}>
            <div>
              {businessProductSelected === true && (
                <div>
                  <ProductSelector
                    purchaseOrder={purchaseOrder}
                    customerOrders={customerOrders}
                    seedType={'BUSINESS'}
                    products={business.filter((p) => p.companyId === getCompanyId(company))}
                    selectDiscountProduct={this.selectDiscountProduct}
                    addProductToOrder={this.addProductToOrder}
                    onEditProductChange={this.onEditProductChange}
                    selectedProduct={selectedProduct}
                    quantity={quantity}
                    seedCompany={seedCompany}
                  />
                </div>
              )}
            </div>
          </Grow>

          <Grow
            in={businessProductSelected === false && seedType !== '' && seedCompany !== undefined}
            timeout={FADE_DURATION}
          >
            <div>
              {businessProductSelected === false && seedType !== '' && seedCompany !== undefined && (
                <ProductSelector
                  purchaseOrder={purchaseOrder}
                  customerOrders={customerOrders}
                  seedType={seedType}
                  packagingId={packagingId}
                  seedSizeId={seedSizeId}
                  products={products.filter((p) => p.seedCompanyId === getCompanyId(company))}
                  selectDiscountProduct={this.selectDiscountProduct}
                  addProductToOrder={this.addProductToOrder}
                  onEditProductChange={this.onEditProductChange}
                  selectedProduct={selectedProduct}
                  quantity={quantity}
                  company={getCompanyId(company)}
                  packagings={packagings}
                  seedSizes={seedSizes}
                  seedCompany={seedCompany}
                />
              )}
            </div>
          </Grow>

          <br />
          <br />

          <div>
            {!editMode && <h4>Products to add to order</h4>}

            <Table tableHead={tableHeaders} tableData={tableData} />
          </div>

          <br />
          <br />

          <div>
            <React.Fragment>
              <h4>Order Date:</h4>
              <DatePicker
                leftArrowIcon={<NavigateBefore />}
                rightArrowIcon={<NavigateNext />}
                format="MMMM Do YYYY"
                disablePast={false}
                value={moment.utc(orderDate)}
                emptyLabel="Order Date"
                onChange={this.handleDateChange}
              />

              <GridContainer>
                <GridItem xs={4}>
                  <DiscountSelector
                    productsToOrder={productsToOrder}
                    discounts={discounts}
                    companies={companies}
                    dealerDiscounts={dealerDiscounts.filter((d) => !d.applyToWholeOrder)}
                    onUpdate={this.onDiscountsUpdate}
                  />
                </GridItem>

                <GridItem xs={4}>
                  <h4>Discount Packages</h4>

                  <Divider />

                  <List dense={true}>
                    {discountPackages.map((discountPackage) => {
                      return (
                        <ListItem key={discountPackage.id}>
                          <ListItemText>{discountPackage.name}</ListItemText>
                          {productToCheckAgainstDiscounts && (
                            <ListItemSecondaryAction>
                              <IconButton aria-label="Delete" onClick={this.applyDiscountPackage(discountPackage)}>
                                <Tooltip title="Apply discounts">
                                  <PlaylistAdd />
                                </Tooltip>
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      );
                    })}
                  </List>
                </GridItem>
              </GridContainer>
            </React.Fragment>
          </div>

          <Button
            color="primary"
            className={classes.CTABar}
            disabled={!editMode && productsToOrder.length === 0}
            onClick={this.submitProduct}
          >
            Submit
          </Button>
          <Button className={classes.secondaryCta} onClick={this.close}>
            Cancel
          </Button>
        </div>
      </Dialog>
    );
  }
}

PurchaseOrderDialog.displayName = 'PurchaseOrderDialog';
PurchaseOrderDialog.propTypes = {
  companies: PropTypes.array.isRequired,
  seedCompanies: PropTypes.array.isRequired,
  customerOrders: PropTypes.array.isRequired,
  dealerDiscounts: PropTypes.array.isRequired,
  discountPackages: PropTypes.array.isRequired,
  editingProduct: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  products: PropTypes.array.isRequired,
  business: PropTypes.array.isRequired,
  quantity: PropTypes.number,
  discounts: PropTypes.array,
  onAddProducts: PropTypes.func.isRequired,
  onEditProduct: PropTypes.func.isRequired,
  type: PropTypes.string,
  fieldNames: PropTypes.array,
  purchaseOrder: PropTypes.object.isRequired,
  // provided by withStyles HoC
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PurchaseOrderDialog);
