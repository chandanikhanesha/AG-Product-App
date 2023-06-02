import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
// import SweetAlert from "react-bootstrap-sweetalert";
// import sweetAlertStyle from "assets/jss/material-dashboard-pro-react/views/sweetAlertStyle";
import { flatten } from 'lodash/array';

// core components
import ReactTable from 'react-table';
import Creatable from 'react-select/creatable';

import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import FormControl from '@material-ui/core/FormControl';
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
// import Tooltip from "@material-ui/core/Tooltip";

import {
  getQtyOrdered,
  getQtyShipped,
  getGrowerOrder,
  getGrowerOrderDelivered,
  getTransferInAmount,
  getTransferOutAmount,
  getCustomerProducts,
} from '../../../utilities/product';

import styles from '../productTableStyles';
import moment from 'moment';
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
      lotsItem: null,
      originProducts: [],
      products: [],
      suggestions: [],
      isAddingSeedProduct: false,
      editItems: [],
      isChangingItemsCount: 0,
      showDetailView: false,
      selectedSeedDealer: null,
      productDealers: [],
      productRelatedPurchaseOrders: null,
      selectedProductRelatedPurchaseOrders: [],
      selectedProduct: null,
    };
  }

  print = () => {
    this.setState({ horizMenuOpen: false }, this.props.print);
  };

  componentWillMount = async () => {
    const {
      customerProducts,
      deliveryReceipts,
      seedCompany,
      productType,
      selectedSeason,
      productDealers,
      seedCompanyId,
      companyId,
      customers,
      // company
    } = this.props;
    // const { isAddingSeedProduct } = this.state;
    let products = this.props.products;
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
    const productRelatedPurchaseOrders = getCustomerProducts(customers, companyType, dealerCompanyId, deliveryReceipts);
    this.setState(
      {
        productRelatedPurchaseOrders,
        originProducts: JSON.parse(JSON.stringify(productDatas)),
        products: JSON.parse(JSON.stringify(productDatas)),
        isChangingItemsCount: 0,
        productDealers: productDealers
          .filter(
            (productDealer) => productDealer.companyType === companyType && productDealer.companyId === dealerCompanyId,
          )
          .sort((a, b) => a.id - b.id),
      },
      () => {
        this.setTableTotalData();
      },
    );

    if (productType === 'custom') {
      const { classes } = this.props;
      const suggestionsSet = this.props.customProducts.reduce(
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
          Header: 'Product',
          id: 'name',
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          accessor: (d) => d,
          sortable: true,
          Cell: (props) => {
            const name = this.state.products.find((product) => product.id === props.value.id).name;
            return props.value.isChanging ? (
              <div style={{}}>
                <Creatable
                  backspaceRemovesValue={true}
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
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          accessor: (d) => d,
          sortable: true,
          Cell: (props) => {
            const type = this.state.products.find((product) => product.id === props.value.id).type;
            return props.value.isChanging ? (
              <div style={{}}>
                <Creatable
                  backspaceRemovesValue={true}
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
              <div>{props.value.type}</div>
            );
          },
        },
        {
          Header: 'Description',
          id: 'description',
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          accessor: (d) => d,
          sortable: true,
          Cell: (props) => {
            const description = this.state.products.find((product) => product.id === props.value.id).description;
            return props.value.isChanging ? (
              <div style={{}}>
                <Creatable
                  backspaceRemovesValue={true}
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
              <div>{props.value.description}</div>
            );
          },
        },
        {
          Header: 'ID',
          id: 'customId',
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          accessor: (d) => d,
          sortable: true,
          Cell: (props) =>
            props.value.isChanging ? (
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
              <div>{props.value.customId}</div>
            ),
        },
        {
          Header: 'Unit',
          id: 'unit',
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          accessor: (d) => d,
          sortable: true,
          Cell: (props) =>
            props.value.isChanging ? (
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
              <div>{props.value.unit}</div>
            ),
        },
        {
          Header: 'Cost per unit',
          id: 'costUnit',
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          accessor: (d) => d,
          sortable: true,
          Cell: (props) =>
            props.value.isChanging ? (
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
              <div>{props.value.costUnit}</div>
            ),
        },
        {
          Header: 'Quantity',
          id: 'quantity',
          headerStyle: {
            fontWeight: 'bold',
            fontSize: '18px',
            color: '#000000',
          },
          show: true,
          accessor: (d) => d,
          sortable: true,
          Cell: (props) =>
            props.value.isChanging ? (
              <React.Fragment>
                <FormControl>
                  <CustomInput
                    id={'quantity'}
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      type: 'number',
                      value: props.value.quantity,
                      onChange: this.handleProductsInputChange('quantity', props.value),
                      name: 'quantity',
                    }}
                  />
                </FormControl>
              </React.Fragment>
            ) : (
              <div>{props.value.quantity}</div>
            ),
        },
      ];
      this.setState({ columns, originalColumns: columns });
    } else {
      const metadata = JSON.parse(seedCompany.metadata);
      const columns = [];
      const { classes } = this.props;

      const suggestionsSet = this.props.products.reduce(
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

      const suggestions = {
        brand: [...suggestionsSet.brand].map(formatData),
        blend: [...suggestionsSet.blend].map(formatData),
        treatment: [...suggestionsSet.treatment].map(formatData),
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

      const addField = (field, content) => {
        if (!metadata[productType][field]) return;
        columns.push(content);
      };

      addField('brand', {
        Header: 'Trait',
        id: 'brand',
        show: true,
        className: 'sticky',
        headerClassName: 'sticky',
        headerStyle: {
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return null;
          const brand = this.state.products.find((product) => product.id === item.id).brand;
          return item.isChanging ? (
            item.seedType !== 'SORGHUM' && (
              <div style={{}}>
                <Creatable
                  backspaceRemovesValue={true}
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
        className: 'sticky sticky-blend',
        headerClassName: 'sticky sticky-blend',
        headerStyle: {
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        show: true,
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return null;
          return item.isChanging ? (
            <div>
              <Creatable
                backspaceRemovesValue={true}
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
        className: 'sticky sticky-rm',
        headerClassName: 'sticky sticky-rm',
        headerStyle: {
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        id: 'rm',
        show: true,
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return null;
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
      addField('treatment', {
        Header: 'Treatment',
        id: 'treatment',
        show: true,
        headerStyle: {
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return null;
          return item.isChanging ? (
            <div>
              <Creatable
                backspaceRemovesValue={true}
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
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        id: 'msrp',
        // className: "hide-print",
        show: true,
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return null;
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

      columns.push({
        Header: () => (
          <div>
            Seed Company/
            <br />
            Ordered
          </div>
        ),
        headerTitle: 'Seed Company/Ordered',
        show: true,
        headerStyle: {
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        id: 'qtyOrderedFromSeedCo',
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
            Shipped/Unsh
          </div>
        ),
        headerTitle: 'Seed Company/Shipped/Unsh',
        id: 'qty-shipped-from-seed-co',
        show: true,
        headerStyle: {
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder'))
            return `${item.seedCompanyTotalShipped}/${item.seedCompanyTotalUnShipped}`;
          const shipped = getQtyShipped(item),
            unshipped = getQtyOrdered(item) - getQtyShipped(item);
          return `${shipped}/${unshipped}`;
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
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        show: true,
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return item.growerTotalOrder;
          return getGrowerOrder(item, customerProducts);
        },
      });

      columns.push({
        Header: () => (
          <div>
            Grower/
            <br />
            Shipped/Unsh
          </div>
        ),
        id: 'deliveredGrowerOrder',
        headerTitle: 'Grower/Shipped/Unsh',
        headerStyle: {
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        show: true,
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder'))
            return `${item.growerTotalShipped}/${item.growerTotalUnShipped}`;
          const shipped = getGrowerOrderDelivered(item, deliveryReceiptDetails),
            unshipped = customerProducts
              .filter((order) => order.productId === item.id)
              .reduce((unDelivered, acc) => unDelivered + (acc.orderQty - acc.amountDelivered), 0);
          return `${shipped}/${unshipped}`;
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
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        show: true,
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder'))
            return `${item.seedDealerTotalTransferIn}/${item.seedDealerTotalTransferOut}`;
          const transferIn = getTransferInAmount(item),
            transferOut = getTransferOutAmount(item);
          return `${transferIn}/${transferOut}`;
        },
      });

      addField('longShort', {
        Header: 'Long / Short',
        show: true,
        //headerStyle: styles.columnHeaderOverride,
        id: 'longShort',
        headerStyle: {
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return item.longShorttotal;
          return getQtyOrdered(item) - getGrowerOrder(item, customerProducts);
        },
      });
      addField('qtyWarehouse', {
        Header: 'Warehouse/On-hand ',
        show: true,
        //headerStyle: styles.columnHeaderOverride,
        headerStyle: {
          fontWeight: 'bold',
          fontSize: '14px',
          color: '#000000',
        },
        id: 'availableQuantity',
        accessor: (d) => d,
        Cell: (props) => {
          const item = props.value;
          if (item.hasOwnProperty('seedCompanyTotalOrder')) return item.warehouseTotal;
          return (
            getQtyShipped(item) +
            getTransferInAmount(item) -
            getTransferOutAmount(item) -
            getGrowerOrderDelivered(item, deliveryReceiptDetails)
          );
        },
      });

      this.setState({
        columns,
        originalColumns: columns,
      });
    }
  };

  componentDidUpdate(prevProps, prevState) {
    const { productType } = this.props;
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

  componentDidMount = async () => {
    const { listDeliveryReceipts } = this.props;

    await listDeliveryReceipts();
  };

  handleProductsInputChange = (field, currentProduct) => (data) => {
    const value =
      field === 'customId' || field === 'unit' || field === 'costUnit' || field === 'quantity'
        ? data.target.value
        : data.value;

    if (value == null) return;
    let products = this.state.products;
    switch (field) {
      case 'name':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.name = value;
            product.isChanging = true;
          });
        break;
      case 'type':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.type = value;
            product.isChanging = true;
          });
        break;
      case 'description':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.description = value;
            product.isChanging = true;
          });
        break;
      case 'customId':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.customId = value;
            product.isChanging = true;
          });
        break;
      case 'unit':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.unit = value;
            product.isChanging = true;
          });
        break;
      case 'costUnit':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.costUnit = value;
            product.isChanging = true;
          });
        break;
      case 'quantity':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.quantity = value;
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
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.name = value;
            product.isChanging = true;
          });
        break;
      case 'type':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.type = value;
            product.isChanging = true;
          });
        break;
      case 'description':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.description = value;
            product.isChanging = true;
          });
        break;
      case 'customId':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.customId = value;
            product.isChanging = true;
          });
        break;
      case 'unit':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.unit = value;
            product.isChanging = true;
          });
        break;
      case 'costUnit':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.costUnit = value;
            product.isChanging = true;
          });
        break;
      case 'quantity':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.quantity = value;
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
    let value = field === 'msrp' || field === 'rm' ? data.target.value : data.value;
    if (value == null) return;
    let products = this.state.products;
    switch (field) {
      case 'brand':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.brand = value;
            product.isChanging = true;
          });
        break;
      case 'blend':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.blend = value;
            let rm = this.getRmForProduct(product);
            product.rm = rm;
            product.isChanging = true;
          });
        break;
      case 'treatment':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.treatment = value;
            product.isChanging = true;
          });
        break;
      case 'msrp':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.msrp = value;
            product.isChanging = true;
          });
        break;
      case 'rm':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.rm = value;
            product.isChanging = true;
          });
      default:
        break;
    }

    this.setState({
      products: products,
    });
  };

  handleSeedCompanyProductsChange = (field, currentProduct) => (data) => {
    if (!data) data = {};
    let products = this.state.products;
    const { value } = data;
    switch (field) {
      case 'brand':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.brand = value;
            product.isChanging = true;
          });
        break;
      case 'blend':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.blend = value;
            let rm = this.getRmForProduct(product);
            product.rm = rm;
            product.isChanging = true;
          });
        break;
      case 'treatment':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.treatment = value;
            product.isChanging = true;
          });
        break;
      case 'msrp':
        products
          .filter((product) => product.id === currentProduct.id)
          .forEach((product) => {
            product.msrp = data.target.value;
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
      if (columns.length > 8) {
        let newColumns = columns.slice(1, 6);
        newColumns.push(columns[0]);
        this.setState({ columns: newColumns });
      } else {
        let newColumns = columns.slice(1, 8);
        newColumns.push(columns[0]);
        this.setState({ columns: newColumns });
      }
    }
    this.setState({ isChangingItemsCount: isChangingItemsCount + 1 });
  };

  updateSeedCompanyProduct = async (currentProduct) => {
    const { updateProduct, listProducts, seedCompanyId } = this.props;
    const { originProducts, products, isChangingItemsCount } = this.state;
    const { seedType, brand, blend, treatment, quantity, msrp, lots, rm } = currentProduct;

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
        modifiedLotRows: lots,
        seedCompanyId,
      });

      newProducts
        .filter((product) => product.id === currentProduct.id)
        .forEach((product) => {
          product.brand = currentProduct.brand;
          product.blend = currentProduct.blend;
          product.treatment = currentProduct.treatment;
          product.msrp = currentProduct.msrp;
          product.isChanging = false;
        });

      newOriginalProducts
        .filter((product) => product.id === currentProduct.id)
        .forEach((product) => {
          product.brand = currentProduct.brand;
          product.blend = currentProduct.blend;
          product.treatment = currentProduct.treatment;
          product.msrp = currentProduct.msrp;
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
        msrp: parseInt(msrp, 10),
        rm: parseInt(rm || 0, 10),
        organizationId,
        seedCompanyId: seedCompanyId,
        orderAmount: 0,
        deliveredAmount: 0,
        modifiedLotRows: [],
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
          product.isChanging = false;
        });
    }

    this.setState(
      {
        isChangingItemsCount: isChangingItemsCount - 1,
        columns: isChangingItemsCount - 1 === 0 ? this.state.originalColumns : this.state.columns,
        products: newProducts,
        originProducts: newOriginalProducts,
      },
      () => {
        listProducts(true);
      },
    );
  };

  updateCompanyProduct = async (currentProduct) => {
    const { updateCustomProduct, listAllCustomProducts } = this.props;
    const { originProducts, products, isChangingItemsCount } = this.state;
    const { id, name, type, description, unit, customId, costUnit, quantity } = currentProduct;
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
          product.isChanging = false;
        });
    }

    this.setState(
      {
        isChangingItemsCount: isChangingItemsCount - 1,
        columns: isChangingItemsCount - 1 === 0 ? this.state.originalColumns : this.state.columns,
        products: newProducts,
        originProducts: newOriginalProducts,
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
        product.isChanging = false;
      });

    this.setState(
      {
        isChangingItemsCount: isChangingItemsCount - 1,
        columns: isChangingItemsCount - 1 === 0 ? this.state.originalColumns : this.state.columns,
        products: newProducts,
        originProducts: newOriginalProducts,
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
        quantity: 0,
        customId: 0,
        isChanging: true,
      };
      let newColumns = columns.slice(1, 8);
      newColumns.push(columns[0]);
      this.setState({ columns: newColumns });

      this.setState({
        isChangingItemsCount: isChangingItemsCount + 1,
        products: [newProduct, ...products],
        columns: isChangingItemsCount < 1 ? newColumns : columns,
      });
    } else {
      let newColumns = columns.slice(1, 6);
      newColumns.push(columns[0]);
      newProduct = {
        seedType: productType,
        brand: '',
        blend: '',
        treatment: '',
        quantity: 0,
        msrp: 0,
        orderAmount: 0,
        deliveredAmount: 0,
        seedCompanyId: seedCompany.id,
        modifiedLotRows: [],
        isChanging: true,
      };

      this.setState({
        isChangingItemsCount: isChangingItemsCount + 1,
        products: [newProduct, ...products],
        isAddingSeedProduct: true,
        columns: isChangingItemsCount < 1 ? newColumns : columns,
      });
    }
  };

  setTableTotalData = () => {
    const { customerProducts, deliveryReceipts } = this.props;
    const { products } = this.state;
    const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));
    if (products.length < 1) return;
    if (products[0].hasOwnProperty('companyId')) return;
    let seedCompanyTotalOrder = 0,
      seedCompanyTotalShipped = 0,
      seedCompanyTotalUnShipped = 0,
      growerTotalOrder = 0,
      growerTotalShipped = 0,
      growerTotalUnShipped = 0,
      seedDealerTotalTransferIn = 0,
      seedDealerTotalTransferOut = 0,
      longShorttotal = 0,
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
      });
    let newProducts = [
      {
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
      },
      ...products.filter((product) => product.id),
    ];
    this.setState({ products: newProducts });
  };

  setExpanded = (rows) => {
    return rows.map((row) => true);
  };

  handleShowDetailView = (event) => {
    this.setState({ showDetailView: event.target.checked });
  };

  handleSeedDealerChange = (event) => {
    const { productType } = this.props;
    const { products, originProducts } = this.state;
    const selectedSeedDealer = event.target.value;

    if (!selectedSeedDealer) {
      this.setState({ products: originProducts });
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
    this.setState({ selectedSeedDealer, products: newProducts }, () => {
      this.setTableTotalData();
    });
  };

  getSortData = () => {
    const { products } = this.state;
    const productsTotal = products.find((product) => !product.hasOwnProperty('id'));
    const _products = products.filter((_product) => _product.id);
    const result = _products.sort(
      (a, b) => a.blend.localeCompare(b.blend) || (a.treatment && a.treatment.localeCompare(b.treatment)),
    );
    return productsTotal ? [productsTotal, ...result] : result;
  };

  render() {
    const { columns, products } = this.state;
    const { classes, productType } = this.props;

    let isSeedCompany = productType !== 'custom';
    let renderProducts = isSeedCompany ? this.getSortData() : products;
    return (
      <GridContainer className={classes.productTableContainer}>
        <GridItem xs={12}>
          <ReactTable
            data={renderProducts || []}
            columns={columns}
            resizable={true}
            //defaultPageSize={products.length}
            pageSize={products ? products.length : 0}
            getTdProps={() => {
              let style = { overflow: 'visible' };
              return { style };
            }}
            minRows={1}
            showPagination={false}
            className={classes.productTable + ' -striped -highlight'}
          />
        </GridItem>
      </GridContainer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProductTable);
