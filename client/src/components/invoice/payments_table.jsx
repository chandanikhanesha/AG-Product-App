import React, { Component } from 'react';
import ReactTable from 'react-table';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { format } from 'date-fns';

import { numberToDollars } from '../../utilities';

const styles = {
  paymentsTable: {
    border: '1px solid gray',
    marginBottom: 20,
  },
};

class PaymentsTable extends Component {
  get paymentsColumns() {
    return [
      {
        Header: 'Paid on',
        accessor: 'paidOn',
      },
      {
        Header: 'Paid By',
        accessor: 'paidBy',
      },
      {
        Header: 'Method',
        accessor: 'paymentMethod',
      },
      {
        Header: '',
        accessor: 'placeholder',
      },
      {
        Header: '$ Amount',
        accessor: 'paymentAmount',
        headerStyle: { textAlign: 'left' },
      },
    ];
  }

  get paymentsTableData() {
    const { payments, shareholders, selectedShareholder, customer, purchaseOrder } = this.props;
    let rows = [];
    let total = 0;
    payments
      .filter((payment) => payment.purchaseOrderId === purchaseOrder.id)
      .filter((payment) => {
        if (selectedShareholder) {
          return payment.shareholderId === selectedShareholder.id;
        } else {
          return true;
        }
      })
      .forEach((payment) => {
        let paidBy = '-';
        if (!isNaN(payment.shareholderId)) {
          let payer = shareholders.find((shareholder) => shareholder.id === payment.shareholderId);
          if (payer) {
            paidBy = payer.name;
          } else if (payment.shareholderId === 0) {
            paidBy = customer.name;
          }
        }
        rows.push({
          paidOn: format(payment.paymentDate, 'MM/DD/YY'),
          paidBy,
          paymentMethod: payment.method,
          paymentAmount: numberToDollars(payment.amount),
        });
        total += parseFloat(payment.amount);
      });

    rows.push({
      paidOn: 'Payment Summary',
      placeholder: 'Total Paid',
      paymentAmount: numberToDollars(total),
    });

    return rows;
  }

  render() {
    if (this.paymentsTableData.length < 2) return null;
    return (
      <ReactTable
        sortable={false}
        showPagination={false}
        minRows={1}
        columns={this.paymentsColumns}
        data={this.paymentsTableData}
        className={this.props.classes.paymentsTable}
        getTrProps={(state, rowInfo) => {
          let style = {};
          if (rowInfo.index === state.resolvedData.length - 1) {
            style = {
              background: '#DDDDDD',
              fontWeight: 'bold',
            };
          }
          return {
            style,
          };
        }}
      ></ReactTable>
    );
  }
}

PaymentsTable.propTypes = {
  payments: PropTypes.array.isRequired,
  shareholders: PropTypes.array.isRequired,
  customer: PropTypes.object.isRequired,
  selectedShareholder: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  purchaseOrder: PropTypes.object.isRequired,
};

export default withStyles(styles)(PaymentsTable);
