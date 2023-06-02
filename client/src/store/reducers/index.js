import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import userReducer from './user';
import organizationReducer from './organization';
import customerReducer from './customer';
import customProductReducer from './custom_product';
import productReducer from './product';
import dealerDiscountReducer from './dealer_discount';
import backupDiscountReducer from './backup_discount_reducer';
import backupCustomerReducer from './backup_customer_reducer';
import backupCustomerHistoryReducer from './backup_customer_history';
import customerProductReducer from './customer_product';
import customerMonsantoProductReducer from './customer_monsanto_product';
import customerCustomProductReducer from './customer_custom_product';
import deliveryReceiptReducer from './delivery_receipt';
import purchaseOrderReducer from './purchase_order';
import companyReducer from './company';
import seedCompanyReducer from './seed_company';
import apiSeedCompanyReducer from './api_seed_company';
import seasonReducer from './season';
import monsantoProductReducer from './monsanto/monsanto_product'; //TODO: check if needed
import monsantoRetailerOrderSummaryReducer from './monsanto/monsanto_retailer_order_summary';
import discountPackageReducer from './discount_package';
import packagingReducer from './packaging';
import notificationReducer from './notification.reducer';
import shareholderReducer from './shareholder';
import farmReducer from './farm';
import paymentReducer from './payment';
import seedSizeReducer from './seed_size';
import reportReducer from './report';
import productPackagingReducer from './product_packaging';
import interestChargeReducer from './interest_charge';
import statementReducer from './statement';
import purchaseOrderStatementReducer from './purchase_order_statement';
import statementSettingReducer from './statement_setting';
import financeMethodReducer from './finance_method';
import delayProductReducer from './delay_product';
import monsantoFavoriteProductReducer from './monsanto/monsanto_favorite_product';
import productDealerReducer from './product_dealer';
import noteReducer from './note';
import subscriptionReducer from './subscription';
import pricesheetProductReducer from './pricesheet_products';
import bayerOrderCheckReducer from './bayer_order_check';
import shipNoticeReducer from './ship_notice';
import orderResponseReducer from './order_response';
import summarySyncHistoryReducer from './summary_sync_history';
import discountReportReducer from './discountReport';
import customerReturnProductReducer from './customer_return_product';

const rootReducer = combineReducers({
  userReducer,
  organizationReducer,
  customerReducer,
  customProductReducer,
  productReducer,
  dealerDiscountReducer,
  backupDiscountReducer,
  backupCustomerReducer,
  customerProductReducer,
  customerMonsantoProductReducer,
  router: routerReducer,
  customerCustomProductReducer,
  deliveryReceiptReducer,
  purchaseOrderReducer,
  companyReducer,
  seedCompanyReducer,
  apiSeedCompanyReducer,
  monsantoProductReducer, //TODO: check if needed
  monsantoRetailerOrderSummaryReducer,
  discountPackageReducer,
  packagingReducer,
  notificationReducer,
  shareholderReducer,
  farmReducer,
  paymentReducer,
  seedSizeReducer,
  reportReducer,
  productPackagingReducer,
  seasonReducer,
  interestChargeReducer,
  statementReducer,
  purchaseOrderStatementReducer,
  statementSettingReducer,
  financeMethodReducer,
  delayProductReducer,
  monsantoFavoriteProductReducer,
  productDealerReducer,
  noteReducer,
  subscriptionReducer,
  pricesheetProductReducer,
  bayerOrderCheckReducer,
  shipNoticeReducer,
  orderResponseReducer,
  summarySyncHistoryReducer,
  discountReportReducer,
  backupCustomerHistoryReducer,
  customerReturnProductReducer,
});

export default rootReducer;
