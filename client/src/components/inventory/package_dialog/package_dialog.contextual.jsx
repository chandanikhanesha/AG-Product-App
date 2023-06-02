import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import PackageDialog from './package_dialog';

import { listPackagings, createPackaging, updatePackaging, deletePackaging } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    packagings: state.packagingReducer.packagings,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ listPackagings, createPackaging, updatePackaging, deletePackaging }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(PackageDialog);
