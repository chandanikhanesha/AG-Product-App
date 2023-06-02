export const invoicePresenterStyles = {
  printButton: {
    // position: 'absolute',
    // left: '30px',
    // top: 0,
    height: '40px',
    width: '70px',
    marginRight: '25px',
  },
  mailButton: {
    // position: 'absolute',
    // left: '135px',
    // top: 0,
    height: '40px',
    width: '70px',
    marginRight: '25px',
  },
  wholeorder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '82%',
  },
  checkboxText: {
    // position: 'absolute',
    // left: '10px',
    // top: '55px',
    // cursor: 'pointer',
    marginRight: '25px',
    display: 'flex',
    alignItems: 'center',
  },
  tabContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    alignItems: 'baseline',
    marginTop: '-10px',
  },
  shareholdersSelect: {
    // position: 'absolute',
    // left: 30,
    // top: 60,
    marginRight: '25px',
  },
  paymentSummary: {
    fontWeight: 'bold',
    fontSize: '1.1rem',
    alignItems: 'center',
    display: 'flex',
    height: '100%',
    color: 'black',
  },

  paymentSummaryContainer: {
    border: '1px solid black',
    borderRadius: '4px',
    marginBottom: '10px',
  },
  printContainer: {
    // width: 794,
    background: '#FFFFFF',
    // padding: "0px 30px",
    position: 'relative',
    width: '22.40cm',
    // height: '29.7cm',
    // margin: '30mm 45mm 30mm 45mm',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '5mm 5mm 0 5mm',
    '& .ReactTable': {
      fontSize: '0.6em',
      minHeight: 0,
      '& .rt-thead': {
        fontSize: '0.6rem',
        '& .rt-th': {
          fontSize: '0.6rem',
        },
      },
      '& .rt-th, & .rt-td': {
        padding: '2px 5px',
      },
    },
  },
  content: {},
  logo_green: {
    maxWidth: '150px',
  },
  content_logo: {
    textAlign: 'center',
    textTransform: 'capitalize',
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '40px',
    // marginTop: '-40px',
  },
  titlePayment: {
    fontSize: '14px',
    color: '#008000',
  },
  logoWrapper: {
    textAlign: 'center',
  },
  logo: {
    maxWidth: '300px',
  },
  farmPaper: {
    padding: 10,
    marginTop: 20,
  },
  total: {
    textAlign: 'center',
  },
  invoiceDetailsHeader: {
    width: 100,
    display: 'inline-block',
  },
};
