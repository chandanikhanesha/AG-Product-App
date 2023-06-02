import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { withStyles } from '@material-ui/core/styles';
// import PerfectScrollbar from "perfect-scrollbar"
import qs from 'qs';

// core components
import Footer from '../../components/material-dashboard/Footer/Footer';
import Sidebar from '../../components/sidebar';

import image from '../../assets/img/sidebar-2.jpg';
import logo from '../../assets/img/logo-white.svg';

import privateRoutes from './private_routes';
import UsersCreate from '../../components/admin/users/create';
import appStyle from '../../assets/jss/material-dashboard-pro-react/layouts/dashboardStyle';

import { eventEmitter } from '../../event_emitter';

import ShowCompany from '../../components/company/show';
import Inventory from '../../components/inventory';
import ShipNotice from '../../screens/reports/ship_notice';
import GroupDetailProductTable from '../../screens/group_detail_product_table.jsx';

import CreateSeedCompany from '../../components/seed-company/create';

import {
  listCustomers,
  listCompanies,
  listSeedCompanies,
  listApiSeedCompanies,
  loadOrganization,
  listMonsantoProducts,
} from '../../store/actions';
import { isLoaded } from '../../utilities';

let routes = [];

let switchRoutes = <Switch>{routes}</Switch>;

const buildRoutes = (opts, authprivateRoutes) => {
  if (!opts) opts = {};
  let companies = opts.companies || [];
  let companyId = opts.companyId;
  let seedCompanies = opts.seedCompanies || [];
  let apiSeedCompanies = opts.apiSeedCompanies || [];
  let seedCompanyId = opts.seedCompanyId;
  let apiSeedCompanyId = opts.apiSeedCompanyId;
  let removeSeedCompanyId = opts.removeSeedCompanyId;
  let removeApiSeedCompanyId = opts.removeApiSeedCompanyId;
  let removeCompanyId = opts.removeCompanyId;

  let inventoryRoute = authprivateRoutes.find((route) => route.name === 'Inventory');
  let views = inventoryRoute ? inventoryRoute.views : [];
  companies.forEach((company) => {
    if (company.id === companyId) {
      views.forEach((view) => {
        if (view.path === `/app/companies/${companyId}`) {
          view.name = company.name;
          view.mini = company.name[0];
        }
      });
      return;
    }
    if (views.filter((view) => view.path === `/app/companies/${company.id}`).length) return;
    views.unshift({
      path: `/app/companies/${company.id}`,
      name: company.name,
      component: ShowCompany,
    });
  });

  seedCompanies.forEach((seedCompany) => {
    if (seedCompany.id === seedCompanyId) {
      views.forEach((view) => {
        if (view.path === `/app/seed_companies/${seedCompanyId}`) {
          view.name = seedCompany.name;
        }
      });
      return;
    }

    if (views.filter((view) => view.path === `/app/seed_companies/${seedCompany.id}`).length) return;

    views.unshift({
      path: `/app/seed_companies/${seedCompany.id}`,
      search: qs.stringify({ selectedTab: 0 }),
      name: seedCompany.name,
      component: Inventory,
    });
  });

  apiSeedCompanies.forEach((apiSeedCompany) => {
    if (apiSeedCompany.id === apiSeedCompanyId) {
      views.forEach((view) => {
        if (view.path === `/app/seed_companies/${apiSeedCompanyId}`) {
          view.name = apiSeedCompany.name;
        }
      });
      return;
    }

    if (views.filter((view) => view.path === `/app/d_api_seed_companies/${apiSeedCompany.id}`).length) return;

    // views.unshift({
    //   path: `/app/api_seed_companies/${apiSeedCompany.id}`,
    //   search: qs.stringify({ selectedTab: 0 }),
    //   name: 'Dealer Order Summary',
    //   component: Inventory,
    // });
    // views.unshift({
    //   path: `/app/p_api_seed_companies/${apiSeedCompany.id}`,
    //   name: 'Dealer Order Detailed',
    //   search: qs.stringify({ selectedTab: 0 }),
    //   component: Inventory,
    // });
    views.unshift({
      path: `/app/d_api_seed_companies/${apiSeedCompany.id}`,
      name: 'Dealer Order Detailed',
      search: qs.stringify({ selectedTab: 0 }),
      component: Inventory,
    });

    views.unshift({
      path: `/app/g_api_seed_companies/${apiSeedCompany.id}`,
      name: 'Grouped Dealer Order Detailed',
      component: GroupDetailProductTable,
    });

    views.unshift({
      path: `/app/pp_api_seed_companies/${apiSeedCompany.id}`,
      name: 'PriceSheet',
      component: Inventory,
    });
    views.unshift({
      path: `/app/s_api_seed_companies/ship-notice/${apiSeedCompany.id}`,
      name: 'Ship Notice List',
      component: ShipNotice,
    });
  });

  if (removeSeedCompanyId) {
    views = views.filter((view) => view.path !== `/app/seed_companies/${removeSeedCompanyId}`);
    // removing the seed company from the view doesn't remove it from the nav bar
    // just remove the dom element
    let el = document.querySelector(`a[href*="/seed_companies/${removeSeedCompanyId}"]`);
    if (el) el.parentElement.remove();
  }

  if (removeApiSeedCompanyId) {
    views = views.filter((view) => view.path !== `/app/api_seed_companies/${removeApiSeedCompanyId}`);
    // removing the seed company from the view doesn't remove it from the nav bar
    // just remove the dom element
    let el = document.querySelector(`a[href*="/api_seed_companies/${removeApiSeedCompanyId}"]`);
    if (el) el.parentElement.remove();
  }

  if (removeCompanyId) {
    views = views.filter((view) => view.path !== `/app/companies/${removeCompanyId}`);
    let el = document.querySelector(`a[href*="/companies/${removeCompanyId}"]`);
    if (el) el.parentElement.remove();
  }

  // if (!views.filter(view => view.path === '/app/companies/create').length) {
  //   views.push({
  //     path: '/app/companies/create',
  //     name: 'Create new company',
  //     component: CreateCompany
  //   })
  // }

  if (
    !views.filter((view) => view.path === '/app/seed_companies/create' || view.path === '/app/companies/create').length
  ) {
    views.push({
      path: '/app/companies/create',
      name: 'Create a new company',
      component: CreateSeedCompany,
    });
  }

  routes = authprivateRoutes.map((prop, key) => {
    if (prop.redirect) return <Redirect from={prop.path} to={prop.pathTo} key={key} />;
    if (prop.collapse)
      return prop.views.map((prop, key) => {
        return <Route exact={prop.exact === true} path={prop.path} component={prop.component} key={key} />;
      });
    return (
      <Route
        exact={prop.exact === true}
        path={prop.path}
        component={prop.component}
        key={`key-${window.location.href}`}
      />
    );
  });
  routes.push(<Route exact path="/app/admin/users/create" component={UsersCreate} key={'users-create'} />);

  switchRoutes = <Switch>{routes}</Switch>;
};

buildRoutes(null, privateRoutes);

class Layout extends Component {
  state = {
    mobileOpen: false,
    miniActive: false,
    newCompaniesSubscription: null,
    newSeedCompaniesSubscription: null,
    newApiSeedCompaniesSubscription: null,
    removeSeedCompanySubscription: null,
    removeCompanySubscription: null,
    removeApiSeedCompanySubscription: null,
    authprivateRoutes: [],
  };

  applySubscribedRoute() {
    const filteredprivateRoutes = privateRoutes.filter((item) => {
      if (item.moduleName) {
        return this.props.subscriptionPlan.includes(item.moduleName);
      } else {
        return true;
      }
    });
    this.setState({ authprivateRoutes: filteredprivateRoutes });
  }

  async componentWillMount() {
    await this.props.loadOrganization(this.props.organizationId).then(() => {
      this.applySubscribedRoute();
    });

    this.setState({
      newCompaniesSubscription: eventEmitter.addListener('newCompany', (companyId) => {
        buildRoutes({ companies: this.props.companies, companyId }, this.state.authprivateRoutes);
      }),
      newSeedCompaniesSubscription: eventEmitter.addListener('newSeedCompany', (seedCompanyId) => {
        buildRoutes(
          {
            seedCompanies: this.props.seedCompanies,
            seedCompanyId,
          },
          this.state.authprivateRoutes,
        );
      }),
      newApiSeedCompaniesSubscription: eventEmitter.addListener('newApiSeedCompany', (apiSeedCompanyId) => {
        buildRoutes(
          {
            apiSeedCompanies: this.props.apiSeedCompanies,
            apiSeedCompanyId,
          },
          this.state.authprivateRoutes,
        );
      }),
      removeSeedCompanySubscription: eventEmitter.addListener('removeSeedCompany', (seedCompanyId) => {
        buildRoutes(
          {
            seedCompanies: this.props.seedCompanies,
            removeSeedCompanyId: seedCompanyId,
          },
          this.state.authprivateRoutes,
        );
      }),
      removeApiSeedCompanySubscription: eventEmitter.addListener('removeApiSeedCompany', (apiSeedCompanyId) => {
        buildRoutes(
          {
            apiSeedCompanies: this.props.apiSeedCompanies,
            removeApiSeedCompanyId: apiSeedCompanyId,
          },
          this.state.authprivateRoutes,
        );
        window.location.reload();
      }),
      removeCompanySubscription: eventEmitter.addListener('removeCompany', (companyId) => {
        buildRoutes(
          {
            seedCompanies: this.props.seedCompanies,
            removeCompanyId: companyId,
          },
          this.state.authprivateRoutes,
        );
      }),
    });

    this.props.listApiSeedCompanies();
    await this.props.listCustomers();
    this.props.listMonsantoProducts();

    this.props.listCompanies();
    this.props.listSeedCompanies();

    // https://medium.com/the-many/adding-login-and-authentication-sections-to-your-react-or-react-native-app-7767fd251bd1
    let isLoggedIn = localStorage.getItem('authToken');

    const { history } = this.props;

    if (!isLoggedIn) {
      history.push('/log_in');
    }
  }

  // componentDidMount() {
  //   // if (navigator.platform.indexOf("Win") > -1) {
  //   //   ps = new PerfectScrollbar(this.refs.mainPanel, {
  //   //     suppressScrollX: true,
  //   //     suppressScrollY: false
  //   //   });
  //   //   document.body.style.overflow = "hidden";
  //   // }
  // }

  componentDidUpdate(prevProps) {
    if (prevProps.history.location.pathname !== prevProps.location.pathname) {
      this.refs.mainPanel.scrollTop = 0;
      if (this.state.mobileOpen) {
        this.setState({ mobileOpen: false });
      }
    }

    if (!isLoaded(prevProps.companiesStatus) && isLoaded(this.props.companiesStatus)) {
      buildRoutes({ companies: this.props.companies }, this.state.authprivateRoutes);
      this.setState({ ...this.state });
    }
    if (!isLoaded(prevProps.seedCompaniesStatus) && isLoaded(this.props.seedCompaniesStatus)) {
      buildRoutes({ seedCompanies: this.props.seedCompanies }, this.state.authprivateRoutes);
      this.setState({ ...this.state });
    }
    if (!isLoaded(prevProps.apiSeedCompaniesStatus) && isLoaded(this.props.apiSeedCompaniesStatus)) {
      buildRoutes({ apiSeedCompanies: this.props.apiSeedCompanies }, this.state.authprivateRoutes);
      this.setState({ ...this.state });
    }
  }

  componentWillUnmount() {
    this.state.newCompaniesSubscription && this.state.newCompaniesSubscription.remove();
    this.state.newSeedCompaniesSubscription && this.state.newSeedCompaniesSubscription.remove();
    this.state.newApiSeedCompaniesSubscription && this.state.newApiSeedCompaniesSubscription.remove();
    this.state.removeSeedCompanySubscription && this.state.removeSeedCompanySubscription.remove();
    this.state.removeApiSeedCompanySubscription && this.state.removeApiSeedCompanySubscription.remove();
    this.state.removeCompanySubscription && this.state.removeCompanySubscription.remove();
    // if (navigator.platform.indexOf("Win") > -1) {
    //   ps.destroy();
    // }
  }

  sidebarMinimize() {
    this.setState({ miniActive: !this.state.miniActive });
  }

  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };

  logOut = () => {
    localStorage.removeItem('authToken');
    return this.props.history.push('/');
  };
  render() {
    const { classes, companies, theme, ...rest } = this.props;
    const mainPanel = `${classes.mainPanel} ${cx({
      [classes.mainPanelSidebarMini]: this.state.miniActive,
      //[classes.mainPanelWithPerfectScrollbar]:
      //navigator.platform.indexOf("Win") > -1
    })}`;

    return (
      <div className={classes.wrapper}>
        <Sidebar
          history={this.props.history}
          routes={privateRoutes}
          logoText={'Creative Tim'}
          logo={logo}
          image={image}
          handleDrawerToggle={this.handleDrawerToggle}
          open={this.state.mobileOpen}
          color="green"
          bgColor="black"
          //miniActive={this.state.miniActive}
          {...rest}
        />

        <div className={mainPanel} ref="mainPanel">
          {/* <Header
            //sidebarMinimize={this.sidebarMinimize.bind(this)}
            //miniActive={this.state.miniActive}
            routes={privateRoutes}
            handleDrawerToggle={this.handleDrawerToggle}
            {...rest}
          /> */}
          <div className={classes.content}>
            <div className={classes.container}>{switchRoutes}</div>
          </div>
          <Footer fluid />
        </div>
      </div>
    );
  }
}

Layout.propTypes = {
  classes: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  companies: state.companyReducer.companies,
  customers: state.customerReducer.customers,
  seedCompanies: state.seedCompanyReducer.seedCompanies,
  apiSeedCompanies: state.apiSeedCompanyReducer.apiSeedCompanies,
  companiesStatus: state.companyReducer.loadingStatus,
  seedCompaniesStatus: state.seedCompanyReducer.loadingStatus,
  apiSeedCompaniesStatus: state.apiSeedCompanyReducer.loadingStatus,
  subscriptionPlan: state.organizationReducer.subscriptionPlan,
  organizationId: state.userReducer.organizationId,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomers,
      listCompanies,
      listSeedCompanies,
      listApiSeedCompanies,
      loadOrganization,
      listMonsantoProducts,
    },
    dispatch,
  );

export default withStyles(appStyle, { withTheme: true })(connect(mapStateToProps, mapDispatchToProps)(Layout));
