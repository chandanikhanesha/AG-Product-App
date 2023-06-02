import AccountBoxIcon from '@material-ui/icons/AccountBox';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AssessmentIcon from '@material-ui/icons/Assessment';
import SettingsIcon from '@material-ui/icons/Settings';
import MoneyOffIcon from '@material-ui/icons/MoneyOff';

import UsersAdmin from '../../components/admin/users';
import UserProfile from '../../components/user-profile';
import Settings from '../../components/user-setting';
import OrganizationProfile from '../../components/admin/organization-profile';
import ManageMessages from '../../components/admin/manage-messages';

import Subscription from '../../screens/Subscription';

// customer
//import CustomersList from "components/customers";
import { DeliveryList } from '../../screens/purchase_order/deliveryList';
import CreateCustomer from '../../components/customers/create';
import EditCustomer from '../../components/customers/edit';
import CustomerShow from '../../components/customers/show';
import CreateShareholder from '../../components/shareholder/create';
import CreateFarm from '../../components/farm/create';

// purchase order
//import PurchaseOrderForm from "components/purchase-order/purchase_order_form_contextual";
import PurchaseOrderSummary from '../../components/purchase-order/summary';
import PurchaseOrderPackaging from '../../components/purchase-order/packaging';
import PurchaseOrderDiscountSummary from '../../components/purchase-order/discount_summary_contextual';
import CreatePurchaseOrder from '../../components/purchase-order/create';
//import Invoice from "components/invoice";

// import Inventory from '../../components/inventory'
import CreateCustomProduct from '../../components/inventory/create_custom';
import EditCustomProduct from '../../components/inventory/edit_custom';
import CreateProduct from '../../components/inventory/create';
import UpdateProduct from '../../components/inventory/edit';

// discounts
import DealerDiscounts from '../../components/discount-editor';
import CreateDealerDiscount from '../../components/discount-editor/create';
import EditDealerDiscount from '../../components/discount-editor/edit';

// reports
import DiscountsReport from '../../components/reports/discounts';
import TransferReport from '../../components/reports/transfers';
import ShipNotice from '../../screens/reports/ship_notice';
import InventoryReport from '../../screens/reports/inventory_report';
import ProfitReport from '../../screens/reports/profitReport';

import GrowerOrderReport from '../../screens/reports/growerOrderReport';
import customerReport from '../../screens/reports/customerReport';
import discountReport from '../../screens/reports/discountReport';
import seedWareHouseReport from '../../screens/reports/seedWareHouseReport';
import dealerReturnReceiveReport from '../../screens/reports/dealerReturnReceive_report';

import OrderResponseLog from '../../screens/reports/monsanto-order-response';
import DeliveryReport from '../../screens/reports/deliveries';
import NoteReport from '../../screens/reports/notes';

// packaging
import Packagings from '../../components/packaging/index';
import CreatePackaging from '../../components/packaging/create';

// seed size
import SeedSizes from '../../components/seed_size/index';
import CreateSeedSize from '../../components/seed_size/create';

//V2 Screens
// import CustomersListScreen from "screens/customers";
// import PurchaseOrderScreen from "screens/purchase_order";
// import InvoiceScreen from "screens/invoice";

//set V2 default
import CustomersList from '../../screens/customers';
import DealersList from '../../screens/dealers';
import PurchaseOrderForm from '../../screens/purchase_order';
import Invoice from '../../screens/invoice';
import InvoicePreview from '../../screens/invoice_preview';
import DeliveryListPreview from '../../screens/delivery_preview';
import BayerOrderCheck from '../../screens/bayer_order_check';
import SuperAdminInfo from '../../screens/super_admin_info';
import AddCustomer from '../../screens/customers/addCustomer';

// import SeasonScreen from "screens/season";

// discount package
import CreateDiscountPackage from '../../components/discount-packages/create';
import EditDiscountPackage from '../../components/discount-packages/edit';
import DiscountPackagesList from '../../components/discount-packages/index';

// interest charge
import InterestCharge from '../../screens/interest_charge';
import CreateInterestCharge from '../../screens/interest_charge/create_interest_charge';
import EditInterestCharge from '../../screens/interest_charge/edit_interest_charge';

//statement
import Statement from '../../screens/statement/show_statement_old';
import StatementV2 from '../../screens/statement/show_statement';
// import PreStatement from "screens/statement/previous_statement";
import StatementSetting from '../../screens/statement/statement_setting';

//print preview pages
import InventoryPreview from '../../screens/inventory_preview';

import { totalPlansGroup } from '../../utilities/subscriptionPlans';
import BayerOrderPreview from '../../screens/bayer_orders_preview';
import csvPreview from '../../screens/csv_preview';
import Announcements from '../../components/announcements';
import Tutorials from '../../components/tutorials';

import syncAll from '../../screens/purchase_order/all_sync_purchaseOrder/syncAll';
import editAllProducts from '../../screens/purchase_order/edit_all_products/edit_products';

import swapProduct from '../../components/inventory/swap_product/index';
import CheckNumber from '../../screens/check_number';
const privateRoutes = [
  {
    path: '/app/seed_companies/:id/packaging/create',
    component: CreatePackaging,
    visible: false,
    moduleName: totalPlansGroup.seed_company.label,
  },
  {
    path: '/app/seed_companies/:id/packaging',
    component: Packagings,
    visible: false,
    moduleName: totalPlansGroup.seed_company.label,
  },
  {
    path: '/app/seed_companies/:id/seed_size/create',
    component: CreateSeedSize,
    visible: false,
    moduleName: totalPlansGroup.seed_company.label,
  },
  {
    path: '/app/seed_companies/:id/seed_size',
    component: SeedSizes,
    visible: false,
    moduleName: totalPlansGroup.seed_company.label,
  },
  { path: '/app/checkNumber/:orgId', visible: false, component: CheckNumber },
  {
    path: '/app/seed_companies/:id/create',
    visible: false,
    component: CreateProduct,
    moduleName: totalPlansGroup.seed_company.label,
  },
  {
    path: '/app/seed_companies/:seedCompanyId/:id/edit',
    visible: false,
    component: UpdateProduct,
    moduleName: totalPlansGroup.seed_company.label,
  },
  {
    path: '/app/profile',
    component: UserProfile,
    visible: false,
  },

  {
    path: '/app/announcements',
    visible: false,
    component: Announcements,
  },
  {
    path: '/app/tutorials',
    visible: false,
    component: Tutorials,
  },
  {
    path: '/app/admin/users',
    component: UsersAdmin,
    exact: true,
    visible: false,
  },
  {
    path: '/app/admin/subscription',
    component: Subscription,
    exact: true,
    visible: false,
  },
  {
    path: '/app/admin/organization_profile',
    component: OrganizationProfile,
    visible: false,
    exact: true,
  },
  {
    path: '/app/admin/manage_messages',
    component: ManageMessages,
    visible: false,
    exact: true,
  },
  {
    path: '/app/customers/edit/:id',
    visible: false,
    component: EditCustomer,
  },
  {
    path: '/app/companies/:company_id/create_product',
    visible: false,
    component: CreateCustomProduct,
    moduleName: totalPlansGroup.regular_company.label,
  },
  {
    path: '/app/companies/:company_id/products/:id/edit',
    visible: false,
    component: EditCustomProduct,
    moduleName: totalPlansGroup.regular_company.label,
  },
  {
    path: '/app/setting/discount_editor/create',
    visible: false,
    component: CreateDealerDiscount,
  },
  {
    path: '/app/setting/discount_editor/:id/edit',
    visible: false,
    component: EditDealerDiscount,
  },
  {
    path: '/app/customers/addCustomer',
    visible: false,
    component: AddCustomer,
  },
  {
    path: '/app/customers',
    name: 'Customers',
    icon: AccountBoxIcon,
    component: CustomersList,
    exact: true,
  },
  {
    collapse: true,
    name: 'Inventory',
    state: 'openInventory',
    icon: AssignmentIcon,
    views: [],
  },
  {
    collapse: true,
    name: 'Reports',
    state: 'openReports',
    icon: AssessmentIcon,
    views: [
      // {
      //   path: `/app/reports/discounts`,
      //   name: 'Discounts',
      //   component: DiscountsReport,
      // },
      // {
      //   path: `/app/reports/transfers`,
      //   name: 'Transfers',
      //   component: TransferReport,
      // },
      // {
      //   path: `/app/reports/deliveries`,
      //   name: 'Deliveries',
      //   component: DeliveryReport,
      // },
      {
        path: `/app/reports/notes`,
        name: 'Notes',
        component: NoteReport,
      },

      // {
      //   path: `/app/reports/order-response-logs`,
      //   name: 'Order Response Logs',
      //   component: OrderResponseLog,
      // },
      {
        path: `/app/reports/inventory_report`,
        name: 'Inventory Report',
        component: InventoryReport,
      },
      {
        path: `/app/reports/profit_report`,
        name: 'Profit Report',
        component: ProfitReport,
      },
      {
        path: `/app/reports/growerOrder_report`,
        name: 'Grower Order Report',
        component: GrowerOrderReport,
      },
      { path: `/app/reports/customer_report`, name: 'Customer Report', component: customerReport },
      { path: `/app/reports/discount_report`, name: 'Discount Report', component: discountReport },
      // {
      //   path: `/app/reports/seedWareHouse_report`,
      //   name: 'SeedWareHouse Report',
      //   component: seedWareHouseReport,
      // },
      { path: `/app/reports/bayer_orders_preview/all`, name: 'SeedWarehouse Report', component: BayerOrderPreview },

      {
        path: `/app/reports/dealer_Return_Receive_report`,
        name: 'DealerReturenReceive Report',
        component: dealerReturnReceiveReport,
      },
    ],
  },
  // {
  //   path: "/app/statement",
  //   name: "Statement",
  //   component: PreStatement,
  //   icon: AssignmentIcon,
  //   exact: true
  // },

  {
    path: '/app/setting/interest_charge/create',
    visible: false,
    component: CreateInterestCharge,
  },
  {
    collapse: true,
    name: 'Settings',
    state: 'openSettings',
    icon: SettingsIcon,
    views: [
      // {
      //   path: "/app/setting/statement_setting",
      //   name: "Statements",
      //   component: StatementSetting,
      //   icon: AssignmentIcon,
      //   exact: true
      // },
      // {
      //   path: "/app/setting/interest_charge",
      //   name: "Finance Charges",
      //   icon: MoneyOffIcon,
      //   component: InterestCharge,
      //   exact: true
      // },
      {
        path: '/app/setting/discount_editor',
        name: 'Discount Editor',
        icon: MoneyOffIcon,
        component: DealerDiscounts,
      },
      {
        path: '/app/setting/discount_packages',
        component: DiscountPackagesList,
        name: 'Discount Package',
        icon: MoneyOffIcon,
        // },
        // {
        //   path: "/app/setting/season",
        //   name: "Seasons",
        //   component: SeasonScreen,
        //   icon: MoneyOffIcon
      },
    ],
  },
  {
    path: '/app/setting/interest_charge/:id/edit',
    visible: false,
    component: EditInterestCharge,
  },
  // {
  //   path: '/app/discount_packages',
  //   name: 'Discount Packages',
  //   icon: MonetizationOn,
  //   component: DiscountPackages
  // },
  {
    path: '/app/discount_packages/create',
    visible: false,
    component: CreateDiscountPackage,
  },
  {
    path: '/app/discount_packages/:package_id/edit',
    visible: false,
    component: EditDiscountPackage,
  },
  {
    path: '/app/customers/create',
    component: CreateCustomer,
    visible: false,
    exact: true,
  },
  {
    path: '/app/customers/:customer_id/quote/new',
    visible: false,
    component: CreatePurchaseOrder,
  },
  {
    path: '/app/customers/:customer_id/purchase_order/new',
    visible: false,
    component: CreatePurchaseOrder,
  },
  {
    path: '/app/customers/:customer_id/purchase_order/:id/summary',
    visible: false,
    component: PurchaseOrderSummary,
  },
  {
    path: '/app/customers/:customer_id/purchase_order/:id/packaging',
    visible: false,
    component: PurchaseOrderPackaging,
  },
  {
    path: '/app/customers/:customer_id/purchase_order/:id/discount_summary',
    visible: false,
    component: PurchaseOrderDiscountSummary,
  },
  {
    path: '/app/customers/:customer_id/purchase_order/:id/deliveries',
    visible: false,
    component: DeliveryList,
  },

  {
    path: '/app/customers/:customer_id/purchase_order/:id',
    visible: false,
    component: PurchaseOrderForm,
  },
  {
    path: '/app/customers/:customer_id/quote/:id',
    visible: false,
    component: PurchaseOrderForm,
  },
  {
    path: '/app/customers/:customer_id/invoice/:id',
    visible: false,
    component: Invoice,
  },
  {
    path: '/app/customers/:customer_id/preview/:id',
    visible: false,
    component: InvoicePreview,
  },
  {
    path: '/app/customers/:customer_id/delivery_preview/:purchase_order/print',
    visible: false,
    component: DeliveryListPreview,
  },
  {
    path: '/app/customers/:customer_id/old_statement/:id',
    visible: false,
    component: Statement,
  },
  {
    path: '/app/customers/:customer_id/statement/:id',
    visible: false,
    component: StatementV2,
  },
  {
    path: '/app/customers/:customer_id/shareholders/create',
    visible: false,
    component: CreateShareholder,
    exact: true,
  },
  {
    path: '/app/customers/:customer_id/farms/create',
    visible: false,
    component: CreateFarm,
  },
  {
    path: '/app/customers/:id',
    visible: false,
    component: CustomerShow,
  },

  // {
  //   path: '/app/bayer_order_check',
  //   visible: false,
  //   //   name: "Bayer Order Check",
  //   component: BayerOrderCheck,
  //   exact: true,
  //   //   icon: AccountBoxIcon,
  // },

  {
    path: '/app/dealers',
    visible: false,
    component: DealersList,
    exact: true,
  },
  {
    path: '/app/dealers/create',
    component: CreateCustomer,
    visible: false,
    exact: true,
  },
  {
    path: '/app/dealers/:customer_id/quote/new',
    visible: false,
    component: CreatePurchaseOrder,
  },
  {
    path: '/app/dealers/:customer_id/purchase_order/new',
    visible: false,
    component: CreatePurchaseOrder,
  },
  {
    path: '/app/dealers/:customer_id/purchase_order/:id/summary',
    visible: false,
    component: PurchaseOrderSummary,
  },
  {
    path: '/app/dealers/:customer_id/purchase_order/:id/packaging',
    visible: false,
    component: PurchaseOrderPackaging,
  },
  {
    path: '/app/dealers/:customer_id/purchase_order/:id/discount_summary',
    visible: false,
    component: PurchaseOrderDiscountSummary,
  },
  {
    path: '/app/dealers/:customer_id/purchase_order/:id/deliveries',
    visible: false,
    component: DeliveryList,
  },
  {
    path: '/app/dealers/:customer_id/purchase_order/:id',
    visible: false,
    component: PurchaseOrderForm,
    exact: true,
  },
  {
    path: '/app/dealers/:customer_id/quote/:id',
    visible: false,
    component: PurchaseOrderForm,
  },
  {
    path: '/app/dealers/:customer_id/invoice/:id',
    visible: false,
    component: Invoice,
  },
  {
    path: '/app/dealers/:customer_id/preview/:id',
    visible: false,
    component: InvoicePreview,
  },
  {
    path: '/app/dealers/:customer_id/old_statement/:id',
    visible: false,
    component: Statement,
  },
  {
    path: '/app/dealers/:customer_id/statement/:id',
    visible: false,
    component: StatementV2,
  },
  {
    path: '/app/dealers/:customer_id/shareholders/create',
    visible: false,
    component: CreateShareholder,
    exact: true,
  },
  {
    path: '/app/dealers/:customer_id/farms/create',
    visible: false,
    component: CreateFarm,
  },
  {
    path: '/app/dealers/:id',
    visible: false,
    component: CustomerShow,
  },

  {
    path: '/app/inventory_preview/:company_type/:company_id/:tab_id',
    visible: false,
    component: InventoryPreview,
  },
  {
    path: '/app/settings',
    visible: false,
    component: Settings,
  },

  {
    path: '/app/bayer_orders_preview/:seedcompany_id',
    visible: false,
    component: BayerOrderPreview,
  },
  {
    path: '/app/purchaseOrder/syncAll',
    visible: false,
    component: syncAll,
  },

  {
    path: '/app/:customer_id/purchaseOrder/editAllProducts/:id',
    visible: false,
    component: editAllProducts,
  },
  {
    path: '/app/swapProduct/:seedId/:id/:crossRefId',
    visible: false,
    component: swapProduct,
  },

  {
    path: '/app/csv_preview/:reportname',
    visible: false,
    component: csvPreview,
  }, // // V2 Screen
  // {
  //   path: "/app/v2/customers",
  //   component: CustomersListScreen,
  //   exact: true,
  //   visible: false
  // },
  // {
  //   path: "/app/v2/customers/:customer_id/purchase_order/:id",
  //   visible: false,
  //   component: PurchaseOrderScreen
  // },
  // {
  //   path: "/app/v2/customers/:customer_id/quote/:id",
  //   visible: false,
  //   component: PurchaseOrderScreen
  // },
  // {
  //   path: "/app/v2/customers/:customer_id/invoice/:id",
  //   visible: false,
  //   component: InvoiceScreen
  // },
];

const superAdminRoutes = [
  {
    path: '/app/super_admin',
    name: 'Super Admin',
    icon: AccountBoxIcon,
    component: SuperAdminInfo,
    exact: true,
  },
];

export default localStorage.getItem('isSuperAdmin') === 'true' ? superAdminRoutes : privateRoutes;
