import { bindActionCreators } from 'redux';
import {
  createApiSeedCompany,
  createCompany,
  createSeedCompany,
  listLicences,
  getSubscriptionPlans,
} from '../../../store/actions';
import { withStyles } from '@material-ui/core';
import { connect } from 'react-redux';
import CreateCompany from './create';
import styles from './create.styles';

const mapStateToProps = (state) => {
  return {
    planList: state.subscriptionReducer.subscriptionPlanList,
    userFirstName: state.userReducer.firstName,
    userLastName: state.userReducer.lastName,
    subscriptionPlan: state.organizationReducer.subscriptionPlan,
    fetched: state.subscriptionReducer.fetched,
    isapiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies.length > 0 ? true : false,
    orgAddress: state.organizationReducer.address,
    orgBusinessCity: state.organizationReducer.businessCity,
    orgBusinessState: state.organizationReducer.businessState,
    orgBusinessZip: state.organizationReducer.businessZip,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createSeedCompany,
      createApiSeedCompany,
      createCompany,
      listLicences,
      getSubscriptionPlans,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CreateCompany));
