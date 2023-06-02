export const viewCustomerStyles = (theme) => ({
  cardIcon: {
    color: 'white',
  },
  saveButton: {
    width: 100,
    float: 'right',
    color: 'white',
    background: '#38A154',
    transition: 'none',
    marginBottom: 24,
    marginRight: 16,
    fontWeight: 600,
    '&:hover': {
      backgroundColor: '#38A154',
    },
  },
  viewArchButton: {
    width: 180,
    float: 'right',
    color: 'white',
    background: '#38A154',
    transition: 'none',
    textAlign: 'left',
    // marginBottom: 24,
    // marginRight: 16,
    fontWeight: 600,
    fontSize: 8,
  },
  dialogHeaderTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dialogHeaderActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  dialogFooter: {
    marginTop: 14,
    display: 'flex',
    justifyContent: 'space-between',
    // justifyContent: "flex-end",
    alignItems: 'center',
  },
  datePicker: { marginTop: 30 },
  viewArchiveButton: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '400',
    padding: 0,
    justifyContent: 'flex-start',
    '&:hover': {
      color: 'rgba(0, 0, 0, 0.87)',
    },
    '&:focus': {
      color: 'rgba(0, 0, 0, 0.87)',
    },
  },
});
