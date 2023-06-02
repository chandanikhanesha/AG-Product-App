import React, { Component } from 'react';
import ReactTable from 'react-table';
import {
  format,
  addDays,
  addMonths,
  // differenceInDays,
  // isToday
} from 'date-fns';
// import { isEmpty } from "lodash/lang";
// import moment from "moment";

import { withStyles, Grid } from '@material-ui/core';

import InvoiceHeader from './invoice_header';
import { invoiceTableStyles } from './invoice_table.styles';

import { numberToDollars } from '../../../../utilities';
// import { getProductFromOrder, getProductName } from "utilities/product";
// import { getAppliedDiscounts } from "utilities/purchase_order";

class InvoiceTable extends Component {
  state = {
    tableData: [],
    summmaryColumns: [
      {
        Header: 'Qty',
        accessor: 'qty',
        headerStyle: {
          textAlign: 'center',
          borderLeft: '1px solid',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      {
        Header: 'Item',
        accessor: 'item',
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      {
        Header: 'Description',
        accessor: 'description',
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      // {
      //   Header: "Serial #",
      //   accessor: "serial",
      //   headerStyle: {
      //     textAlign: "center",
      //     borderBottom: "2px solid",
      //     borderRight: "2px solid",
      //     backgroundColor: "lightgrey"
      //   }
      // },
      {
        Header: 'Rate',
        accessor: 'rate',
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      // {
      //   Header: "S.O. No.",
      //   accessor: "SONo",
      //   headerStyle: {
      //     textAlign: "center",
      //     borderBottom: "2px solid",
      //     borderRight: "2px solid",
      //     backgroundColor: "lightgrey"
      //   }
      // },
      {
        Header: 'Amount',
        accessor: 'amount',
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '1px solid',
          backgroundColor: 'lightgrey',
        },
      },
    ],
  };

  totalNetPrice = 0;

  componentWillMount = () => {
    const { purchaseOrderStatement } = this.props;
    let tableData = [];

    tableData = purchaseOrderStatement.statementData;
    this.totalNetPrice = purchaseOrderStatement.totalAmount;

    this.setState({
      tableData,
    });
  };

  invoiceTable() {
    const { classes } = this.props;
    const { tableData } = this.state;

    if (!tableData || tableData.length < 1) return null;
    return (
      <React.Fragment>
        <ReactTable
          sortable={false}
          showPagination={false}
          minRows={1}
          defaultPageSize={tableData.length}
          columns={this.state.summmaryColumns}
          data={tableData}
          className={classes.reactTable}
          getTrProps={(state, rowInfo) => {
            let style = {
              borderLeft: '2px solid',
              borderBottom: '2px solid',
            };
            if (rowInfo.index % 2 === 1) {
              style = {
                borderLeft: '2px solid',
                borderBottom: '2px solid',
                background: '#DDDDDD',
              };
            }
            return { style };
          }}
        />
      </React.Fragment>
    );
  }

  render() {
    const { classes, currentstatement, purchaseOrder } = this.props;
    const { compoundingDays, startDate, statementNo } = currentstatement;

    let dueDate = null;
    if (compoundingDays === 14) dueDate = addDays(startDate, 14);
    if (compoundingDays === 30) dueDate = addMonths(startDate, 1);
    if (compoundingDays === 90) dueDate = addMonths(startDate, 3);

    return (
      <div className={classes.tableStyle}>
        <InvoiceHeader statementNo={statementNo} purchaseOrder={purchaseOrder} />
        <Grid container>
          <Grid container xs={4} direction="column">
            <Grid item className={classes.gridBorderTop}>
              Salesperson
            </Grid>
            <Grid item className={classes.gridBorderBottom}>
              Donald
            </Grid>
          </Grid>
          <Grid container xs={4} direction="column">
            <Grid item className={classes.gridBorderMiddleTRB}>
              Due Date
            </Grid>
            <Grid item className={classes.gridBorderRight}>
              {format(dueDate, 'DD/MM/YYYY')}
            </Grid>
          </Grid>
          <Grid container xs={4} direction="column">
            <Grid item className={classes.gridBorderMiddleTRB}>
              Customer Phone
            </Grid>
            <Grid item className={classes.gridBorderRight}>
              308-530-8828
            </Grid>
          </Grid>
        </Grid>
        {this.invoiceTable()}
        <Grid container>
          <Grid item xs={9} className={classes.gridBorderLB} />
          <Grid container xs={3} className={classes.gridBorderLBR}>
            <Grid item xs={8}>
              <h6>SubTotal</h6>
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={3}>
              {numberToDollars(this.totalNetPrice)}
            </Grid>
          </Grid>
          <Grid item xs={9}>
            <Grid container xs={2} direction="column" className={classes.flexGrid}>
              <Grid item className={classes.gridBorderTop}>
                Due Date
              </Grid>
              <Grid item className={classes.gridBorderLBR}>
                10/28/2019
              </Grid>
            </Grid>
          </Grid>
          <Grid container xs={3} direction="column">
            <Grid container className={classes.gridBorderLBR}>
              <Grid item xs={8}>
                <h6>Sales Tax (0.0%)</h6>
              </Grid>
              <Grid item xs={1} />
              <Grid item xs={3}>
                $0.00
              </Grid>
            </Grid>
            <Grid container className={classes.gridBorderLBR}>
              <Grid item xs={8}>
                <h6>Total</h6>
              </Grid>
              <Grid item xs={1} />
              <Grid item xs={3}>
                {numberToDollars(this.totalNetPrice)}
              </Grid>
            </Grid>
            <Grid container className={classes.gridBorderLBR}>
              <Grid item xs={8}>
                <h5>Balance Due</h5>
              </Grid>
              <Grid item xs={1} />
              <Grid item xs={3}>
                {numberToDollars(this.totalNetPrice)}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default withStyles(invoiceTableStyles)(InvoiceTable);
