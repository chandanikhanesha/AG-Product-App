export const deliveryListStyles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing.unit,
    top: theme.spacing.unit,
    color: theme.palette.grey[500],
  },
  purchaseOrderInput: {
    display: 'inline-block',
    paddingRight: 20,
    position: 'relative',
    minWidth: 205,
    marginLeft: '5px',
  },
  createdAt: {
    marginRight: 15,
    fontSize: 12,
  },
  returnText: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginRight: '10px',
    marginBottom: '10px',
  },
  tableTitle: {
    marginBottom: 0,
    padding: '20px',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  tableTitleContainer: {
    display: 'flex',
    paddingRight: '1.5em',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableContainer: {
    padding: 10,
    marginBottom: 50,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  noFoundMess: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    fontSize: '1rem',
    color: '#858383',
  },
  newButtonBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newButtonBarSpacing: {
    flexGrow: 1,
  },
  textPrimary: {
    color: '#38A154',
  },
  saveTableButton: {},
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    '& + &': {
      marginTop: '.75em',
    },
  },
  lotsFormControl: {
    width: '175px',
  },
  fillQuantityInput: {
    marginLeft: '1.5em',
    width: '98px',
  },
  fillQuantityFormControl: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  fillQtyBtn: {
    color: '#38A154',
    marginLeft: '1em',
  },
  deliveredByFormControl: {
    marginRight: '6.8em',
    width: '130px',
  },
  deliveredAtFormControl: {
    marginLeft: '1em',
    width: '100px',
  },
  totalBagsText: {
    display: 'inline-block',
    width: 'calc(1.5em + 98px)',
    marginTop: '1.5em',
    textAlign: 'right',
  },
  addDetailRowButton: {
    verticalAlign: 'top',
    display: 'inline-block',
    color: '#38A154',
    width: '175px',
    cursor: 'pointer',
    marginTop: '15px',
  },
  removeDetailRowButton: {
    marginLeft: '25px',
    marginTop: '30px',
    color: '#757575',
  },
});
