export const createPurchaseOrderDialogStyles = {
  dialogPaper: {
    maxWidth: '800px !important',
  },
  dialogTitle: {
    padding: '0 24px',
    justifyContent: 'space-between',
    alignItems: 'center',
    display: 'flex',
  },
  dialogTitleAction: {
    display: 'flex',
    alignItems: 'center',
    padding: '0px 10px',
  },
  nameInput: {
    width: '200px',
    marginLeft: 15,
    paddingBottom: 20,
  },
  dialogActions: {
    padding: '20px 10px',
    justifyContent: 'flex-end',
    display: 'flex',
    alignItems: 'center',
  },
  paper: {
    padding: '20px 80px',
    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
  },
  paperTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cardContainer: {
    justifyContent: 'center',
    marginBottom: 20,
  },
  card: {
    width: 250,
    height: 270,
    margin: 10,
    cursor: 'pointer',
    borderColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
    '&:hover, &.selected': {
      borderColor: '#38A154',
    },
    transition: 'border-color 0.2s ease',
  },
  note: {
    color: '#6d6d6d',
    fontSize: 12,
    marginTop: '20px',
  },
  submitButton: {
    height: '44px',
  },
  farmcheckbox: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
};
