import React, { Component } from 'react';
import moment from 'moment';
import SweetAlert from 'react-bootstrap-sweetalert';
import { withStyles, Paper, Popover, MenuList, MenuItem } from '@material-ui/core';
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
import Tabs from '../../../components/material-dashboard/CustomTabs/CustomTabs';
import { getFutureDiscountTotals } from '../../../utilities/purchase_order';
import { format } from 'date-fns';
import Select from '@material-ui/core/Select';

import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';

import Button from '../../../components/material-dashboard/CustomButtons/Button';

import { numberToDollars } from '../../../utilities';
// import { getOrderTotals } from '../../utilities/purchase_order';

import { viewPaymentDialogStyles } from './view_payment_dialog.styles';
import PaymentDialog from '../../components/payment_dialog';
import { customerProductDiscountsTotals, perWholeOrderDiscount } from '../../../utilities';

class ViewPaymentDialog extends Component {
  state = {
    totalAmount: 0,
    tableDatas: [],
    shareholders: [],
    paymentDialogOpen: null,
    paymentRemoveAlert: null,
    tableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,
    activeTableItem: null,
    tableInvoiceItemActionMenuOpen: false,
    tableInvoiceItemActionAnchorEl: null,
    activeTableInvoiceItem: null,
    selectedShareholder: 'all',
    finalPaymentCalculation: [],
  };

  componentWillMount = async () => {
    this.reload();
    this.setTableData();
    this.earlyPayTableData();
  };
  componentDidMount = async () => {
    this.earlyPayTableData();
  };

  reload = async () => {
    this.setState({
      tableItemActionAnchorEl: null,
      tableItemActionMenuOpen: false,
      activeTableItem: null,
      tableInvoiceItemActionMenuOpen: false,
      tableInvoiceItemActionAnchorEl: null,
      activeTableInvoiceItem: null,
      selectedMenuTabIndex: 0,
    });
    await this.props.listPayments(true);
    this.setTableData();
    this.earlyPayTableData();
  };

  setTableData = async () => {
    const { customer, payments, getCustomerShareholders, currentPurchaseOrder, poID } = this.props;

    const shareholders = await getCustomerShareholders(customer.id);
    const { amount: totalAmount, purchaseOrderAmount } = this.getPaymentTotal(poID);
    let tableDatas = [];
    const data = currentPurchaseOrder !== undefined ? [currentPurchaseOrder] : customer.PurchaseOrders;

    (poID !== undefined ? data.filter((s) => s.id == poID) : data)
      .filter((_purchaseOrder) => !_purchaseOrder.isQuote)
      .forEach((purchaseOrder) => {
        const currentPayments = (
          payments.length > 0 ? payments : currentPurchaseOrder !== undefined ? purchaseOrder.Payments : payments
        ).filter((_payment) => _payment.purchaseOrderId === purchaseOrder.id);
        const total = purchaseOrderAmount.find((_amount) => _amount.purchaseOrderId === purchaseOrder.id);
        const allPayments = [];
        let balanceDue = total.orderAmount;
        currentPayments.forEach((payment) => {
          const { id, purchaseOrderId, paymentDate, amount, method, note } = payment;
          allPayments.push({
            id,
            purchaseOrderId,
            amount,
            date: paymentDate,
            type: method,
            note,
          });

          balanceDue = parseFloat(balanceDue) - parseFloat(amount);
        });
        allPayments.sort((a, b) => a.date - b.date);

        tableDatas.push({
          purchaseOrderId: purchaseOrder.id,
          purchaseOrderName: purchaseOrder.name,
          amount: total.orderAmount,
          allPayments,
          balanceDue: parseFloat(balanceDue).toFixed(2),
        });
      });
    this.setState({ totalAmount, tableDatas, shareholders });
  };

  openInNewtab = (url) => {
    let win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  };

  getPaymentTotal = (poID) => {
    const { currentPurchaseOrder, payments, customer } = this.props;
    let totalPurchaseOrderAmount = 0,
      totalPaymentAmount = 0,
      purchaseOrderAmount = [];

    const purchaseOrders = customer.PurchaseOrders.filter(
      (_purchaseOrder) => _purchaseOrder && !_purchaseOrder.isQuote,
    );

    const data = currentPurchaseOrder !== undefined ? [currentPurchaseOrder] : purchaseOrders;
    (poID !== undefined ? data.filter((s) => s.id == poID) : data).forEach((purchaseOrder) => {
      (payments.length > 0 ? payments : currentPurchaseOrder !== undefined ? purchaseOrder.Payments : payments)
        .filter((_payment) => _payment.purchaseOrderId === purchaseOrder.id)
        .forEach((payment) => {
          if (payment.method === 'Return') {
            totalPaymentAmount -= parseFloat(payment.amount);
          } else {
            totalPaymentAmount += parseFloat(payment.amount);
          }
        });
      const unique = purchaseOrder.CustomerProducts.sort((a, b) => a.productId - b.productId).concat(
        purchaseOrder.CustomerCustomProducts.sort((a, b) => a.customProductId - b.customProductId),
        purchaseOrder.CustomerMonsantoProducts,
      );
      const customerOrders = [...new Map(unique.map((item, key) => [item['id'], item])).values()];

      let totalamount = 0;
      let totals = {
        subTotal: 0,
        quantity: 0,
      };

      customerOrders
        .filter((order) => order.orderQty !== 0)
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
              return this.props.dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
            })
            .filter((el) => el);
          const {
            discounts,
            discountAmount,
            total: customerProductDiscountsTotal,
          } = customerProductDiscountsTotals(order, discountsPOJO, product, null, null, null, purchaseOrder);
          totals.subTotal += customerProductDiscountsTotal;
          totals.quantity += order.orderQty;
          const total = preTotal - discountAmount;
          totalamount += total;
        });

      const perWholeOrderDiscounts = this.props.dealerDiscounts.filter(
        (discount) => discount.applyToWholeOrder === true,
      );
      const { orderDiscountsAmount: orderWholeDiscountsAmount } = perWholeOrderDiscount(
        totals.subTotal,
        totals.quantity,
        purchaseOrder,
        perWholeOrderDiscounts,
      );

      totalPurchaseOrderAmount += totalamount - orderWholeDiscountsAmount;

      purchaseOrderAmount.push({
        purchaseOrderId: purchaseOrder.id,
        orderAmount: totalamount - orderWholeDiscountsAmount,
      });
    });
    let amount = totalPurchaseOrderAmount - totalPaymentAmount;
    return { amount, purchaseOrderAmount };
  };

  createPayment = async (data) => {
    const { createPayment } = this.props;
    const { activeTableInvoiceItem } = this.state;
    try {
      await createPayment(activeTableInvoiceItem.purchaseOrderId, data);
      this.handlePaymentDialogClose();
      this.reload();
    } catch (err) {
      console.log(err);
      this.handlePaymentDialogClose();
      this.reload();
    }
  };

  updatePayment = async (data) => {
    const { updatePayment } = this.props;
    const { activeTableItem } = this.state;

    try {
      await updatePayment(activeTableItem.purchaseOrderId, activeTableItem.id, data);
      this.handlePaymentDialogClose();
      this.reload();
      this.setTableData();
      this.earlyPayTableData();
    } catch (err) {
      console.log(err);
      this.handlePaymentDialogClose();
      this.reload();
      this.setTableData();
      this.earlyPayTableData();
    }
  };

  removePayment = (payment) => {
    const { deletePayment } = this.props;
    const { activeTableItem } = this.state;
    deletePayment(activeTableItem.purchaseOrderId, activeTableItem);
  };

  handlePaymentDialogOpen = () => {
    const { shareholders, activeTableItem, tableDatas } = this.state;
    const { customer, dealerDiscounts, currentPurchaseOrder } = this.props;
    this.setState({
      paymentDialogOpen: (
        <PaymentDialog
          open={true}
          onClose={this.handlePaymentDialogClose}
          shareholders={shareholders}
          editingPayment={activeTableItem}
          customer={customer}
          createPayment={this.createPayment}
          updatePayment={this.updatePayment}
          tableDatas={tableDatas}
          dealerDiscounts={dealerDiscounts}
          currentPurchaseOrder={currentPurchaseOrder}
        />
      ),
      tableItemActionMenuOpen: false,
      tableInvoiceItemActionMenuOpen: false,
    });
  };

  handlePaymentDialogClose = () => {
    this.setState({
      paymentDialogOpen: null,
      tableItemActionMenuOpen: false,
      tableInvoiceItemActionMenuOpen: false,
    });
  };

  handlePaymentDeleteAlert = () => {
    const { classes, deletePayment } = this.props;
    const { activeTableItem } = this.state;
    this.setState({
      paymentRemoveAlert: (
        <SweetAlert
          showCancel
          title={'Remove Payment for Invoice#' + activeTableItem.purchaseOrderId}
          onConfirm={async () => {
            await deletePayment(activeTableItem.purchaseOrderId, activeTableItem);
            this.setState({ paymentRemoveAlert: null }, () => {
              this.reload();
            });
          }}
          onCancel={() => this.setState({ paymentRemoveAlert: null })}
          confirmBtnText="Remove"
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnText="Cancel"
          cancelBtnCssClass={classes.button + ' ' + classes.white + ' ' + classes.primary}
        >
          You are going to remove Invoice #{activeTableItem.purchaseOrderId} with {activeTableItem.method}:{' '}
          {activeTableItem.amount}
        </SweetAlert>
      ),
    });
  };

  handleTableInvoiceItemActionMenuOpen = (item) => (event) => {
    this.setState({
      tableInvoiceItemActionMenuOpen: true,
      tableInvoiceItemActionAnchorEl: event.target,
      activeTableInvoiceItem: item,
    });
  };

  handleTableInvoiceItemActionMenuClose = () => {
    this.setState({
      tableInvoiceItemActionMenuOpen: false,
      activeTableInvoiceItem: null,
    });
  };

  handleTableItemActionMenuOpen = (item) => (event) => {
    const { payments } = this.props;
    this.setState({
      tableItemActionMenuOpen: true,
      tableItemActionAnchorEl: event.target,
      activeTableItem: payments.find((payment) => payment.id === item.id),
    });
  };

  handleTableItemActionMenuClose = () => {
    this.setState({ tableItemActionMenuOpen: false, activeTableItem: null });
  };

  onMenuTabChange = (selectedMenuTabIndex) => {
    const { purchaseOrder, customer } = this.props;

    this.setState({ selectedMenuTabIndex });
  };
  setSelectedShareholder = (e) => {
    const { shareholders } = this.props;
    let selectedShareholder;
    if (e.target.value == 'all') {
      selectedShareholder = 'all';
    } else if (e.target.value === 'theCustomer') {
      selectedShareholder = { id: 'theCustomer' };
    } else {
      selectedShareholder = shareholders.find((shareholder) => shareholder.id === e.target.value);
    }

    this.setState({ selectedShareholder, printHelperUpdateFlag: new Date() }, async () => {
      this.earlyPayTableData();
    });
  };

  earlyPayTableData() {
    const {
      dealerDiscounts,
      poID,
      currentPurchaseOrder,
      products,
      customProducts,
      classes,
      MonsantoProduct,
      customer,
      payments,
    } = this.props;

    let rowsTotal = [];

    const purchaseOrders = customer.PurchaseOrders.find(
      (_purchaseOrder) => _purchaseOrder && !_purchaseOrder.isQuote && _purchaseOrder.id == poID,
    );

    const purchaseOrder = currentPurchaseOrder !== undefined ? currentPurchaseOrder : purchaseOrders;

    if (purchaseOrder !== undefined) {
      const allProduct = [
        ...purchaseOrder.CustomerCustomProducts,
        ...purchaseOrder.CustomerMonsantoProducts,
        ...purchaseOrder.CustomerProducts,
      ];
      const futureDiscountTotals = getFutureDiscountTotals({
        customerOrders: allProduct,
        shareholder: this.state.selectedShareholder == 'all' ? '' : this.state.selectedShareholder,
        dealerDiscounts,
        purchaseOrder,
        products,
        customProducts,
        MonsantoProduct,
      });

      try {
        const calculation = [];

        futureDiscountTotals !== null &&
          Object.keys(futureDiscountTotals)
            .sort()
            .forEach((date, i) => {
              futureDiscountTotals[date].map((order) => {
                if (
                  order.orderDate <= date &&
                  (i == 0 || order.orderDate >= Object.keys(futureDiscountTotals)[i - 1])
                ) {
                  calculation.push({
                    date: moment.utc(date).format('MMM D, YYYY'),
                    total: parseFloat(order.total),
                    productType: order.productType,
                    // orderDate: order.orderDate,
                    checkDate: date,
                    // discounts: order.discounts,
                    currentDisount: order.currentDisount,
                  });
                } else {
                  calculation.push({
                    date: moment.utc(date).format('MMM D, YYYY'),

                    total: parseFloat(0),
                    productType: order.productType,
                    // orderDate: order.orderDate,
                    checkDate: date,
                    // discounts: order.discounts,
                    currentDisount: order.currentDisount,
                  });
                }
              });
            });

        const mergeTotalOfBothPayment = []; //Groped based on productType and date of early pay
        let helper = {};

        calculation.reduce(function (r, o) {
          const key = o.date + '-' + o.productType;

          if (!helper[key]) {
            helper[key] = Object.assign({}, o); // create a copy of o
            mergeTotalOfBothPayment.push(helper[key]);
          } else {
            helper[key].total = parseFloat(helper[key].total) + parseFloat(o.total);
          }
          return r;
        }, {});

        const totalProducts = []; //Merge the total of fiffernt compaines product based on earlyPay date
        let helper2 = {};

        mergeTotalOfBothPayment.reduce(function (r, o) {
          const key = o.date;

          if (!helper2[key]) {
            helper2[key] = Object.assign({}, o);
            totalProducts.push(helper2[key]);
          } else {
            helper2[key].total = parseFloat(helper2[key].total) + parseFloat(o.total);
          }
          return r;
        }, {});

        // const totalNonBayerProduct = makeUnique.length > 0 && makeUnique.filter((m) => m.productType !== 'bayerProduct');
        // const totalProducts = makeUnique.length > 0 && makeUnique.filter((m) => m.productType === 'bayerProduct');

        const paymentCalculation = []; //Including a payment based on earlyapy date and increse subTotal based on earlyPay date
        totalProducts.length > 0 &&
          totalProducts.map((tb, i) => {
            const isPayment = (
              payments.length > 0 ? payments : purchaseOrder !== undefined ? purchaseOrder.Payments : payments
            ).filter(
              (p) =>
                p.purchaseOrderId === purchaseOrder.id &&
                (this.state.selectedShareholder == 'all'
                  ? true
                  : this.state.selectedShareholder.id == 'theCustomer'
                  ? p.shareholderId == 0
                  : p.shareholderId === this.state.selectedShareholder.id) &&
                tb.checkDate > p.paymentDate &&
                (i == 0 || totalProducts[i - 1].checkDate <= p.paymentDate),
            );
            let totalPayment = 0;

            isPayment.length > 0 && isPayment.map((p) => (totalPayment += parseFloat(p.amount)));

            let discountBatch = totalProducts[i + 1];

            const remainingPayment = parseFloat(tb.total) - parseFloat(isPayment.length > 0 ? isPayment[0].amount : 0);
            const currentDisValue = tb.currentDisount !== undefined ? tb.currentDisount.discountValue : 0;

            const nextDisValue =
              0 || discountBatch !== undefined
                ? discountBatch.currentDisount !== undefined
                  ? discountBatch.currentDisount.discountValue
                  : 0
                : 0;

            if (isPayment.length > 0) {
              let totalpaymentAmount = 0;
              isPayment.map((p) => (totalpaymentAmount += parseFloat(p.amount)));

              paymentCalculation.push({
                paymentDate: isPayment[0].paymentDate,
                payment: isPayment,
                subTotal: tb.total,
                earlyPayDeadLinedate: tb.checkDate,
                paymentAmount: totalpaymentAmount,
                remainingPayment: remainingPayment,
                currentAppliedDiscount: tb.currentDisount !== undefined ? tb.currentDisount : 0,
                nextDisValue: nextDisValue,
                currentDisValue: currentDisValue,
                applyValue:
                  remainingPayment *
                    ((1 - parseFloat(nextDisValue || 0) / 100) / (1 - parseFloat(currentDisValue || 0) / 100)) || 0,
                totalPayment: totalPayment,
                discountUnit: tb.currentDisount !== undefined ? tb.currentDisount.unit : 0,
              });
            } else {
              paymentCalculation.push({
                payment: isPayment,

                paymentDate: null,
                subTotal: tb.total,
                earlyPayDeadLinedate: tb.checkDate,
                paymentAmount: 0,
                remainingPayment: remainingPayment,
                currentAppliedDiscount: tb.currentDisount !== undefined ? tb.currentDisount : 0,

                nextDisValue: nextDisValue,
                currentDisValue: currentDisValue,
                applyValue:
                  remainingPayment *
                    ((1 - parseFloat(nextDisValue || 0) / 100) / (1 - parseFloat(currentDisValue || 0) / 100)) || 0,
                totalPayment: totalPayment,
                discountUnit: tb.currentDisount !== undefined ? tb.currentDisount.unit : 0,
              });
              ('');
            }
          });
        const finalPaymentCalculation = []; //from that paymentCalculation add increse Value to subtotal of particular batch

        paymentCalculation.length > 0 &&
          paymentCalculation.map((p, i) => {
            const finalSubTotal = p.subTotal + (i == 0 ? 0 : parseFloat(paymentCalculation[i - 1].applyValue || 0));
            const newApplyValue =
              (finalSubTotal - parseFloat(p.paymentAmount || 0)) *
              ((1 - parseFloat(p.nextDisValue || 0) / 100) / (1 - parseFloat(p.currentDisValue || 0) / 100));

            finalPaymentCalculation.push({
              subTotal: p.subTotal,

              subTotalDeadline: finalSubTotal,
              currentDisValue: p.currentDisValue,

              paymentOfDeadline: p.paymentAmount,
              remainingPayment: finalSubTotal - parseFloat(p.paymentAmount),
              increasePaymentValue: newApplyValue || 0,
              subTotal: p.subTotal,
              totalPayment: p.totalPayment ? p.totalPayment : 0,
              earlyPayDeadLinedate: p.earlyPayDeadLinedate,
              paymentDate: p.paymentDate ? p.paymentDate : null,
              discountUnit: p.discountUnit,
              payment: p.payment,
            });
          });

        //Update the last object with totalGrowerPaid value means after the early pay dates calculations
        const lastValue = finalPaymentCalculation[finalPaymentCalculation.length - 1];
        if (lastValue) {
          finalPaymentCalculation[finalPaymentCalculation.length - 1] = {
            lastSubTotalOfDeadline: lastValue.subTotal || 0,
            totalAfterDeadLine:
              lastValue.subTotal +
              (finalPaymentCalculation[finalPaymentCalculation.length - 2]
                ? finalPaymentCalculation[finalPaymentCalculation.length - 2].increasePaymentValue
                : 0),
            totalPayment: lastValue.totalPayment || 0,
            increasePaymentValue: finalPaymentCalculation[finalPaymentCalculation.length - 2]
              ? finalPaymentCalculation[finalPaymentCalculation.length - 2].increasePaymentValue
              : 0,
            totalGrowerPaid:
              lastValue.subTotal +
              (finalPaymentCalculation[finalPaymentCalculation.length - 2]
                ? finalPaymentCalculation[finalPaymentCalculation.length - 2].increasePaymentValue
                : 0) -
              lastValue.totalPayment,
            earlyPayDeadLinedate:
              totalProducts.length > 0
                ? totalProducts[totalProducts.length - 1].checkDate
                : new Date('July 31, 2023').toISOString(),

            payment: finalPaymentCalculation[finalPaymentCalculation.length - 2]
              ? finalPaymentCalculation[finalPaymentCalculation.length - 2].payment
              : finalPaymentCalculation[finalPaymentCalculation.length - 1].payment,

            discountValue: finalPaymentCalculation[finalPaymentCalculation.length - 2]
              ? finalPaymentCalculation[finalPaymentCalculation.length - 2].discountValue
              : finalPaymentCalculation[finalPaymentCalculation.length - 1].discountValue,

            finalTotal: true,
          };
        }
        this.setState({ finalPaymentCalculation: finalPaymentCalculation });
      } catch (e) {
        console.log('error', e);
      }
    }
  }

  render() {
    const { classes, onClose, open, customer, currentPurchaseOrder, shareholders, selectedShareholder } = this.props;
    const {
      totalAmount,
      tableDatas,
      paymentDialogOpen,
      paymentRemoveAlert,
      tableItemActionAnchorEl,
      tableItemActionMenuOpen,
      tableInvoiceItemActionMenuOpen,
      tableInvoiceItemActionAnchorEl,
      selectedMenuTabIndex,
      finalPaymentCalculation,
    } = this.state;
    const tabs = [
      { tabName: ` Payments For ${customer.name}`, tabIndex: 'simplePayment' },
      { tabName: ' Early Pay Partial Payment', tabIndex: 'earlyPayPayment' },
    ];
    const balanceDue =
      finalPaymentCalculation.length > 0 &&
      finalPaymentCalculation.filter((d) => new Date() < new Date(d.earlyPayDeadLinedate));

    return (
      <div>
        <Dialog
          open={open}
          onClose={onClose}
          fullWidth={true}
          maxWidth="md"
          style={{ padding: '10px 20px' }}
          id="paymentDialog"
        >
          <DialogTitle className={classes.dialogTitle}>
            <div className={classes.dialogHeader}>
              Payments For {customer.name}
              <div className={classes.dialogHeaderActions}>
                <IconButton color="inherit" onClick={onClose} aria-label="Close">
                  <CloseIcon />
                </IconButton>
              </div>
            </div>
          </DialogTitle>
          <Divider />

          <Tabs
            headerColor="gray"
            selectedTab={selectedMenuTabIndex || 0}
            onTabChange={this.onMenuTabChange}
            tabs={tabs}
          />
          {selectedMenuTabIndex == 0 && (
            <div>
              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell>Invoice No</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Balance Due</TableCell>
                    <TableCell>Payment</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tableDatas.map((data, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Button
                          simple={true}
                          className={classes.statementNoButton}
                          onClick={() => {
                            this.openInNewtab(`/app/customers/${customer.id}/invoice/${data.purchaseOrderId}`);
                          }}
                          style={{ color: 'black' }}
                        >
                          Invoice #{data.purchaseOrderId}
                          {data.purchaseOrderName ? '(' + data.purchaseOrderName + ')' : ''}
                        </Button>
                      </TableCell>
                      <TableCell>{numberToDollars(data.amount)}</TableCell>
                      <TableCell size="small">
                        {`${numberToDollars(data.balanceDue)}`}
                        <IconButton
                          aria-label="more"
                          onClick={this.handleTableInvoiceItemActionMenuOpen(data)}
                          id="paymentDot"
                        >
                          <MoreHorizontalIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <div>
                          Total:{' '}
                          {numberToDollars(data.allPayments.reduce((a, b) => a + parseFloat(b.amount), 0).toFixed(2))}
                        </div>
                        {data.allPayments.map((item) => (
                          <div
                            style={{
                              display: 'flex',
                              borderTop: '1px solid #E0E0E0',
                              marginTop: '3px',
                              paddingTop: '5px',
                            }}
                          >
                            {numberToDollars(item.amount)} - {moment.utc(item.date).format('MM/DD/YYYY')}
                            <br />
                            {item.type === 'invoice'
                              ? ''
                              : item.type === 'Cash'
                              ? 'Cash'
                              : `${item.type} - #${item.note}`}
                            <IconButton aria-label="more" onClick={this.handleTableItemActionMenuOpen(item)}>
                              <MoreHorizontalIcon fontSize="small" />
                            </IconButton>
                          </div>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow style={{ backgroundColor: 'rgb(221, 221, 221)' }}>
                    <TableCell />
                    <TableCell />
                    <TableCell className={classes.totalRowText}>Total: </TableCell>
                    <TableCell
                      className={classes.totalRowText}
                      style={{ color: totalAmount < 0 ? 'red' : 'black' }}
                      id="totalPayment"
                    >
                      {numberToDollars(totalAmount)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
              <Popover
                open={tableInvoiceItemActionMenuOpen}
                anchorEl={tableInvoiceItemActionAnchorEl}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                onClose={this.handleTableInvoiceItemActionMenuClose}
              >
                <Paper>
                  <MenuList>
                    <MenuItem
                      id="addPayment"
                      className={classes.addNewMenuItem}
                      onClick={() => {
                        this.setState(
                          {
                            activeTableItem: null,
                          },
                          () => {
                            this.handlePaymentDialogOpen();
                          },
                        );
                      }}
                    >
                      Add Payment
                    </MenuItem>
                  </MenuList>
                </Paper>
              </Popover>
              <Popover
                open={tableItemActionMenuOpen}
                anchorEl={tableItemActionAnchorEl}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                onClose={this.handleTableItemActionMenuClose}
              >
                <Paper>
                  <MenuList>
                    <MenuItem className={classes.addNewMenuItem} onClick={this.handlePaymentDialogOpen}>
                      Edit
                    </MenuItem>
                    <MenuItem className={classes.addNewMenuItem} onClick={this.handlePaymentDeleteAlert}>
                      Delete
                    </MenuItem>
                  </MenuList>
                </Paper>
              </Popover>
              <div style={{ marginTop: '10px' }}>
                <Button type="submit" color="primary" className={classes.addButton} value="Add" onClick={onClose}>
                  CLOSE
                </Button>
              </div>
              {paymentDialogOpen}
              {paymentRemoveAlert}
            </div>
          )}
          {selectedMenuTabIndex == 1 && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '0px 50px 30px 50px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  Total if 100% paid before Nov 18, 2022 :{' '}
                  <h5 style={{ marginLeft: '10px' }} id="totalBalance">
                    {numberToDollars(tableDatas.length > 0 ? tableDatas[0].amount : 0)}{' '}
                  </h5>
                </div>
                {currentPurchaseOrder !== undefined && currentPurchaseOrder.isSimple == false && (
                  <Select
                    data-test-id="shareholdersSelect"
                    value={this.state.selectedShareholder.id || 'all'}
                    onChange={this.setSelectedShareholder}
                    style={{ width: '25%' }}
                  >
                    <MenuItem value={'all'}>All Shareholder</MenuItem>
                    <MenuItem value={'theCustomer'}>{this.props.customer.name}</MenuItem>
                    {shareholders
                      .filter((c) => c.customerId == currentPurchaseOrder.customerId)
                      .map((shareholder) => (
                        <MenuItem key={shareholder.id} value={shareholder.id}>
                          {shareholder.name}
                        </MenuItem>
                      ))}
                  </Select>
                )}
              </div>
              <Divider />

              <Table className={classes.table}>
                <TableHead>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell>Payment Made</TableCell>
                    <TableCell>Payment Date</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {finalPaymentCalculation
                    .filter((d) => (finalPaymentCalculation.length === 1 ? d : !d.hasOwnProperty('finalTotal')))
                    .map((data, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          By EarlyPay Discount {moment.utc(data.earlyPayDeadLinedate).format('MMM Do YYYY')} (
                          {data.currentDisValue}
                          {data.discountUnit})
                        </TableCell>
                        <TableCell size="small">
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {data.payment.map((d) => {
                              return <span id={`Pmade-${d.amount}`}> {numberToDollars(d.amount)}</span>;
                            })}
                          </div>
                        </TableCell>
                        <TableCell size="small">
                          {' '}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {data.payment.map((d) => {
                              return <span> {moment.utc(d.paymentDate).format('MMM Do YYYY')}</span>;
                            })}
                          </div>
                        </TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    ))}
                  <TableRow style={{ backgroundColor: 'rgb(221, 221, 221)' }}>
                    <TableCell className={classes.totalRowText}>Remaining Balance: </TableCell>
                    <TableCell />

                    <TableCell />

                    <TableCell
                      className={classes.totalRowText}
                      style={{ color: totalAmount < 0 ? 'red' : 'black' }}
                      id="remainingBalance"
                    >
                      {numberToDollars(
                        balanceDue.length > 0
                          ? parseFloat(balanceDue[0].totalAfterDeadLine) || parseFloat(balanceDue[0].remainingPayment)
                          : finalPaymentCalculation.length > 0
                          ? parseFloat(finalPaymentCalculation[0].totalAfterDeadLine)
                          : tableDatas.length > 0
                          ? tableDatas[0].amount
                          : 0,
                      )}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>

              <div style={{ marginTop: '10px' }}>
                <Button type="submit" color="primary" className={classes.addButton} value="Add" onClick={onClose}>
                  CLOSE
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </div>
    );
  }
}

export default withStyles(viewPaymentDialogStyles)(ViewPaymentDialog);
