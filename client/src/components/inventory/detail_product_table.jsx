import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { flatten } from 'lodash/array';
import { sortBy } from 'lodash';
// material-ui icons
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import axios from 'axios';
// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import ReactTable from 'react-table';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import Snackbar from '@material-ui/core/Snackbar';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import './pt.css';
import SweetAlert from 'react-bootstrap-sweetalert';

import 'react-table/react-table.css';
// custom component
import ColumnMenu from './column_menu';
// import {
//   getQtyOrdered,
//   getQtyShipped,
//   getGrowerOrder,
//   getGrowerOrderDelivered
// } from "utilities/product";
import {
  getWareHouseValue,
  getCustomerProducts,
  getDeliveryLotsQty,
  getDeliveryLotsQtyReturn,
} from '../../utilities/product';
import { downloadCSV, createDealerFromCSV, csvStringToArray } from '../../utilities/csv';

import styles from './productTableStyles';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';

import LotsDialog from './lots_dialog';
import ReturnDialog from './return_dialog';
import AddFavoriteProductsDialog from './add_monsanto_favorite_product_dialog';
import ProductRelatedInfoDialog from './product_related_info_dialog';
import FetchUnitsDialog from './fetch_units_dialog';

import SummarySyncHistoryDialog from './summary_sync_history';
import { Checkbox, FormControlLabel } from '@material-ui/core';
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
  updateMonsantoProduct,
  createProductDealer,
} from '../../store/actions';

let lastminutes = '';
// import withFixedColumns from 'react-table-hoc-fixed-columns';
// import 'react-table-hoc-fixed-columns/lib/styles.css';

// const ReactTableFixedColumns = withFixedColumns(ReactTable);
const MONSANTO_SEED_TYPES = {
  C: 'CORN',
  B: 'SOYBEAN',
  S: 'SORGHUM',
  // A: 'ALFALFA',
  L: 'CANOLA',
};
const seedTypeClassificationMap = {
  CORN: 'C',
  SOYBEAN: 'B',
  SORGHUM: 'S',
  // ALFALFA: 'A',
  CANOLA: 'L',
  PACKAGING: 'P',
};
let totalDataRow;

class ApiDetailProductTable extends Component {
  state = {
    columns: [],

    deliveryReceiptDetails: [],
    horizMenuOpen: false,
    showAddFavoriteProductsDialog: false,
    favoriteProducts: [],
    showFavoriteProducts: true,
    showRetailerProducts: true,
    showFavoriteProductsAll: false,
    data: [],
    tableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,
    activeTableItem: null,
    selectedProduct: null,
    productRelatedPurchaseOrders: null,
    selectedProductRelatedPurchaseOrders: [],
    productRelatedInfoDialogOpen: false,
    fetchUnitsDialogOpen: false,
    productRelatedInfoDialogContext: 'purchase_orders',
    lotsDialogOpen: false,
    returnDialogOpen: false,
    lotsItem: null,
    historyDialogOpen: false,
    seedCsvData: '',
    seedListData: [],
    inventoryCsvdata: '',
    inventoryListData: [],
    serchText: '',
    groupData: false,
    packagingData: [],
    isLoadingData: true,
    retailOrderSummaryLasySyncDate: null,
    isLastUpdateLoading: false,
    showSnackbar: false,
    showSnackbarText: '',
    dealerInfo: null,
  };

  componentDidMount = async () => {
    const { listDeliveryReceipts } = this.props;
    await listDeliveryReceipts();
    // await listSeedCompanies();
    this.renderTable();

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

    setTimeout(() => {
      this.renderTable();
    }, 3000);

    setTimeout(() => {
      this.setState({ isLoadingData: false });
      this.renderTable();
    }, 8000);
  };
  componentDidUpdate(prevProps) {
    const { monsantoRetailerOrderSummaryProducts } = this.props;
    if (prevProps.deliveryReceipts !== this.props.deliveryReceipts) {
      this.renderTable();
    }
    if (
      lastminutes == '' &&
      monsantoRetailerOrderSummaryProducts.length > 0 &&
      this.state.retailOrderSummaryLasySyncDate == null
    ) {
      this.setState({
        retailOrderSummaryLasySyncDate: monsantoRetailerOrderSummaryProducts[0].retailOrderSummaryLasySyncDate,
      });
      this.getTheUpdate(monsantoRetailerOrderSummaryProducts[0].retailOrderSummaryLasySyncDate);
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
    // if (this.anchorEl.contains(event.target)) {
    //   return;
    // }
    this.setState({ horizMenuOpen: false });
  };

  handleAddFavoriteProductsDialogOpen = () => {
    this.setState({ showAddFavoriteProductsDialog: true });
  };

  handleAddFavoriteProductsDialogClose = () => {
    this.setState({ showAddFavoriteProductsDialog: false });
  };
  titleCase = (str) => {
    var splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
  };
  handleTableItemActionMenuOpen = (item) => (event) => {
    this.setState({
      tableItemActionMenuOpen: true,
      tableItemActionAnchorEl: event.target,
      activeTableItem: item,
    });
  };

  exportTemplateCsv = () => {
    let csvData = '';
    const headers = [
      'TransferID',
      'SendingDealer#',
      'SendingDealerName',
      'SendingDealerStreet',
      'SendingDealerCity',
      'SendingDealerState',
      'SendingDealerZip',
      'SendingDealerPhone',
      'SendingDealerPO',
      'ReceivingDealer#',
      'ReceivingDealerName',
      'ReceivingDealerStreet',
      'ReceivingDealerCity',
      'ReceivingDealerState',
      'ReceivingDealerZip',
      'ReceivingDealerPhone',
      'ReceivingDealerPO',
      'Status',
      'Type',
      'InitiatedDate',
      'LastModifiedDate',
      'ProductId',
      'ProductDescription',
      'ProductQuantity',
      'UOM',
      'LotNumber',
      'Crop',
      'UPC',
      'GTIN',
    ];

    csvData += headers.join(',');
    csvData += '\n';

    const row = [
      'TRrfc039037w9r/22',
      '1231245',
      'DEMOEXAMPLE',
      '14/d239221STST',
      'THANOS',
      'MfN',
      '56170-1052',
      '5073473266',
      'ewsffd',
      '9200483',
      'DEMOEXAMPLE',
      '1823PUNE59',
      'THOR',
      'MN',
      '56173321700',
      '23478368385',
      '1226000',
      'COMPLETED',
      'OUT',
      '2022022420',
      '2220220420',
      '43223152',
      'FKS51-25RIBDC2PtSP50ELT500B-E',
      '50',
      'SSU',
      'H13MTT4JX',
      'CORN',
      '190794000000',
      '00190794147057',
    ];
    csvData += row.join(',');
    csvData += '\n';

    downloadCSV(csvData, 'dealerTransferCsvTemplate');
  };
  handleTableItemActionMenuClose = () => {
    this.setState({
      tableItemActionMenuOpen: false,
      activeTableItem: null,
      products: this.state.products,
    });
  };
  get isApiSeedCompanyProductsDublicate() {
    return this.props.history.location.pathname.match(/^\/app\/d_api_seed_companies/);
  }
  handleProductRelatedInfoDialogOpen = (item, context) => {
    const {
      seedCompanyId,
      customers,
      deliveryReceipts,
      // company
    } = this.props;
    const companyType = 'Api Seed Company';
    const isDublicate = this.isApiSeedCompanyProductsDublicate ? true : false;
    axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        if (response.data) {
          const cust = response.data.customersdata;
          const productRelatedPurchaseOrders = getCustomerProducts(
            cust,
            companyType,
            seedCompanyId,
            deliveryReceipts,
            isDublicate,
          );

          this.setState({
            productRelatedInfoDialogContext: context,
            productRelatedInfoDialogOpen: true,
            selectedProduct: item,
            selectedProductRelatedPurchaseOrders: isDublicate
              ? productRelatedPurchaseOrders[item.crossReferenceId]
              : productRelatedPurchaseOrders[item.productId] || [],
          });
        }
      });
  };

  handleFetchUnitsDialogOpen = (item, context) => {
    this.setState({
      productRelatedInfoDialogContext: context,
      fetchUnitsDialogOpen: true,
      selectedProduct: item,
    });
  };

  handleLotsDialogOpen = (item) => {
    this.setState({ lotsDialogOpen: true, lotsItem: item });
  };

  handleReturnDialogOpen = (item) => {
    this.setState({ returnDialogOpen: true, lotsItem: item });
  };
  fetchRetailerOrderSummary = () => {
    const {
      zoneIds,
      seedCompanyId,
      listRetailerOrderSummary,
      updateCurrentCropType,
      dynamic_crop_codes,
      selectedZoneId,
      tabIndex,
    } = this.props;
    // this.props.listApiSeedCompanies();

    const cropType = dynamic_crop_codes[tabIndex];
    listRetailerOrderSummary({
      cropType,
      seedCompanyId,
      zoneId: selectedZoneId,
    }).then(() => updateCurrentCropType(cropType));
    this.renderTable();
  };

  handleReturnDialogClose = (isUnmodified) => {
    this.setState({ returnDialogOpen: false });
    this.fetchRetailerOrderSummary();
  };

  handleLotsDialogClose = (isUnmodified) => {
    this.setState({
      lotsDialogOpen: false,
      // }
      // , () => {
      // if (!isUnmodified) {
      //   this.props.productType === 'custom' ? this.props.listAllCustomProducts(true) : this.props.listProducts(true);
      // }
    });
    this.fetchRetailerOrderSummary();
  };

  handleHistoryDialogClose = () => {
    this.setState({ historyDialogOpen: false });
  };

  handleProductRelatedInfoDialogClose = () => {
    this.setState({ productRelatedInfoDialogOpen: false });
  };

  handleFetchUnitsDialogClose = () => {
    this.setState({ fetchUnitsDialogOpen: false });
  };

  setFavoriteProducts = async () => {
    const {
      seedCompany: { MonsantoFavoriteProducts },
      productType,
    } = this.props;
    const classification = seedTypeClassificationMap[productType.toUpperCase()];
    let result = [];
    if (MonsantoFavoriteProducts) {
      result = await Promise.all(
        await MonsantoFavoriteProducts.filter((_product) => _product.Product.classification === classification).map(
          (product) => {
            return {
              ...product,
              productId: product.Product.crossReferenceId,
              isFavorite: true,
            };
          },
        ),
      );
    }
    this.setState({ favoriteProducts: result });
  };

  renderTable = async () => {
    const {
      deliveryReceipts,
      seedCompany,
      productType,
      customerMonsantoProduct,
      listAllCustomProducts,
      classes,
      selectedColumnIds,
      monsantoRetailerOrderSummaryProducts,
    } = this.props;
    const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));
    // listAllCustomProducts();

    this.setFavoriteProducts();
    const metadata = JSON.parse(seedCompany.metadata);
    let columns = [];

    const addField = (field, content) => {
      if (!metadata && !metadata[productType][field]) return;
      columns.push({
        show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes(content.id) ? true : false,
        ...content,
      });
    };

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
    addField('Variety', {
      Header: (
        <div className={classes.headClass}>
          <span id="Variety" style={{ color: '#38A154', height: '65px', display: 'flex', alignItems: 'center' }}>
            Variety
          </span>
          <span className={classes.totalRowClass}>-</span>
        </div>
      ),

      width: 120,
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'Variety',
      sortable: true,
      name: 'Variety',
      sortMethod: (a, b) => {
        return a.localeCompare(b);
      },
      accessor: (product) => product.variety,
    });

    addField('Trait', {
      Header: (
        <div className={classes.headClass}>
          <span id="Trait" style={{ color: '#38A154', height: '65px', display: 'flex', alignItems: 'center' }}>
            Trait
          </span>
          <span>-</span>
        </div>
      ),
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('Trait') ? true : false,
      width: 80,
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'Trait',

      name: 'Trait',
      sortable: true,
      sortMethod: (a, b) => {
        return a.localeCompare(b);
      },
      accessor: (product) => product.trait,
    });

    addField('rm', {
      Header: (
        <div className={classes.headClass}>
          <span id="RM" style={{ color: '#38A154', height: '65px', display: 'flex', alignItems: 'center' }}>
            RM
          </span>
          <span>{totalDataRow.rm}</span>
        </div>
      ),
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('rm') ? true : false,

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      name: 'RM',
      id: 'rm',
      sortable: true,
      accessor: (product) => {
        return <div style={{ textAlign: 'center' }}>{product.rm}</div>;
      },
    });
    addField('treatment', {
      Header: (
        <div className={classes.headClass}>
          <span id="Treatment" style={{ color: '#38A154', height: '65px', display: 'flex', alignItems: 'center' }}>
            Treatment
          </span>
          <span className={classes.totalRowClass}>-</span>
        </div>
      ),
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('treatment') ? true : false,

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      name: 'Treatment',
      id: 'treatment',
      sortMethod: (a, b) => {
        return a.props.children.localeCompare(b.props.children);
      },
      sortable: true,
      accessor: (product) => <div style={{ textAlign: 'center' }}>{product.treatment}</div>,
    });
    addField('packaging', {
      Header: (
        <div className={classes.headClass}>
          <span id="Packaging" style={{ color: '#38A154', height: '65px', display: 'flex', alignItems: 'center' }}>
            Packaging
          </span>
          <span className={classes.totalRowClass}>-</span>
        </div>
      ),
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('Packaging') ? true : false,

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      name: 'Packaging',
      id: 'Packaging',
      sortMethod: (a, b) => {
        return a.props.children.localeCompare(b.props.children);
      },
      sortable: true,
      accessor: (product) => {
        return <div style={{ textAlign: 'center' }}>{product.packaging}</div>;
      },
    });
    addField('seedsize', {
      Header: (
        <div className={classes.headClass}>
          <span id="Seedsize" style={{ color: '#38A154', height: '65px', display: 'flex', alignItems: 'center' }}>
            Seedsize
          </span>
          <span className={classes.totalRowClass}>-</span>
        </div>
      ),
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('seedsize') ? true : false,

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      name: 'Seedsize',
      id: 'seedsize',
      sortMethod: (a, b) => {
        return a.props.children.localeCompare(b.props.children);
      },
      sortable: true,
      accessor: (product) => {
        return <div style={{ textAlign: 'center' }}>{product.seedSize ? product.seedSize : '-'}</div>;
      },
    });
    // addField('msrp', {
    //   Header: (
    //     <div className={classes.headClass}>
    //       <span id="MSRP" style={{ color: '#38A154', height: '65px', display: 'flex', alignItems: 'center' }}>
    //         MSRP
    //       </span>

    //       <span className={classes.totalRowClass}>-</span>
    //     </div>
    //   ),
    //   show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('msrp') ? true : false,

    //   headerStyle: {
    //     fontWeight: 'bold',
    //     fontSize: '14px',
    //     color: '#000000',
    //   },
    //   name: 'MSRP',
    //   id: 'msrp',
    //   sortMethod: (a, b) => {
    //     return parseFloat(a) - parseFloat(b);
    //   },
    //   sortable: true,
    //   accessor: (product) => {
    //     return product.msrp;
    //   },
    // });
    // addField('dealerPrice', {
    //   Header: (
    //     <div className={classes.headClass}>
    //       <span id="dealerPrice" style={{ color: '#38A154', height: '65px', display: 'flex', alignItems: 'center' }}>
    //         DealerPrice
    //       </span>

    //       <span className={classes.totalRowClass}>-</span>
    //     </div>
    //   ),
    //   show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('dealerPrice') ? true : false,

    //   headerStyle: {
    //     fontWeight: 'bold',
    //     fontSize: '14px',
    //     color: '#000000',
    //   },
    //   name: 'DealerPrice',
    //   id: 'dealerPrice',
    //   sortMethod: (a, b) => {
    //     return parseFloat(a) - parseFloat(b);
    //   },
    //   sortable: true,
    //   accessor: (product) => {
    //     return product.dealerPrice;
    //   },
    // });
    // addField("seedCompany", {
    //   Header: (
    //     <span>
    //       Shipped
    //       <br/>
    //       From Bayer
    //     </span>
    //   ),
    //   headerStyle: {
    //       fontWeight: "bold",
    //       fontSize: "14px",
    //       color: "#000000"
    //     },
    //   id: "qty-shipped-from-seed-co",
    //   accessor: product =>
    //     product.isFavorite ? "-" : parseInt(product.shippedQuantityValue, 10)
    // });

    // addField("seedCompany", {
    //   Header: (
    //     <span>
    //       Yet To
    //       <br/>
    //        Ship
    //     </span>
    //   ),
    //   headerStyle: {
    //       fontWeight: "bold",
    //       fontSize: "14px",
    //       color: "#000000"
    //     },
    //   id: "undeliveredSeedCompany",
    //   accessor: product =>
    //     product.isFavorite
    //       ? "-"
    //       : parseInt(product.scheduledToShipQuantityValue, 10)
    // });

    // addField('grower', {
    //   Header: 'Grower Order',
    //   headerStyle: styles.columnHeaderOverride,
    //   id: 'growerOrder',
    //   accessor: d => getGrowerOrder(d, customerProducts),
    // })

    // addField('grower', {
    //   Header: 'Grower Order Delivered',
    //   headerStyle: styles.columnHeaderOverride,
    //   id: 'deliveredGrowerOrder',
    //   accessor: d => getGrowerOrderDelivered(d, deliveryReceiptDetails),
    // })
    // addField('grower', {
    //   Header: 'Grower Order Yet to Deliver',
    //   headerStyle: styles.columnHeaderOverride,
    //   id: 'unDeliveredGrowerOrder',
    //   accessor: d => customerProducts
    //     .filter(order => order.ProductId === d.id)
    //     .reduce((unDelivered, acc) => unDelivered + (acc.orderQty - acc.amountDelivered), 0),
    // })

    addField('qtyWarehouse', {
      Header: (
        <div className={classes.headClass}>
          <span id="Warehouse" style={{ color: '#38A154', height: '65px', display: 'flex', alignItems: 'center' }}>
            Warehouse
            <br></br>/On-hand{' '}
          </span>
          <span className={classes.totalRowClass}>{totalDataRow.availableQuantity}</span>
        </div>
      ),
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('availableQuantity') ? true : false,
      name: 'WareHouse/On-hand',
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      sortMethod: (a, b) => {
        return parseFloat(a) - parseFloat(b);
      },
      sortable: true,
      id: 'availableQuantity',
      accessor: (product) => {
        return <div style={{ textAlign: 'center' }}>{parseFloat(product.availableQuantity || 0).toFixed(2)}</div>;
      },
      // product.isFavorite
      //       ? "-"
      //       : parseInt(product.balanceToShipQuantityValue, 10)
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
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('bayerDealerBucketQty') ? true : false,

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
    addField('deliveredToGrower', {
      Header: (
        <div className={classes.headClass}>
          <span
            id="DeliveredToGrower"
            style={{ color: '#38A154', height: '65px', display: 'flex', alignItems: 'center' }}
          >
            {' '}
            Delivered to <br></br>Growers
          </span>
          <span className={classes.totalRowClass}>{totalDataRow.deliveredToGrower}</span>
        </div>
      ),
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('deliveredToGrower') ? true : false,

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'deliveredToGrower',
      name: 'DeliveredToGrower',
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,
      accessor: (product) => {
        return <div style={{ textAlign: 'center' }}>{parseFloat(product.deliveredToGrower || 0).toFixed(2)}</div>;
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
          <span className={classes.totalRowClass}>{parseFloat(totalDataRow.allGrowerQty || 0)}</span>
        </div>
      ),
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('allGrowerQty') ? true : false,

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
        return <div style={{ textAlign: 'center' }}>{parseFloat(product.allGrowerQty || 0).toFixed(2)}</div>;
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
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('demand') ? true : false,

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
        return <div style={{ textAlign: 'center' }}>{parseFloat(product.demand).toFixed(2)}</div>;
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
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('supply') ? true : false,

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
        return <div style={{ textAlign: 'center' }}>{parseFloat(product.supply).toFixed(2)}</div>;
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
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('longShort') ? true : false,

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
        return <div style={{ textAlign: 'center' }}>{parseFloat(product.longShort).toFixed(2)}</div>;
      },
    });

    addField('Long/ShortwithoutDealerBucket', {
      Header: (
        <div className={classes.headClass}>
          <span
            id="Long/ShortDealer"
            style={{ color: '#373a3ed9', height: '65px', display: 'flex', alignItems: 'center' }}
          >
            Long/Short without <br></br> Dealer Bucket
          </span>
          <span className={classes.totalRowClass}>{totalDataRow.longShortwithoutDealerBucket}</span>
        </div>
      ),
      name: 'Long/Short without DealerBucket',
      show:
        selectedColumnIds.length == 0
          ? true
          : selectedColumnIds.includes('Long/ShortwithoutDealerBucket')
          ? true
          : false,

      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'Long/ShortwithoutDealerBucket',
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,
      accessor: (product) => {
        return <div style={{ textAlign: 'center' }}>{product.longShortwithoutDealerBucket}</div>;
      },
    });

    // addField('seedCompany', {
    //   Header: <span>Supply</span>,
    //   headerStyle: {
    //     fontWeight: 'bold',
    //     fontSize: '14px',
    //     color: '#000000',
    //   },
    //   accessor: (product) => (product.isFavorite ? '-' : parseInt(product.totalRetailerProductQuantityValue, 10)),
    //   id: 'qtyOrderedFromSeedCo',
    // });

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
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('quantity') ? true : false,

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

    addField('allGrowersUnsynced', {
      Header: (
        <div className={classes.headClass}>
          <span
            id="GrowersUn-synced"
            style={{ color: '#38A154', height: '65px', display: 'flex', alignItems: 'center' }}
          >
            All Growers Including
            <br /> Un-synced
          </span>
          <span className={classes.totalRowClass}>{totalDataRow.allGrowersUnsynced}</span>
        </div>
      ),
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '11px',
        color: '#000000',
      },
      id: 'allGrowersUnsynced',
      name: 'All Growers Including/Un-synced',
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('allGrowersUnsynced') ? true : false,

      sortable: true,
      accessor: (product) => {
        return <div style={{ textAlign: 'center' }}>{product.allGrowersUnsynced}</div>;
      },
    });

    columns.push({
      Header: (
        <div className={classes.headClass}>
          <span id="productId" style={{ color: '#38A154', height: '65px', display: 'flex', alignItems: 'center' }}>
            Product ID
          </span>
          <span>-</span>
        </div>
      ),
      show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes('description') ? true : false,

      id: 'description',
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      name: 'Product ID',
      sortable: true,
      accessor: (product) => {
        return (
          <div style={{ textAlign: 'center' }}>
            {/* {detail} */}
            {/* <br /> */}
            {product.productId}
            {/* <br /> */}
            {/* {product.isFavorite ? "Favorite Product" : "Retail Product"} */}
          </div>
        );
      },
    });

    const localColumns = JSON.parse(window.localStorage.getItem('INVENTORY_SHOW_COLUMNS'));

    if (localColumns)
      columns = columns.map((column, index) => {
        return { ...column };
      });

    this.setState({ columns });
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

      const { suggestedDealerPrice, suggestedEndUserPrice } = product.Product.LineItem || {};
      const { zoneIds, selectedZoneId } = this.props;
      let DealerPrice = '';
      let EndUserPrice = '';
      if (
        suggestedDealerPrice !== undefined &&
        JSON.parse(suggestedDealerPrice) &&
        JSON.parse(suggestedEndUserPrice)['NZI']
      ) {
        DealerPrice = JSON.parse(suggestedDealerPrice)['NZI'];
        EndUserPrice = JSON.parse(suggestedEndUserPrice)['NZI'];
      } else if (suggestedDealerPrice !== undefined) {
        DealerPrice = JSON.parse(suggestedDealerPrice)[selectedZoneId || zoneIds[0]];
        EndUserPrice = JSON.parse(suggestedEndUserPrice)[selectedZoneId || zoneIds[0]];
      } else {
        DealerPrice = 0;
        EndUserPrice = 0;
      }

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
      const cmp = this.props.customerMonsantoProduct.filter(
        (p) => p.monsantoProductId == product.productId && p.isSent === true,
      );
      cmp.map((p) => {
        totalOrderQty += parseInt(p.orderQty);
      });
      const longShort =
        Number(product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0) -
          product.demand || 0;

      tableData.push({
        action: product,
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
        longShort: longShort || 0,
        longShortwithoutDealerBucket:
          Number(product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0) -
            product.allGrowerQty || 0,
        bayerAvailability: parseFloat(product.Product.quantity || 0).toFixed(2), //quanity
        allGrowersUnsynced: totalOrderQty.toFixed(2),
        productId: product.productId,
        crossReferenceId: product.Product.crossReferenceId,
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

  handleShowFavoriteProducts = (event) => {
    this.setState({ showFavoriteProducts: event.target.checked });
  };

  handleShowRetailerProducts = (event) => {
    this.setState({ showRetailerProducts: event.target.checked });
  };

  handleShowAllFavoriteProducts = (event) => {
    this.setState({ showFavoriteProductsAll: event.target.checked });
  };

  reload = () => {
    this.setState({ showAddFavoriteProductsDialog: false }, () => {
      window.location.reload();
    });
  };

  // exportCsv = (data) => {
  //   let csvData = '';
  //   let tabledata = [];
  //   const headers = [
  //     'Variety',
  //     'Trait',
  //     'RM',
  //     'Treatment',
  //     'Packaging',
  //     'Seedsize',
  //     'MSRP',
  //     'Dealer Bucket',
  //     'All Growers',
  //     'Demand',
  //     'Supply',
  //     'Long/Short',
  //     'Bayer Availability',
  //     'All Growers Including Un-synced',
  //     'Product Id',
  //     'Warehouse/On-hand ',
  //     'Received from Bayer',
  //     'Returned to Bayer',
  //     'Transfer In',
  //     'Transfer Out',
  //     'Total delivered to growers',
  //   ];
  //   csvData += headers.join(',');
  //   csvData += '\n';

  //   data.forEach((product) => {
  //     let rm;
  //     const { blend } = product.Product;
  //     let match = blend && blend.match(/DKC[0-9]*-/);
  //     if (match) {
  //       let i = match[0].replace('DKC', '').replace('-', '');
  //       rm = parseInt(i, 0) + 50;
  //     } else {
  //       rm = '-';
  //     }
  //     const { suggestedDealerPrice, suggestedEndUserPrice } = product.Product.LineItem || {};
  //     const { zoneIds, selectedZoneId } = this.props;
  //     let DealerPrice = '';
  //     let EndUserPrice = '';
  //     if (
  //       suggestedDealerPrice !== undefined &&
  //       JSON.parse(suggestedDealerPrice) &&
  //       JSON.parse(suggestedEndUserPrice)['NZI']
  //     ) {
  //       DealerPrice = JSON.parse(suggestedDealerPrice)['NZI'];
  //       EndUserPrice = JSON.parse(suggestedEndUserPrice)['NZI'];
  //     } else if (suggestedDealerPrice !== undefined) {
  //       DealerPrice = JSON.parse(suggestedDealerPrice)[selectedZoneId || zoneIds[0]];
  //       EndUserPrice = JSON.parse(suggestedEndUserPrice)[selectedZoneId || zoneIds[0]];
  //     } else {
  //       DealerPrice = 0;
  //       EndUserPrice = 0;
  //     }
  //     const msrp = DealerPrice || EndUserPrice;
  //     let totalOrderQty = 0;
  //     const cmp = this.props.customerMonsantoProduct.filter((p) => p.monsantoProductId == product.productId);
  //     cmp.map((p) => {
  //       totalOrderQty += parseInt(p.orderQty);
  //     });
  //     let transferIn = 0;
  //     let transferOut = 0;
  //     let returnQty = 0;
  //     let receivedQty = 0;
  //     product.Product.monsantoLots &&
  //       product.Product.monsantoLots.length > 0 &&
  //       product.Product.monsantoLots.map((l) => {
  //         if (l.source === 'Transfer In' && l.isReturn == null) {
  //           transferIn = transferIn + parseFloat(l.quantity);
  //         } else if (l.source === 'Transfer Out' && l.isReturn == null) {
  //           transferOut = transferOut + parseFloat(l.quantity);
  //         } else if (l.isReturn === true) {
  //           returnQty += parseFloat(l.quantity);
  //         } else if (l.isReturn === false) {
  //           receivedQty += parseFloat(l.quantity);
  //         }
  //       });

  //     const { deliveryReceipts } = this.props;
  //     const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));
  //     const quatityID = deliveryReceiptDetails.filter((data) => data.monsantoProductId === product.Product.id);
  //     const deliveryQtyisReturn = getDeliveryLotsQtyReturn(quatityID, deliveryReceipts);
  //     const deliveryQty = getDeliveryLotsQty(quatityID, deliveryReceipts);
  //     const value = getWareHouseValue(product.Product);
  //     const productOriginalQuantity = Number.parseInt(0);
  //     const wareHouseValue = productOriginalQuantity + value - deliveryQty + deliveryQtyisReturn;

  //     tabledata.push({
  //       Variety: product.Product.blend,
  //       Trait: product.Product.brand,
  //       RM: rm,
  //       Treatment: product.Product.treatment,
  //       Packaging: product.Product.packaging ? product.Product.packaging : '-',
  //       Seedsize: product.Product.seedSize ? product.Product.seedSize : '-',
  //       MSRP: msrp,
  //       DealerBucket: product.bayerDealerBucketQty,
  //       AllGrowers: product.allGrowerQty,
  //       Demand: product.demand,
  //       Supply: product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0,
  //       LongShort:
  //         Number(product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0) -
  //         product.demand,
  //       BayerAvailability: parseInt(product.Product.quantity) >= 1000 ? '1000+' : product.Product.quantity,
  //       AllGrowersIncludingUnSynced: totalOrderQty,
  //       productId: product.productId,
  //       WarehouseOnHand: wareHouseValue,
  //     });

  //     const row = [
  //       product.Product.blend,
  //       product.Product.brand,
  //       rm,
  //       product.Product.treatment,
  //       product.Product.packaging ? product.Product.packaging : '-',
  //       product.Product.seedSize ? product.Product.seedSize : '-',
  //       msrp,
  //       product.bayerDealerBucketQty,
  //       product.allGrowerQty,
  //       product.demand,
  //       product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0,
  //       Number(product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0) -
  //         product.demand,
  //       parseInt(product.Product.quantity) >= 1000 ? '1000+' : product.Product.quantity,
  //       totalOrderQty,
  //       product.productId,
  //       wareHouseValue,
  //       receivedQty,
  //       returnQty,
  //       transferIn,
  //       transferOut,
  //       deliveryQty,
  //     ];
  //     csvData += row.join(',');
  //     csvData += '\n';
  //   });
  //   this.setState({
  //     inventoryCsvdata: csvData,
  //     inventoryListData: tabledata,
  //   });
  //   // downloadCSV(csvData, `${this.props.productType}Inventory`);
  // };

  // exportSeedWarehouseReport = (seedCompanyId) => {
  //   const { seedCompanies, deliveryReceipts, customers } = this.props;
  //   let csvData = '';
  //   const headers = [
  //     'Customer',
  //     'Purchase Order',
  //     'Product Type',
  //     'Product Detail',
  //     'Order Qty',
  //     'Qty Delivered',
  //     'Qty Remaining',
  //   ];
  //   let tableData = [];
  //   let tableDataNonBayer = [];
  //   // regular company customers product
  //   customers
  //     .sort((a, b) => a.name.localeCompare(b.name))
  //     .filter((item) => item.PurchaseOrders.length > 0)
  //     .forEach((item) => {
  //       {
  //         return item.PurchaseOrders.filter((po) => po.isQuote == false && po.isDeleted == false).forEach(
  //           (purchaseOrder) => {
  //             if (seedCompanyId == 'all') {
  //               purchaseOrder.CustomerCustomProducts.filter((item) => item.orderQty > 0 && item.isDeleted == false)
  //                 .sort((a, b) => a.CustomProduct.name.localeCompare(b.CustomProduct.name))
  //                 .forEach((customOrder) => {
  //                   const deliveredData =
  //                     deliveryReceipts &&
  //                     deliveryReceipts
  //                       .filter((d) => d.purchaseOrderId === customOrder.purchaseOrderId)
  //                       .map((dd) =>
  //                         dd.DeliveryReceiptDetails.filter(
  //                           (drd) => drd.customerMonsantoProductId === customOrder.id,
  //                         ).reduce((acc, detail) => acc + parseFloat(detail.amountDelivered), 0),
  //                       );
  //                   const deliveredAmount = deliveredData.reduce((partialSum, a) => partialSum + a, 0);

  //                   const customProductDetail = `${customOrder.CustomProduct.name} ${customOrder.CustomProduct.description} UN-${customOrder.CustomProduct.costUnit}`;
  //                   tableData.push({
  //                     customer: `"${item.name}"`,
  //                     purchaseOrder: `#PO${purchaseOrder.id}`,
  //                     productDetail: customProductDetail.replace(/(^\&)|,/g, '_'),
  //                     orderQty: customOrder.orderQty,
  //                     qtyDelivered: parseFloat(deliveredAmount || 0).toFixed(2),
  //                     qtyRemaining: parseFloat(customOrder.orderQty).toFixed(2) - (deliveredAmount || 0).toFixed(2),
  //                     type: 'Non Bayer(custom product)',
  //                   });
  //                 });

  //               // seed company customer product

  //               purchaseOrder.CustomerProducts.filter((item) => item.orderQty > 0 && item.isDeleted == false)
  //                 .sort((a, b) => a.Product.brand.localeCompare(b.Product.brand))
  //                 .forEach((customerOrder) => {
  //                   const deliveredData =
  //                     deliveryReceipts &&
  //                     deliveryReceipts
  //                       .filter((d) => d.purchaseOrderId === customerOrder.purchaseOrderId)
  //                       .map((dd) =>
  //                         dd.DeliveryReceiptDetails.filter(
  //                           (drd) => drd.customerMonsantoProductId === customerOrder.id,
  //                         ).reduce((acc, detail) => acc + detail.amountDelivered, 0),
  //                       );
  //                   const deliveredAmount = deliveredData.reduce((partialSum, a) => partialSum + a, 0);
  //                   const seedCompany = seedCompanies.find((sc) => sc.id == customerOrder.Product.seedCompanyId);
  //                   let productSeedType = customerOrder.Product.seedType
  //                     ? this.titleCase(customerOrder.Product.seedType.toLowerCase())
  //                     : '';
  //                   const metadata = JSON.parse(seedCompany.metadata);
  //                   const seedtype = metadata[productSeedType] ? metadata[productSeedType].brandName : '';
  //                   const productFirstLine = `${seedtype} ${seedCompany.name}`;
  //                   const customerProductDetail = `${customerOrder.Product.brand} ${customerOrder.Product.blend} ${customerOrder.Product.treatment} `;
  //                   tableData.push({
  //                     customer: `"${item.name}"`,
  //                     purchaseOrder: `#PO${purchaseOrder.id}`,
  //                     productDetail: customerProductDetail.replace(/(^\&)|,/g, '_'),
  //                     orderQty: customerOrder.orderQty,
  //                     qtyDelivered: parseFloat(deliveredAmount || 0).toFixed(2),
  //                     qtyRemaining: parseFloat(customerOrder.orderQty).toFixed(2) - deliveredAmount.toFixed(2),
  //                     type: 'Non Bayer(seed company product)',
  //                   });
  //                 });
  //             }

  //             // customers monsanto product
  //             purchaseOrder.CustomerMonsantoProducts.filter(
  //               (item) => item.isSent !== false && item.orderQty > 0 && item.isDeleted == false,
  //             ).forEach((order) => {
  //               if (seedCompanyId !== 'all') {
  //                 if (order.MonsantoProduct.seedCompanyId != seedCompanyId) return;
  //               }

  //               const deliveredData =
  //                 deliveryReceipts &&
  //                 deliveryReceipts
  //                   .filter((d) => d.purchaseOrderId === order.purchaseOrderId)
  //                   .map((dd) =>
  //                     dd.DeliveryReceiptDetails.filter((drd) => drd.customerMonsantoProductId === order.id).reduce(
  //                       (acc, detail) => acc + parseFloat(detail.amountDelivered),
  //                       0,
  //                     ),
  //                   );

  //               // if (MONSANTO_SEED_TYPES[order.MonsantoProduct.classification] !== productType.toUpperCase()) return;
  //               const productDetail = order.MonsantoProduct.productDetail
  //                 ? order.MonsantoProduct.productDetail
  //                 : `${order.MonsantoProduct.blend} ${order.MonsantoProduct.seedSize} ${order.MonsantoProduct.brand} ${order.MonsantoProduct.packaging} ${order.MonsantoProduct.treatment}`;
  //               const deliveredAmount = deliveredData.reduce((partialSum, a) => partialSum + a, 0);
  //               tableData.push({
  //                 customer: `"${item.name}"`,
  //                 purchaseOrder: `#PO${purchaseOrder.id}`,
  //                 productDetail,
  //                 orderQty: order.orderQty,
  //                 qtyDelivered: deliveredAmount || 0,
  //                 qtyRemaining: order.orderQty - deliveredAmount || 0,
  //                 type: 'Bayer',
  //               });
  //             });
  //           },
  //         );
  //       }
  //     });
  //   csvData += headers.join(',');
  //   csvData += '\n';
  //   tableData.forEach((product) => {
  //     const row = [
  //       product.customer,
  //       product.purchaseOrder,
  //       product.type,
  //       product.productDetail,
  //       product.orderQty,
  //       product.qtyDelivered,
  //       product.qtyRemaining,
  //     ];
  //     csvData += row.join(',');
  //     csvData += '\n';
  //   });
  //   // downloadCSV(csvData, `seedWareHouseReport`);
  //   this.setState({
  //     seedCsvData: csvData,
  //     seedListData: tableData,
  //   });
  // };

  exportReceivedReturns = (data) => {
    let csvData = '';
    let tabledata = [];
    const headers = [
      'Variety',
      'Trait',
      'RM',
      'Treatment',
      'Packaging',
      'Seedsize',
      'MSRP',
      'Dealer Bucket',
      'All Growers',
      'Demand',
      'Supply',
      'Long/Short',
      'Bayer Availability',
      'All Growers Including Un-synced',
      'Product Id',
      'lotNumber',
      'Bill of Lading',
      'shipDate',
      'quantity',
      'receivedQty',
      'deliveryDate',
      'deliveryNoteNumber',
      'Return/Received',
    ];
    csvData += headers.join(',');
    csvData += '\n';
    data.forEach((product) => {
      let rm;
      const { blend } = product.Product;
      let match = blend && blend.match(/DKC[0-9]*-/);
      if (match) {
        let i = match[0].replace('DKC', '').replace('-', '');
        rm = parseInt(i, 0) + 50;
      } else {
        rm = '-';
      }
      const { suggestedDealerPrice, suggestedEndUserPrice } = product.Product.LineItem || {};
      const { zoneIds, selectedZoneId } = this.props;
      let DealerPrice = '';
      let EndUserPrice = '';
      if (
        suggestedDealerPrice !== undefined &&
        JSON.parse(suggestedDealerPrice) &&
        JSON.parse(suggestedEndUserPrice)['NZI']
      ) {
        DealerPrice = JSON.parse(suggestedDealerPrice)['NZI'];
        EndUserPrice = JSON.parse(suggestedEndUserPrice)['NZI'];
      } else if (suggestedDealerPrice !== undefined) {
        DealerPrice = JSON.parse(suggestedDealerPrice)[selectedZoneId || zoneIds[0]];
        EndUserPrice = JSON.parse(suggestedEndUserPrice)[selectedZoneId || zoneIds[0]];
      } else {
        DealerPrice = 0;
        EndUserPrice = 0;
      }
      const msrp = DealerPrice || EndUserPrice;
      let totalOrderQty = 0;
      const cmp = this.props.customerMonsantoProduct.filter((p) => p.monsantoProductId == product.productId);
      cmp.map((p) => {
        totalOrderQty += parseInt(p.orderQty);
      });

      if (product.Product.monsantoLots && product.Product.monsantoLots.length > 0) {
        product.Product.monsantoLots.forEach((lot) => {
          tabledata.push({
            Variety: product.Product.blend,
            Trait: product.Product.brand,
            RM: rm,
            Treatment: product.Product.treatment,
            Packaging: product.Product.packaging ? product.Product.packaging : '-',
            Seedsize: product.Product.seedSize ? product.Product.seedSize : '-',
            MSRP: msrp,
            DealerBucket: product.bayerDealerBucketQty,
            AllGrowers: product.allGrowerQty,
            Demand: product.demand,
            Supply: product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0,
            LongShort:
              Number(product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0) -
              product.demand,
            BayerAvailability: parseInt(product.Product.quantity) >= 1000 ? '1000+' : product.Product.quantity,
            AllGrowersIncludingUnSynced: totalOrderQty,
            productId: product.productId,

            lotNumber: lot.lotNumber,
            BillofLading: lot.shipNotice,
            shipDate: moment.utc(lot.shipDate).format('YYYY-MM-DD'),
            quantity: lot.quantity,
            receivedQty: lot.receivedQty,
            deliveryDate: moment.utc(lot.deliveryDate).format('YYYY-MM-DD'),
            deliveryNoteNumber: lot.deliveryNoteNumber,
            ReturnReceived: lot.isReturn ? 'Return' : 'Received',
          });
          const row = [
            product.Product.blend,
            product.Product.brand,
            rm,
            product.Product.treatment,
            product.Product.packaging ? product.Product.packaging : '-',
            product.Product.seedSize ? product.Product.seedSize : '-',
            msrp,
            product.bayerDealerBucketQty,
            product.allGrowerQty,
            product.demand,
            product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0,
            Number(product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0) -
              product.demand,
            parseInt(product.Product.quantity) >= 1000 ? '1000+' : product.Product.quantity,
            totalOrderQty,
            product.productId,
            lot.lotNumber,
            lot.shipNotice,
            moment.utc(lot.shipDate || new Date()).format('YYYY-MM-DD'),
            lot.quantity,
            lot.receivedQty,
            moment.utc(lot.deliveryDate).format('YYYY-MM-DD'),
            lot.deliveryNoteNumber,
            lot.isReturn ? 'Return' : 'Received',
          ];
          csvData += row.join(',');
          csvData += '\n';
        });
      } else {
        const row = [
          product.Product.blend,
          product.Product.brand,
          rm,
          product.Product.treatment,
          product.Product.packaging ? product.Product.packaging : '-',
          product.Product.seedSize ? product.Product.seedSize : '-',
          msrp,
          product.bayerDealerBucketQty,
          product.allGrowerQty,
          product.demand,
          product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0,
          Number(product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0) -
            product.demand,
          parseInt(product.Product.quantity) >= 1000 ? '1000+' : product.Product.quantity,
          totalOrderQty,
          product.productId,
        ];
        csvData += row.join(',');
        csvData += '\n';
      }
    });
    this.setState({
      inventoryCsvdata: csvData,
      inventoryListData: tabledata,
    });
    // downloadCSV(csvData, `${this.props.productType}ReceivedReturns`);
  };

  exportInventory = (data) => {
    const { seedCompanyId, productType, customers } = this.props;
    let csvData = '';
    let tabledata = [];
    const headers = [
      'Variety',
      'Trait',
      'Treatment',
      'Packaging',
      'Seedsize',
      'Customer Name',
      'Purchase Order No.',
      'Purchase Order Name.',
      'Quantity',
      'Deliveries',
      'ZoneId',
    ];
    csvData += headers.join(',');
    csvData += '\n';

    customers
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((customer) => {
        customer.PurchaseOrders.filter((po) => po.isQuote === false).forEach((purchaseOrder) => {
          purchaseOrder.CustomerMonsantoProducts.forEach((order) => {
            const { deliveryReceipts } = this.props;
            const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));
            const quatityID = deliveryReceiptDetails.filter(
              (data) => data.monsantoProductId === order.MonsantoProduct.id,
            );
            const deliveryQty = getDeliveryLotsQty(quatityID, deliveryReceipts);

            if (order.MonsantoProduct.seedCompanyId !== seedCompanyId) return;
            if (MONSANTO_SEED_TYPES[order.MonsantoProduct.classification] !== productType.toUpperCase()) return;

            tabledata.push({
              Variety: order.MonsantoProduct.blend,
              Trait: order.MonsantoProduct.brand,

              Treatment: order.MonsantoProduct.treatment,
              Packaging: order.MonsantoProduct.packaging,
              Seedsize: order.MonsantoProduct.seedSize,
              CustomerName: customer.name,
              PurchaseOrderNo: `PO#${purchaseOrder.id}`,
              PurchaseOrderName: purchaseOrder.name,
              Quantity: order.orderQty,
              ZoneId:
                order.MonsantoProduct.zoneId.length > 0
                  ? order.MonsantoProduct.zoneId[0]
                  : order.MonsantoProduct.zoneId.split('{')[1].split('}')[0],
            });
            let row = [
              order.MonsantoProduct.blend,
              order.MonsantoProduct.brand,
              order.MonsantoProduct.treatment,
              order.MonsantoProduct.packaging,
              order.MonsantoProduct.seedSize,
              `"${customer.name}"`,
              `PO#${purchaseOrder.id}`,
              purchaseOrder.name,
              order.orderQty,
              deliveryQty,
            ];
            csvData += row.join(',');
            csvData += '\n';
          });
        });
      });
    this.setState({
      inventoryCsvdata: csvData,
      inventoryListData: tabledata,
    });
    // downloadCSV(csvData, `${this.props.productType}PurchaseOrderReports`);
  };

  importProductDealers = async (e) => {
    const { seedCompanyId, name, organizationId, createProductDealer, updateMonsantoProduct, classes } = this.props;
    const error = [];
    const success = [];

    try {
      if (!e.target.value.endsWith('.csv')) return;
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async function (event) {
        const data = csvStringToArray(event.target.result);
        const organizationName = name;
        let dealers = [];
        let dealerTransfers = [];
        const headers = data[0];
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (!row.length || row.length !== headers.length) continue;

          const isMatch = organizationName === row[headers.indexOf('Sending Dealer Name')];
          let dealer = {
            address: `${row[headers.indexOf('SendingDealerStreet')]}-${row[headers.indexOf('SendingDealerCity')]}`,
            companyId: seedCompanyId,
            companyType: 'Monsanto Seed Company',
            email: null,
            name: row[headers.indexOf('SendingDealerName')],
            notes: null,
            phone: row[headers.indexOf('SendingDealerPhone')],
          };
          dealers.push(dealer);
          let dealerTransfer = {
            lotNumber: row[headers.indexOf('Lot Number')] !== '' ? row[headers.indexOf('Lot Number')] : null,
            // monsantoProductId: row[headers.indexOf('Product Id')],
            seedCompanyId: seedCompanyId,
            deliveryDate: new Date(),
            isAccepted: true,
            isReturn: null,
            netWeight: null,
            quantity: row[headers.indexOf('Product Quantity')],
            source: isMatch === true ? 'Transfer Out' : 'Transfer In',
            dealerName: row[headers.indexOf('Sending Dealer Name')],
            transferId: row[headers.indexOf('Transfer ID')],
            crossReferenceId: parseFloat(row[headers.indexOf('GTIN')] || 0),
            dealerAddress: `${row[headers.indexOf('Sending Dealer Street')]}-${
              row[headers.indexOf('Sending Dealer City')]
            }`,
            productDetail: row[headers.indexOf('Product Description')],
            Crop: row[headers.indexOf('Crop')],
          };
          dealerTransfers.push(dealerTransfer);
        }

        await dealerTransfers.map(async (dealerTransfer) => {
          await updateMonsantoProduct(dealerTransfer)
            .then((r) => {
              success.push(dealerTransfer);
              // console.log(r, 'rrrrrrr');
            })
            .catch((e) => {
              console.log(e, 'eeeeee');

              dealerTransfer.Crop !== 'PACKAGING' &&
                error.push({ error: `error- ${e}`, dealerTransfer: dealerTransfer });
            });
        });

        await [...new Map(dealers.map((item) => [item['name'], item])).values()].map(async (dealers) => {
          await createProductDealer(dealers)
            .then((r) => {
              // console.log(r, 'r');
            })
            .catch((e) => {
              error.push({ error: `error- ${e}`, dealer: dealers });
            });
        });
        console.log(dealerTransfers, 'dealerTransfer');
      };
      reader.readAsText(file);

      setTimeout(() => {
        console.log(error, 'error');

        const find = error.filter((e) => e.error.includes('422'));
        const isTransferIdNotExits = error.filter((e) => e.error.includes('404'));

        {
          console.log(find, 'isFind', isTransferIdNotExits, 'isFind', success, 'success');
        }
        (find.length > 0 || isTransferIdNotExits.length > 0 || success.length > 0) &&
          this.setState({
            dealerInfo: (
              <SweetAlert
                warning
                showCancel
                style={{ width: '700px', height: '500px', overflowY: 'scroll' }}
                // title="Not Found Product Info"
                onConfirm={() => {
                  this.setState({ dealerInfo: null });
                }}
                onCancel={() => this.setState({ dealerInfo: null })}
                confirmBtnCssClass={classes.button + ' ' + classes.success}
                cancelBtnCssClass={classes.button + ' ' + classes.danger}
              >
                <div className={classes.flexClass}>
                  <p>ProductDetail</p> <p>CrossReferenceId</p> <p>TransferId</p>
                </div>
                {find.length > 0 && <h4>This product not found's</h4>}

                {find.map((d) => {
                  return (
                    <div className={classes.flexClass}>
                      <p className={classes.infoList}>{d.dealerTransfer.productDetail}</p>
                      <p className={classes.infoList}>{d.dealerTransfer.crossReferenceId}</p>
                      <p className={classes.infoList}>{d.dealerTransfer.transferId}</p>
                    </div>
                  );
                })}
                {isTransferIdNotExits.length > 0 && <h4>TransferId not Match product's</h4>}
                {isTransferIdNotExits.map((d) => {
                  return (
                    <div className={classes.flexClass}>
                      <p className={classes.infoList}>{d.dealerTransfer.productDetail}</p>
                      <p className={classes.infoList}>{d.dealerTransfer.crossReferenceId}</p>
                      <p className={classes.infoList}>{d.dealerTransfer.transferId}</p>
                    </div>
                  );
                })}
                {success.length > 0 && <h4>Product Added Succesfully</h4>}

                {success.map((d) => {
                  return (
                    <div className={classes.flexClass}>
                      <p className={classes.infoList}>{d.productDetail}</p>
                      <p className={classes.infoList}>{d.crossReferenceId}</p>
                      <p className={classes.infoList}>{d.transferId}</p>
                    </div>
                  );
                })}
              </SweetAlert>
            ),
          });

        this.setShowSnackbar(
          'We could not import because there are some missing products. Please sync price sheet and try again or contact the system admin.. ',
        );
        this.handleHorizMenuClose();
      }, 5000);
    } catch (e) {
      console.log(e, 'e-------------------');
    }

    setTimeout(() => {
      if (error.length < 0) {
        window.location.reload();
      }
    }, 5000);
  };

  getTheUpdate = async (updateDate) => {
    const {
      seedCompany,
      syncSummaryData,
      syncProductBookingSummary,
      checkInInventoryProductAvailability,
      updateIsChange,
    } = this.props;
    const startDate = new Date(updateDate);

    const endDate = new Date();
    const seconds = Math.floor((endDate - startDate) / 1000);
    const minutes = Math.floor(seconds / 60);

    lastminutes = minutes;
    let isUpdate = false;

    console.log(minutes, 'minutes');

    if (minutes >= 30) {
      this.setState({
        isLastUpdateLoading: true,
        showSnackbar: true,
        showSnackbarText: 'Checking for updates in the background ... ',
      });
      await Promise.all([
        await updateIsChange(),
        await axios
          .get(
            `${process.env.REACT_APP_API_BASE}/monsanto/retailer_orders/syncSummaryData?seedCompanyId=${seedCompany.id}`,
            {
              headers: { 'x-access-token': localStorage.getItem('authToken') },
            },
          )
          .then((response) => {
            this.setState({ isLastUpdateLoading: false });

            if (response.data.update == true && response.data.status === true) {
              isUpdate = true;
            } else {
              isUpdate = false;
            }
          })
          .catch((e) => {
            this.setState({ isPageSyncing: false });
          }),
        await axios
          .get(
            `${process.env.REACT_APP_API_BASE}/monsanto/sync/syncProductBookingSummary?seedCompanyId=${seedCompany.id}`,
            {
              headers: { 'x-access-token': localStorage.getItem('authToken') },
            },
          )
          .then((response) => {
            this.setState({ isLastUpdateLoading: false });

            if (response.data.update == true && response.data.status === true) {
              isUpdate = true;
            } else {
              isUpdate = false;
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
            window.location.reload();
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
  setShowSnackbar = (msg) => {
    this.setState({ showSnackbar: true, showSnackbarText: msg });
  };

  render() {
    this.productsFileInput = React.createRef();
    const {
      showSnackbar,
      showSnackbarText,
      columns,
      horizMenuOpen,
      showAddFavoriteProductsDialog,
      showFavoriteProducts,
      showRetailerProducts,
      favoriteProducts,
      showFavoriteProductsAll,
      tableItemActionAnchorEl,
      tableItemActionMenuOpen,
      activeTableItem,
      selectedProduct,
      selectedProductRelatedPurchaseOrders,
      productRelatedInfoDialogOpen,
      fetchUnitsDialogOpen,
      productRelatedInfoDialogContext,
      lotsDialogOpen,
      lotsItem,
      historyDialogOpen,
      returnDialogOpen,
      serchText,
      groupData,
      packagingData,
      isLoadingData,
      retailOrderSummaryLasySyncDate,
      dealerInfo,
    } = this.state;
    const {
      synced,
      classes,
      // deleteText,
      // deleteAction,
      // editAction,
      // editText,
      // products,
      productType,
      savePageAsPdf,
      theme,
      selectedZoneId,
      zoneIds,
      updateSelectedZone,
      toggleColumns,
      seedCompany,
      syncSummaryData,
      syncProductBookingSummary,
      currentZone,
      fetched,
      deliveryReceipts,
      checkInInventoryProductAvailability,
      updateIsChange,
      monsantoRetailerOrderSummaryProducts,
      monsantoRetailerOrderSummaryStatus,
      seedCompanyId,
    } = this.props;
    let data = [];

    if (productType === 'packaging') {
      data = packagingData;
    } else {
      if (showFavoriteProducts) {
        if (showFavoriteProductsAll) {
          data = data.concat(favoriteProducts);
        } else {
          let favorite = [];
          const group = groupBy(favoriteProducts, (favoriteProduct) => {
            return (
              favoriteProduct.Product.brand +
              ' ' +
              favoriteProduct.Product.blend +
              ' ' +
              favoriteProduct.Product.treatment
            );
          });
          Object.keys(group).forEach((description) => {
            favorite.push(group[description][0]);
          });
          data = data.concat(favorite);
        }
      }
    }

    const helper = {};
    const monsantoRetailerOrderSummaryProductsFilter = [];
    const zoneCodesNameArray = process.env.REACT_APP_ZONES.split(';').filter(
      (c) => JSON.parse(c).CROP === productType.toUpperCase(),
    );
    this.props.monsantoRetailerOrderSummaryProducts.reduce(function (r, o) {
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
    if (showRetailerProducts && productType !== 'packaging') {
      data = data.concat(monsantoRetailerOrderSummaryProductsFilter);
    }

    //const groupData = groupBy(data)
    const availableProducts = !seedCompany.Products
      ? []
      : seedCompany.Products.filter(
          (product) => (product.classification = seedTypeClassificationMap[productType.toUpperCase()]),
        );

    // if(data.length > 0) {
    //   data.map(item => {
    //     const DealerPrice = JSON.parse(
    //       item.Product.LineItem.suggestedDealerPrice
    //     )[currentZone];
    //     const EndUserPrice = JSON.parse(
    //       item.Product.LineItem.suggestedEndUserPrice
    //     )[currentZone];
    //     item.Product.LineItem.suggestedDealerPrice = DealerPrice;
    //     item.Product.LineItem.suggestedEndUserPrice = EndUserPrice;
    //     data = [...data ]
    //     console.log(item, "item");
    //     return item;
    //   });
    // }

    data = sortBy(data, (product) =>
      product && product.Product.productDetail
        ? product.Product.productDetail
        : this.state.showFavoriteProductsAll
        ? `${product.Product.blend} ${product.Product.seedSize} ${product.Product.brand} ${product.Product.packaging} ${product.Product.treatment}`
        : `${product.Product.blend} ${product.Product.brand} ${product.Product.treatment}`,
    ).filter((p) => {
      return (
        (p.Product.brand && p.Product.brand.toLowerCase().includes(serchText)) ||
        (p.Product.blend && p.Product.blend.toLowerCase().includes(serchText)) ||
        (p.Product.productDetail && p.Product.productDetail.toLowerCase().includes(serchText))
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

    // columns.map((cc) => {
    //   // c.columns
    //   c
    //     ? c.map((cc) => {
    //         return filterToggleColumns.push(cc);
    //       })
    //     : filterToggleColumns.push(c);
    // });

    const { tableData } = this.getTableData(
      data.sort((x, y) => (x.isChanged === y.isChanged ? 0 : x.isChanged ? -1 : 1)),
    );

    let filterdata = [];
    const group = groupBy(tableData, (o) => {
      return o.trait + '-' + o.treatment + '-' + o.variety;
      //   '-' +
      //   o.Product.productDetail
    });

    Object.keys(group).forEach((description) => {
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
        totalMsrp = 0,
        totaldealerPrice = 0;
      group[description].map((c) => {
        totalrm += c.rm;
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

      filterdata.push({
        action: group[description][0].action,
        // packaging: '-',
        productDetail: group[description][0].productDetail,
        productId: '-',

        // seedsize: '-',

        supply: group[description][0].supply,
        trait: group[description][0].trait,
        treatment: group[description][0].treatment,
        variety: group[description][0].variety,
        dealerPrice: '-',
        rm: totalrm,
        msrp: '-',
        availableQuantity: totalavailableQuantity.toLocaleString('en-US'),
        bayerDealerBucketQty: totalbayerDealerBucketQty.toLocaleString('en-US'),
        shippedQuantityValue: totalshippedQuantityValue.toLocaleString('en-US'),
        deliveredToGrower: totaldeliveredToGrower.toLocaleString('en-US'),
        allGrowerQty: totalallGrowerQty.toLocaleString('en-US'),
        demand: totaldemand.toLocaleString('en-US'),
        supply: totalsupply.toLocaleString('en-US'),
        longShort: totallongShort.toLocaleString('en-US'),
        longShortwithoutDealerBucket: totallongShortwithoutDealerBucket.toLocaleString('en-US'),
        bayerAvailability: totalbayerAvailability.toLocaleString('en-US'),
        allGrowersUnsynced: totalallGrowersUnsynced.toLocaleString('en-US'),
      });
    });

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

    (groupData === true ? filterdata : tableData).map((c) => {
      totalrm += c.rm === '-' ? 0 : c.rm;
      totalavailableQuantity += parseFloat(c.availableQuantity || 0);
      totalbayerDealerBucketQty += parseFloat(c.bayerDealerBucketQty || 0);
      totalshippedQuantityValue += parseFloat(c.shippedQuantityValue || 0);
      totaldeliveredToGrower += parseFloat(c.deliveredToGrower || 0);
      totalallGrowerQty += parseFloat(c.allGrowerQty || 0);
      totaldemand += parseFloat(c.demand || 0);
      totalsupply += parseFloat(c.supply || 0);
      totallongShort += parseFloat(c.longShort || 0);
      totallongShortwithoutDealerBucket += parseFloat(c.longShortwithoutDealerBucket || 0);
      totalallGrowersUnsynced += parseFloat(c.allGrowersUnsynced || 0);
      totalMsrp += parseFloat(c.msrp || 0);
      totalbayerAvailability += parseFloat(c.bayerAvailability || 0);
      totaldealerPrice += parseFloat(c.dealerPrice || 0);
    });

    totalDataRow = {
      rm: '-',
      msrp: '-',
      availableQuantity: totalavailableQuantity.toLocaleString('en-US'),
      bayerDealerBucketQty: totalbayerDealerBucketQty.toLocaleString('en-US'),
      shippedQuantityValue: totalshippedQuantityValue.toLocaleString('en-US'),
      deliveredToGrower: totaldeliveredToGrower.toLocaleString('en-US'),
      allGrowerQty: totalallGrowerQty.toLocaleString('en-US'),
      demand: totaldemand.toLocaleString('en-US'),
      supply: totalsupply.toLocaleString('en-US'),
      longShort: totallongShort.toLocaleString('en-US'),
      longShortwithoutDealerBucket: totallongShortwithoutDealerBucket.toLocaleString('en-US'),
      bayerAvailability: '-',
      allGrowersUnsynced: totalallGrowersUnsynced.toLocaleString('en-US'),
      dealerPrice: totaldealerPrice.toFixed(2).toLocaleString('en-US'),
    };

    const isDublicate = this.isApiSeedCompanyProductsDublicate ? true : false;
    const finalTableData = (groupData === true ? filterdata : tableData).filter(
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

    return (
      // selectedZoneId !== undefined && (
      <GridContainer className={classes.productTableContainer}>
        <GridItem xs={12}>
          <div className={`${classes.actionBar} hide-print`}>
            <FormControl style={{ marginRight: '7px', width: '80%' }}>
              <TextField
                className={`${classes.searchField} hide-print`}
                margin="normal"
                placeholder="Search Variety/Trait"
                value={serchText}
                onChange={this.handleSearchTextChange}
                id="searchBar"
              />
            </FormControl>
            {/* <FormControl fullWidth={true}>
                <InputLabel htmlFor="season-selector">Zone</InputLabel>
                <Select
                  className={classes.seasonSelector}
                  value={selectedZoneId}
                  onChange={(e) => {
                    this.setState({ currentZone: e.target.value });
                    updateSelectedZone(e);
                  }}
                  inputProps={{
                    id: 'zone-selector',
                  }}
                >
                  {zoneIds.map((zoneId) => (
                    <MenuItem key={`zone-${zoneId}`} value={zoneId}>
                      {zoneCodesNameArray.length < 1
                        ? 'Zone ' + zoneId
                        : zoneCodesNameArray.filter((c) => JSON.parse(c).ZONEID === zoneId).length > 0
                        ? JSON.parse(zoneCodesNameArray.filter((c) => JSON.parse(c).ZONEID == zoneId)).ZONENAME
                        : 'Zone ' + zoneId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> */}
            <Button
              buttonRef={(node) => {
                this.anchorEl = node;
              }}
              aria-owns={horizMenuOpen ? 'menu-list-grow' : undefined}
              aria-haspopup="true"
              id="dotBtns"
              onClick={this.handleHorizMenuToggle}
              style={{
                background: horizMenuOpen ? theme.palette.primary.main : 'inherit',
              }}
              justIcon
              className={classes.horizTableMenu}
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
                  {/* {editAction && (
                    <MenuItem className={classes.horizTableMenuItem} onClick={editAction}>
                      {editText}
                    </MenuItem>
                  )} */}
                  <MenuItem
                    id="syncInventory"
                    className={classes.horizTableMenuItem}
                    onClick={async () => {
                      await Promise.all([
                        await updateIsChange(),
                        await syncSummaryData(seedCompany.id),
                        await syncProductBookingSummary(seedCompany.id),
                        // await this.props.checkShortProductProductAvailability(),
                        await checkInInventoryProductAvailability(),
                      ]).then((values) => {
                        console.log('Sync Successfully');
                      });
                    }}
                    style={{ borderBottom: '1px dashed #000000' }}
                  >
                    Sync Inventory Data
                  </MenuItem>

                  {/* <MenuItem
                    className={classes.horizTableMenuItem}
                    onClick={deleteAction}
                    style={{ borderBottom: "1px dashed #000000" }}
                  >
                    {deleteText}
                  </MenuItem> */}
                  {/* <MenuItem className={classes.horizTableMenuItem} onClick={this.print}>
                    Print
                  </MenuItem>
                  <MenuItem
                    className={classes.horizTableMenuItem}
                    onClick={savePageAsPdf}
                    style={{ borderBottom: '1px dashed #000000' }}
                  >
                    Save as PDF
                  </MenuItem> */}
                  {/* <MenuItem
                      className={classes.horizTableMenuItem}
                      // style={{ borderBottom: '1px dashed #000000' }}
                      onClick={async () => {
                        await this.exportCsv(data);
                        this.props.history.push({
                          pathname: `/app/csv_preview/${this.props.productType}Inventory`,
                          state: { csvdata: this.state.inventoryCsvdata, seedList: this.state.inventoryListData },
                        });
                      }}
                      id="downloadInventory"
                    >
                      Download Inventory
                    </MenuItem> */}

                  {/*   <MenuItem
                    className={classes.horizTableMenuItem}
                    onClick={async () => {
                      await this.exportInventory(data);
                      this.props.history.push({
                        pathname: `/app/csv_preview/${this.props.productType}PurchaseOrder`,
                        state: { csvdata: this.state.inventoryCsvdata, seedList: this.state.inventoryListData },
                      });
                    }}
                    id="downloadPO"
                  >
                    Download Purchase Order Report
                  </MenuItem>
                
                
                   <MenuItem
                    className={classes.horizTableMenuItem}
                    onClick={async () => {
                      await this.exportReceivedReturns(data);
                      this.props.history.push({
                        pathname: `/app/csv_preview/${this.props.productType}ReceivedReturns`,
                        state: { csvdata: this.state.inventoryCsvdata, seedList: this.state.inventoryListData },
                      });
                    }}
                    id="downloadAllDealer"
                  >
                    Download All Dealer Received & Returns
                  </MenuItem>
                
                */}

                  <MenuItem
                    id="importDealerTransfer"
                    className={classes.horizTableMenuItem}
                    style={{ borderBottom: '1px dashed #000000' }}
                    onClick={() => {
                      this.productsFileInput.current.click();
                    }}
                  >
                    <input
                      name="upload"
                      type="file"
                      onChange={this.importProductDealers}
                      ref={this.productsFileInput}
                      style={{ display: 'none' }}
                    />
                    Import Dealer Transfer
                  </MenuItem>
                  <MenuItem
                    className={classes.horizTableMenuItem}
                    style={{ borderBottom: '1px dashed #000000' }}
                    onClick={() => this.exportTemplateCsv()}
                  >
                    Download DealerTransfer Template CSV File
                  </MenuItem>
                  {/* <MenuItem
                      className={classes.horizTableMenuItem}
                      onClick={() => this.props.history.push(`/app/bayer_orders_preview/${seedCompanyId}`)}
                    >
                      Download Seed Warehouse Report[PDF]
                    </MenuItem> */}
                  {/* <MenuItem
                      id="seedWareHouseReport"
                      className={classes.horizTableMenuItem}
                      onClick={async () => {
                        await this.exportSeedWarehouseReport(seedCompanyId);
                        this.props.history.push({
                          pathname: `/app/csv_preview/SeedWareHouseReport`,
                          state: { csvdata: this.state.seedCsvData || [], seedList: this.state.seedListData || [] },
                        });
                      }}
                    >
                      Download Seed Warehouse Report
                    </MenuItem> */}
                  {/* <MenuItem>
                    <FormControl style={{ marginLeft: 20 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showFavoriteProducts}
                            value={showFavoriteProducts.toString()}
                            onChange={this.handleShowFavoriteProducts}
                          />
                        }
                        label="Show Favorite Products"
                      />
                    </FormControl>
                  </MenuItem>
                  <MenuItem>
                    <FormControl style={{ marginLeft: 20 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showFavoriteProductsAll}
                            value={showFavoriteProductsAll.toString()}
                            onChange={this.handleShowAllFavoriteProducts}
                          />
                        }
                        label="Show All Favorite Products"
                      />
                    </FormControl>
                  </MenuItem> */}
                  {/* <MenuItem>
                    <FormControl style={{ marginLeft: 20 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={showRetailerProducts}
                            value={showRetailerProducts.toString()}
                            onChange={this.handleShowRetailerProducts}
                          />
                        }
                        label="Show Retail Order Products"
                      />
                    </FormControl>
                  </MenuItem> */}
                </MenuList>
              </Paper>
            </Popover>

            {toggleColumns && (
              <ColumnMenu
                onColumnUpdate={this.toggleColumnMenu}
                columns={filterToggleColumns.filter((col) => col)}
                productType="foo" // TODO: remove this property, not needed at all
                className={classes.columnMenu}
              />
            )}
            {/* <Button
              className="hide-print"
              color="primary"
              onClick={this.handleAddFavoriteProductsDialogOpen}
            >
              Add product
            </Button> */}
          </div>
          <div style={{ display: 'flex', alignItemss: 'center', justifyContent: 'space-between' }}>
            <div id="dealer_detail_card">
              Product Booking Summary and Retailer Order Summary last updated:{' '}
              {data.length !== 0 || data.length > 0
                ? moment(data[0].retailOrderSummaryLasySyncDate).format('MMMM Do YYYY, h:mm a')
                : ''}
              <a
                onClick={() => {
                  this.setState({ historyDialogOpen: true });
                }}
              >
                {' '}
                History
              </a>
            </div>
            <div>
              <FormControl>
                <FormControlLabel
                  control={
                    <Checkbox color="primary" checked={groupData} value={groupData} onChange={this.groupDataChange} />
                  }
                  label="Group Grade Sizes + Packaging"
                />
              </FormControl>
            </div>
          </div>

          {finalTableData.length !== 0 || finalTableData.length > 0 ? (
            <div id="Dealer_details">
              <ReactTable
                // data={data.sort((a, b) => a.Product.blend.localeCompare(b.Product.blend))}
                data={finalTableData}
                columns={groupData === true ? groupColumns : columns}
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
                // getTrProps={(state, rowInfo) => {
                //   let style = {};
                //   if (rowInfo ? rowInfo.original.isChanged : false) {
                //     style = {
                //       background: '#F7F7A2',
                //     };
                //   }
                //   return { style };
                // }}
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
                      id="dealerTransfer"
                      className={classes.addNewMenuItem}
                      onClick={() => {
                        this.handleLotsDialogOpen(activeTableItem);
                        this.handleTableItemActionMenuClose();
                      }}
                    >
                      Dealer To Dealer Transfers
                    </MenuItem>
                    <MenuItem
                      id="dealerReceived"
                      className={classes.addNewMenuItem}
                      onClick={() => {
                        this.handleReturnDialogOpen(activeTableItem);
                        this.handleTableItemActionMenuClose();
                      }}
                    >
                      Dealer Received & Returns
                    </MenuItem>

                    {activeTableItem && activeTableItem.action.Product.hasOwnProperty('classification') && (
                      <MenuItem
                        id="SwapProduct"
                        className={classes.addNewMenuItem}
                        onClick={() => {
                          this.props.history.push(
                            isDublicate
                              ? `/app/swapProduct/${seedCompanyId}/${activeTableItem.action.Product.id}/${activeTableItem.action.Product.crossReferenceId}`
                              : `/app/swapProduct/${seedCompanyId}/${activeTableItem.action.Product.id}/000`,
                          );
                        }}
                      >
                        Swap Product
                      </MenuItem>
                    )}
                    {/* <MenuItem
                      id="fetchQty"
                      className={classes.addNewMenuItem}
                      onClick={() => {
                        this.handleFetchUnitsDialogOpen(activeTableItem);
                        this.handleTableItemActionMenuClose();
                      }}
                    >
                      Fetch Additional or Return Supply
                    </MenuItem> */}
                  </MenuList>
                </Paper>
              </Popover>
            </div>
          ) : (
            <center>
              <h3 style={{ marginTop: '10px', marginBottom: '10px' }}>
                {fetched
                  ? isLoadingData && data.length == 0
                    ? `Loading products ...`
                    : 'There are no products currently in your dealer or grower order. Please come back after you have added some to your order.'
                  : `Please Refresh after a few seconds if products don't show up. Loading products in the
                background`}
              </h3>
            </center>
          )}
        </GridItem>
        {dealerInfo}
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showSnackbar}
          message={<span>{showSnackbarText}</span>}
          autoHideDuration={20000}
          onClose={() => this.setState({ showSnackbar: false })}
          onClick={() => this.setState({ showSnackbar: false })}
        />
        {showAddFavoriteProductsDialog && (
          <AddFavoriteProductsDialog
            open={showAddFavoriteProductsDialog}
            onClose={this.handleAddFavoriteProductsDialogClose}
            products={availableProducts}
            seedCompany={seedCompany}
            seedType={productType.toUpperCase()}
            reload={this.reload}
          />
        )}

        {productRelatedInfoDialogOpen && (
          <ProductRelatedInfoDialog
            context={productRelatedInfoDialogContext}
            open={productRelatedInfoDialogOpen}
            onClose={this.handleProductRelatedInfoDialogClose}
            productRelatedPurchaseOrders={selectedProductRelatedPurchaseOrders}
            product={selectedProduct.action.Product}
            deliveryReceipts={deliveryReceipts}
            companyType={'Seed Company'}
            selectedZoneId={selectedZoneId}
            zoneIds={zoneIds}
            seedCompanyId={seedCompanyId}
            isDublicate={isDublicate}
          />
        )}

        {fetchUnitsDialogOpen && (
          <FetchUnitsDialog
            context={productRelatedInfoDialogContext}
            open={fetchUnitsDialogOpen}
            onClose={this.handleFetchUnitsDialogClose}
            productRelatedPurchaseOrders={selectedProductRelatedPurchaseOrders}
            product={selectedProduct.action.Product}
            deliveryReceipts={deliveryReceipts}
            companyType={'Seed Company'}
            selectedZoneId={selectedZoneId}
            zoneIds={zoneIds}
            seedCompanyId={seedCompanyId}
            isDublicate={isDublicate}
            tableData={tableData}
          />
        )}
        {lotsDialogOpen && (
          <LotsDialog
            open={lotsDialogOpen}
            onClose={this.handleLotsDialogClose}
            productType={productType}
            productId={lotsItem.productId}
            deliveryReceipts={deliveryReceipts}
            companyType={'Monsanto Seed Company'}
            companyId={seedCompany ? seedCompany.id : ''}
            isMonsantoProduct={true}
          />
        )}
        {returnDialogOpen && (
          <ReturnDialog
            open={returnDialogOpen}
            onClose={this.handleReturnDialogClose}
            productType={productType}
            productId={lotsItem.productId}
            deliveryReceipts={deliveryReceipts}
            companyType={'Monsanto Seed Company'}
            companyId={seedCompany ? seedCompany.id : ''}
            isMonsantoProduct={true}
          />
        )}
        {historyDialogOpen && (
          <SummarySyncHistoryDialog
            open={historyDialogOpen}
            onClose={this.handleHistoryDialogClose}
            data={data}
            retailOrderSummaryLasySyncDate={
              data.length !== 0 || data.length > 0
                ? moment.utc(data[0].retailOrderSummaryLasySyncDate).format('MMMM Do YYYY, h:mm a')
                : ''
            }
          />
        )}
      </GridContainer>
      // )
    );
  }
}

const mapStateToProps = (state) => {
  return {
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    productDealers: state.productDealerReducer.productDealers,
    customers: state.customerReducer.customers,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    monsantoRetailerOrderSummaryProducts: state.monsantoRetailerOrderSummaryReducer.products,
    monsantoRetailerOrderSummaryStatus: state.monsantoRetailerOrderSummaryReducer.loadingStatus,
    name: state.organizationReducer.name,
    totalItemsOfCustomers: state.customerReducer.totalItems,
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
      updateMonsantoProduct,
      createProductDealer,
    },
    dispatch,
  );

export default withStyles(styles, { withTheme: true })(
  connect(mapStateToProps, mapDispatchToProps)(ApiDetailProductTable),
);
