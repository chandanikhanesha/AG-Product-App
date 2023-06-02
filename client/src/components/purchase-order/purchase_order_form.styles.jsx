import sweetAlertStyle from '../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';

export default Object.assign(
  {
    root: {
      flexGrow: 1,
    },
    nameInput: {
      width: 300,
    },
    selectDropDown: {
      maxHeight: '22.5em',
      overflowY: 'auto',
    },
    purchaseOrderInput: {
      display: 'inline-block',
      paddingRight: 20,
      position: 'relative',
      minWidth: 205,
    },
    buttonBar: {
      display: 'flex',
    },
    farmHeader: {
      display: 'flex',
      alignItems: 'center',
    },
    utilBtns: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    purchaseOrderInputLabel: {
      position: 'absolute',
      top: -25,
      left: 0,
    },
    discountLabel: {
      minWidth: 300,
      display: 'inline-block',
    },
    discountRowHandle: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    },
    farmPaper: {
      padding: 10,
      marginTop: 20,
    },
    percentagePaper: {
      width: '100%',
    },
    percentageList: {
      margin: 0,
      padding: 0,
      display: 'flex',
      flexWrap: 'wrap',
    },
    shareholderValue: {
      background: '#DDDDDD',
      borderRadius: '11.5px',
      margin: '2px',
      listStyleType: 'none',
      padding: '4px 8px',
      fontSize: 10,
      fontWeight: 600,
    },
    shareholderName: {},
    percentageValue: {
      marginLeft: 5,
    },
    farmFieldShareholderInput: {
      '& div': {
        marginBottom: 0,
      },
    },
    shareholderContainer: {
      maxWidth: 250,
      display: 'inline-block',
      marginRight: 10,
    },
    discountSummaryCard: {
      marginBottom: 20,
    },
    productTypeContainer: {
      '&:first-of-type': {
        borderBottom: '3px solid #ddd',
        marginBottom: 20,
        paddingBottom: 10,
      },
    },
    productTypeMeta: {
      display: 'flex',
      '& *': {
        marginRight: 30,
      },
    },
  },
  sweetAlertStyle,
);
