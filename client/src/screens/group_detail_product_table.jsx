import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { flatten } from 'lodash/array';
import { sortBy } from 'lodash';
import Tooltip from '@material-ui/core/Tooltip';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import SweetAlert from 'react-bootstrap-sweetalert';
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';

import 'react-accessible-accordion/dist/fancy-example.css';
import Dialog from '@material-ui/core/Dialog';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import { DatePicker } from '@material-ui/pickers';
import Grow from '@material-ui/core/Grow';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Input from '@material-ui/core/Input';
import classnames from 'classnames';
import { uniq } from 'lodash/array';

import axios from 'axios';
// core components
import GridContainer from '../components/material-dashboard/Grid/GridContainer';
import GridItem from '../components/material-dashboard/Grid/GridItem';
import ReactTable from 'react-table';
import Button from '../components/material-dashboard/CustomButtons/Button';

import Snackbar from '@material-ui/core/Snackbar';
import MoreHoriz from '@material-ui/icons/MoreHoriz';

import '../components/inventory/pt.css';
import ProductSelector from '../screens/purchase_order/product_selector/index';
import 'react-table/react-table.css';
// import SweetAlert from 'react-bootstrap-sweetalert';

// custom component
import ColumnMenu from '../components/inventory/column_menu';
import Slide from '@material-ui/core/Slide';
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';
import {
  getWareHouseValue,
  getCustomerProducts,
  getDeliveryLotsQty,
  getDeliveryLotsQtyReturn,
} from '../utilities/product';
import { downloadCSV, createDealerFromCSV } from '../utilities/csv';

import styles from '../components/inventory/productTableStyles';

import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';

import { groupBy } from 'lodash';
import moment from 'moment';

import {
  checkInInventoryProductAvailability,
  listMonsantoProducts,
  listAllCustomProducts,
  updateIsChange,
  listApiSeedCompanies,
  listDeliveryReceipts,
  listRetailerOrderSummary,
  updateCurrentCropType,
  listSeedCompanies,
  checkShortProductProductAvailability,
} from '../store/actions';
import { Checkbox, FormControlLabel } from '@material-ui/core';

const seedTypeClassificationMap = {
  CORN: 'C',
  SOYBEAN: 'B',
  SORGHUM: 'S',
  // ALFALFA: 'A',
  CANOLA: 'L',
  PACKAGING: 'P',
};

const mapObj = {
  C: 'CORN',
  B: 'SOYBEAN',
  S: 'SORGHUM',
  // A: 'ALFALFA',
  L: 'CANOLA',
  // P: 'PACKAGING',
};
let totalDataRow;
const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

class GroupDetailProductTable extends Component {
  state = {
    columnsTable: [],
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
      { id: 'seedSize', name: 'Seed Size' },
      { id: 'packaging', name: 'packaging' },
      // { id: 'productDetail', name: 'productDetail' },
    ],
    changeSupplyValue: 0,
    syncBayerConfirm: null,
    deliveryReceiptDetails: [],
    horizMenuOpen: false,
    showAddFavoriteProductsDialog: false,
    favoriteProducts: [],
    showFavoriteProducts: true,
    showRetailerProducts: true,
    showFavoriteProductsAll: false,
    data: [],
    searchString: '',
    lotsItem: null,
    historyDialogOpen: false,
    selectedProduct: [],
    fieldShow: false,
    serchText: '',
    groupData: false,
    packagingData: [],
    isLoadingData: true,
    seedCompanyId: null,
    selectedColumnIds: [],
    productDetail: '',
    monsantoData: [],
    renderList: false,
    fillShortProduct: [],
    fillDealerQty: [],
    isFetch: false,
    tableGroupData: [],
    retailOrderSummaryLasySyncDate: null,
    isLastUpdateLoading: false,
    showSnackBar: false,
    showDealerQty: false,
    callGetUpdate: false,
    showProductForm: false,
    showFavoriteProducts: false,
    seedType: 'CORN',
    monsantoProducts: [],
    activeTableItem: null,
    openSwapModel: false,
    updateSeedConfirm: null,
  };

  handleSelectProduct = (value) => {
    const data = this.availableItems().filter((po) => po.id === value);
    this.setState({ productDetail: value, selectedProduct: data[0] });
  };

  handleTableItemActionMenuOpen = (item) => (event) => {
    this.setState({
      tableItemActionMenuOpen: true,
      tableItemActionAnchorEl: event.target,
      activeTableItem: item,
    });
  };
  componentDidMount = async () => {
    const {
      listDeliveryReceipts,
      listApiSeedCompanies,
      listRetailerOrderSummary,
      organizationId,
      apiSeedCompanies,
      monsantoRetailerOrderSummaryProducts,
    } = this.props;
    const seedCompanyId = parseInt(this.props.match.path.match(/seed_companies\/([0-9]*)/)[1], 10);
    await listApiSeedCompanies();
    await listDeliveryReceipts();
    const apiSeedCompanie = apiSeedCompanies.find((sc) => sc.id === seedCompanyId);
    const apiSeedCompanieZone = apiSeedCompanie.zoneIds;
    const monsantoNewProducts = localStorage.getItem('monsantoNewProducts');
    this.setState({
      monsantoProducts: apiSeedCompanie.Products,
      selectedProduct: monsantoNewProducts == null ? [] : JSON.parse(monsantoNewProducts),
    });

    JSON.parse(apiSeedCompanieZone).map(async (c) => {
      axios
        .get(`${process.env.REACT_APP_API_BASE}/monsanto/retailer_orders/allSummary/${seedCompanyId}`, {
          headers: { 'x-access-token': localStorage.getItem('authToken') },
        })
        .then((data1) => {
          this.setState({ isLoadingData: false });
          this.setState({ monsantoData: data1.data.items });
          let data = [];

          const helper = {};

          const monsantoRetailerOrderSummaryProductsFilter = [];

          data1.data.items.reduce(function (r, o) {
            const key =
              o.Product.brand +
              '-' +
              o.Product.blend +
              '-' +
              o.Product.treatment +
              '-' +
              o.Product.packaging +
              '-' +
              o.Product.seedSize +
              '-' +
              o.Product.productDetail;

            if (!helper[key]) {
              helper[key] = Object.assign({}, o); // create a copy of o
              monsantoRetailerOrderSummaryProductsFilter.push(helper[key]);
            } else {
              helper[key].Product.allseedSize = helper[key].Product.seedSize + ' ' + o.Product.seedSize;
              helper[key].Product.allpackaging = helper[key].Product.packaging + ' ' + o.Product.packaging;
              helper[key].totalRetailerProductQuantityValue =
                parseInt(helper[key].totalRetailerProductQuantityValue) + parseInt(o.totalRetailerProductQuantityValue);
              helper[key].allGrowerQty = parseInt(helper[key].allGrowerQty) + parseInt(o.allGrowerQty);
              helper[key].demand = parseInt(helper[key].demand) + parseInt(o.demand);
              helper[key].bayerDealerBucketQty =
                parseInt(helper[key].bayerDealerBucketQty) + parseInt(o.bayerDealerBucketQty);
              helper[key].supply = parseInt(helper[key].supply) + parseInt(o.supply);
            }
            return r;
          }, {});
          // assign table data value
          if (this.state.showRetailerProducts) data = data.concat(monsantoRetailerOrderSummaryProductsFilter);

          const { tableData } = this.getTableData(
            data.sort((x, y) => (x.isChanged === y.isChanged ? 0 : x.isChanged ? -1 : 1)),
          );
          this.setState({
            tableGroupData: [...tableData, ...(monsantoNewProducts == null ? [] : JSON.parse(monsantoNewProducts))],
          });
        });
    });

    this.renderTable();
    this.setState({
      seedCompanyId: seedCompanyId,
      selectedColumnIds:
        this.props.apiSeedCompanies &&
        this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId) &&
        this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId).lastSelectedColumnSummaryOption !==
          undefined
          ? this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId).lastSelectedColumnSummaryOption
          : [],
    });
    setTimeout(() => {
      this.renderTable();
    }, 3000);
    setTimeout(() => {
      this.setState({ callGetUpdate: true });
    }, 6000);
  };

  setItem(property, value, i, editType) {
    const { columns, monsantoProducts } = this.state;

    let update = {
      [property]: property === 'seedSource' && value === null ? undefined : value,
    };

    // allow customer to select 'blend' (2nd column) before 'blend' (1st column)

    if (i === 1 && !this.state[columns[i - 1].id]) {
      let product = monsantoProducts.find((p) => p[property] === value);
      update[columns[i - 1].id] = product[columns[i - 1].id];
    }

    // null all following columns
    if (editType !== 'sop') {
      for (let x = i + 1; x < columns.length; x++) {
        update[columns[x].id] = null;
      }
    }

    this.setState(update);
  }

  previousColumnSelected(i) {
    const { columns } = this.state;

    if (columns[i].id === 'blend') return true;
    return i === 0 || this.state[columns[i - 1].id];
  }
  availableTypes(itemType, i, search) {
    const { products, purchaseOrder, apiSeedCompanies } = this.props;
    const { columns, seedType, seedCompanyId, monsantoProducts } = this.state;

    let available = [];
    const classificationSeedTypeMap = {
      B: 'SOYBEAN',
      C: 'CORN',
      S: 'SORGHUM',
      // A: 'ALFALFA',
      L: 'CANOLA',
      // P: 'PACKAGING',
    };
    let types;
    available = monsantoProducts;

    if (seedType !== 'BUSINESS') {
      available =
        available &&
        available.filter((p) => {
          if (search && p.blend) {
            return p.blend.toLowerCase().includes(search.toLowerCase());
          } else {
            return p.blend;
          }
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
            // .filter((p) => (p.classification ? classificationSeedTypeMap[p.classification] === seedType : p))
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
          // .filter((p) => (p.classification ? classificationSeedTypeMap[p.classification] === seedType : p))
          .map((product) => product[itemType]),
    );

    if (itemType === 'blend' || itemType === 'brand') types && types.sort((a, b) => a && a.localeCompare(b));

    return types;
  }
  columnIsSelected(column, item) {
    if (column.id === 'seedSource' && this.state[column.id] === undefined && item === null) {
      return true;
    }

    return this.state[column.id] == item;
  }
  availableItems() {
    const { products, apiSeedCompanies, setIsDisabledCheckBtn } = this.props;
    const { columns, seedCompanyId, monsantoProducts } = this.state;

    let available = monsantoProducts;

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
      }
    });
    return available;
  }
  handleTableItemActionMenuClose = () => {
    this.setState({
      tableItemActionMenuOpen: false,
      activeTableItem: null,
      products: this.state.products,
      openSwapModel: false,
    });
  };

  handleShowFavoriteProducts = (event) => {
    this.setState({ showFavoriteProducts: event.target.checked });
  };

  componentDidUpdate(prevProps) {
    if (
      this.state.callGetUpdate &&
      this.state.tableGroupData.length > 0 &&
      this.state.retailOrderSummaryLasySyncDate == null
    ) {
      this.setState({
        retailOrderSummaryLasySyncDate: this.state.tableGroupData[0].action.retailOrderSummaryLasySyncDate,
      });

      // this.getTheUpdate(this.state.tableGroupData[0].action.retailOrderSummaryLasySyncDate);
    }
  }
  groupDataChange = () => {
    this.setState({ groupData: !this.state.groupData });
  };

  handleSearchTextChange = (event) => {
    this.setState({ serchText: event.target.value });
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

  titleCase = (str) => {
    var splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
  };

  get isApiSeedCompanyProductsDublicate() {
    return this.props.history.location.pathname.match(/^\/app\/d_api_seed_companies/);
  }

  renderTable = async () => {
    const { deliveryReceipts, productType, classes } = this.props;
    const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));
    // listAllCustomProducts();
    const { selectedColumnIds } = this.state;
    let columns = [];

    const addField = (field, content) => {
      columns.push({
        show: true,
        ...content,
      });
    };
    const date = process.env.REACT_APP_BAYER_WALKIN_SEASON_DATE || '02-25-2023';
    addField('action', {
      Header: '',
      id: 'actions',
      show: true,
      name: 'Action',
      headerClassName: 'hide-print',
      className: 'hide-print',
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '18px',
        color: '#000000',
      },
      accessor: (d) => d,
      maxWidth: 45,
      sortable: false,
      Cell: (props) => {
        const item = props.value.action;

        let canAdd = true;
        if (props.value.productId !== '-') {
          canAdd = item.name !== '' && item.type !== '' && item.description !== '';
        }
        return (
          <React.Fragment>
            {props.value.productId !== '-' && (
              <div>
                {props.value.isChanging ? (
                  <React.Fragment>
                    <IconButton
                      onClick={() => {
                        // this.updateCompanyProduct(props.value);
                      }}
                      style={canAdd ? { color: 'green' } : { color: 'grey' }}
                      disabled={!canAdd}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => {
                        // this.onCancel(props.value);
                      }}
                      style={{ color: 'red' }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </React.Fragment>
                ) : (
                  <IconButton
                    aria-label="show Menu"
                    onClick={this.handleTableItemActionMenuOpen(props.value)}
                    style={{ color: 'rgb(56, 161, 84)' }}
                    id={`productId-${props.value.productId}`}
                    name="dealerAction"
                  >
                    <MoreHoriz fontSize="small" />
                  </IconButton>
                )}
              </div>
            )}
          </React.Fragment>
        );
      },
    });
    addField('Products', {
      Header: (
        <div className={classes.headClass}>
          <span id="Products" style={{ color: '#38A154', height: '55px', display: 'flex', alignItems: 'center' }}>
            Products
          </span>
          <span className={classes.totalRowClass}>-</span>
        </div>
      ),
      sortMethod: (a, b) => {
        return a.props.children.localeCompare(b.props.children);
      },
      id: 'Products',
      width: 150,
      name: 'Products',
      className: 'sticky',
      headerClassName: 'sticky',
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
        height: '100px',
      },

      accessor: (product) => {
        return (
          <div style={{ marginTop: '5px' }}>
            {product.productDetail}
            {/* <br /> */}
            {/* {product.productId} */}
            {/* <br /> */}
            {/* {product.isFavorite ? "Favorite Product" : "Retail Product"} */}
          </div>
        );
      },
    });

    addField('BayerDealerBucketQty', {
      Header: (
        <div className={classes.headClass}>
          <span
            id="MyDealerBucket"
            style={{ color: '#373a3ed9', height: '65px', display: 'flex', alignItems: 'center' }}
          >
            My Dealer
            <br />
            Bucket
          </span>
          <span className={classes.totalRowClass}>{totalDataRow.bayerDealerBucketQty}</span>
        </div>
      ),

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      name: 'MyDealer Bucket',
      id: 'bayerDealerBucketQty',
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,
      accessor: (product) => {
        return <div style={{ textAlign: 'center' }}>{product.bayerDealerBucketQty}</div>;
      },
    });

    addField('AllGrowerQty', {
      Header: (
        <div className={classes.headClass}>
          <span
            id="DemandAllGrowers"
            style={{ color: '#373a3ed9', height: '65px', display: 'flex', alignItems: 'center' }}
          >
            DemandFrom
            <br />
            all Growers
          </span>
          <span className={classes.totalRowClass}>{totalDataRow.allGrowerQty}</span>
        </div>
      ),

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      name: 'DemandFrom All Growers',
      id: 'allGrowerQty',
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,
      accessor: (product) => {
        return <div style={{ textAlign: 'center' }}>{product.allGrowerQty}</div>;
      },
    });

    addField('demand', {
      Header: (
        <div className={classes.headClass}>
          <span id="Demand" style={{ color: '#38A154', height: '65px', display: 'flex', alignItems: 'center' }}>
            Demand
          </span>
          <span className={classes.totalRowClass}>{totalDataRow.demand}</span>
        </div>
      ),

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'demand',
      name: 'Demand',
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,

      accessor: (product) => {
        return <div style={{ textAlign: 'center' }}>{product.demand}</div>;
      },
    });

    addField('supply', {
      Header: (
        <div className={classes.headClass}>
          <span id="Supply" style={{ color: '#373a3ed9', height: '65px', display: 'flex', alignItems: 'center' }}>
            Supply
          </span>
          <span className={classes.totalRowClass}>{totalDataRow.supply}</span>
        </div>
      ),

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'supply',
      name: 'Supply',
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,

      accessor: (product) => {
        // return <div style={{ textAlign: 'center' }}>{product.supply}</div>;
        return <div style={{ textAlign: 'center' }}>{product.supply}</div>;
      },
    });

    addField('quantity', {
      Header: (
        <div className={classes.headClass}>
          <span
            id="BayerAvailability"
            style={{ color: '#373a3ed9', height: '65px', display: 'flex', alignItems: 'center' }}
          >
            Bayer Availability
          </span>
          <span className={classes.totalRowClass}>
            {totalDataRow.bayerAvailability >= 10000 ? '10,000+' : totalDataRow.bayerAvailability}
          </span>
        </div>
      ),

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '11px',
        color: '#000000',
      },
      id: 'quantity',
      name: 'BayerAvailability',
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,
      accessor: (product) => {
        return (
          <div style={{ textAlign: 'center' }}>
            {product.bayerAvailability >= 1000 ? '1000+' : product.bayerAvailability}
          </div>
        );
      },
    });
    addField('shippedQuantityValue', {
      Header: (
        <div className={classes.headClass}>
          <span
            id="ReceivedByDealer"
            style={{ color: '#373a3ed9', height: '65px', display: 'flex', alignItems: 'center' }}
          >
            Received <br></br>by Dealer
          </span>
          <span className={classes.totalRowClass}>{totalDataRow.shippedQuantityValue}</span>
        </div>
      ),
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('shippedQuantityValue') ? true : false,

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      name: 'Received By Dealer',
      id: 'shippedQuantityValue',
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,
      accessor: (product) => {
        return <div style={{ textAlign: 'center' }}>{product.shippedQuantityValue || 0}</div>;
      },
    });
    addField('longShort', {
      Header: (
        <div className={classes.headClass}>
          <span id="Long/Short" style={{ color: '#373a3ed9', height: '65px', display: 'flex', alignItems: 'center' }}>
            Long/Short
          </span>
          <span className={classes.totalRowClass}>{totalDataRow.longShort}</span>
        </div>
      ),

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'longShort',
      name: 'Long/Short',

      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,

      accessor: (product) => {
        return <div style={{ textAlign: 'center' }}>{product.longShort}</div>;
      },
    });

    addField('dealerQty', {
      Header: (
        <div className={classes.headClass}>
          <span id="dealerQty" style={{ color: '#373a3ed9', height: '65px', display: 'flex', alignItems: 'center' }}>
            Add/Remove Qty
          </span>
          <span className={classes.totalRowClass}>{totalDataRow.fillShort}</span>
        </div>
      ),

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'dealerQty',
      name: 'dealerQty',
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,

      accessor: (product) => {
        return (
          <div style={{ textAlign: 'center', fontWeight: 600 }}>
            {product.removeSupply == false && (
              <FormControl>
                <TextField
                  type="number"
                  id="dealerInputQty"
                  value={product.showDealerQty ? product.dealerQty : ''}
                  disabled={product.dealerQty > product.longShort && product.removeSupply ? true : false}
                  onChange={(e) => {
                    const data = this.state.tableGroupData;
                    const Index = this.state.tableGroupData.findIndex(
                      (d) => d.crossReferenceId == product.crossReferenceId,
                    );
                    data[Index]['dealerQty'] = e.target.value;
                    data[Index]['showDealerQty'] = true;

                    const isMsgShow =
                      parseFloat(product.supply) +
                      parseFloat(e.target.value) -
                      parseFloat(product.shippedQuantityValue);
                    if (isMsgShow <= 0) {
                      this.setState({
                        showSnackBar: true,
                        messageForSnackBar: `This product already has ${product.shippedQuantityValue} shipped units and you are trying to reduce your dealer order below that. Bayer will most likely reject this and only reduce upto what is not shipped yet`,
                      });
                    } else if (isMsgShow > 0) {
                      this.setState({
                        showSnackBar: false,
                      });
                    }
                    this.setState({
                      tableGroupData: data,
                    });
                  }}
                />
              </FormControl>
            )}
          </div>
        );
      },
    });
    addField('fillShort', {
      Header: (
        <div className={classes.headClass}>
          <span id="fillShort" style={{ color: '#373a3ed9', height: '65px', display: 'flex', alignItems: 'center' }}>
            Fill Short
          </span>
          <span className={classes.totalRowClass}>{totalDataRow.fillShort}</span>
        </div>
      ),

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'fillShort',
      name: 'fillShort',
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,

      accessor: (product) => {
        return (
          <div style={{ textAlign: 'center', fontWeight: 600 }}>
            {product.longShort < 0 ? (
              <FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={product.fillShort}
                      color="primary"
                      disabled={
                        (!(product.fillShort || product.removeSupply || product.addWalkIn) || product.fillShort) == true
                          ? false
                          : true
                      }
                      onChange={(e) => {
                        if (!(product.fillShort || product.removeSupply || product.addWalkIn) || product.fillShort) {
                          const data = this.state.tableGroupData;
                          const Index = this.state.tableGroupData.findIndex(
                            (d) => d.crossReferenceId == product.crossReferenceId,
                          );
                          data[Index]['fillShort'] = e.target.checked;

                          this.setState({
                            tableGroupData: data,
                          });
                        }
                      }}
                    />
                  }
                  // label="FillShort"
                />
              </FormControl>
            ) : (
              ''
            )}
          </div>
        );
      },
    });

    addField('removeSupply', {
      Header: (
        <div className={classes.headClass}>
          <span id="removeSupply" style={{ color: '#373a3ed9', height: '65px', display: 'flex', alignItems: 'center' }}>
            Remove Supply
          </span>
          <span className={classes.totalRowClass}>{'-'}</span>
        </div>
      ),

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'removeSupply',
      name: 'removeSupply',
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,

      accessor: (product) => {
        return (
          <div style={{ textAlign: 'center', fontWeight: 600 }}>
            {!product.hasOwnProperty('isNew') && (
              <FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={product.removeSupply}
                      disabled={
                        (!(product.fillShort || product.removeSupply || product.addWalkIn) || product.removeSupply) ==
                        true
                          ? false
                          : true
                      }
                      color="primary"
                      onChange={(e) => {
                        if (!(product.fillShort || product.removeSupply || product.addWalkIn) || product.removeSupply) {
                          const data = this.state.tableGroupData;
                          const Index = this.state.tableGroupData.findIndex(
                            (d) => d.crossReferenceId == product.crossReferenceId,
                          );
                          data[Index]['removeSupply'] = e.target.checked;
                          data[Index]['dealerQty'] = product.supply;

                          if (e.target.checked == true && product.dealerQty > product.longShort) {
                            this.setState({
                              showSnackBar: true,
                              messageForSnackBar:
                                'This will remove supply and create a short position. Are you sure you want to continue?',
                            });
                          }

                          this.setState({
                            tableGroupData: data,
                          });
                        }
                      }}
                    />
                  }
                  // label="RemoveSupply"
                />
              </FormControl>
            )}
          </div>
        );
      },
    });
    addField('addWalkIn', {
      Header: (
        <div className={classes.headClass}>
          <span id="addWalkIn" style={{ color: '#373a3ed9', height: '65px', display: 'flex', alignItems: 'center' }}>
            Add WalkIn
          </span>
          <span className={classes.totalRowClass}>{'-'}</span>
        </div>
      ),

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'addWalkIn',
      name: 'addWalkIn',
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,
      show: new Date(date) <= new Date() ? true : false,
      accessor: (product) => {
        // return <div style={{ textAlign: 'center' }}>{product.supply}</div>;
        return (
          <div style={{ textAlign: 'center', fontWeight: 600 }}>
            <FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={product.addWalkIn}
                    color="primary"
                    disabled={
                      (!(product.fillShort || product.removeSupply || product.addWalkIn) || product.addWalkIn) == true
                        ? false
                        : true
                    }
                    onChange={(e) => {
                      if (!(product.fillShort || product.removeSupply || product.addWalkIn) || product.addWalkIn) {
                        const data = this.state.tableGroupData;
                        const Index = this.state.tableGroupData.findIndex(
                          (d) => d.crossReferenceId == product.crossReferenceId,
                        );
                        data[Index]['addWalkIn'] = e.target.checked;

                        this.setState({
                          tableGroupData: data,
                        });
                      }
                    }}
                  />
                }
                // label="Add WalkIn"
              />
            </FormControl>
          </div>
        );
      },
    });

    this.setState({ columnsTable: columns });
  };

  getTableData = (data) => {
    const { deliveryReceipts } = this.props;
    const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));

    let tableData = [];

    data.map((product) => {
      const detail = product.Product.productDetail
        ? product.Product.productDetail
        : this.state.showFavoriteProductsAll
        ? `${product.Product.blend} ${product.Product.seedSize} ${product.Product.brand} ${product.Product.packaging} ${product.Product.treatment}`
        : `${product.Product.blend} ${product.Product.brand} ${product.Product.treatment}`;

      let DealerPrice = '';
      let EndUserPrice = '';

      let rm = '-';
      const { blend } = product.Product;
      let match = blend && blend.match(/DKC[0-9]*-/);
      if (match) {
        let i = match[0].replace('DKC', '').replace('-', '');
        rm = parseInt(i, 0) + 50;
      }
      const quatityID = deliveryReceiptDetails.filter((data) => data.monsantoProductId === product.Product.id);
      const deliveryQtyisReturn = getDeliveryLotsQtyReturn(quatityID, deliveryReceipts);
      const deliveryQty = getDeliveryLotsQty(quatityID, deliveryReceipts);
      const value = getWareHouseValue(product.Product);

      const productOriginalQuantity = Number.parseInt(0);

      let sumData = [];
      deliveryReceiptDetails
        .filter((item) => product.productId === item.monsantoProductId)
        .reduce(function (res, value) {
          const pID = value.monsantoProductId;
          if (!res[pID]) {
            res[pID] = {
              monsantoProductId: value.monsantoProductId,
              amountDelivered: 0,
              customerMonsantoProductId: value.customerMonsantoProductId,
            };
            sumData.push(res[pID]);
          }
          res[pID].amountDelivered += Number(value.amountDelivered);

          return res;
        }, {});
      let totalOrderQty = 0;
      const longShort =
        Number(product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0) -
          product.demand || 0;

      tableData.push({
        action: product,
        brand: product.Product.brand,
        blend: product.Product.blend,
        productDetail: detail,
        variety: product.Product.blend,
        trait: product.Product.brand,
        rm: rm,
        treatment: product.Product.treatment,
        packaging: product.Product.packaging ? product.Product.packaging : product.Product.productDetail.split(' ')[2],
        seedSize: product.Product.seedSize ? product.Product.seedSize : '-',
        msrp: EndUserPrice,
        dealerPrice: DealerPrice,
        availableQuantity: productOriginalQuantity + value - deliveryQty + deliveryQtyisReturn || 0,
        bayerDealerBucketQty: product.bayerDealerBucketQty,
        shippedQuantityValue: product.shippedQuantityValue || 0,
        deliveredToGrower: sumData.length > 0 ? sumData[0].amountDelivered : 0,
        allGrowerQty: product.allGrowerQty,
        demand: product.demand,
        supply: product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0,
        longShort: longShort,
        longShortwithoutDealerBucket:
          Number(product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0) -
          product.allGrowerQty,
        bayerAvailability: parseFloat(product.Product.quantity || 0), //quanity
        allGrowersUnsynced: totalOrderQty,
        productId: product.productId,
        crossReferenceId: product.Product.crossReferenceId,
        classification: product.Product.classification,
        dealerQty:
          parseFloat(longShort) < parseFloat(product.Product.quantity || 0)
            ? longShort
            : parseFloat(product.Product.quantity || 0),
        fillShort: false,
        showDealerQty: false,
        removeSupply: false,
        addWalkIn: false,
        quantity: product.Product.quantity,
      });
    });

    return { tableData };
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
    const selectedColumnIds = columns.map((c) => {
      if (c.show == true) {
        return c.id;
      }
    });
    this.props.updateApiSeedCompany({
      id: this.props.seedCompany.id,
      lastSelectedColumnDetailOption: selectedColumnIds.filter((c) => c !== undefined),
    });
    this.setState({ columns });
  };
  print = () => {
    this.setState(
      {
        horizMenuOpen: false,
      },
      this.props.print(),
    );
  };

  importProductDealers = async (e) => {
    const { seedCompanyId, name } = this.props;
    try {
      if (!e.target.value.endsWith('.csv')) return;
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async function (event) {
        await createDealerFromCSV(event.target.result, seedCompanyId, name);
      };
      reader.readAsText(file);
    } catch (e) {
      console.log(e, 'e');
    }

    setTimeout(() => {
      window.location.reload();
    }, 5000);
  };
  fetchProductBookingSummary = async (finalTableData, e) => {
    const { seedCompanyId } = this.state;
    const { classes } = this.props;

    const gropedProductData = [];
    const isBlankQty = [];
    this.state.tableGroupData
      .filter((d) => d.fillShort == true || d.removeSupply == true || d.addWalkIn == true)
      .map((d) => {
        d.dealerQty == 0 && isBlankQty.push(d);

        return (
          d.dealerQty != 0 &&
          gropedProductData.push({
            crossReferenceId: d.crossReferenceId,
            dealerQty: d.dealerQty,
            fillShort: d.fillShort,
            removeSupply: d.removeSupply,
            addWalkIn: d.addWalkIn,
            supply: d.supply,
            actionRequest: d.hasOwnProperty('isNew') ? 'Add' : d.removeSupply ? 'Delete' : 'Change',
          })
        );
      });

    const productId = this.state.tableGroupData
      .filter((d) => d.fillShort == true || d.removeSupply == true || d.addWalkIn == true)
      .map((d) => d.crossReferenceId);

    isBlankQty.length > 0
      ? this.setState({
          syncBayerConfirm: (
            <SweetAlert
              warning
              showCancel
              // title="Delete Product"
              onConfirm={async () => {
                this.callFetchQty(productId, gropedProductData, seedCompanyId);
                this.setState({ syncBayerConfirm: null });
              }}
              onCancel={() => this.setState({ syncBayerConfirm: null })}
              confirmBtnCssClass={classes.button + ' ' + classes.success}
              cancelBtnCssClass={classes.button + ' ' + classes.danger}
            >
              <h4> Hey you didn't add quantity , do you still want to proceed ? </h4>
            </SweetAlert>
          ),
        })
      : this.callFetchQty(productId, gropedProductData, seedCompanyId);
  };

  callFetchQty = async (productId, gropedProductData, seedCompanyId) => {
    if (gropedProductData.length > 0 && (productId.length > 0 || this.state.fillShortProduct.length > 0)) {
      await axios
        .get(
          `${
            process.env.REACT_APP_API_BASE
          }/monsanto/sync/fetchQtyProductBookingSummary?seedCompanyId=${seedCompanyId}&fetchQty=${0}`,

          {
            headers: { 'x-access-token': localStorage.getItem('authToken') },
            params: {
              productId: this.state.fillShortProduct.length !== 0 ? this.state.fillShortProduct : productId,
              gropedProductData: JSON.stringify(gropedProductData),
            },
          },
        )
        .then((response) => {
          if (response.data.data.identifier == 'E' || response.data.data.identifier == 'I') {
            this.setState({ showSnackBar: true, messageForSnackBar: response.data.data.description });
          } else {
            this.setState({ showSnackBar: true, messageForSnackBar: 'Product fetch succesfully' });
          }
          this.setState({ isFetch: false, showDealerQty: false });
        })
        .catch((e) => {
          this.setState({ showSnackBar: true, messageForSnackBar: `Error from fetchQty:${e}` });
          console.log('e : ', e);
          this.setState({ isFetch: false, showDealerQty: false });
        });
    }
  };

  getTheUpdate = async (updateDate) => {
    const { syncSummaryData, syncProductBookingSummary, checkInInventoryProductAvailability, updateIsChange } =
      this.props;
    const seedCompanyId = parseInt(this.props.match.path.match(/seed_companies\/([0-9]*)/)[1], 10);

    const startDate = new Date(updateDate);
    let isUpdate = false;

    const endDate = new Date();
    const seconds = Math.floor((endDate - startDate) / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes >= 30) {
      this.setState({
        isLastUpdateLoading: true,
        showSnackBar: true,
        messageForSnackBar: 'Checking for updates in the background ... ',
      });
      await Promise.all([
        await updateIsChange(),
        await axios
          .get(
            `${process.env.REACT_APP_API_BASE}/monsanto/retailer_orders/syncSummaryData?seedCompanyId=${seedCompanyId}`,
            {
              headers: { 'x-access-token': localStorage.getItem('authToken') },
            },
          )
          .then((response) => {
            this.setState({ isLastUpdateLoading: false });

            if (response.data.update == true && response.data.status === true) {
              isUpdate = true;
              // this.setShowSnackbar('Hey, I will be auto refreshing the page in a few seconds  since theres an update.');
            } else {
              isUpdate = false;

              // this.setShowSnackbar('Page is up to date! and no refresh happens.');
            }
          })
          .catch((e) => {
            this.setState({ isPageSyncing: false });
            // this.setShowSnackbar('Please Contact Tech Support');
          }),
        await axios
          .get(
            `${process.env.REACT_APP_API_BASE}/monsanto/sync/syncProductBookingSummary?seedCompanyId=${seedCompanyId}`,
            {
              headers: { 'x-access-token': localStorage.getItem('authToken') },
            },
          )
          .then((response) => {
            this.setState({ isLastUpdateLoading: false });

            if (response.data.update == true && response.data.status === true) {
              isUpdate = true;
              // this.setShowSnackbar('Hey, I will be auto refreshing the page in a few seconds  since theres an update.');
            } else {
              isUpdate = false;

              // this.setShowSnackbar('Page is up to date! and no refresh happens.');
            }
          })
          .catch((e) => {
            this.setState({ isLastUpdateLoading: false });
            console.log('e : ', e);
            this.setShowSnackbar('Please Contact Tech Support');
          }),

        await checkInInventoryProductAvailability(),
      ]).then((values) => {
        if (isUpdate) {
          this.setShowSnackbar('Hey, I will be auto refreshing the page in a few seconds  since theres an update.');

          setTimeout(() => {
            // window.location.reload();
          }, 5000);
        } else {
          this.setShowSnackbar('Page is up to date! and no refresh happens.');
        }

        this.setState({
          isLastUpdateLoading: false,
        });
      });
    }
  };
  setShowSnackbar = (showSnackbarText) => {
    this.setState({
      showSnackbar: true,
      messageForSnackBar: showSnackbarText,
    });
  };
  changeSeedSizePackaging = async (data) => {
    const productId = data.map((d) => d.crossReferenceId);
    await axios
      .get(
        `${process.env.REACT_APP_API_BASE}/monsanto/sync/fetchQtyProductBookingSummary?seedCompanyId=${
          this.state.seedCompanyId
        }&fetchQty=${0}`,

        {
          headers: { 'x-access-token': localStorage.getItem('authToken') },
          params: {
            productId: productId,
            gropedProductData: JSON.stringify(data),
            DealerOrderSwap: true,
          },
        },
      )
      .then((response) => {
        if (response.data.data.identifier == 'E' || response.data.data.identifier == 'I') {
          this.setState({ showSnackBar: true, messageForSnackBar: response.data.data.description });
        } else {
          this.setState({ showSnackBar: true, messageForSnackBar: 'Product fetch succesfully' });
        }
        this.handleTableItemActionMenuClose();
      })
      .catch((e) => {
        this.setState({ showSnackBar: true, messageForSnackBar: `Error from fetchQty:${e}` });
      });
  };
  render() {
    this.productsFileInput = React.createRef();
    const {
      columnsTable,
      columns,
      horizMenuOpen,
      showRetailerProducts,
      serchText,
      groupData,
      showSnackBar,
      isLoadingData,
      messageForSnackBar,
      monsantoData,
      fillShortProduct,
      isFetch,
      tableGroupData,
      seedCompanyId,
      showFavoriteProducts,
      seedType,
      searchString,
      selectedProduct,
      fieldShow,
      renderList,
      productDetail,
      showProductForm,
      tableItemActionAnchorEl,
      tableItemActionMenuOpen,
      activeTableItem,
      openSwapModel,
      changeSupplyValue,
      updateSeedConfirm,
    } = this.state;
    const { synced, classes, theme, toggleColumns, fetched, apiSeedCompanies } = this.props;
    let data = [];

    const tableData = tableGroupData.filter((p) => {
      return (
        (p.trait && p.trait.toLowerCase().includes(serchText)) ||
        (p.variety && p.variety.toLowerCase().includes(serchText)) ||
        (p.productDetail && p.productDetail.toLowerCase().includes(serchText))
      );
    });

    let groupColumns = [];
    columns
      .filter((cc) => cc.id !== 'Products' && cc.id !== 'Packaging' && cc.id !== 'seedsize')
      .map((cc) => {
        // c.columns
        // c.filter((cc) => cc.id !== 'Products' && cc.id !== 'Packaging' && cc.id !== 'seedsize').map((cc) => {
        return groupColumns.push(cc);
        // });
      });

    let filterToggleColumns = this.state.columns;

    let totalrm = 0,
      totalavailableQuantity = 0,
      totalbayerDealerBucketQty = 0,
      totalshippedQuantityValue = 0,
      totaldeliveredToGrower = 0,
      totalallGrowerQty = 0,
      totaldemand = 0,
      totalsupply = 0,
      totallongShort = 0,
      totallongShortwithoutDealerBucket = 0,
      totalallGrowersUnsynced = 0,
      totalbayerAvailability = 0,
      totaldealerPrice = 0,
      totalMsrp = 0;

    tableData.map((c) => {
      totalrm += c.rm === '-' ? 0 : c.rm;
      totalavailableQuantity += parseFloat(c.availableQuantity);
      totalbayerDealerBucketQty += parseFloat(c.bayerDealerBucketQty);
      totalshippedQuantityValue += parseFloat(c.shippedQuantityValue);
      totaldeliveredToGrower += parseFloat(c.deliveredToGrower);
      totalallGrowerQty += parseFloat(c.allGrowerQty);
      totaldemand += parseFloat(c.demand);
      totalsupply += parseFloat(c.supply);
      totallongShort += parseFloat(c.longShort);
      totallongShortwithoutDealerBucket += parseFloat(c.longShortwithoutDealerBucket);
      totalallGrowersUnsynced += parseFloat(c.allGrowersUnsynced);
      totalMsrp += parseFloat(c.msrp);
      totalbayerAvailability += parseFloat(c.bayerAvailability);
      totaldealerPrice += parseFloat(c.dealerPrice);
    });

    totalDataRow = {
      rm: '-',
      msrp: '-',
      availableQuantity: totalavailableQuantity,
      bayerDealerBucketQty: totalbayerDealerBucketQty,
      shippedQuantityValue: totalshippedQuantityValue,
      deliveredToGrower: totaldeliveredToGrower,
      allGrowerQty: totalallGrowerQty,
      demand: totaldemand,
      supply: totalsupply,
      longShort: totallongShort,
      longShortwithoutDealerBucket: totallongShortwithoutDealerBucket,
      bayerAvailability: '-',
      allGrowersUnsynced: totalallGrowersUnsynced,
      dealerPrice: totaldealerPrice.toFixed(2),
      fillShort: '-',
    };

    const finalTableData = tableData.filter(
      (t) =>
        !(
          t.availableQuantity == 0 &&
          t.bayerDealerBucketQty == 0 &&
          t.shippedQuantityValue == 0 &&
          t.deliveredToGrower == 0 &&
          t.allGrowerQty == 0 &&
          t.demand == 0 &&
          t.supply == 0 &&
          t.longShort == 0 &&
          t.longShortwithoutDealerBucket == 0 &&
          t.bayerAvailability == 0 &&
          t.allGrowersUnsynced == 0
        ),
    );
    const vertical = 'top';
    const horizontal = 'right';

    const productId = this.state.tableGroupData.filter(
      (d) => d.fillShort == true || d.removeSupply == true || d.addWalkIn == true,
    );
    let cropTypes = [];
    let seedCompany = [];
    seedCompany = apiSeedCompanies && apiSeedCompanies.find((sc) => sc.id === seedCompanyId);
    cropTypes = Object.values(mapObj);
    const productList = this.availableItems();
    let maxWidth = '20%';

    return (
      // selectedZoneId !== undefined && (
      <Card style={{ padding: '20px' }}>
        <GridContainer>
          <GridItem xs={12}>
            <div className={`${classes.actionBar} hide-print`}>
              {toggleColumns && (
                <ColumnMenu
                  onColumnUpdate={this.toggleColumnMenu}
                  columns={filterToggleColumns.filter((col) => col)}
                  productType="foo" // TODO: remove this property, not needed at all
                  className={classes.columnMenu}
                />
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div id="grouped_detail_card">
                Product Booking Summary and Retailer Order Summary last updated:{' '}
                {tableData.length !== 0 || tableData.length > 0
                  ? moment.utc(tableData[0].action.retailOrderSummaryLasySyncDate).format('MMMM Do YYYY, h:mm a')
                  : ''}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <FormControl style={{ marginRight: '10px', width: '35%' }}>
                  <TextField
                    className={`${classes.searchField} hide-print`}
                    margin="normal"
                    placeholder="Search Variety/Trait"
                    value={serchText}
                    onChange={this.handleSearchTextChange}
                    id="searchBar"
                  />
                </FormControl>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        id="fillAllShort"
                        onChange={(e) => {
                          const allCrossReferenceId = [];
                          const data = this.state.tableGroupData.map((f, i) =>
                            Object.assign({}, f, {
                              fillShort: e.target.checked,
                              removeSupply: false,
                              addWalkIn: false,
                              showDealerQty: e.target.checked,
                            }),
                          );
                          if (finalTableData !== undefined) {
                            finalTableData.map((f) => allCrossReferenceId.push(f.crossReferenceId));
                          }

                          if (e.target.checked) {
                            this.setState({
                              isFetch: true,
                              fillShortProduct: allCrossReferenceId,
                              tableGroupData: data,
                            });
                          } else {
                            this.setState({
                              isFetch: false,
                              fillShortProduct: [],
                              tableGroupData: data,
                            });
                          }
                        }}
                      />
                    }
                    label="Fill AllShort"
                  />
                </FormControl>
                <Button
                  id="addProduct"
                  style={{ height: '45px' }}
                  onClick={() => {
                    this.setState({
                      showProductForm: true,
                    });
                  }}
                >
                  Add Product
                </Button>
                <Button
                  disabled={fillShortProduct.length > 0 || productId.length > 0 ? false : true}
                  onClick={() => this.fetchProductBookingSummary()}
                  id="syncBayer"
                >
                  Sync with bayer
                </Button>
              </div>
            </div>
            {showProductForm && (
              <Dialog
                open={showProductForm}
                TransitionComponent={Transition}
                maxWidth="xl"
                PaperProps={{ classes: { root: classes.dialog } }}
              >
                <h3>Select Product</h3>
                <div className={classes.dialogBody}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '20px',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <FormControl style={{ width: 200, marginLeft: '20px' }}>
                        <InputLabel htmlFor="seed-type">Seed Type</InputLabel>
                        <Select
                          value={seedType}
                          onChange={(e) => this.setState({ seedType: e.target.value })}
                          autoWidth
                          select
                          id="seedTypeSelect"
                          inputProps={{
                            required: true,
                            name: 'seedType',
                          }}
                        >
                          {cropTypes.map((seedType) => (
                            <MenuItem
                              key={seedType}
                              value={seedType.toUpperCase()}
                              style={{ textTransform: 'capitalize' }}
                              id={'Bayer'[`${seedType.toLowerCase()}BrandName`]}
                            >
                              {seedType.toLowerCase() || 'Bayer'[`${seedType.toLowerCase()}BrandName`]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </div>
                    {/*         <FormControl style={{ marginLeft: 20 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            // value={showAllMonsantoProducts}
                            // onChange={this.handleShowAllMonsantoProducts}
                            // disabled={editMode && editingProduct.hasOwnProperty('monsantoProductId')}
                            id="showFavProduct"
                          />
                        }
                        label="Show favorite and already added products"
                      />
                      </FormControl>*/}
                  </div>

                  <Card className={classes.secondCard}>
                    <Grid container>
                      <Grid container>
                        <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                          Traits
                        </Grid>

                        <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                          Variety
                        </Grid>

                        <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                          Treatment
                        </Grid>

                        <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                          Seed Size
                        </Grid>

                        <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                          packaging
                        </Grid>
                        <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                          productDetail
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid container style={{ height: '350px' }}>
                      <Grid item xs={12}>
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

                              let colXS = 2;
                              maxWidth = '50%';
                              return (
                                <Grid
                                  item
                                  xs={colXS}
                                  key={column.id}
                                  className={classnames(classes.gridHeaderBorderStyle, classes.gridListContainer)}
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
                                            return (
                                              <ListItem
                                                key={item}
                                                id={item == 'PickLater' ? `PickLater-${column.id}` : item}
                                                onClick={() => {
                                                  this.setItem(column.id, item, i);
                                                }}
                                                className={
                                                  this.columnIsSelected(column, item)
                                                    ? classes.selected
                                                    : classes.listItem
                                                }
                                              >
                                                <ListItemText>{item}</ListItemText>
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
                              xs={2}
                              className={classnames(classes.gridHeaderBorderStyle)}
                              style={{ maxWidth: maxWidth }}
                            >
                              <List dense={true}>
                                <ListItem style={{ padding: '0 13px' }}>
                                  {productList && (
                                    <div style={{ height: '370px', marginBottom: '30px' }}>
                                      {seedType == 'CANOLA' && productList.length == 2 ? (
                                        <div style={{ marginBottom: '20px', width: '235px' }}>
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
                                                    {po.productDetail !== undefined &&
                                                      po.productDetail.replace(po.packaging, '')}
                                                  </MenuItem>
                                                );
                                              })}
                                            </Select>
                                          </FormControl>
                                        </div>
                                      ) : null}
                                    </div>
                                  )}
                                </ListItem>
                              </List>
                            </Grid>
                          </div>
                        </div>
                      </Grid>
                    </Grid>

                    {/*     <Grid container className={classes.center} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        id="selectProduct"
                        onClick={() => {
                          const data =
                            this.state.productDetail !== ''
                              ? this.availableItems().find((po) => po.id === this.state.productDetail)
                              : this.availableItems()[0];

                          this.setState({ selectedProduct: data });
                          console.log(data, 'data');
                        }}
                        aria-label="Add Product"
                        disabled={!selectedProduct}
                        className={classes.button}
                      >
                        Select
                      </Button>
                      </Grid>*/}
                  </Card>
                </div>
                <div className={classes.dialogHeaderActions} style={{ marginTop: '20px' }}>
                  <Button
                    className={classes.button}
                    style={{ width: '114px', height: '44px' }}
                    onClick={() => this.setState({ showProductForm: false })}
                  >
                    Cancel
                  </Button>

                  <Button
                    id="submitProduct"
                    color="primary"
                    onClick={() => {
                      const monsantoNewProducts =
                        localStorage.getItem('monsantoNewProducts') == null
                          ? []
                          : JSON.parse(localStorage.getItem('monsantoNewProducts'));
                      const data =
                        this.state.productDetail !== ''
                          ? this.availableItems().find((po) => po.id === this.state.productDetail)
                          : this.availableItems()[0];

                      const isExits = finalTableData.filter((d) => d.crossReferenceId == data.crossReferenceId);
                      console.log(isExits, 'isExits');
                      if (isExits.length > 0) {
                        this.setState({
                          showSnackBar: true,
                          messageForSnackBar: 'This product is alredy exits',
                        });
                      } else {
                        const finalData = {
                          ...data,
                          dealerQty: 0,
                          fillShort: false,
                          showDealerQty: false,
                          removeSupply: false,
                          addWalkIn: false,
                          quantity: 0,
                          supply: 0,
                          shippedQuantityValue: 0,
                          longShort: 0,
                          bayerDealerBucketQty: 0,
                          allGrowerQty: 0,
                          demand: 0,
                          isNew: true,
                        };
                        localStorage.setItem(
                          'monsantoNewProducts',
                          JSON.stringify([...monsantoNewProducts, finalData]),
                        );

                        this.setState({
                          selectedProduct: [...monsantoNewProducts, finalData],
                          showProductForm: false,
                          tableGroupData: [...tableGroupData, finalData],
                        });
                      }
                    }}
                  >
                    Submit
                  </Button>
                </div>
              </Dialog>
            )}

            {finalTableData.length !== 0 || finalTableData.length > 0 ? (
              <div id="Dealer_details">
                <ReactTable
                  // data={data.sort((a, b) => a.Product.blend.localeCompare(b.Product.blend))}
                  data={finalTableData}
                  columns={groupData === true ? groupColumns : columnsTable}
                  resizable={false}
                  defaultPageSize={500}
                  minRows={1}
                  showPagination={false}
                  getTrGroupProps={(state, rowInfo, column) => ({
                    style: {
                      maxHeight: '80px',
                    },
                  })}
                  getTbodyProps={() => ({
                    style: {
                      overflow: 'visible !important',
                    },
                  })}
                  className={classes.productTable + ' -striped -highlight'}
                />
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
                        id="bayerPO"
                        className={classes.addNewMenuItem}
                        onClick={() => {
                          this.setState({
                            openSwapModel: true,
                            changeSupplyValue: activeTableItem.supply,
                            blend: activeTableItem.blend,
                            brand: activeTableItem.brand,
                            treatment: activeTableItem.treatment,
                            seedSize: activeTableItem.seedSize,
                            packaging: activeTableItem.packaging,
                          });
                        }}
                      >
                        Swap Seed Size / Packaging
                      </MenuItem>
                    </MenuList>
                  </Paper>
                </Popover>
              </div>
            ) : (
              <center>
                <h3 style={{ marginTop: '10px', marginBottom: '10px' }}>
                  {isLoadingData && finalTableData.length == 0
                    ? `Loading products ...`
                    : 'There are no products currently in your dealer or grower order. Please come back after you have added some to your order.'}
                </h3>
              </center>
            )}

            {openSwapModel && (
              <Dialog open={true} maxWidth="xl" PaperProps={{ classes: { root: classes.dialog } }}>
                <div>
                  <Accordion preExpanded={['a']}>
                    <AccordionItem uuid="a">
                      <AccordionItemHeading>
                        <AccordionItemButton>Select Products </AccordionItemButton>
                      </AccordionItemHeading>
                      <AccordionItemPanel>
                        <Card className={classes.secondCard}>
                          <Grid container>
                            <Grid container>
                              <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                                Traits
                              </Grid>
                              <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
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
                              <Grid item xs={2} className={classes.gridHeader}>
                                Quantity and MSRP
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid container>
                            <Grid item xs={12}>
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

                                  let finalType = types.filter((d) => activeTableItem[column.id] !== d);
                                  finalType.unshift(activeTableItem[column.id]);

                                  let colXS = 2;
                                  maxWidth = '50%';
                                  return (
                                    <Grid
                                      item
                                      xs={colXS}
                                      key={column.id}
                                      style={{ overflow: 'auto' }}
                                      className={classnames(
                                        classes.gridHeaderBorderStyle,
                                        classes.gridListContainer,

                                        column.id === 'brand'
                                          ? classes.disableGrid
                                          : column.id === 'blend2'
                                          ? classes.disableGrid
                                          : column.id === 'seedSize'
                                          ? classes.disableGrid
                                          : '',
                                      )}
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

                                      <List dense={true}>
                                        {types !== undefined &&
                                          finalType
                                            // .sort((a, b) => a && a.localeCompare(b))

                                            .map((item) => {
                                              return (
                                                <ListItem
                                                  key={item}
                                                  id={item == 'PickLater' ? `PickLater-${column.id}` : item}
                                                  onClick={() => {
                                                    this.setItem(column.id, item, i);
                                                  }}
                                                  className={
                                                    this.columnIsSelected(column, item) ||
                                                    item == activeTableItem.seedSize
                                                      ? classes.selected
                                                      : classes.listItem
                                                  }
                                                >
                                                  <ListItemText>{item}</ListItemText>
                                                </ListItem>
                                              );
                                            })}
                                      </List>
                                    </Grid>
                                  );
                                })}
                                <Grid
                                  item
                                  xs={2}
                                  className={classnames(classes.gridHeaderBorderStyle)}
                                  style={{ maxWidth: maxWidth }}
                                >
                                  <List dense={true}>
                                    <ListItem style={{ padding: '0 13px', display: 'flex', flexDirection: 'column' }}>
                                      <div style={{ display: 'flex' }}>
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
                                            value: changeSupplyValue,
                                            onChange: (e) => this.setState({ changeSupplyValue: e.target.value }),
                                            className: classes.quantityInput,
                                            type: 'number',
                                            step: 0.1,
                                            min: 0,
                                          }}
                                        />
                                        {'units'}
                                      </div>
                                      {productList && (
                                        <div style={{ height: '370px', marginBottom: '30px' }}>
                                          {seedType == 'CANOLA' && productList.length == 2 ? (
                                            <div style={{ marginBottom: '20px', width: '235px' }}>
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
                                                        {po.productDetail !== undefined &&
                                                          po.productDetail.replace(po.packaging, '')}
                                                      </MenuItem>
                                                    );
                                                  })}
                                                </Select>
                                              </FormControl>
                                            </div>
                                          ) : null}
                                        </div>
                                      )}
                                    </ListItem>
                                  </List>
                                </Grid>
                              </div>
                            </Grid>
                          </Grid>
                        </Card>
                      </AccordionItemPanel>
                    </AccordionItem>
                  </Accordion>
                </div>
                {updateSeedConfirm}
                <div className={classes.dialogHeaderActions} style={{ marginTop: '20px' }}>
                  <Button
                    className={classes.button + ' ' + classes.white + ' ' + classes.primary}
                    style={{ width: '114px', height: '44px' }}
                    onClick={this.handleTableItemActionMenuClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    color="primary"
                    className={classes.CTABar}
                    // disabled
                    onClick={() => {
                      const selectedItem = productList[0];
                      const finalSupplyQty = parseFloat(selectedItem.supply || 0) + parseFloat(changeSupplyValue || 0);
                      const data = [
                        {
                          crossReferenceId: activeTableItem.crossReferenceId,
                          supply: activeTableItem.supply,
                          increase: false,
                          decrease: true,
                          dealerQty: parseFloat(changeSupplyValue || 0),
                        },
                        {
                          crossReferenceId: selectedItem.crossReferenceId,
                          supply: finalSupplyQty,
                          increase: true,
                          decrease: false,
                          dealerQty: parseFloat(changeSupplyValue || 0),
                        },
                      ];
                      console.log(selectedItem, 'selectedItem');
                      this.setState({
                        updateSeedConfirm: (
                          <SweetAlert
                            warning
                            showCancel
                            title="Confirm Seed Change"
                            onConfirm={() => {
                              this.changeSeedSizePackaging(data);
                            }}
                            onCancel={() => this.setState({ updateSeedConfirm: null })}
                            confirmBtnCssClass={classes.button + ' ' + classes.success}
                            cancelBtnCssClass={classes.button + ' ' + classes.danger}
                          >
                            Are you sure you want to swap {activeTableItem.supply} units of{' '}
                            {activeTableItem.productDetail} with {finalSupplyQty} units of same product but different
                            seed size and packaging?
                          </SweetAlert>
                        ),
                      });
                    }}
                    id="submitProduct"
                  >
                    Submit
                  </Button>
                </div>
              </Dialog>
            )}
            {this.state.syncBayerConfirm}
            <Snackbar
              open={showSnackBar}
              autoHideDuration={20000}
              onClose={() => this.setState({ showSnackBar: false })}
              anchorOrigin={{ vertical, horizontal }}
              message={messageForSnackBar}
              key={vertical + horizontal}
              onClick={() => this.setState({ showSnackBar: false })}
            ></Snackbar>
          </GridItem>
        </GridContainer>
      </Card>
      // )
    );
  }
}

const mapStateToProps = (state) => {
  return {
    apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
    productDealers: state.productDealerReducer.productDealers,
    customers: state.customerReducer.customers,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    monsantoRetailerOrderSummaryProducts: state.monsantoRetailerOrderSummaryReducer.products,
    monsantoRetailerOrderSummaryStatus: state.monsantoRetailerOrderSummaryReducer.loadingStatus,
    name: state.organizationReducer.name,
    totalItemsOfCustomers: state.customerReducer.totalItems,
    organizationId: state.userReducer.organizationId,
  };
};
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      checkInInventoryProductAvailability,
      listMonsantoProducts,
      listAllCustomProducts,
      updateIsChange,
      listApiSeedCompanies,
      listDeliveryReceipts,
      listRetailerOrderSummary,
      updateCurrentCropType,
      listSeedCompanies,
      checkShortProductProductAvailability,
    },
    dispatch,
  );

export default withStyles(styles, { withTheme: true })(
  connect(mapStateToProps, mapDispatchToProps)(GroupDetailProductTable),
);
