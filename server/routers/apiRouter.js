const { Router } = require('express');

const testController = require('controllers/TestController');
const authController = require('controllers/AuthController');
const pdfController = require('controllers/PdfController');
const usersController = require('controllers/UsersController');
const organizationsController = require('controllers/OrganizationsController');
const customersController = require('controllers/CustomersController');
const customProductsController = require('controllers/CustomProductsController');
const productsController = require('controllers/ProductsController');
const dealerDiscountsController = require('controllers/DealerDiscountsController');
const interestChargeController = require('../controllers/InterestChargeController');
const purchaseOrdersController = require('controllers/PurchaseOrdersController');
const companiesController = require('controllers/CompaniesController');
const seedCompaniesController = require('controllers/SeedCompaniesController');
const apiSeedCompaniesController = require('controllers/ApiSeedCompaniesController');
const discountPackagesController = require('controllers/DiscountPackagesController');
const createPdfController = require('controllers/CreatePdfController');
const packagingsController = require('controllers/PackagingsController');
const seedSizesController = require('controllers/SeedSizesController');
const reportsController = require('controllers/ReportsController');
const productPackagingsController = require('controllers/ProductPackagingsController');
const seasonsController = require('controllers/SeasonController');
const purchaseorderstatementContorller = require('controllers/PurchaseOrderStatementsController');
const statementController = require('controllers/StatementController');
const statementSettingController = require('controllers/StatementSettingController');
const financeMethodController = require('controllers/FinanceMethodController');
const delayProductsController = require('controllers/DelayProductsController');
const productDealersController = require('controllers/ProductDealersController');
const NoteController = require('controllers/NotesController');
const InvoiceSendContoller = require('controllers/InvoiceSendContoller');
const TestDataCheckContoller = require('controllers/TestDataCheckContoller');
const DiscountReportContoller = require('controllers/DiscountReportContoller');
const BackupController = require('controllers/BackupController');
const ForgotPasswordController = require('controllers/ForgotPasswordController');
const AppStatusCheck = require('controllers/AppStatusCheck');
const BannerMsg = require('controllers/BannerMsgController');
const CustomerReturnController = require('controllers/CustomerReturnController');
const TutorialController = require('controllers/TutorialController');

const monsantoRouter = require('routers/monsanto');
module.exports = Router()
  .use('/test', testController)
  .use('/api/auth', authController)
  .use('/api/users', usersController) // swagger doneﬂ
  .use('/api/invoice/create_pdf', pdfController)
  .use('/api/create_pdf', createPdfController)
  .use('/api/customers', customersController) // swagger done
  .use('/api/custom_products', customProductsController) // swagger done
  .use('/api/products', productsController) // swagger done
  .use('/api/dealer_discounts', dealerDiscountsController) // swagger done
  .use('/api/setting/interest_charge', interestChargeController)
  .use('/api/purchase_orders', purchaseOrdersController)
  .use('/api/companies', companiesController)
  .use('/api/api_seed_companies', apiSeedCompaniesController)
  .use('/api/seed_companies', seedCompaniesController)
  .use('/api/organizations', organizationsController)
  .use('/api/setting/discount_packages', discountPackagesController)
  .use('/api/packagings', packagingsController)
  .use('/api/seed_sizes', seedSizesController)
  .use('/api/reports', reportsController)
  .use('/api/product_packagings', productPackagingsController)
  .use('/api/seasons', seasonsController)
  .use('/api/monsanto', monsantoRouter)
  .use('/api/statement', statementController)
  .use('/api/purchase_order_statements', purchaseorderstatementContorller)
  .use('/api/setting/statement_setting', statementSettingController)
  .use('/api/setting/statement_setting/finance_method', financeMethodController)
  .use('/api/setting/statement_setting/delay_product', delayProductsController)
  .use('/api/product_dealers', productDealersController)
  .use('/api/notes', NoteController)
  .use('/api/invoiceSend', InvoiceSendContoller)
  .use('/api/discountReport', DiscountReportContoller)
  .use('/api/testDataCheck', TestDataCheckContoller)
  .use('/api/backup_data', BackupController)
  .use('/api/forgot_pass', ForgotPasswordController)
  .use('/api/AppStatusCheck', AppStatusCheck)
  .use('/api/bannerMsg', BannerMsg)
  .use('/api/tutorial', TutorialController)
  .use('/api/customer_return_products', CustomerReturnController);
