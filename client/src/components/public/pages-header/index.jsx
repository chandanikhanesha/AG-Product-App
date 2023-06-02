import React from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

// @material-ui/core components
import withStyles from '@material-ui/core/styles/withStyles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
// import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from '@material-ui/core/ListItemText';

import publicRoutes from '../../../components/public/layout/public_routes';

import pagesHeaderStyle from '../../../assets/jss/material-dashboard-pro-react/components/pagesHeaderStyle';

class PagesHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
    };
  }
  handleDrawerToggle = () => {
    this.setState({ open: !this.state.open });
  };
  // verifies if routeName is the one active (in browser input)
  activeRoute(routeName) {
    return this.props.location.pathname.indexOf(routeName) > -1 ? true : false;
  }
  componentDidUpdate(e) {
    if (e.history.location.pathname !== e.location.pathname) {
      this.setState({ open: false });
    }
  }
  render() {
    const { classes, color } = this.props;
    const appBarClasses = cx({
      [' ' + classes[color]]: color,
    });
    var list = (
      <List className={classes.list}>
        {publicRoutes
          .filter((r) => r.visible !== false)
          .map((prop, key) => {
            if (prop.redirect) {
              return null;
            }
            const navLink =
              classes.navLink +
              cx({
                [' ' + classes.navLinkActive]: this.activeRoute(prop.path),
              });
            return (
              <ListItem key={key} className={classes.listItem}>
                <NavLink to={prop.path} className={navLink}>
                  {/* <ListItemIcon className={classes.listItemIcon}>
                  <prop.icon />
                </ListItemIcon> */}
                  <ListItemText primary={prop.short} disableTypography={true} className={classes.listItemText} />
                </NavLink>
              </ListItem>
            );
          })}
      </List>
    );
    return (
      <AppBar position="static" className={classes.appBar + appBarClasses}>
        <Toolbar className={classes.container}>{list}</Toolbar>
      </AppBar>
    );
  }
}

PagesHeader.propTypes = {
  classes: PropTypes.object.isRequired,
  color: PropTypes.oneOf(['primary', 'info', 'success', 'warning', 'danger']),
};

export default withStyles(pagesHeaderStyle)(PagesHeader);
