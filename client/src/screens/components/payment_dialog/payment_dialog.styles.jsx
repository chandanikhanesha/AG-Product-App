export const paymentDialogStyles = (theme) => ({
  select: {
    width: '100%',
  },
  middleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
  select: {
    width: '100%',
    marginBottom: '20px',
  },
  root: {
    flexGrow: 1,
    height: 250,
    borderColor: 'orange',
  },
  // cssOutlinedInput: {
  //   '&$cssFocused $notchedOutline': {
  //     borderColor: `green !important`,
  //   },
  // },

  // input: {
  //   borderBottom: '1px solid red !important',
  // },
  textField: {
    marginBottom: '20px',
    width: '145px',
  },
  input: {
    display: 'flex',
    // borderBottom: '1px solid red',

    // padding: 0,
  },

  valueContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    flex: 1,
    alignItems: 'center',
  },
  singleValue: {
    // fontSize: 16,
    fontSize: 14,
  },
  placeholder: {
    position: 'absolute',
    left: 2,
    fontSize: 16,
  },
  paper: {
    position: 'absolute',
    zIndex: 1,
    marginTop: theme.spacing.unit,
    left: 0,
    right: 0,
  },
  cardIcon: {
    color: 'white',
  },
  addButton: {
    width: 100,
    float: 'right',
    color: 'white',
    background: '#38A154',
    transition: 'none',
    marginRight: 16,
    textTransform: 'none',
  },
  dialogTitle: {
    marginTop: -20,
  },

  finalrow: {
    backgroundColor: 'white',
    display: 'flex',
    fontSize: '15px',
    fontWeight: '600',
    padding: '15px 10px 10px 30px',
    marginTop: '20px',
  },
  dialogShadow: {
    marginBottom: '20px',
    background: '#FFFFFF',
    // boxShadow: '0px 4px 10px rgba(77, 88, 128, 0.15)',
  },
  subRowData: {
    textAlign: 'center',
    display: 'flex',
    // alignItems: 'center',
    borderBottom: '1px solid #D4D1D1',
    padding: '22px 0px 0px 22px',
  },
  addRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    height: '35px',
  },
  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lineBorder: {
    borderRight: '1px solid #BDBDBD',
    marginRight: '35px',
    width: '100px',
    paddingTop: '20px',
    paddingLeft: '25px',
  },
  companyName: {
    textAlign: 'left',

    fontWeight: 'bold',
    minWidth: '150px',
  },
  subRowContainer: {
    marginLeft: '-135px',
    marginRight: '-10px',
    backgroundColor: 'white',
    border: '1px solid #E5E5E5',
    marginBottom: '-10px',
  },
  dialogHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: -30,
    marginBottom: -20,
  },
  dialogHeaderActions: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  NewQuoteButton: {
    textAlign: 'center',
    textTransform: 'none',
    color: '#0000EE',
    '&:hover': {
      color: '#0000EE',
    },
  },
  NewPurchaseOrderButton: {
    textAlign: 'center',
    textTransform: 'none',
    color: '#0000EE',
    '&:hover': {
      color: '#0000EE',
    },
  },
  statementNoButton: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '400',
    padding: 0,
    '&:hover': {
      color: 'rgba(0, 0, 0, 0.87)',
    },
  },

  select: {
    '&:before': {
      borderColor: 'red',
    },
    '&:after': {
      borderColor: 'pink',
    },
  },
  '@media print': {
    '& .hide-print': {
      width: '0 !important',
      padding: '0 !important',
      margin: '0 !important',
    },
    cardHeaderContent: {
      justifyContent: 'flex-end',
      padding: '8px',
      borderBottom: 'solid 0.5px #605e5e',
      fontSize: '20px',
    },
    formControl: {
      '& > div ': {
        width: 'fit-content !important',
        paddingTop: '0 !important',
        margin: '0 !important',
      },
      '& > div > div': {
        width: 'fit-content !important',
        marginTop: '0 !important',
        '&::before': {
          display: 'none !important',
        },
      },
      '&  > div > label': {
        display: 'none !important',
      },
    },
    valueContainer: {
      display: 'flex !important',
      flexWrap: 'wrap !important',
      flex: 1,
      alignItems: 'center',
      '& + div': {
        display: 'none !important',
      },
      '& + div, & div': {
        display: 'none !important',
      },
    },
    textField: {
      marginBottom: '16px !important',
      '& > div': {
        width: 'fit-content !important',
        marginTop: '0 !important',
        '&::before': {
          display: 'none !important',
        },
      },
      '& > label': {
        display: 'none !important',
      },
    },
    customInput: {
      '& > div': {
        width: 'fit-content !important',
        marginTop: '0 !important',
        '&::before': {
          display: 'none !important',
        },
      },
      '&  label': {
        display: 'none !important',
      },
    },
    productTable: {
      '& .hide-print': {
        display: 'none',
        width: '0 !important',
        padding: '0 !important',
        margin: '0 !important',
      },
      '& .rt-td, & .rt-thead .rt-th': {
        fontSize: '8px !important',
        width: '54px !important',
        flex: '0 0 auto!important',
        margin: 2,
        padding: 0,
      },
      '& .rt-thead .rt-th > div:first-of-type::after': {
        display: 'none !important',
      },
      '& .rt-thead .rt-th': {
        margin: 0,
        textAlign: 'center',
        fontWeight: 'normal !important',
        fontStretch: 'normal !important',
        fontStyle: 'normal !important',
        lineHeight: 'normal !important',
        letterSpacing: '0.04px !important',
        color: '#2f2e2e !important !important',
        '& > div:first-of-type::after': {
          display: 'none !important',
        },
      },
    },
  },
});
