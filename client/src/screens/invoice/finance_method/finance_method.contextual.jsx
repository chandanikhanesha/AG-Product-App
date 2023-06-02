import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import FinanceMethod from './finance_method';

import { listFinanceMethods } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
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
      listFinanceMethods,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(FinanceMethod);
