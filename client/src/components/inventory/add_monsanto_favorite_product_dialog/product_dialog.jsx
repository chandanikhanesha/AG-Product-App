import React, { Component } from 'react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { withStyles } from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Grow from '@material-ui/core/Grow';
import IconButton from '@material-ui/core/IconButton';
import Table from '../../../components/material-dashboard/Table/Table';
import Divider from '@material-ui/core/Divider';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';

import deleteImg from '../../../assets/img/delete-outline.png';

// utilities
import { discountMatchesProductType, numberToDollars } from '../../../utilities';

import ProductSelector from './product_selector';

import { productDialogStyles } from './product_dialog.styles';

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

const FADE_DURATION = 500;

class ProductDialog extends Component {
  state = {
    company: '',
    seedType: '',
    productToCheckAgainstDiscounts: null,
    productsToOrder: [],
    discounts: [],
    packagingId: '',
    seedSizeId: '',
    orderFieldName: '',
    tableHeaders: [],
    tableData: [],
    selectedProducts: null,
    allFieldsSelected: false,
  };

  classificationSeedTypeMap = {
    B: 'SOYBEAN',
    C: 'CORN',
    S: 'SORGHUM',
    // A: 'ALFALFA',
    L: 'CANOLA',
    P: 'PACKAGING',
  };

  componentWillMount() {
    this.setState({
      editMode: false,
      company: '',
      seedType: '',
      productToCheckAgainstDiscounts: null,
      productsToOrder: [],
      discounts: [],
      packagingId: '',
      seedSizeId: '',
      companyTypeSelected: 'apiSeedCompany',
      orderDate: new Date(),
      tableHeaders: [],
      tableData: [],
      deleteProductConfirm: null,
      allFieldsSelected: false,
    });
  }

  close = () => {
    this.props.onClose();
  };

  setAllFieldsSelected = (value) => {
    this.setState({ allFieldsSelected: value });
  };

  setSelectedProducts = (selectedProducts) => {
    this.setState({ selectedProducts });
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
          const isSeedCompany = $target.classList.contains('seedCompany');
          const isApiSeedCompany = $target.classList.contains('apiSeedCompany');
          let companyTypeSelected;
          if (isSeedCompany) {
            companyTypeSelected = 'seedCompany';
          } else if (isApiSeedCompany) {
            companyTypeSelected = 'apiSeedCompany';
          } else {
            companyTypeSelected = 'company';
          }
          newState.companyTypeSelected = companyTypeSelected;
        }
        this.setState({ ...newState });
      },
    );
  };

  handleFieldChange = (id) => (event) => {
    const { productsToOrder } = this.state;
    const updatedProductsToOrder = productsToOrder.map((product) => {
      if (product.id === id) {
        product.fieldName = event.target.value;
        return product;
      } else {
        return product;
      }
    });
    this.setState((_) => ({
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

  addProductToOrder = async () => {
    const { productsToOrder, selectedProducts } = this.state;
    const productsToAdd = await Promise.all(
      selectedProducts.map((product) => {
        return { ...product, isMonsantoProduct: true };
      }),
    );

    this.setState(
      {
        productsToOrder: productsToOrder.concat(productsToAdd),
      },
      () => {
        this.getTableData();
      },
    );
  };

  removeProductFromOrder = (productOrder) => {
    const { classes } = this.props;
    const { productsToOrder } = this.state;
    let orders = productsToOrder;
    const index = orders.indexOf(productOrder);
    orders.splice(index, 1);

    productOrder &&
      this.setState({
        deleteProductConfirm: (
          <SweetAlert
            warning
            showCancel
            title={`Delete Product`}
            onConfirm={async () => {
              this.setState(
                {
                  productsToOrder: orders,
                  deleteProductConfirm: null,
                },
                () => {
                  this.getTableData();
                },
              );
            }}
            onCancel={() => {
              this.setState({
                deleteProductConfirm: null,
              });
            }}
            confirmBtnCssClass={classes.button + ' ' + classes.success}
            cancelBtnCssClass={classes.button + ' ' + classes.danger}
          >
            Are you sure you want to delete this product? This will also remove the product from any purchase orders or
            quotes it has been added to.
          </SweetAlert>
        ),
      });
  };

  submitProduct = async () => {
    const { seedCompany, createMonsantoFavoriteProducts } = this.props;
    const { productsToOrder } = this.state;
    await createMonsantoFavoriteProducts(
      seedCompany.id,
      productsToOrder.map((product) => {
        return { id: product.id };
      }),
    );
    this.setState({
      editMode: false,
      company: '',
      seedType: '',
      productToCheckAgainstDiscounts: null,
      productsToOrder: [],
      discounts: [],
      packagingId: '',
      seedSizeId: '',
      companyTypeSelected: 'company',
      orderDate: new Date(),
      orderFieldName: '',
      tableHeaders: [],
      tableData: [],
      deleteProductConfirm: null,
    });
    this.props.reload();
  };

  onDiscountsUpdate = (discounts) => {
    this.setState(
      {
        discounts,
      },
      () => this.getTableData(),
    );
  };

  removeDiscount = () => {
    let discounts = null;
    this.onDiscountsUpdate(discounts);
  };

  applyDiscountPackage = (discountPackage) => (_) => {
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

    let discountsApply = [...discounts, ...discountsToAppend];
    this.onDiscountsUpdate(discountsApply);
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
    const { productsToOrder } = this.state;
    let tableHeaders = ['Product'];
    tableHeaders = tableHeaders.concat(['Packaging', 'Seed Size']);
    tableHeaders = tableHeaders.concat(['MSRP']);

    let tableData = productsToOrder.map((productOrder, idx) => {
      let row = [this.addedProductLabel(productOrder)];

      row = row.concat([
        productOrder.packaging,
        productOrder.seedSize,
        numberToDollars(productOrder.LineItem.suggestedDealerPrice),
      ]);
      row = row.concat([
        <IconButton aria-label="Remove" onClick={() => this.removeProductFromOrder(productOrder)}>
          {/* <RemoveCircle /> */}
          <img src={deleteImg} alt="delete" width="24px"></img>
        </IconButton>,
      ]);
      return row;
    });
    this.setState({ tableHeaders, tableData });
  }

  get showSeedSizeAndPackaging() {
    // const { purchaseOrder } = this.props;
    const { companyTypeSelected } = this.state;
    return !(companyTypeSelected === 'apiSeedCompany') && !(companyTypeSelected === 'company');
  }

  render() {
    const {
      editMode,
      productsToOrder,
      quantity,
      tableHeaders,
      tableData,
      deleteProductConfirm,
      allFieldsSelected,
      selectedProducts,
    } = this.state;
    const { classes, products, seedCompany, seedType } = this.props;
    return (
      <Dialog
        open={true}
        TransitionComponent={Transition}
        maxWidth="xl"
        PaperProps={{ classes: { root: classes.dialog } }}
      >
        <div className={classes.dialogHeader}>
          <h1>{'Add Favorite Products'}</h1>
          <div className={classes.dialogHeaderActions}>
            <Button
              className={classes.button + ' ' + classes.white + ' ' + classes.primary}
              style={{ width: '114px', height: '44px' }}
              onClick={this.close}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              className={classes.CTABar}
              disabled={!editMode && productsToOrder.length === 0}
              onClick={this.submitProduct}
            >
              Submit
            </Button>
          </div>
        </div>
        <div className={classes.dialogBody}>
          <Card className={classes.secondCard}>
            <Grid container>
              <Grid container>
                <Grid item xs={3} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                  Traits
                </Grid>
                <Grid item xs={3} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                  Variety
                </Grid>
                <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                  Treatment
                </Grid>
                <Grid item xs={2} className={classes.gridHeader}>
                  Seed Size
                </Grid>
                <Grid item xs={2} className={classes.gridHeader}>
                  packaging
                </Grid>
              </Grid>
            </Grid>
            <Grid container style={{ height: '500px', overflowY: 'scroll' }}>
              <Grid item xs={12}>
                <Grow in={seedCompany !== undefined && seedType !== ''} timeout={FADE_DURATION}>
                  <div>
                    {seedCompany !== undefined && seedType !== '' && (
                      <ProductSelector
                        classes={classes}
                        seedType={seedType}
                        products={products}
                        addProductToOrder={this.addProductToOrder}
                        onEditProductChange={this.onEditProductChange}
                        quantity={quantity}
                        seedCompany={seedCompany}
                        setAllFieldsSelected={this.setAllFieldsSelected}
                        setSelectedProducts={this.setSelectedProducts}
                        selectedProducts={selectedProducts}
                      />
                    )}
                  </div>
                </Grow>
              </Grid>
            </Grid>
          </Card>
          <Grid container className={classes.center}>
            <Button
              aria-label="Add Product"
              onClick={this.addProductToOrder}
              disabled={!allFieldsSelected}
              className={classes.button + ' ' + classes.white + ' ' + classes.primary}
            >
              Add to Favorite Product
            </Button>
          </Grid>
          <Card className={classes.thirdCard}>
            <div className={classes.thirdCardBody}>
              <Table tableHead={tableHeaders} tableData={tableData} />
            </div>
          </Card>
        </div>
        {deleteProductConfirm}
      </Dialog>
    );
  }
}

export default withStyles(productDialogStyles)(ProductDialog);
