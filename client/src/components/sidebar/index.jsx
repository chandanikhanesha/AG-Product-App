import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
// javascript plugin used to create scrollbars on windows
// import PerfectScrollbar from "perfect-scrollbar";
import { NavLink } from 'react-router-dom';
import cx from 'classnames';

// @material-ui/core components
import withStyles from '@material-ui/core/styles/withStyles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import Hidden from '@material-ui/core/Hidden';
import Collapse from '@material-ui/core/Collapse';

import agriDealerImage from '../../assets/img/agridealer.png';
import FactCheckBlackIcon from '../../assets/img/fact_check_black_24dp.svg';
import LocalMallIcon from '../../assets/img/local_mall_black_24dp.svg';

// core components
import HeaderLinks from '../../components/material-dashboard/Header/HeaderLinks';

import sidebarStyle from '../../assets/jss/material-dashboard-pro-react/components/sidebarStyle';

var ps;

const styles = (theme) =>
  Object.assign(
    {},
    {
      root: {
        width: '100%',
        maxWidth: 360,
      },
      primaryColor: {
        color: '#bbb',
      },
    },
    sidebarStyle(theme),
  );

// We've created this component so we can have a ref to the wrapper of the links that appears in our sidebar.
// This was necessary so that we could initialize PerfectScrollbar on the links.
// There might be something with the Hidden component from material-ui, and we didn't have access to
// the links, and couldn't initialize the plugin.
class SidebarWrapper extends React.Component {
  componentDidMount() {
    // if (navigator.platform.indexOf("Win") > -1) {
    //   ps = new PerfectScrollbar(this.refs.sidebarWrapper, {
    //     suppressScrollX: true,
    //     suppressScrollY: false
    //   });
    // }
  }
  componentWillUnmount() {
    if (navigator.platform.indexOf('Win') > -1) {
      ps.destroy();
    }
  }
  render() {
    const { className, user, headerLinks, links, dealerbucket, bayerordercheck } = this.props;
    return (
      <div className={className} ref="sidebarWrapper">
        {user}
        {headerLinks}
        {localStorage.getItem('isSuperAdmin') === 'true' ? '' : dealerbucket}
        {localStorage.getItem('isSuperAdmin') === 'true' ? '' : bayerordercheck}
        {localStorage.getItem('isSuperAdmin') === 'true' ? '' : links}
      </div>
    );
  }
}

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      openAvatar: false,
      openComponents: this.activeRoute('/components'),
      openForms: this.activeRoute('/forms'),
      openTables: this.activeRoute('/tables'),
      openMaps: this.activeRoute('/maps'),
      openPages: this.activeRoute('-page'),
      miniActive: true,
    };
    this.activeRoute.bind(this);
  }
  // verifies if routeName is the one active (in browser input)
  activeRoute(routeName) {
    if (this.props.location.pathname.indexOf('/app/seed_companies') > -1) {
      const start = '/app/seed_companies/'.length;
      return routeName && this.props.location.pathname.slice(start) === routeName.slice(start);
    }
    if (this.props.location.pathname.indexOf('/app/companies') > -1) {
      const start = '/app/companies/'.length;
      return routeName && this.props.location.pathname.slice(start) === routeName.slice(start);
    }
    return this.props.location.pathname.indexOf(routeName) > -1;
  }

  openCollapse(collapse) {
    const st = {};
    st[collapse] = !this.state[collapse];
    this.setState(st);
  }
  signOut = () => {
    localStorage.clear();
    setTimeout(() => this.props.history.push('/'));
  };

  getCollapsedItem = (collapseItemText, classes, rtlActive, color) => (prop, key) => {
    if (prop.redirect) {
      return null;
    }
    const navLinkClasses = `${classes.collapseItemLink} ${cx({
      [` ${classes[color]}`]: this.activeRoute(prop.path),
    })}`;

    const collapseItemMini = `${classes.collapseItemMini} ${cx({
      [classes.collapseItemMiniRTL]: rtlActive,
    })}`;

    return (
      <ListItem key={key} className={classes.collapseItem}>
        <NavLink to={{ pathname: prop.path, search: prop.search || '' }} className={navLinkClasses}>
          <span className={collapseItemMini}>{prop.mini}</span>
          <ListItemText primary={prop.name} disableTypography={true} className={collapseItemText} />
        </NavLink>
      </ListItem>
    );
  };

  sortItems = (a, b) => {
    const aVal = a.name.toUpperCase();
    const bVal = b.name.toUpperCase();
    return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
  };

  render() {
    const { classes, color, image, routes, bgColor, rtlActive, lastName, firstName, isAdmin } = this.props;
    const itemText = `${classes.itemText} ${cx({
      [classes.itemTextMini]: this.props.miniActive && this.state.miniActive,
      [classes.itemTextMiniRTL]: rtlActive && this.props.miniActive && this.state.miniActive,
      [classes.itemTextRTL]: rtlActive,
    })}`;

    const collapseItemText = `${classes.collapseItemText} ${cx({
      [classes.collapseItemTextMini]: this.props.miniActive && this.state.miniActive,
      [classes.collapseItemTextMiniRTL]: rtlActive && this.props.miniActive && this.state.miniActive,
      [classes.collapseItemTextRTL]: rtlActive,
    })}`;

    const userWrapperClass = `${classes.user} ${cx({
      [classes.whiteAfter]: bgColor === 'white',
    })}`;

    const caret = `${classes.caret} ${cx({
      [classes.caretRTL]: rtlActive,
    })}`;

    let dealerbucketlink = '';
    if (this.props.apiSeedCompanies.length > 0) {
      dealerbucketlink = `/app/dealers`;
    }

    let bayerorderchecklink = '';
    if (this.props.apiSeedCompanies.length > 0) {
      bayerorderchecklink = `/app/bayer_order_check`;
    }

    const navLinkClassesbucket = `${classes.itemLink} ${cx({
      [` ${classes[color]}`]: this.activeRoute(dealerbucketlink),
    })}`;

    const itemIconbucket = `${classes.itemIcon} ${cx({
      [classes.itemIconRTL]: rtlActive,
    })}`;

    const navLinkClassesordercheck = `${classes.itemLink} ${cx({
      [` ${classes[color]}`]: this.activeRoute(bayerorderchecklink),
    })}`;

    const itemIconordercheck = `${classes.itemIcon} ${cx({
      [classes.itemIconRTL]: rtlActive,
    })}`;

    // const collapseItemMini =
    //   classes.collapseItemMini +
    //   " " +
    //   cx({
    //     [classes.collapseItemMiniRTL]: rtlActive
    //   });
    const user = (
      <div className={userWrapperClass}>
        <List className={classes.list}>
          <ListItem className={`${classes.item} ${classes.userItem}`}>
            <NavLink
              to={{
                pathname: this.props.location.pathname,
                search: this.props.location.search,
              }}
              className={`${classes.itemLink} ${classes.userCollapseButton}`}
              onClick={() => this.openCollapse('openAvatar')}
              id="sideMenu"
            >
              <ListItemText
                primary={rtlActive ? 'تانيا أندرو' : `${firstName} ${lastName}`}
                secondary={
                  <b className={`${caret} ${classes.userCaret} ${this.state.openAvatar ? classes.caretActive : ''}`} />
                }
                disableTypography={true}
                className={`${itemText} ${classes.userItemText}`}
              />
            </NavLink>
            <Collapse in={this.state.openAvatar} unmountOnExit>
              <List className={classes.list + ' ' + classes.collapseList}>
                <ListItem className={classes.collapseItem}>
                  <NavLink to="/app/profile" className={classes.itemLink + ' ' + classes.userCollapseLinks}>
                    {/* <span className={collapseItemMini}>
                      {rtlActive ? "مع" : "UI"}
                    </span> */}
                    <ListItemText
                      primary={rtlActive ? 'ملفي' : 'User Info'}
                      disableTypography={true}
                      className={collapseItemText}
                    />
                  </NavLink>
                </ListItem>
                {(isAdmin === true || isAdmin === 'true') && (
                  <span>
                    <ListItem className={classes.collapseItem}>
                      <NavLink to="/app/admin/users" className={classes.itemLink + ' ' + classes.userCollapseLinks}>
                        {/* <span className={collapseItemMini}>
                          {rtlActive ? "هوع" : "MU"}
                        </span> */}
                        <ListItemText
                          primary={rtlActive ? 'تعديل الملف الشخصي' : 'Manage Users'}
                          disableTypography={true}
                          className={collapseItemText}
                        />
                      </NavLink>
                    </ListItem>
                    <ListItem className={classes.collapseItem}>
                      <NavLink
                        to="/app/admin/organization_profile"
                        className={classes.itemLink + ' ' + classes.userCollapseLinks}
                      >
                        {/* <span className={collapseItemMini}>
                          {rtlActive ? "و" : "OP"}
                        </span> */}
                        <ListItemText
                          primary={rtlActive ? 'إعدادات' : 'Organization Profile'}
                          disableTypography={true}
                          className={collapseItemText}
                        />
                      </NavLink>
                    </ListItem>

                    <ListItem className={classes.collapseItem}>
                      <NavLink to="/app/announcements" className={classes.itemLink + ' ' + classes.userCollapseLinks}>
                        <ListItemText
                          primary={rtlActive ? 'الإعلانات' : 'Announcements'}
                          disableTypography={true}
                          className={collapseItemText}
                        />
                      </NavLink>
                    </ListItem>
                    {/* <ListItem className={classes.collapseItem}>
                      <NavLink to="/app/tutorials" className={classes.itemLink + ' ' + classes.userCollapseLinks}>
                        <ListItemText
                          primary={rtlActive ? 'دروس' : 'Tutorials'}
                          disableTypography={true}
                          className={collapseItemText}
                        />
                      </NavLink>
                    </ListItem>
                    <ListItem className={classes.collapseItem}>
                      <NavLink
                        to="/app/admin/subscription"
                        className={classes.itemLink + ' ' + classes.userCollapseLinks}
                      >
                        <ListItemText primary={'Subscription'} disableTypography={true} className={collapseItemText} />
                      </NavLink>
                    </ListItem> */}
                  </span>
                )}
                {localStorage.getItem('isSuperAdmin') === 'true' ? (
                  <ListItem className={classes.collapseItem}>
                    <NavLink
                      to="/app/admin/manage_messages"
                      className={classes.itemLink + ' ' + classes.userCollapseLinks}
                    >
                      {/* <span className={collapseItemMini}>
                          {rtlActive ? "و" : "OP"}
                        </span> */}
                      <ListItemText
                        primary={rtlActive ? 'إعدادات' : 'Manage Messages'}
                        disableTypography={true}
                        className={collapseItemText}
                      />
                    </NavLink>
                  </ListItem>
                ) : (
                  ''
                )}

                <ListItem className={classes.collapseItem} onClick={this.signOut}>
                  <span className={classes.itemLink + ' ' + classes.userCollapseLinks}>
                    <ListItemText
                      id="signOut"
                      primary={rtlActive ? 'ملفي' : 'Sign Out'}
                      disableTypography={true}
                      className={collapseItemText}
                    />
                  </span>
                </ListItem>
                {/* <ListItem className={classes.collapseItem}>
                  <NavLink to="/app/settings" className={classes.itemLink + ' ' + classes.userCollapseLinks}>
                    <ListItemText
                      id="settings"
                      primary={rtlActive ? 'إعدادات' : 'Settings'}
                      disableTypography={true}
                      className={collapseItemText}
                    />
                  </NavLink>
                </ListItem> */}
              </List>
            </Collapse>
          </ListItem>
        </List>
      </div>
    );
    const dealerbucket = (
      <div>
        {dealerbucketlink !== '' ? (
          <NavLink className={navLinkClassesbucket} to={dealerbucketlink}>
            <ListItemIcon className={itemIconbucket}>
              <img src={LocalMallIcon} />
            </ListItemIcon>
            <ListItemText primary="Bayer Dealer Bucket" disableTypography={true} className={itemText} />
          </NavLink>
        ) : (
          ''
        )}
      </div>
    );
    const bayerordercheck = (
      <div style={{ marginBottom: '-14px' }}>
        {/* {bayerorderchecklink !== '' ? (
          <NavLink className={navLinkClassesordercheck} to={bayerorderchecklink}>
            <ListItemIcon className={itemIconordercheck}>
              <img src={FactCheckBlackIcon} />
            </ListItemIcon>
            <ListItemText primary="Bayer Order Check" disableTypography={true} className={itemText} />
          </NavLink>
        ) : (
          ''
        )} */}
      </div>
    );
    const links = (
      <List className={classes.list}>
        {routes.map((prop, key) => {
          if (prop.redirect) return null;
          if (prop.visible === false) return null;

          if (prop.collapse) {
            const navLinkClasses = `${classes.itemLink} ${cx({
              [' ' + classes.collapseActive]: this.activeRoute(prop.path),
            })}`;

            const itemIcon = `${classes.itemIcon} ${cx({
              [classes.itemIconRTL]: rtlActive,
            })}`;

            const caret = `${classes.caret} ${cx({
              [classes.caretRTL]: rtlActive,
            })}`;

            return (
              <ListItem key={key} className={classes.item}>
                <NavLink
                  to={{
                    pathname: this.props.location.pathname,
                    search: this.props.location.search,
                  }}
                  className={navLinkClasses}
                  onClick={() => this.openCollapse(prop.state)}
                >
                  <ListItemIcon className={itemIcon}>
                    <prop.icon />
                  </ListItemIcon>
                  <ListItemText
                    primary={prop.name}
                    secondary={<b className={`${caret} ${this.state[prop.state] ? classes.caretActive : ''}`} />}
                    disableTypography={true}
                    className={itemText}
                  />
                </NavLink>
                <Collapse in={this.state[prop.state]} unmountOnExit>
                  {prop.views.some((prop) => /reports/.test(prop.path)) ? (
                    <List className={`${classes.list} ${classes.collapseList}`}>
                      {prop.views
                        .filter((prop) => /reports/.test(prop.path))
                        .sort(this.sortItems)
                        .map(this.getCollapsedItem(collapseItemText, classes, rtlActive, color))}
                    </List>
                  ) : (
                    <List className={`${classes.list} ${classes.collapseList}`}>
                      {prop.views
                        .filter((prop) => /setting/.test(prop.path))
                        // .sort(this.sortItems)
                        .map(this.getCollapsedItem(collapseItemText, classes, rtlActive, color))}
                    </List>
                  )}

                  {prop.views.some((prop) => /api_seed_companies/.test(prop.path)) ? (
                    <List
                      subheader={
                        <ListSubheader className={`${classes.root} ${classes.primaryColor}`}>
                          Dekalb/Asgrow
                        </ListSubheader>
                      }
                      className={`${classes.list} ${classes.collapseList}`}
                    >
                      {prop.views
                        .filter((prop) => /api_seed_companies/.test(prop.path))
                        .sort(this.sortItems)
                        .map(this.getCollapsedItem(collapseItemText, classes, rtlActive, color))}
                    </List>
                  ) : null}

                  {prop.views.some((prop) => /[^api_]seed_companies/.test(prop.path)) ? (
                    <List
                      subheader={
                        <ListSubheader className={`${classes.root} ${classes.primaryColor}`}>
                          Seed Companies
                        </ListSubheader>
                      }
                      className={`${classes.list} ${classes.collapseList}`}
                    >
                      {prop.views
                        .filter((prop) => /[^api_]seed_companies/.test(prop.path))
                        .sort(this.sortItems)
                        .map(this.getCollapsedItem(collapseItemText, classes, rtlActive, color))}
                    </List>
                  ) : null}

                  {prop.views.some((view) => /[^_]companies/.test(view.path)) ? (
                    <List
                      subheader={
                        prop.views.some((view) => /[^_]companies\/\d/.test(view.path)) && (
                          <ListSubheader className={classes.root + ' ' + classes.primaryColor}>Companies</ListSubheader>
                        )
                      }
                      className={`${classes.list} ${classes.collapseList}`}
                    >
                      {prop.views
                        .filter((prop) => /[^_]companies/.test(prop.path))
                        .sort((a, b) => {
                          if (/[^_]companies\/\d/.test(a.path) && /[^_]companies\/\d/.test(b.path)) {
                            const aVal = a.name.toUpperCase();
                            const bVal = b.name.toUpperCase();
                            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
                          } else {
                            return undefined;
                          }
                        })
                        .map(this.getCollapsedItem(collapseItemText, classes, rtlActive, color))}
                    </List>
                  ) : null}
                </Collapse>
              </ListItem>
            );
          }
          const navLinkClasses = `${classes.itemLink} ${cx({
            [` ${classes[color]}`]: this.activeRoute(prop.path),
          })}`;

          const itemIcon = `${classes.itemIcon} ${cx({
            [classes.itemIconRTL]: rtlActive,
          })}`;

          return (
            <ListItem key={key} className={classes.item}>
              <NavLink to={{ pathname: prop.path, search: prop.search || '' }} className={navLinkClasses}>
                <ListItemIcon className={itemIcon}>
                  <prop.icon />
                </ListItemIcon>
                <ListItemText primary={prop.name} disableTypography={true} className={itemText} />
              </NavLink>
            </ListItem>
          );
        })}
      </List>
    );

    const logoNormal = `${classes.logoNormal} ${cx({
      [classes.logoNormalSidebarMini]: this.props.miniActive && this.state.miniActive,
      [classes.logoNormalSidebarMiniRTL]: rtlActive && this.props.miniActive && this.state.miniActive,
      [classes.logoNormalRTL]: rtlActive,
    })}`;

    const logoMini = `${classes.logoMini} ${cx({
      [classes.logoMiniRTL]: rtlActive,
    })}`;

    const logoClasses = `${classes.logo} ${cx({
      [classes.whiteAfter]: bgColor === 'white',
    })}`;

    const brand = (
      <div className={logoClasses}>
        <a className={logoMini}> &nbsp; </a>
        <a className={logoNormal}>
          <img alt="logo" className={classes.logoImg} src={agriDealerImage} />
        </a>
      </div>
    );
    const drawerPaper = `${classes.drawerPaper} ${cx({
      [classes.drawerPaperMini]: this.props.miniActive && this.state.miniActive,
      [classes.drawerPaperRTL]: rtlActive,
    })}`;

    const sidebarWrapper = `${classes.sidebarWrapper} ${cx({
      [classes.drawerPaperMini]: this.props.miniActive && this.state.miniActive,
      // [classes.sidebarWrapperWithPerfectScrollbar]: navigator.platform.indexOf('Win') > -1,
    })}`;

    return (
      <div className="hide-print" ref="mainPanel">
        <Drawer
          onMouseOver={() => this.setState({ miniActive: false })}
          onMouseOut={() => this.setState({ miniActive: true })}
          anchor={rtlActive ? 'right' : 'left'}
          variant="permanent"
          open
          classes={{
            paper: `${drawerPaper} ${classes[bgColor + 'Background']}`,
          }}
        >
          {brand}
          <SidebarWrapper
            className={sidebarWrapper}
            user={user}
            links={links}
            dealerbucket={dealerbucket}
            bayerordercheck={bayerordercheck}
          />
          {image !== undefined ? (
            <div className={classes.background} style={{ backgroundImage: `url(${image})` }} />
          ) : null}
        </Drawer>
      </div>
    );
  }
}

Sidebar.defaultProps = {
  bgColor: 'blue',
};

Sidebar.propTypes = {
  classes: PropTypes.object.isRequired,
  bgColor: PropTypes.oneOf(['white', 'black', 'blue']),
  rtlActive: PropTypes.bool,
  color: PropTypes.oneOf(['white', 'red', 'orange', 'green', 'blue', 'purple', 'rose']),
  image: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object),
};

const mapStateToProps = (state) => {
  return {
    firstName: state.userReducer.firstName,
    lastName: state.userReducer.lastName,
    isAdmin: state.userReducer.isAdmin,
  };
};

export default withStyles(styles)(connect(mapStateToProps, null)(Sidebar));
