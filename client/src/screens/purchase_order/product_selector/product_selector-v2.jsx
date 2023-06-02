/////////////////

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { uniq } from 'lodash/array';
import classnames from 'classnames';
import { sortBy } from 'lodash';
import { groupBy } from 'lodash';

// material-ui core components
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import NativeSelect from '@material-ui/core/NativeSelect';
import { numberToDollars } from '../../../utilities';
import { getQtyOrdered, getGrowerOrder } from '../../../utilities/product';
import { getGrowerCustomOrder } from '../../../utilities/custom_product';
import CreatePurchaseOrderDialog from '../create_dialog';
import { getMonsantoQty, getMonsantoGrowerOrder, transferWays } from '../../../utilities/monsanto_product';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';

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
  gridListContainer: {
    overflowY: 'scroll',
  },
  disableGrid: {
    pointerEvents: 'none',
  },
};
const mapObj = {
  C: 'CORN',
  B: 'SOYBEAN',
  S: 'SORGHUM',
  // A: 'ALFALFA',
  L: 'CANOLA',
};

class ProductSelector extends Component {
  state = {
    editMode: false,
    selectedProduct: null,
    quantity: 0,
    monsantoQty: 0,
    allFieldsSelected: false,
    columns: [],
    packagingId: '',
    seedSizeId: '',
    comment: '',
    description: '',
    seedSource: '',
    productDetail: '',
    amountPerBag: null,
    monsantoProductOriginalQuantity: null,
    selectedPurchaseOrders: [],
    productAvailability: null,
    ischeckingProductavaiblty: false,
    selectedOption: '',
    isDisplay: false,
    currentzone: '',
    NormalCompanyProduct: {},
    negativeQuantity: 0,
    renderList: false,
    searchString: '',
    transferWays: transferWays,
    showCreatePurchaseOrderDialog: true,
    creatingPurchaseOrderCustomerId: null,
    creatingPurchaseOrderIsQuote: false,
    showSnackbar: false,
    showSnackbarText: '',
    currentFarmCustomerid: null,
    fieldShow: false,
    isPickLater: false,
    fieldName: '',
  };

  componentWillUnmount() {
    this.setState({
      editMode: false,
      selectedProduct: this.props.selectedProduct,
      quantity: 0,
      monsantoQty: 0,
      allFieldsSelected: false,
      columns: [],
      packagingId: '',
      seedSizeId: '',
      description: '',
      seedSource: '',
      productAvailability: null,
      isPickLater: false,
    });
  }

  classificationSeedTypeMap = {
    B: 'SOYBEAN',
    C: 'CORN',
    S: 'SORGHUM',
    // A: 'ALFALFA',
    L: 'CANOLA',
    P: 'PACKAGING',
  };

  seedTypeClassificationMap = {
    CORN: 'C',
    SOYBEAN: 'B',
    SORGHUM: 'S',
    //  ALFALFA: 'A',
    CANOLA: 'L',
    PACKAGING: 'P',
  };

  componentDidMount() {
    const {
      seedType,
      quantity,
      editMode,
      editingProduct,
      wantToTransferAll,
      setMonsantoProductReduceInfo,
      monsantoProductReduceTransferInfo,
      purchaseOrder,
      listFarms,
      customers,
      iseditMode,
      setToCustomerDetails,
      listCustomers,
      totalItemsOfCustomers,
    } = this.props;
    listFarms();
    // listCustomers(true, 0, totalItemsOfCustomers);
    const { Customer, CustomerMonsantoProducts = [] } = purchaseOrder;

    const customerZones =
      Customer !== undefined && Array.isArray(Customer.zoneIds)
        ? Customer && Customer.zoneIds
        : Customer && JSON.parse(Customer.zoneIds);

    customerZones &&
      customerZones.map((item) => {
        if (item.classification && item.classification.toUpperCase() === this.seedTypeClassificationMap[seedType]) {
          return this.setState({ currentzone: item.zoneId });
        }
      });

    if (this.props.type !== 'allPo') {
      const qty = CustomerMonsantoProducts.find((item) => editingProduct && editingProduct.id === item.id);
      const purchaseOrders = customers.find((customer) => customer.name === 'Bayer Dealer Bucket')
        ? customers.find((customer) => customer.name === 'Bayer Dealer Bucket').PurchaseOrders
        : '';
      const currentcustomer = customers.find((customer) => customer.name === 'Bayer Dealer Bucket');
      this.setState(
        {
          monsantoQty: (qty && qty.monsantoOrderQty) || 0,
          quantity: quantity || 0,
          monsantoProductOriginalQuantity: quantity || 0,
          selectedPurchaseOrders: [...purchaseOrders],
        },
        () => {
          if (iseditMode && currentcustomer) {
            setToCustomerDetails({
              name: currentcustomer.name,
              glnId: currentcustomer.glnId,
              monsantoTechnologyId: currentcustomer.monsantoTechnologyId,
            });
          }

          if (wantToTransferAll) {
            setMonsantoProductReduceInfo({
              ...monsantoProductReduceTransferInfo,
              reduceQuantity: editingProduct.orderQty,
            });
          }
          customerZones.map((item) => {
            if (item.classification && item.classification.toUpperCase() === seedType) {
              this.setState({ currentzone: item.zoneId });
            }
          });
        },
      );
    }

    //this.setDefaultValuesSelect()
    switch (seedType) {
      case 'CORN':
      case 'CANOLA':
        // case 'ALFALFA':
        return this.setCornState();
      case 'SORGHUM':
        return this.setSorghumState();
      case 'SOYBEAN':
        return this.setSoybeanState();
      case 'PACKAGING':
        return this.setPackagingState();
      case 'BUSINESS':
        return this.setBusinessProductsState();
      default:
        return this.setCornState();
    }
  }

  setDefaultValues() {
    const { selectedProduct, quantity, discounts, packagingId, seedSizeId, comment, fieldName } = this.props;
    if (!selectedProduct) {
      return;
    }

    if (selectedProduct.hasOwnProperty('customId')) {
      const { name, description, type, costUnit } = selectedProduct;
      this.setState(
        {
          editMode: true,
          brand: name,
          blend: type,
          treatment: description,
          amountPerBag: null,
          name,
          type,
          description,
          costUnit,
          quantity,
          discounts,
          packagingId,
          seedSizeId,
          comment,
          fieldName,
          NormalCompanyProduct: { ...selectedProduct },
        },
        this.addProduct,
      );
      return;
    }
    if (selectedProduct.hasOwnProperty('SeedCompany')) {
      const { brand, blend, treatment, amountPerBag, description, seedSource, name, costUnit } = selectedProduct;
      this.setState(
        {
          editMode: true,
          brand,
          blend,
          treatment,
          amountPerBag,
          name,
          description,
          seedSource,
          costUnit,
          quantity,
          discounts,
          selectedProduct,
          packagingId,
          seedSizeId,
          comment,
          fieldName,
        },
        this.addProduct,
      );
    }
    if (selectedProduct.hasOwnProperty('ApiSeedCompany')) {
      const { brand, blend, treatment, amountPerBag, description, name, costUnit, productDetail, id } = selectedProduct;

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
          comment,
          fieldName,
          productDetail: id,
          packagingName: productDetail,
        },
        () => {
          this.addProduct();

          this.setItem('seedSize', selectedProduct.seedSize, 3);
          this.setItem('packaging', selectedProduct.packaging, 4);
        },
      );
    }
  }

  showSeedSource() {
    const { seedCompany, seedType } = this.props;
    if (!seedCompany || !seedCompany.metadata) return false;
    if (!seedType) return false;
    let metadata = JSON.parse(seedCompany.metadata);
    let st = seedType.toLowerCase();
    let matchingKeyIdx = -1;
    let metadataKeys = Object.keys(metadata);
    metadataKeys.forEach((key, idx) => {
      if (key.toLowerCase() === st) matchingKeyIdx = idx;
    });
    if (matchingKeyIdx === -1) return;
    return metadata[metadataKeys[matchingKeyIdx]].seedSource === true;
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

    if (this.showSeedSource()) {
      columns.push({
        id: 'seedSource',
        name: 'Seed Source',
      });
    }

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

    if (this.showSeedSource()) {
      columns.push({
        id: 'seedSource',
        name: 'Seed Source',
      });
    }

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
    let columns = [
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

    if (this.showSeedSource()) {
      columns.push({
        id: 'seedSource',
        name: 'Seed Source',
      });
    }

    this.setState(
      {
        columns,
      },
      this.setDefaultValues,
    );
  }

  setPackagingState() {
    let columns = [
      {
        id: 'packagingName',
        name: 'Product',
      },
    ];

    this.setState({ columns }, this.setDefaultValues);
  }
  availableItems() {
    const { products, seedType, setIsDisabledCheckBtn } = this.props;
    const { columns, currentzone } = this.state;

    let available =
      seedType == 'CORN'
        ? products && currentzone
          ? products.filter((p) => {
              return p.classification == 'C'
                ? p.LineItem
                  ? p.LineItem.zoneId && p.LineItem.zoneId.includes(currentzone)
                  : p.zoneId !== null && p.zoneId.includes(currentzone)
                : products;
            })
          : products
        : products;

    columns.forEach((column) => {
      let selected = this.state[column.id];

      if (column.id == 'packagingName' && selected && available.length > 0) {
        available = available
          .filter((product) =>
            product.Product ? product.Product.classification == 'P' : product.classification == 'P',
          )
          .find((product) =>
            product.Product ? product.Product.productDetail === selected : product.productDetail == selected,
          );
      } else {
        if (setIsDisabledCheckBtn) {
          if (column.id == 'blend' && selected !== null && selected !== undefined) {
            setIsDisabledCheckBtn(false);
          } else if (column.id == 'blend' && selected == null && selected == undefined) {
            setIsDisabledCheckBtn(true);
          }
        }

        if (selected)
          available = available.filter((p) =>
            selected !== 'PickLater'
              ? p[column.id] === selected
              : column.id == 'seedSize'
              ? p[column.id] === available[0].seedSize
              : p[column.id] === available[0].packaging,
          );
        if (selected === 'PickLater' && available.length > 0 && available.length <= 2) {
          available = [{ ...available[0], isPickLater: true, seedSize: 'pickLater', packaging: 'pickLater' }];
        }
      }
    });
    return available;
  }

  // setDefaultValuesSelect = () => {
  //   const { products, seedType } = this.props;
  //   if (products.length < 1) return;
  //   const availableBrand = this.availableTypes("brand", 0);
  //   const availableBlend = this.availableTypes("blend", 1);
  //   const availableTreatment = this.availableTypes("treatment", 2);
  // };
  setShowSnackbar = (showSnackbarText) => {
    this.setState({
      showSnackbar: true,
      showSnackbarText: showSnackbarText,
    });
  };
  getProductAvailibityQty(itemType) {
    const { productAvailabilityData } = this.props;

    const productList = this.availableItems();

    let data = [];
    productAvailabilityData !== undefined &&
      Array.isArray(productAvailabilityData) &&
      productAvailabilityData.length > 0 &&
      productAvailabilityData.map((p) => {
        const find = productList.find((pl) => pl.crossReferenceId == p.identifications['AGIIS-ProductID']);
        if (find && find.crossReferenceId == p.identifications['AGIIS-ProductID']) {
          data.push({
            quantity: p.quantity.value,
            [itemType]: find[itemType],
          });
        }
      });

    var groupedData = [];
    data.reduce(function (res, value) {
      const pID = value[itemType];
      if (!res[pID]) {
        res[pID] = {
          [itemType]: value[itemType],
          quantity: 0,
        };
        groupedData.push(res[pID]);
      }
      res[pID].quantity += Number(value.quantity);

      return res;
    }, {});

    return groupedData;
  }

  availableTypes(itemType, i, search) {
    const { products, seedType, purchaseOrder, productAvailabilityData } = this.props;
    const { columns, currentzone } = this.state;
    let available = [];
    const classificationSeedTypeMap = {
      B: 'SOYBEAN',
      C: 'CORN',
      S: 'SORGHUM',
      // A: 'ALFALFA',
      L: 'CANOLA',
      P: 'PACKAGING',
    };
    let types;
    available =
      seedType == 'CORN'
        ? products && currentzone
          ? products.filter((p) => {
              return p.classification == 'C'
                ? p.LineItem
                  ? p.LineItem.zoneId && p.LineItem.zoneId.includes(currentzone)
                  : p.zoneId !== null && p.zoneId.includes(currentzone)
                : products;
            })
          : products
        : products;
    // if (search) {
    //   available = available.filter((dd) => dd.blend.toLowerCase().includes(search));
    // } else {

    if (seedType !== 'BUSINESS') {
      available =
        available &&
        available.filter((p) => {
          if (search && p.blend) {
            if (this.classificationSeedTypeMap[p.classification] === seedType) {
              return p.blend.toLowerCase().includes(search.toLowerCase());
            } else {
              return p.blend.toLowerCase().includes(search.toLowerCase());
            }
          }
          if (p.seedType) return p.seedType === seedType;
          if (p.classification) {
            return classificationSeedTypeMap[p.classification] === seedType;
          }

          return null;
        });
    }

    if (itemType == 'packagingName') {
      types = products
        .filter((product) => (product.Product ? product.Product.classification == 'P' : product.classification == 'P'))
        .map((product) => (product.Product ? product.Product.productDetail : product.productDetail));
      return types;
    }

    if (i === 0) {
      types =
        available &&
        uniq(
          available
            .filter((p) => (p.classification ? classificationSeedTypeMap[p.classification] === seedType : p))
            .map((p) => {
              if (p[itemType]) {
                return p[itemType];
              }
            }),
        );
      if (itemType === 'blend' || itemType === 'brand') types.sort((a, b) => a.localeCompare(b));
      return types;
    }

    for (let x = 0; x < i; x++) {
      let selected = this.state[columns[x].id];
      if (selected && (itemType === 'blend' && search ? false : true))
        available = available.filter((p) => p[columns[x].id] === selected);
    }

    types = uniq(
      available.length > 0 &&
        available
          .filter((p) => (p.classification ? classificationSeedTypeMap[p.classification] === seedType : p))
          .map((product) => product[itemType]),
    );

    if (itemType === 'blend' || itemType === 'brand') types && types.sort((a, b) => a && a.localeCompare(b));
    if (purchaseOrder.isSimple == false && (itemType === 'seedSize' || itemType === 'packaging'))
      types.push('PickLater');

    return types;
  }

  handleSelectProduct = (value) => {
    const { selectDiscountProduct, seedType } = this.props;
    const data = this.availableItems().filter((po) => po.id === value);
    this.setState({ productDetail: value, selectedProduct: data[0] }, () => this.onEditProductChange());
    this.props.type !== 'allPo' && selectDiscountProduct(data[0]);
  };
  setDiscountsProduct() {
    const { selectDiscountProduct, seedType, editType, setAvailabilityProduct } = this.props;
    let allFieldsSelected = true;
    this.state.columns.forEach((column) => {
      let selected = this.state[column.id];
      if (selected === null) allFieldsSelected = false;
    });
    if (seedType === 'BUSINESS') {
      if (allFieldsSelected) {
        this.setState({ NormalCompanyProduct: this.availableItems()[0] }, this.onEditProductChange);
        this.props.type !== 'allPo' && selectDiscountProduct(this.availableItems()[0]);
      }
    }

    const availableItemsdata = this.availableItems().length >= 1 ? this.availableItems()[0] : this.availableItems();

    if (seedType !== 'BUSINESS') {
      if (allFieldsSelected) {
        if (this.availableItems().length === 1 || editType !== 'sop') {
          this.setState({ selectedProduct: availableItemsdata });
        }
        this.setState({ fieldShow: availableItemsdata.length >= 1 ? true : false }, this.onEditProductChange);
        this.props.type !== 'allPo' && selectDiscountProduct(availableItemsdata);
      } else {
        this.setState({
          selectedProduct: null,
        });
        this.props.type !== 'allPo' && selectDiscountProduct(null);
      }
    }

    if (this.props.type == 'allPo') {
      this.setState({ selectedProduct: availableItemsdata }, this.props.onEditOnlyProductChange(availableItemsdata));
    }

    setAvailabilityProduct && setAvailabilityProduct(availableItemsdata);
  }

  addProduct = () => {
    const {
      editMode,
      selectedProduct,
      quantity,
      packagingId,
      seedSizeId,
      comment,
      fieldName,
      currentzone,
      NormalCompanyProduct,
    } = this.state;
    const { addProductToOrder, classes, isApiSeedCompany, seedType } = this.props;
    this.setState({ fieldShow: false });
    // if using packaged product, input will have a step attribute (the number of bags in package)
    // check if input value is divisible by step value
    let quantityInput = document.querySelector(`.${classes.quantityInput} input`);
    if (quantityInput && quantityInput.value && quantityInput.step) {
      if (parseInt(quantityInput.value, 0) % parseInt(quantityInput.step, 0) !== 0) {
        return;
      }
    }

    if (seedType === 'BUSINESS' && Object.keys(NormalCompanyProduct).length > 0 && !editMode) {
      const newProduct = {
        ...NormalCompanyProduct,
        orderQty: quantity,
        msrp: this.getMSRP(),
      };
      addProductToOrder(newProduct);
    }

    if (seedType === 'BUSINESS' && Object.keys(NormalCompanyProduct).length > 0 && editMode) {
      const newProduct = {
        ...NormalCompanyProduct,
        orderQty: quantity,
        msrp: this.getMSRP(),
      };
      addProductToOrder(newProduct);
    }

    if (seedType === 'BUSINESS' && Object.keys(NormalCompanyProduct).length > 0) {
      const newProduct = {
        ...NormalCompanyProduct,
        orderQty: quantity,
        msrp: this.getMSRP(),
      };
      addProductToOrder(newProduct);
    }
    if (selectedProduct) {
      const productToAdd = {
        ...selectedProduct,
        orderQty: quantity,
        packagingId: packagingId,
        seedSizeId: seedSizeId,
        comment: comment,
        fieldName: fieldName,
        isMonsantoProduct: isApiSeedCompany,
      };

      if (isApiSeedCompany) {
        productToAdd.msrp = this.getMSRP();
        productToAdd.zone = currentzone;
        productToAdd.fieldName = fieldName;
      }

      if (this.props.type !== 'allPo') return addProductToOrder(productToAdd);
    }

    if (editMode) {
      this.setState({
        quantity: quantity,
        allFieldsSelected: false,
        // packagingId: "",
        // seedSizeId: "",
        description: '',
      });
    } else {
      this.setState({
        quantity: 0,
        allFieldsSelected: false,
        packagingId: '',
        seedSizeId: '',
        comment: '',
        description: '',
        // fieldName: '',
      });
    }
  };

  onEditProductChange = async () => {
    if (this.state.productDetail === '' && this.state.fieldShow !== false) {
      await this.handleSelectProduct(this.state.selectedProduct[0].id);
    }
    const {
      selectedProduct,
      quantity,
      packagingId,
      seedSizeId,
      comment,
      NormalCompanyProduct,
      monsantoProductOriginalQuantity,
      negativeQuantity,
      currentzone,
      fieldName,
    } = this.state;

    const { onEditProductChange, isApiSeedCompany } = this.props;
    if (Object.keys(NormalCompanyProduct).length !== 0 && `${quantity}` !== '0') {
      NormalCompanyProduct.orderQty = quantity;
      NormalCompanyProduct.packagingId = packagingId;
      NormalCompanyProduct.seedSizeId = seedSizeId;
      NormalCompanyProduct.comment = comment;
      NormalCompanyProduct.fieldName = fieldName;
      onEditProductChange(NormalCompanyProduct);
    }
    if (selectedProduct && (selectedProduct.length === 1 || selectedProduct.length === undefined)) {
      selectedProduct.orderQty = quantity;
      selectedProduct.packagingId = packagingId;
      selectedProduct.seedSizeId = seedSizeId;
      selectedProduct.comment = comment;
      selectedProduct.fieldName = fieldName;

      selectedProduct.negativeQuantity = 0;
      if (!selectedProduct.msrp && selectedProduct.LineItem) {
        if (Object.keys(JSON.parse(selectedProduct.LineItem.suggestedEndUserPrice)).includes('NZI')) {
          selectedProduct.msrp = JSON.parse(selectedProduct.LineItem.suggestedEndUserPrice)['NZI'];
        } else {
          selectedProduct.msrp = JSON.parse(selectedProduct.LineItem.suggestedEndUserPrice)[currentzone];
        }
      }
      selectedProduct.monsantoProductOriginalQuantity = monsantoProductOriginalQuantity;
      selectedProduct.isMonsantoProduct = isApiSeedCompany ? true : false;
      if (selectedProduct.orderQty !== 0) {
        onEditProductChange(selectedProduct);
      }
    }
  };

  setItem(property, value, i, editType) {
    const { columns } = this.state;
    const { products, selectedProduct, customerOrders, editingProduct } = this.props;
    let update = {
      [property]: property === 'seedSource' && value === null ? undefined : value,
    };

    // allow customer to select 'blend' (2nd column) before 'blend' (1st column)

    if (i === 1 && !this.state[columns[i - 1].id]) {
      let product = products.find((p) => p[property] === value);
      update[columns[i - 1].id] = product[columns[i - 1].id];
    }
    if (editType === 'sop') {
      update['seedSize'] = selectedProduct.seedSize;
    }

    if (editingProduct && editingProduct.isPickLater === true) {
      update['seedSize'] = 'PickLater';
      update['packaging'] = 'PickLater';
    }

    // null all following columns
    if (editType !== 'sop') {
      for (let x = i + 1; x < columns.length; x++) {
        update[columns[x].id] = null;
      }
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
      () => {
        this.onEditProductChange();
      },
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

  // getProductQuantity(item, i) {
  //   const { products, seedType, customerProducts, isApiSeedCompany, seedCompany } = this.props;
  //   const { columns } = this.state;
  //   let available = products.filter((p) => p[columns[i].id] === item);
  //   if (isApiSeedCompany) {
  //     available = available.filter((p) => p.classification === this.seedTypeClassificationMap[seedType]);
  //     if (i === 0) {
  //       const quantity = available.reduce((accumulator, product) => {
  //         const _quantity = getMonsantoQty(product, seedCompany.Products);
  //         if (_quantity) {
  //           return (accumulator ? accumulator : 0) + parseInt(_quantity, 10);
  //         } else {
  //           if (accumulator === 0 || !accumulator) return null;
  //           else return accumulator;
  //         }
  //       }, 0);
  //       const growerOrder = available.reduce((accumulator, product) => {
  //         return accumulator + getMonsantoGrowerOrder(product, seedCompany.summaryProducts);
  //       }, 0);

  //       return (
  //         <span>
  //           {quantity ? quantity : '-'} / {quantity ? quantity : 0 - growerOrder}
  //         </span>
  //       );
  //     }

  //     for (let x = 0; x < i; x++) {
  //       let selected = this.state[columns[x].id];
  //       if (selected) available = available.filter((p) => p[columns[x].id] === selected);
  //     }

  //     const quantity = available.reduce((accumulator, product) => {
  //       const _quantity = getMonsantoQty(product, seedCompany.Products);
  //       if (_quantity) {
  //         return (accumulator ? accumulator : 0) + parseInt(_quantity, 10);
  //       } else {
  //         if (accumulator === 0 || !accumulator) return null;
  //         else return accumulator;
  //       }
  //     }, 0);
  //     const growerOrder = available.reduce((accumulator, product) => {
  //       return accumulator + getMonsantoGrowerOrder(product, seedCompany.summaryProducts);
  //     }, 0);

  //     return (
  //       <span>
  //         {quantity ? quantity : '-'} / {quantity ? quantity : 0 - growerOrder}
  //       </span>
  //     );
  //   }

  //   available = available.filter((p) => p.seedType === seedType);
  //   if (i === 0) {
  //     return available.reduce((accumulator, product) => {
  //       return accumulator + (getQtyOrdered(product) - getGrowerOrder(product, customerProducts));
  //     }, 0);
  //   }

  //   for (let x = 0; x < i; x++) {
  //     let selected = this.state[columns[x].id];
  //     if (selected) available = available.filter((p) => p[columns[x].id] === selected);
  //   }

  //   return available.reduce((accumulator, product) => {
  //     return accumulator + (getQtyOrdered(product) - getGrowerOrder(product, customerProducts));
  //   }, 0);
  // }

  handleSelectChange = (event) => {
    this.setState({ [event.target.name]: event.target.value }, () => this.onEditProductChange());
  };

  get showSeedSizeAndPackaging() {
    const { seedType, isApiSeedCompany } = this.props;
    return (
      !isApiSeedCompany && seedType !== 'BUSINESS'
      // && purchaseOrder.isSimple === true
    );
  }

  getMSRP() {
    const { selectedProduct, currentzone, NormalCompanyProduct, editMode } = this.state;
    const { seedType, purchaseOrdersData } = this.props;

    let growerPrice = 0;
    let msrp = 0;

    if (
      selectedProduct &&
      selectedProduct.hasOwnProperty('seedCompanyId') &&
      selectedProduct.msrp &&
      selectedProduct.msrp !== undefined &&
      selectedProduct.msrp !== null
    ) {
      msrp =
        typeof selectedProduct.msrp === 'string'
          ? selectedProduct.msrp
          : currentzone && JSON.parse(selectedProduct.msrp)[currentzone];
      return msrp;
    }

    if (seedType === 'BUSINESS') {
      if (seedType === 'BUSINESS' && Object.keys(NormalCompanyProduct).length > 0) {
        return NormalCompanyProduct.costUnit;
      } else {
        return 0.0;
      }
    }
    if (
      selectedProduct &&
      selectedProduct.LineItem !== null &&
      (selectedProduct.length === 1 || selectedProduct.length === undefined)
    ) {
      if (JSON.parse(selectedProduct.LineItem.suggestedEndUserPrice).hasOwnProperty('NZI')) {
        growerPrice = JSON.parse(selectedProduct.LineItem.suggestedEndUserPrice)['NZI'];
      } else {
        growerPrice = JSON.parse(selectedProduct.LineItem.suggestedEndUserPrice)[currentzone];
      }
    } else {
      growerPrice = 0;
    }
    return growerPrice || 0;
  }

  getMSRPInDollars() {
    return numberToDollars(this.getMSRP() || 0);
  }

  onChangeQuantity = (e) => {
    const { isApiSeedCompany, monsantoProductReduceTransferInfo, changequantity, editingProduct } = this.props;
    const { quantity, editMode, monsantoProductOriginalQuantity } = this.state;
    if (editMode && e.target.value >= 0) {
      changequantity(e.target.value);
    }
    if (e.target.value < 0) {
      this.setState({ negativeQuantity: e.target.value });
    }
    const value = {
      target: {
        value: e.target.value,
      },
    };
    if (isApiSeedCompany && editMode) {
      if (!monsantoProductOriginalQuantity) {
        this.setState({ monsantoProductOriginalQuantity: quantity });
      }
      if (parseFloat(monsantoProductOriginalQuantity, 10) > parseFloat(e.target.value, 10) && e.target.value >= 0) {
        this.props.setIsMonsantoProductReduceQuantity(true);

        if (editingProduct.monsantoProductId != this.state.selectedProduct.id) {
          this.props.setMonsantoProductReduceInfo({
            ...monsantoProductReduceTransferInfo,
            reduceQuantity: editingProduct.orderQty,
          });
        } else {
          this.props.setMonsantoProductReduceInfo({
            ...monsantoProductReduceTransferInfo,
            reduceQuantity: monsantoProductOriginalQuantity - parseFloat(e.target.value, 10),
          });
        }
      } else {
        // this.props.setIsMonsantoProductReduceQuantity(false);
        // this.props.setMonsantoProductReduceInfo({
        //   ...monsantoProductReduceTransferInfo,
        //   reduceQuantity: 0
        // });
        this.props.setIsMonsantoProductReduceQuantity(false);
        this.props.setMonsantoProductReduceInfo({
          transferWay: 'toMonsanto',
          reduceQuantity: 0,
          growerInfo: { customerId: null, purchaseOrderId: null, farmId: null, lineItemNumber: null },
        });
      }
    }
    if (editMode) {
      if (e.target.value >= 0 && isApiSeedCompany) {
        this.onInputChange('quantity')(value);
      } else if (!isApiSeedCompany) {
        this.onInputChange('quantity')(value);
      }
    } else {
      this.onInputChange('quantity')(value);
    }
  };

  handeleTransferInfoChange = (name) => (event) => {
    const myDiv = document.getElementById('myDiv');
    myDiv.scrollTop = myDiv.scrollHeight;
    const {
      monsantoProductReduceTransferInfo,
      customers,
      setToCustomerDetails,
      editingProduct,
      setToCustomerBaseQuantity,
      listFarms,
      farms,
    } = this.props;

    if (name === 'customerId' || name === 'purchaseOrderId' || name === 'farmId' || name === 'lineItemNumber') {
      if (name === 'customerId') {
        const purchaseOrders = customers.find((customer) => customer.id === event.target.value).PurchaseOrders;
        const currentcustomer = customers.find((customer) => customer.id === event.target.value);
        this.setState({ currentFarmCustomerid: currentcustomer.id });

        if (name == 'customerId') {
          setToCustomerDetails({
            name: currentcustomer.name,
            glnId: currentcustomer.glnId,
            monsantoTechnologyId: currentcustomer.monsantoTechnologyId,
          });
        }
        this.setState({ selectedPurchaseOrders: [...purchaseOrders] });
      }
      if (name === 'purchaseOrderId') {
        const { selectedPurchaseOrders, quantity } = this.state;
        let product;
        selectedPurchaseOrders
          .filter((o) => o.id !== editingProduct.purchaseOrderId && o.id === event.target.value)
          .map((order) =>
            order.CustomerMonsantoProducts.filter((item) => {
              if (item.monsantoProductId === editingProduct.monsantoProductId) {
                return (product = item);
              }
            }),
          )[0];

        let poType = selectedPurchaseOrders.filter((item) => item.id === event.target.value);
        const currentcustomer = customers.find((customer) => customer.id === poType[0].customerId);

        if (product) {
          setToCustomerBaseQuantity(product.orderQty);
          setToCustomerDetails({
            name: currentcustomer.name,
            glnId: currentcustomer.glnId,
            monsantoTechnologyId: currentcustomer.monsantoTechnologyId,

            purchaseOrderId: event.target.value,
            finalquantity: Number(product.orderQty || 0) + Math.abs(editingProduct.orderQty - quantity),
            isSimple: poType[0].isSimple,
            farmData: poType[0].farmData,
          });
        } else if (setToCustomerBaseQuantity) {
          setToCustomerBaseQuantity(editingProduct ? Math.abs(editingProduct.orderQty - quantity) : 0);
          setToCustomerDetails({
            name: currentcustomer.name,
            glnId: currentcustomer.glnId,
            monsantoTechnologyId: currentcustomer.monsantoTechnologyId,
            purchaseOrderId: event.target.value,
            finalquantity: editingProduct ? Math.abs(editingProduct.orderQty - quantity) : 0,
            isSimple: poType[0].isSimple,
            farmData: poType[0].farmData,
          });
        }
        this.props.setMonsantoProductReduceInfo({
          ...monsantoProductReduceTransferInfo,
          growerInfo: {
            ...monsantoProductReduceTransferInfo.growerInfo,
            purchaseOrderId: event.target.value,
            lineItemNumber: null,
            farmId: null,
          },
        });
      }
      if (name === 'farmId' || name === 'lineItemNumber') {
        this.props.setMonsantoProductReduceInfo({
          ...monsantoProductReduceTransferInfo,
          growerInfo: {
            ...monsantoProductReduceTransferInfo.growerInfo,
            [name]: event.target.value,
          },
        });
      }
      if (name === 'farmId') {
        setToCustomerDetails({
          farmId: event.target.value,
        });
      }
      if (name === 'lineItemNumber') {
        const { selectedPurchaseOrders, quantity } = this.state;
        let product;
        selectedPurchaseOrders
          .filter(
            (o) =>
              o.id !== editingProduct.purchaseOrderId &&
              o.id === monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId,
          )
          .map((order) =>
            order.CustomerMonsantoProducts.filter((item) => {
              if (
                item.monsantoProductId === editingProduct.monsantoProductId &&
                item.lineItemNumber == event.target.value
              ) {
                return (product = item);
              }
            }),
          )[0];

        product !== undefined && setToCustomerBaseQuantity(product.orderQty);

        setToCustomerDetails({
          lineItemNumber: event.target.value,
        });
      }

      if (name === 'customerId') {
        const purchaseOrders = customers.find((customer) => customer.id === event.target.value).PurchaseOrders;

        const isSinglePO = [...purchaseOrders].filter(
          (p) => p.isDeleted == false && p.isQuote == false && p.id !== this.props.purchaseOrder.id,
        );

        this.props.setMonsantoProductReduceInfo({
          ...monsantoProductReduceTransferInfo,
          growerInfo: {
            customerId: event.target.value,
            purchaseOrderId: isSinglePO.length == 1 ? isSinglePO[0].id : null,
            lineItemNumber: null,
            farmId: null,
          },
        });
      }

      return;
    }
    if (event.target.value === 'toHolding') {
      const bayerPo = customers && customers.find((customer) => customer && customer.name === 'Bayer Dealer Bucket');

      const purchaseOrders = bayerPo && bayerPo.PurchaseOrders;
      const currentcustomer =
        customers && customers.find((customer) => customer && customer.name === 'Bayer Dealer Bucket');

      setToCustomerDetails({
        name: currentcustomer && currentcustomer.name,
        glnId: currentcustomer && currentcustomer.glnId,
        monsantoTechnologyId: currentcustomer.monsantoTechnologyId,
      });

      this.setState({ selectedPurchaseOrders: [...purchaseOrders] });
      this.props.setMonsantoProductReduceInfo({
        ...monsantoProductReduceTransferInfo,
        growerInfo: {
          customerId: currentcustomer.id,
        },
        transferWay: 'toHolding',
      });
      return;
    }
    if (event.target.value === 'toGrower' || 'toMonsanto') {
      if (editingProduct.monsantoProductId !== this.state.selectedProduct.id) {
        this.props.setMonsantoProductReduceInfo({
          ...monsantoProductReduceTransferInfo,
          growerInfo: {
            ...monsantoProductReduceTransferInfo.growerInfo,
            customerId: null,
            purchaseOrderId: null,
            lineItemNumber: null,
            farmId: null,
          },
          [name]: event.target.value,
          reduceQuantity: editingProduct.orderQty,
        });
      } else {
        this.props.setMonsantoProductReduceInfo({
          ...monsantoProductReduceTransferInfo,
          growerInfo: {
            ...monsantoProductReduceTransferInfo.growerInfo,
            customerId: null,
            purchaseOrderId: null,
            lineItemNumber: null,
            farmId: null,
          },
          [name]: event.target.value,
        });
      }
    }
  };

  getTotalBags = () => {
    const { packagings } = this.props;
    const { packagingId, quantity } = this.state;

    if (packagingId && packagingId !== '' && packagings.length !== 0) {
      const packaging = packagings.find((_packaging) => _packaging.id === parseInt(packagingId, 10));
      return packaging.numberOfBags * quantity;
    }
    return 0;
  };

  columnIsSelected(column, item) {
    // little weird
    // seed source 'item' is null, however the state gets set to 'undefined'

    if (column.id === 'seedSource' && this.state[column.id] === undefined && item === null) {
      return true;
    }

    return this.state[column.id] === item;
  }

  handleChange = (event) => {
    this.setState({
      selectedOption: event.target.value,
    });
  };

  handleCreatePurchaseOrderDialogOpen =
    (customerId, isQuote = false) =>
    () => {
      this.setState({
        showCreatePurchaseOrderDialog: true,
        creatingPurchaseOrderCustomerId: customerId,
        creatingPurchaseOrderIsQuote: isQuote,
      });
    };

  newCreatedPurchaseOrder = (poid) => {
    this.setState({ selectedPurchaseOrders: [poid] });
  };

  handleCreatePurchaseOrderDialogClose = () => {
    this.setState({
      showCreatePurchaseOrderDialog: false,
      creatingPurchaseOrderCustomerId: null,
    });
  };

  render() {
    const {
      editMode,
      columns,
      selectedProduct,
      quantity,
      packagingId,
      seedSizeId,
      comment,
      selectedPurchaseOrders = [],
      productAvailability,
      ischeckingProductavaiblty,
      NormalCompanyProduct,
      monsantoProductOriginalQuantity,
      renderList,
      searchString,
      creatingPurchaseOrderCustomerId,
      showCreatePurchaseOrderDialog,
      creatingPurchaseOrderIsQuote,
      showSnackbar,
      showSnackbarText,
      monsantoQty,
      currentFarmCustomerid,
      fieldShow,
      fieldName,
      productDetail,
    } = this.state;
    const {
      classes,
      seedType,
      packagings,
      seedSizes,
      seedCompany,
      customers,
      monsantoProductReduceTransferInfo,
      changezone,
      isApiSeedCompany,
      purchaseOrder,
      editingProduct,
      wantToTransferAll,
      farms,
      listFarms,
      editType,
      purchaseOrdersData,
    } = this.props;

    const { Customer } = purchaseOrder;
    const currentCustomerid = purchaseOrder.customerId;

    const farmData = farms.filter((item) => item.customerId === currentFarmCustomerid);

    let availablePackagings, availableSeedSizes;
    if (seedType !== 'BUSINESS') {
      availablePackagings = packagings.filter((p) => p.seedCompanyId === seedCompany.id && p.seedType === seedType);

      availableSeedSizes = seedSizes.filter((p) => p.seedCompanyId === seedCompany.id && p.seedType === seedType);
    }
    const isSeedCompnay = selectedProduct ? selectedProduct.hasOwnProperty('seedCompanyId') : false;
    const showPackaging = this.showSeedSizeAndPackaging;
    const productList = this.availableItems();
    let xs = 3,
      xsLastTwo = showPackaging ? 2 : 3;
    if (this.showSeedSource()) xs = 2;
    let maxWidth = '20%';

    let units = [];

    const groupedData = groupBy(purchaseOrdersData, (pp) => {
      return pp.zoneId[0];
    });

    return (
      <div>
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #CCCCCC',
            height: 300,
            overflowY: 'hidden',
          }}
        >
          {columns.map((column, i) => {
            const types = this.availableTypes(column.id, i, renderList ? searchString : false);
            const checkGroupedData = this.getProductAvailibityQty(column.id) || [];

            let colXS =
              column.id === 'description' || column.id === 'treatment'
                ? xsLastTwo
                : column.id == 'packagingName'
                ? 6
                : xs;
            maxWidth = column.id == 'packagingName' ? '50%' : '20%';
            xsLastTwo = column.id == 'packagingName' ? 6 : xsLastTwo;
            return (
              <Grid
                item
                xs={colXS}
                key={column.id}
                className={classnames(
                  classes.gridHeaderBorderStyle,
                  classes.gridListContainer,
                  (editType === 'sop' ||
                    (editingProduct && editingProduct.pickLaterProductId !== null) ||
                    (editingProduct && editingProduct.isPickLater == true)) &&
                    this.props.type !== 'allPo' &&
                    (column.id === 'brand'
                      ? classes.disableGrid
                      : column.id === 'blend'
                      ? classes.disableGrid
                      : column.id === 'seedSize' || column.id === 'treatment' || column.id === 'packaging'
                      ? classes.disableGrid
                      : ''),

                  // editType === 'edit' && editMode && this.props.selectedProduct.hasOwnProperty('ApiSeedCompany')
                  //   ? classes.disableGrid
                  //   : '',
                )}
                onClick={() => {
                  editType === 'edit' && this.setState({ productAvailability: null });
                }}
              >
                {column.name === 'Variety' && (
                  <Input
                    placeholder="search Variety"
                    onChange={(e) =>
                      this.setState({
                        renderList: true,
                        searchString: e.target.value,
                      })
                    }
                    style={{ marginLeft: 14, width: '90%' }}
                  />
                )}

                {this.previousColumnSelected(i) && (
                  <List dense={true}>
                    {types !== undefined &&
                      types
                        .sort((a, b) => a && a.localeCompare(b))
                        .map((item) => {
                          const quanity =
                            checkGroupedData.length > 0 && checkGroupedData.find((f) => f[column.id] == item);

                          return (
                            <ListItem
                              key={item}
                              id={item == 'PickLater' ? `PickLater-${column.id}` : item}
                              onClick={() => {
                                this.setItem(column.id, item, i, editType);
                              }}
                              className={this.columnIsSelected(column, item) ? classes.selected : classes.listItem}
                            >
                              <ListItemText>
                                {item}{' '}
                                {column.id !== 'brand' && quanity && quanity !== undefined
                                  ? `(${quanity.quantity >= 1000 ? '1000+' : quanity.quantity})`
                                  : ''}
                                {/* <span className={classes.count}>{this.getProductQuantity(item, i)}</span> */}
                              </ListItemText>
                            </ListItem>
                          );
                        })}
                  </List>
                )}
              </Grid>
            );
          })}
          <Grid
            item
            xs={xsLastTwo}
            className={classnames(showPackaging ? classes.gridHeaderBorderStyle : null)}
            style={{ maxWidth: maxWidth }}
            // className={classnames(
            //   wantToTransferAll &&
            //     this.props.selectedProduct.hasOwnProperty("ApiSeedCompany")
            //     ? classes.disableGrid
            //     : ""
            // )}
          >
            <List dense={true} style={{ overflowX: 'hidden', height: '300px' }} id="myDiv">
              <ListItem style={{ padding: '0 13px' }}>
                {selectedProduct && this.props.type !== 'allPo' && (
                  <div style={{ height: '370px', marginBottom: '30px' }}>
                    {selectedProduct.classification == 'B' && (selectedProduct.length >= 1 || fieldShow !== false) ? (
                      <div style={{ marginBottom: '20px' }}>
                        <FormControl className={classes.select}>
                          <InputLabel htmlFor="selectPo">ProductDetails</InputLabel>
                          <Select
                            value={productDetail === '' ? productList[0].id : productDetail}
                            onChange={(e) => this.handleSelectProduct(e.target.value)}
                            // disabled={editType === 'edit' ? true : false}
                            autoWidth
                            inputProps={{
                              className: classes.packagingSelect,
                              required: true,
                              name: 'selectPo',
                              id: 'selectPo',
                            }}
                          >
                            {productList.map((po) => {
                              return (
                                <MenuItem value={po.id} key={po.id}>
                                  {po.productDetail !== undefined && po.productDetail.replace(po.packaging, '')}
                                </MenuItem>
                              );
                            })}
                          </Select>
                        </FormControl>
                      </div>
                    ) : null}
                    <div className={editType === 'sop' ? classes.disableGrid : ''}>
                      {/* {this.props.customerOrders.filter(
                        p =>
                          p.monsantoProductId == this.state.selectedProduct.id
                      ).length > 0 ? (
                        <span style={{ fontWeight: "600" }}>
                          only quantity will increased ,this producat is already
                          added in your purchase order <br />
                        </span>
                      ) : (
                        ""
                      )} */}

                      <TextField
                        //labelText="Quantity"
                        id="quantity"
                        type="number"
                        formControlProps={{
                          required: true,
                          className: classes.formControlStyle,
                        }}
                        labelProps={{
                          className: classes.quantityLabel,
                        }}
                        inputProps={{
                          value: quantity === 0 ? '' : quantity,
                          onChange: wantToTransferAll ? '' : this.onChangeQuantity,
                          className: classes.quantityInput,
                          type: 'number',
                          step: 0.1,
                          min: 0,
                        }}
                      />
                      {selectedProduct.unit || 'units'}

                      {this.getMSRPInDollars() && <div>MSRP: {this.getMSRPInDollars()}</div>}
                      {isSeedCompnay && (
                        <div>
                          <p>Total Bags: {this.getTotalBags()} bags</p>
                          {/* <p>Previously synced Bayer Qty: {parseFloat(monsantoQty).toFixed(2)}</p> */}
                          {productAvailability && <p>Product Availability :{productAvailability}</p>}
                          {/* {ischeckingProductavaiblty && <CircularProgress />}
                        
                          {isApiSeedCompany && <Button onClick={this.checkProductavaiblty}>Check Availability</Button>}
                        
                        
                        
                        */}
                        </div>
                      )}
                      {(seedType === 'BUSINESS' || isApiSeedCompany) && (
                        <div style={{ display: 'grid' }}>
                          <TextField
                            label="Comment"
                            value={comment}
                            onChange={(e) => this.onInputChange('comment')(e)}
                          />
                          {!purchaseOrder.isSimple && (
                            <TextField
                              label="FieldName"
                              value={fieldName}
                              onChange={(e) => this.onInputChange('fieldName')(e)}
                            />
                          )}
                        </div>
                      )}

                      {((editingProduct && isApiSeedCompany && parseFloat(monsantoQty) > parseFloat(quantity)) ||
                        wantToTransferAll ||
                        (editingProduct && editingProduct.monsantoProductId !== selectedProduct.id)) &&
                        editingProduct.hasOwnProperty('monsantoProductId') &&
                        purchaseOrder.isQuote == false && (
                          <Fragment>
                            <div>
                              <Select
                                id="transferWay"
                                value={monsantoProductReduceTransferInfo.transferWay}
                                onChange={this.handeleTransferInfoChange('transferWay')}
                                autoWidth
                                inputProps={{
                                  className: classes.packagingSelect,
                                  required: true,
                                  name: 'Transfer Way',
                                  id: 'transferWay',
                                }}
                              >
                                {transferWays
                                  .filter((way) => {
                                    if (Customer.name === 'Bayer Dealer Bucket' && way.id === 'toHolding') {
                                      return false;
                                    } else if (wantToTransferAll && way.id === 'toMonsanto') {
                                      return false;
                                    } else {
                                      return true;
                                    }
                                  })
                                  .map((way) => (
                                    <MenuItem value={way.id} key={way.id} id={way.id}>
                                      {way.value}
                                    </MenuItem>
                                  ))}
                              </Select>
                            </div>

                            {monsantoProductReduceTransferInfo.transferWay === 'toGrower' && (
                              <Fragment>
                                <div>
                                  <Select
                                    id="customerSelect"
                                    value={monsantoProductReduceTransferInfo.growerInfo.customerId}
                                    onChange={this.handeleTransferInfoChange('customerId')}
                                    autoWidth
                                    inputProps={{
                                      className: classes.packagingSelect,
                                      required: true,
                                      name: 'Customer',
                                      id: 'customer',
                                    }}
                                  >
                                    {customers.length > 0 &&
                                      sortBy(customers, 'name')
                                        .filter((customer) => {
                                          if (customer.name !== 'Bayer Dealer Bucket') {
                                            return true;
                                          } else {
                                            return false;
                                          }
                                        })
                                        .map((customer, index) => (
                                          <MenuItem value={customer.id} key={customer.id} id={`customer-${index}`}>
                                            {customer.name}
                                          </MenuItem>
                                        ))}
                                  </Select>
                                </div>

                                {monsantoProductReduceTransferInfo.growerInfo.customerId &&
                                  selectedPurchaseOrders.length === 0 &&
                                  selectedPurchaseOrders.filter((po) => !po.isQuote && po.id !== purchaseOrder.id)
                                    .length === 0 && (
                                    <Button
                                      simple={true}
                                      color="primary"
                                      className={`${classes.createPO} hide-print`}
                                      onClick={this.handleCreatePurchaseOrderDialogOpen(
                                        monsantoProductReduceTransferInfo.growerInfo.customerId,
                                        false,
                                      )}

                                      // disabled={isPending(customer)}
                                    >
                                      New Purchase Order
                                    </Button>
                                  )}

                                {monsantoProductReduceTransferInfo.growerInfo.customerId &&
                                  selectedPurchaseOrders.length > 0 &&
                                  selectedPurchaseOrders.filter((po) => !po.isQuote && po.id !== purchaseOrder.id)
                                    .length !== 0 && (
                                    <div>
                                      <Select
                                        id="poSelect"
                                        value={monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId}
                                        onChange={this.handeleTransferInfoChange('purchaseOrderId')}
                                        autoWidth
                                        inputProps={{
                                          className: classes.packagingSelect,
                                          required: true,
                                          name: 'Purchase Order',
                                          id: 'purchaseOrder',
                                        }}
                                      >
                                        {selectedPurchaseOrders.length > 0 &&
                                          selectedPurchaseOrders
                                            .filter((po) => !po.isQuote && po.id !== purchaseOrder.id)
                                            .map((purchaseOrder, index) =>
                                              purchaseOrder.length !== 0 ? (
                                                <MenuItem
                                                  value={purchaseOrder.id}
                                                  key={purchaseOrder.id}
                                                  id={`po-${index}`}
                                                >
                                                  #{purchaseOrder.id} - {purchaseOrder.name}
                                                </MenuItem>
                                              ) : null,
                                            )}
                                      </Select>
                                    </div>
                                  )}

                                {monsantoProductReduceTransferInfo.growerInfo.customerId &&
                                  selectedPurchaseOrders.length > 0 &&
                                  selectedPurchaseOrders.filter(
                                    (po) =>
                                      po.id === monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId &&
                                      po.farmData.length !== 0,
                                  ).length !== 0 && (
                                    <div>
                                      <Select
                                        value={monsantoProductReduceTransferInfo.growerInfo.farmId}
                                        onChange={this.handeleTransferInfoChange('farmId')}
                                        autoWidth
                                        inputProps={{
                                          className: classes.packagingSelect,
                                          required: true,
                                          name: 'Farm name',
                                          id: 'farmname',
                                        }}
                                      >
                                        {selectedPurchaseOrders.length > 0 &&
                                          selectedPurchaseOrders
                                            .filter(
                                              (po) =>
                                                !po.isQuote &&
                                                po.farmData.length > 0 &&
                                                po.id === monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId,
                                            )
                                            .map((purchaseOrder) => {
                                              const farmNameData = [];
                                              purchaseOrder.farmData.map((data) => {
                                                const f = farmData && farmData.find((item) => item.id === data.farmId);
                                                f !== undefined && farmNameData.push(f);
                                              });

                                              return (
                                                farmNameData.length > 0 &&
                                                farmNameData.map((data, i) => {
                                                  return (
                                                    <MenuItem value={data.id} key={data.id} id={`farm-${i}`}>
                                                      #{data.id}-{data.name}
                                                    </MenuItem>
                                                  );
                                                })
                                              );
                                            })}
                                      </Select>
                                    </div>
                                  )}

                                {monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId &&
                                selectedPurchaseOrders.length > 0 &&
                                selectedPurchaseOrders
                                  .filter(
                                    (po) =>
                                      po.id === monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId &&
                                      (po.farmData.length !== 0 || po.isSimple === true) &&
                                      (monsantoProductReduceTransferInfo.growerInfo.farmId || po.isSimple === true) &&
                                      po.CustomerMonsantoProducts.length > 0,
                                  )
                                  .filter((dd) => {
                                    return (
                                      dd.CustomerMonsantoProducts.filter(
                                        (d) => d.monsantoProductId === editingProduct.monsantoProductId,
                                      ).length > 0
                                    );
                                  }).length > 0 ? (
                                  <div>
                                    <Select
                                      id="selectLine"
                                      style={{ marginBottom: '20px' }}
                                      value={monsantoProductReduceTransferInfo.growerInfo.lineItemNumber}
                                      onChange={this.handeleTransferInfoChange('lineItemNumber')}
                                      autoWidth
                                      inputProps={{
                                        className: classes.packagingSelect,
                                        required: true,
                                        name: 'Line Item Number',
                                        id: 'lineItemNumber',
                                      }}
                                    >
                                      {selectedPurchaseOrders.length > 0 &&
                                        selectedPurchaseOrders
                                          .filter(
                                            (po) =>
                                              !po.isQuote &&
                                              po.id === monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId &&
                                              po.isDeleted !== true,
                                          )
                                          .map((po) => {
                                            return po.CustomerMonsantoProducts.map((item) => {
                                              if (
                                                item.monsantoProductId === editingProduct.monsantoProductId &&
                                                item.isDeleted !== true
                                                // &&
                                                // item.orderQty > 0
                                              ) {
                                                return (
                                                  <MenuItem value={item.lineItemNumber} key={item.lineItemNumber}>
                                                    {`#${item.lineItemNumber}(${item.orderQty}Qty)`}
                                                  </MenuItem>
                                                );
                                              }
                                            });
                                          })}

                                      <MenuItem value={'newline'} key={'newline'} id={'newline'}>
                                        New Line Number
                                      </MenuItem>
                                    </Select>
                                  </div>
                                ) : null}
                              </Fragment>
                            )}
                            {monsantoProductReduceTransferInfo.transferWay === 'toHolding' && (
                              <Fragment>
                                {monsantoProductReduceTransferInfo.growerInfo.customerId && (
                                  <div>
                                    <Select
                                      value={monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId}
                                      onChange={this.handeleTransferInfoChange('purchaseOrderId')}
                                      autoWidth
                                      inputProps={{
                                        className: classes.packagingSelect,
                                        required: true,
                                        name: 'Purchase Order',
                                        id: 'purchaseOrder',
                                      }}
                                    >
                                      {customers.find((customer) => customer.name === 'Bayer Dealer Bucket')
                                        .PurchaseOrders.length > 0 &&
                                        customers
                                          .find((customer) => customer.name === 'Bayer Dealer Bucket')
                                          .PurchaseOrders.filter((po) => po.isSimple && !po.isQuote)
                                          .map((purchaseOrder) => (
                                            <MenuItem value={purchaseOrder.id} key={purchaseOrder.id}>
                                              #{purchaseOrder.id} - {purchaseOrder.name}
                                            </MenuItem>
                                          ))}
                                    </Select>
                                  </div>
                                )}

                                {monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId &&
                                selectedPurchaseOrders.length > 0 &&
                                selectedPurchaseOrders
                                  .filter(
                                    (po) =>
                                      po.id === monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId &&
                                      (po.farmData.length !== 0 || po.isSimple === true) &&
                                      (monsantoProductReduceTransferInfo.growerInfo.farmId || po.isSimple === true) &&
                                      po.CustomerMonsantoProducts.length > 0,
                                  )
                                  .filter((dd) => {
                                    return (
                                      dd.CustomerMonsantoProducts.filter(
                                        (d) => d.monsantoProductId === editingProduct.monsantoProductId,
                                      ).length > 0
                                    );
                                  }).length > 0 ? (
                                  <div>
                                    <Select
                                      value={monsantoProductReduceTransferInfo.growerInfo.lineItemNumber}
                                      onChange={this.handeleTransferInfoChange('lineItemNumber')}
                                      autoWidth
                                      inputProps={{
                                        className: classes.packagingSelect,
                                        required: true,
                                        name: 'Line Item Number',
                                        id: 'lineItemNumber',
                                      }}
                                    >
                                      {selectedPurchaseOrders.length > 0 &&
                                        selectedPurchaseOrders
                                          .filter(
                                            (po) =>
                                              !po.isQuote &&
                                              po.id === monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId &&
                                              po.isDeleted !== true,
                                          )
                                          .map((po) => {
                                            return po.CustomerMonsantoProducts.map((item) => {
                                              if (
                                                item.monsantoProductId === editingProduct.monsantoProductId &&
                                                item.isDeleted !== true
                                              ) {
                                                units.push(item.orderQty);
                                                return (
                                                  <MenuItem value={item.lineItemNumber} key={item.lineItemNumber}>
                                                    {`#${item.lineItemNumber}(${item.orderQty}Qty)`}
                                                  </MenuItem>
                                                );
                                              }
                                            });
                                          })}
                                      <MenuItem value={'newline'} key={'newline'}>
                                        New Line Number
                                      </MenuItem>
                                    </Select>
                                    <a
                                      style={{ cursor: 'pointer' }}
                                      target="_blank"
                                      href={`/app/customers/${monsantoProductReduceTransferInfo.growerInfo.customerId}/purchase_order/${monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId}`}
                                    >
                                      {`You have ${units
                                        .reduce((partialSum, a) => parseFloat(partialSum) + parseFloat(a), 0)
                                        .toFixed(
                                          2,
                                        )} units of this product in Bayer Dealer Bucket that you can transfer from instead`}
                                    </a>
                                  </div>
                                ) : null}
                              </Fragment>
                            )}
                          </Fragment>
                        )}
                    </div>
                  </div>
                )}

                {this.props.type === 'allPo' && selectedProduct !== null && (
                  <div>
                    {Object.keys(groupedData).map((pd) => {
                      const product =
                        selectedProduct.length > 1
                          ? selectedProduct.find((f) => f.zoneId[0] == pd)
                            ? selectedProduct.find((f) => f.zoneId[0] == pd)
                            : selectedProduct[0]
                          : selectedProduct;
                      let growerPrice = 0;
                      if (
                        product &&
                        product.LineItem !== null &&
                        (product.length === 1 || product.length === undefined)
                      ) {
                        if (JSON.parse(product.LineItem.suggestedEndUserPrice).hasOwnProperty('NZI')) {
                          growerPrice = JSON.parse(product.LineItem.suggestedEndUserPrice)['NZI'];
                        } else {
                          growerPrice = JSON.parse(product.LineItem.suggestedEndUserPrice)[pd];
                        }
                      } else {
                        growerPrice = 0;
                      }

                      return (
                        <div>
                          Zone {pd} : MSRP {numberToDollars(growerPrice || 0)}
                        </div>
                      );
                    })}
                    <p>Total Bags: {this.getTotalBags()} bags</p>
                    {/* <p>Previously synced Bayer Qty: {parseFloat(monsantoQty).toFixed(2)}</p> */}

                    {this.props.swapType == 'BayerDealerBucket' && (
                      <Fragment>
                        <div>
                          <Select
                            id="transferWay"
                            value={'toHolding'}
                            onChange={this.handeleTransferInfoChange('transferWay')}
                            autoWidth
                            inputProps={{
                              className: classes.packagingSelect,
                              required: true,
                              name: 'Transfer Way',
                              id: 'transferWay',
                            }}
                          >
                            <MenuItem value={'toHolding'} key={'toHolding'} id={'toHolding'}>
                              Bayer Dealer Bucket
                            </MenuItem>
                          </Select>
                        </div>
                        {monsantoProductReduceTransferInfo.transferWay === 'toHolding' && (
                          <Fragment>
                            {monsantoProductReduceTransferInfo.growerInfo.customerId && (
                              <div>
                                <Select
                                  value={monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId}
                                  onChange={this.handeleTransferInfoChange('purchaseOrderId')}
                                  autoWidth
                                  inputProps={{
                                    className: classes.packagingSelect,
                                    required: true,
                                    name: 'Purchase Order',
                                    id: 'purchaseOrder',
                                  }}
                                >
                                  {customers.find((customer) => customer.name === 'Bayer Dealer Bucket').PurchaseOrders
                                    .length > 0 &&
                                    customers
                                      .find((customer) => customer.name === 'Bayer Dealer Bucket')
                                      .PurchaseOrders.filter((po) => po.isSimple && !po.isQuote)
                                      .map((purchaseOrder, index) => (
                                        <MenuItem value={purchaseOrder.id} key={purchaseOrder.id} id={`po-${index}`}>
                                          #{purchaseOrder.id} - {purchaseOrder.name}
                                        </MenuItem>
                                      ))}
                                </Select>
                              </div>
                            )}
                          </Fragment>
                        )}
                      </Fragment>
                    )}
                  </div>
                )}
                {Object.keys(NormalCompanyProduct).length > 0 && seedType === 'BUSINESS' && (
                  <div>
                    {this.props.type !== 'allPo' && (
                      <div>
                        <div>
                          <TextField
                            //labelText="Quantity"

                            id="quantity"
                            formControlProps={{
                              required: true,
                              className: classes.formControlStyle,
                            }}
                            labelProps={{
                              className: classes.quantityLabel,
                            }}
                            inputProps={{
                              value: quantity === 0 ? '' : quantity,

                              onChange: wantToTransferAll ? '' : this.onChangeQuantity,
                              className: classes.quantityInput,
                              type: 'number',
                              step: 0.1,
                              min: 0,
                            }}
                          />

                          {'units'}

                          {this.getMSRPInDollars() && <div>MSRP: {this.getMSRPInDollars()}</div>}
                          <TextField
                            label="Comment"
                            value={comment}
                            onChange={(e) => this.onInputChange('comment')(e)}
                          />
                          {!purchaseOrder.isSimple && (
                            <TextField
                              label="FieldName"
                              value={fieldName}
                              onChange={(e) => this.onInputChange('fieldName')(e)}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ListItem>
            </List>
          </Grid>
          {showPackaging && (
            <Grid item xs={2} style={{ paddingLeft: '12px' }}>
              <FormControl style={{ marginBottom: '15px' }}>
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

              <TextField label="Comment" value={comment} onChange={(e) => this.onInputChange('comment')(e)} />
              {!purchaseOrder.isSimple && (
                <TextField label="FieldName" value={fieldName} onChange={(e) => this.onInputChange('fieldName')(e)} />
              )}
            </Grid>
          )}
        </div>

        {!editMode && (
          <Grid container className={classes.center}>
            <Button
              id="selectProduct"
              aria-label="Add Product"
              onClick={this.addProduct}
              disabled={!selectedProduct && !Object.keys(NormalCompanyProduct).length > 0}
              className={classes.button}
            >
              Select
            </Button>
          </Grid>
        )}
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showSnackbar}
          message={<span style={{ whiteSpace: 'pre-line' }}>{showSnackbarText}</span>}
          onClick={() => this.setState({ showSnackbar: false })}
          onClose={() => this.setState({ showSnackbar: false })}
        />
        {creatingPurchaseOrderCustomerId && (
          <CreatePurchaseOrderDialog
            customerId={creatingPurchaseOrderCustomerId}
            open={showCreatePurchaseOrderDialog}
            onClose={this.handleCreatePurchaseOrderDialogClose}
            isQuote={creatingPurchaseOrderIsQuote}
            fromPurchaseOrder={true}
            newCreatedPurchaseOrder={this.newCreatedPurchaseOrder}
          />
        )}
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
  changezone: PropTypes.func.isRequired,
  changequantity: PropTypes.func.isRequired,
  // provided by withStyles HoC
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ProductSelector);
