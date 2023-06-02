import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
// import SweetAlert from "react-bootstrap-sweetalert";
// import sweetAlertStyle from "assets/jss/material-dashboard-pro-react/views/sweetAlertStyle";
import flatten from 'lodash/flatten';
import { cloneDeep, isNull } from 'lodash/lang';
import { sortBy } from 'lodash';

// material-ui icons
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
// import DeleteForever from "@material-ui/icons/DeleteForever";
// import Edit from "@material-ui/icons/Edit";
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';

// core components
import ReactTable from 'react-table';
import Creatable from 'react-select/creatable';

import Button from '../../../components/material-dashboard/CustomButtons/Button';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import FormControl from '@material-ui/core/FormControl';
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';
import InputLabel from '@material-ui/core/InputLabel';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
// import Tooltip from "@material-ui/core/Tooltip";
import axios from 'axios';
import ColumnMenu from '../column_menu';
import {
  getQtyOrdered,
  getQtyShipped,
  getGrowerOrder,
  getGrowerOrderDelivered,
  getTransferInAmount,
  getTransferOutAmount,
  getCustomerProducts,
  getDeliveryLotsQtyReturn,
  getDeliveryLotsQty,
} from '../../../utilities/product';
import { createProductsFromCSV, downloadCSV } from '../../../utilities/csv';

import LotsDialog from '../lots_dialog';
import ReturnDialog from '../return_dialog/index';
import PackageDialog from '../package_dialog';
import SeedSizeDialog from '../seed_size_dialog';
import ProductDealerInfoDialog from '../product_dealer_info_dialog';
import ProductRelatedInfoDialog from '../product_related_info_dialog';
import styles from '../productTableStyles';
import moment from 'moment';
import { Checkbox } from '@material-ui/core';
import return_dialog from '../return_dialog/index';
import CircularProgress from '@material-ui/core/CircularProgress';

// import lotImg from "../../assets/img/tag.png";

const upperCase = (str) => str.replace(/(^.)/, (matchedString, first) => first.toUpperCase());

function inputComponent({ inputRef, ...props }) {
  return <div ref={inputRef} {...props} />;
}

function Control(props) {
  return (
    <TextField
      required={true}
      className={props.selectProps.classes.textField}
      fullWidth
      InputProps={{
        inputComponent,
        inputProps: {
          required: true,
          className: props.selectProps.classes.input,
          inputRef: props.innerRef,
          children: props.children,
          ...props.innerProps,
        },
      }}
      {...props.selectProps.textFieldProps}
    />
  );
}

function Option(props) {
  return (
    <MenuItem
      buttonRef={props.innerRef}
      selected={props.isFocused}
      component="div"
      value={props.data.value}
      style={{
        fontWeight: props.isSelected ? 500 : 400,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function Placeholder(props) {
  return (
    <Typography color="textSecondary" className={props.selectProps.classes.placeholder} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function SingleValue(props) {
  return (
    <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
      {props.children}
    </Typography>
  );
}

function ValueContainer(props) {
  return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
}

function Menu(props) {
  return (
    <Paper square className={props.selectProps.classes.paper} {...props.innerProps}>
      {props.children}
    </Paper>
  );
}
const components = {
  Control,
  Menu,
  Option,
  Placeholder,
  SingleValue,
  ValueContainer,
};

class ProductTable extends Component {
  constructor(props) {
    super(props);
    const { organization } = this.props;
    let selectedSeason;
    if (organization.defaultSeason) {
      selectedSeason = organization.defaultSeason;
    } else {
      selectedSeason = this.props.seasons && this.props.seasons[0] && this.props.seasons[0].id;
    }
    this.state = {
      originalColumns: [],
      columns: [],
      deliveryReceiptDetails: [],
      horizMenuOpen: false,
      selectedSeason,
      tableItemActionAnchorEl: null,
      tableItemActionMenuOpen: false,
      activeTableItem: null,
      lotsDialogOpen: false,
      lotsItem: null,
      packagesDialogOpen: false,
      seedSizesDialogOpen: false,
      originProducts: [],
      products: [],
      suggestions: [],
      isAddingSeedProduct: false,
      editItems: [],
      isChangingItemsCount: 0,
      showDetailView: false,
      selectedSeedDealer: 'ALL',
      productDealerInfoDialogOpen: false,
      productDealers: [],
      productRelatedPurchaseOrders: null,
      selectedProductRelatedPurchaseOrders: [],
      productRelatedInfoDialogOpen: false,
      productRelatedInfoDialogContext: 'purchase_orders',
      selectedProduct: null,
      expandedRows: {},
      showFavoriteProducts: false,
      returnDialogOpen: false,
      serchText: '',
      isLoading: true,
      isLoadProduct: false,
      allCustomers: [],
    };
  }

  subColumns =
    this.props.productType === 'custom'
      ? [
          {
            Header: 'Lot#',
            accessor: 'lotNumber',
          },
          {
            Header: 'Order Date',
            id: 'orderDate',
            accessor: (d) => d,
            Cell: (props) => {
              const lot = props.original;
              return moment.utc(lot.orderDate).format('YYYY-MM-DD');
            },
          },
          {
            Header: 'Source',
            accessor: 'source',
          },
          {
            Header: 'Dealer Info',
            id: 'dealerInfo',
            accessor: (d) => d,
            Cell: (props) => {
              const lot = props.original;
              const productDealer = this.props.productDealers.find(
                (productDealer) => productDealer.id === lot.dealerId,
              );
              return `Dealer Name:${productDealer ? productDealer.name : ''}`;
            },
          },
          {
            Header: 'Quantity',
            accessor: 'quantity',
          },
        ]
      : [
          {
            Header: 'Lot#',
            accessor: 'lotNumber',
          },
          {
            Header: 'Order Date',
            id: 'orderDate',
            accessor: (d) => d,
            Cell: (props) => {
              const lot = props.original;
              return moment.utc(lot.orderDate).format('YYYY-MM-DD');
            },
          },
          {
            Header: 'Source',
            accessor: 'source',
          },
          {
            Header: 'Seed Size',
            id: 'seedSize',
            accessor: (d) => d,
            Cell: (props) => {
              const { seedSizes } = this.props;
              const lot = props.original;
              const seedSize = seedSizes.find((_seedSize) => _seedSize.id === lot.seedSizeId);
              if (seedSize) return seedSize.name;
            },
          },
          {
            Header: 'Package',
            id: 'package',
            accessor: (d) => d,
            Cell: (props) => {
              const { packagings } = this.props;
              const lot = props.original;
              const packaging = packagings.find((_packaging) => _packaging.id === lot.packagingId);
              if (packaging) return packaging.name;
            },
          },
          {
            Header: 'Dealer Info',
            id: 'dealerInfo',
            accessor: (d) => d,
            Cell: (props) => {
              const lot = props.original;
              const productDealer = this.props.productDealers.find(
                (productDealer) => productDealer.id === lot.dealerId,
              );
              return lot.source === 'Seed Company'
                ? `Dealer Order:${lot.orderAmount}`
                : `Dealer Name:${productDealer ? productDealer.name : ''}`;
            },
          },
          {
            Header: 'Quantity',
            accessor: 'quantity',
          },
        ];

  print = () => {
    this.setState({ horizMenuOpen: false }, this.props.print);
  };

  renderTableData = async () => {
    const {
      customerProducts,
      deliveryReceipts,
      seedCompany,
      productType,
      isAdmin,
      selectedSeason,
      productDealers,
      seedCompanyId,
      companyId,
      customers,
      listProductPackagings,
      listProducts,
      // products,
      // company
    } = this.props;

    listProductPackagings();

    this.productsFileInput = React.createRef();

    // const { isAddingSeedProduct } = this.state;
    let products = this.props.products.filter(
      (p) => p.seedCompanyId === seedCompanyId && p.seedType.toUpperCase() === productType.toUpperCase(),
    );
    let customProducts = this.props.customProducts;
    const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));

    if (selectedSeason) {
      products = products ? products.filter((p) => p.seasonId === selectedSeason) : [];
      customProducts = customProducts ? customProducts.filter((p) => p.seasonId === selectedSeason) : [];
    }

    let productDatas =
      productType === 'custom' ? customProducts : products.filter((p) => p.seedType === productType.toUpperCase());
    const companyType = productType === 'custom' ? 'Company' : 'Seed Company';
    const dealerCompanyId = productType === 'custom' ? companyId : seedCompanyId;
    const productRelatedPurchaseOrders = getCustomerProducts(
      this.state.allCustomers,
      companyType,
      dealerCompanyId,
      deliveryReceipts,
    );

    const isSeedCompany = productType !== 'custom';
    const originProducts = JSON.parse(JSON.stringify(productDatas));
    const showFavoriteProducts = window.localStorage.getItem('INVENTORY_SHOW_FAVORITE_PRODUCTS') === 'true';
    const showDetailView = window.localStorage.getItem('INVENTORY_SHOW_DETAIL_VIEW') === 'true';

    this.setState(
      {
        showDetailView,
        showFavoriteProducts,
        productRelatedPurchaseOrders,
        originProducts,
        products: isSeedCompany ? this.getSortData(originProducts) : originProducts,
        isChangingItemsCount: 0,
        productDealers: productDealers
          .filter(
            (productDealer) => productDealer.companyType === companyType && productDealer.companyId === dealerCompanyId,
          )
          .sort((a, b) => a.id - b.id),
      },
      () => {
        this.setTableTotalData();
        showDetailView && this.setDefaultExpandedRows();
      },
    );

    if (productType === 'custom') {
      const { classes } = this.props;
      const suggestionsSet = this.props.customProducts
        .filter((c) => c.companyId == companyId)
        .reduce(
          (obj, value) => {
            if (value.name !== null) {
              obj.name.add(value.name);
            }
            if (value.type !== null) {
              obj.type.add(value.type);
            }
            if (value.description !== null) {
              obj.description.add(value.description);
            }

            return obj;
          },
          {
            name: new Set(),
            type: new Set(),
            description: new Set(),
            // dealerPrice: new Set()
          },
        );
      // remove dupes and tranform into format used by React Select
      const formatData = (item) => ({ value: item, label: item });
      const suggestions = {
        name: [...suggestionsSet.name].map(formatData),
        type: [...suggestionsSet.type].map(formatData),
        description: [...suggestionsSet.description].map(formatData),
      };

      this.setState({
        suggestions,
      });

      const selectStyles = {
        input: (base) => ({
          ...base,
          '& input': {
            font: 'inherit',
          },
        }),
        menu: (styles) => ({ ...styles, zIndex: '1000 !important' }),
        paper: (styles) => ({ ...styles, zIndex: '1000 !important' }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      };

      let columns = [
        {
          Header: '',
          id: 'actions',
          show: isAdmin === true || isAdmin === 'true' ? true : false,
          headerClassName: 'hide-print',
          className: 'hide-print',
          headerStyle: {
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          accessor: (d) => d,
          maxWidth: 60,
          sortable: false,
          Cell: (props) => {
            const item = props.value;
            const canAdd = item.name !== '' && item.type !== '';
            if (props.value.Product === '-') return null;

            return (
              <React.Fragment>
                {props.value.isChanging ? (
                  <React.Fragment>
                    <IconButton
                      id="addNonBayerProduct"
                      onClick={() => {
                        this.updateCompanyProduct(props.value);
                      }}
                      style={canAdd ? { color: 'green' } : { color: 'grey' }}
                      disabled={!canAdd}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      id="removeNonBayerProduct"
                      onClick={() => {
                        this.onCancel(props.value);
                      }}
                      style={{ color: 'red' }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </React.Fragment>
                ) : (
                  <IconButton
                    id={`productId-${item.id}`}
                    aria-label="show Menu"
                    onClick={this.handleTableItemActionMenuOpen(props.value)}
                    style={{ color: 'rgb(56, 161, 84)' }}
                  >
                    <MoreHorizontalIcon fontSize="small" />
                  </IconButton>
                )}
              </React.Fragment>
            );
          },
        },
        {
          Header: 'Product',
          id: 'name',
          headerStyle: {
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          sortMethod: (a, b) => {
            return a.name.localeCompare(b.name);
          },
          accessor: (d) => d,
          sortable: true,
          Cell: (props) => {
            if (props.value.Product === '-') return '-';

            const name = this.state.products.find((product) => product.id === props.value.id).name;
            return props.value.isChanging ? (
              <div>
                <Creatable
                  backspaceRemovesValue={false}
                  isClearable={true}
                  classes={classes}
                  styles={selectStyles}
                  components={components}
                  onChange={this.handleProductsChange('name', props.value)}
                  onInputChange={this.handleProductsInputChange('name', props.value)}
                  placeholder="Product Name"
                  options={suggestions.name}
                  isValidNewOption={() => true}
                  //isDisabled={false}
                  value={{ label: name, value: name }}
                  textFieldProps={{
                    id: 'regularProductName',
                    label: 'Name',
                    InputLabelProps: {
                      shrink: true,
                    },
                  }}
                  menuPortalTarget={document.body}
                  menuPosition={'absolute'}
                />
              </div>
            ) : (
              <div>{props.value.name}</div>
            );
          },
        },
        {
          Header: 'Type',
          id: 'type',
          headerStyle: {
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          sortMethod: (a, b) => {
            return a.type.localeCompare(b.type);
          },
          accessor: (d) => d,
          sortable: true,
          Cell: (props) => {
            if (props.value.Product === '-') return '-';

            const type = this.state.products.find((product) => product.id === props.value.id).type;
            return props.value.isChanging ? (
              <div>
                <Creatable
                  backspaceRemovesValue={false}
                  isClearable={true}
                  classes={classes}
                  styles={selectStyles}
                  components={components}
                  onChange={this.handleProductsChange('type', props.value)}
                  onInputChange={this.handleProductsInputChange('type', props.value)}
                  placeholder="Product Type"
                  options={suggestions.type}
                  isValidNewOption={() => true}
                  value={{ label: type, value: type }}
                  textFieldProps={{
                    id: 'productType',
                    label: 'Type',
                    InputLabelProps: {
                      shrink: true,
                    },
                  }}
                  menuPortalTarget={document.body}
                  menuPosition={'absolute'}
                />
              </div>
            ) : (
              <div>{props.value.type || '-'}</div>
            );
          },
        },
        {
          Header: 'Description',
          id: 'description',
          headerStyle: {
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          sortMethod: (a, b) => {
            return a.description.localeCompare(b.description);
          },
          accessor: (d) => d,
          sortable: true,
          Cell: (props) => {
            if (props.value.Product === '-') return '-';

            const description = this.state.products.find((product) => product.id === props.value.id).description;
            return props.value.isChanging ? (
              <div style={{}}>
                <Creatable
                  backspaceRemovesValue={false}
                  isClearable={true}
                  classes={classes}
                  styles={selectStyles}
                  components={components}
                  onChange={this.handleProductsChange('description', props.value)}
                  onInputChange={this.handleProductsInputChange('description', props.value)}
                  placeholder="Product Description"
                  options={suggestions.description}
                  isValidNewOption={() => true}
                  value={{ label: description, value: description }}
                  textFieldProps={{
                    id: 'productDescription',
                    label: 'Description',
                    InputLabelProps: {
                      shrink: true,
                    },
                  }}
                  menuPortalTarget={document.body}
                  menuPosition={'absolute'}
                />
              </div>
            ) : (
              <div>{props.value.description || '-'}</div>
            );
          },
        },
        {
          Header: 'DealerPrice',
          id: 'dealerPrice',
          headerStyle: {
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          sortMethod: (a, b) => {
            return a.dealerPrice.localeCompare(b.dealerPrice);
          },
          accessor: (d) => d,
          sortable: true,
          Cell: (props) => {
            if (props.value.Product === '-') return props.value.DealerPrice;

            return props.value.isChanging ? (
              <React.Fragment>
                <FormControl>
                  <CustomInput
                    id={'dealerPrice'}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      type: 'number',
                      value: props.value.dealerPrice,
                      onChange: this.handleProductsInputChange('dealerPrice', props.value),
                      name: 'dealerPrice',
                    }}
                  />
                </FormControl>
              </React.Fragment>
            ) : (
              <div>{props.value.dealerPrice === null ? 0 : props.value.dealerPrice}</div>
            );
          },
        },
        {
          Header: 'ID',
          id: 'customId',
          headerStyle: {
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          sortMethod: (a, b) => {
            return a.customId.localeCompare(b.customId);
          },
          accessor: (d) => d,
          sortable: true,
          Cell: (props) => {
            if (props.value.Product === '-') return '-';

            return props.value.isChanging ? (
              <React.Fragment>
                <FormControl>
                  <CustomInput
                    id={'customId'}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      type: 'text',
                      value: props.value.customId,
                      onChange: this.handleProductsInputChange('customId', props.value),
                      name: 'customId',
                    }}
                  />
                </FormControl>
              </React.Fragment>
            ) : (
              <div>{props.value.customId || '-'}</div>
            );
          },
        },
        {
          Header: 'Unit',
          id: 'unit',
          headerStyle: {
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          sortMethod: (a, b) => {
            return a.unit.localeCompare(b.unit);
          },
          accessor: (d) => d,
          sortable: true,
          Cell: (props) => {
            if (props.value.Product === '-') return props.value.Unit;

            return props.value.isChanging ? (
              <React.Fragment>
                <FormControl>
                  <CustomInput
                    id={'unit'}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      type: 'text',
                      value: props.value.unit,
                      onChange: this.handleProductsInputChange('unit', props.value),
                      name: 'unit',
                    }}
                  />
                </FormControl>
              </React.Fragment>
            ) : (
              <div>{props.value.unit || '-'}</div>
            );
          },
        },
        {
          Header: 'Cost per unit',
          id: 'costUnit',
          headerStyle: {
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          sortMethod: (a, b) => {
            return parseFloat(a.costUnit) - parseFloat(b.costUnit);
          },
          accessor: (d) => d,
          sortable: true,
          Cell: (props) => {
            if (props.value.Product === '-') return props.value.Costperunit;

            return props.value.isChanging ? (
              <React.Fragment>
                <FormControl>
                  <CustomInput
                    id={'costUnit'}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      type: 'number',
                      value: props.value.costUnit,
                      onChange: this.handleProductsInputChange('costUnit', props.value),
                      name: 'costUnit',
                    }}
                  />
                </FormControl>
              </React.Fragment>
            ) : (
              <div>{props.value.costUnit || '-'}</div>
            );
          },
        },
        {
          Header: 'Quantity',
          id: 'quantity',
          headerStyle: {
            textAlign: 'left',
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          sortMethod: (a, b) => {
            return a.quantity - b.quantity;
          },
          accessor: (d) => d,
          sortable: true,
          Cell: (props) => {
            if (props.value.Product === '-') return props.value.Quantity;

            return props.value.isChanging ? (
              <React.Fragment>
                <FormControl>
                  <TextField
                    id={'quantity'}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      type: 'number',
                      value: props.value.quantity === 0 ? '' : props.value.quantity,
                      onChange: this.handleProductsInputChange('quantity', props.value),
                      name: 'quantity',
                      step: 0.1,
                      min: 0,
                    }}
                  />
                </FormControl>
              </React.Fragment>
            ) : (
              <div>{props.value.quantity || '-'}</div>
            );
          },
        },
      ];
      this.setState({ columns, originalColumns: columns });
    } else {
      const metadata = JSON.parse(seedCompany.metadata);
      let columns = [
        {
          Header: '',
          id: 'favorite',
          show: 'true',
          headerClassName: 'hide-print',
          className: 'hide-print',
          accessor: (d) => d,
          maxWidth: 30,
          sortable: false,
          Cell: (props) => {
            const item = props.value;
            if (item.hasOwnProperty('seedCompanyTotalOrder')) return null;
            return item.isFavorite ? (
              <StarIcon
                id="StarIcon"
                style={{ color: '#38A154', fontSize: 20 }}
                onClick={() => {
                  this.updateSeedCompanyProductIsFavorite({
                    ...item,
                    isFavorite: false,
                  });
                }}
              />
            ) : (
              <StarBorderIcon
                id="StarIcon"
                style={{ color: '#38A154', fontSize: 20 }}
                onClick={() => {
                  this.updateSeedCompanyProductIsFavorite({
                    ...item,
                    isFavorite: true,
                  });
                }}
              />
            );
          },
        },
      ];
      const { classes } = this.props;

      const suggestionsSet = this.props.products
        .filter((p) => p.seedCompanyId == seedCompany.id && this.props.productType.toUpperCase() == p.seedType)
        .reduce(
          (obj, value) => {
            if (value.brand !== null) {
              obj.brand.add(value.brand);
            }
            if (value.blend !== null) {
              obj.blend.add(value.blend);
            }
            if (value.treatment !== null) {
              obj.treatment.add(value.treatment);
            }
            if (value.seedSource !== null) {
              obj.seedSource.add(value.seedSource);
            }

            return obj;
          },
          {
            brand: new Set(),
            blend: new Set(),
            treatment: new Set(),
            seedSource: new Set(),
          },
        );

      // remove dupes and tranform into format used by React Select
      const formatData = (item) => ({ value: item, label: item });

      const suggestions = {
        brand: [...suggestionsSet.brand].map(formatData),
        blend: [...suggestionsSet.blend].map(formatData),
        treatment: [...suggestionsSet.treatment].map(formatData),
        seedSource: [...suggestionsSet.seedSource].map(formatData),
      };

      this.setState({
        suggestions,
      });

      const selectStyles = {
        input: (base) => ({
          ...base,
          '& input': {
            font: 'inherit',
          },
        }),
        menu: (styles) => ({ ...styles, zIndex: '1000 !important' }),
        paper: (styles) => ({ ...styles, zIndex: '1000 !important' }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
      };

      columns.push({
        Header: '',
        id: 'actions',
        show: isAdmin === true || isAdmin === 'true',
        headerClassName: 'hide-print',
        className: 'hide-print',
        accessor: (d) => d,
        maxWidth: 40,
        sortable: false,
        Cell: (props) => {
          const item = props.value;

          if (item.hasOwnProperty('seedCompanyTotalOrder')) return null;
          const canAdd =
            (metadata[productType]['brand'] ? item.brand !== '' : true) &&
            (metadata[productType]['blend'] ? item.blend !== '' : true) &&
            (metadata[productType]['treatment'] ? item.treatment !== '' : true) &&
            (metadata[productType]['msrp'] ? item.msrp !== '' : true) &&
            item.dealerPrice !== '' &&
            (metadata[productType]['seedSource'] ? item.seedSource !== '' : true);
          return (
            <React.Fragment>
              {item.isChanging ? (
                <React.Fragment>
                  <IconButton
                    onClick={() => {
                      this.updateSeedCompanyProduct(item);
                    }}
                    className={classes.onSaveButton}
                    style={canAdd ? { color: 'green' } : { color: 'grey' }}
                    disabled={!canAdd}
                    id="add"
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    className={classes.onSaveButton}
                    style={{ color: 'red' }}
                    onClick={() => {
                      this.onCancel(item);
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </React.Fragment>
              ) : (
                <IconButton
                  id={`productId-${item.id}`}
                  aria-label="delete"
                  onClick={this.handleTableItemActionMenuOpen(item)}
                  style={{ color: 'rgb(56, 161, 84)' }}
                >
                  <MoreHorizontalIcon fontSize="small" />
                </IconButton>
              )}
            </React.Fragment>
          );
        },
      });

      const addField = (field, content) => {
        if (field === 'dealerPrice') {
          columns.push(content);
        } else {
          if (!metadata[productType][field]) return;
          columns.push(content);
        }
      };

      addField('brand', {
        Header: 'Trait',
        id: 'brand',
        show: true,

        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        sortMethod: (a, b) => {
          if (!a.brand) return a;
          if (!b.brand) return b;
          return a.brand.localeCompare(b.brand);
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return item.Trait;
          const brand = this.state.products.find((product) => product.id === item.id).brand;
          return item.isChanging ? (
            item.seedType !== 'SORGHUM' && (
              <div style={{}}>
                <Creatable
                  backspaceRemovesValue={false}
                  isClearable={true}
                  classes={classes}
                  styles={selectStyles}
                  components={components}
                  onChange={this.handleSeedCompanyProductsChange('brand', item)}
                  onInputChange={this.handleSeedCompanyProductsInputChange('brand', item)}
                  placeholder="Trait Type"
                  options={suggestions.brand}
                  isValidNewOption={() => true}
                  isDisabled={!item.seedType}
                  value={{ label: brand, value: brand }}
                  textFieldProps={{
                    id: 'trait',
                    label: 'Trait',
                    InputLabelProps: {
                      shrink: true,
                    },
                  }}
                  menuPortalTarget={document.body}
                  menuPosition={'absolute'}
                />
              </div>
            )
          ) : (
            <div>{item.brand}</div>
          );
        },
      });
      addField('blend', {
        Header: 'Variety',
        id: 'blend',

        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        show: true,
        sortMethod: (a, b) => {
          if (!a.blend) return a;
          if (!b.blend) return b;
          return a.blend.localeCompare(b.blend);
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return item.Variety;
          return item.isChanging ? (
            <div>
              <Creatable
                backspaceRemovesValue={false}
                isClearable={true}
                classes={classes}
                styles={selectStyles}
                components={components}
                onChange={this.handleSeedCompanyProductsChange('blend', item)}
                onInputChange={this.handleSeedCompanyProductsInputChange('blend', item)}
                placeholder="Variety Type"
                options={suggestions.blend}
                isValidNewOption={() => true}
                isDisabled={!item.seedType}
                value={{ label: item.blend, value: item.blend }}
                textFieldProps={{
                  id: 'variety',
                  label: 'Variety',
                  InputLabelProps: {
                    shrink: true,
                  },
                }}
                menuPortalTarget={document.body}
                menuPosition={'absolute'}
              />
            </div>
          ) : (
            <div>{item.blend}</div>
          );
        },
      });
      addField('rm', {
        Header: 'RM',

        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        id: 'rm',
        show: true,
        sortMethod: (a, b) => {
          if (!a.rm) return a;
          if (!b.rm) return b;
          return a - b;
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return item.RM;
          return item.isChanging ? (
            <FormControl className={classes.formControl}>
              <CustomInput
                labelText="RM"
                id="rm"
                formControlProps={{
                  fullWidth: true,
                  required: false,
                }}
                inputProps={{
                  value: item.rm,
                  type: 'number',
                  onChange: this.handleSeedCompanyProductsInputChange('rm', item),
                  name: 'rm',
                }}
              />
            </FormControl>
          ) : (
            <div>{item.rm}</div>
          );
        },
      });
      addField('dealerPrice', {
        Header: 'DealerPrice',

        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        id: 'dealerPrice',
        show: true,
        sortMethod: (a, b) => {
          if (!a.dealerPrice) return a;
          if (!b.dealerPrice) return b;
          return a - b;
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return item.dealerPricetotal;
          return item.isChanging ? (
            <FormControl className={classes.formControl}>
              <CustomInput
                labelText="dealerPrice"
                id="dealerPrice"
                formControlProps={{
                  fullWidth: true,
                  required: false,
                }}
                inputProps={{
                  value: item.dealerPrice,
                  type: 'number',
                  onChange: this.handleSeedCompanyProductsInputChange('dealerPrice', item),
                  name: 'dealerPrice',
                }}
              />
            </FormControl>
          ) : (
            <div>{item.dealerPrice === null ? 0 : item.dealerPrice}</div>
          );
        },
      });
      addField('treatment', {
        Header: 'Treatment',
        id: 'treatment',
        show: true,
        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        sortMethod: (a, b) => {
          if (!a.treatment) return a;
          if (!b.treatment) return b;
          return a.treatment.localeCompare(b.treatment);
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return item.Treatment;
          return item.isChanging ? (
            <div>
              <Creatable
                backspaceRemovesValue={false}
                isClearable={true}
                classes={classes}
                styles={selectStyles}
                components={components}
                onChange={this.handleSeedCompanyProductsChange('treatment', item)}
                onInputChange={this.handleSeedCompanyProductsInputChange('treatment', item)}
                placeholder="Treatment Type"
                options={suggestions.treatment}
                isValidNewOption={() => true}
                isDisabled={!item.seedType}
                value={{
                  label: item.treatment,
                  value: item.treatment,
                }}
                textFieldProps={{
                  id: 'treatment',
                  label: 'Treatment',
                  InputLabelProps: {
                    shrink: true,
                  },
                }}
                menuPortalTarget={document.body}
                menuPosition={'absolute'}
              />
            </div>
          ) : (
            <div>{item.treatment}</div>
          );
        },
      });
      addField('msrp', {
        Header: 'MSRP',
        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        id: 'msrp',
        // className: "hide-print",
        show: true,
        sortMethod: (a, b) => {
          if (!a.msrp) return a;
          if (!b.msrp) return b;
          return a.msrp - b.msrp;
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return item.MSRP;
          return item.isChanging ? (
            <FormControl className={classes.formControl}>
              <CustomInput
                labelText="MSRP"
                id="msrp"
                formControlProps={{
                  fullWidth: true,
                  required: true,
                }}
                inputProps={{
                  value: item.msrp,
                  type: 'number',
                  onChange: this.handleSeedCompanyProductsInputChange('msrp', item),
                  name: 'msrp',
                }}
              />
            </FormControl>
          ) : (
            <div>{item.msrp}</div>
          );
        },
      });
      addField('seedSource', {
        Header: 'Seed Source',
        id: 'seedSource',
        show: true,
        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        sortMethod: (a, b) => {
          if (!a.seedSource) return a;
          if (!b.seedSource) return b;
          return a.seedSource.localeCompare(b.seedSource);
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          return item.isChanging ? (
            <div>
              <Creatable
                backspaceRemovesValue={false}
                isClearable={true}
                classes={classes}
                styles={selectStyles}
                components={components}
                onChange={this.handleSeedCompanyProductsChange('seedSource', item)}
                onInputChange={this.handleSeedCompanyProductsInputChange('seedSource', item)}
                placeholder="Seed Source"
                options={suggestions.seedSource}
                isValidNewOption={() => true}
                isDisabled={!item.seedType}
                value={{
                  label: item.seedSource,
                  value: item.seedSource,
                }}
                textFieldProps={{
                  label: 'Seed Source',
                  InputLabelProps: {
                    shrink: true,
                  },
                }}
                menuPortalTarget={document.body}
                menuPosition={'absolute'}
              />
            </div>
          ) : (
            <div>{item.seedSource}</div>
          );
        },
      });

      columns.push({
        Header: () => (
          <div>
            Seed Company/
            <br />
            Ordered
          </div>
        ),
        headerTitle: 'Seed Company/Ordered',
        width: 130,
        show: true,
        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        id: 'qtyOrderedFromSeedCo',
        sortMethod: (a, b) => {
          if (a.hasOwnProperty('seedCompanyTotalOrder')) return a;
          if (b.hasOwnProperty('seedCompanyTotalOrder')) return b;
          return getQtyOrdered(a) - getQtyOrdered(b);
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return item.seedCompanyTotalOrder;
          return getQtyOrdered(item);
        },
      });

      columns.push({
        Header: () => (
          <div>
            Seed Company/
            <br />
            Shipped/Unshipped
          </div>
        ),
        width: 140,

        headerTitle: 'Seed Company/Shipped/Unsh',
        id: 'qty-shipped-from-seed-co',
        show: true,
        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        sortMethod: (a, b) => {
          if (a.hasOwnProperty('seedCompanyTotalOrder')) return a;
          if (b.hasOwnProperty('seedCompanyTotalOrder')) return b;
          return getQtyShipped(a) - getQtyShipped(b);
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder'))
            return `${item.seedCompanyTotalShipped}/${item.seedCompanyTotalUnShipped}`;
          const shipped = getQtyShipped(item),
            unshipped = getQtyOrdered(item) - getQtyShipped(item);

          return `${shipped.toFixed(2)}/${unshipped.toFixed(2)}`;
        },
      });

      columns.push({
        Header: () => (
          <div>
            Grower/
            <br />
            Ordered
          </div>
        ),
        id: 'growerOrder',
        headerTitle: 'Grower/Ordered',
        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        show: true,
        sortMethod: (a, b) => {
          if (a.hasOwnProperty('seedCompanyTotalOrder')) return a;
          if (b.hasOwnProperty('seedCompanyTotalOrder')) return b;
          const posA = productRelatedPurchaseOrders[a.id];
          const filteredProductsA = customerProducts.filter((cp) => {
            if (posA === undefined) return false;
            return posA
              .filter((p) => p.purchaseOrder.isQuote === false) // filter out quotes
              .map((p) => p.purchaseOrder.id)
              .includes(cp.purchaseOrderId);
          });
          const posB = productRelatedPurchaseOrders[b.id];
          const filteredProductsB = customerProducts.filter((cp) => {
            if (posB === undefined) return false;
            return posB
              .filter((p) => p.purchaseOrder.isQuote === false) // filter out quotes
              .map((p) => p.purchaseOrder.id)
              .includes(cp.purchaseOrderId);
          });
          const growerOrder = getGrowerOrder(a, filteredProductsA) - getGrowerOrder(b, filteredProductsB);
          return growerOrder;
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return item.growerTotalOrder;

          // filter out products from archived purchase orders
          const pos = productRelatedPurchaseOrders[item.id];

          const filteredProducts = customerProducts.filter((cp) => {
            if (pos === undefined) return false;
            return pos
              .filter((p) => p.purchaseOrder.isQuote === false) // filter out quotes
              .map((p) => p.purchaseOrder.id)
              .includes(cp.purchaseOrderId);
          });
          const growerOrder = getGrowerOrder(item, filteredProducts);

          return growerOrder.toFixed(2);
        },
      });

      columns.push({
        Header: () => (
          <div>
            Grower/
            <br />
            Shipped/Unshipped
          </div>
        ),
        width: 140,

        id: 'deliveredGrowerOrder',
        headerTitle: 'Grower/Shipped/Unsh',
        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        show: true,
        sortMethod: (a, b) => {
          if (a.hasOwnProperty('seedCompanyTotalOrder')) return a;
          if (b.hasOwnProperty('seedCompanyTotalOrder')) return b;
          return (
            getGrowerOrderDelivered(a, deliveryReceiptDetails) - getGrowerOrderDelivered(b, deliveryReceiptDetails)
          );
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder'))
            return `${item.growerTotalShipped}/${item.growerTotalUnShipped}`;
          const shipped = getGrowerOrderDelivered(item, deliveryReceiptDetails),
            unshipped = customerProducts
              .filter((order) => {
                if (productRelatedPurchaseOrders[item.id] === undefined) return false;
                return productRelatedPurchaseOrders[item.id]
                  .filter((p) => p.purchaseOrder.isQuote === false) // filter out quotes
                  .map((p) => p.purchaseOrder.id)
                  .includes(order.purchaseOrderId);
              })
              .filter((order) => order.productId === item.id)
              .reduce((unDelivered, acc) => unDelivered + (acc.orderQty - acc.amountDelivered), 0);

          return `${shipped.toFixed(2)}/${unshipped.toFixed(2)}`;
        },
      });

      columns.push({
        Header: () => (
          <div>
            Seed Dealer/
            <br />
            Transfer In/Out
          </div>
        ),
        id: 'seedDealerTransfer',
        headerTitle: 'Seed Dealer Transfer/In/Out',
        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        show: true,
        width: 140,

        sortMethod: (a, b) => {
          if (a.hasOwnProperty('seedCompanyTotalOrder')) return a;
          if (b.hasOwnProperty('seedCompanyTotalOrder')) return b;
          return getTransferInAmount(a) - getTransferInAmount(b);
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder'))
            return `${item.seedDealerTotalTransferIn}/${item.seedDealerTotalTransferOut}`;
          const transferIn = getTransferInAmount(item),
            transferOut = getTransferOutAmount(item);
          return `${transferIn.toFixed(2)}/${transferOut.toFixed(2)}`;
        },
      });

      addField('longShort', {
        Header: 'Long / Short',
        show: true,
        //headerStyle: styles.columnHeaderOverride,
        id: 'longShort',
        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        sortMethod: (a, b) => {
          if (a.hasOwnProperty('seedCompanyTotalOrder')) return a;
          if (b.hasOwnProperty('seedCompanyTotalOrder')) return b;
          const posA = productRelatedPurchaseOrders[a.id];
          const filteredProductsA = customerProducts.filter((cp) => {
            if (posA === undefined) return false;
            return posA
              .filter((p) => p.purchaseOrder.isQuote === false) // filter out quotes
              .map((p) => p.purchaseOrder.id)
              .includes(cp.purchaseOrderId);
          });
          const posB = productRelatedPurchaseOrders[b.id];
          const filteredProductsB = customerProducts.filter((cp) => {
            if (posB === undefined) return false;
            return posB
              .filter((p) => p.purchaseOrder.isQuote === false) // filter out quotes
              .map((p) => p.purchaseOrder.id)
              .includes(cp.purchaseOrderId);
          });
          console.log(typeof getGrowerOrder(a, filteredProductsA));
          return (
            getQtyOrdered(a) -
            getGrowerOrder(a, filteredProductsA) -
            (getQtyOrdered(b) - getGrowerOrder(b, filteredProductsB))
          );
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return item.longShorttotal;
          // filter out products from archived purchase orders
          const pos = productRelatedPurchaseOrders[item.id];
          const filteredProducts = customerProducts.filter((cp) => {
            if (pos === undefined) return true;
            return pos
              .filter((p) => p.purchaseOrder.isQuote === false) // filter out quotes
              .map((p) => p.purchaseOrder.id)
              .includes(cp.purchaseOrderId);
          });
          const longShort = getQtyOrdered(item) - getGrowerOrder(item, filteredProducts);
          return longShort.toFixed(2);
        },
      });
      addField('qtyWarehouse', {
        Header: (
          <p>
            Warehouse/<br></br>On-hand
          </p>
        ),
        show: true,
        //headerStyle: styles.columnHeaderOverride,
        headerStyle: {
          textAlign: 'left',
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        id: 'availableQuantity',
        width: 140,

        sortMethod: (a, b) => {
          if (a.hasOwnProperty('seedCompanyTotalOrder')) return a;
          if (b.hasOwnProperty('seedCompanyTotalOrder')) return b;
          return (
            getQtyShipped(a) +
            getTransferInAmount(a) -
            getTransferOutAmount(a) -
            getGrowerOrderDelivered(a, deliveryReceiptDetails) -
            (getQtyShipped(b) +
              getTransferInAmount(b) -
              getTransferOutAmount(b) -
              getGrowerOrderDelivered(b, deliveryReceiptDetails))
          );
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return item.warehouseTotal;
          const quatityID = deliveryReceiptDetails.filter((data) => data.productId === item.id);
          const deliveryQtyisReturn = getDeliveryLotsQtyReturn(quatityID, deliveryReceipts); //delivery Return value
          const deliveryQty = getDeliveryLotsQty(quatityID, deliveryReceipts);

          return (
            getQtyShipped(item) +
            getTransferInAmount(item) -
            getTransferOutAmount(item) -
            deliveryQty +
            deliveryQtyisReturn
          );
        },
      });
      const localColumns = JSON.parse(window.localStorage.getItem('INVENTORY_SHOW_COLUMNS'));

      if (localColumns)
        columns = columns.map((column, index) => {
          return {
            ...column,
            show: localColumns[index] && localColumns[index].show,
          };
        });
      this.setState({
        columns: columns,
        originalColumns: columns,
      });
    }
  };
  componentDidMount = async () => {
    await this.props.listProducts();
    await this.props.listDeliveryReceipts();
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        this.setState({ allCustomers: response.data.customersdata });
      });

    this.renderTableData();
    setTimeout(() => {
      this.setState({ isLoading: false });
    }, 5000);
  };

  componentDidUpdate(prevProps, prevState) {
    const { productType } = this.props;
    if (this.props.products !== prevProps.products) {
      this.renderTableData();
      this.setState({ isLoading: false });
    }
    if (prevProps.deliveryReceipts !== this.props.deliveryReceipts) {
      this.renderTableData();
      this.setState({ isLoading: false });
    }
    if (this.state.products !== prevState.products && this.state.products) {
      // take selected seedType and create suggestions for dropdown menus
      let suggestions;
      if (productType === 'custom') {
        const suggestionsSet = this.state.products.reduce(
          (obj, value) => {
            if (value.name !== null) {
              obj.name.add(value.name);
            }
            if (value.type !== null) {
              obj.type.add(value.type);
            }
            if (value.description !== null) {
              obj.description.add(value.description);
            }
            return obj;
          },
          {
            name: new Set(),
            type: new Set(),
            description: new Set(),
          },
        );
        // remove dupes and tranform into format used by React Select
        const formatData = (item) => ({ value: item, label: item });
        suggestions = {
          name: [...suggestionsSet.name].map(formatData),
          type: [...suggestionsSet.type].map(formatData),
          description: [...suggestionsSet.description].map(formatData),
        };
      } else {
        const suggestionsSet = this.state.products.reduce(
          (obj, value) => {
            if (value.brand !== null) {
              obj.brand.add(value.brand);
            }
            if (value.blend !== null) {
              obj.blend.add(value.blend);
            }
            if (value.treatment !== null) {
              obj.treatment.add(value.treatment);
            }

            return obj;
          },
          { brand: new Set(), blend: new Set(), treatment: new Set() },
        );

        // remove dupes and tranform into format used by React Select
        const formatData = (item) => ({ value: item, label: item });

        suggestions = {
          brand: [...suggestionsSet.brand].map(formatData),
          blend: [...suggestionsSet.blend].map(formatData),
          treatment: [...suggestionsSet.treatment].map(formatData),
        };
      }

      this.setState({
        suggestions,
      });
    }
  }

  handleProductsInputChange = (field, currentProduct) => (data) => {
    const value =
      field === 'customId' ||
      field === 'unit' ||
      field === 'costUnit' ||
      field === 'quantity' ||
      field === 'dealerPrice'
        ? data.target.value
        : data.value;

    if (value == null) return;
    let products = this.state.products;
    switch (field) {
      case 'name':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.name = value;
            product.isChanging = true;
          });
        break;
      case 'type':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.type = value;
            product.isChanging = true;
          });
        break;
      case 'description':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.description = value;
            product.isChanging = true;
          });
        break;
      case 'customId':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.customId = value;
            product.isChanging = true;
          });
        break;
      case 'unit':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.unit = value;
            product.isChanging = true;
          });
        break;
      case 'costUnit':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.costUnit = value;
            product.isChanging = true;
          });
        break;
      case 'quantity':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.quantity = value;
            product.isChanging = true;
          });
        break;
      case 'dealerPrice':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.dealerPrice = value;
            product.isChanging = true;
          });
        break;

      default:
        break;
    }
    this.setState({
      products: products,
    });
  };

  handleProductsChange = (field, currentProduct) => (data) => {
    if (!data) data = {};
    let products = this.state.products;

    const { value } = data;
    switch (field) {
      case 'name':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.name = value;
            product.isChanging = true;
          });
        break;
      case 'type':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.type = value;
            product.isChanging = true;
          });
        break;
      case 'description':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.description = value;
            product.isChanging = true;
          });
        break;
      case 'customId':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.customId = value;
            product.isChanging = true;
          });
        break;
      case 'unit':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.unit = value;
            product.isChanging = true;
          });
        break;
      case 'costUnit':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.costUnit = value;
            product.isChanging = true;
          });
        break;
      case 'quantity':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.quantity = value;
            product.isChanging = true;
          });
        break;
      case 'dealerPrice':
        products
          .filter((product) => product.id === currentProduct.id && product.Product !== '-')
          .forEach((product) => {
            product.dealerPrice = value;
            product.isChanging = true;
          });
        break;

      default:
        break;
    }
    this.setState({
      products: products,
    });
  };

  getRmForProduct = (product) => {
    let str = '';
    let match = product.blend && product.blend.match(/DKC[0-9]*-/);
    if (match) {
      let i = match[0].replace('DKC', '').replace('-', '');
      str = parseInt(i, 0) + 50;
    }
    return str;
  };

  handleSeedCompanyProductsInputChange = (field, currentProduct) => (data) => {
    let value = field === 'msrp' || field === 'rm' || field === 'dealerPrice' ? data.target.value : data.value;

    if (value == null) return;
    let products = this.state.products;
    switch (field) {
      case 'brand':
        products
          .filter((product) => product.id === currentProduct.id && !product.hasOwnProperty('seedCompanyTotalOrder'))
          .forEach((product) => {
            product.brand = value;
            product.isChanging = true;
          });
        break;
      case 'blend':
        products
          .filter((product) => product.id === currentProduct.id && !product.hasOwnProperty('seedCompanyTotalOrder'))
          .forEach((product) => {
            product.blend = value;
            let rm = this.getRmForProduct(product);
            product.rm = rm;
            product.isChanging = true;
          });
        break;
      case 'treatment':
        products
          .filter((product) => product.id === currentProduct.id && !product.hasOwnProperty('seedCompanyTotalOrder'))
          .forEach((product) => {
            product.treatment = value;
            product.isChanging = true;
          });
        break;
      case 'msrp':
        products
          .filter((product) => product.id === currentProduct.id && !product.hasOwnProperty('seedCompanyTotalOrder'))
          .forEach((product) => {
            product.msrp = value;
            product.isChanging = true;
          });
        break;
      case 'rm':
        products
          .filter((product) => product.id === currentProduct.id && !product.hasOwnProperty('seedCompanyTotalOrder'))
          .forEach((product) => {
            product.rm = value;
            product.isChanging = true;
          });
        break;
      case 'seedSource':
        products
          .filter((product) => product.id === currentProduct.id && !product.hasOwnProperty('seedCompanyTotalOrder'))
          .forEach((product) => {
            product.seedSource = value;
            product.isChanging = true;
          });
        break;
      case 'dealerPrice':
        products
          .filter((product) => product.id === currentProduct.id && !product.hasOwnProperty('seedCompanyTotalOrder'))
          .forEach((product) => {
            product.dealerPrice = value;
            product.isChanging = true;
          });
        break;
      default:
        break;
    }

    this.setState({
      products: products,
    });
  };

  handleSeedCompanyProductsChange = (field, currentProduct) => (data) => {
    if (!data) {
      this.onCancel(currentProduct);

      data = {};
    }
    let products = this.state.products;

    const { value } = data;
    switch (field) {
      case 'brand':
        products
          .filter((product) => product.id === currentProduct.id && !product.hasOwnProperty('seedCompanyTotalOrder'))
          .forEach((product) => {
            product.brand = value;
            product.isChanging = true;
          });
        break;
      case 'blend':
        products
          .filter((product) => product.id === currentProduct.id && !product.hasOwnProperty('seedCompanyTotalOrder'))
          .forEach((product) => {
            product.blend = value;
            let rm = this.getRmForProduct(product);
            product.rm = rm;
            product.isChanging = true;
          });
        break;
      case 'treatment':
        products
          .filter((product) => product.id === currentProduct.id && !product.hasOwnProperty('seedCompanyTotalOrder'))
          .forEach((product) => {
            product.treatment = value;
            product.isChanging = true;
          });
        break;
      case 'seedSource':
        products
          .filter((product) => product.id === currentProduct.id && !product.hasOwnProperty('seedCompanyTotalOrder'))
          .forEach((product) => {
            product.seedSource = value;
            product.isChanging = true;
          });
        break;
      case 'msrp':
        products
          .filter((product) => product.id === currentProduct.id && !product.hasOwnProperty('seedCompanyTotalOrder'))
          .forEach((product) => {
            product.msrp = data.target.value;
            product.isChanging = true;
          });
        break;
      case 'dealerPrice':
        products
          .filter((product) => product.id === currentProduct.id && !product.hasOwnProperty('seedCompanyTotalOrder'))
          .forEach((product) => {
            product.dealerPrice = data.target.value;
            product.isChanging = true;
          });
        break;
      default:
        break;
    }

    this.setState({
      products: products,
    });
  };

  handleTableItemActionMenuOpen = (item) => (event) => {
    this.setState({
      tableItemActionMenuOpen: true,
      tableItemActionAnchorEl: event.target,
      activeTableItem: item,
    });
  };

  handleTableItemActionMenuClose = () => {
    this.setState({
      tableItemActionMenuOpen: false,
      activeTableItem: null,
      products: this.state.products,
    });
  };

  handleLotsDialogOpen = (item) => {
    this.setState({ lotsDialogOpen: true, lotsItem: item });
  };
  handleReturnDialogOpen = (item) => {
    this.setState({ returnDialogOpen: true, lotsItem: item });
  };

  handleReturnDialogClose = (isUnmodified) => {
    this.setState({ returnDialogOpen: false });
  };
  handleLotsDialogClose = (isUnmodified) => {
    this.setState({ lotsDialogOpen: false }, () => {
      if (!isUnmodified) {
        this.props.productType === 'custom' ? this.props.listAllCustomProducts(true) : this.props.listProducts(true);
      }
    });
  };

  handlePackagesDialogOpen = () => {
    this.setState({ packagesDialogOpen: true });
  };

  handlePackagesDialogClose = () => {
    this.setState({ packagesDialogOpen: false });
  };

  handleseedSizesDialogOpen = () => {
    this.setState({ seedSizesDialogOpen: true });
  };

  handleseedSizesDialogClose = () => {
    this.setState({ seedSizesDialogOpen: false });
  };

  handleHorizMenuToggle = () => {
    this.setState((state) => ({ horizMenuOpen: !state.horizMenuOpen }));
  };

  handleHorizMenuClose = (event) => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }
    this.setState({ horizMenuOpen: false });
  };

  editProduct = (item) => {
    item.isChanging = true;
    const { columns, isChangingItemsCount } = this.state;
    if (isChangingItemsCount < 1) {
      if (columns.length > 9) {
        if (columns.filter((column) => column.id === 'seedSource')) {
          let newColumns = columns.slice(1, 8);
          newColumns.push(columns[0]);
          this.setState({ columns: newColumns });
        } else {
          let newColumns = columns.slice(1, 7);
          newColumns.push(columns[0]);
          this.setState({ columns: newColumns });
        }
      } else {
        let newColumns = columns.slice(1, 9);
        newColumns.push(columns[0]);
        this.setState({ columns: newColumns });
      }
    }
    this.setState({ isChangingItemsCount: isChangingItemsCount + 1 });
  };

  updateSeedCompanyProductIsFavorite = async (currentProduct) => {
    const { updateProduct, seedCompanyId } = this.props;

    const { originProducts, products } = this.state;
    const { isFavorite } = currentProduct;

    let newProducts = products;
    let newOriginalProducts = originProducts;

    await updateProduct({
      id: currentProduct.id,
      seedCompanyId,
      isFavorite,
    });

    newProducts
      .filter((product) => product.id === currentProduct.id)
      .forEach((product) => {
        product.isFavorite = currentProduct.isFavorite;
      });

    newOriginalProducts
      .filter((product) => product.id === currentProduct.id)
      .forEach((product) => {
        product.isFavorite = currentProduct.isFavorite;
      });

    this.setState({
      products: newProducts,
      originProducts: newOriginalProducts,
      isLoadProduct: false,
    });
  };

  updateSeedCompanyProduct = async (currentProduct) => {
    const { updateProduct, listProducts, seedCompanyId } = this.props;
    const { originProducts, products, isChangingItemsCount } = this.state;
    const { seedType, brand, blend, treatment, quantity, msrp, lots, rm, isFavorite, seedSource, dealerPrice } =
      currentProduct;

    let newProducts = products;
    let newOriginalProducts = originProducts;

    if (currentProduct.id) {
      await updateProduct({
        id: currentProduct.id,
        seedType,
        brand,
        blend,
        treatment,
        quantity,
        msrp,
        rm,
        dealerPrice,
        modifiedLotRows: lots,
        seedCompanyId,
        isFavorite,
        seedSource,
      });

      newProducts
        .filter((product) => product.id === currentProduct.id)
        .forEach((product) => {
          product.brand = currentProduct.brand;
          product.blend = currentProduct.blend;
          product.treatment = currentProduct.treatment;
          product.msrp = currentProduct.msrp;
          product.isFavorite = currentProduct.isFavorite;
          product.seedSource = currentProduct.seedSource;
          product.dealerPrice = currentProduct.dealerPrice;

          product.isChanging = false;
        });

      newOriginalProducts
        .filter((product) => product.id === currentProduct.id)
        .forEach((product) => {
          product.brand = currentProduct.brand;
          product.blend = currentProduct.blend;
          product.treatment = currentProduct.treatment;
          product.msrp = currentProduct.msrp;
          product.isFavorite = currentProduct.isFavorite;
          product.seedSource = currentProduct.seedSource;
          product.dealerPrice = currentProduct.dealerPrice;

          product.isChanging = false;
        });
    } else {
      const { createProduct, organization } = this.props;
      let organizationId = organization.id;

      let newProductId = await createProduct({
        seedType: seedType.toUpperCase(),
        brand,
        blend,
        treatment,
        quantity: parseInt(quantity, 10),
        msrp: parseFloat(msrp),
        rm: parseInt(rm || 0, 10),
        organizationId,
        dealerPrice: dealerPrice,
        seedCompanyId: seedCompanyId,
        orderAmount: 0,
        deliveredAmount: 0,
        modifiedLotRows: [],
        isFavorite,
        seedSource,
      }).then((response) => {
        return response.payload.id;
      });

      newProducts
        .filter((product) => product.id == null)
        .forEach((product) => {
          product.id = newProductId;
          product.brand = currentProduct.brand;
          product.blend = currentProduct.blend;
          product.treatment = currentProduct.treatment;
          product.msrp = currentProduct.msrp;
          product.isFavorite = currentProduct.isFavorite;
          product.seedSource = currentProduct.seedSource;
          product.dealerPrice = currentProduct.dealerPrice;

          product.isChanging = false;
        });

      newOriginalProducts
        .filter((product) => product.id == null)
        .forEach((product) => {
          product.id = newProductId;
          product.brand = currentProduct.brand;
          product.blend = currentProduct.blend;
          product.treatment = currentProduct.treatment;
          product.msrp = currentProduct.msrp;
          product.isFavorite = currentProduct.isFavorite;
          product.seedSource = currentProduct.seedSource;
          product.dealerPrice = currentProduct.dealerPrice;

          product.isChanging = false;
        });
    }

    this.setState(
      {
        isChangingItemsCount: isChangingItemsCount - 1,
        columns: isChangingItemsCount - 1 === 0 ? this.state.originalColumns : this.state.columns,
        products: newProducts,
        isAddingSeedProduct: false,
        originProducts: newOriginalProducts,
        isLoadProduct: false,
      },
      () => {
        listProducts(true);
      },
    );
  };

  updateCompanyProduct = async (currentProduct) => {
    const { updateCustomProduct, listAllCustomProducts } = this.props;
    const { originProducts, products, isChangingItemsCount } = this.state;
    const { id, name, type, description, unit, customId, costUnit, quantity, dealerPrice } = currentProduct;
    let newProducts = products;
    let newOriginalProducts = originProducts;

    if (id) {
      await updateCustomProduct({
        id,
        name,
        type,
        description,
        unit,
        customId,
        costUnit,
        quantity,
        dealerPrice,
      });

      newProducts
        .filter((product) => product.id === currentProduct.id)
        .forEach((product) => {
          product.name = currentProduct.name;
          product.description = currentProduct.description;
          product.unit = currentProduct.unit;
          product.customId = currentProduct.customId;
          product.costUnit = currentProduct.costUnit;
          product.quantity = currentProduct.quantity;
          product.dealerPrice = currentProduct.dealerPrice;

          product.type = currentProduct.type;
          product.isChanging = false;
        });

      newOriginalProducts
        .filter((product) => product.id === currentProduct.id)
        .forEach((product) => {
          product.name = currentProduct.name;
          product.description = currentProduct.description;
          product.unit = currentProduct.unit;
          product.customId = currentProduct.customId;
          product.costUnit = currentProduct.costUnit;
          product.quantity = currentProduct.quantity;
          product.dealerPrice = currentProduct.dealerPrice;

          product.type = currentProduct.type;
          product.isChanging = false;
        });
    } else {
      const { createCustomProduct, organizationId, companyId } = this.props;

      let newProductId = await createCustomProduct({
        companyId: companyId,
        organizationId,
        name: currentProduct.name || '',
        type: currentProduct.type || '',
        description: currentProduct.description || '',
        unit: currentProduct.unit || '',
        costUnit: currentProduct.costUnit || 0,
        quantity: currentProduct.quantity || 0,
        customId: currentProduct.customId || 0,
        dealerPrice: currentProduct.dealerPrice,
      }).then((response) => {
        return response.payload.id;
      });

      newProducts
        .filter((product) => product.id == null)
        .forEach((product) => {
          product.id = newProductId;
          product.name = currentProduct.name;
          product.type = currentProduct.type;
          product.description = currentProduct.description;
          product.unit = currentProduct.unit;
          product.costUnit = currentProduct.costUnit;
          product.quantity = currentProduct.quantity;
          product.customId = currentProduct.customId;
          product.dealerPrice = currentProduct.dealerPrice;

          product.isChanging = false;
        });

      newOriginalProducts
        .filter((product) => product.id == null)
        .forEach((product) => {
          product.id = newProductId;
          product.name = currentProduct.name;
          product.type = currentProduct.type;
          product.description = currentProduct.description;
          product.unit = currentProduct.unit;
          product.costUnit = currentProduct.costUnit;
          product.quantity = currentProduct.quantity;
          product.customId = currentProduct.customId;
          product.dealerPrice = currentProduct.dealerPrice;

          product.isChanging = false;
        });
    }

    this.setState(
      {
        isChangingItemsCount: isChangingItemsCount - 1,
        columns: isChangingItemsCount - 1 === 0 ? this.state.originalColumns : this.state.columns,
        products: newProducts,
        originProducts: newOriginalProducts,
        isLoadProduct: false,
      },
      () => {
        listAllCustomProducts(true);
      },
    );
  };

  onCancel = (currentProduct) => {
    const { originProducts, products, isChangingItemsCount } = this.state;

    let originalProduct = originProducts.find((OP) => OP.id === currentProduct.id);

    let newProducts = products;
    let newOriginalProducts = originProducts;

    if (currentProduct.id == null) {
      newProducts.filter((product) => product.id != null);
      newOriginalProducts.filter((product) => product.id != null);
      this.setState(
        {
          isChangingItemsCount: isChangingItemsCount - 1,
          columns: isChangingItemsCount - 1 === 0 ? this.state.originalColumns : this.state.columns,
          isAddingSeedProduct: false,
          products: newProducts.filter((product) => product.id != null),
          originProducts: newOriginalProducts.filter((product) => product.id != null),

          isLoadProduct: false,
        },
        () => {
          this.setTableTotalData();
        },
      );
      return;
    }

    newProducts
      .filter((product) => product.id === currentProduct.id)
      .forEach((product) => {
        product.name = originalProduct.name;
        product.description = originalProduct.description;
        product.unit = originalProduct.unit;
        product.customId = originalProduct.customId;
        product.costUnit = originalProduct.costUnit;
        product.quantity = originalProduct.quantity;
        product.type = originalProduct.type;
        product.brand = originalProduct.brand;
        product.blend = originalProduct.blend;
        product.treatment = originalProduct.treatment;
        product.msrp = originalProduct.msrp;
        product.seedSource = originalProduct.seedSource;

        product.dealerPrice = originalProduct.dealerPrice;
        product.isChanging = false;
      });

    newOriginalProducts
      .filter((product) => product.id === currentProduct.id)
      .forEach((product) => {
        product.name = originalProduct.name;
        product.description = originalProduct.description;
        product.unit = originalProduct.unit;
        product.customId = originalProduct.customId;
        product.costUnit = originalProduct.costUnit;
        product.quantity = originalProduct.quantity;
        product.type = originalProduct.type;
        product.brand = originalProduct.brand;
        product.blend = originalProduct.blend;
        product.treatment = originalProduct.treatment;
        product.msrp = originalProduct.msrp;
        product.seedSource = originalProduct.seedSource;
        product.dealerPrice = originalProduct.dealerPrice;

        product.isChanging = false;
      });

    this.setState(
      {
        isChangingItemsCount: isChangingItemsCount - 1,
        columns: isChangingItemsCount - 1 === 0 ? this.state.originalColumns : this.state.columns,
        products: newProducts,
        originProducts: newOriginalProducts,
        isLoadProduct: false,
      },
      () => {
        this.setTableTotalData();
      },
    );
  };

  toggleColumnMenu = (_, id) => {
    let columnsPairs = [];
    this.state.columns.forEach((column) => {
      if (column.columns) {
        column.columns.forEach((childCol) => {
          columnsPairs.push({ father: column, child: childCol });
        });
      }
    });
    const columns = this.state.columns.map((col) => {
      if (col.id === id) {
        if (col.columns) {
          col.columns = col.columns.map((col) => {
            return {
              ...col,
              show: !col.show,
            };
          });
        }
        return { ...col, show: !col.show };
      } else {
        const _col = columnsPairs.find((pair) => pair.child.id === id);
        if (_col) {
          if (col.columns) {
            col.columns = col.columns.map((__col) => {
              if (__col.id === _col.child.id) {
                return {
                  ...__col,
                  show: !__col.show,
                };
              } else {
                return __col;
              }
            });
            return col;
          } else {
            return col;
          }
        } else {
          return col;
        }
      }
    });
    window.localStorage.setItem('INVENTORY_SHOW_COLUMNS', JSON.stringify(columns));
    this.setState({ columns });
  };

  updateSelectedSeason = (e) => {
    const { value: seasonId } = e.target;
    if (this.state.selectedSeason !== seasonId) {
      this.setState({ selectedSeason: seasonId });
    }
  };

  seedBrandName() {
    const { seedCompany, productType, companyName } = this.props;

    if (productType === 'custom') return upperCase(companyName);
    return seedCompany[productType + 'BrandName'] || this.upperCase(productType);
  }

  addProduct = () => {
    const { seedCompany, companyId, productType, tabIndex, history } = this.props;

    if (productType === 'custom') {
      history.push(`/app/companies/${companyId}/create_product`);
    } else {
      history.push({
        pathname: `/app/seed_companies/${seedCompany.id}/create`,
        state: { selectedTab: tabIndex },
      });
    }
  };

  addNewProduct = () => {
    const { seedCompany, companyId, productType } = this.props;
    const { products, isChangingItemsCount, columns } = this.state;
    let newProduct = {};

    if (productType === 'custom') {
      newProduct = {
        companyId: companyId,
        name: '',
        type: '',
        description: '',
        unit: 0,
        costUnit: 0,
        dealerPrice: null,
        quantity: 0,
        customId: 0,
        isChanging: true,
      };

      let newColumns = columns.slice(1, 9);
      newColumns.push(columns[0]);

      this.setState({ columns: newColumns });

      this.setState({
        isChangingItemsCount: isChangingItemsCount + 1,
        products: [newProduct, ...products],
        columns: isChangingItemsCount < 1 ? newColumns : columns,
        isLoadProduct: true,
      });
    } else {
      const metadata = JSON.parse(seedCompany.metadata);
      const cropTypes = metadata[productType];
      let count = 0;
      cropTypes.blend && count++;
      cropTypes.brand && count++;
      cropTypes.msrp && count++;
      cropTypes.rm && count++;
      cropTypes.dealerPrice && count++;
      cropTypes.treatment && count++;
      cropTypes.seedSource && count++;

      let newColumns = columns.slice(2, 3 + count);

      newColumns.push(columns[1]);
      newProduct = {
        seedType: productType,
        brand: '',
        blend: '',
        treatment: '',
        quantity: 0,
        msrp: 0,
        orderAmount: 0,
        deliveredAmount: 0,
        dealerPrice: null,
        seedCompanyId: seedCompany.id,
        modifiedLotRows: [],
        isChanging: true,
      };
      if (cropTypes.seedSource) newProduct = { ...newProduct, seedSource: '' };

      this.setState({
        isChangingItemsCount: isChangingItemsCount + 1,
        products: [newProduct, ...products],
        isAddingSeedProduct: true,
        columns: isChangingItemsCount < 1 ? newColumns : columns,
        isLoadProduct: true,
      });
    }
  };

  setTableTotalData = () => {
    const { customerProducts, deliveryReceipts } = this.props;
    const { products } = this.state;
    let newProducts = [];
    const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));
    if (products.length < 1) return;

    if (products[0].hasOwnProperty('companyId')) {
      let totalDealerPrice = 0,
        totalCostperunit = 0,
        totalQuantity = 0;
      products.forEach((item) => {
        totalDealerPrice += item.dealerPrice === null ? 0 : item.dealerPrice;
        totalCostperunit += parseFloat(item.costUnit || 0);
        totalQuantity += parseFloat(item.quantity || 0);
      });

      newProducts = [
        {
          Product: '-',
          Type: '-',

          Description: '-',
          ID: '-',
          Unit: '-',
          DealerPrice: totalDealerPrice,

          Costperunit: totalCostperunit.toFixed(2),
          Quantity: totalQuantity.toFixed(2),
        },
        ...products.filter((product) => product.id),
      ];
    } else {
      let seedCompanyTotalOrder = 0,
        seedCompanyTotalShipped = 0,
        seedCompanyTotalUnShipped = 0,
        growerTotalOrder = 0,
        growerTotalShipped = 0,
        growerTotalUnShipped = 0,
        seedDealerTotalTransferIn = 0,
        seedDealerTotalTransferOut = 0,
        longShorttotal = 0,
        dealerPricetotal = 0,
        warehouseTotal = 0;

      products
        .filter((product) => product.hasOwnProperty('id'))
        .forEach((product) => {
          const productOrder = getQtyOrdered(product),
            productShipped = getQtyShipped(product),
            productGrowerOrder = getGrowerOrder(product, customerProducts),
            seedDealerTransferIn = getTransferInAmount(product),
            seedDealerTransferOut = getTransferOutAmount(product),
            growerShipped = getGrowerOrderDelivered(product, deliveryReceiptDetails),
            growerUnShipped = customerProducts
              .filter((order) => order.productId === product.id)
              .reduce((unDelivered, acc) => unDelivered + (acc.orderQty - acc.amountDelivered), 0);
          const productUnShipped = productOrder - productShipped;
          const longShort = productOrder - productGrowerOrder;
          const warehouse = productShipped - growerShipped;
          seedCompanyTotalOrder += productOrder;
          seedCompanyTotalShipped += productShipped;
          seedCompanyTotalUnShipped += productUnShipped;
          growerTotalOrder += productGrowerOrder;
          growerTotalShipped += growerShipped;
          growerTotalUnShipped += growerUnShipped;
          seedDealerTotalTransferIn += seedDealerTransferIn;
          seedDealerTotalTransferOut += seedDealerTransferOut;
          longShorttotal += longShort;
          warehouseTotal += warehouse;
          dealerPricetotal += product.dealerPrice;
        });
      newProducts = [
        {
          Trait: '-',
          Variety: '-',
          RM: '-',
          MSRP: '-',
          Treatment: '-',
          seedCompanyTotalOrder,
          seedCompanyTotalShipped,
          seedCompanyTotalUnShipped,
          growerTotalOrder,
          growerTotalShipped,
          growerTotalUnShipped,
          seedDealerTotalTransferIn,
          seedDealerTotalTransferOut,
          longShorttotal,
          warehouseTotal,
          dealerPricetotal,
        },
        ...products.filter((product) => product.id),
      ];
    }

    this.setState({ products: newProducts });
  };

  handleShowDetailView = (event) => {
    if (event.target.checked) this.setDefaultExpandedRows();
    if (!event.target.checked) this.setState({ expandedRows: { 0: false } });
    this.setState({ showDetailView: event.target.checked });

    window.localStorage.setItem('INVENTORY_SHOW_DETAIL_VIEW', event.target.checked);
  };

  handleShowFavoriteProducts = (event) => {
    window.localStorage.setItem('INVENTORY_SHOW_FAVORITE_PRODUCTS', event.target.checked);
    this.setState({ showFavoriteProducts: event.target.checked }, () => {
      if (this.state.showDetailView) {
        this.setDefaultExpandedRows();
      }
    });
  };

  handleSeedDealerChange = (event) => {
    const { productType } = this.props;
    const { originProducts } = this.state;
    const selectedSeedDealer = event.target.value;
    if (selectedSeedDealer === 'ALL') {
      this.setState({ selectedSeedDealer: event.target.value, products: originProducts });
      return;
    }
    let newProducts = [];
    if (selectedSeedDealer === 'Seed Company') {
      newProducts = originProducts.filter((product) => {
        if (product.hasOwnProperty('seedCompanyTotalOrder')) return null;
        let lot = product.lots.filter((lot) => lot.source === 'Seed Company');
        if (lot.length > 0) return product;
        return null;
      });
    } else {
      if (productType === 'custom') {
        newProducts = originProducts.filter((product) => {
          if (product.Product == '-') return null;

          let lot = product.customLots.filter((lot) => lot.dealerId === selectedSeedDealer);
          if (lot.length > 0) return product;
          return null;
        });
      } else {
        newProducts = originProducts.filter((product) => {
          if (product.hasOwnProperty('seedCompanyTotalOrder')) return null;
          let lot = product.lots.filter((lot) => lot.dealerId === selectedSeedDealer && lot.source !== 'Seed Company');
          if (lot.length > 0) return product;
          return null;
        });
      }
    }
    this.setState({ selectedSeedDealer: event.target.value, products: newProducts }, () => {
      this.setTableTotalData();
    });
  };

  handleProductDealerInfoDialogOpen = () => {
    this.setState({ productDealerInfoDialogOpen: true });
  };

  handleProductDealerInfoDialogClose = () => {
    this.setState({ productDealerInfoDialogOpen: false });
  };

  handleProductRelatedInfoDialogOpen = (item, context) => {
    const { productRelatedPurchaseOrders } = this.state;
    this.setState({
      productRelatedInfoDialogContext: context,
      productRelatedInfoDialogOpen: true,
      selectedProduct: item,
      selectedProductRelatedPurchaseOrders: productRelatedPurchaseOrders[item.id] || [],
    });
  };

  handleProductRelatedInfoDialogClose = () => {
    this.setState({ productRelatedInfoDialogOpen: false });
  };

  getSortData = (products) => {
    const productsTotal = products.find((product) => !product.hasOwnProperty('id'));
    const _products = products.filter((_product) => _product.id);
    const result = _products.sort(
      (a, b) => a.blend.localeCompare(b.blend) || (a.treatment && a.treatment.localeCompare(b.treatment)),
    );
    return productsTotal ? [productsTotal, ...result] : result;
  };

  importProductsCSV = async (e) => {
    const { companyId, productType, seedCompany } = this.props;
    if (!e.target.value.endsWith('.csv')) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      createProductsFromCSV(event.target.result, companyId, seedCompany ? seedCompany.id : null, productType);
    };
    reader.readAsText(file);
    companyId && this.props.listAllCustomProducts();
    seedCompany && this.props.listProducts();

    setTimeout(() => {
      this.renderTableData();
      this.setState({ horizMenuOpen: false });
    }, 4000);
  };

  exportGrowerSummary = () => {
    const { seedCompanyId, productType, productPackagings } = this.props;
    let tabledata = [];
    let totals = {};
    this.props.customers.forEach((customer) => {
      customer.PurchaseOrders.forEach((purchaseOrder) => {
        purchaseOrder.CustomerProducts.forEach((order) => {
          if (order.Product.seedCompanyId !== seedCompanyId) return;
          if (order.Product.seedType !== productType.toUpperCase()) return;
          let packagingId = '';
          let seedSizeId = '';
          let found = false;

          let orderPackagingGroups = [];
          productPackagings
            .filter((p) => p.purchaseOrderId === purchaseOrder.id && p.productId === order.Product.id)
            .forEach((p) => {
              p.packagingGroups.forEach((pg) => {
                if (pg.CustomerProductId === order.id) orderPackagingGroups.push(pg);
              });
            });
          if (orderPackagingGroups.length > 0) {
            orderPackagingGroups.forEach((packagingGroup) => {
              const _packaging = this.props.packagings.find((p) => p.id === packagingGroup.packagingId);
              const _seedSize = this.props.seedSizes.find((p) => p.id === packagingGroup.seedSizeId);

              if (_packaging) packagingId = _packaging.id;
              if (_seedSize) seedSizeId = _seedSize.id;

              if (!totals[`${order.Product.id}/${packagingId}/${seedSizeId}`])
                totals[`${order.Product.id}/${packagingId}/${seedSizeId}`] = [];
              totals[`${order.Product.id}/${packagingId}/${seedSizeId}`].push({
                order,
                seedSize: _seedSize,
                packaging: _packaging,
                quantity: packagingGroup.quantity,
              });
              found = true;
            });
          }

          if (found) return;
          if (!totals[`${order.Product.id}/${packagingId}/${seedSizeId}`])
            totals[`${order.Product.id}/${packagingId}/${seedSizeId}`] = [];
          totals[`${order.Product.id}/${packagingId}/${seedSizeId}`].push({
            order,
            seedSize: null,
            packaging: null,
            quantity: order.orderQty,
          });
        });
      });
    });

    let csvData = '';
    let headers = ['Trait', 'Variety', 'Treatment', 'Seed Size', 'Packaging', 'Qty', 'DealerPrice'];
    csvData += headers.join(',');
    csvData += '\n';

    Object.keys(totals).forEach((key) => {
      let groups = totals[key];
      groups.forEach((group) => {
        tabledata.push({
          Trait: group.order.Product.brand,
          Variety: group.order.Product.blend,
          Treatment: group.order.Product.treatment,
          SeedSize: group.seedSize ? group.seedSize.name : '',
          Packaging: group.packaging ? group.packaging.name : '',
          Qty: group.quantity,
          DealerPrice: group.dealerPrice,
        });
        let row = [
          group.order.Product.brand,
          group.order.Product.blend,
          group.order.Product.treatment,
          group.seedSize ? group.seedSize.name : '',
          group.packaging ? group.packaging.name : '',
          group.quantity,
          group.dealerPrice,
        ];
        csvData += row.join(',');
        csvData += '\n';
      });
    });
    const companyType = productType === 'custom' ? 'regular' : 'seed';
    this.setState({
      inventoryCsvdata: csvData,
      inventoryListData: tabledata,
    });
    // downloadCSV(csvData, `${companyType}GrowerSummary`);
  };

  // exportInventory = (showGrowerInfo) => {
  //   const { seedCompanyId, productType, productPackagings, customerProducts, deliveryReceipts } = this.props;

  //   const { productRelatedPurchaseOrders } = this.state;
  //   const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));

  //   let csvData = '';
  //   let products = cloneDeep(this.props.products);
  //   products.shift(); // remove totals row
  //   products.sort((a, b) => a.blend.localeCompare(b.blend) || (a.treatment && a.treatment.localeCompare(b.treatment)));
  //   let headers = [];

  //   if (showGrowerInfo) {
  //     headers = [
  //       'Customer Name',
  //       'Purchase Order ID',
  //       'Trait',
  //       'Variety',
  //       'Treatment',
  //       'Seed Size',
  //       'Packaging',
  //       'Grower Qty',
  //     ];
  //   } else {
  //     headers = [
  //       'Trait',
  //       'Variety',
  //       'RM',
  //       'Treatment',
  //       'MSRP',
  //       'Seed Source',
  //       'SeedSize',
  //       'Packaging',
  //       'Seed Company / Ordered',
  //       'Seed Company / Shipped/Unshipped',
  //       'Grower / Ordered',
  //       'Grower / Shipped/Unshipped',
  //       'Seed Dealer / Transfer/In/Out',
  //       'Long / Short',
  //       'Warehouse',
  //     ];
  //   }
  //   csvData += headers.join(',');
  //   csvData += '\n';
  //   if (showGrowerInfo) {
  //     let totals = {};
  //     this.props.customers.forEach((customer) => {
  //       customer.PurchaseOrders.forEach((purchaseOrder) => {
  //         purchaseOrder.CustomerProducts.forEach((order) => {
  //           if (order.Product.seedCompanyId !== seedCompanyId) return;
  //           if (order.Product.seedType !== productType.toUpperCase()) return;
  //           let packagingId = '';
  //           let seedSizeId = '';
  //           let found = false;

  //           let orderPackagingGroups = [];
  //           productPackagings
  //             .filter((p) => p.purchaseOrderId === purchaseOrder.id && p.productId === order.Product.id)
  //             .forEach((p) => {
  //               p.packagingGroups.forEach((pg) => {
  //                 if (pg.CustomerProductId === order.id) orderPackagingGroups.push(pg);
  //               });
  //             });
  //           if (orderPackagingGroups.length > 0) {
  //             orderPackagingGroups.forEach((packagingGroup) => {
  //               const _packaging = this.props.packagings.find((p) => p.id === packagingGroup.packagingId);
  //               const _seedSize = this.props.seedSizes.find((p) => p.id === packagingGroup.seedSizeId);

  //               if (_packaging) packagingId = _packaging.id;
  //               if (_seedSize) seedSizeId = _seedSize.id;

  //               if (!totals[`${order.Product.id}/${packagingId}/${seedSizeId}`])
  //                 totals[`${order.Product.id}/${packagingId}/${seedSizeId}`] = [];

  //               totals[`${order.Product.id}/${packagingId}/${seedSizeId}`].push({
  //                 order,
  //                 customer,
  //                 purchaseOrder,
  //                 seedSize: _seedSize,
  //                 packaging: _packaging,
  //                 quantity: packagingGroup.quantity,
  //               });
  //               found = true;
  //             });
  //           }

  //           if (found) return;
  //           if (!totals[`${order.Product.id}/${packagingId}/${seedSizeId}`])
  //             totals[`${order.Product.id}/${packagingId}/${seedSizeId}`] = [];
  //           totals[`${order.Product.id}/${packagingId}/${seedSizeId}`].push({
  //             purchaseOrder,
  //             customer,
  //             order,
  //             seedSize: null,
  //             packaging: null,
  //             quantity: order.orderQty,
  //           });
  //         });
  //       });
  //     });

  //     Object.keys(totals).forEach((key) => {
  //       let groups = totals[key];
  //       groups.forEach((group) => {
  //         let row = [
  //           group.customer.name,
  //           `PO#${group.purchaseOrder.id}`,
  //           group.order.Product.brand,
  //           group.order.Product.blend,
  //           group.order.Product.treatment,
  //           group.seedSize ? group.seedSize.name : '',
  //           group.packaging ? group.packaging.name : '',
  //           group.quantity,
  //         ];
  //         csvData += row.join(',');
  //         csvData += '\n';
  //       });
  //     });
  //   } else {
  //     products.forEach((product) => {
  //       const pos = productRelatedPurchaseOrders[product.id];
  //       const filteredProducts = customerProducts.filter((cp) => {
  //         if (pos === undefined) return false;
  //         return pos
  //           .filter((p) => p.purchaseOrder.isQuote === false) // filter out quotes
  //           .map((p) => p.purchaseOrder.id)
  //           .includes(cp.purchaseOrderId);
  //       });
  //       const shipped = getGrowerOrderDelivered(product, deliveryReceiptDetails),
  //         unshipped = customerProducts
  //           .filter((order) => {
  //             if (productRelatedPurchaseOrders[product.id] === undefined) return false;
  //             return productRelatedPurchaseOrders[product.id]
  //               .filter((p) => p.purchaseOrder.isQuote === false) // filter out quotes
  //               .map((p) => p.purchaseOrder.id)
  //               .includes(order.purchaseOrderId);
  //           })
  //           .filter((order) => order.productId === product.id)
  //           .reduce((unDelivered, acc) => unDelivered + (acc.orderQty - acc.amountDelivered), 0);
  //       const longShort = getQtyOrdered(product) - getGrowerOrder(product, filteredProducts);
  //       const warehouse =
  //         getQtyShipped(product) +
  //         getTransferInAmount(product) -
  //         getTransferOutAmount(product) -
  //         getGrowerOrderDelivered(product, deliveryReceiptDetails);
  //       if (product.lots.length) {
  //         product.lots.forEach((lot) => {
  //           const packaging = this.props.packagings.find((p) => p.id === lot.packagingId);
  //           const seedSize = this.props.seedSizes.find((p) => p.id === lot.seedSizeId);
  //           let transferInOut = '0/0';
  //           switch (lot.source) {
  //             case 'Seed Dealer Transfer Out':
  //               transferInOut = `${lot.quantity}/0`;
  //               break;
  //             case 'Seed Dealer Transfer In':
  //               transferInOut = `0/${lot.quantity}`;
  //               break;
  //             default:
  //               break;
  //           }
  //           const row = [
  //             product.brand,
  //             product.blend,
  //             product.rm,
  //             product.treatment,
  //             product.msrp,
  //             product.seedSource, // TODO: show customer name instead if `showGrowerInfo` is true
  //             seedSize ? seedSize.name : '',
  //             packaging ? packaging.name : '',
  //             lot.orderAmount,
  //             `${lot.quantity}/${lot.orderAmount - lot.quantity}`,
  //             getGrowerOrder(product, filteredProducts),
  //             `${shipped}/${unshipped}`,
  //             transferInOut,
  //             longShort,
  //             warehouse,
  //           ];
  //           csvData += row.join(',');
  //           csvData += '\n';
  //         });
  //       } else {
  //         const row = [
  //           product.brand,
  //           product.blend,
  //           product.rm,
  //           product.treatment,
  //           product.msrp,
  //           product.seedSource,
  //           '',
  //           '',
  //           '',
  //           '',
  //           '',
  //           '',
  //           '',
  //           '',
  //           '',
  //         ];
  //         csvData += row.join(',');
  //         csvData += '\n';
  //       }
  //     });
  //   }

  //   this.downloadCSV(csvData);
  // };

  exportInventory = (showGrowerInfo, data, name) => {
    const { seedCompanyId, productType, productPackagings, customerProducts, deliveryReceipts } = this.props;

    const { productRelatedPurchaseOrders } = this.state;
    const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));

    let csvData = '';
    let headers = [];
    let tabledata = [];

    if (showGrowerInfo) {
      headers = [
        'Customer Name',
        'Purchase Order ID',
        'Trait',
        'Variety',
        'Treatment',
        'Seed Size',
        'Packaging',
        'Grower Qty',
        'DealerPrice',
      ];
    } else if (data[0] && data[0].hasOwnProperty('companyId')) {
      headers = ['Product', 'Type', 'Description', 'ID', 'Unit', 'Cost per unit', 'Quantity', 'DealerPrice'];
    } else {
      headers = [
        'Trait',
        'Variety',
        'RM',
        'Treatment',
        'MSRP',
        'Seed Company / Ordered',
        'Seed Company / Shipped/Unshipped',
        'Grower / Ordered',
        'Grower / Shipped/Unshipped',
        'Seed Dealer / Transfer/In/Out',
        'Long / Short',
        'Warehouse',
        'DealerPrice',
      ];
    }
    csvData += headers.join(',');
    csvData += '\n';
    if (showGrowerInfo) {
      let totals = {};
      this.props.customers.forEach((customer) => {
        customer.PurchaseOrders.forEach((purchaseOrder) => {
          purchaseOrder.CustomerProducts.forEach((order) => {
            if (order.Product.seedCompanyId !== seedCompanyId) return;
            if (order.Product.seedType !== productType.toUpperCase()) return;
            let packagingId = '';
            let seedSizeId = '';
            let found = false;

            let orderPackagingGroups = [];
            productPackagings
              .filter((p) => p.purchaseOrderId === purchaseOrder.id && p.productId === order.Product.id)
              .forEach((p) => {
                p.packagingGroups.forEach((pg) => {
                  if (pg.CustomerProductId === order.id) orderPackagingGroups.push(pg);
                });
              });
            if (orderPackagingGroups.length > 0) {
              orderPackagingGroups.forEach((packagingGroup) => {
                const _packaging = this.props.packagings.find((p) => p.id === packagingGroup.packagingId);
                const _seedSize = this.props.seedSizes.find((p) => p.id === packagingGroup.seedSizeId);

                if (_packaging) packagingId = _packaging.id;
                if (_seedSize) seedSizeId = _seedSize.id;

                if (!totals[`${order.Product.id}/${packagingId}/${seedSizeId}`])
                  totals[`${order.Product.id}/${packagingId}/${seedSizeId}`] = [];

                totals[`${order.Product.id}/${packagingId}/${seedSizeId}`].push({
                  order,
                  customer,
                  purchaseOrder,
                  seedSize: _seedSize,
                  packaging: _packaging,
                  quantity: packagingGroup.quantity,
                });
                found = true;
              });
            }

            if (found) return;
            if (!totals[`${order.Product.id}/${packagingId}/${seedSizeId}`])
              totals[`${order.Product.id}/${packagingId}/${seedSizeId}`] = [];
            totals[`${order.Product.id}/${packagingId}/${seedSizeId}`].push({
              purchaseOrder,
              customer,
              order,
              seedSize: null,
              packaging: null,
              quantity: order.orderQty,
            });
          });
        });
      });

      Object.keys(totals).forEach((key) => {
        let groups = totals[key];
        groups.forEach((group) => {
          tabledata.push({
            CustomerName: group.customer.name,
            PurchaseOrderID: `PO#${group.purchaseOrder.id}`,
            Trait: group.order.Product.brand,
            Variety: group.order.Product.blend,
            Treatment: group.order.Product.treatment,
            SeedSize: group.seedSize ? group.seedSize.name : '',
            Packaging: group.packaging ? group.packaging.name : '',
            GrowerQty: group.quantity,
            DealerPrice: group.dealerPrice,
          });
          let row = [
            group.customer.name,
            `PO#${group.purchaseOrder.id}`,
            group.order.Product.brand,
            group.order.Product.blend,
            group.order.Product.treatment,
            group.seedSize ? group.seedSize.name : '',
            group.packaging ? group.packaging.name : '',
            group.quantity,
            group.dealerPrice,
          ];
          csvData += row.join(',');
          csvData += '\n';
        });
      });
    } else if (data[0].hasOwnProperty('companyId')) {
      data.forEach((item) => {
        tabledata.push({
          Product: item.name,
          Type: item.type,
          Description: item.description,
          ID: item.customId,
          Unit: item.unit,
          Costperunit: item.costUnit,
          Quantity: item.quantity,
          DealerPrice: item.dealerPrice,
        });
        let row = [
          item.name,
          item.type,
          item.description,
          item.customId,
          item.unit,
          item.costUnit,
          item.quantity,
          item.dealerPrice,
        ];
        csvData += row.join(',');
        csvData += '\n';
      });
    } else {
      // if(data.hasOwnProperty("seedCompanyId"))
      data.forEach((item) => {
        let seedshipped, growerOrder, deliveredGrowerOrder, seedDealerTransfer, longShort, qtyWarehouse;
        if (item.hasOwnProperty('seedCompanyTotalOrder')) {
          seedshipped = `${item.seedCompanyTotalShipped}/${item.seedCompanyTotalUnShipped}`;
          growerOrder = item.growerTotalOrder;
          deliveredGrowerOrder = `${item.growerTotalShipped}/${item.growerTotalUnShipped}`;
          seedDealerTransfer = `${item.seedDealerTotalTransferIn}/${item.seedDealerTotalTransferOut}`;
          longShort = item.longShorttotal;
          qtyWarehouse = item.warehouseTotal;
        } else {
          const shipped1 = getQtyShipped(item),
            unshipped1 = getQtyOrdered(item) - getQtyShipped(item);
          seedshipped = `${shipped1}/${unshipped1}`;

          const pos = productRelatedPurchaseOrders[item.id];
          const filteredProducts = customerProducts.filter((cp) => {
            if (pos === undefined) return false;
            return pos
              .filter((p) => p.purchaseOrder.isQuote === false) // filter out quotes
              .map((p) => p.purchaseOrder.id)
              .includes(cp.purchaseOrderId);
          });
          growerOrder = getGrowerOrder(item, filteredProducts);

          const shipped2 = getGrowerOrderDelivered(item, deliveryReceiptDetails),
            unshipped2 = customerProducts
              .filter((order) => {
                if (productRelatedPurchaseOrders[item.id] === undefined) return false;
                return productRelatedPurchaseOrders[item.id]
                  .filter((p) => p.purchaseOrder.isQuote === false) // filter out quotes
                  .map((p) => p.purchaseOrder.id)
                  .includes(order.purchaseOrderId);
              })
              .filter((order) => order.productId === item.id)
              .reduce((unDelivered, acc) => unDelivered + (acc.orderQty - acc.amountDelivered), 0);
          deliveredGrowerOrder = `${shipped2}/${unshipped2}`;
          seedDealerTransfer = `${getTransferInAmount(item)}/${getTransferOutAmount(item)}`;
          longShort = getQtyOrdered(item) - getGrowerOrder(item, filteredProducts);
          //count warehouse quantity

          const quatityID = deliveryReceiptDetails.filter((data) => data.productId === item.id);
          const deliveryQtyisReturn = getDeliveryLotsQtyReturn(quatityID, deliveryReceipts); //delivery Return value
          const deliveryQty = getDeliveryLotsQty(quatityID, deliveryReceipts);
          qtyWarehouse =
            getQtyShipped(item) +
            getTransferInAmount(item) -
            getTransferOutAmount(item) -
            deliveryQty +
            deliveryQtyisReturn;
        }
        tabledata.push({
          Trait: item.brand,
          Variety: item.blend,
          RM: item.rm,
          Treatment: item.treatment,
          MSRP: item.msrp,
          SeedCompanyOrdered: item.hasOwnProperty('seedCompanyTotalOrder')
            ? item.seedCompanyTotalOrder
            : getQtyOrdered(item),
          SeedCompanyShippedUnshipped: seedshipped,
          GrowerOrdered: growerOrder,
          GrowerShippedUnshipped: deliveredGrowerOrder,
          DealerPrice: item.dealerPrice,
          SeedDealerTransferInOut: seedDealerTransfer,
          LongShort: longShort,

          Warehouse: qtyWarehouse,
        });
        const row = [
          item.brand,
          item.blend,
          item.rm,
          item.treatment,
          item.msrp,
          item.dealerPrice,
          item.hasOwnProperty('seedCompanyTotalOrder') ? item.seedCompanyTotalOrder : getQtyOrdered(item),
          seedshipped,
          growerOrder,
          deliveredGrowerOrder,
          seedDealerTransfer,
          longShort,
          qtyWarehouse,
        ];

        csvData += row.join(',');
        csvData += '\n';
      });
    }

    const companyType = productType === 'custom' ? 'regular' : 'seed';
    // downloadCSV(csvData, `${companyType}${name}`);
    this.setState({
      inventoryCsvdata: csvData,
      inventoryListData: tabledata,
    });
  };
  handleSearchTextChange = (event) => {
    this.setState({ serchText: event.target.value });
  };
  exportTemplateCsv = () => {
    let csvData = '';
    if (this.props.productType == 'custom') {
      const headers = ['name', 'type', 'description', 'customId', 'dealerPrice', 'unit', 'costUnit', 'quantity'];
      csvData += headers.join(',');
      csvData += '\n';

      const row = ['product-1', 'type-1', 'description-1', 'customId-1', 'dealerprice-0', 'unit-hj', '230.75', '500'];
      csvData += row.join(',');
      csvData += '\n';
    } else {
      const headers = ['trait', 'variety', 'rm', 'dealerPrice', 'treatment', 'msrp', 'seedSource'];
      csvData += headers.join(',');
      csvData += '\n';

      const row = ['trait-1', 'variety-1', '327.00', '0.00', 'treatment-1', '270.50', ''];
      csvData += row.join(',');
      csvData += '\n';
    }

    downloadCSV(csvData, 'csvTemplate');
  };
  getTrProps = (state, rowInfo, instance) => {
    if (rowInfo) {
      return {
        style: {
          'background-color': rowInfo.original.Variety == '-' || rowInfo.original.Product == '-' ? '#307a0830' : '',
          fontWeight: rowInfo.original.Variety === '-' || rowInfo.original.Product === '-' ? 900 : '',
        },
      };
    }
  };
  setDefaultExpandedRows = () => {
    const { productType } = this.props;
    const { products, showFavoriteProducts } = this.state;
    let isSeedCompany = productType !== 'custom';
    let defaultExpandedRows = {};
    const withTotalData = products[0] && products[0].hasOwnProperty('growerTotalOrder');

    (showFavoriteProducts ? products.filter((product) => product.isFavorite) : products).forEach((product, index) => {
      const isEmptyLot =
        index === 0
          ? true
          : isSeedCompany
          ? product.lots && product.lots.length <= 0
          : product.customLots && product.customLots.length <= 0;

      if (isEmptyLot) return;
      defaultExpandedRows = {
        ...defaultExpandedRows,
        [withTotalData || !isSeedCompany || showFavoriteProducts ? index : index + 1]: true,
      };
    });
    this.setState({ expandedRows: defaultExpandedRows });
  };

  handleExpandedChange = (newExpanded) => {
    this.setState({ expandedRows: { ...newExpanded, 0: false } });
  };

  render() {
    const {
      columns,
      horizMenuOpen,
      // selectedSeason,
      activeTableItem,
      tableItemActionMenuOpen,
      tableItemActionAnchorEl,
      lotsDialogOpen,
      lotsItem,
      packagesDialogOpen,
      seedSizesDialogOpen,
      products,
      isAddingSeedProduct,
      showDetailView,
      selectedSeedDealer,
      productDealerInfoDialogOpen,
      // productDealers,
      productRelatedInfoDialogOpen,
      productRelatedInfoDialogContext,
      selectedProductRelatedPurchaseOrders,
      selectedProduct,
      expandedRows,
      showFavoriteProducts,
      returnDialogOpen,
      serchText,
      isLoadProduct,
      isLoading,
    } = this.state;
    const {
      classes,
      // deleteText,
      // deleteAction,
      editAction,

      // editText,
      // print,
      productType,
      // savePageAsPdf,
      seedCompany,
      theme,
      // seasons,
      // openSeasonsModal,
      toggleColumns,
      isAdmin,
      deleteProduct,
      // history,
      // tabIndex,
      deliveryReceipts,
      companyId,
      seedCompanyId,
      // productDealers,
    } = this.props;
    const isSeedCompany = productType !== 'custom';
    let renderProducts = showFavoriteProducts ? products.filter((product) => product.isFavorite) : products;
    // showDetailView && this.setDefaultExpandedRows();//going to loop don't uncomment it
    const companyType = productType === 'custom' ? 'Company' : 'Seed Company';
    const dealerCompanyId = productType === 'custom' ? companyId : seedCompanyId;
    const productDealers = this.props.productDealers
      .filter(
        (productDealer) => productDealer.companyType === companyType && productDealer.companyId === dealerCompanyId,
      )
      .sort((a, b) => a.id - b.id);
    const companyName = productType === 'custom' ? 'regular' : 'seed';

    renderProducts = renderProducts.filter((p) => {
      if (p.hasOwnProperty('companyId') && p.name !== '') {
        return (
          (p.name && p.name.toLowerCase().includes(serchText)) || (p.type && p.type.toLowerCase().includes(serchText))
        );
      } else if (p.hasOwnProperty('seedCompanyId') && (p.brand !== '' || p.blend !== '')) {
        return (
          (p.brand && p.brand.toLowerCase().includes(serchText)) ||
          (p.blend && p.blend.toLowerCase().includes(serchText))
        );
      } else {
        return p;
      }
    });

    return (
      <GridContainer className={classes.productTableContainer} id="nonBayer_card">
        <GridItem xs={12}>
          <div className={`${classes.actionBar} hide-print`}>
            {/* <FormControl fullWidth={true}>
              <InputLabel htmlFor="season-selector">Season</InputLabel>
              <Select
                className={classes.seasonSelector}
                value={selectedSeason}
                onChange={this.updateSelectedSeason}
                inputProps={{
                  id: "season-selector",
                }}
              >
                {seasons.map((season) => (
                  <MenuItem key={`season-${season.id}`} value={season.id}>
                    {season.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl> */}
            <FormControl style={{ marginRight: '7px', width: '80%' }}>
              <TextField
                className={`${classes.searchField} hide-print`}
                margin="normal"
                placeholder="Search"
                value={serchText}
                onChange={this.handleSearchTextChange}
                id="searchBar"
              />
            </FormControl>

            {isSeedCompany && (
              <FormControl fullWidth={true}>
                <InputLabel htmlFor="seed-dealer-selector" shrink>
                  Seed Dealer
                </InputLabel>
                <Select
                  className={classes.seasonSelector}
                  value={selectedSeedDealer}
                  onChange={this.handleSeedDealerChange}
                  inputProps={{
                    id: 'seed-dealer-selector',
                  }}
                  displayEmpty
                >
                  <MenuItem value={'ALL'}>All</MenuItem>
                  {isSeedCompany && <MenuItem value={'Seed Company'}>Seed Company</MenuItem>}
                  {productDealers.map((productDealer, index) => (
                    <MenuItem key={index} value={productDealer.id}>
                      {productDealer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <Button
              buttonRef={(node) => {
                this.anchorEl = node;
              }}
              aria-owns={horizMenuOpen ? 'menu-list-grow' : undefined}
              aria-haspopup="true"
              onClick={this.handleHorizMenuToggle}
              style={{
                background: horizMenuOpen ? theme.palette.primary.main : 'inherit',
              }}
              justIcon
              className={classes.horizTableMenu}
              id="nonBayerBtn"
            >
              <MoreHoriz
                style={{
                  color: horizMenuOpen ? '#fff' : theme.palette.primary.main,
                }}
              />
            </Button>

            <Popover
              open={horizMenuOpen}
              anchorEl={this.anchorEl}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              transformOrigin={{ horizontal: 'left', vertical: 'top' }}
              onClose={this.handleHorizMenuClose}
            >
              <Paper>
                <MenuList>
                  {/* <MenuItem
                    className={classes.horizTableMenuItem}
                    onClick={this.print}
                    style={{ borderBottom: '1px dashed #000000' }}
                  >
                    Print
                  </MenuItem>
                  <MenuItem
                    className={classes.horizTableMenuItem}
                    onClick={() => {
                      this.props.history.push(`/app/inventory_preview/seed_company/${seedCompany.id}/1`);
                    }}
                    style={{ borderBottom: '1px dashed #000000' }}
                  >
                    Print Preview
                  </MenuItem> */}
                  {isSeedCompany && (
                    <MenuItem
                      className={classes.horizTableMenuItem}
                      // onClick={() =>
                      //   this.props.history.push(
                      //     `/app/seed_companies/${seedCompany.id}/seed_size`
                      //   )
                      // }
                      onClick={this.handleseedSizesDialogOpen}
                    >
                      Seed Size
                    </MenuItem>
                  )}
                  {isSeedCompany && (
                    <MenuItem
                      className={classes.horizTableMenuItem}
                      // onClick={() =>
                      //   this.props.history.push(
                      //     `/app/seed_companies/${seedCompany.id}/packaging`
                      //   )
                      // }

                      onClick={this.handlePackagesDialogOpen}
                      style={{ borderBottom: '1px dashed #000000' }}
                    >
                      Packaging
                    </MenuItem>
                  )}
                  {/* <MenuItem
                    className={classes.horizTableMenuItem}
                    onClick={() => this.props.history.push(`/app/setting/season`)}
                    style={{ borderBottom: "1px dashed #000000" }}
                  >
                    Manage Seasons
                  </MenuItem> */}
                  {editAction && (isAdmin === true || isAdmin === 'true') && (
                    <MenuItem
                      className={classes.horizTableMenuItem}
                      onClick={editAction}
                      style={{ borderBottom: '1px dashed #000000' }}
                    >
                      Manage Inventory Company
                    </MenuItem>
                  )}
                  {editAction && (isAdmin === true || isAdmin === 'true') && (
                    <MenuItem
                      className={classes.horizTableMenuItem}
                      onClick={this.handleProductDealerInfoDialogOpen}
                      style={{ borderBottom: '1px dashed #000000' }}
                    >
                      Manage Product Dealer Info
                    </MenuItem>
                  )}
                  {editAction && (isAdmin === true || isAdmin === 'true') && (
                    <MenuItem
                      id="importCsvRegularCom"
                      className={classes.horizTableMenuItem}
                      style={{ borderBottom: '1px dashed #000000' }}
                      onClick={() => {
                        this.productsFileInput.current.click();
                      }}
                    >
                      <input
                        name="upload"
                        type="file"
                        onChange={this.importProductsCSV}
                        ref={this.productsFileInput}
                        style={{ display: 'none' }}
                      />
                      Import products CSV
                    </MenuItem>
                  )}
                  {/* {editAction && (isAdmin === true || isAdmin === 'true') && (
                    <MenuItem
                      className={classes.horizTableMenuItem}
                      style={{ borderBottom: '1px dashed #000000' }}
                      onClick={async () => {
                        await this.exportInventory(false, renderProducts, 'Inventory');
                        this.props.history.push({
                          pathname: `/app/csv_preview/${companyName}Inventory`,
                          state: { csvdata: this.state.inventoryCsvdata, seedList: this.state.inventoryListData },
                        });
                      }}
                      id="nonBayerInventory"
                    >
                      Download Inventory
                    </MenuItem>
                  )} */}
                  {editAction && (isAdmin === true || isAdmin === 'true') && (
                    <MenuItem
                      className={classes.horizTableMenuItem}
                      style={{ borderBottom: '1px dashed #000000' }}
                      onClick={async () => {
                        await this.exportInventory(true, renderProducts, 'GrowerDetail');
                        this.props.history.push({
                          pathname: `/app/csv_preview/${companyName}GrowerDetail`,
                          state: { csvdata: this.state.inventoryCsvdata, seedList: this.state.inventoryListData },
                        });
                      }}
                      id="nonBayerGrowerDetail"
                    >
                      Download Grower Detail
                    </MenuItem>
                  )}
                  {editAction && (isAdmin === true || isAdmin === 'true') && (
                    <MenuItem
                      className={classes.horizTableMenuItem}
                      style={{ borderBottom: '1px dashed #000000' }}
                      onClick={async () => {
                        await this.exportGrowerSummary();
                        this.props.history.push({
                          pathname: `/app/csv_preview/${companyName}GrowerSummary`,
                          state: { csvdata: this.state.inventoryCsvdata, seedList: this.state.inventoryListData },
                        });
                      }}
                      id="nonBayerGrowerSummary"
                    >
                      Download Grower Summary
                    </MenuItem>
                  )}
                  <MenuItem
                    className={classes.horizTableMenuItem}
                    style={{ borderBottom: '1px dashed #000000' }}
                    onClick={() => this.exportTemplateCsv()}
                  >
                    Download Template CSV File
                  </MenuItem>
                  <MenuItem className={classes.horizTableMenuItem}>
                    <Checkbox onChange={this.handleShowDetailView} checked={showDetailView} />
                    Show Detail View
                  </MenuItem>
                  {isSeedCompany && (
                    <MenuItem className={classes.horizTableMenuItem}>
                      <Checkbox onChange={this.handleShowFavoriteProducts} checked={showFavoriteProducts} />
                      Show Favorite Products
                    </MenuItem>
                  )}

                  {/* {(isAdmin === true || isAdmin === "true") && (
                    <MenuItem
                      className={classes.horizTableMenuItem}
                      onClick={deleteAction}
                    >
                      {deleteText}
                    </MenuItem>
                  )} */}
                  {/* <MenuItem
                    className={classes.horizTableMenuItem}
                    onClick={savePageAsPdf}
                  >
                    Save as PDF
                  </MenuItem> */}
                </MenuList>
              </Paper>
            </Popover>
            {toggleColumns && (
              <ColumnMenu
                onColumnUpdate={this.toggleColumnMenu}
                columns={columns}
                productType="foo" // TODO: remove this property, not needed at all
                className={classes.columnMenu}
              />
            )}
            {(isAdmin === true || isAdmin === 'true') && (
              <Button
                className="hide-print"
                color="primary"
                id="productAdd"
                onClick={this.addNewProduct}
                disabled={isAddingSeedProduct || isLoadProduct}
              >
                Add Product
              </Button>
            )}
          </div>
          <div id="nonBayer_table">
            {' '}
            {isLoading && renderProducts.length <= 0 ? (
              <div className="-loading -active">
                <div style={{ display: 'flex', justifyContent: 'center', margin: '30px' }}>
                  <CircularProgress />
                </div>
              </div>
            ) : (
              <ReactTable
                // data={sortBy(renderProducts, (o) => (o && o.name ? o.name : o.brand)) || []}
                data={renderProducts || []}
                columns={columns.filter((c) => c.show !== false && c.show !== undefined)}
                resizable={true}
                //defaultPageSize={products.length}
                pageSize={renderProducts ? renderProducts.length : 0}
                getTdProps={() => {
                  let style = { overflow: 'visible' };
                  return { style };
                }}
                getTrProps={
                  renderProducts.length !== 0
                    ? this.getTrProps
                    : (state, rowInfo) => ({
                        style: {
                          maxHeight: 'max-content',
                        },
                      })
                }
                getTrGroupProps={(state, rowInfo, column) => ({
                  style: {
                    maxHeight: 'max-content',
                  },
                })}
                getTbodyProps={() => ({
                  style: {
                    overflow: 'visible !important',
                  },
                })}
                expanded={expandedRows}
                onExpandedChange={(newExpanded, index, event) => {
                  this.handleExpandedChange(newExpanded);
                }}
                minRows={1}
                showPagination={false}
                // className={classes.productTable + ' -striped -highlight'}
                SubComponent={(row) => {
                  if (expandedRows[row.index]) {
                    return (
                      <ReactTable
                        data={
                          row.original.hasOwnProperty('seedCompanyId') ? row.original.lots : row.original.customLots
                        }
                        pageSize={
                          row.original.hasOwnProperty('seedCompanyId')
                            ? row.original.lots
                              ? row.original.lots.length
                              : 0
                            : row.original.customLots
                            ? row.original.customLots.length
                            : 0
                        }
                        columns={this.subColumns}
                        showPagination={false}
                        style={{ border: '1px black solid' }}
                      />
                    );
                  } else {
                    return null;
                  }
                }}
              />
            )}
          </div>

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
                    this.editProduct(activeTableItem);
                    this.handleTableItemActionMenuClose();
                  }}
                >
                  Edit
                </MenuItem>

                <MenuItem
                  id="nonBayerTransfer"
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.handleLotsDialogOpen(activeTableItem);
                    this.handleTableItemActionMenuClose();
                  }}
                >
                  Dealer To Dealer Transfers
                </MenuItem>
                <MenuItem
                  id="nonBayerReceived"
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.handleReturnDialogOpen(activeTableItem);
                    this.handleTableItemActionMenuClose();
                  }}
                >
                  Dealer Received & Returns
                </MenuItem>
                <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.handleProductRelatedInfoDialogOpen(activeTableItem, 'purchase_orders');
                    this.handleTableItemActionMenuClose();
                  }}
                >
                  Purchase orders
                </MenuItem>
                <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.handleProductRelatedInfoDialogOpen(activeTableItem, 'quotes');
                    this.handleTableItemActionMenuClose();
                  }}
                >
                  Quotes
                </MenuItem>
                <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    deleteProduct(activeTableItem);
                    this.handleTableItemActionMenuClose();
                  }}
                >
                  Delete
                </MenuItem>
                {/* <MenuItem
                className={classes.addNewMenuItem}
                onClick={() => {
                  let pathname = isSeedCompany
                    ? `/app/seed_companies/${seedCompany.id}/${activeTableItem.id}/edit`
                    : `/app/companies/${companyId}/products/${activeTableItem.id}/edit`;
                  history.push({
                    pathname: pathname,
                    state: { selectedTab: tabIndex }
                  });
                }}
              >
                Edit
              </MenuItem> */}
              </MenuList>
            </Paper>
          </Popover>
          {lotsDialogOpen && (
            <LotsDialog
              open={lotsDialogOpen}
              onClose={this.handleLotsDialogClose}
              productType={productType}
              productId={lotsItem.id}
              deliveryReceipts={deliveryReceipts}
              companyType={isSeedCompany ? 'Seed Company' : 'Company'}
              companyId={isSeedCompany ? seedCompany.id : companyId}
            />
          )}
          {returnDialogOpen && (
            <ReturnDialog
              open={returnDialogOpen}
              onClose={this.handleReturnDialogClose}
              productType={productType}
              productId={lotsItem.id}
              deliveryReceipts={deliveryReceipts}
              companyType={isSeedCompany ? 'Seed Company' : 'Company'}
              companyId={isSeedCompany ? seedCompany.id : companyId}
            />
          )}
          {packagesDialogOpen && (
            <PackageDialog
              open={packagesDialogOpen}
              onClose={this.handlePackagesDialogClose}
              seedCompany={seedCompany}
            />
          )}
          {seedSizesDialogOpen && (
            <SeedSizeDialog
              open={seedSizesDialogOpen}
              onClose={this.handleseedSizesDialogClose}
              seedCompany={seedCompany}
            />
          )}
          {productDealerInfoDialogOpen && (
            <ProductDealerInfoDialog
              open={productDealerInfoDialogOpen}
              onClose={this.handleProductDealerInfoDialogClose}
              companyType={isSeedCompany ? 'Seed Company' : 'Company'}
              companyId={isSeedCompany ? seedCompany.id : companyId}
            />
          )}
          {productRelatedInfoDialogOpen && (
            <ProductRelatedInfoDialog
              context={productRelatedInfoDialogContext}
              open={productRelatedInfoDialogOpen}
              onClose={this.handleProductRelatedInfoDialogClose}
              productRelatedPurchaseOrders={selectedProductRelatedPurchaseOrders}
              product={selectedProduct}
              deliveryReceipts={deliveryReceipts}
              companyType={isSeedCompany ? 'Seed Company' : 'Company'}
            />
          )}
        </GridItem>
      </GridContainer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProductTable);
