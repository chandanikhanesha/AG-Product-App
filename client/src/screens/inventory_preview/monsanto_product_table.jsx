import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
// import { flatten } from "lodash/array";

// material-ui icons
import MoreHoriz from '@material-ui/icons/MoreHoriz';

// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import ReactTable from 'react-table';
import Button from '../../components/material-dashboard/CustomButtons/Button';

import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';

// custom component
import ColumnMenu from './column_menu';
// import {
//   getQtyOrdered,
//   getQtyShipped,
//   getGrowerOrder,
//   getGrowerOrderDelivered
// } from "utilities/product";

import { getMonsantoProductLongShort } from '../../utilities/monsanto_product';

import styles from './productTableStyles';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';

import { Checkbox, FormControlLabel } from '@material-ui/core';
import { groupBy } from 'lodash';

class ApiProductTable extends Component {
  state = {
    columns: [],
    deliveryReceiptDetails: [],
    horizMenuOpen: false,
    favoriteProducts: [],
    showFavoriteProducts: true,
    showRetailerProducts: true,
    showFavoriteProductsAll: false,
  };

  seedTypeClassificationMap = { CORN: 'C', SOYBEAN: 'B', SORGHUM: 'S' };

  handleHorizMenuToggle = () => {
    this.setState((state) => ({ horizMenuOpen: !state.horizMenuOpen }));
  };

  handleHorizMenuClose = (event) => {
    if (this.anchorEl.contains(event.target)) {
      return;
    }
    this.setState({ horizMenuOpen: false });
  };

  setFavoriteProducts = async () => {
    const {
      seedCompany: { MonsantoFavoriteProducts },
      productType,
    } = this.props;
    const classification = this.seedTypeClassificationMap[productType.toUpperCase()];
    const result = await Promise.all(
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
    this.setState({ favoriteProducts: result });
  };

  componentDidMount() {
    const {
      //deliveryReceipts,
      seedCompany,
      productType,
      customerMonsantoProduct,
    } = this.props;
    // const deliveryReceiptDetails = flatten(
    //   deliveryReceipts.map(dr => dr.DeliveryReceiptDetails)
    // );
    this.setFavoriteProducts();
    const metadata = JSON.parse(seedCompany.metadata);
    const columns = [];

    const addField = (field, content) => {
      if (!metadata[productType][field]) return;
      columns.push({
        show: true,
        ...content,
      });
    };

    columns.push({
      Header: 'Description',
      id: 'description',
      accessor: (product) => {
        const detail = product.Product.productDetail
          ? product.Product.productDetail
          : this.state.showFavoriteProductsAll
          ? `${product.Product.blend} ${product.Product.seedSize} ${product.Product.brand} ${product.Product.packaging} ${product.Product.treatment}`
          : `${product.Product.blend} ${product.Product.brand} ${product.Product.treatment}`;
        return (
          <div>
            {detail}
            <br />
            {product.productId}
            <br />
            {product.isFavorite ? 'Favorite Product' : 'Retail Product'}
          </div>
        );
      },
    });

    addField('brand', {
      Header: 'Trait',
      id: 'brand',
      accessor: (product) => product.Product.brand,
    });
    addField('brand', {
      Header: 'Variety',
      id: 'blend',
      accessor: (product) => product.Product.blend,
    });
    addField('rm', {
      Header: 'RM',
      id: 'rm',
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
      id: 'treatment',
      accessor: (product) => product.Product.treatment,
    });

    addField('msrp', {
      Header: 'MSRP',
      headerStyle: styles.columnHeaderOverride,
      id: 'msrp',
      accessor: (product) =>
        product.Product.LineItem.suggestedEndUserPrice | product.Product.LineItem.suggestedDealerPrice,
    });

    addField('seedCompany', {
      Header: 'Dealer Order',
      headerStyle: styles.columnHeaderOverride,
      accessor: (product) => (product.isFavorite ? '-' : parseInt(product.totalRetailerProductQuantityValue, 10)),
      id: 'qtyOrderedFromSeedCo',
    });

    addField('seedCompany', {
      Header: (
        <span>
          Qty shipped
          <br className="show-print" />
          from seed
          <br className="show-print" />
          company
        </span>
      ),
      headerStyle: styles.columnHeaderOverride,
      id: 'qty-shipped-from-seed-co',
      accessor: (product) => (product.isFavorite ? '-' : parseInt(product.shippedQuantityValue, 10)),
    });

    addField('seedCompany', {
      Header: (
        <span>
          Qty yet to
          <br className="show-print" />
          ship from
          <br className="show-print" />
          seed company
        </span>
      ),
      headerStyle: styles.columnHeaderOverride,
      id: 'undeliveredSeedCompany',
      accessor: (product) => (product.isFavorite ? '-' : parseInt(product.scheduledToShipQuantityValue, 10)),
    });

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

    addField('longShort', {
      Header: 'Long / Short',
      headerStyle: styles.columnHeaderOverride,
      id: 'longShort',
      accessor: (product) => (product.isFavorite ? '-' : getMonsantoProductLongShort(product, customerMonsantoProduct)),
    });

    addField('qtyWarehouse', {
      Header: (
        <span>
          Qty at
          <br className="show-print" />
          Warehouse
        </span>
      ),
      headerStyle: styles.columnHeaderOverride,
      id: 'availableQuantity',
      accessor: (product) => (product.isFavorite ? '-' : parseInt(product.balanceToShipQuantityValue, 10)),
    });
    this.setState({ columns });
  }

  toggleColumnMenu = (_, header) => {
    const columns = this.state.columns.map((col) => (col.Header === header ? { ...col, show: !col.show } : col));
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
    window.location.reload();
  };

  render() {
    const {
      columns,
      horizMenuOpen,
      showFavoriteProducts,
      showRetailerProducts,
      favoriteProducts,
      showFavoriteProductsAll,
    } = this.state;
    const {
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
    } = this.props;
    let data = [];
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
    const availableProducts = seedCompany.Products.filter(
      (product) => (product.classification = this.seedTypeClassificationMap[productType.toUpperCase()]),
    );

    return (
      <GridContainer className={classes.productTableContainer}>
        <GridItem xs={12}>
          <div className={`${classes.actionBar} hide-print`}>
            <FormControl fullWidth={true}>
              <InputLabel htmlFor="season-selector">Zone</InputLabel>
              <Select
                className={classes.seasonSelector}
                value={selectedZoneId}
                onChange={updateSelectedZone}
                inputProps={{
                  id: 'zone-selector',
                }}
              >
                {zoneIds.map((zoneId) => (
                  <MenuItem key={`zone-${zoneId}`} value={zoneId}>
                    Zone {zoneId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
                  {editAction && (
                    <MenuItem className={classes.horizTableMenuItem} onClick={editAction}>
                      {editText}
                    </MenuItem>
                  )}
                  <MenuItem
                    className={classes.horizTableMenuItem}
                    onClick={deleteAction}
                    style={{ borderBottom: '1px dashed #000000' }}
                  >
                    {deleteText}
                  </MenuItem>
                  <MenuItem className={classes.horizTableMenuItem} onClick={this.print}>
                    Print
                  </MenuItem>
                  <MenuItem
                    className={classes.horizTableMenuItem}
                    onClick={savePageAsPdf}
                    style={{ borderBottom: '1px dashed #000000' }}
                  >
                    Save as PDF
                  </MenuItem>
                  <MenuItem>
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
                  </MenuItem>
                  <MenuItem>
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
                  </MenuItem>
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
            <Button className="hide-print" color="primary" onClick={this.handleAddFavoriteProductsDialogOpen}>
              Add product
            </Button>
          </div>
          <ReactTable
            data={data}
            columns={columns}
            resizable={false}
            defaultPageSize={100}
            minRows={1}
            showPagination={false}
            className={classes.productTable + ' -striped -highlight'}
            // SubComponent={(row) => {
            //   if (showFavoriteProductsAll) {
            //     return (
            //       <ReactTable
            //         data={
            //           row.original.hasOwnProperty("seedCompanyId")
            //             ? row.original.lots
            //             : row.original.customLots
            //         }
            //         pageSize={
            //           row.original.hasOwnProperty("seedCompanyId")
            //             ? row.original.lots
            //               ? row.original.lots.length
            //               : 0
            //             : row.original.customLots
            //             ? row.original.customLots.length
            //             : 0
            //         }
            //         columns={this.subColumns}
            //         showPagination={false}
            //         style={{ border: "1px black solid" }}
            //       />
            //     );
            //   } else {
            //     return null;
            //   }
            // }}
          />
        </GridItem>
      </GridContainer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ApiProductTable);
