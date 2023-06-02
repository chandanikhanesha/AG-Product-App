import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { withRouter } from 'react-router-dom';

// core components
import Tabs from '../../components/material-dashboard/CustomTabs/CustomTabs';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Grow from '@material-ui/core/Grow';

import sweetAlertStyle from '../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';
import TransferProductTable from './transferProductTable';
import { createPDFTableLayout } from '../../utilities/pdf/tableGenerator';

import {
  listProducts,
  listCustomerProducts,
  getPdfForPage,
  listPackagings,
  listSeedSizes,
  loadOrganization,
} from '../../store/actions';
import { isUnloadedOrLoading } from '../../utilities';

const FADE_DURATION = 500;

const styles = (theme) =>
  Object.assign(
    {},
    {
      select: {
        width: 200,
      },
      selectWrapper: {
        marginRight: 20,
      },
      secondaryCta: {
        marginLeft: 20,
      },
      contentTitle: {
        lineHeight: '1.333333333333',
        fontSize: 18,
        fontWeight: 400,
        margin: '0 0 6px 0',
        color: '#777',
      },
      companyName: {
        lineHeight: `1.3625`,
        fontSize: 36,
      },
    },
    sweetAlertStyle,
  );

const seedMap = {
  corn: 'CORN',
  Soybean: 'SOYBEAN',
  sorghum: 'SORGHUM',
  // alfalfa: 'ALFALFA',
  canola: 'CANOLA',
};

const SEED_TYPES = [
  'SOYBEAN',
  'SORGHUM',
  'CORN',
  // 'ALFALFA',
  'CANOLA',
];
const DEFAULT_TABS = {
  SOYBEAN: 0,
  SORGHUM: 1,
  CORN: 2,
  // ALFALFA: 3,
  CANOLA: 4,
};

class TransferInfo extends Component {
  state = {
    productType: '',
    generatingPDF: false,
    seedCompanyId: null,
    selectedTab: 0,
  };

  componentDidMount() {
    const { listProducts, listCustomerProducts, listPackagings, listSeedSizes, loadOrganization, organizationId } =
      this.props;

    listProducts();
    listCustomerProducts();
    listPackagings();
    listSeedSizes();
    loadOrganization(organizationId);
  }

  get isLoading() {
    const { isOnline, productsStatus, customerProductsStatus, seedCompanyStatus } = this.props;
    return isOnline && [customerProductsStatus, productsStatus, seedCompanyStatus].some(isUnloadedOrLoading);
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
    const { organization, userFirstName, userLastName, products, seedCompanies, customerProducts, deliveryReceipts } =
      this.props;
    const { selectedTab } = this.state;
    const seedType = SEED_TYPES[selectedTab];
    const productType = seedType.charAt(0) + seedType.substring(1).toLowerCase();
    const transferProducts = this.getTransferProducts(products, this.state.seedCompanyId);

    this.setState(
      {
        generatingPDF: true,
      },
      () => {
        createPDFTableLayout({
          company: seedCompanies.find((c) => c.id === this.state.seedCompanyId),
          tableData: transferProducts.filter((p) => p.seedType === seedType),
          customerProducts: customerProducts,
          deliveryReceiptDetails: deliveryReceipts,
          productType: this.productTypeFromSeedType(productType).toLowerCase(),
          organization,
          userFirstName,
          userLastName,
          pdfType: 'Transfers_Report',
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

  handleSelectChange = (event) => {
    this.setState({
      seedCompanyId: event.target.value,
    });
  };

  onTabChange(selectedTabIndex) {
    this.setState({
      selectedTab: selectedTabIndex,
    });
  }

  getTransferProducts = (products, seedCompanyId) => {
    /**
     * Filter products array to only products with transferInfo
     */
    const filteredProducts = products
      .filter((p) => p.seedCompanyId === seedCompanyId && p.lots.some((lot) => lot.transferInfo != null))
      .map((p) => ({
        ...p,
        transfers: p.lots.filter((lot) => lot.transferInfo),
      }));

    /**
     * Reduce products array to a new array with items for each transfer that has occured.
     */
    return filteredProducts.reduce((acc, product) => {
      if (!product.transfers) {
        acc.push(product);
        return acc;
      }
      if (product.transfers && product.transfers.length > 0) {
        product.transfers.forEach((t) => {
          const pObj = {
            ...product,
            ...t,
          };
          acc.push(pObj);
        });
      }
      return acc;
    }, []);
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
        return 'canola';
      default:
        return console.error('No product type for : ', seedType);
    }
  };

  render() {
    const { generatingPDF, seedCompanyId, selectedTab } = this.state;
    const { classes, products, customerProducts, history, deliveryReceipts, seedCompanies } = this.props;
    let tabs;
    let seedCompany;

    const transferProducts = this.getTransferProducts(products, seedCompanyId);

    if (this.isLoading || generatingPDF) return <CircularProgress />;

    if (seedCompanyId) {
      seedCompany = seedCompanies.find((sc) => sc.id === seedCompanyId);
      tabs = ['Soybean', 'Sorghum', 'Corn']
        .filter((seedType) => {
          return seedCompany[`${seedType.toLowerCase()}BrandName`].trim() !== '';
        })
        .map((seedType) => {
          return {
            tabName: seedCompany[`${seedType.toLowerCase()}BrandName`],
            tabContent: (
              <TransferProductTable
                history={history}
                customerProducts={customerProducts}
                productType={this.productTypeFromSeedType(seedType)}
                products={transferProducts}
                print={this.print}
                savePageAsPdf={this.savePageAsPdf}
                isPDF={generatingPDF}
                toggleColumns={true}
                deliveryReceipts={deliveryReceipts}
                seedCompany={seedCompany}
                tabIndex={selectedTab}
                seedMap={seedMap}
              />
            ),
          };
        });
    }

    return (
      <div>
        <h2 className={classes.contentTitle}>Transfers</h2>
        {seedCompanyId ? (
          <React.Fragment>
            <span className={classes.companyName}>{seedCompany.name}</span>
            <Grow in={seedCompanyId === true} timeout={FADE_DURATION}>
              <Tabs
                headerColor="gray"
                selectedTab={selectedTab}
                onTabChange={this.onTabChange.bind(this)}
                tabs={tabs}
              />
            </Grow>
          </React.Fragment>
        ) : (
          <FormControl className={classes.selectWrapper}>
            <InputLabel htmlFor="company">Company</InputLabel>
            <Select
              value={(seedCompany = seedCompanies.find((sc) => sc.id === seedCompanyId) || '')}
              onChange={this.handleSelectChange}
              autoWidth
              inputProps={{
                className: classes.select,
                required: true,
                name: 'company',
                id: 'company',
              }}
            >
              {seedCompanies.map((seedCompany) => (
                <MenuItem className="seedCompany" value={seedCompany.id} key={`seedCompany-${seedCompany.id}`}>
                  {seedCompany.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isOnline: state.offline.online,
    products: state.productReducer.products,
    productsStatus: state.productReducer.loadingStatus,
    customerProducts: state.customerProductReducer.customerProducts,
    customerProductsStatus: state.customerProductReducer.loadingStatus,
    packagings: state.packagingReducer.packagings,
    packagingsStatus: state.packagingReducer.loadingStatus,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    seedCompanyStatus: state.seedCompanyReducer.loadingStatus,
    organization: state.organizationReducer,
    userFirstName: state.userReducer.firstName,
    userLastName: state.userReducer.lastName,
    organizationId: state.userReducer.organizationId,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listProducts,
      getPdfForPage,
      listCustomerProducts,
      listPackagings,
      listSeedSizes,
      loadOrganization,
    },
    dispatch,
  );

export default withRouter(withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(TransferInfo)));
