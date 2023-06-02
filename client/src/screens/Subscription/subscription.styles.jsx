import sweetAlertStyle from '../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';
import { cardTitle } from '../../assets/jss/material-dashboard-pro-react';

export const subscriptionStyles = (theme) =>
  Object.assign({}, sweetAlertStyle, {
    csvFileInput: {
      display: 'none',
    },
    cardIconTitle: {
      ...cardTitle,
      fontWeight: 600,
      margin: '20px',
      marginTop: '20px',
    },
    cardHeaderContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '15px',
    },
    cardHeaderActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    iconButton: {
      background: 'transparent',
      color: 'grey',
      border: '1px solid #38A154',
      padding: 7,
      marginRight: 16,
    },
    cardBody: {
      display: 'flex',
      flexDirection: 'column',
    },
    addCustomerButton: {
      paddingLeft: 15,
      paddingRight: 15,
    },
    addCustomerButtonDropdownIcon: {
      marginTop: '-3px !important',
    },
    searchField: {
      marginRight: 8,
    },
    addNewMenuItem: {
      borderRadius: '3px',
      margin: '0 8px',
      padding: '12px 24px',
      transition: 'none',
      '&:hover': {
        background: '#38A154',
        color: 'white',
        boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.36)',
      },
    },
    addIcon: {
      margin: '0 !important',
    },
    leftIcon: {
      marginRight: 8,
    },
    rightIcon: {
      marginLeft: 8,
    },
    fullWidth: {
      display: 'block',
    },
    printBtn: {
      marginRight: 13,
      marginLeft: 'auto',
    },
    tableItemButton: {
      fontSize: 12,
      cursor: 'pointer',
      color: '#38A154',
    },
    tableItemLinearProgress: {
      width: 100,
    },
    createQT: {
      paddingLeft: 0,
      textAlign: 'left',
      margin: 'auto',
      textTransform: 'none',
    },
    createPO: {
      paddingLeft: 0,
      textAlign: 'left',
      margin: 'auto',
      textTransform: 'none',
    },
    linkQT: {
      width: 'auto',
      display: 'inline-block',
      color: '#2F2E2E',
      '&:hover': {
        display: 'inline-block',
        background: '#DDDDDD',
        color: '#2F2E2E',
      },
    },
    undo: {
      fontWeight: 600,
      color: 'white',
      background: '38A154',
    },
    tooltip: {
      maxWidth: 350,
    },
  });
