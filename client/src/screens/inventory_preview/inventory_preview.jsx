import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router-dom';
import qs from 'qs';

// core components
import CircularProgress from '@material-ui/core/CircularProgress';
import Print from '@material-ui/icons/Print';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Card from '../../components/material-dashboard/Card/Card';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import Tabs from '../../components/material-dashboard/CustomTabs/CustomTabs';
import PrintHelper from './print_helper';

// import sweetAlertStyle from "assets/jss/material-dashboard-pro-react/views/sweetAlertStyle";

import ProductTable from './product_table';
import ApiProductTable from './monsanto_product_table';
import { createPDFTableLayout } from '../../utilities/pdf/tableGenerator';

import { isUnloadedOrLoading } from '../../utilities';

import { styles } from './inventory_preview.styles';

const MONSANTO_SEED_TYPES = [
  'CORN',
  'SOYBEAN',
  'SORGHUM',
  // 'ALFALFA',
  'CANOLA',
];
const SEED_TYPES_CODES = ['C', 'B', 'S', 'L', 'P'];

const DEFAULT_TABS = {
  CORN: 0,
  SOYBEAN: 1,
  SORGHUM: 2,
  // ALFALFA: 3,
  CANOLA: 4,
  PACKAGING: 5,
};

class InventoryPreview extends Component {
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
  };

  updateSelectedZone = (e) => {
    const selectedZoneId = e.target.value;
    this.setState({ selectedZoneId }, this.fetchMonsantoData);
  };

  componentWillMount() {
    console.log(this.props.match.params);
    const seedCompanyId = parseInt(this.props.match.params.company_id, 10);
    this.setState({ seedCompanyId }, () => this.props.updateCurrentSeedCompany(seedCompanyId));
  }

  componentDidMount = async () => {
    const {
      match: {
        params: { tab_id },
      },
      organizationId,
    } = this.props;

    await this.props.listProducts();
    await this.props.listCustomerProducts();
    await this.props.listPackagings();
    await this.props.listSeedSizes();
    await this.props.listSeasons();
    await this.props.listCustomerMonsantoProducts();
    await this.props.loadOrganization(organizationId);
    await this.props.listProductDealers();
    if (this.isApiSeedCompany) this.props.listMonsantoFavoriteProducts();

    if (!tab_id) {
      this.onTabChange(0);
    } else {
      this.fetchMonsantoData();
    }
  };

  async fetchZoneIds(selectedTabIndex) {
    if (!selectedTabIndex) selectedTabIndex = this.getSelectedTabIndex();
    if (!this.state.areZoneIdsFetched) {
      const cropType = SEED_TYPES_CODES[selectedTabIndex];
      const zoneIds = await this.props.fetchZoneIds(cropType);
      await this.setState({
        areZoneIdsFetched: true,
        selectedZoneId: this.props.zoneIds[0],
      });
      return zoneIds;
    }
    return this.state.zoneIds;
  }
  async fetchMonsantoData() {
    const { isSynced, seedCompanyId, selectedZoneId } = this.state;
    if (this.isApiSeedCompany) {
      if (isSynced === null) {
        try {
          this.setShowSnackbar('Checking Bayer Product Synced State');
          const { isSynced } = await this.props.checkMonsantoProductsSyncState({
            seedCompanyId,
          });
          this.setShowSnackbar(isSynced ? 'Bayer Product Synced' : 'Bayer Product Not Synced');
          this.setState({ isSynced });
        } catch (err) {
          console.log(err);
        }
      } else if (isSynced === true) {
        this.setShowSnackbar('Fetching Bayer Product List');
        if (selectedZoneId === '') {
          this.fetchZoneIds();
          this.fetchMonsantoProductList();
        } else {
          this.fetchMonsantoProductList();
        }
        this.setShowSnackbar('Fetch Bayer Product List Done');
      }
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const {
      match: {
        params: { company_id, company_type, tab_id },
      },
    } = this.props;
    const {
      match: {
        params: { company_id: previous_company_id, company_type: previous_company_type, tab_id: previous_tab_id },
      },
    } = prevProps;
    const { isSynced } = this.state;
    const hasQueryChanged =
      company_id !== previous_company_id || company_type !== previous_company_type || tab_id !== previous_tab_id;
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
    if (this.isApiSeedCompany) {
      storeStatus.push(this.props.customerMonsantoProductStatus);
      storeStatus.push(this.props.monsantoFavoriteProductsStatus);
    }
    if (this.isApiSeedCompany && isSynced) {
      storeStatus.push(this.props.monsantoRetailerOrderSummaryStatus);
    }
    return isOnline && isSynced === null && storeStatus.some(isUnloadedOrLoading);
  }

  getProductName(tabIndex) {
    const productTab = Object.keys(DEFAULT_TABS)
      .map((key) => {
        return {
          name: key,
          index: DEFAULT_TABS[key],
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

  print = () => {
    setTimeout(() => {
      window.print();
    }, 500);
  };

  onTabChange = async (selectedTabIndex) => {
    this.props.history.push(
      `/app/inventory_preview/${this.isApiSeedCompany ? 'api_seed_companies' : 'seed_company'}/${
        this.props.match.params.company_id
      }/${selectedTabIndex}`,
    );
    if (this.isApiSeedCompany) {
      await this.fetchZoneIds(selectedTabIndex);
      this.fetchMonsantoProductList(selectedTabIndex);
    }
  };

  fetchMonsantoProductList = (selectedTabIndex) => {
    if (!selectedTabIndex) selectedTabIndex = this.getSelectedTabIndex();
    const { listRetailerOrderSummary, updateCurrentCropType } = this.props;
    const { seedCompanyId, selectedZoneId } = this.state;
    const cropType = SEED_TYPES_CODES[selectedTabIndex];

    listRetailerOrderSummary({
      cropType,
      seedCompanyId,
      zoneId: selectedZoneId,
    }).then(() => updateCurrentCropType(cropType));
  };

  getSelectedTabIndex() {
    const {
      match: {
        params: { tab_id },
      },
    } = this.props;

    return tab_id ? parseInt(tab_id, 10) : 0;
  }

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

  get isApiSeedCompany() {
    return this.props.match.params.company_type === 'api_seed_companies';
  }

  render() {
    const { generatingPDF, seedCompanyId, isSynced, selectedZoneId } = this.state;
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
      isOnline,
      isAdmin,
      zoneIds,
      customerMonsantoProduct,
    } = this.props;

    if (this.isLoading || generatingPDF) return <CircularProgress />;
    const selectedTab = this.getSelectedTabIndex() || 0;
    if (!isSynced && this.isApiSeedCompany)
      return (
        <div className={classes.syncingContainer}>
          <CircularProgress />
          <h3 className={classes.textCenter}>
            <p>Fetching your bucket</p>
            <p>from Monsanto...</p>
          </h3>
          <p className={classes.textCenter}>
            Meanwhile, you could carry on with other tasks in Agridealer, we will keep your bucket ready when you are
            back.{' '}
          </p>
        </div>
      );
    // if (isSynced === true && this.isApiSeedCompany) return <h1> dsafsad</h1>

    let tabs;
    let seedCompany = (this.isApiSeedCompany ? apiSeedCompanies : seedCompanies).find((sc) => sc.id === seedCompanyId);
    const cropTypes = this.isApiSeedCompany
      ? MONSANTO_SEED_TYPES.map((type) => type.toLowerCase())
      : Object.keys(JSON.parse(seedCompany.metadata));
    if (this.isApiSeedCompany) {
      tabs = cropTypes
        .filter((seedType) => seedCompany[`${seedType}BrandName`].trim() !== '')
        .map((seedType) => {
          return {
            tabName: seedCompany[`${seedType}BrandName`],
            tabContent: (
              <ApiProductTable
                editable={true}
                editText="Edit Seed Company"
                editAction={this.editSeedCompany}
                deleteText="Delete Seed Company"
                deleteAction={this.deleteSeedCompany}
                history={history}
                customerProducts={customerProducts}
                customerMonsantoProduct={customerMonsantoProduct}
                products={monsantoRetailerOrderSummaryProducts}
                isOnline={isOnline}
                productType={seedType}
                deleteProduct={this.deleteProduct}
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
              />
            ),
          };
        });
    } else {
      const metadata = JSON.parse(seedCompany.metadata);
      tabs = cropTypes
        .filter((seedType) => metadata[seedType].brandName.trim() !== '')
        .map((seedType) => {
          return {
            tabName: seedCompany[`${seedType}BrandName`],
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
                products={products.filter(
                  (p) => p.seedCompanyId === seedCompanyId && p.seedType.toUpperCase() === seedType.toUpperCase(),
                )}
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
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <PrintHelper />
        <Button
          className={`${classes.printButton} hide-print`}
          style={{ height: 50 }}
          onClick={this.print}
          color="info"
        >
          <Print />
        </Button>
        <div id="inventory_preview" className={classes.printContainer}>
          <div className={classes.titleContainer}>
            <h2 className={classes.contentTitle}>Inventory</h2>
            <span className={classes.companyName}>{seedCompany.name}</span>
            <div className={classes.logoContainer}>
              <img
                className={classes.logo}
                alt={organization.logo}
                src={`${process.env.REACT_APP_DO_BUCKET}/${organization.logo}`}
              />
            </div>
          </div>
          <Card>
            <CardBody>{tabs[selectedTab].tabContent}</CardBody>
          </Card>
        </div>
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(InventoryPreview));
