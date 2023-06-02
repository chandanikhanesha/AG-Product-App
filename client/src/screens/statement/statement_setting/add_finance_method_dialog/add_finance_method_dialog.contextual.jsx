import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AddFinaceMethodDialog from './add_finance_method_dialog';

import { createFinanceMethod } from '../../../../store/actions';

const mapStateToProps = (state) => {
  return {
    companies: state.companyReducer.companies,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    organizationId: state.userReducer.organizationId,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createFinanceMethod,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(AddFinaceMethodDialog);
