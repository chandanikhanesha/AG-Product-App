// ##############################
// // // App styles
// #############################

import { drawerWidth, drawerMiniWidth, transition, containerFluid } from '../../material-dashboard-pro-react';

const appStyle = (theme) => ({
  wrapper: {
    fontFamily: theme.typography.fontFamily,
    position: 'relative',
    top: '0',
    height: '100%',
    '&:after': {
      display: 'table',
      clear: 'both',
      content: '" "',
    },
  },
  mainPanel: {
    transitionProperty: 'top, bottom, width',
    transitionDuration: '.2s, .2s, .35s',
    transitionTimingFunction: 'linear, linear, ease',
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
    overflow: 'visible',
    position: 'relative',
    float: 'right',
    ...transition,
    maxHeight: '100%',
    width: '100%',
    overflowScrolling: 'touch',
    '@media print': {
      width: '21cm',
    },
  },
  content: {
    //marginTop: "70px",
    padding: '16px 15px',
    //minHeight: "calc(100vh - 123px)",
    '@media print': {
      padding: 0,
    },
  },
  container: { ...containerFluid },
  map: {
    marginTop: '70px',
  },
  mainPanelSidebarMini: {
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerMiniWidth}px)`,
    },
  },
  mainPanelWithPerfectScrollbar: {
    overflow: 'hidden !important',
  },
});

export default appStyle;
