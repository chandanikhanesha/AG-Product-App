import React, { Component } from 'react';
import ReactDOM from 'react-dom';

import withStyles from '@material-ui/core/styles/withStyles';
// import { flatten } from "lodash/array";
// material-ui icons
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import StarIcon from '@material-ui/icons/Star';
import StarBorderIcon from '@material-ui/icons/StarBorder';
// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import ReactTable from 'react-table';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import { DialogContent } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';

import moment from 'moment';
import './pt.css';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
// custom component
import ColumnMenu from './column_menu';
// import {
//   getQtyOrdered,
//   getQtyShipped,
//   getGrowerOrder,
//   getGrowerOrderDelivered
// } from "utilities/product";

import { downloadCSV } from '../../utilities/csv';

import styles from './productTableStyles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import axios from 'axios';
import AddFavoriteProductsDialog from './add_monsanto_favorite_product_dialog';
import { Checkbox, FormControlLabel } from '@material-ui/core';
let isUpdateCall = '';
let lastUpdateDate = null;

class ApiPricesheetProductTable extends Component {
  state = {
    columns: [],
    deliveryReceiptDetails: [],
    horizMenuOpen: false,
    showAddFavoriteProductsDialog: false,
    favoriteProducts: [],
    showFavoriteProducts: [],
    showRetailerProducts: true,
    showFavoriteProductsAll: false,
    data: [],
    originProducts: [],
    products: [],
    inventoryCsvdata: '',
    inventoryListData: [],
    showSnackbar: false,
    showSnackbarText: '',
    priceSheetLastSyncDate: null,
    tableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,

    activeTableItem: null,
    dialogOpen: false,
  };

  seedTypeClassificationMap = { CORN: 'C', SOYBEAN: 'B', SORGHUM: 'S' };

  handleHorizMenuToggle = async () => {
    const index = this.props.tabIndex;

    this.props.listPricesheetProducts().then((res) => {
      this.props.filterPriceSheetData();
    });
    this.setState((state) => ({ horizMenuOpen: !state.horizMenuOpen }));
  };

  handleHorizMenuClose = (event) => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }
    this.setState({ horizMenuOpen: false });
  };

  componentDidUpdate(prevProps, prevState) {
    const { products, runPriceSheetScript } = this.props;

    const priceSheetPageMin = localStorage.getItem('priceSheetRefreshTime');

    if (
      runPriceSheetScript &&
      products.length > 0 &&
      lastUpdateDate == null &&
      (isUpdateCall == '' || priceSheetPageMin >= 30)
    ) {
      if (priceSheetPageMin == null) {
        lastUpdateDate = products[0].updatedAt;
      } else {
        lastUpdateDate = priceSheetPageMin;
      }

      this.getTheUpdate(lastUpdateDate);
    }
  }
  updateSeedCompanyProductIsFavorite = async (currentProduct) => {
    const { updatePricesheetProduct } = this.props;
    // const { originProducts, products } = this.state;
    const { isFavorite } = currentProduct;
    let newProducts = this.props.products;
    await updatePricesheetProduct(currentProduct);

    newProducts
      .filter((product) => product.id === currentProduct.id)
      .forEach((product) => {
        product.favs = String(currentProduct.isFavorite);
      });

    this.setState({
      products: newProducts,
    });
  };

  componentDidMount() {
    this.renderTable();
    this.setState({ showFavoriteProducts: this.props.lastSelectedFavOption });
  }

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
  renderTable() {
    const {
      //deliveryReceipts,
      seedCompany,
      productType,
      customerMonsantoProduct,
      selectedColumnIds,
    } = this.props;

    const metadata = JSON.parse(seedCompany.metadata);
    let columns = [];

    const addField = (field, content) => {
      if (!metadata && !metadata[productType][field]) return;
      columns.push({
        show: selectedColumnIds.length == 0 ? true : selectedColumnIds.includes(content.id) ? true : false,
        ...content,
      });
    };

    columns.push({
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

        const isfav = item.favs ? item.favs.includes('true') : item.isFavorite;
        return isfav ? (
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
    });

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
        const item = props.value.id;

        return (
          <React.Fragment>
            <div>
              <IconButton
                aria-label="show Menu"
                onClick={this.handleTableItemActionMenuOpen(props.value)}
                style={{ color: 'rgb(56, 161, 84)' }}
                id={`productId-${item}`}
                name="dealerAction"
              >
                <MoreHoriz fontSize="small" />
              </IconButton>
            </div>
          </React.Fragment>
        );
      },
    });

    columns.push({
      Header: 'Trait',
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'brand',
      accessor: (product) => product.brand,
      sortable: true,

      sortMethod: (a, b) => {
        return a.localeCompare(b);
      },
    });

    // addField('brand', {
    //   Header: 'Trait',
    //   headerStyle: {
    //     fontWeight: 'bold',
    //     fontSize: '14px',
    //     color: '#000000',
    //   },
    //   id: 'brand',
    //   accessor: (product) => product.brand,
    // });
    addField('blend', {
      Header: 'Variety',
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'blend',
      accessor: (product) => product.blend,
      sortable: true,

      sortMethod: (a, b) => {
        return a.localeCompare(b);
      },
    });
    // addField("classification", {
    //   Header: "Classification",
    //   id: "classification",
    //   accessor: product => product.classification
    // });
    addField('treatment', {
      Header: 'Treatment',
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'treatment',
      accessor: (product) => product.treatment,
      sortable: true,

      sortMethod: (a, b) => {
        return a.localeCompare(b);
      },
    });
    addField('rm', {
      Header: 'RM',
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'rm',
      sortable: true,

      sortMethod: (a, b) => {
        return parseFloat(a) - parseFloat(b);
      },
      accessor: (product) => {
        let match = product.blend && product.blend.match(/DKC[0-9]*-/);
        if (match) {
          let i = match[0].replace('DKC', '').replace('-', '');
          return parseInt(i, 0) + 50;
        }
        return '-';
      },
    });
    addField('msrp', {
      Header: 'Grower MSRP',
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'msrp',
      sortable: true,

      sortMethod: (a, b) => {
        return parseFloat(a) - parseFloat(b);
      },
      accessor: (Product) => {
        const { suggestedEndUserPrice } = Product.LineItem || {};
        const { zoneIds, selectedZoneId } = this.props;
        let EndUserPrice = '';
        if (
          suggestedEndUserPrice !== undefined &&
          JSON.parse(suggestedEndUserPrice) &&
          JSON.parse(suggestedEndUserPrice)['NZI']
        ) {
          EndUserPrice = JSON.parse(suggestedEndUserPrice)['NZI'];
        } else if (suggestedEndUserPrice !== undefined) {
          EndUserPrice = JSON.parse(suggestedEndUserPrice)[selectedZoneId || zoneIds[0]];
        } else {
          EndUserPrice = 0;
        }
        return <div style={{ textAlign: 'center' }}>{EndUserPrice}</div>;
      },
    });
    addField('msrp', {
      Header: 'Dealer MSRP',
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'delaermsrp',
      sortable: true,

      sortMethod: (a, b) => {
        return parseFloat(a) - parseFloat(b);
      },
      accessor: (Product) => {
        const { suggestedDealerPrice } = Product.LineItem || {};
        const { zoneIds, selectedZoneId } = this.props;

        let DealerPrice = '';
        if (
          suggestedDealerPrice !== undefined &&
          JSON.parse(suggestedDealerPrice) &&
          JSON.parse(suggestedDealerPrice)['NZI']
        ) {
          DealerPrice = JSON.parse(suggestedDealerPrice)['NZI'];
        } else if (suggestedDealerPrice !== undefined) {
          DealerPrice = JSON.parse(suggestedDealerPrice)[selectedZoneId || zoneIds[0]];
        } else {
          DealerPrice = 0;
        }
        return <div style={{ textAlign: 'center' }}>{DealerPrice}</div>;
      },
    });
    // addField("qtyWarehouse", {
    //   Header: (
    //     <span>
    //       Qty at
    //       <br className="show-print" />
    //       Warehouse/On-hand
    //     </span>
    //   ),
    //   headerStyle: styles.columnHeaderOverride,
    //   id: "quantity",
    //   accessor: product =>product.quantity != null ? parseInt(product.quantity, 10) : "-"
    // });

    const localColumns = JSON.parse(window.localStorage.getItem('INVENTORY_SHOW_COLUMNS'));

    if (localColumns)
      columns = columns.map((column, index) => {
        return { ...column };
      });

    this.setState({ columns });
  }

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
      lastSelectedColumnPricesheetOption: selectedColumnIds.filter((c) => c !== undefined),
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
    this.props.updateApiSeedCompany({ id: this.props.seedCompany.id, lastSelectedFavOption: event.target.checked });
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

  exportCsv = (data) => {
    let csvData = '';
    const headers = ['Description', 'Trait', 'Variety', 'Treatment', 'RM', 'MSRP'];
    let tabledata = [];
    csvData += headers.join(',');
    csvData += '\n';
    data.forEach((product) => {
      let rm;
      let match = product.blend && product.blend.match(/DKC[0-9]*-/);
      if (match) {
        let i = match[0].replace('DKC', '').replace('-', '');
        rm = parseInt(i, 0) + 50;
      } else {
        rm = '-';
      }
      tabledata.push({
        Description: product.productDetail,
        Trait: product.brand,
        Variety: product.blend,
        Treatment: product.treatment,

        RM: rm,
        MSRP: '-',
      });

      const row = [product.productDetail, product.brand, product.blend, product.treatment, rm, '-'];
      csvData += row.join(',');
      csvData += '\n';
    });
    // downloadCSV(csvData, 'inventory');
    this.setState({
      inventoryCsvdata: csvData,
      inventoryListData: tabledata,
    });
  };

  getTheUpdate = async (updateDate) => {
    const startDate = new Date(updateDate);

    const endDate = new Date();
    const seconds = Math.floor((endDate - startDate) / 1000);
    const minutes = Math.floor(seconds / 60);
    console.log(minutes, 'minutes');
    isUpdateCall = 'Done';

    if (minutes >= 30) {
      this.forceUpdate();

      this.setShowSnackbar('Checking for updates in the background ... ');

      await Promise.all([
        axios
          .get(
            `${process.env.REACT_APP_API_BASE}/monsanto/pricesheet/syncLatestPricesheets?seedCompanyId=${this.props.seedCompany.id}`,
            {
              headers: { 'x-access-token': localStorage.getItem('authToken') },
            },
          )
          .then(async (response) => {
            console.log(response.data.lastUpdateDate, 'response');
            localStorage.setItem('priceSheetRefreshTime', response.data.lastUpdateDate);
            lastUpdateDate = response.data.lastUpdateDate;
            if (response.data.hasOwnProperty('lastUpdateDate') && response.data.status === true) {
              this.setShowSnackbar('Hey, I will be auto refreshing the page in a few seconds  since theres an update.');

              setTimeout(() => {
                window.location.reload();
              }, 5000);
            } else {
              this.setShowSnackbar('Page is up to date! and no refresh happens.');
            }
          })
          .catch((e) => {
            this.setShowSnackbar(`Getting the error while sync priceSheet ${e}`);
          }),
      ]);
    }
  };
  setShowSnackbar = (msg) => {
    this.setState({ showSnackbar: true, showSnackbarText: msg });
  };

  render() {
    const {
      columns,
      horizMenuOpen,
      showAddFavoriteProductsDialog,
      showFavoriteProducts,
      showRetailerProducts,
      favoriteProducts,
      showFavoriteProductsAll,
      isSearchRenderList,
      searchString,
      minnum,
      maxnum,
      showSnackbar,
      showSnackbarText,
      tableItemActionAnchorEl,
      tableItemActionMenuOpen,
      activeTableItem,
      hellllo,
    } = this.state;
    const {
      synced,
      classes,
      deleteText,
      deleteAction,
      editAction,
      editText,
      products,
      productType,
      savePageAsPdf,
      theme,
      selectedZoneId,
      zoneIds,
      updateSelectedZone,
      toggleColumns,
      seedCompany,
      syncSummaryData,
      currentZone,
      fetched,
      syncPricesheets,
      priceSheetAllData,
    } = this.props;

    let data = [];
    // const showSnackbarText = localStorage.getItem('showSnackbarText');
    // if (showFavoriteProducts) {
    //   if (showFavoriteProductsAll) {
    //     data = data.concat(favoriteProducts);
    //   } else {
    //     let favorite = [];
    //     const group = groupBy(favoriteProducts, (favoriteProduct) => {
    //       return favoriteProduct.brand + ' ' + favoriteProduct.blend + ' ' + favoriteProduct.treatment;
    //     });
    //     Object.keys(group).forEach((description) => {
    //       favorite.push(group[description][0]);
    //     });
    //     data = data.concat(favorite);
    //   }
    // }

    if (showRetailerProducts) data = data.concat(products);
    if (showFavoriteProducts) {
      data = data.filter((product) => product.isFavorite == true);
    }

    if (isSearchRenderList) {
      data = data.filter(
        (product) =>
          product.blend.includes(searchString) || (product.brand && product.brand.toLowerCase().includes(searchString)),
      );
    }

    if (minnum != undefined && maxnum != undefined && minnum != '' && maxnum != '') {
      data = data.filter(
        (product) =>
          product.blend &&
          product.blend.match(/DKC[0-9]*-/) &&
          parseInt(
            product.blend &&
              product.blend
                .match(/DKC[0-9]*-/)[0]
                .replace('DKC', '')
                .replace('-', ''),
            0,
          ) +
            50 >=
            minnum &&
          parseInt(
            product.blend &&
              product.blend
                .match(/DKC[0-9]*-/)[0]
                .replace('DKC', '')
                .replace('-', ''),
            0,
          ) +
            50 <=
            maxnum,
      );
    }
    if (minnum != undefined && minnum != '' && (maxnum == undefined || maxnum == '')) {
      data = data.filter(
        (product) =>
          product.blend &&
          product.blend.match(/DKC[0-9]*-/) &&
          parseInt(
            product.blend &&
              product.blend
                .match(/DKC[0-9]*-/)[0]
                .replace('DKC', '')
                .replace('-', ''),
            0,
          ) +
            50 >=
            minnum,
      );
    }
    if (maxnum != undefined && maxnum != '' && (minnum == undefined || minnum == '')) {
      data = data.filter(
        (product) =>
          product.blend &&
          product.blend.match(/DKC[0-9]*-/) &&
          parseInt(
            product.blend &&
              product.blend
                .match(/DKC[0-9]*-/)[0]
                .replace('DKC', '')
                .replace('-', ''),
            0,
          ) +
            50 <=
            maxnum,
      );
    }
    //const groupData = groupBy(data)
    const availableProducts = !seedCompany.Products
      ? []
      : seedCompany.Products.filter(
          (product) => (product.classification = this.seedTypeClassificationMap[productType.toUpperCase()]),
        );
    const zoneCodesNameArray = process.env.REACT_APP_ZONES.split(';').filter(
      (c) => JSON.parse(c).CROP === productType.toUpperCase(),
    );
    // if(data.length > 0) {

    //   data.map(item => {
    //     const DealerPrice = JSON.parse(
    //       item.LineItem.suggestedDealerPrice
    //     )[currentZone];
    //     const EndUserPrice = JSON.parse(
    //       item.LineItem.suggestedEndUserPrice
    //     )[currentZone];
    //     item.LineItem.suggestedDealerPrice = DealerPrice;
    //     item.LineItem.suggestedEndUserPrice = EndUserPrice;
    //     data = [...data ]
    //     console.log(item, "item");
    //     return item;
    //   });
    // }

    return (
      selectedZoneId !== undefined && (
        <GridContainer className={classes.productTableContainer}>
          <GridItem xs={12}>
            <div className={`${classes.actionBar} hide-print`}>
              <FormControl fullWidth={true}>
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
              </FormControl>
              <FormControl fullWidth={true} style={{ marginRight: '20px', maxWidth: '100px' }}>
                <InputLabel htmlFor="season-selector">Search </InputLabel>
                <Input
                  placeholder="search"
                  id="searchBar"
                  onChange={(e) => {
                    this.setState({
                      isSearchRenderList: true,
                      searchString: e.target.value,
                    });
                  }}
                />
              </FormControl>
              <FormControl fullWidth={true} style={{ marginRight: '20px', maxWidth: '100px' }}>
                <InputLabel htmlFor="season-selector">Min RM</InputLabel>
                <Input
                  placeholder="min rm"
                  onChange={(e) => {
                    this.setState({
                      minnum: e.target.value,
                    });
                  }}
                />
              </FormControl>
              <FormControl fullWidth={true} style={{ marginRight: '20px', maxWidth: '100px' }}>
                <InputLabel htmlFor="season-selector">Max RM</InputLabel>
                <Input
                  placeholder="max rm"
                  onChange={(e) => {
                    this.setState({
                      maxnum: e.target.value,
                    });
                  }}
                />
              </FormControl>
              <Button
                buttonRef={(node) => {
                  this.anchorEl = node;
                }}
                id="dotBtnsInPriceSheet"
                aria-owns={horizMenuOpen ? 'menu-list-grow' : undefined}
                aria-haspopup="true"
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
                        this.setState({ dialogOpen: true });
                      }}
                    >
                      Product Breakdown
                    </MenuItem>
                  </MenuList>
                </Paper>
              </Popover>
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
                      className={classes.horizTableMenuItem}
                      onClick={() => syncPricesheets(seedCompany.id)}
                      style={{ borderBottom: '1px dashed #000000' }}
                      id="syncLatestPricesheet"
                    >
                      Sync Latest Pricesheets
                    </MenuItem>
                    {deleteAction ? (
                      <MenuItem
                        className={classes.horizTableMenuItem}
                        onClick={deleteAction}
                        style={{ borderBottom: '1px dashed #000000' }}
                      >
                        {deleteText}
                      </MenuItem>
                    ) : (
                      ''
                    )}
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
                    style={{ borderBottom: '1px dashed #000000' }}
                    onClick={async () => {
                      await this.exportCsv(data);
                      this.props.history.push({
                        pathname: `/app/csv_preview/Inventory`,
                        state: { csvdata: this.state.inventoryCsvdata, seedList: this.state.inventoryListData },
                      });
                    }}
                  >
                    Download Inventory
                  </MenuItem> */}
                    <MenuItem>
                      <FormControl style={{ marginLeft: 20 }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={showFavoriteProducts}
                              value={showFavoriteProducts && showFavoriteProducts.toString()}
                              onChange={this.handleShowFavoriteProducts}
                            />
                          }
                          label="Show Favorite Products"
                        />
                      </FormControl>
                    </MenuItem>
                    {/* <MenuItem>
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
                  columns={columns.filter((col) => col.Header)}
                  productType="foo" // TODO: remove this property, not needed at all
                  className={classes.columnMenu}
                />
              )}
            </div>
            <div id="priceSheet_card">
              <div style={{ fontStyle: 'bold' }}>
                Pricesheet lasttime updated on :{' '}
                {data.length !== 0 || data.length > 0
                  ? moment.utc(data[0].updatedAt).format('MMMM Do YYYY, h:mm a')
                  : ''}
              </div>
            </div>
            {data.length !== 0 || data.length > 0 ? (
              <ReactTable
                data={data.sort((a, b) => a.blend.localeCompare(b.blend))}
                columns={columns}
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
                id="priceSheet"
                className={classes.productTable + ' -striped -highlight'}
              />
            ) : (
              <center>
                <h3 style={{ marginTop: '10px', marginBottom: '10px' }}>
                  {fetched && data.length == 0
                    ? `Threre is not product in here!`
                    : `Please Refresh after some time if products aren't showing up , we are fetching you data in
                background`}
                </h3>
              </center>
            )}
          </GridItem>

          {activeTableItem !== null && (
            <Dialog
              open={this.state.dialogOpen}
              fullWidth
              maxWidth={'md'}

              // TransitionComponent={Transition}
            >
              <DialogTitle className={classes.dialogTitle}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3>Product Breakdown</h3>
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      this.setState({ dialogOpen: false });
                      this.handleTableItemActionMenuClose();
                    }}
                    aria-label="Close"
                    id="close"
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              </DialogTitle>

              <DialogContent>
                <Divider />
                <Grid
                  container
                  className={classes.productGridContainer}
                  style={{ lineBreak: 'anywhere', textAlign: 'center', padding: '10px' }}
                >
                  <Grid item xs={3} className={classes.productGrid}>
                    <p className={classes.productGridHeader}>Trait</p>

                    <h5 className={classes.productGridBody}>{activeTableItem.blend}</h5>
                  </Grid>
                  <Grid item xs={3} className={classes.productGrid}>
                    <p className={classes.productGridHeader}>Variety</p>

                    <h5 className={classes.productGridBody}>{activeTableItem.brand}</h5>
                  </Grid>
                  <Grid item xs={4} className={classes.productGrid}>
                    <p className={classes.productGridHeader}>Treatment</p>

                    <h5 className={classes.productGridBody}>{activeTableItem.treatment}</h5>
                  </Grid>
                </Grid>

                <Divider />
                <ReactTable
                  data={priceSheetAllData
                    .filter(
                      (d) =>
                        d.blend == activeTableItem.blend &&
                        d.brand == activeTableItem.brand &&
                        d.treatment == activeTableItem.treatment,
                    )
                    .sort((a, b) => a.seedSize.localeCompare(b.seedSize))}
                  columns={[
                    {
                      Header: 'SeedSize',
                      headerStyle: {
                        fontWeight: 'bold',
                        fontSize: '14px',
                        color: '#000000',
                      },
                      id: 'seedSize',
                      accessor: (product) => product.seedSize,
                      sortable: true,

                      sortMethod: (a, b) => {
                        return a.localeCompare(b);
                      },
                    },
                    {
                      Header: 'Packaging',
                      headerStyle: {
                        fontWeight: 'bold',
                        fontSize: '14px',
                        color: '#000000',
                        textAlign: 'left',
                      },
                      id: 'packaging',
                      accessor: (product) => product.packaging,
                      sortable: true,

                      sortMethod: (a, b) => {
                        return a.localeCompare(b);
                      },
                    },
                  ]}
                  resizable={false}
                  defaultPageSize={500}
                  minRows={1}
                  showPagination={false}
                  getTrGroupProps={(state, rowInfo, column) => ({
                    style: {
                      maxHeight: '80px',
                    },
                  })}
                />
              </DialogContent>
            </Dialog>
          )}
          <Snackbar
            open={showSnackbar}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            message={showSnackbarText}
            // autoHideDuration={5000}
            onClose={() => this.setState({ showSnackbar: false })}
            onClick={() => this.setState({ showSnackbar: false })}
          ></Snackbar>
        </GridContainer>
      )
    );
  }
}

export default withStyles(styles, { withTheme: true })(ApiPricesheetProductTable);
