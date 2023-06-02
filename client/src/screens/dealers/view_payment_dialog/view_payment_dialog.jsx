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
  };

  componentWillMount = async () => {
    this.reload();
    this.setTableData();
  };

  reload = async () => {
    this.setState({
      tableItemActionAnchorEl: null,
      tableItemActionMenuOpen: false,
      activeTableItem: null,
      tableInvoiceItemActionMenuOpen: false,
      tableInvoiceItemActionAnchorEl: null,
      activeTableInvoiceItem: null,
    });
    await this.props.listPayments(true);
    this.setTableData();
  };

  setTableData = async () => {
    const { customer, payments, getCustomerShareholders } = this.props;
    const shareholders = await getCustomerShareholders(customer.id);
    const { amount: totalAmount, purchaseOrderAmount } = this.getPaymentTotal(customer);
    let tableDatas = [];
    customer.PurchaseOrders.filter((_purchaseOrder) => !_purchaseOrder.isQuote).forEach((purchaseOrder) => {
      const currentPayments = payments.filter((_payment) => _payment.purchaseOrderId === purchaseOrder.id);
      const total = purchaseOrderAmount.find((_amount) => _amount.purchaseOrderId === purchaseOrder.id);
      tableDatas.push({
        id: null,
        purchaseOrderId: purchaseOrder.id,
        purchaseOrderName: purchaseOrder.name,
        amount: total.orderAmount,
        date: purchaseOrder.createdAt,
        type: 'invoice',
      });
      currentPayments.forEach((payment) => {
        const { id, purchaseOrderId, paymentDate, amount, method, note } = payment;
        tableDatas.push({
          id,
          purchaseOrderId,
          amount,
          date: paymentDate,
          type: method,
          note,
        });
      });
    });
    tableDatas.sort((a, b) => a.date - b.date);
    this.setState({ totalAmount, tableDatas, shareholders });
  };

  openInNewtab = (url) => {
    let win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  };

  getPaymentTotal = (customer) => {
    const {
      // customerProducts,
      // customerCustomProducts,
      // customerMonsantoProduct,
      // dealerDiscounts,
      // products,
      // customProducts,
      payments,
    } = this.props;
    let totalPurchaseOrderAmount = 0,
      totalPaymentAmount = 0,
      purchaseOrderAmount = [];

    const purchaseOrders = customer.PurchaseOrders.filter((_purchaseOrder) => !_purchaseOrder.isQuote);
    // const filterByCustomer = (product) => product.customerId === customer.id;
    // const orders = customerProducts.filter(filterByCustomer);
    // const customOrders = customerCustomProducts.filter(filterByCustomer);
    purchaseOrders.forEach((purchaseOrder) => {
      // let orderAmount = 0;
      // const customerOrders = [...orders, ...customOrders].filter(
      //   (orders) => orders.purchaseOrderId === purchaseOrder.id,
      // );
      // const customerMonsantoOrders = customerMonsantoProduct.filter(
      //   (orders) => orders.purchaseOrderId === purchaseOrder.id,
      // );
      // const customerCustomOrders = purchaseOrder.CustomerCustomProducts;
      // customerCustomOrders.map((ccp) => {
      //   totalPurchaseOrderAmount += parseFloat(ccp.orderQty) * parseFloat(ccp.CustomProduct.costUnit);
      //   orderAmount += parseFloat(ccp.orderQty) * parseFloat(ccp.CustomProduct.costUnit);
      // });
      // customerMonsantoOrders.map((cmp) => {
      //   totalPurchaseOrderAmount += cmp.orderQty * parseFloat(cmp.price);
      //   orderAmount += cmp.orderQty * parseFloat(cmp.price);
      // });
      // const orderTotals = getOrderTotals({
      //   customerOrders,
      //   shareholder: null,
      //   purchaseOrder,
      //   products,
      //   customProducts,
      //   dealerDiscounts,
      // });
      // orderTotals.forEach((orderTotal) => {
      //   totalPurchaseOrderAmount += orderTotal.total;
      //   orderAmount += orderTotal.total;
      // });
      // purchaseOrderAmount.push({
      //   purchaseOrderId: purchaseOrder.id,
      //   orderAmount: orderAmount,
      // });
      payments
        .filter((_payment) => _payment.purchaseOrderId === purchaseOrder.id)
        .forEach((payment) => {
          if (payment.method === 'Return') {
            totalPaymentAmount -= parseFloat(payment.amount);
          } else {
            totalPaymentAmount += parseFloat(payment.amount);
          }
        });
      const customerOrders = purchaseOrder.CustomerProducts.sort((a, b) => a.productId - b.productId).concat(
        purchaseOrder.CustomerCustomProducts.sort((a, b) => a.customProductId - b.customProductId),
        purchaseOrder.CustomerMonsantoProducts,
      );
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
            preTotal = order.orderQty * parseFloat(msrp);
            preTotal = preTotal.toFixed(2);
            product = order.Product;
          } else if (order.CustomProduct) {
            msrp = order.msrpEdited ? order.msrpEdited : order.CustomProduct.costUnit;
            preTotal = order.orderQty * parseFloat(msrp);
            preTotal = preTotal.toFixed(2);
            product = order.CustomProduct;
          } else if (order.MonsantoProduct) {
            msrp = order.msrpEdited ? order.msrpEdited : order.price;
            preTotal = order.orderQty * parseFloat(msrp);
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
          // totalDiscount1 += discountAmount;
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
    } catch (err) {
      console.log(err);
      this.handlePaymentDialogClose();
      this.reload();
    }
  };

  removePayment = (payment) => {
    const { deletePayment } = this.props;
    const { activeTableItem } = this.state;
    deletePayment(activeTableItem.purchaseOrderId, activeTableItem);
  };

  handlePaymentDialogOpen = () => {
    const { shareholders, activeTableItem } = this.state;
    const { customer } = this.props;
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

  render() {
    const { classes, onClose, open, customer } = this.props;
    const {
      totalAmount,
      tableDatas,
      paymentDialogOpen,
      paymentRemoveAlert,
      tableItemActionAnchorEl,
      tableItemActionMenuOpen,
      tableInvoiceItemActionMenuOpen,
      tableInvoiceItemActionAnchorEl,
    } = this.state;

    return (
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
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Transaction</TableCell>
              <TableCell>Details</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableDatas.map((data, index) => (
              <TableRow key={index}>
                <TableCell>{moment.utc(data.date).format('MM/DD/YYYY')}</TableCell>
                <TableCell component="th" scope="row">
                  {data.type === 'invoice' ? (
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
                  ) : data.type === 'Return' ? (
                    'Credit to customer'
                  ) : (
                    `Payment for #${data.purchaseOrderId}`
                  )}
                </TableCell>
                <TableCell>
                  {data.type === 'invoice' ? '' : data.type === 'Cash' ? 'Cash' : `${data.type} - #${data.note}`}
                </TableCell>
                <TableCell>{numberToDollars(data.amount)}</TableCell>
                <TableCell>
                  {data.type === 'invoice' ? (
                    <IconButton aria-label="more" onClick={this.handleTableInvoiceItemActionMenuOpen(data)}>
                      <MoreHorizontalIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    <IconButton aria-label="more" onClick={this.handleTableItemActionMenuOpen(data)}>
                      <MoreHorizontalIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            <TableRow style={{ backgroundColor: 'rgb(221, 221, 221)' }}>
              <TableCell />
              <TableCell />
              <TableCell className={classes.totalRowText}>Total: </TableCell>
              <TableCell className={classes.totalRowText} style={{ color: totalAmount < 0 ? 'red' : 'black' }}>
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
      </Dialog>
    );
  }
}

export default withStyles(viewPaymentDialogStyles)(ViewPaymentDialog);
