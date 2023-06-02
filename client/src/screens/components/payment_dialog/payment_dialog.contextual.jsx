import { connect } from 'react-redux';

import PaymentDialog from './payment_dialog';

const mapStateToProps = (state) => ({
  organizationId: state.userReducer.organizationId,
});

export default connect(mapStateToProps, null)(PaymentDialog);
