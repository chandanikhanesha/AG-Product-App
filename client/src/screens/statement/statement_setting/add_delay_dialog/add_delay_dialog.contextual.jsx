import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import AddDelayDialog from './add_delay_dialog';

import { createDelayProduct } from '../../../../store/actions';

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
      createDelayProduct,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(AddDelayDialog);
