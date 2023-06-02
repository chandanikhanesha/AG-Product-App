import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { flatten } from 'lodash/array';

// material-ui icons
import MoreHoriz from '@material-ui/icons/MoreHoriz';
import TextField from '@material-ui/core/TextField';

// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import ReactTable from 'react-table';
import Button from '../../components/material-dashboard/CustomButtons/Button';

import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import './pt.css';

// custom component
import ColumnMenu from './column_menu';
// import {
//   getQtyOrdered,
//   getQtyShipped,
//   getGrowerOrder,
//   getGrowerOrderDelivered
// } from "utilities/product";

// import { getMonsantoProductLongShort } from '../../utilities/monsanto_product';
import { downloadCSV } from '../../utilities/csv';

import styles from './productTableStyles';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import AddFavoriteProductsDialog from './add_monsanto_favorite_product_dialog';

import { groupBy } from 'lodash';
import moment from 'moment';

class ApiProductTable extends Component {
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
    inventoryCsvdata: '',
    inventoryListData: [],
    serchText: '',
  };

  seedTypeClassificationMap = { CORN: 'C', SOYBEAN: 'B', SORGHUM: 'S' };

  handleHorizMenuToggle = () => {
    this.setState((state) => ({ horizMenuOpen: !state.horizMenuOpen }));
  };
  handleSearchTextChange = (event) => {
    this.setState({ serchText: event.target.value });
  };
  handleHorizMenuClose = (event) => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }
    this.setState({ horizMenuOpen: false });
  };

  handleAddFavoriteProductsDialogOpen = () => {
    this.setState({ showAddFavoriteProductsDialog: true });
  };

  handleAddFavoriteProductsDialogClose = () => {
    this.setState({ showAddFavoriteProductsDialog: false });
  };

  setFavoriteProducts = async () => {
    const {
      seedCompany: { MonsantoFavoriteProducts },
      productType,
    } = this.props;
    const classification = this.seedTypeClassificationMap[productType.toUpperCase()];
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

  componentDidMount() {
    const {
      //deliveryReceipts,
      seedCompany,
      productType,
      customerMonsantoProduct,
      selectedColumnIds,
      deliveryReceipts,
    } = this.props;
    // const deliveryReceiptDetails = flatten(
    //   deliveryReceipts.map(dr => dr.DeliveryReceiptDetails)
    // );
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
    const deliveryReceiptDetails = flatten(deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));
    // columns.push({
    //   Header: "productId",
    //   id: "description",
    //   className: "sticky",
    //   headerClassName: "sticky",
    //   width:130,
    //   headerStyle: {
    //       fontWeight: "bold",
    //       fontSize: "14px",
    //       color: "#000000"
    //     },
    //   accessor: product => {
    //     // const detail = product.Product.productDetail
    //     //   ? product.Product.productDetail
    //     //   : this.state.showFavoriteProductsAll
    //     //   ? `${product.Product.blend} ${product.Product.seedSize} ${product.Product.brand} ${product.Product.packaging} ${product.Product.treatment}`
    //     //   : `${product.Product.blend} ${product.Product.brand} ${product.Product.treatment}`;
    //     return (
    //       <div>
    //         {/* {detail} */}
    //         {/* <br /> */}
    //         {product.productId}
    //         <br />
    //         {/* {product.isFavorite ? "Favorite Product" : "Retail Product"} */}
    //       </div>
    //     );
    //   }
    // });

    addField('variety', {
      Header: 'Variety',
      width: 150,
      className: 'sticky',
      headerClassName: 'sticky',
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'blend',
      accessor: (product) => product.Product.blend,
      sortable: true,

      sortMethod: (a, b) => {
        return a.localeCompare(b);
      },
    });

    addField('trait', {
      Header: 'Trait',
      width: 100,
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'brand',
      accessor: (product) => product.Product.brand,
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

      sortMethod: (a, b) => {
        return parseFloat(a) - parseFloat(b);
      },
      sortable: true,
      accessor: (product) => {
        const { blend } = product.Product;
        let match = blend && blend.match(/DKC[0-9]*-/);
        if (match) {
          let i = match[0].replace('DKC', '').replace('-', '');
          return parseInt(i, 0) + 50;
        }
        return '-';
      },
    });
    addField('treatment', {
      Header: 'Treatment',
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'treatment',
      accessor: (product) => product.Product.treatment,
      sortable: true,

      sortMethod: (a, b) => {
        return a.localeCompare(b);
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

      sortMethod: (a, b) => {
        return parseFloat(a) - parseFloat(b);
      },
      sortable: true,
      accessor: ({ Product }) => {
        const { suggestedDealerPrice, suggestedEndUserPrice } = Product.LineItem || {};
        const { zoneIds, selectedZoneId } = this.props;
        let EndUserPrice = '';

        // let DealerPrice = '';
        if (
          suggestedDealerPrice !== undefined &&
          JSON.parse(suggestedDealerPrice) &&
          JSON.parse(suggestedEndUserPrice)['NZI']
        ) {
          EndUserPrice = JSON.parse(suggestedEndUserPrice)['NZI'];
        } else if (suggestedDealerPrice !== undefined) {
          EndUserPrice = JSON.parse(suggestedEndUserPrice)[selectedZoneId || zoneIds[0]];
        } else {
          EndUserPrice = 0;
        }

        return EndUserPrice;
      },
    });

    // addField("seedCompany", {
    //   Header: (
    //     <span>
    //       Dealer
    //       <br />
    //       Order
    //     </span>
    //   ),
    //   headerStyle: {
    //     fontWeight: "bold",
    //     fontSize: "14px",
    //     color: "#000000"
    //   },
    //   accessor: product =>
    //     product.isFavorite
    //       ? "-"
    //       : parseInt(product.totalRetailerProductQuantityValue, 10),
    //   id: "qtyOrderedFromSeedCo"
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
    //     .filter(order => order.productId === d.id)
    //     .reduce((unDelivered, acc) => unDelivered + (acc.orderQty - acc.amountDelivered), 0),
    // })

    // addField("longShort", {
    //   Header: (<span>
    //     Long/
    //     <br/>
    //      Short
    //   </span>),
    //   headerStyle: {
    //       fontWeight: "bold",
    //       fontSize: "14px",
    //       color: "#000000"
    //     },
    //   id: "longShort",
    //   accessor: product =>
    //     product.isFavorite
    //       ? "-"
    //       : getMonsantoProductLongShort(product, customerMonsantoProduct)
    // });

    // addField("qtyWarehouse", {
    //   Header: (
    //     <span>
    //       Warehouse/On-hand
    //     </span>
    //   ),
    //   headerStyle: {
    //       fontWeight: "bold",
    //       fontSize: "14px",
    //       color: "#000000"
    //     },
    //   id: "availableQuantity",
    //   accessor: product =>
    //     product.isFavorite
    //       ? "-"
    //       : parseInt(product.balanceToShipQuantityValue, 10)
    // });

    addField('bayerDealerBucketQty', {
      Header: (
        <span>
          Dealer
          <br />
          Bucket
        </span>
      ),
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'bayerDealerBucketQty',

      sortMethod: (a, b) => {
        return parseFloat(a) - parseFloat(b);
      },
      sortable: true,
      accessor: (product) => product.bayerDealerBucketQty,
    });

    addField('allGrowerQty', {
      Header: (
        <span>
          All
          <br />
          Growers
        </span>
      ),
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'allGrowerQty',

      sortMethod: (a, b) => {
        return parseFloat(a) - parseFloat(b);
      },
      sortable: true,
      accessor: (product) => product.allGrowerQty,
    });

    addField('demand', {
      Header: <span>Demand</span>,
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'demand',

      sortMethod: (a, b) => {
        return parseFloat(a) - parseFloat(b);
      },
      sortable: true,
      accessor: (product) => product.demand,
    });

    addField('supply', {
      Header: <span>Supply</span>,
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'supply',

      sortMethod: (a, b) => {
        return parseFloat(a) - parseFloat(b);
      },
      sortable: true,
      accessor: (product) => product.supply,
    });
    addField('shippedQuantityValue', {
      Header: (
        <span>
          Received <br></br>by Dealer
        </span>
      ),
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'shippedQuantityValue',

      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,
      accessor: (product) => {
        return <div style={{ textAlign: 'center' }}>{product.shippedQuantityValue}</div>;
      },
    });
    addField('deliveredToGrower', {
      Header: (
        <span>
          {' '}
          Delivered to <br></br>Grower
        </span>
      ),
      headerStyle: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#000000',
      },
      id: 'deliveredToGrower',

      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
      sortable: true,
      accessor: (product) => {
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
        return <div style={{ textAlign: 'center' }}>{sumData.length > 0 ? sumData[0].amountDelivered : 0}</div>;
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
      lastSelectedColumnSummaryOption: selectedColumnIds.filter((c) => c !== undefined),
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

  exportCsv = (data) => {
    let csvData = '';
    let tabledata = [];
    const headers = ['Variety', 'Trait', 'RM', 'Treatment', 'MSRP', 'Dealer Bucket', 'All Growers', 'Demand', 'Supply'];
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
      // let EndUserPrice = '';

      if (
        suggestedDealerPrice !== undefined &&
        JSON.parse(suggestedDealerPrice) &&
        JSON.parse(suggestedEndUserPrice)['NZI']
      ) {
        DealerPrice = JSON.parse(suggestedDealerPrice)['NZI'];
        // EndUserPrice = JSON.parse(suggestedEndUserPrice)['NZI'];
      } else if (suggestedDealerPrice !== undefined) {
        DealerPrice = JSON.parse(suggestedDealerPrice)[selectedZoneId || zoneIds[0]];
        // EndUserPrice = JSON.parse(suggestedEndUserPrice)[selectedZoneId || zoneIds[0]];
      } else {
        DealerPrice = 0;
        // EndUserPrice = 0;
      }
      const msrp = DealerPrice;

      tabledata.push({
        Variety: product.Product.blend,
        Trait: product.Product.brand,
        RM: rm,
        Treatment: product.Product.treatment,
        MSRP: msrp,
        DealerBucket: product.bayerDealerBucketQty,
        AllGrowers: product.allGrowerQty,
        Demand: product.demand,
        Supply: product.totalRetailerProductQuantityValue ? product.totalRetailerProductQuantityValue : 0,
      });

      const row = [
        product.Product.blend,
        product.Product.brand,
        rm,
        product.Product.treatment,
        msrp,
        product.bayerDealerBucketQty,
        product.allGrowerQty,
        product.demand,
        product.supply,
      ];
      csvData += row.join(',');
      csvData += '\n';
    });

    this.setState({
      inventoryCsvdata: csvData,
      inventoryListData: tabledata,
    });
    // downloadCSV(csvData, 'inventory');
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
      serchText,
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
      syncProductBookingSummary,
      currentZone,
      fetched,
      retailOrderSummaryLasySyncDate,
    } = this.props;
    let data = [];
    const lastUpdateDate = '';
    const zoneCodesNameArray = process.env.REACT_APP_ZONES.split(';').filter(
      (c) => JSON.parse(c).CROP === productType.toUpperCase(),
    );
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
    if (showRetailerProducts) data = data.concat(products);
    //const groupData = groupBy(data)
    const availableProducts = !seedCompany.Products
      ? []
      : seedCompany.Products.filter(
          (product) => (product.classification = this.seedTypeClassificationMap[productType.toUpperCase()]),
        );
    data = data.filter((p) => {
      return (
        (p.Product.brand && p.Product.brand.toLowerCase().includes(serchText)) ||
        (p.Product.blend && p.Product.blend.toLowerCase().includes(serchText))
      );
    });

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
    return (
      selectedZoneId !== undefined && (
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
                />
              </FormControl>
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
                      {/* Zone {zoneId} */}
                      {zoneCodesNameArray.length < 1
                        ? 'Zone ' + zoneId
                        : zoneCodesNameArray.filter((c) => JSON.parse(c).ZONEID === zoneId).length > 0
                        ? JSON.parse(zoneCodesNameArray.filter((c) => JSON.parse(c).ZONEID == zoneId)).ZONENAME
                        : 'Zone ' + zoneId}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                buttonRef={(node) => {
                  this.anchorEl = node;
                }}
                id="dealerSummuryDots"
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
                      id="syncInventorySummary"
                      className={classes.horizTableMenuItem}
                      onClick={async () => {
                        await syncSummaryData(seedCompany.id);
                        await syncProductBookingSummary(seedCompany.id);
                      }}
                      style={{ borderBottom: '1px dashed #000000' }}
                    >
                      Sync Inventory Data
                    </MenuItem>
                    {/* {deleteAction ? (
                    <MenuItem
                      className={classes.horizTableMenuItem}
                      onClick={deleteAction}
                      style={{ borderBottom: '1px dashed #000000' }}
                    >
                      {deleteText}
                    </MenuItem>
                  ) : (
                    ''
                  )} */}
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
                        pathname: `/app/csv_preview/Inventory`,
                        state: { csvdata: this.state.inventoryCsvdata, seedList: this.state.inventoryListData },
                      });
                    }}
                  >
                    Download Inventory
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
                  </MenuItem> */}
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
              {/* <Button
              className="hide-print"
              color="primary"
              onClick={this.handleAddFavoriteProductsDialogOpen}
            >
              Add product
            </Button> */}
            </div>

            <div id="detailSummary_card">
              Product Booking Summary and Retailer Order Summary last updated:{' '}
              {data.length !== 0 || data.length > 0
                ? moment.utc(data[0].retailOrderSummaryLasySyncDate).format('MMMM Do YYYY, h:mm a')
                : ''}
            </div>

            {data.length !== 0 || data.length > 0 ? (
              <ReactTable
                data={data.sort((a, b) => a.Product.blend.localeCompare(b.Product.blend))}
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
                id="detailSummary"
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
        </GridContainer>
      )
    );
  }
}

export default withStyles(styles, { withTheme: true })(ApiProductTable);
