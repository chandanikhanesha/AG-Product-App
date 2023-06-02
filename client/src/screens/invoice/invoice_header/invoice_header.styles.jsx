export const invoiceHeaderStyles = (theme) => ({
  logo: {
    maxHeight: '100px',
    maxWidth: '120px',
  },
  invoiceHeader: {
    marginTop: '18px',
    marginBottom: '18px',
    borderBottom: '3px solid',
  },
  invoiceTitle: {
    textAlign: 'right',
  },
  invoiceDetailsHeader: {
    width: 100,
    display: 'inline-block',
  },
  invoiceDetailsHighlight: {
    backgroundColor: '#008000',
    color: 'white',
    fontWeight: 'bold',
    padding: 5,
  },
  '@media print': {
    invoiceHeader: {
      marginTop: 0,
    },
  },
});
