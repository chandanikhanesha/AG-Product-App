import React, { Component } from 'react';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import { DatePicker } from '@material-ui/pickers';
import { format } from 'date-fns';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import { withStyles } from '@material-ui/core';
import moment from 'moment';

const styles = {
  iconButton: {
    width: '16px',
    height: '16px',
    'vertical-align': 'text-top',
  },
  invoiceDetailsHighlight: {
    backgroundColor: '#008000',
    color: 'white',
    fontWeight: 'bold',
    padding: 6,
  },
  detailsHighlightInvoicePreview: {
    fontWeight: 'bold',
    padding: 6,
  },
};

class InvoiceDatePicker extends Component {
  state = {
    showInvoiceDateDatePicker: false,
  };

  hideInvoiceCurrentDatePickerInputOnBlur = () => {
    if (!this.invoiceCurrentDatePicker.state.open) {
      this.setState({ showInvoiceDateDatePicker: false });
    }
  };

  render() {
    const { currentInvoiceDate, handleInvoiceDateChange, classes } = this.props;
    if (this.state.showInvoiceDateDatePicker) {
      return (
        <ClickAwayListener onClickAway={this.hideInvoiceCurrentDatePickerInputOnBlur}>
          <DatePicker
            ref={(ref) => (this.invoiceCurrentDatePicker = ref)}
            style={{ padding: 0 }}
            leftArrowIcon={<NavigateBefore />}
            rightArrowIcon={<NavigateNext />}
            value={moment.utc(currentInvoiceDate)}
            format="MMMM Do YYYY"
            disablePast={false}
            onChange={handleInvoiceDateChange}
            onClose={() => this.setState({ showInvoiceDateDatePicker: false })}
          />
        </ClickAwayListener>
      );
    } else {
      return (
        <React.Fragment>
          <span
            className={
              this.props.invoicePreview ? classes.detailsHighlightInvoicePreview : classes.invoiceDetailsHighlight
            }
          >
            {moment.utc(currentInvoiceDate).format('MMM D, YYYY')}
          </span>
          <IconButton
            className={`${classes.iconButton} hide-print`}
            style={{ marginLeft: '4px' }}
            onClick={() => this.setState({ showInvoiceDateDatePicker: true })}
          >
            <EditIcon className={classes.iconButton} />
          </IconButton>
        </React.Fragment>
      );
    }
  }
}

export default withStyles(styles)(InvoiceDatePicker);
