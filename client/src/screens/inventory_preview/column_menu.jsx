import React from 'react';
import { withStyles } from '@material-ui/core/styles';

// core components
import Checkbox from '@material-ui/core/Checkbox';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Popover from '@material-ui/core/Popover';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';

// material-ui icons
import ColumnIcon from '@material-ui/icons/ViewColumn';

export const styles = (theme) => ({
  columnMenuBtn: {
    border: `1px solid ${theme.palette.primary.main}`,
  },
  formContainer: {
    margin: theme.spacing.unit,
    padding: '0 16px',
  },
  formGroup: {
    marginTop: '8px',
  },
  formControl: {},
  checkbox: {
    width: '12px',
    height: '12px',
    '&$checked': {
      color: '#027cb5',
    },
  },
  checked: {
    '& + $label': {
      color: '#333',
    },
  },
  label: {
    fontSize: '15px',
    margin: '2px 8px',
    color: '#a3a3a3',
  },
});

class ColumnMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      columns: [],
    };
  }

  componentWillMount = () => {
    const { columns } = this.props;
    let newColumns = [];
    columns.forEach((column) => {
      newColumns.push(column);
      if (column.columns) {
        column.columns.forEach((_column) => {
          newColumns.push(_column);
        });
      }
    });
    this.setState({ columns: newColumns });
  };

  handleClick = (event) => {
    event.preventDefault();

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  };

  handleRequestClose = () => {
    this.setState({
      open: false,
    });
  };

  handleColChange = (productType) => (id) => {
    this.props.onColumnUpdate(productType, id);
  };

  render() {
    const { classes, productType, className, theme } = this.props;
    let columns = [];
    this.props.columns.forEach((column) => {
      columns.push(column);
      if (column.columns) {
        column.columns.forEach((_column) => {
          columns.push(_column);
        });
      }
    });
    return (
      <div className={className}>
        <Button
          justIcon
          style={{
            background: this.state.open ? this.props.theme.palette.primary.main : 'inherit',
          }}
          onClick={this.handleClick}
          className={classes.columnMenuBtn}
        >
          <ColumnIcon
            style={{
              color: this.state.open ? '#fff' : theme.palette.primary.main,
            }}
          />
        </Button>
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          onClose={this.handleRequestClose}
        >
          <FormControl component={'fieldset'} className={classes.formContainer}>
            <FormGroup className={classes.formGroup}>
              {columns.map((column, index) => {
                const headerValue = column.headerTitle ? column.headerTitle : column.Header;
                return (
                  <FormControlLabel
                    key={`${productType}-${index}`}
                    classes={{
                      root: classes.formControl,
                      label: classes.label,
                    }}
                    control={
                      <Checkbox
                        classes={{
                          root: classes.checkbox,
                          checked: classes.checked,
                        }}
                        onChange={() => this.handleColChange(productType)(column.id)}
                        checked={column.show}
                        value={`${headerValue}-${index}`}
                      />
                    }
                    label={headerValue}
                  />
                );
              })}
            </FormGroup>
          </FormControl>
        </Popover>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ColumnMenu);
