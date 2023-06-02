export const bayer_orders_preview_Styles = {
  printButton: {
    position: 'absolute',
    left: '30px',
    top: 0,
  },
  mailButton: {
    position: 'absolute',
    left: '135px',
    top: 0,
  },
  shareholdersSelect: {
    position: 'absolute',
    left: 30,
    top: 60,
  },
  printContainer: {
    // width: 794,
    background: '#FFFFFF',
    // padding: "0px 30px",
    position: 'relative',
    width: '21.59cm',
    // height: '29.7cm',
    // margin: '30mm 45mm 30mm 45mm',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '5mm 10mm',
    '& .ReactTable': {
      fontSize: '0.8em',
      minHeight: 0,
      '& .rt-thead': {
        fontSize: '0.8rem',
        '& .rt-th': {
          fontSize: '0.8rem',
        },
      },
      '& .rt-th, & .rt-td': {
        padding: '0px',
      },
    },
  },
  content_logo: {
    textAlign: 'center',
    textTransform: 'capitalize',
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '40px',
    // marginTop: '-40px',
  },
  logoWrapper: {
    textAlign: 'center',
  },
  logo: {
    maxWidth: '300px',
  },
  logo_green: {
    maxWidth: '150px',
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

  delivery_list_note: {
    display: 'flex',
    fontWeight: 600,
    padding: '10px 0px',
    fontSize: '15px',
  },
  purchase_order_header: {
    display: 'flex',
    fontWeight: 600,
    padding: '10px 0px',
    fontSize: '13px',
  },
  delivery_list_table: {
    border: '1px solid #8b8686',
    width: '100%',
    marginTop: '10px',
    textAlign: 'left',
  },
  delivery_list_table_tr: {
    height: '30px',
  },
  summaryTable: {
    border: '2px solid green',
    marginBottom: 20,
  },
};
