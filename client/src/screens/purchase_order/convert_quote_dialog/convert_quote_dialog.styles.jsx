export const convertQuoteDialogStyles = {
  wrapper: {
    padding: 50,
  },
  paper: {
    maxHeight: 435,
  },
  contentContainer: {
    overflowY: 'auto',
    maxHeight: '44.5em',
    display: 'flex',
    alignItems: 'center',
    paddingTop: '12px',
  },
  convertSection: {
    '&:first-of-type': {
      borderRight: '1px solid rgba(0, 0, 0, 0.42)',
      paddingRight: 40,
    },
    '&:nth-of-type(2)': {
      marginLeft: '40px',
    },
  },
  separator: {
    position: 'absolute',
    backgroundColor: '#fff',
    right: 'calc(50% - 10px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 0',
    fontWeight: 600,
  },
  dialogAction: {
    justifyContent: 'flex-start',
    padding: '16px 20px',
    margin: '8px 0',
  },
  nameInput: {
    minWidth: 205,
  },
  selectFormControl: {
    margin: '0px 0 17px 0',
    position: 'relative',
    paddingTop: '11px',
  },
  selectContainer: {
    width: 205,
  },
  selectInput: {
    color: '#495057',
    '&,&::placeholder': {
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '1.42857',
      opacity: '1',
    },
    '&::placeholder': {
      color: '#AAAAAA',
    },
  },
  selectLabel: {
    color: '#AAAAAA',
    fontWeight: '400',
    fontSize: '14px',
    lineHeight: '1.42857',
    top: '10px',
  },
  selectDropDown: {
    maxHeight: '22.5em',
    overflowY: 'auto',
  },
  purchaseOrderInput: {
    display: 'inline-block',
    position: 'relative',
    minWidth: 205,
  },
  buttonBar: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  cta: {
    margin: '0 8px 0 0',
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
  },
};
