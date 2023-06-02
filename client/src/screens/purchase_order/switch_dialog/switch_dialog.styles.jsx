export const switchDialogStyles = {
  dialogPaper: {
    maxWidth: 800,
  },
  dialogTitle: {
    padding: '0 24px',
    justifyContent: 'space-between',
    alignItems: 'center',
    display: 'flex',
  },
  dialogActions: {
    padding: 24,
    justifyContent: 'flex-end',
    display: 'flex',
  },
  paper: {
    padding: '80px',
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
  },
};
