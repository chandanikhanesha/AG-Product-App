import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import SeedSizeDialog from './seed_size_dialog';

import { listSeedSizes, createSeedSize, updateSeedSize, deleteSeedSize } from '../../../store/actions';

const mapStateToProps = (state) => {
  return {
    seedSizes: state.seedSizeReducer.seedSizes,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators({ listSeedSizes, createSeedSize, updateSeedSize, deleteSeedSize }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(SeedSizeDialog);
