import React, { Component } from 'react';
import PropTypes from 'prop-types';

// material dashboard components
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';

import moment from 'moment';
// material ui components
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { DatePicker } from '@material-ui/pickers';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';

class DueDateDialog extends Component {
  constructor(props) {
    super(props);
    const { daysToDueDate } = this.props;
    this.daysInput = null;
    this.state = {
      daysToDueDate: daysToDueDate || 10,
      keepDaysToDueDate: daysToDueDate !== undefined,
      lastDate: null,
    };
  }

  componentDidMount() {
    const { daysToDueDate } = this.props;
    this.setState({ daysToDueDate });
  }

  submit = () => {
    const { daysToDueDate, keepDaysToDueDate } = this.state;
    this.props.updateDaysToDueDate(daysToDueDate, keepDaysToDueDate);
    this.props.cancelDueDateDialog();
  };

  handleDateChange = (date) => {
    this.setState({
      lastDate: moment.utc(date._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
      daysToDueDate: moment.utc(date._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
    });
  };

  render() {
    const { showDueDateDialog, cancelDueDateDialog } = this.props;
    const { keepDaysToDueDate, lastDate } = this.state;

    return (
      <Dialog open={showDueDateDialog}>
        {/* <Dialog open={showDueDateDialog} onEntered={() => this.daysInput.focus()}> */}
        <DialogTitle>Invoice Due Date</DialogTitle>
        <DialogContent>
          {/* <CustomInput
            labelText={'Days to due date'}
            id="daysToDueDate"
            inputProps={{
              type: 'number',
              inputRef: (ref) => (this.daysInput = ref),
              defaultValue: daysToDueDate,
              onChange: (e) => this.setState({ daysToDueDate: e.target.value }),
            }}
          /> */}
          <DatePicker
            // className={classes.lastDatePicker}
            leftArrowIcon={<NavigateBefore />}
            rightArrowIcon={<NavigateNext />}
            format="MMMM Do YYYY"
            disablePast={false}
            emptyLabel="Days to due date"
            value={lastDate}
            onChange={this.handleDateChange}
          />
          <br />
          <FormControlLabel
            className={'hide-print'}
            label="Keep on future invoices"
            control={
              <Checkbox
                checked={keepDaysToDueDate}
                onChange={({ target: { checked } }) => this.setState({ keepDaysToDueDate: checked })}
              />
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={cancelDueDateDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={this.submit} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

DueDateDialog.propTypes = {
  updateDaysToDueDate: PropTypes.func.isRequired,
  showDueDateDialog: PropTypes.bool.isRequired,
  cancelDueDateDialog: PropTypes.func.isRequired,
};

export default DueDateDialog;
