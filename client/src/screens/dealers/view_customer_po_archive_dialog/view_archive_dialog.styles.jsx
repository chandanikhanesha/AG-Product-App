export const viewArchiveDialogStyles = (theme) => ({
  cardIcon: {
    color: 'white',
  },
  addButton: {
    width: 100,
    float: 'right',
    color: 'white',
    background: '#38A154',
    transition: 'none',
    marginBottom: 24,
    marginRight: 16,
    textTransform: 'none',
  },
  dialogTitle: {
    marginTop: -20,
  },
  dialogHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    '&:focus': {
      color: 'rgba(0, 0, 0, 0.87)',
    },
  },
});
