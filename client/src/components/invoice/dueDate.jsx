import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { updateDefaultDaysToDueDate } from '../../store/actions';
import { format } from 'date-fns';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import { withStyles } from '@material-ui/core';
import DueDateDialog from './dueDateDialog';

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
    backgroundColor: '#fcf63d',
    fontWeight: 'bold',
    padding: 6,
  },
};

class InvoiceDueDate extends Component {
  state = {
    showDueDateDialog: false,
    daysToDueDate: (this.props.purchaseOrder && this.props.purchaseOrder.InvoiceDueDate) || new Date(),
  };

  updateDaysToDueDate = (daysToDueDate, keepDaysToDueDate) => {
    const { updateDefaultDaysToDueDate, purchaseOrder } = this.props;
    if (keepDaysToDueDate) {
      updateDefaultDaysToDueDate({ purchaseOrderId: purchaseOrder.id, date: daysToDueDate, isInvoiceDueDate: true });
    }
    this.setState({ daysToDueDate });
  };

  getDueDate = () => {
    const { currentInvoiceDate } = this.props;
    const { daysToDueDate } = this.state;
    return new Date(daysToDueDate);
  };

  render() {
    const { organization, classes } = this.props;
    return (
      <React.Fragment>
        <span
          className={
            this.props.invoicePreview ? classes.detailsHighlightInvoicePreview : classes.invoiceDetailsHighlight
          }
        >
          {format(this.getDueDate(), 'MMM D, YYYY')}
        </span>
        <IconButton
          className={`${classes.iconButton} hide-print`}
          style={{ marginLeft: '4px' }}
          onClick={() => this.setState({ showDueDateDialog: true })}
        >
          <EditIcon className={classes.iconButton} />
        </IconButton>
        <DueDateDialog
          showDueDateDialog={this.state.showDueDateDialog}
          daysToDueDate={organization.daysToInvoiceDueDateDefault}
          organization={organization}
          updateDaysToDueDate={this.updateDaysToDueDate}
          cancelDueDateDialog={() => this.setState({ showDueDateDialog: false })}
        />
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateDefaultDaysToDueDate,
    },
    dispatch,
  );

export default withStyles(styles)(connect(null, mapDispatchToProps)(InvoiceDueDate));
