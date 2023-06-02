import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router-dom';
import SweetAlert from 'react-bootstrap-sweetalert';
import qs from 'qs';
import axios from 'axios';
import { groupBy } from 'lodash';

// core components
import Tabs from '../../components/material-dashboard/CustomTabs/CustomTabs';
import CircularProgress from '@material-ui/core/CircularProgress';
import Snackbar from '@material-ui/core/Snackbar';

// import sweetAlertStyle from "assets/jss/material-dashboard-pro-react/views/sweetAlertStyle";

import ProductTable from './product_table';
import ApiProductTable from './monsanto_product_table';
import ApiPricesheetProductTable from './pricesheet_product_table';
import ApiDetailProductTable from './detail_product_table';
import SeedCompanyEditModal from '../../components/seed-company/edit';
import SeasonsModal from '../../screens/season/modal';
import { createPDFTableLayout } from '../../utilities/pdf/tableGenerator';

import {
  listProducts,
  listPricesheetProducts,
  listRetailerOrderSummary,
  listCustomerProducts,
  getPdfForPage,
  deleteProduct,
  listPackagings,
  listSeedSizes,
  deleteSeedCompany,
  loadOrganization,
  updateCurrentSeedCompany,
  updateCurrentCropType,
  listSeasons,
  checkMonsantoProductsSyncState,
  updateProduct,
  createProduct,
  fetchZoneIds,
  listCustomerMonsantoProducts,
  listMonsantoFavoriteProducts,
  listProductDealers,
  deleteApiSeedCompany,
  updatePricesheetProduct,
  updateApiSeedCompany,
  listDeliveryReceipts,
  listCustomers,
} from '../../store/actions';
import { isUnloadedOrLoading } from '../../utilities';

import { styles } from './index.styles';

const MONSANTO_SEED_TYPES = {
  C: 'CORN',
  B: 'SOYBEAN',
  S: 'SORGHUM',
  // A: 'ALFALFA',
  L: 'CANOLA',
};
// const MONSANTO_SEED_TYPES = ["CORN", "SOYBEAN", "SORGHUM"];
// const SEED_TYPES_CODES = ["C", "B", "S" , "A"];

const DEFAULT_TABS = {
  CORN: 0,
  SOYBEAN: 1,
  SORGHUM: 2,
};

// tempcode here
const DYNAMIC_CODES = {
  CORN: 'C',
  SOYBEAN: 'B',
  SORGHUM: 'S',
  // ALFALFA: 'A',
  CANOLA: 'L',
  PACKAGING: 'P',
};

class Inventory extends Component {
  state = {
    productType: '',
    generatingPDF: false,
    deleteProductConfirm: null,
    seedCompanyId: null,
    showSeedCompanyEditModal: false,
    showSeasonsModal: false,
    deleteSeedCompanyConfirm: null,
    isSynced: null,
    areZoneIdsFetched: false,
    selectedZoneId: '',
    showSnackbar: false,
    showSnackbarText: '',
    default_tabs: {},
    dynamic_crop_codes: [],
    fetched: false,
    isPageSyncing: false,
    loadingIcon: false,
    runPriceSheetScript: 'false',
  };

  constructor(props) {
    super(props);
    this.state = {
      isprint: false,
      pricesheetproductfilter: [],
      priceSheetAllData: [],
    };
  }

  deleteProduct = (product) => {
    const { deleteProduct, classes } = this.props;

    this.setState({
      deleteProductConfirm: (
        <SweetAlert
          warning
          showCancel
          title="Delete Product"
          onConfirm={async () => {
            try {
              await deleteProduct(product).then(async (response) => {
                await this.props.listProducts(true);
                this.setState({ deleteProductConfirm: null });
              });
            } catch (err) {
              this.setState({
                deleteProductConfirm: (
                  <SweetAlert
                    warning
                    showCancel
                    title="Delete Product Unsucccessfully"
                    onConfirm={async () => {
                      this.setState({ deleteProductConfirm: null });
                    }}
                    onCancel={() => this.setState({ deleteProductConfirm: null })}
                    confirmBtnCssClass={classes.button + ' ' + classes.success}
                    cancelBtnCssClass={classes.button + ' ' + classes.danger}
                  >
                    This product cannot be deleted now. It may be connecting to a purchase order / quote.
                    {err.poIds && err.poIds.length > 0 && (
                      <div>
                        Purchase Orders:
                        {err.poIds.map((id) => (
                          <span key={id}>#{id}, </span>
                        ))}
                      </div>
                    )}
                    {err.quoteIds && err.quoteIds.length > 0 && (
                      <div>
                        Quotes:
                        {err.quoteIds.map((id) => (
                          <span key={id}>#{id}, </span>
                        ))}
                      </div>
                    )}
                  </SweetAlert>
                ),
              });
            }
          }}
          onCancel={() => this.setState({ deleteProductConfirm: null })}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to delete this product? This will also remove the product from any purchase orders or
          quotes it has been added to.
        </SweetAlert>
      ),
    });
  };

  syncSummaryData = (id) => {
    this.setState({ isPageSyncing: true });
    axios
      .get(`${process.env.REACT_APP_API_BASE}/monsanto/retailer_orders/syncSummaryData?seedCompanyId=${id}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        this.setState({ isPageSyncing: false });
        window.location.reload();
        if (response.data.status === true) {
          this.setShowSnackbar('Sync Summary Data successfully');
        }
      })
      .catch((e) => {
        this.setState({ isPageSyncing: false });
        this.setShowSnackbar('Please Contact Tech Support');
      });
  };

  syncProductBookingSummary = (id) => {
    this.setState({ isPageSyncing: true });
    axios
      .get(`${process.env.REACT_APP_API_BASE}/monsanto/sync/syncProductBookingSummary?seedCompanyId=${id}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        this.setState({ isPageSyncing: false });
        window.location.reload();
        if (response.data.status === true) {
          this.setShowSnackbar('Sync Summary Data successfully');
        }
      })
      .catch((e) => {
        this.setState({ isPageSyncing: false });
        console.log('e : ', e);
        this.setShowSnackbar('Please Contact Tech Support');
      });
  };

  syncPricesheets = (id) => {
    this.setState({ isPageSyncing: true });
    axios
      .get(`${process.env.REACT_APP_API_BASE}/monsanto/pricesheet/syncLatestPricesheets?seedCompanyId=${id}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        this.setState({ isPageSyncing: false });
        if (response.data.status === true) {
          await this.props.listPricesheetProducts();
          this.setShowSnackbar('Pricesheet data was synced successfully');
        }
      })
      .catch((e) => {
        this.setState({ isPageSyncing: false });
        this.setShowSnackbar(e.response.data.error);
      });
  };

  filterPriceSheetData = (selectedZoneId) => {
    const selectedTabIndex = this.getSelectedTabIndex();
    if (this.isApiSeedCompanyPricesheet) {
      let pp = [];

      if (this.state.dynamic_crop_codes[selectedTabIndex] == 'C') {
        pp = this.props.pricesheetProducts.filter(
          (product) =>
            product &&
            product.classification === this.state.dynamic_crop_codes[selectedTabIndex] &&
            product.classification == 'C' &&
            product.LineItem &&
            product.LineItem.zoneId.includes(selectedZoneId ? selectedZoneId : this.state.selectedZoneId),
        );
      } else {
        pp = this.props.pricesheetProducts.filter(
          (product) => product.classification === this.state.dynamic_crop_codes[selectedTabIndex],
        );
      }

      let groped = [];
      const group = groupBy(pp, (favoriteProduct) => {
        return favoriteProduct.blend + ' ' + favoriteProduct.treatment;
      });
      Object.keys(group).forEach((description) => {
        let Ids = [];
        group[description].map((d) => {
          Ids.push(d.id);
        });

        groped.push({ ...group[description][0], ids: Ids });
      });

      this.setState({ pricesheetproductfilter: groped, priceSheetAllData: pp });
    }
  };

  updateSelectedZone = (e) => {
    const selectedZoneId = e.target.value;
    this.setState({ selectedZoneId }, this.fetchMonsantoData, this.filterPriceSheetData(selectedZoneId));
  };

  componentWillMount() {
    const seedCompanyId = parseInt(this.props.match.path.match(/seed_companies\/([0-9]*)/)[1], 10);
    this.setState({ seedCompanyId }, () => this.props.updateCurrentSeedCompany(seedCompanyId));
  }

  updateSeedCompanyProductIsFavorite = async (currentProduct) => {
    this.setState({ loadingIcon: true });
    const index = this.getSelectedTabIndex();

    const { updatePricesheetProduct } = this.props;
    // const { originProducts, products } = this.state;
    const { isFavorite } = currentProduct;

    const mid = currentProduct.ids;
    mid.map(async (id1) => {
      await updatePricesheetProduct({
        id: id1,
        isFavorite,
      });
    });

    this.setState({ loadingIcon: false });
  };

  componentDidMount = async () => {
    const { location, organizationId, apiSeedCompanies } = this.props;
    // await this.props.listProducts();
    await this.props.listCustomerProducts();
    // await this.props.listPackagings();
    // await this.props.listSeedSizes();
    // await this.props.listSeasons();
    await this.props.listCustomerMonsantoProducts();
    // await this.props.loadOrganization(organizationId);
    await this.props.listProductDealers();
    await this.props.listPricesheetProducts();
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });

    if (query || (query && query.selectedTab)) {
      await this.onTabChange(0);
      await this.fetchMonsantoData();
    } else {
      await this.fetchMonsantoData();
    }
    // await this.props.listDeliveryReceipts();

    // this.props.listCustomers(true, 0, this.props.totalItemsOfCustomers);
    if (this.isApiSeedCompany || this.isApiSeedCompanyProducts || this.isApiSeedCompanyPricesheet) {
      // this.props.listMonsantoFavoriteProducts();
      // this.syncSummaryData(apiSeedCompanies[0].id);
      // this.syncProductBookingSummary(apiSeedCompanies[0].id);
    }

    setTimeout(() => {
      this.setState({ runPriceSheetScript: 'true' });
    }, 5000);
  };

  setShowSnackbar = (showSnackbarText, timeout = 5000) => {
    this.setState({
      showSnackbar: true,
      showSnackbarText: showSnackbarText,
    });
    setTimeout(() => {
      this.setState({
        showSnackbar: false,
        showSnackbarText: '',
      });
    }, timeout);
  };

  async fetchZoneIds(selectedTabIndex) {
    const { dynamic_crop_codes } = this.state;
    if (selectedTabIndex !== 0) {
      if (!selectedTabIndex) selectedTabIndex = this.getSelectedTabIndex();
    }
    if (!this.state.areZoneIdsFetched) {
      const cropType = dynamic_crop_codes[selectedTabIndex];
      const zoneIds = await this.props.fetchZoneIds(cropType);

      this.setState({
        areZoneIdsFetched: false,
        selectedZoneId: this.props.zoneIds[0],
      });
      return zoneIds;
    }
    return this.state.zoneIds;
  }

  async fetchMonsantoData() {
    const { isSynced, seedCompanyId, selectedZoneId } = this.state;
    if (this.isApiSeedCompany || this.isApiSeedCompanyProducts) {
      if (isSynced === null || isSynced === undefined) {
        try {
          this.setShowSnackbar('Checking Bayer Product Synced State');
          const { isSynced } = await this.props.checkMonsantoProductsSyncState({
            seedCompanyId,
          });
          this.setShowSnackbar(isSynced ? 'Bayer Product Synced' : 'Bayer Product Not Synced');
          this.setState({ isSynced: true });
        } catch (err) {
          console.log(err);
        }
      } else if (isSynced === true) {
        this.setShowSnackbar('Fetching Bayer Product List');
        if (selectedZoneId === '') {
          await this.fetchZoneIds();
          await this.fetchMonsantoProductList();
          // await this.props.listCustomerMonsantoProducts();
        } else {
          this.fetchMonsantoProductList();
        }
        this.setState({ fetched: true });
        this.setShowSnackbar('Fetch Bayer Product List Done');
      }
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const {
      location: { search },
      // dynamic_crop_codes
    } = this.props;
    // if (prevProps.dynamic_crop_codes !== dynamic_crop_codes) {
    //   if (dynamic_crop_codes.length > 0) {
    //     if (!this.state.dynamic_crop_codes.length > 0) {
    //       this.setState(
    //         { dynamic_crop_codes: [...dynamic_crop_codes] },
    //         async () => {
    //           await this.fetchZoneIds();
    //           await this.fetchMonsantoProductList();
    //         }
    //       );
    //     }
    //   }
    // }

    const { isSynced } = this.state;
    const hasQueryChanged = prevProps.location.search !== search;
    const hasMonsantoSyncedStateChanged = isSynced && !prevState.isSynced;
    if (hasQueryChanged || hasMonsantoSyncedStateChanged) {
      this.fetchMonsantoData();
    }
  }

  get isLoading() {
    const { isOnline } = this.props;
    const { isSynced } = this.state;
    const storeStatus = [
      this.props.customerProductsStatus,
      this.props.productsStatus,
      this.props.seasonsStatus,
      this.props.productDealersStatus,
    ];
    if (this.isApiSeedCompany || this.isApiSeedCompanyProducts || this.isApiSeedCompanyPricesheet) {
      storeStatus.push(this.props.customerMonsantoProductStatus);
      // storeStatus.push(this.props.monsantoFavoriteProductsStatus);
    }
    if ((this.isApiSeedCompany || this.isApiSeedCompanyProducts || this.isApiSeedCompanyPricesheet) && isSynced) {
      storeStatus.push(this.props.monsantoRetailerOrderSummaryStatus);
    }
    return isOnline && isSynced === null && storeStatus.some(isUnloadedOrLoading);
  }

  getProductName(tabIndex) {
    const { default_tabs } = this.props;
    const productTab = Object.keys(default_tabs)
      .map((key) => {
        return {
          name: key,
          index: default_tabs[key],
        };
      })
      .find((tab) => {
        return tab.index === tabIndex;
      });
    return productTab && productTab.name;
  }

  savePageAsPdf = () => {
    const { organization, userFirstName, userLastName, seedCompanies } = this.props;
    const { seedCompanyId } = this.state;
    const seedCompany = seedCompanies.find((sc) => sc.id === seedCompanyId);
    const cropTypes = Object.keys(JSON.parse(seedCompany.metadata));
    const seedType = cropTypes[this.getSelectedTabIndex()];
    const productType = seedType.charAt(0) + seedType.substring(1).toLowerCase();

    this.setState(
      {
        generatingPDF: true,
      },
      () => {
        createPDFTableLayout({
          company: this.props.seedCompanies.find((c) => c.id === this.state.seedCompanyId),
          tableData: this.props.products.filter((p) => p.seedType === seedType),
          customerProducts: this.props.customerProducts,
          deliveryReceiptDetails: this.props.deliveryReceipts,
          productType: this.productTypeFromSeedType(productType).toLowerCase(),
          organization,
          userFirstName,
          userLastName,
          pdfType: 'Inventory',
        })
          .then(() => this.setState({ generatingPDF: false }))
          .catch((e) => {
            console.error(new Error(e));
            this.setState({ generatingPDF: false });
          });
      },
    );
  };

  // print = () => {
  //   setTimeout(() => {
  //     window.print();
  //   }, 500);
  // };

  print = () => {
    this.setState({ isprint: true }, () => {
      setTimeout(() => {
        window.print();
      }, 100);
      setTimeout(() => {
        this.setState({ isprint: false });
      }, 500);
    });
  };

  onTabChange = async (selectedTabIndex) => {
    this.props.history.push({
      pathname: this.props.history.location.pathname,
      search: `?selectedTab=${selectedTabIndex}`,
    });

    if (this.isApiSeedCompany || this.isApiSeedCompanyProducts || this.isApiSeedCompanyPricesheet) {
      await this.fetchZoneIds(selectedTabIndex);

      await this.fetchMonsantoProductList(selectedTabIndex);
    }
    this.filterPriceSheetData();
  };

  fetchMonsantoProductList = (selectedTabIndex) => {
    if (this.isApiSeedCompany || this.isApiSeedCompanyProducts) {
      if (!selectedTabIndex) selectedTabIndex = this.getSelectedTabIndex();

      const { listRetailerOrderSummary, updateCurrentCropType } = this.props;
      const { seedCompanyId, selectedZoneId } = this.state;
      const cropType = this.state.dynamic_crop_codes[selectedTabIndex];

      listRetailerOrderSummary({
        cropType,
        seedCompanyId,
        zoneId: selectedZoneId,
      }).then(() => updateCurrentCropType(cropType));
    }
    // if (this.isApiSeedCompanyPricesheet) {
    //   let pp = [];
    //   if (this.state.dynamic_crop_codes[selectedTabIndex] == 'C') {
    //     pp = this.props.pricesheetProducts.filter(
    //       (product) =>
    //         product.classification === this.state.dynamic_crop_codes[selectedTabIndex] &&
    //         product.classification == 'C' &&
    //         product.LineItem.zoneId.includes(this.state.selectedZoneId),
    //     );
    //   } else {
    //     pp = this.props.pricesheetProducts.filter(
    //       (product) => product.classification === this.state.dynamic_crop_codes[selectedTabIndex],
    //     );
    //   }

    //   let groped = [];
    //   const group = groupBy(pp, (favoriteProduct) => {
    //     return favoriteProduct.blend + ' ' + favoriteProduct.treatment;
    //   });
    //   Object.keys(group).forEach((description) => {
    //     let Ids = [];
    //     group[description].map((d) => {
    //       Ids.push(d.id);
    //     });

    //     groped.push({ ...group[description][0], ids: Ids });
    //   });

    //   // const helper1 = {};
    //   // const ppFilter1 = [];
    //   // const arr2 = pp.reduce(function (r1, o1) {
    //   //   const key = o1.brand + '-' + o1.blend + '-' + o1.treatment;
    //   //   if (!helper1[key]) {
    //   //     helper1[key] = Object.assign({}, o1); // create a copy of o
    //   //     helper1[key].ids = o1.id;
    //   //     ppFilter1.push(helper1[key]);
    //   //   } else {
    //   //     helper1[key].allseedSize = helper1[key].seedSize + ' ' + o1.seedSize;
    //   //     helper1[key].allpackaging = helper1[key].packaging + ' ' + o1.packaging;
    //   //     helper1[key].ids = helper1[key].id + ' ' + o1.id;
    //   //     helper1[key].favs = helper1[key].isFavorite + ' ' + o1.isFavorite;
    //   //   }

    //   //   return r1;
    //   // }, {});
    //   this.setState({ pricesheetproductfilter: groped });
    // }
    this.filterPriceSheetData();
  };

  getSelectedTabIndex() {
    const { location } = this.props;
    const query = qs.parse(location.search, { ignoreQueryPrefix: true });
    const tabIndex = query && query.selectedTab;

    return tabIndex ? parseInt(tabIndex, 10) : 0;
  }

  editSeedCompany = () => {
    this.setState({
      showSeedCompanyEditModal: true,
    });
  };

  openSeasonsModal = () => {
    this.setState({
      showSeasonsModal: true,
    });
  };

  deleteSeedCompany = () => {
    const { seedCompanyId } = this.state;
    const { deleteSeedCompany, classes, history, deleteApiSeedCompany } = this.props;
    this.setState({
      deleteSeedCompanyConfirm: (
        <SweetAlert
          warning
          showCancel
          title="Delete Seed Company"
          onConfirm={() => {
            deleteSeedCompany(seedCompanyId, history);
          }}
          onCancel={() => this.setState({ deleteSeedCompanyConfirm: null })}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to delete this seed company? This will also remove any products, discounts, products
          added to existing purchase orders and quotes.
        </SweetAlert>
      ),
    });
  };

  closeEditModal = () => {
    this.setState(
      {
        showSeedCompanyEditModal: false,
      },
      () => {
        window.location.reload();
      },
    );
  };

  closeSeasonsModal = () => {
    this.setState({
      showSeasonsModal: false,
    });
  };

  /**
   * Function to support legacy / old product.
   */
  productTypeFromSeedType = (seedType) => {
    switch (seedType) {
      case 'Soybean':
        return 'soybean';
      case 'Sorghum':
        return 'sorghum';
      case 'Corn':
        return 'corn';
      case 'Alfalfa':
        return 'alfalfa';
      case 'Canola':
        return 'Canola';
      default:
        return console.error('No product type for : ', seedType);
    }
  };
  makelist = (seedCompany) => {
    const { dynamic_crop_codes = [], default_tabs } = this.state;
    let cropList = [];
    seedCompany &&
      JSON.parse(seedCompany.zoneIds).map((data) => {
        if (data.classification) {
          if (MONSANTO_SEED_TYPES[data.classification]) {
            cropList.push(MONSANTO_SEED_TYPES[data.classification].toLowerCase());
          }
        } else if (data.cropType) {
          cropList.push(MONSANTO_SEED_TYPES[data.cropType].toLowerCase());
        }
      });
    cropList.push('packaging');

    // const obj = {};
    // const key = data.toUpperCase();
    // obj[key] = index;
    // const payload = {
    //   obj: obj,
    //   zone: DYNAMIC_CODES[data.toUpperCase()]
    // };
    // if (JSON.stringify(default_tabs) === "{}") {
    //   apiSeedCompanyDefaultTabs(
    //     seedCompany[`${seedType}BrandName`],
    //     index,
    //     DYNAMIC_CODES
    //   );
    // } else {
    //   if (
    //     !default_tabs.hasOwnProperty(
    //       seedCompany[`${seedType}BrandName`].toString().toUpperCase()
    //     )
    //   ) {
    //     apiSeedCompanyDefaultTabs(
    //       seedCompany[`${seedType}BrandName`],
    //       index,
    //       DYNAMIC_CODES
    //     );
    //   }
    // }

    if (default_tabs == {} || dynamic_crop_codes.length == 0) {
      let default_tabs_temp = {};
      let dynamic_crop_codes_temp = [];
      cropList
        .filter((seedType) => seedCompany[`${seedType}BrandName`] && seedCompany[`${seedType}BrandName`].trim() !== '')
        .map((seedType, index) => {
          const obj = {};
          const key = seedCompany[`${seedType}BrandName`].toUpperCase();
          obj[key] = index;
          const payload = {
            obj: obj,
            zone: DYNAMIC_CODES[seedCompany[`${seedType}BrandName`].toUpperCase()],
          };
          default_tabs_temp = { ...default_tabs_temp, ...payload.obj };
          dynamic_crop_codes_temp = [...dynamic_crop_codes_temp, payload.zone];
        });
      default_tabs_temp = { ...default_tabs_temp, PACKAGING: 5 };
      // dynamic_crop_codes_temp = [...dynamic_crop_codes_temp, 'P'];
      this.setState(
        {
          default_tabs: default_tabs_temp,
          dynamic_crop_codes: dynamic_crop_codes_temp,
        },
        async () => {
          await this.fetchZoneIds(0);
          await this.fetchMonsantoProductList(0);
        },
      );
    }
    return cropList;
  };

  get isApiSeedCompany() {
    return this.props.history.location.pathname.match(/^\/app\/api_seed_companies/);
  }

  get isApiSeedCompanyProducts() {
    return (
      this.props.history.location.pathname.match(/^\/app\/p_api_seed_companies/) ||
      this.props.history.location.pathname.match(/^\/app\/d_api_seed_companies/)
    );
  }

  get isApiSeedCompanyPricesheet() {
    return this.props.history.location.pathname.match(/^\/app\/pp_api_seed_companies/);
  }

  render() {
    const {
      generatingPDF,
      deleteProductConfirm,
      seedCompanyId,
      showSeedCompanyEditModal,
      showSeasonsModal,
      deleteSeedCompanyConfirm,
      isSynced,
      selectedZoneId,
      showSnackbar,
      showSnackbarText,
      dynamic_crop_codes,
      fetched,
      isPageSyncing,
      loadingIcon,
      runPriceSheetScript,
    } = this.state;

    const {
      classes,
      products,
      seasons,
      customerProducts,
      history,
      organization,
      deliveryReceipts,
      seedCompanies,
      apiSeedCompanies,
      monsantoRetailerOrderSummaryProducts,
      pricesheetProducts,
      isOnline,
      isAdmin,
      zoneIds,
      customerMonsantoProduct,
      organizationId,
    } = this.props;
    const helper = {};
    const monsantoRetailerOrderSummaryProductsFilter = [];
    const arr1 = monsantoRetailerOrderSummaryProducts.reduce(function (r, o) {
      const key = o.Product.brand + '-' + o.Product.blend + '-' + o.Product.treatment;
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
        helper[key].supply = parseInt(helper[key].supply ? helper[key].supply : 0) + parseInt(o.supply ? o.supply : 0);
      }

      return r;
    }, {});

    // if (this.isLoading || generatingPDF) return <CircularProgress />;

    // if (!isSynced && this.isApiSeedCompany)
    //   return (
    //     <div className={classes.syncingContainer}>
    //       <CircularProgress />
    //       <h3 className={classes.textCenter}>
    //         <p>Fetching your bucket</p>
    //         <p>from Monsanto...</p>
    //       </h3>
    //       <p className={classes.textCenter}>
    //         Meanwhile, you could carry on with other tasks in Agridealer, we
    //         will keep your bucket ready when you are back.{" "}
    //       </p>
    //     </div>
    //   );

    // don't uncomment this
    // if (isSynced === true && this.isApiSeedCompany) return <h1> dsafsad</h1>
    let tabs;
    let seedCompany = (
      this.isApiSeedCompany || this.isApiSeedCompanyProducts || this.isApiSeedCompanyPricesheet
        ? apiSeedCompanies
        : seedCompanies
    ).find((sc) => sc.id === seedCompanyId);

    const cropTypes =
      this.isApiSeedCompany || this.isApiSeedCompanyProducts || this.isApiSeedCompanyPricesheet
        ? this.makelist(seedCompany)
        : Object.keys(JSON.parse(seedCompany.metadata));

    if (this.isApiSeedCompany) {
      if (isPageSyncing) {
        return <CircularProgress />;
      }

      tabs = cropTypes
        .filter((seedType) => seedCompany[`${seedType}BrandName`] && seedCompany[`${seedType}BrandName`].trim() !== '')
        .map((seedType, index) => {
          return {
            tabName: seedCompany[`${seedType}BrandName`],
            tabContent: (
              <ApiProductTable
                fetched={fetched}
                editable={true}
                editText="Edit Seed Company"
                editAction={this.editSeedCompany}
                deleteText="Delete Seed Company"
                deleteAction={this.deleteSeedCompany}
                history={history}
                customerProducts={customerProducts}
                customerMonsantoProduct={customerMonsantoProduct}
                products={monsantoRetailerOrderSummaryProductsFilter}
                isOnline={isOnline}
                productType={seedType}
                deleteProduct={this.deleteProduct}
                syncSummaryData={this.syncSummaryData}
                syncProductBookingSummary={this.syncProductBookingSummary}
                isPDF={generatingPDF}
                print={this.print}
                savePageAsPdf={this.savePageAsPdf}
                toggleColumns={true}
                selectedZoneId={selectedZoneId}
                zoneIds={zoneIds}
                updateSelectedZone={this.updateSelectedZone}
                deliveryReceipts={deliveryReceipts}
                seedCompany={seedCompany}
                tabIndex={this.getSelectedTabIndex() || 0}
                updateApiSeedCompany={this.props.updateApiSeedCompany}
                selectedColumnIds={
                  this.props.apiSeedCompanies &&
                  this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId) &&
                  this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId)
                    .lastSelectedColumnSummaryOption !== undefined
                    ? this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId)
                        .lastSelectedColumnSummaryOption
                    : []
                }
              />
            ),
          };
        });
    } else if (this.isApiSeedCompanyProducts) {
      if (isPageSyncing) {
        return <CircularProgress />;
      }
      tabs = cropTypes
        // .filter(seedType => seedCompany[`${seedType}BrandName`].trim() !== "")
        .filter(
          (seedType) =>
            (seedCompany[`${seedType}BrandName`] && seedCompany[`${seedType}BrandName`].trim() !== '') ||
            seedType == 'packaging',
        )
        .map((seedType, index) => {
          return {
            tabName: seedCompany[`${seedType}BrandName`] ? seedCompany[`${seedType}BrandName`] : 'packaging',
            tabContent: (
              <ApiDetailProductTable
                fetched={fetched}
                editable={true}
                editText="Edit Seed Company"
                editAction={this.editSeedCompany}
                // deleteText="Delete Seed Company"
                // deleteAction={this.deleteSeedCompany}
                dynamic_crop_codes={dynamic_crop_codes}
                history={history}
                customerProducts={customerProducts}
                customerMonsantoProduct={customerMonsantoProduct}
                fetchMonsantoData={this.fetchMonsantoData}
                products={monsantoRetailerOrderSummaryProducts}
                isOnline={isOnline}
                productType={seedType}
                deleteProduct={this.deleteProduct}
                syncSummaryData={this.syncSummaryData}
                syncProductBookingSummary={this.syncProductBookingSummary}
                isPDF={generatingPDF}
                print={this.print}
                savePageAsPdf={this.savePageAsPdf}
                toggleColumns={true}
                selectedZoneId={selectedZoneId}
                zoneIds={zoneIds}
                updateSelectedZone={this.updateSelectedZone}
                // deliveryReceipts={deliveryReceipts}
                seedCompany={seedCompany}
                tabIndex={this.getSelectedTabIndex() || 0}
                seedCompanyId={seedCompanyId}
                updateApiSeedCompany={this.props.updateApiSeedCompany}
                selectedColumnIds={
                  this.props.apiSeedCompanies &&
                  this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId) &&
                  this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId)
                    .lastSelectedColumnDetailOption
                    ? this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId)
                        .lastSelectedColumnDetailOption
                    : []
                }
              />
            ),
          };
        });
    } else if (this.isApiSeedCompanyPricesheet) {
      if (isPageSyncing) {
        return <CircularProgress />;
      }
      tabs = cropTypes
        // .filter(seedType => seedCompany[`${seedType}BrandName`].trim() !== "")
        .filter(
          (seedType) =>
            (seedCompany[`${seedType}BrandName`] && seedCompany[`${seedType}BrandName`].trim() !== '') ||
            seedType == 'packaging',
        )
        .map((seedType, index) => {
          return {
            tabName: seedCompany[`${seedType}BrandName`] ? seedCompany[`${seedType}BrandName`] : 'packaging',
            tabContent: (
              <ApiPricesheetProductTable
                fetched={fetched}
                history={history}
                products={this.state.pricesheetproductfilter}
                priceSheetAllData={this.state.priceSheetAllData}
                isOnline={isOnline}
                productType={seedType}
                isPDF={generatingPDF}
                print={this.print}
                savePageAsPdf={this.savePageAsPdf}
                toggleColumns={true}
                selectedZoneId={selectedZoneId}
                zoneIds={zoneIds}
                filterPriceSheetData={this.filterPriceSheetData}
                seedCompany={seedCompany}
                listPricesheetProducts={this.props.listPricesheetProducts}
                tabIndex={this.getSelectedTabIndex() || 0}
                updatePricesheetProduct={(data) => this.updateSeedCompanyProductIsFavorite(data)}
                syncPricesheets={this.syncPricesheets}
                updateApiSeedCompany={this.props.updateApiSeedCompany}
                organization={organization}
                runPriceSheetScript={runPriceSheetScript}
                onTabChange={this.onTabChange}
                updateSelectedZone={this.updateSelectedZone}
                lastSelectedFavOption={
                  this.props.apiSeedCompanies.find(
                    (e) => e.id == organization.id && e.organizationId == organizationId,
                  ) && this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId).lastSelectedFavOption
                  // this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId)
                  //   ? this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId).lastSelectedFavOption
                  //   : null
                }
                selectedColumnIds={
                  this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId) &&
                  this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId)
                    .lastSelectedColumnPricesheetOption
                    ? this.props.apiSeedCompanies.find((e) => e.organizationId == organizationId)
                        .lastSelectedColumnPricesheetOption
                    : []
                }
              />
            ),
          };
        });
    } else {
      const metadata = JSON.parse(seedCompany.metadata);
      tabs = cropTypes
        .filter((seedType) => metadata[seedType] && metadata[seedType].brandName !== '')
        .map((seedType) => {
          return {
            tabName: metadata[seedType].brandName,
            tabContent: (
              <ProductTable
                editable={true}
                organization={organization}
                editText="Edit Seed Company"
                editAction={this.editSeedCompany}
                openSeasonsModal={this.openSeasonsModal}
                deleteText="Delete Seed Company"
                deleteAction={this.deleteSeedCompany}
                history={history}
                customerProducts={customerProducts}
                // products={products.filter(
                //   (p) => p.seedCompanyId === seedCompanyId && p.seedType.toUpperCase() === seedType.toUpperCase(),
                // )}
                seasons={seasons}
                productType={seedType}
                deleteProduct={this.deleteProduct}
                isPDF={generatingPDF}
                print={this.print}
                savePageAsPdf={this.savePageAsPdf}
                toggleColumns={true}
                deliveryReceipts={deliveryReceipts}
                seedCompany={seedCompany}
                isAdmin={isAdmin === true || isAdmin === 'true'}
                tabIndex={this.getSelectedTabIndex() || 0}
                updateProduct={this.props.updateProduct}
                listProducts={this.props.listProducts}
                createProduct={this.props.createProduct}
                seedCompanyId={seedCompanyId}
              />
            ),
          };
        });
    }

    return (
      <div>
        {deleteProductConfirm}
        {deleteSeedCompanyConfirm}
        {showSeedCompanyEditModal && (
          <SeedCompanyEditModal
            classes={classes}
            onClose={this.closeEditModal}
            open={showSeedCompanyEditModal}
            seedCompany={seedCompany}
            deleteAction={this.deleteSeedCompany}
          />
        )}
        {showSeasonsModal && <SeasonsModal onClose={this.closeSeasonsModal} open={showSeasonsModal} />}
        {/* <div className={classes.titleContainer}>
          <h2 className={classes.contentTitle}>Inventory</h2>
          <span className={classes.companyName}>{seedCompany.name}</span>
          {this.state.isprint ? (
            <div className={classes.logoContainer}>
              <div className={classes.logoContainer}>
                <img
                  className={classes.logo}
                  alt={organization.logo}
                  src={`${process.env.REACT_APP_DO_BUCKET}/${organization.logo}`}
                />
              </div>
            </div>
          ) : (
            ""
          )}
        </div> */}
        <Tabs
          headerColor="gray"
          print
          selectedTab={this.getSelectedTabIndex() || 0}
          onTabChange={this.onTabChange}
          tabs={tabs}
          showPlus={isAdmin === true || isAdmin === 'true'}
          onClickPlus={this.editSeedCompany}
        />
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showSnackbar}
          message={<span>{showSnackbarText}</span>}
        />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isOnline: state.offline.online,
    products: state.productReducer.products,
    pricesheetProducts: state.pricesheetProductReducer.pricesheetproducts,
    productsStatus: state.productReducer.loadingStatus,
    monsantoRetailerOrderSummaryProducts: state.monsantoRetailerOrderSummaryReducer.products,
    monsantoRetailerOrderSummaryStatus: state.monsantoRetailerOrderSummaryReducer.loadingStatus,
    customerProducts: state.customerProductReducer.customerProducts,
    customerProductsStatus: state.customerProductReducer.loadingStatus,
    packagings: state.packagingReducer.packagings,
    packagingsStatus: state.packagingReducer.loadingStatus,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    organization: state.organizationReducer,
    apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
    userFirstName: state.userReducer.firstName,
    userLastName: state.userReducer.lastName,
    organizationId: state.userReducer.organizationId,
    seasons: state.seasonReducer.seasons,
    seasonsStatus: state.seasonReducer.loadingStatus,
    isAdmin: state.userReducer.isAdmin,
    zoneIds: state.monsantoProductReducer.zoneIds,
    customerMonsantoProduct: state.customerMonsantoProductReducer.customerMonsantoProducts,
    customerMonsantoProductStatus: state.customerMonsantoProductReducer.loadingStatus,
    monsantoFavoriteProducts: state.monsantoFavoriteProductReducer.monsantoFavoriteProducts,
    monsantoFavoriteProductsStatus: state.monsantoFavoriteProductReducer.loadingStatus,
    productDealersStatus: state.productDealerReducer.loadingStatus,
    totalItemsOfCustomers: state.customerReducer.totalItems,
  };
};
const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listProducts,
      listPricesheetProducts,
      fetchZoneIds,
      getPdfForPage,
      listCustomerProducts,
      deleteProduct,
      listPackagings,
      listSeasons,
      listSeedSizes,
      deleteSeedCompany,
      loadOrganization,
      updateCurrentSeedCompany,
      updateCurrentCropType,
      listRetailerOrderSummary,
      checkMonsantoProductsSyncState,
      updateProduct,
      createProduct,
      listCustomerMonsantoProducts,
      listMonsantoFavoriteProducts,
      listProductDealers,
      deleteApiSeedCompany,
      updatePricesheetProduct,
      updateApiSeedCompany,
      listDeliveryReceipts,
      listCustomers,
    },
    dispatch,
  );

export default withRouter(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Inventory)));
