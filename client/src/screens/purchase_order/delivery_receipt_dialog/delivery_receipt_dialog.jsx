import React from 'react';
import { withStyles } from '@material-ui/core';
import { format } from 'date-fns';

// core components
import Table from '../../../components/material-dashboard/Table/Table';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';
import Button from '../../../components/material-dashboard/CustomButtons/Button';

import { deliveryReceiptDialogstyles } from './delivery_receipt_dialog.styles';

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

export function DeliveryReceiptModal({
  classes,
  open,
  onClose,
  deliveryReceipt,
  getProductNameFromDeliveryDetail,
  purchaseOrderId,
}) {
  const receiptCreatedAt = format(new Date(deliveryReceipt.createdAt), 'MMMM Do YYYY | h:mm a');

  const tableData = deliveryReceipt.DeliveryReceiptDetails.map((record) => {
    const createdDate = format(new Date(record.createdAt), 'MMMM Do YYYY | h:mm a');
    return [getProductNameFromDeliveryDetail(record), record.amountDelivered, createdDate];
  });

  return (
    <Dialog
      open={open}
      onClose={() => onClose()}
      TransitionComponent={Transition}
      maxWidth="md"
      classes={{
        paper: classes.paper,
      }}
    >
      <DialogTitle>Delivery Receipt for {receiptCreatedAt}</DialogTitle>
      <DialogContent className={classes.contentContainer}>
        {deliveryReceipt.name && <p>Delivered by: {deliveryReceipt.name}</p>}
        <Table tableHead={['Product', 'Quantity', 'Date']} tableData={tableData} />
      </DialogContent>
      <DialogActions className={classes.dialogAction}>
        <Button className={classes.CTABar} onClick={() => onClose()}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default withStyles(deliveryReceiptDialogstyles)(DeliveryReceiptModal);
