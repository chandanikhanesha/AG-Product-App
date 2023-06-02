import React, { Component } from 'react';
import moment from 'moment';
// import { Link } from "react-router-dom";

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import Button from '../../../components/material-dashboard/CustomButtons/Button';

import { viewArchiveDialogStyles } from './view_archive_dialog.styles';

class ViewArchiveDialog extends Component {
  state = {};

  // componentWillMount = () => {
  //   console.log(this.props.statements)
  // }

  openInNewtab = (url) => {
    let win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  };

  render() {
    const { classes, onClose, open, customer, isQuote } = this.props;

    let subject = isQuote ? 'Quote' : 'Purchase Order';
    let subjectLinkName = isQuote ? 'quote' : 'purchase_order';

    let orders = customer.PurchaseOrders
      ? customer.PurchaseOrders.filter((po) => po.isQuote === isQuote && po.isArchive)
      : null;

    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="md">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            View Archived {subject} For {customer.name}
            <div className={classes.dialogHeaderActions}>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>{subject}</TableCell>
              <TableCell>Created Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell component="th" scope="row">
                  <Button
                    simple={true}
                    className={classes.statementNoButton}
                    onClick={() => {
                      this.openInNewtab(`/app/customers/${customer.id}/${subjectLinkName}/${order.id}`);
                    }}
                  >
                    {order.name}
                  </Button>
                </TableCell>
                <TableCell>{moment.utc(order.createdAt).format('MM/DD/YYYY')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div>
          <Button type="submit" color="primary" className={classes.addButton} value="Add" onClick={onClose}>
            CLOSE
          </Button>
        </div>
      </Dialog>
    );
  }
}

export default withStyles(viewArchiveDialogStyles)(ViewArchiveDialog);
