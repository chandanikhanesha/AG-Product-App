import React, { Component } from 'react';
import ReactTable from 'react-table';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { format } from 'date-fns';
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';

import { numberToDollars, customerProductDiscountsTotals, perWholeOrderDiscount } from '../../../utilities';

import { paymentTableStyles } from './payment_table.styles';

class PaymentsTable extends Component {
  get paymentsColumns() {
    const { selectedFontSize } = this.props;
    return [
      {
        Header: 'Paid on',
        accessor: 'paidOn',
        headerStyle: { fontSize: selectedFontSize, fontWeight: 'bold' },
      },
      {
        Header: 'Paid By',
        accessor: 'paidBy',
        headerStyle: { fontSize: selectedFontSize, fontWeight: 'bold' },
      },
      {
        Header: 'Method',
        accessor: 'paymentMethod',
        headerStyle: { fontSize: selectedFontSize, fontWeight: 'bold' },
      },
      {
        Header: '',
        accessor: 'placeholder',
      },
      {
        Header: '$ Amount',
        accessor: 'paymentAmount',
        headerStyle: { textAlign: 'left', fontSize: selectedFontSize, fontWeight: 'bold' },
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
          if (selectedShareholder.id === 'theCustomer') {
            return payment.shareholderId === 0;
          } else {
            return payment.shareholderId === selectedShareholder.id;
          }
        } else {
          return true;
        }
      })
      .forEach((payment) => {
        let paidBy = '-';
        let paymentMethod = '';
        let amount = 0;
        if (!isNaN(payment.shareholderId)) {
          let payer = shareholders.find((shareholder) => shareholder.id === payment.shareholderId);
          if (payer) {
            paidBy = payer.name;
          } else if (payment.shareholderId === 0) {
            paidBy = customer.name;
          }
        }

        payment.multiCompanyData.length > 0
          ? payment.multiCompanyData.map((pp) => (amount += parseFloat(pp.amount)))
          : (amount = parseFloat(payment.amount));

        if (!(payment.method === 'Return')) {
          //if (payment.method === 'Cash' || payment.method === 'Check') {
          paymentMethod = payment.note ? `${payment.method} - #${payment.note}` : payment.method;
          amount = amount;
        } else {
          paymentMethod = payment.note ? `${payment.method} - #${payment.note}` : payment.method;
          paidBy = payment.payBy;
          amount = -1 * parseFloat(amount);
        }

        rows.push({
          paidOn: format(payment.paymentDate, 'MM/DD/YY'),
          paidBy,
          paymentMethod: paymentMethod,
          paymentAmount: numberToDollars(amount),
        });
        total += parseFloat(amount);
      });
    if (rows.length == 0) {
      rows.push({
        paidOn: '-',
        paidBy: '-',
        paymentMethod: '-',
        paymentAmount: '-',
      });
    }
    rows.push({
      paidOn: 'Payment Summary',
      paidBy: '',
      paymentMethod: '',
      placeholder: 'Total Paid',
      paymentAmount: numberToDollars(total),
    });
    // rows.push({
    //   paidOn: 'Grand Total',
    //   paidBy: this.props.grandTotal,
    //   paymentMethod: '',
    //   placeholder: 'Balance Due',
    //   paymentAmount: numberToDollars(parseFloat(this.props.grandTotal.substring(1).replace(',', '')) - total),
    // });

    return { rows, total };
  }

  getWholeOrderCoulmns() {
    const { selectedFontSize } = this.props;
    return [
      {
        Header: 'Whole Order Discount Summary ',
        show: true,
        accessor: 'name',
        width: 270,
        headerStyle: {
          textAlign: 'left',
          fontSize: selectedFontSize,
          fontWeight: 'bold',
        },
      },
      {
        Header: 'Discount Amount',
        show: true,
        accessor: 'amount',
        width: 150,
        headerStyle: {
          textAlign: 'left',
          fontSize: selectedFontSize,
          fontWeight: 'bold',
        },
      },
      {
        Header: 'Comments',
        show: true,
        accessor: 'comment',
        width: 150,
        headerStyle: {
          textAlign: 'left',
          fontSize: selectedFontSize,
          fontWeight: 'bold',
        },
      },
    ];
  }

  wholeOrderTable() {
    const { dealerDiscounts, currentPurchaseOrder, classes, selectedShareholder, selectedFontSize } = this.props;
    const customerOrders = currentPurchaseOrder.CustomerProducts.sort((a, b) => a.productId - b.productId).concat(
      currentPurchaseOrder.CustomerCustomProducts.sort((a, b) => a.customProductId - b.customProductId),
      currentPurchaseOrder.CustomerMonsantoProducts,
    );
    let totals = {
      subTotal: 0,
      quantity: 0,
    };

    customerOrders
      .filter((order) => order.orderQty >= 0)
      .filter((order) => {
        if (order.MonsantoProduct && order.isDeleted) return null;
        return order;
      })
      .forEach((order) => {
        let preTotal;
        let product;
        let msrp;
        if (order.Product) {
          msrp = order.msrpEdited ? order.msrpEdited || 0 : order.Product.msrp || 0;
          preTotal = order.orderQty * parseFloat(msrp !== null ? msrp : 0);
          preTotal = preTotal.toFixed(2);
          product = order.Product;
        } else if (order.CustomProduct) {
          msrp = order.msrpEdited ? order.msrpEdited : order.CustomProduct.costUnit;
          preTotal = order.orderQty * parseFloat(msrp !== null ? msrp : 0);
          preTotal = preTotal.toFixed(2);
          product = order.CustomProduct;
        } else if (order.MonsantoProduct) {
          msrp = order.msrpEdited ? order.msrpEdited : order.price;
          preTotal = order.orderQty * parseFloat(msrp !== null ? msrp : 0);
          preTotal = preTotal.toFixed(2);
          product = order.MonsantoProduct;
        }

        const discountsPOJO = order.discounts
          .map((discount) => {
            return dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
          })
          .filter((el) => el);
        const { total: customerProductDiscountsTotal } = customerProductDiscountsTotals(
          order,
          discountsPOJO,
          product,
          null,
          null,
          null,
          currentPurchaseOrder,
        );
        totals.subTotal += customerProductDiscountsTotal;
        totals.quantity += order.orderQty;
      });

    const perWholeOrderDiscounts = dealerDiscounts.filter((discount) => discount.applyToWholeOrder === true);

    const { orderDiscountsAmount: orderWholeDiscountsAmount, discountDetails: orderWholeDiscountDetails } =
      perWholeOrderDiscount(
        totals.subTotal,
        totals.quantity,
        currentPurchaseOrder,
        perWholeOrderDiscounts,
        selectedShareholder,
      );

    if (this.props.updateOrderWholeDiscountsAmount)
      this.props.updateOrderWholeDiscountsAmount(orderWholeDiscountsAmount);

    const tableData = perWholeOrderDiscounts
      .map((item) =>
        orderWholeDiscountDetails[item.id]
          ? {
              name: item.name,
              amount: numberToDollars(orderWholeDiscountDetails[item.id]),
              comment: currentPurchaseOrder.dealerDiscounts.find((i) => i.DiscountId == item.id).comment,
            }
          : false,
      )
      .filter((item) => item);

    if (tableData.length > 0) {
      tableData.push({
        name: (
          <div>
            <span className={classes.summaryCellTitle}>SUMMARY</span>
            <br />
          </div>
        ),
        amount: (
          <div>
            <span className={classes.summaryCellTitle}>Total discount</span>
            <br />
            <span>{numberToDollars(orderWholeDiscountsAmount)}</span>
          </div>
        ),
      });
      return (
        <div className="invoice-table-wrapper" style={{ marginBottom: '10px' }}>
          <ReactTable
            sortable={true}
            showPagination={false}
            resizable={false}
            minRows={1}
            columns={this.getWholeOrderCoulmns()}
            data={tableData}
            className={`${this.props.classes.paymentsTable} no-white-space paymentsTable`}
            getTheadTrProps={() => {
              return {
                style: {
                  color: '#3C4858',
                  background: '#CDDFC8',
                  fontWeight: 'bold',
                  fontSize: this.props.selectedFontSize,
                },
              };
            }}
            getTrProps={(state, rowInfo) => {
              let style = { fontSize: selectedFontSize };
              if (rowInfo && rowInfo.index === state.resolvedData.length - 1) {
                style = {
                  ...style,
                  background: '#DDDDDD',
                  fontWeight: 'bold',
                };
              }
              return { style };
            }}
          />
        </div>
      );
    } else {
      return null;
    }
  }

  render() {
    // if (this.paymentsTableData.length < 2) return null;
    const { rows, total } = this.paymentsTableData;

    return (
      <div className="invoice-table-wrapper" style={{ fontSize: this.props.selectedFontSize }}>
        {this.props.payments.filter((payment) => payment.purchaseOrderId === this.props.purchaseOrder.id).length >
          0 && (
          <div>
            <h4>Payment</h4>
            <ReactTable
              sortable={true}
              showPagination={false}
              minRows={1}
              columns={this.paymentsColumns}
              data={rows}
              className={this.props.classes.paymentsTable}
              getTheadTrProps={() => {
                return {
                  style: {
                    color: '#3C4858',
                    background: '#CDDFC8',
                    fontWeight: 'bold',
                    fontSize: this.props.selectedFontSize,
                  },
                };
              }}
              getTrProps={(state, rowInfo) => {
                let style = { fontSize: this.props.selectedFontSize };
                if (rowInfo.index === state.resolvedData.length - 1) {
                  style = {
                    background: '#DDDDDD',
                    fontWeight: 'bold',
                    fontSize: this.props.selectedFontSize,
                  };
                }
                return {
                  style,
                };
              }}
            />
          </div>
        )}
        {this.wholeOrderTable()}
        {/*    <GridContainer
          justifyContent="center"
          style={{
            padding: '8px',
            fontWeight: 'bold',
            fontSize: this.props.selectedFontSize,
            margin: '0px 0px 15px 0px',
            border: '0.1px solid gray',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <GridItem xs={6}>Grand Total : {this.props.grandTotal}</GridItem>
          <GridItem xs={6}>
            Balance Due:{' '}
            {this.props.remainingPayment == ''
              ? numberToDollars(
                  parseFloat((this.props.grandTotal && this.props.grandTotal.substring(1).replace(',', '')) || 0) -
                    total,
                )
              : numberToDollars(this.props.remainingPayment)}
          </GridItem>
              </GridContainer>*/}
        <h5>{(this.props.organization && this.props.organization.message) || ''}</h5>
      </div>
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

export default withStyles(paymentTableStyles)(PaymentsTable);
