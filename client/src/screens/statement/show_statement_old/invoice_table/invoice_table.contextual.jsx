import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import InvoiceTable from './invoice_table';

import {
  listAllCustomProducts,
  listCompanies,
  listCustomerCustomProducts,
  listCustomerProducts,
  listCustomers,
  listDealerDiscounts,
  listProducts,
  listPayments,
  listProductPackagings,
  listPurchaseOrders,
  listPurchaseOrderStatements,
  listPackagings,
  listSeedCompanies,
  listSeedSizes,
  listStatements,
  listShareholders,
  getStatementById,
  deleteStatement,
  loadOrganization,
  getCustomerShareholders,
  updatePurchaseOrderStatement,
} from '../../../../store/actions';

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listStatements,
      listPurchaseOrders,
      listPurchaseOrderStatements,
      getStatementById,
      deleteStatement,
      listCustomerProducts,
      listCustomers,
      listShareholders,
      loadOrganization,
      listDealerDiscounts,
      listProducts,
      listAllCustomProducts,
      listSeedCompanies,
      listPayments,
      listCompanies,
      listCustomerCustomProducts,
      listProductPackagings,
      listSeedSizes,
      listPackagings,
      getCustomerShareholders,
      updatePurchaseOrderStatement,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(InvoiceTable);
