import { bindActionCreators } from 'redux';
import { listLicences } from '../../../store/actions';
import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import CustomerForm from './customer_form';
import { customerFormStyles } from './customer_form.styles';

const mapStateToProps = (state) => ({
  userFirstName: state.userReducer.firstName,
  userLastName: state.userReducer.lastName,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listLicences,
    },
    dispatch,
  );

export default withStyles(customerFormStyles)(connect(mapStateToProps, mapDispatchToProps)(CustomerForm));
