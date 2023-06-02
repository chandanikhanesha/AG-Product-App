import React, { Component } from 'react';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';

import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';

import ReactTable from 'react-table';
import CloseIcon from '@material-ui/icons/Close';

import { viewCustomerStyles } from '../view_customer/view_customer.styles';

class ViewCsv extends Component {
  getCustomerHistoryTableData() {
    const { backupCustomersHistory } = this.props;

    let data = [];

    backupCustomersHistory &&
      backupCustomersHistory
        .filter((item) => item.customerId === null && item.purchaseOrderId === null)
        .map((historyData) => {
          return data.push({
            organizationId: historyData.organizationId,
            seasonYear: historyData.seasonYear,
            csvLink: <a href={historyData.pdfLink}>{historyData.pdfLink}</a>,
          });
        });

    return {
      customerHistoryTableHeader: [
        {
          Header: 'organizationId',
          accessor: 'organizationId',
          width: 150,
        },
        {
          Header: 'SeasonYear',
          accessor: 'seasonYear',
          width: 100,
        },

        {
          Header: 'csvLink',
          accessor: 'csvLink',
          width: 350,
        },
      ],
      customerHistoryTableData: data,
    };
  }

  render() {
    const { classes, onClose, open, customer } = this.props;

    const { customerHistoryTableHeader, customerHistoryTableData } = this.getCustomerHistoryTableData();

    return (
      <Dialog open={open} fullWidth maxWidth="md" onClose={onClose}>
        <DialogTitle onClose={onClose}>
          <div className={classes.dialogHeaderTitle}>
            {customer ? customer.name : ''}
            <div className={classes.dialogHeaderActions}>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
              <h5> Previous Season Inventories</h5>
            </div>
          </div>
        </DialogTitle>
        <Divider style={{ marginTop: '-20px' }} />
        <DialogContent
          style={{
            maxHeight: '300px',
            minHeight: '300px',
            display: 'block !important',
          }}
        >
          <ReactTable
            data={customerHistoryTableData}
            columns={customerHistoryTableHeader}
            minRows={1}
            resizable={false}
            showPagination={false}
          />
        </DialogContent>
      </Dialog>
    );
  }
}

export default withStyles(viewCustomerStyles)(ViewCsv);
