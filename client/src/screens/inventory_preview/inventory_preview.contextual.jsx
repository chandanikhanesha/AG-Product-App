import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import InventoryPreview from './inventory_preview';

import {
  listProducts,
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
} from '../../store/actions';

const mapStateToProps = (state) => {
  return {
    isOnline: state.offline.online,
    products: state.productReducer.products,
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
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listProducts,
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
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(InventoryPreview);
