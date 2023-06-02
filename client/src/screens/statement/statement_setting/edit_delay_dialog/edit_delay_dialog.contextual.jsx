import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import EditDelayDialog from './edit_delay_dialog';

import { updateDelayProduct } from '../../../../store/actions';

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
      updateDelayProduct,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(EditDelayDialog);
