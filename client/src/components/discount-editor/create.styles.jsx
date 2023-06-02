import checkboxStyles from '../../assets/jss/material-dashboard-pro-react/customCheckboxRadioSwitch';

export const styles = (theme) => ({
  ...checkboxStyles,
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
    marginTop: '2.5em',
    '& thead': {
      background: theme.palette.grey['100'],
    },
  },
  seedTypeSelector: {
    display: 'inline-block',
    paddingRight: 20,
  },
  strategySelector: {
    display: 'flex',
    flexDirection: 'row',
  },
  strategySelectorFormControl: {
    marginTop: '2.5em',
    marginBottom: '2.5em',
  },
  strategySelectorLabelLong: {
    maxWidth: '360px',
    marginRight: '3em',
    alignItems: 'flex-start',
    '& > span': {
      alignItems: 'flex-start',
    },
  },
  strategySelectorLabel: {
    maxWidth: '220px',
    marginRight: '3em',
    alignItems: 'flex-start',
    '& > span': {
      alignItems: 'flex-start',
    },
  },
  customLabelTitle: {
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  centerItem: {
    display: 'flex',
    alignItems: 'center',
  },
});
