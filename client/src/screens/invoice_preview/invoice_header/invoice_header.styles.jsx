export const invoiceHeaderStyles = (theme) => ({
  logo: {
    maxHeight: '100px',
    maxWidth: '100%',
  },
  invoiceHeader: {
    marginBottom: 0,
    borderBottom: '3px solid',
    alignItems: 'center',
  },
  invoiceTitle: {
    textAlign: 'right',
  },
  invoiceDetailsHeader: {
    width: 100,
    display: 'inline-block',
  },
  logo_green: {
    maxWidth: '150px',
  },
  headerWrapper: {
    // height: 410
    paddingTop: 5,
  },
  // "@media print": {
  //   invoiceHeader: {
  //     marginTop: 0
  //   }
  // },
  h3Header: {
    marginTop: 0,
  },
  h5Header: {
    fontSize: '1em',
    marginTop: 0,
    marginBottom: 0,
  },
  invoiceNote: {
    border: '1px dashed gray',
    padding: '0 5px',
  },
  invoiceNoteInput: {
    width: '100%',
    '& div::before': {
      borderBottom: 'none !important',
    },
    '& textarea': {
      overflow: 'hidden',
    },
  },
});
