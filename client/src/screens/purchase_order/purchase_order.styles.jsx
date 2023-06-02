import sweetAlertStyle from '../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';

export const purchaseOrderStyles = (theme) =>
  Object.assign(
    {
      root: {
        flexGrow: 1,
      },
      nameInput: {
        width: 300,
      },
      productDetailRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      earlyPayTable: {
        border: '1px solid gray',
        marginBottom: 0,
        minHeight: '100px',
      },
      titlePayment: {
        fontSize: '14px',
        color: '#008000',
      },
      productGrid: {
        padding: '40px 50px 0px 0px',
      },

      poFlexClass: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      },
      invoicepaymentSummary: {
        fontWeight: 'bold',
        fontSize: '1.1rem',
        alignItems: 'center',
        display: 'flex',
        height: '17%',
        color: 'black',
      },
      paymentSummaryContainer: {
        border: '1px solid black',
        borderRadius: '4px',
        marginBottom: '10px',
        marginTop: '30px',
      },
      finalrow: {
        backgroundColor: 'rgb(221, 221, 221)',
        display: 'flex',
        fontSize: '15px',
        fontWeight: '600',
        padding: '15px 10px 10px 10px',
        marginTop: '20px',
      },
      dialogHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        fontWeight: 600,
      },
      warningIcon: {
        color: 'gold',
        marginLeft: 30,
        fontSize: 30,
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
      createdAt: {
        marginRight: 15,
        fontSize: 12,
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
        minWidth: 310,
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
        marginBottom: 50,
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
      discountList: {
        listDisplay: 'none',
        paddingLeft: 0,
      },
      discountListItem: {
        '&:not(:first-child)': {
          paddingTop: '7px',
        },
      },
      productTypeMeta: {
        display: 'flex',
        '& *': {
          marginRight: 30,
        },
      },
      newButtonBar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      },
      newButtonBarSpacing: {
        flexGrow: 1,
      },
      progressItem: {
        width: 150,
        marginRight: 24,
        marginBottom: -15,
      },
      progressTitle: {
        marginRight: 8,
      },
      iconButton: {
        background: 'transparent',
        color: 'grey',
        border: '1px solid #38A154',
        padding: 7,
        margin: '8px 16px',
        height: '40px',
      },
      tableTotalRow: {
        background: 'rgb(236, 243, 238)',
        padding: '10px 60px',
        textAlign: 'right',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
      },
      tableTotalRowLabel: {
        width: 200,
        margin: 0,
        display: 'flex',
        justifyContent: 'flex-start',
      },
      tableTotalRowNumber: {
        width: 200,
        margin: 0,
        display: 'flex',
        justifyContent: 'flex-start',
      },
      orderTotalPaper: {
        color: 'white',
        background: 'black',
        padding: '32px 0',
      },
      orderTotalTitle: {
        fontSize: 25,
        lineHeight: '40px',
        paddingLeft: 24,
        borderBottom: '1px solid white',
        margin: 0,
        paddingBottom: 24,
      },
      orderTotalDisplayRow: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        padding: '20px 100px 0 0',
      },
      orderTotalDisplayContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
      },
      orderTotalDisplayLabel: {
        textAlign: 'right',
        margin: 0,
      },
      orderTotalDisplayNumber: {
        width: 150,
        textAlign: 'right',
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
      companyBrand: {
        marginBottom: -5,
        color: '#605E5E',
      },
      poSelector: {
        margin: 0,
      },
      backToCustomerLink: {
        color: 'black',
        borderBottom: '1px solid transparent',
        '&:hover': {
          borderBottomColor: '#38A154',
          color: '#38A154',
        },
      },
      submitButton: {
        marginLeft: 10,
        height: 40,
      },
    },
    sweetAlertStyle,
  );
