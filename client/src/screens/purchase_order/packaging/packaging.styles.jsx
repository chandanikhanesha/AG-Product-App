export const packagingStyles = (theme) => ({
  root: {
    ...theme.mixins.gutters(),
    paddingTop: theme.spacing.unit * 2,
    paddingBottom: theme.spacing.unit * 2,
  },
  fieldRoot: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0',
  },
  customTooltip: {
    backgroundColor: 'lightgrey',
    // maxWidth: 220,
  },
  packagingFormControl: {
    paddingRight: 10,
    minWidth: 150,
    marginRight: 20,
  },
  quantityInput: {
    marginRight: 20,
    width: 100,
  },
  warning: {
    color: '#f44336',
  },
  detailButton: {
    color: 'green',
    cursor: 'pointer',
    textAlign: 'left',
  },
  detailFarmPaper: {
    padding: 20,
  },
  detailFarmRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: 100,
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
  },
  alertButton: {
    marginLeft: 100,
    color: 'orange',
  },
  checkButton: {
    marginLeft: 100,
    color: 'green',
  },
});
