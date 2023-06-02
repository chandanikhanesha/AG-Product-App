export const productRelatedInfoDialogStyles = (theme) => ({
  dialogTitle: {
    marginTop: -20,
    padding: '24px 24px 10px 50px',
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
  productGridContainer: {
    backgroundColor: 'whitesmoke',
    padding: '10px 10px 10px 50px',
  },
  productGrid: {
    backgroundColor: 'whitesmoke',
    alignItems: 'center',
  },
  productGridHeader: {
    color: 'grey',
    margin: 0,
  },
  productGridBody: {
    margin: 0,
    fontSize: '1rem !important',
  },
  linkQT: {
    color: 'rgba(0, 0, 0, 0.87)',
    fontWeight: '400',
    padding: 0,
    '&:hover': {
      color: 'rgba(0, 0, 0, 0.87)',
    },
  },
});
