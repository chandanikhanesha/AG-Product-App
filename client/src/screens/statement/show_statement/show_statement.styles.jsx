export const showStatementStyles = (theme) => ({
  formControl: {
    margin: theme.spacing.unit,
    width: 175,
    marginLeft: 0,
  },
  actionBarStyles: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    display: 'flex',
    alignItems: 'center',
  },
  buttonStyles: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  inputLabelStyles: {
    width: 300,
  },
  backToCustomerLink: {
    fontSize: '18px',

    fontWeight: 'normal',
    letterSpacing: '0.09px',
    color: 'black',
    borderBottom: '1px solid transparent',
    '&:hover': {
      borderBottomColor: '#38A154',
      color: '#38A154',
    },
  },
  customerStatement: {
    fontSize: '18px',

    fontWeight: 'normal',
    letterSpacing: '0.09px',
    color: '#605e5e',
  },
  newButtonBar: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  // purchaseOrderInput: {
  //   display: "inline-block",
  //   paddingRight: 20,
  //   position: "relative",
  //   minWidth: 205
  // },
  poSelector: {
    width: 210,
    fontSize: '36px',

    fontWeight: 'normal',
    letterSpacing: '0.18px',
    color: '#3c4858',
    margin: 0,
  },
  newButtonBarSpacing: {
    flexGrow: 1,
  },
  createdAt: {
    marginRight: 15,
    fontSize: 12,
  },
  generateText: {
    width: 114,
    height: 24,
    fontSize: '18px',

    fontWeight: 'bold',
    letterSpacing: '0.09px',
    color: '#000000',
    marginRight: 20,
  },
  iconButton: {
    background: 'transparent',
    color: 'grey',
    border: '1px solid #38A154',
    padding: 7,
    marginRight: 16,
  },
  moreFuncMenuItem: {
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
  paperHeader: {
    width: 582,
    height: 35,
    fontSize: '26px',

    fontWeight: 'bold',
    letterSpacing: '-0.26px',
    color: '#3c4858',
    marginBottom: '15px',
    textTransform: 'uppercase',
  },
  farmPaper: {
    padding: 10,
    marginTop: 20,
    marginBottom: 50,
  },
  tableTotalRow: {
    background: 'rgb(236, 243, 238)',
    padding: '10px 106px',
    textAlign: 'right',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 60,
  },
  tableTotalRowNumber: {
    width: 150,
    margin: 0,
  },
  orderTotalPaper: {
    color: 'white',
    background: 'black',
    padding: '32px 0',
  },
  orderTotalTitle: {
    fontSize: ' 26px',
    fontWeight: '600',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '-0.26px',
    color: '#f9f9f9',
    borderBottom: '1px solid white',
    paddingLeft: 43,
    paddingBottom: 20,
    margin: 0,
  },
  orderTotalDisplayRow: {
    display: 'flex',
    padding: '20px 78px 50px 43px',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  orderTotalDisplayCol: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: '51px',
  },
  orderTotalDisplayColHeader: {
    height: 32,

    fontSize: ' 24px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '0.12px',
    color: '#dddddd',
  },
  orderTotalDisplayColSubHeader: {
    height: 32,

    fontSize: ' 16px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '0.88px',
    color: '#dddddd',
  },
  orderTotalDisplayColText: {
    height: 22,

    fontSize: ' 16px',
    fontWeight: 'bold',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '0.88px',
    color: '#ffffff',
  },
  orderTotalDisplaySummaryHeader: {
    height: 32,
    fontSize: ' 24px',
    fontWeight: 'normal',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '0.12px',
    color: '#dddddd',
    textAlign: 'right',
  },
  orderTotalDisplaySummaryText: {
    height: 32,
    fontSize: ' 24px',
    fontWeight: '800',
    fontStretch: 'normal',
    fontStyle: 'normal',
    lineHeight: 'normal',
    letterSpacing: '0.7px',
    color: '#ffffff',
    textAlign: 'right',
  },
  statementNoButton: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '400',
    padding: 0,
    '&:hover': {
      color: 'rgba(0, 0, 0, 0.87)',
    },
    '&:focus': {
      color: 'rgba(0, 0, 0, 0.87)',
    },
  },
});
