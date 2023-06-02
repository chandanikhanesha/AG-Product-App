import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import FarmEditShareholder from './farm_edit_shareholder';

import { createShareholder, updateShareholder, listShareholders, updatePurchaseOrder } from '../../../../store/actions';

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createShareholder,
      updateShareholder,
      listShareholders,
      updatePurchaseOrder,
    },
    dispatch,
  );

export default connect(null, mapDispatchToProps)(FarmEditShareholder);
