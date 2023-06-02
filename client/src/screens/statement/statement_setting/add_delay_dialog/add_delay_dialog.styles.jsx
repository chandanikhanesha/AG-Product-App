export const styles = (theme) => ({
  cardIcon: {
    color: 'white',
  },
  formControl: {
    margin: theme.spacing.unit,
    width: 175,
    marginLeft: 0,
  },
  lastDatePicker: {
    margin: theme.spacing.unit,
    width: 175,
  },
  quantityTextField: {
    width: 100,
  },
  detailTable: {
    '& thead': {
      background: theme.palette.grey['100'],
    },
  },
  seedTypeSelector: {
    display: 'inline-block',
    paddingRight: 20,
  },
  dateSetting: {
    marginLeft: 20,
  },
  dateInputField: {
    display: 'inline-block',
    paddingRight: 20,
    marginBottom: 10,
  },
  inputLabelStyles: {
    width: 400,
  },
  dialogTitle: {
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
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '20px',
  },
  addAnotherButton: {
    background: 'white',
    color: '#38A154',
    borderStyle: 'solid',
    borderWidth: '1px',
    marginRight: '12px',
  },
});
