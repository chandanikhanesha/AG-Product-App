import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import EditFinaceMethodDialog from './edit_finance_method_dialog';

import { updateFinanceMethod } from '../../../../store/actions';

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
      updateFinanceMethod,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(EditFinaceMethodDialog);
