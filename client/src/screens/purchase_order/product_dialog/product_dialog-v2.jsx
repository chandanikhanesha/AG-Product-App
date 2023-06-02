import React, { Component } from 'react';
import SweetAlert from 'react-bootstrap-sweetalert';
import { withStyles, Checkbox, FormControlLabel } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import { cloneDeep } from 'lodash/lang';
import CircularProgress from '@material-ui/core/CircularProgress';
import moment from 'moment';
import axios from 'axios';

// icons
// import RemoveCircle from "@material-ui/icons/RemoveCircle";
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
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Grow from '@material-ui/core/Grow';
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';
import IconButton from '@material-ui/core/IconButton';
import Table from '../../../components/material-dashboard/Table/Table';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Tooltip from '@material-ui/core/Tooltip';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import CardContent from '@material-ui/core/CardContent';

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';

// Demo styles, see 'Styles' section below for some notes on use.
import 'react-accessible-accordion/dist/fancy-example.css';

import deleteImg from '../../../assets/img/delete-outline.png';

// utilities
import { discountMatchesProductType, customerProductDiscountsTotals, numberToDollars } from '../../../utilities';

import ProductSelector from '../product_selector';
import DiscountSelector from '../discount_selector';

import { productDialogStyles } from './product_dialog.styles-v2';
import { DialogContent } from '@material-ui/core';

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

const getCompanyId = (identifier) => {
  let split = identifier.split('-');
  return parseInt(split[split.length - 1], 10);
};

const mapObj = {
  C: 'CORN',
  B: 'SOYBEAN',
  S: 'SORGHUM',
  // A: 'ALFALFA',
  L: 'CANOLA',
  P: 'PACKAGING',
};

const FADE_DURATION = 500;
let isDisabledCheckBtn = true;
class ProductDialog extends Component {
  state = {
    editMode: false,
    company: '',
    seedType: '',
    productToCheckAgainstDiscounts: null,
    productsToOrder: [],
    discounts: [],
    packagingId: '',
    seedSizeId: '',
    comment: '',
    fieldName: '',
    companyTypeSelected: 'company',
    orderDate: new Date(),

    tableHeaders: [],
    tableData: [],
    deleteProductConfirm: null,
    showAllMonsantoProducts: false,
    showFavoriteProducts: false,
    currentzone: '',
    currentquantity: '',
    canSubmit: true,
    currentquantityChanged: false,
    openDialogOnSubmit: false,
    fromCustomerDetails: {},
    toCustomerDetails: {},
    toCustomerBaseQuantity: 0,
    productForCheckAvailability: [],
    productAvailability: [],
    isLoadingAvailability: false,
    packagingData: [],
  };

  componentDidMount = async () => {
    const { editingProduct } = this.props;

    const { editMode } = this.state;
    const { fromCustomerDetails } = this.state;
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/monsanto/products/packaging_products`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        const data = response.data.items;
        this.setState({ packagingData: data });
      })
      .catch((err) => {
        console.log(err);
      });
    if (editMode && Object.keys(fromCustomerDetails).length == 0) {
      if (editingProduct.hasOwnProperty('monsantoProductId')) {
        const preparedFromCustomerDetail = {
          purchaseOrderId: editingProduct.purchaseOrderId,
          productname: editingProduct.MonsantoProduct.productDetail,
        };
        const preparedToCustomerDetail = {
          productname: editingProduct.MonsantoProduct.productDetail,
        };
        this.setState({
          fromCustomerDetails: preparedFromCustomerDetail,
          toCustomerDetails: preparedToCustomerDetail,
        });
      } else {
        if (editingProduct.CustomProduct) {
          const preparedFromCustomerDetail = {
            purchaseOrderId: editingProduct.purchaseOrderId,
            productname: editingProduct.CustomProduct.productDetail,
          };
          const preparedToCustomerDetail = {
            productname: editingProduct.CustomProduct.productDetail,
          };
          this.setState({
            fromCustomerDetails: preparedFromCustomerDetail,
            toCustomerDetails: preparedToCustomerDetail,
          });
        } else {
          const preparedFromCustomerDetail = {
            purchaseOrderId: editingProduct.purchaseOrderId,
            productname: editingProduct.Product.productDetail,
          };
          const preparedToCustomerDetail = {
            productname: editingProduct.Product.productDetail,
          };
          this.setState({
            fromCustomerDetails: preparedFromCustomerDetail,
            toCustomerDetails: preparedToCustomerDetail,
          });
        }
      }
    }

    if (editingProduct && editMode) {
      this.setState({
        currentquantity: editingProduct.orderQty,
      });
    }
  };

  componentWillMount() {
    const { editingProduct, fieldName, isAddingTreatment, addingRelatedCustomProductProduct, companies } = this.props;
    this.setState({ fieldName: fieldName });
    if (isAddingTreatment) {
      const { relatedCustomProducts = [] } = addingRelatedCustomProductProduct;
      const productsToOrder = relatedCustomProducts
        ? relatedCustomProducts.map((relatedCustomProduct) => {
            const company = companies.find((_company) => _company.id === relatedCustomProduct.companyId);
            const product = company.CustomProducts.find((_product) => _product.id === relatedCustomProduct.productId);
            return { ...product, orderQty: relatedCustomProduct.orderQty };
          })
        : [];
      this.setState({ productsToOrder }, () => {
        this.getTableData();
      });
      return;
    }
    if (!editingProduct) {
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
        tableHeaders: [],
        tableData: [],
        deleteProductConfirm: null,
      });
      return;
    }
    let selectedProduct, company, companyTypeSelected, seedType, packagingId, seedSizeId, comment;
    if (editingProduct.hasOwnProperty('customProductId')) {
      selectedProduct = editingProduct.CustomProduct;
      company = `company-${selectedProduct.companyId}`;
      companyTypeSelected = 'company';
      seedType = 'BUSINESS';
      packagingId = editingProduct.packagingId;
      seedSizeId = editingProduct.seedSizeId;
      comment = editingProduct.comment;
      // fieldName = editingProduct.fieldName;
    }
    if (editingProduct.hasOwnProperty('productId')) {
      selectedProduct = editingProduct.Product;
      company = `seedCompany-${selectedProduct.seedCompanyId}`;
      companyTypeSelected = 'seedCompany';
      seedType = selectedProduct.seedType;
      comment = editingProduct.comment;
      // fieldName = editingProduct.fieldName;

      if (
        editingProduct.Product.ProductPackaging &&
        editingProduct.Product.ProductPackaging.packagingGroups.length > 0
      ) {
        const packagingGroup = editingProduct.Product.ProductPackaging.packagingGroups.find(
          (_packagingGroup) => _packagingGroup.CustomerProductId === editingProduct.id,
        );
        if (packagingGroup) {
          packagingId = packagingGroup.packagingId;
          seedSizeId = packagingGroup.seedSizeId;
        }
      }
    }
    if (editingProduct.hasOwnProperty('monsantoProductId')) {
      selectedProduct = editingProduct.MonsantoProduct;
      company = `apiSeedCompany-${selectedProduct.seedCompanyId}`;
      companyTypeSelected = 'apiSeedCompany';
      seedType = mapObj[selectedProduct.classification];
      packagingId = editingProduct.packagingId;
      seedSizeId = editingProduct.seedSizeId;
      comment = editingProduct.comment;
      // fieldName = editingProduct.fieldName;
    }

    this.setState(
      {
        selectedProduct,
        editMode: true,
        company,
        description: selectedProduct.description,
        seedType: seedType,
        quantity: editingProduct.isPickLater == true ? editingProduct.pickLaterQty : editingProduct.orderQty || 0,
        discounts: editingProduct.discounts || [],
        packagingId,
        seedSizeId,
        fieldName: editingProduct.fieldName,
        orderDate: editingProduct.orderDate,
        companyTypeSelected,
        comment,
      },
      () => {
        this.selectDiscountProduct(selectedProduct);
      },
    );
  }

  changezone = (zone) => {
    this.setState({ currentzone: zone }, this.getTableData);
  };

  changequantity = (value) => {
    const { editingProduct, editMode, purchaseOrder } = this.props;
    const { toCustomerBaseQuantity, productsToOrder } = this.state;

    const selectedProduct = productsToOrder[0];

    this.setState({ currentquantity: value, currentquantityChanged: true }, () => {
      if (editingProduct.hasOwnProperty('monsantoProductId')) {
        let toCustomerfinalquantity = 0;
        if (value < editingProduct.orderQty) {
          toCustomerfinalquantity =
            toCustomerBaseQuantity + parseFloat(editingProduct.orderQty) - parseFloat(this.state.currentquantity);
        } else {
          toCustomerfinalquantity = editingProduct.orderQty;
        }

        this.setState({
          fromCustomerDetails: {
            ...this.state.fromCustomerDetails,
            finalquantity:
              editingProduct.monsantoProductId !== selectedProduct.id ? 0 : this.state.currentquantity || value,
            name: purchaseOrder.Customer.name,
          },
          toCustomerDetails: {
            ...this.state.toCustomerDetails,
            finalquantity:
              editingProduct.monsantoProductId !== selectedProduct.id
                ? parseFloat(toCustomerBaseQuantity) + parseFloat(editingProduct.orderQty)
                : (toCustomerfinalquantity && toCustomerfinalquantity) || 0,
          },
        });
      }
    });
  };

  close = () => {
    this.props.onClose();
  };

  getDefaultDiscounts() {
    const { dealerDiscounts } = this.props;
    return dealerDiscounts.filter((dd) => dd.useByDefault === true).map((dd, i) => ({ order: i, DiscountId: dd.id }));
  }

  handleShowFavoriteProducts = (event) => {
    this.setState({ showFavoriteProducts: event.target.checked });
  };

  handleShowAllMonsantoProducts = (event) => {
    this.setState({ showAllMonsantoProducts: event.target.checked });
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
    isDisabledCheckBtn = true;
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

    this.setState({ fieldName: newFieldName }, () => {
      this.getTableData();
    });
  };

  handleFieldChange = (id) => async (event) => {
    const { productsToOrder } = this.state;
    const updatedProductsToOrder = await productsToOrder.map((product) => {
      if (product.id === id) {
        product.fieldName = event.target.value;
        return product;
      } else {
        return product;
      }
    });
    await this.setState((_) => ({
      productsToOrder: [...updatedProductsToOrder],
    }));
    await this.getTableData();
  };

  selectDiscountProduct = (product) => {
    this.setState({
      productToCheckAgainstDiscounts: product,
    });
  };

  onEditProductChange = (productOrder) => {
    if (this.state.editMode && productOrder.orderQty !== 0) {
      this.setState(
        {
          productsToOrder: [productOrder],
          comment: productOrder.comment,
          fieldName: productOrder.fieldName,
        },
        () => {
          this.getTableData();
        },
      );
    }
  };

  addProductToOrder = (productOrder) => {
    const { productsToOrder } = this.state;

    this.setState(
      {
        productsToOrder: [...productsToOrder, productOrder],
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
    const { isAddingTreatment, addRelatedCustomProducts, wantToTransferAll, editingProduct } = this.props;
    const {
      editMode,
      productsToOrder,
      discounts,
      description,
      orderDate,
      comment,
      fieldName,
      currentzone,
      companyTypeSelected,
    } = this.state;
    if (isAddingTreatment) {
      await addRelatedCustomProducts({ productsToOrder, discounts });
      return;
    }

    if (editMode) {
      try {
        const selectedProduct = productsToOrder[0];
        let data = {};
        const qtyType = selectedProduct.isPickLater ? 'pickLaterQty' : 'orderQty';
        if (companyTypeSelected === 'company') {
          data = {
            description: selectedProduct.description,
            discounts,
            fieldName: selectedProduct.fieldName,
            orderQty: selectedProduct.orderQty,
            packagingId: selectedProduct.packagingId,
            seedSizeId: selectedProduct.seedSizeId,
            orderDate,
            comment,
            price: parseFloat(selectedProduct.costUnit),
          };
        } else {
          data = {
            description,
            discounts,
            fieldName: selectedProduct.fieldName,
            [qtyType]: selectedProduct.orderQty,
            packagingId: selectedProduct.packagingId,
            seedSizeId: selectedProduct.seedSizeId,
            orderDate,
            comment,
            price:
              (selectedProduct.msrp !== undefined && parseFloat(JSON.parse(selectedProduct.msrp)[currentzone], 10)) ||
              parseFloat(this.props.editingProduct.price, 10) ||
              0.0,
          };
        }

        const price = this.getTotalPrice();
        if (this.state.isApiSeedCompany) {
          data.price = price;
        }

        if (selectedProduct.negativeQuantity > 0 && companyTypeSelected === 'company') {
          data[qtyType] = selectedProduct.monsantoProductOriginalQuantity - selectedProduct.negativeQuantity;
          data.price =
            data[qtyType] * parseFloat(JSON.parse(selectedProduct.msrp)[currentzone], 10) ||
            parseFloat(this.props.editingProduct.price, 10);
        }
        if (wantToTransferAll && this.state.isApiSeedCompany) {
          data[qtyType] = 0;
        }
        if (this.props.purchaseOrder.isQuote) {
          let data1 = {};
          data1 = {
            ...data,
            orderQty: selectedProduct.orderQty,
            purchaseOrderId: this.props.purchaseOrder.id,
            isQuote: true,
          };

          await this.props.onEditProduct(this.props.editingProduct.id, selectedProduct.id, data1).then(async (res) => {
            console.log(res);
          });
        } else {
          await this.props
            .onEditProduct(this.props.editingProduct.id, selectedProduct.id, data, selectedProduct)
            .then(async () => {});
        }
      } catch (e) {
        console.log(e, 'e');
      }

      // commented because it created bug in code the whole ui was breaking because of this commented code
      // after commenting this everything works fine but if you want to uncomment it
      //                      then make sure you check all the places that might get affected

      // i don't know why but this.setState written below is creating some bug

      // new comment

      // this.setState({
      //   editMode: false,
      //   company: '',
      //   seedType: '',
      //   //   productToCheckAgainstDiscounts: null,
      //   productsToOrder: [],
      //   //   discounts: [],
      //   //   packagingId: "",
      //   //   seedSizeId: "",
      //   //   companyTypeSelected: "company",
      //   //   orderDate: new Date(),
      //   //   orderFieldName: "",
      //   tableHeaders: [],
      //   tableData: [],
      //   //   deleteProductConfirm: null
      //   // isLoading: false, openDialogOnSubmit: false
      // });

      this.props.reload();
    } else {
      await this.props.onAddProducts({ productsToOrder, discounts, orderDate }).then(() => {
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
          fieldName: '',
          tableHeaders: [],
          tableData: [],
          deleteProductConfirm: null,
          isLoading: false,
          openDialogOnSubmit: false,
        });
        this.props.reload();
      });
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
      .map((discountId, index) => {
        const discount = dealerDiscounts.find((dd) => dd.id === discountId);
        let selected = {
          DiscountId: discountId,
          order: discounts.length + index,
        };

        if (discount && discount.discountStrategy === 'Flat Amount Discount' && discount.detail.length === 1) {
          selected.unit = discount.detail[0].unit;
          selected.discountValue = discount.detail[0].discountValue;
        }

        return selected;
      });

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
            <br />
            {product.comment}
          </span>
        )}

        {!product.name && (
          <span>
            {product.brand && `${product.brand} `}
            {product.blend && `${product.blend} `}
            {product.size && `${product.size} `}
            {product.brand == null && product.blend == null && `${product.productDetail} `}
            {product.treatment && `${product.treatment} `}
            {product.amountPerBag && `${product.amountPerBag} `}
            <br />
            {product.comment}
          </span>
        )}
      </span>
    );
  }

  getTotalPrice = () => {
    const { currentzone, currentquantity } = this.state;
    const { editingProduct } = this.props;
    // orderQty
    let price = '';
    if (!currentzone) {
      price = editingProduct.price;
    } else {
      price = JSON.parse(editingProduct.MonsantoProduct.LineItem.suggestedEndUserPrice)[currentzone];
    }
    return parseFloat((currentquantity || editingProduct.orderQty) * price);
  };

  getNormalCompanyTotal = () => {
    const { currentquantity, companyTypeSelected } = this.state;
    const { editingProduct } = this.props;
    if (companyTypeSelected === 'company') {
      return (currentquantity || editingProduct.orderQty) * editingProduct.CustomProduct.costUnit;
    }
    return (currentquantity || editingProduct.orderQty) * editingProduct.Product.msrp;
  };

  getTableData() {
    const {
      productsToOrder,
      discounts,
      editMode,
      selectedProduct,
      orderDate,
      currentzone,
      companyTypeSelected,
      fieldName,
    } = this.state;
    const { dealerDiscounts, packagings, seedSizes, type, classes, editingProduct, purchaseOrder } = this.props;
    const discountsToCalc = discounts
      .map((discount) => {
        return dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
      })
      .filter((el) => el);
    let tableHeaders = ['Product'];

    tableHeaders = tableHeaders.concat(['Packaging', 'Seed Size']);
    tableHeaders = tableHeaders.concat(['Quantity', 'MSRP']);

    tableHeaders = tableHeaders.concat(['Before Discount', 'Discounts']);
    tableHeaders = tableHeaders.concat(['Total']);
    if (!editMode) tableHeaders = tableHeaders.concat(['']);
    if (type === 'farm') tableHeaders.unshift('Field');

    let tableData = productsToOrder.map((productOrder, idx) => {
      let customerProduct = {
        orderQty: parseFloat(productOrder.orderQty) || 0,
        orderDate,
        discounts,
        productOrder,
      };
      if (editMode) customerProduct = { ...editingProduct, orderDate };
      let customerProductClone = cloneDeep(customerProduct);
      if (editMode) customerProductClone.discounts = discounts;

      let data = customerProductDiscountsTotals(
        customerProductClone,
        discountsToCalc,
        productOrder,
        null,
        null,
        null,
        purchaseOrder,
        editingProduct,
      );

      let packaging = packagings.find((p) => p.id === productOrder.packagingId);
      let seedSize = seedSizes.find((ss) => ss.id === productOrder.seedSizeId);
      if (productOrder.isMonsantoProduct) {
        packaging = {
          name: productOrder.packaging,
        };
        seedSize = {
          name: productOrder.seedSize,
        };
      }
      if (productOrder.ProductPackaging && productOrder.ProductPackaging.packagingGroups.length > 0) {
        const packagingGroup = editingProduct.Product.ProductPackaging.packagingGroups.find(
          (_packagingGroup) => _packagingGroup.CustomerProductId === customerProduct.id,
        );
        let packagingId, seedSizeId;
        if (packagingGroup) {
          packagingId = packagingGroup.packagingId;
          seedSizeId = packagingGroup.seedSizeId;
        }
        packaging = packagings.find((p) => p.id === packagingId);
        seedSize = seedSizes.find((ss) => ss.id === seedSizeId);
      }
      let row = [this.addedProductLabel(productOrder)];

      if (editMode && this.props.editingProduct.hasOwnProperty('MonsantoProduct')) {
        packaging = {
          name: this.props.editingProduct.MonsantoProduct.packaging,
        };
        seedSize = {
          name: this.props.editingProduct.MonsantoProduct.seedSize,
        };
      }
      row = row.concat([packaging ? packaging.name : '', seedSize ? seedSize.name : '']);

      if (companyTypeSelected === 'company') {
        // row = row.concat([productOrder.orderQty, numberToDollars(JSON.parse(productOrder.costUnit))]);
        row = row.concat([productOrder.orderQty, productOrder.msr && numberToDollars(JSON.parse(productOrder.msrp))]);
      }

      if (companyTypeSelected !== 'company') {
        row = row.concat([
          productOrder.orderQty,
          numberToDollars(
            (editMode && Object.keys(JSON.parse(productOrder.msrp || '{}')).includes('NZI') && editingProduct.price) ||
              (editMode && currentzone === '' && editingProduct.price) ||
              (editMode && currentzone !== '' && JSON.parse(productOrder.msrp || '{}')[currentzone]) ||
              (editingProduct && editingProduct.msrpEdited) ||
              parseFloat(productOrder.msrp, 10) ||
              productOrder.costUnit ||
              0,
          ),
        ]);
      }

      // row = row.concat(
      //   discountsToCalc.map(discount => {
      //     if (data.discounts[discount.id]) {
      //       return numberToDollars(data.discounts[discount.id].amount);
      //     } else {
      //       return numberToDollars(0);
      //     }
      //   })
      // );

      row = row.concat([
        numberToDollars(data.originalPrice),
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {discountsToCalc.map((discount) => {
            if (data.discounts[discount.id]) {
              return (
                <div className={classes.discountRow}>
                  <span>{discount.name}</span> <span>{numberToDollars(data.discounts[discount.id].amount)}</span>
                </div>
              );
            } else {
              return (
                <div className={classes.discountRow}>
                  <span>{discount.name}</span> <span>{numberToDollars(0)}</span>
                </div>
              );
            }
          })}
          <div className={classes.discountRow}>
            <span style={{ fontWeight: '600' }}>Total</span>{' '}
            <span style={{ fontWeight: '600' }}>{numberToDollars(data.discountAmount)}</span>
          </div>
        </div>,
      ]);

      if (!editMode && !editingProduct) {
        row = row.concat([
          <span style={{ fontWeight: '800' }} id="disTotal">
            {numberToDollars(data.total)}
          </span>,
        ]);
      } else {
        // TODO jay's discussion
        row = row.concat([
          <span style={{ fontWeight: '800' }} id="disTotal">
            {numberToDollars(data.total)}
          </span>,
        ]);
        // if (this.state.companyTypeSelected === 'apiSeedCompany') {
        //   const totalprice = this.getTotalPrice();
        //   row = row.concat([<span style={{ fontWeight: '800' }}>{numberToDollars(totalprice)}</span>]);
        // } else {
        //   const totalprice = this.getNormalCompanyTotal();
        //   row = row.concat([<span style={{ fontWeight: '800' }}>{numberToDollars(totalprice)}</span>]);
        // }
      }

      if (!editMode)
        row = row.concat([
          <IconButton aria-label="Remove" onClick={() => this.removeProductFromOrder(productOrder)}>
            {/* <RemoveCircle /> */}
            <img src={deleteImg} alt="delete" width="24px"></img>
          </IconButton>,
        ]);

      if (type === 'farm') {
        row.unshift(
          <FormControl className={classes.selectWrapper}>
            <CustomInput
              labelText={'Field Name'}
              id={`field-name_${idx}`}
              inputProps={{
                value: productOrder.hasOwnProperty('fieldName') ? productOrder.fieldName : fieldName,
                onChange: this.handleFieldChange(productOrder.id),
              }}
            />
          </FormControl>,
        );
      }
      return row;
    });
    this.setState({ tableHeaders, tableData });
  }

  get showSeedSizeAndPackaging() {
    // const { purchaseOrder } = this.props;
    const { companyTypeSelected } = this.state;
    return !(companyTypeSelected === 'apiSeedCompany') && !(companyTypeSelected === 'company');
  }

  getSelectedProducts = (seedCompany) => {
    const { company, companyTypeSelected, showAllMonsantoProducts, showFavoriteProducts, packagingData, seedType } =
      this.state;
    const { companies } = this.props;
    const isSeedCompany = companyTypeSelected === 'seedCompany';
    const isApiSeedCompany = companyTypeSelected === 'apiSeedCompany';
    let selectedSeedCompanyProducts = [];

    let selectedCompanyProducts = [];

    if (company) {
      if (seedCompany) {
        if (isSeedCompany && !showFavoriteProducts) {
          selectedSeedCompanyProducts =
            seedCompany.Products &&
            seedCompany.Products.filter((product) => (product.blend && product.treatment) != null);
        }
        if (isSeedCompany && showFavoriteProducts) {
          selectedSeedCompanyProducts = seedCompany.Products.filter((product) => product.isFavorite);
        }
        // if (isApiSeedCompany && seedType == 'PACKAGING') {
        //   selectedSeedCompanyProducts = packagingData;
        // }
        if (isApiSeedCompany && showAllMonsantoProducts) {
          selectedSeedCompanyProducts = seedCompany.Products.filter((product) => product.isFavorite == true);
          seedCompany.summaryProducts.forEach((product) => {
            selectedSeedCompanyProducts.push(product);
          });
        }
        if (isApiSeedCompany && !showAllMonsantoProducts) {
          selectedSeedCompanyProducts = seedCompany.Products;
          seedCompany.MonsantoFavoriteProducts &&
            seedCompany.MonsantoFavoriteProducts.forEach((product) => {
              selectedSeedCompanyProducts.push(product.Product);
            });
        }
      } else {
        const selectedCompany = companies.find((sc) => sc.id === getCompanyId(company));
        selectedCompanyProducts = selectedCompany ? selectedCompany.CustomProducts : [];
      }
    }

    return {
      selectedSeedCompanyProducts: [...new Set(selectedSeedCompanyProducts)],
      selectedCompanyProducts,
    };
  };

  showSeedSource = (seedCompany) => {
    const { seedType } = this.state;
    if (!seedCompany || !seedCompany.metadata) return false;
    if (!this.state.seedType) return false;
    let metadata = JSON.parse(seedCompany.metadata);
    let st = seedType.toLowerCase();
    let matchingKeyIdx = -1;
    let metadataKeys = Object.keys(metadata);
    metadataKeys.forEach((key, idx) => {
      if (key.toLowerCase() === st) matchingKeyIdx = idx;
    });
    if (matchingKeyIdx === -1) return;
    return metadata[metadataKeys[matchingKeyIdx]].seedSource === true;
  };

  handleTransferInfoDialog = () => {
    this.props.setValues(true);

    this.submitProduct();
  };

  setToCustomerDetails = (data) => {
    this.setState({
      toCustomerDetails: { ...this.state.toCustomerDetails, ...data },
    });
  };

  setToCustomerBaseQuantity = (quantity) => {
    // if (this.state.toCustomerBaseQuantity == 0) {
    this.setState({ toCustomerBaseQuantity: quantity });
    // }
  };

  setAvailabilityProduct = (data) => {
    this.setState({ productForCheckAvailability: data });
  };
  updateDisableBtn = (data) => {
    isDisabledCheckBtn = data;
  };

  checkProductavaiblty = async () => {
    const { checkinOrderProductAvailability } = this.props;
    const { quantity, selectedProduct, productForCheckAvailability } = this.state;
    this.setState({ isLoadingAvailability: true });
    isDisabledCheckBtn = true;

    const productList = [];
    productForCheckAvailability.length > 0
      ? productForCheckAvailability.map((p) => {
          return productList.push({
            crossReferenceId: p.crossReferenceId,
            classification: p.classification,
            LineItem: {
              suggestedDealerMeasurementValue: 0,
              suggestedDealerMeasurementUnitCode: JSON.parse(p.LineItem.suggestedDealerMeasurementUnitCode),
            },
          });
        })
      : productList.push({
          crossReferenceId: productForCheckAvailability.crossReferenceId,
          classification: productForCheckAvailability.classification,
          LineItem: {
            suggestedDealerMeasurementValue: 0,
            suggestedDealerMeasurementUnitCode: JSON.parse(
              productForCheckAvailability.LineItem.suggestedDealerMeasurementUnitCode,
            ),
          },
        });

    await checkinOrderProductAvailability({
      productList: productList,
    })
      .then((res) => {
        isDisabledCheckBtn = false;

        this.setState({
          productAvailability: res.data.length > 0 ? res.data : '0 Units',

          isLoadingAvailability: false,
        });
      })
      .catch((e) => {
        isDisabledCheckBtn = false;

        this.setState({ ischeckingProductavaiblty: false, isLoadingAvailability: false });
        this.setShowSnackbar(e.response.data.error || e);
      });
  };

  render() {
    const {
      editMode,
      company,
      seedType,
      // orderFieldName,
      discounts,
      productsToOrder,
      selectedProduct,
      quantity,
      packagingId,
      seedSizeId,
      comment,
      orderDate,
      tableHeaders,
      tableData,
      companyTypeSelected,
      deleteProductConfirm,
      showAllMonsantoProducts,
      showFavoriteProducts,
      currentquantity,
      currentquantityChanged,
      openDialogOnSubmit,
      fromCustomerDetails,
      toCustomerDetails,
      productAvailability,
      fieldName,
      // isDisabledCheckBtn,
    } = this.state;
    const {
      classes,
      companies,
      seedCompanies,
      apiSeedCompanies,
      dealerDiscounts,
      customerOrders,
      packagings,
      seedSizes,
      // type,
      purchaseOrder,
      discountPackages,
      setIsMonsantoProductReduceQuantity,
      setMonsantoProductReduceInfo,
      isMonsantoProductReduceQuantity,
      monsantoProductReduceTransferInfo,
      isAddingTreatment,
      editingProduct,
      customers,
      wantToTransferAll,
      editType,
      isLoading,
    } = this.props;
    // if (monsantoProductReduceTransferInfo.transferWay == "toHolding") {
    //   if (toCustomerDetails.name !== "Bayer Dealer Bucket")
    //     this.setState({
    //       toCustomerDetails: {
    //         name: "Bayer Dealer Bucket"
    //       }
    //     });
    // }
    // if (monsantoProductReduceTransferInfo.transferWay == 'toMonsanto') {
    //   if (toCustomerDetails.name !== 'toMonsanto')
    //     this.setState({
    //       toCustomerDetails: {
    //         name: 'toMonsanto',
    //       },
    //     });
    // }
    let showDiscountValidityMsg = false;
    discounts &&
      discounts.length > 0 &&
      discounts
        .map((discount) => {
          return dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
        })
        .filter((el) => el && el.discountStrategy !== undefined && el.discountStrategy === 'Early Pay Discount')
        .forEach((discount) => {
          if (
            discount.lastDate &&
            new Date(orderDate).toISOString().slice(0, 10) > new Date(discount.lastDate).toISOString().slice(0, 10)
          ) {
            showDiscountValidityMsg = true;
          }
        });

    let canSubmit =
      monsantoProductReduceTransferInfo &&
      (monsantoProductReduceTransferInfo.transferWay == 'toGrower' ||
        monsantoProductReduceTransferInfo.transferWay == 'toHolding') &&
      editMode
        ? true
        : false;

    let checkFarmData;
    const custData =
      customers &&
      monsantoProductReduceTransferInfo &&
      customers.filter((d) => d && d.id == monsantoProductReduceTransferInfo.growerInfo.customerId)[0];

    if (
      toCustomerDetails &&
      toCustomerDetails.isSimple === false &&
      toCustomerDetails.farmData.length > 0 &&
      monsantoProductReduceTransferInfo &&
      monsantoProductReduceTransferInfo.growerInfo.farmId !== null
    ) {
      const data =
        custData &&
        custData.PurchaseOrders &&
        custData.PurchaseOrders.length > 0 &&
        custData.PurchaseOrders.filter(
          (dd) => dd.id == monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId,
        )[0];
      if (data && data.CustomerMonsantoProducts.length > 0) {
        if (
          data.CustomerMonsantoProducts.filter((d) => d.monsantoProductId === editingProduct.monsantoProductId).length >
          0
        ) {
          checkFarmData = true;
        } else {
          checkFarmData = false;
        }
      } else {
        checkFarmData = false;
      }
    } else {
      checkFarmData = true;
    }

    let seedCompany;
    const isSeedCompany = companyTypeSelected === 'seedCompany';
    const isApiSeedCompany = companyTypeSelected === 'apiSeedCompany';

    let toPOLineItemShow = true;
    if (monsantoProductReduceTransferInfo) {
      if (
        monsantoProductReduceTransferInfo.transferWay == 'toGrower' ||
        monsantoProductReduceTransferInfo.transferWay == 'toHolding'
      ) {
        if (
          monsantoProductReduceTransferInfo.growerInfo.customerId &&
          monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId &&
          monsantoProductReduceTransferInfo.growerInfo.lineItemNumber
        ) {
          if (currentquantityChanged && currentquantity < editingProduct.orderQty) {
            canSubmit = false;
          }
        }

        if (
          monsantoProductReduceTransferInfo.growerInfo.customerId &&
          monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId
        ) {
          if (custData && custData.PurchaseOrders && custData.PurchaseOrders.length > 0) {
            const data = custData.PurchaseOrders.filter(
              (dd) => dd.id == monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId,
            )[0];
            if (data && data.CustomerMonsantoProducts.length > 0) {
              if (
                data.CustomerMonsantoProducts.filter(
                  (d) => d.monsantoProductId && d.monsantoProductId === editingProduct.monsantoProductId,
                ).length > 0
              ) {
                toPOLineItemShow = true;
              } else {
                toPOLineItemShow = false;
              }
            } else {
              toPOLineItemShow = false;
            }
          } else {
            toPOLineItemShow = false;
          }
        }
      }
    }
    const { Customer } = purchaseOrder;

    let cropTypes = [];
    let metadata = {};
    if (isSeedCompany) {
      seedCompany = seedCompanies && seedCompanies.find((sc) => sc.id === getCompanyId(company));
      if (seedCompany) {
        metadata = JSON.parse(seedCompany.metadata);
        cropTypes = Object.keys(metadata);
      }
    } else if (isApiSeedCompany) {
      let CustomerZoneIds = [];
      // if (Customer.name === "Bayer Dealer Bucket") {
      //   CustomerZoneIds = Customer.zoneIds;
      // } else
      if (Customer && Array.isArray(Customer.zoneIds) && Customer.zoneIds.length === 0) {
        cropTypes = Object.values(mapObj);
      } else if (Customer && Array.isArray(JSON.parse(Customer.zoneIds))) {
        CustomerZoneIds = JSON.parse(Customer.zoneIds); //getting null
      }

      // CustomerZoneIds.map((item) => {
      //   item.classification &&
      //     cropTypes.push(item.classification.length === 1 ? mapObj[item.classification] : item.classification);
      // });
      seedCompany = apiSeedCompanies && apiSeedCompanies.find((sc) => sc.id === getCompanyId(company));
      cropTypes = Object.values(mapObj); //remove this line
    }
    const { selectedSeedCompanyProducts, selectedCompanyProducts } = this.getSelectedProducts(seedCompany);
    const showPackaging = this.showSeedSizeAndPackaging;
    let xsFirstTwo = showPackaging ? 2 : 3;
    const showSeedSourceColumn = this.showSeedSource(seedCompany);

    return (
      <Dialog
        open={true}
        TransitionComponent={Transition}
        maxWidth="xl"
        PaperProps={{ classes: { root: classes.dialog } }}
      >
        {/* <div className={classes.dialogHeader}>
          <h4>
            {isAddingTreatment
              ? "Add Treatment to product"
              : editMode
              ? "Edit Product"
              : "Add Product"}
          </h4>
        </div> */}
        <div className={classes.dialogBody}>
          <Accordion preExpanded={['a']}>
            <AccordionItem uuid="a">
              <AccordionItemHeading>
                <AccordionItemButton>Select Products </AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                  {!isAddingTreatment && (
                    <DatePicker
                      leftArrowIcon={<NavigateBefore />}
                      rightArrowIcon={<NavigateNext />}
                      format="MMMM Do YYYY"
                      utcOffset={0}
                      disablePast={false}
                      label="Order Date"
                      emptyLabel="Order Date"
                      value={moment.utc(orderDate)}
                      onChange={this.handleDateChange}
                      className={classes.datePicker}
                    />
                  )}
                  {/* {type === "farm" && (
                  <FormControl
                    className={classes.selectField}
                    style={{ paddingTop: 3, marginRight: 20 }}
                  >
                    <CustomInput
                      labelText={"Field Name"}
                      id={`field-name`}
                      inputProps={{
                        value: orderFieldName,
                        onChange: this.handleOnChange
                      }}
                    />
                  </FormControl>
                )} */}
                  <FormControl className={classes.selectField} style={{ marginRight: 20 }}>
                    <InputLabel htmlFor="company">Company</InputLabel>
                    <Select
                      value={company}
                      onChange={this.handleSelectChange}
                      autoWidth
                      select
                      data-test-id="companySelect"
                      inputProps={{
                        className: classes.select,
                        required: true,
                        name: 'company',
                      }}
                      disabled={editMode && editingProduct.hasOwnProperty('monsantoProductId')}
                    >
                      {apiSeedCompanies &&
                        apiSeedCompanies.map((apiSeedCompany) => (
                          <MenuItem
                            className="apiSeedCompany"
                            value={`apiSeedCompany-${apiSeedCompany.id}`}
                            key={`apiSeedCompany-${apiSeedCompany.id}`}
                            id={`apiSeed-${apiSeedCompany.name}`}
                          >
                            {apiSeedCompany.name}
                          </MenuItem>
                        ))}
                      {seedCompanies.length > 0 &&
                        this.props.purchaseOrder.Customer &&
                        this.props.purchaseOrder.Customer.name !== 'Bayer Dealer Bucket' &&
                        seedCompanies.map((seedCompany) => (
                          <MenuItem
                            className="seedCompany"
                            value={`seedCompany-${seedCompany.id}`}
                            key={`seedCompany-${seedCompany.id}`}
                            id={seedCompany.name}
                          >
                            {seedCompany.name}
                          </MenuItem>
                        ))}
                      {companies &&
                        this.props.purchaseOrder.Customer &&
                        this.props.purchaseOrder.Customer.name !== 'Bayer Dealer Bucket' &&
                        companies.map((company) => (
                          <MenuItem
                            className="company"
                            value={`company-${company.id}`}
                            key={`company-${company.id}`}
                            id={company.name}
                          >
                            {company.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  {seedCompany !== undefined && (
                    <FormControl>
                      <InputLabel htmlFor="seed-type">Seed Type</InputLabel>
                      <Select
                        value={seedType}
                        onChange={this.handleSelectChange}
                        autoWidth
                        select
                        id="seedTypeSelect"
                        inputProps={{
                          className: classes.select,
                          required: true,
                          name: 'seedType',
                        }}
                        disabled={editMode && editingProduct.hasOwnProperty('monsantoProductId')}
                      >
                        {/* {isApiSeedCompany && */}
                        {isApiSeedCompany &&
                          cropTypes
                            // .filter((seedType) => {
                            // if (seedCompany[`${seedType.toLowerCase()}BrandName`]) {
                            //   return seedCompany[`${seedType.toLowerCase()}BrandName`].trim() !== '';
                            // }
                            // })
                            .map((seedType) => (
                              <MenuItem
                                key={seedType}
                                value={seedType.toUpperCase()}
                                style={{ textTransform: 'capitalize' }}
                                id={seedCompany[`${seedType.toLowerCase()}BrandName`]}
                              >
                                {seedType.toLowerCase() || seedCompany[`${seedType.toLowerCase()}BrandName`]}
                              </MenuItem>
                            ))}
                        {isSeedCompany &&
                          cropTypes
                            .filter(
                              (seedType) =>
                                seedType && metadata[seedType].brandName && metadata[seedType].brandName.trim() !== '',
                            )
                            .map((cropType, index) => (
                              <MenuItem key={index} value={cropType.toUpperCase()} id={metadata[cropType].brandName}>
                                {metadata[cropType].brandName}
                              </MenuItem>
                            ))}
                      </Select>
                    </FormControl>
                  )}
                  {seedType !== '' && company.substr(0, 3) !== 'api' && (
                    <FormControl style={{ marginLeft: 20 }}>
                      <FormControlLabel
                        control={<Checkbox value={showFavoriteProducts} onChange={this.handleShowFavoriteProducts} />}
                        label="Show favorite products"
                      />
                    </FormControl>
                  )}
                  {seedType !== '' && company.substr(0, 3) === 'api' && (
                    <FormControl style={{ marginLeft: 20 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            value={showAllMonsantoProducts}
                            onChange={this.handleShowAllMonsantoProducts}
                            disabled={editMode && editingProduct.hasOwnProperty('monsantoProductId')}
                            id="showFavProduct"
                          />
                        }
                        label="Show favorite and already added products"
                      />
                    </FormControl>
                  )}

                  {isApiSeedCompany && seedType !== '' && (
                    <div>
                      <Button onClick={this.checkProductavaiblty} disabled={isDisabledCheckBtn}>
                        Check Availability
                      </Button>
                      {this.state.isLoadingAvailability && (
                        <CircularProgress
                          size={24}
                          style={{ width: '35px', position: 'absolute', marginTop: 15, marginLeft: -100 }}
                        />
                      )}
                    </div>
                  )}
                </div>

                <Card className={classes.secondCard}>
                  <Grid container>
                    {isApiSeedCompany ? (
                      <Grid container>
                        {seedType !== 'PACKAGING' && (
                          <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                            Traits
                          </Grid>
                        )}
                        {seedType !== 'PACKAGING' && (
                          <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                            Variety
                          </Grid>
                        )}
                        {seedType !== 'PACKAGING' && (
                          <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                            Treatment
                          </Grid>
                        )}
                        {seedType !== 'PACKAGING' && (
                          <Grid item xs={2} className={classes.gridHeader}>
                            Seed Size
                          </Grid>
                        )}
                        {seedType !== 'PACKAGING' && (
                          <Grid item xs={2} className={classes.gridHeader}>
                            packaging
                          </Grid>
                        )}

                        {seedType == 'PACKAGING' && (
                          <Grid item xs={6} className={classes.gridHeader}>
                            Product
                          </Grid>
                        )}
                        <Grid
                          item
                          xs={seedType == 'PACKAGING' ? 6 : 2}
                          className={
                            showPackaging
                              ? classes.gridHeader
                              : classes.gridHeader + ' ' + classes.gridHeaderBorderStyle
                          }
                        >
                          Quantity and MSRP
                        </Grid>
                      </Grid>
                    ) : (
                      <Grid container>
                        <Grid
                          item
                          xs={showSeedSourceColumn ? 2 : 3}
                          className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}
                        >
                          {companyTypeSelected === 'company' ? 'Product' : 'Traits'}
                        </Grid>
                        <Grid
                          item
                          xs={showSeedSourceColumn ? 2 : 3}
                          className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}
                        >
                          {companyTypeSelected === 'company' ? 'Type' : 'Variety'}
                        </Grid>
                        <Grid item xs={xsFirstTwo} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                          {companyTypeSelected === 'company' ? 'Description' : 'Treatment'}
                        </Grid>
                        {showSeedSourceColumn && (
                          <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                            Seed Source
                          </Grid>
                        )}
                        <Grid
                          item
                          xs={xsFirstTwo}
                          className={
                            showPackaging
                              ? classes.gridHeader
                              : classes.gridHeader + ' ' + classes.gridHeaderBorderStyle
                          }
                        >
                          Quantity and MSRP
                        </Grid>
                        {showPackaging && (
                          <Grid item xs={2} className={classes.gridHeader}>
                            Packaging and Seed Size
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </Grid>
                  <Grid container style={{ height: '350px' }}>
                    <Grid item xs={12}>
                      <Grow in={companyTypeSelected === 'company'} timeout={FADE_DURATION}>
                        <div>
                          {companyTypeSelected === 'company' && (
                            <div>
                              <ProductSelector
                                classes={classes}
                                purchaseOrder={purchaseOrder}
                                customerOrders={customerOrders}
                                seedType={'BUSINESS'}
                                products={selectedCompanyProducts}
                                selectDiscountProduct={this.selectDiscountProduct}
                                addProductToOrder={this.addProductToOrder}
                                onEditProductChange={this.onEditProductChange}
                                selectedProduct={selectedProduct}
                                quantity={quantity}
                                seedCompany={seedCompany}
                                comment={comment}
                                companies={companies}
                                changequantity={this.changequantity}
                                editType={editType}
                                fieldName={fieldName}
                              />
                            </div>
                          )}
                        </div>
                      </Grow>

                      <Grow in={seedCompany !== undefined && seedType !== ''} timeout={FADE_DURATION}>
                        <div>
                          {seedCompany !== undefined && seedType !== '' && (
                            <ProductSelector
                              iseditMode={editMode}
                              wantToTransferAll={wantToTransferAll}
                              setToCustomerBaseQuantity={this.setToCustomerBaseQuantity}
                              setToCustomerDetails={this.setToCustomerDetails}
                              changequantity={this.changequantity}
                              changezone={this.changezone}
                              editingProduct={this.props.editingProduct}
                              classes={classes}
                              purchaseOrder={purchaseOrder}
                              customerOrders={customerOrders}
                              seedType={seedType}
                              packagingId={packagingId}
                              seedSizeId={seedSizeId}
                              comment={comment}
                              fieldName={fieldName}
                              products={selectedSeedCompanyProducts}
                              selectDiscountProduct={this.selectDiscountProduct}
                              addProductToOrder={this.addProductToOrder}
                              onEditProductChange={this.onEditProductChange}
                              selectedProduct={selectedProduct}
                              quantity={quantity}
                              company={getCompanyId(company)}
                              packagings={packagings}
                              seedSizes={seedSizes}
                              isApiSeedCompany={isApiSeedCompany}
                              seedCompany={seedCompany}
                              setIsMonsantoProductReduceQuantity={setIsMonsantoProductReduceQuantity}
                              setMonsantoProductReduceInfo={setMonsantoProductReduceInfo}
                              isMonsantoProductReduceQuantity={isMonsantoProductReduceQuantity}
                              monsantoProductReduceTransferInfo={monsantoProductReduceTransferInfo}
                              companies={companies}
                              editType={editType}
                              setAvailabilityProduct={this.setAvailabilityProduct}
                              setIsDisabledCheckBtn={this.updateDisableBtn}
                              productAvailabilityData={productAvailability}
                              isCustomerZone={
                                Customer && Customer.monsantoTechnologyId !== '' && Customer.glnId !== null
                                  ? true
                                  : false
                              }
                            />
                          )}
                        </div>
                      </Grow>
                    </Grid>
                  </Grid>
                </Card>
              </AccordionItemPanel>
            </AccordionItem>
            <AccordionItem uuid="b">
              <AccordionItemHeading>
                <AccordionItemButton>Manage Discounts ({tableData.length})</AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel>
                <Card className={classes.thirdCard}>
                  <div className={classes.thirdCardHeader}>
                    {!editMode && !isAddingTreatment && <h4>Manage Discounts ({tableData.length})</h4>}
                    {isAddingTreatment && <h4>Treatments to add to product ({tableData.length})</h4>}
                    {!isAddingTreatment && (
                      <DatePicker
                        leftArrowIcon={<NavigateBefore />}
                        rightArrowIcon={<NavigateNext />}
                        format="MMMM Do YYYY"
                        disablePast={false}
                        utcOffset={0}
                        label="Order Date"
                        emptyLabel="Order Date"
                        value={moment.utc(orderDate)}
                        onChange={this.handleDateChange}
                        className={classes.datePicker}
                      />
                    )}
                  </div>
                  <Divider />
                  <div className={classes.thirdCardBody}>
                    <Table tableHead={tableHeaders} tableData={tableData} isCheckBox={false} />
                  </div>
                </Card>
                {showDiscountValidityMsg && (
                  <p style={{ color: 'red', display: 'flex', justifyContent: 'flex-end' }}>
                    Your early pay discount maybe $0 because the product order date is past the last early pay discount
                    date
                  </p>
                )}
                <Card style={{ padding: '20px' }}>
                  <div className={classes.thirdCardHeader}>
                    <h4>Discounts</h4>
                  </div>
                  <React.Fragment>
                    <GridContainer>
                      <GridItem className={classes.discountGridItem} xs={4}>
                        <DiscountSelector
                          productsToOrder={productsToOrder}
                          discounts={discounts}
                          companies={companies}
                          dealerDiscounts={dealerDiscounts.filter((d) => !d.applyToWholeOrder)}
                          onUpdate={this.onDiscountsUpdate}
                        />
                      </GridItem>

                      <GridItem className={classes.discountGridItem} xs={4}>
                        <h5>Discount Packages</h5>

                        <Divider />

                        <List dense={true}>
                          {discountPackages &&
                            discountPackages.map((discountPackage) => {
                              return (
                                <ListItem key={discountPackage.id}>
                                  <ListItemText>{discountPackage.name}</ListItemText>

                                  <ListItemSecondaryAction>
                                    <IconButton
                                      aria-label="Delete"
                                      onClick={this.applyDiscountPackage(discountPackage)}
                                    >
                                      <Tooltip title="Apply discounts">
                                        <PlaylistAdd />
                                      </Tooltip>
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              );
                            })}
                        </List>
                      </GridItem>
                    </GridContainer>
                  </React.Fragment>
                </Card>
              </AccordionItemPanel>
            </AccordionItem>
            {/* <AccordionItem uuid="c">
              <AccordionItemHeading>
                <AccordionItemButton>Discounts</AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel>
                <Card style={{ padding: "20px" }}>
                  <React.Fragment>
                    <GridContainer>
                      <GridItem className={classes.discountGridItem} xs={4}>
                        <DiscountSelector
                          productsToOrder={productsToOrder}
                          discounts={discounts}
                          companies={companies}
                          dealerDiscounts={dealerDiscounts.filter(
                            d => !d.applyToWholeOrder
                          )}
                          onUpdate={this.onDiscountsUpdate}
                        />
                      </GridItem>

                      <GridItem className={classes.discountGridItem} xs={4}>
                        <h4>Discount Packages</h4>

                        <Divider />

                        <List dense={true}>
                          {discountPackages &&
                            discountPackages.map(discountPackage => {
                              return (
                                <ListItem key={discountPackage.id}>
                                  <ListItemText>
                                    {discountPackage.name}
                                  </ListItemText>

                                  <ListItemSecondaryAction>
                                    <IconButton
                                      aria-label="Delete"
                                      onClick={this.applyDiscountPackage(
                                        discountPackage
                                      )}
                                    >
                                      <Tooltip title="Apply discounts">
                                        <PlaylistAdd />
                                      </Tooltip>
                                    </IconButton>
                                  </ListItemSecondaryAction>
                                </ListItem>
                              );
                            })}
                        </List>
                      </GridItem>
                    </GridContainer>
                  </React.Fragment>
                </Card>
              </AccordionItemPanel>
            </AccordionItem> */}
          </Accordion>
        </div>
        <div className={classes.dialogHeaderActions} style={{ marginTop: '20px' }}>
          <Button className={classes.button} style={{ width: '114px', height: '44px' }} onClick={this.close}>
            Cancel
          </Button>
          {openDialogOnSubmit && (
            <Dialog
              maxWidth={'800px'}
              minWidth={'400px'}
              aria-labelledby="confirmation-dialog-title"
              open={openDialogOnSubmit}
              // {...other}
            >
              <center>
                <DialogTitle id="confirmation-dialog-title">Transfer Information</DialogTitle>
              </center>

              <DialogContent>
                <Grid item xs={12} className={classes.transfercared}>
                  <Card>
                    <CardContent>
                      <h5 className={classes.cardInsideTitle}>From Grower Information</h5>
                      <div style={{ display: 'flex' }}>
                        <ul style={{ listStyleType: 'square' }}>
                          <li>Customer Name : </li>
                          <li>Purchase Order Number :</li>
                          <li>Product Name :</li>
                          <li>Final Quantity :</li>
                        </ul>
                        <ul style={{ listStyleType: 'none' }}>
                          <li>{`${fromCustomerDetails.name}`}</li>
                          <li>{`${fromCustomerDetails.purchaseOrderId}`}</li>
                          <li>{`${fromCustomerDetails.productname}`}</li>
                          <li>{`${parseFloat(fromCustomerDetails.finalquantity).toFixed(2)}`}</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent>
                      <h5 className={classes.cardInsideTitle}>To Grower Information</h5>
                      <div style={{ display: 'flex' }}>
                        <ul style={{ listStyleType: 'square' }}>
                          <li>Customer Name : </li>
                          <li>Purchase Order Number :</li>
                          <li>Product Name :</li>
                          <li>Final Quantity :</li>
                        </ul>
                        <ul style={{ 'list-style-type': 'square' }}>
                          <li>{`${toCustomerDetails.name}`}</li>
                          {monsantoProductReduceTransferInfo.transferWay !== 'toMonsnto' ? (
                            <li>{`${
                              toCustomerDetails.purchaseOrderId ||
                              monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId
                            }`}</li>
                          ) : (
                            <span></span>
                          )}
                          <li>{`${toCustomerDetails.productname}`}</li>
                          <li>{`${parseFloat(toCustomerDetails.finalquantity).toFixed(2)}`}</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button autoFocus onClick={() => this.setState({ openDialogOnSubmit: false })} color="primary">
                  Cancel
                </Button>

                {toCustomerDetails.glnId || toCustomerDetails.monsantoTechnologyId || isLoading ? (
                  <div style={{ position: 'relative' }}>
                    <Button
                      onClick={this.handleTransferInfoDialog}
                      color="primary"
                      id="trasfer_ok"
                      disabled={isLoading}
                    >
                      Ok
                    </Button>
                    {isLoading && (
                      <CircularProgress
                        size={24}
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          marginTop: -12,
                          marginLeft: -12,
                          width: '30px',
                          height: '25px',
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <Button disabled>Ok</Button>
                )}
              </DialogActions>

              {!toCustomerDetails.glnId && !toCustomerDetails.monsantoTechnologyId && !this.props.isLoading && (
                <div className={classes.errormsg}>To Grower doesn't have a GLN ID</div>
              )}
            </Dialog>
          )}

          {editMode &&
          isApiSeedCompany &&
          (currentquantity < editingProduct.orderQty ||
            (wantToTransferAll && monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId == null)) &&
          toPOLineItemShow &&
          checkFarmData &&
          !this.props.purchaseOrder.isQuote &&
          canSubmit ? (
            <Button color="primary" className={classes.CTABar} disabled onClick={this.submitProduct} id="submitProduct">
              Submit
            </Button>
          ) : (
            <Button
              id="submitProduct"
              color="primary"
              className={classes.CTABar}
              disabled={(!editMode && productsToOrder.length === 0) || isLoading}
              onClick={() => {
                if (
                  isApiSeedCompany &&
                  editMode &&
                  monsantoProductReduceTransferInfo.reduceQuantity &&
                  // currentquantity < editingProduct.orderQty &&
                  editingProduct.isSent &&
                  (monsantoProductReduceTransferInfo.transferWay == 'toGrower' ||
                    monsantoProductReduceTransferInfo.transferWay == 'toHolding')
                ) {
                  if (editingProduct.monsantoProductId !== productsToOrder[0].id) {
                    this.changequantity();
                  }

                  this.setState({ openDialogOnSubmit: true });
                } else {
                  this.submitProduct();
                }
              }}
            >
              Submit
            </Button>
          )}
        </div>

        {Customer && Customer.monsantoTechnologyId == '' && Customer.glnId == null && (
          <p style={{ color: 'red', display: 'flex', justifyContent: 'flex-end' }}>
            This grower needs a zone for it's Bayer crop types. Please go to the Customers page and zone information for
            this grower
          </p>
        )}
        {deleteProductConfirm}
      </Dialog>
    );
  }
}

export default withStyles(productDialogStyles)(ProductDialog);
