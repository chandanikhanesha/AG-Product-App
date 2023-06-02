import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import StatementSetting from './statement_setting';

import {
  listStatementSettings,
  createStatementSetting,
  updateStatementSetting,
  deleteStatementSetting,
  listFinanceMethods,
  deleteFinanceMethod,
  listDelayProducts,
  deleteDelayProduct,
  createStatementsNow,
} from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    statementSettings: state.statementSettingReducer.statementSettings,
    statementSettingsLoadingStatus: state.statementSettingReducer.loadingStatus,
    delayProducts: state.delayProductReducer.delayProducts,
    delayProductsLoadingStatus: state.delayProductReducer.loadingStatus,
    financeMethods: state.financeMethodReducer.financeMethods,
    financeMethodsLoadingStatus: state.financeMethodReducer.loadingStatus,
    companies: state.companyReducer.companies,
    companyLoadingStatus: state.companyReducer.loadingStatus,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    seedCompaniesLoadingStatus: state.seedCompanyReducer.loadingStatus,
    organizationId: state.userReducer.organizationId,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listStatementSettings,
      createStatementSetting,
      updateStatementSetting,
      deleteStatementSetting,
      listFinanceMethods,
      deleteFinanceMethod,
      listDelayProducts,
      deleteDelayProduct,
      createStatementsNow,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(StatementSetting);
