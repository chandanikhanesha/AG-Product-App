import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import FarmEditMSRP from './farm_edit_msrp';

import {} from '../../../../store/actions';
const mapStateToProps = (state) => ({
  organizationId: state.userReducer.organizationId,
});
const mapDispatchToProps = (dispatch) => bindActionCreators({}, dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(FarmEditMSRP);
