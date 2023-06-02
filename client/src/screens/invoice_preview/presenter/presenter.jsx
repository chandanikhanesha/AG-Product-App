import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import moment from 'moment';
import { format } from 'date-fns';
import ReactTable from 'react-table';

import IconButton from '@material-ui/core/IconButton';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';
import Paper from '@material-ui/core/Paper';

import { getFutureDiscountTotals } from '../../../utilities/purchase_order';

import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';
import Checkbox from '@material-ui/core/Checkbox';

// components
import PaymentDialog from '../../../screens/components/payment_dialog';
// import InvoiceActionBar from "../../invoice/action_bar";
import InvoiceHeader from '../invoice_header';
import CropSummaryTable from '../../invoice/crop_summary_table';
import PaymentsTable from '../../invoice/payment_table';
import EarlyPayTable from '../../invoice/early_pay_table';
import InvoiceBreakdown from '../breakdown';
import FinanceMethodTable from '../../invoice/finance_method';
import Tabs from '../../../components/material-dashboard/CustomTabsWithoutBody/CustomTabsWithoutBody';
import {
  isUnloadedOrLoading,
  customerProductDiscountsTotals,
  numberToDollars,
  perWholeOrderDiscount,
} from '../../../utilities';
import { invoicePresenterStyles } from './presenter.styles';

import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Print from '@material-ui/icons/Print';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import CustomEarlyPayTable from '../../invoice/custom_early_pay_table';
import PrintHelper from '../print_helper';
import MailOutlineIcon from '@material-ui/icons/MailOutline';
import SendEmailDialog from '../send_email_dialog';
// import * as html2pdf from 'html2pdf.js';

class Presenter extends Component {
  state = {
    showPaymentDialog: false,
    editingPayment: null,
    currentInvoiceDate: this.props.purchaseOrder.createdAt || new Date(),
    selectedShareholder: '',
    selectedTabIndex: 0,
    selectedMenuTabIndex: 1,
    printHelperUpdateFlag: new Date(),
    grandTotal: '$0.00',
    orderWholeDiscountsAmount: 0,
    selectedFontSize: '',
    SendEmailDialogState: false,
    subjectName: '',
    showHideCheckBox: false,
  };

  componentWillMount() {
    const { match, location } = this.props;
    let selectedTabIndex = 0;
    let subjectName;
    if (match.path.includes(':customer_id/purchase_order/:id')) {
      subjectName = 'Purchase Order';
    } else if (match.path.includes(':customer_id/quote/:id')) {
      subjectName = 'Quote';
    } else if (match.path.includes(':customer_id/invoice/:id')) {
      subjectName = 'Invoice';
    }
    if (location.search.includes('?selectedTabIndex')) {
      selectedTabIndex = parseInt(location.search.slice(-1), 10);
    }
    this.setState({ subjectName, selectedTabIndex });
  }
  handleInvoiceDateChange = (date) => {
    const { updateDefaultDaysToDueDate, purchaseOrder } = this.props;

    updateDefaultDaysToDueDate({ purchaseOrderId: purchaseOrder.id, date, isInvoiceDueDate: false });

    this.setState({ currentInvoiceDate: moment.utc(date).format('YYYY-MM-DD') + 'T00:00:00.000Z' });
  };

  createPayment = (data) => {
    this.props.createPayment(data).then(() => this.setState({ showPaymentDialog: false }));
  };

  earlyPayTableData() {
    const { dealerDiscounts, purchaseOrder, products, customProducts, classes, MonsantoProduct } = this.props;

    let rowsTotal = [];
    let balanceTotal = [];

    const allProduct = [
      ...purchaseOrder.CustomerCustomProducts,
      ...purchaseOrder.CustomerMonsantoProducts,
      ...purchaseOrder.CustomerProducts,
    ];

    const futureDiscountTotals = getFutureDiscountTotals({
      customerOrders: allProduct,
      shareholder: this.state.selectedShareholder,
      dealerDiscounts,
      purchaseOrder,
      products,
      customProducts,
      MonsantoProduct,
    });

    try {
      const calculation = [];
      const basedOnDates = [];
      futureDiscountTotals !== null &&
        Object.keys(futureDiscountTotals)
          .sort()
          .forEach((date, i) => {
            let total = 0;
            basedOnDates[date] = [];

            futureDiscountTotals[date].map((order) => {
              total += parseFloat(order.total);
            });

            futureDiscountTotals[date].map((order) => {
              if (order.orderDate <= date && (i == 0 || order.orderDate >= Object.keys(futureDiscountTotals)[i - 1])) {
                calculation.push({
                  date: moment.utc(date).format('MMM D, YYYY'),
                  total: parseFloat(order.total),
                  productType: order.productType,
                  orderDate: order.orderDate,
                  checkDate: date,
                  // discounts: order.discounts,
                  currentDisount: order.currentDisount,
                });
              } else {
                calculation.push({
                  date: moment.utc(date).format('MMM D, YYYY'),
                  total: parseFloat(0),
                  productType: order.productType,
                  orderDate: order.orderDate,
                  checkDate: date,
                  // discounts: order.discounts,
                  currentDisount: order.currentDisount,
                });
              }
            });

            const d = futureDiscountTotals[date].filter((c) => {
              const discountId =
                c.discounts &&
                Object.keys(c.discounts).filter((d) => {
                  return (
                    c.discounts[d] &&
                    c.discounts[d].discountStrategy == 'Early Pay Discount' &&
                    c.discounts[d].discountDate == date
                  );
                });

              return (
                (c.currentDisount == undefined &&
                  Object.keys(c.discounts).length > 0 &&
                  (Object.keys(c.discounts).length !== 0 && discountId.length !== 0
                    ? Object.keys(c.discounts).includes(discountId)
                    : true)) ||
                (c.currentDisount !== undefined &&
                  // Object.keys(c.discounts).length > 0 &&
                  c.currentDisount.hasOwnProperty('date') &&
                  c.currentDisount.date >= c.orderDate &&
                  c.currentDisount.date == date)
              );
            });
            basedOnDates[date].push(d);

            rowsTotal.push({
              Summary:
                Object.keys(futureDiscountTotals).length == i + 1
                  ? `Paid After ${moment
                      .utc(Object.keys(futureDiscountTotals)[Object.keys(futureDiscountTotals).length - 2])
                      .format('MMM D, YYYY')}`
                  : `100% Paid By ${format(date, 'MMM D, YYYY')}`,
              total: numberToDollars(total),
            });
            balanceTotal.push({
              Summary:
                Object.keys(futureDiscountTotals).length == i + 1
                  ? `Balance Paid After  ${moment
                      .utc(Object.keys(futureDiscountTotals)[Object.keys(futureDiscountTotals).length - 2])
                      .format('MMM D, YYYY')}`
                  : `Balance Paid By ${format(date, 'MMM D, YYYY')}`,
              total: numberToDollars(total),
              date: date,
            });
          });

      let FinalSeprateTableData = [];
      basedOnDates !== null &&
        Object.keys(basedOnDates)
          .sort()
          .forEach((date, index) => {
            basedOnDates[date][0].length > 0 &&
              basedOnDates[date][0].map((order, i) => {
                const seedCompany = this.props.seedCompanies.filter((s) => s.id === order.companyId)[0];
                const companies = this.props.companies.filter((s) => s.id === order.companyId)[0];

                const CompanyName =
                  order.productType == 'Bayer'
                    ? 'Bayer'
                    : order.productType == 'SeedCompany'
                    ? seedCompany !== undefined
                      ? `${seedCompany.name}`
                      : ''
                    : companies !== undefined
                    ? `${companies.name || 'regular'}`
                    : '';
                FinalSeprateTableData.push({
                  date: moment.utc(date).format('MMM D, YYYY'),
                  companyId: order.companyId,
                  CompanyName: CompanyName,
                  index: index,
                  total: parseFloat(order.total),
                  productType: order.productType,
                  orderDate: order.orderDate,
                  checkDate: date,
                  originalPrice: order.originalPrice,
                  shareholderData: order.shareholderData,
                  // discounts: order.discounts,
                  currentDisount: order.currentDisount == undefined ? 0 : order.currentDisount,
                  order: order,
                });
              });
          });

      const groupBasedOnTable = [];
      let helper0 = {};

      FinalSeprateTableData.reduce(function (r, o) {
        const key = o.date + '-' + o.companyId + '-' + o.productType;

        if (!helper0[key]) {
          helper0[key] = Object.assign({}, o);
          helper0[key].orderGroup = [o.order];
          helper0[key].invoiceTotal = parseFloat(o.total); // create a copy of o
          groupBasedOnTable.push(helper0[key]);
        } else {
          helper0[key].total = parseFloat(helper0[key].total) + parseFloat(o.total);
          helper0[key].invoiceTotal = parseFloat(helper0[key].invoiceTotal) + parseFloat(o.total);
          helper0[key].orderGroup = helper0[key].orderGroup ? [...helper0[key].orderGroup, o.order] : [o.order];
        }
      }, {});

      // for bayer product
      const bayerProduct = [];

      const b = groupBasedOnTable.filter((d) => d.productType == 'Bayer' && d.originalPrice !== 0 && d.total !== 0);

      b.map((d, i) => {
        const filterOrder = d.orderGroup.filter((p) => {
          return i == 0 ? p.orderDate <= d.checkDate : p.orderDate <= d.checkDate && p.orderDate >= b[i - 1].checkDate;
        });
        const total =
          (i == 0 ? 0 : bayerProduct[i - 1].finalInvoiceAmount) *
          ((1 - parseFloat(d.currentDisount == 0 ? 0 : d.currentDisount.discountValue) / 100) /
            (1 - parseFloat(i == 0 ? 0 : b[i - 1].currentDisount.discountValue) / 100));
        let orderTotal = 0;
        filterOrder.map((f) => (orderTotal += f.total));

        const finalTotal = total + orderTotal;

        bayerProduct.push({ ...d, finalInvoiceAmount: finalTotal, orderGroupTotal: orderTotal });
      });

      //for regular product
      const regularProduct = [];

      const r = groupBasedOnTable.filter(
        (d) => d.productType == 'RegularCompany' && d.originalPrice !== 0 && d.total !== 0,
      );
      r.map((d, i) => {
        const filterOrder = d.orderGroup.filter((p) => {
          return i == 0 ? p.orderDate <= d.checkDate : p.orderDate <= d.checkDate && p.orderDate >= r[i - 1].checkDate;
        });
        const total =
          (i == 0 ? 0 : regularProduct[i - 1].finalInvoiceAmount) *
          ((1 - parseFloat(d.currentDisount == 0 ? 0 : d.currentDisount.discountValue) / 100) /
            (1 - parseFloat(i == 0 ? 0 : r[i - 1].currentDisount.discountValue) / 100));
        let orderTotal = 0;
        filterOrder.map((f) => (orderTotal += f.total));

        const finalTotal = total + orderTotal;

        regularProduct.push({ ...d, finalInvoiceAmount: finalTotal, orderGroupTotal: orderTotal });
      });
      //for seed product's
      const seedProduct = [];

      const s = groupBasedOnTable.filter(
        (d) => d.productType == 'SeedCompany' && d.originalPrice !== 0 && d.total !== 0,
      );
      s.map((d, i) => {
        const filterOrder = d.orderGroup.filter((p) => {
          return i == 0 ? p.orderDate <= d.checkDate : p.orderDate <= d.checkDate && p.orderDate >= s[i - 1].checkDate;
        });
        const total =
          (i == 0 ? 0 : seedProduct[i - 1].finalInvoiceAmount) *
          ((1 - parseFloat(d.currentDisount == 0 ? 0 : d.currentDisount.discountValue) / 100) /
            (1 - parseFloat(i == 0 ? 0 : s[i - 1].currentDisount.discountValue) / 100));
        let orderTotal = 0;
        filterOrder.map((f) => (orderTotal += f.total));

        const finalTotal = total + orderTotal;

        seedProduct.push({ ...d, finalInvoiceAmount: finalTotal, orderGroupTotal: orderTotal });
      });
      return { futureDiscountTotals, bayerProduct, regularProduct, seedProduct, groupBasedOnTable };
    } catch (e) {
      console.log('error', e);
    }
  }

  // earlyPayTableDataPaymentTab(purchaseOrders) {
  //   const {
  //     dealerDiscounts,
  //     products,
  //     customProducts,
  //     classes,
  //     MonsantoProduct,
  //     payments,
  //     customers,
  //     currentPurchaseOrder,
  //   } = this.props;

  //   const customerId = this.props.match.params.customer_id;
  //   const poId = this.props.match.params.id;

  //   const currentCust = customers.filter((c) => c.id == customerId);

  //   try {
  //     let purchaseOrder =
  //       currentCust.length > 0
  //         ? currentCust[0].PurchaseOrders.length > 0 &&
  //           currentCust[0].PurchaseOrders.find((p) => p.id == poId) == undefined
  //           ? currentPurchaseOrder
  //           : currentCust[0].PurchaseOrders.find((p) => p.id == poId)
  //         : currentPurchaseOrder;

  //     purchaseOrder = purchaseOrder == undefined ? purchaseOrders : purchaseOrder;

  //     if (purchaseOrder == undefined) return;

  //     const allProduct = [
  //       ...purchaseOrder.CustomerCustomProducts,
  //       ...purchaseOrder.CustomerMonsantoProducts,
  //       ...purchaseOrder.CustomerProducts,
  //     ];

  //     const futureDiscountTotals = getFutureDiscountTotals({
  //       customerOrders: allProduct.length > 0 ? allProduct.filter((c) => c.isDeleted == false) : [],
  //       shareholder: this.state.selectedShareholder == 'all' ? '' : this.state.selectedShareholder,
  //       dealerDiscounts,
  //       purchaseOrder,
  //       products,
  //       customProducts,
  //       MonsantoProduct,
  //     });

  //     const basedOnDates = [];

  //     futureDiscountTotals !== null &&
  //       Object.keys(futureDiscountTotals)

  //         .sort()
  //         .forEach((date, i) => {
  //           let total = 0;
  //           basedOnDates[date] = [];

  //           const d = futureDiscountTotals[date].filter((c) => {
  //             const discountId =
  //               c.discounts &&
  //               Object.keys(c.discounts).filter((d) => {
  //                 return (
  //                   c.discounts[d] &&
  //                   c.discounts[d].discountStrategy == 'Early Pay Discount' &&
  //                   c.discounts[d].discountDate == date
  //                 );
  //               });

  //             return (
  //               (c.currentDisount == undefined &&
  //                 Object.keys(c.discounts).length > 0 &&
  //                 (Object.keys(c.discounts).length !== 0 && discountId.length !== 0
  //                   ? Object.keys(c.discounts).includes(discountId)
  //                   : true)) ||
  //               (discountId !== undefined &&
  //                 discountId.length > 0 &&
  //                 c.currentDisount.hasOwnProperty('date') &&
  //                 c.currentDisount.date >= c.orderDate &&
  //                 c.currentDisount.date == date)
  //             );
  //           });

  //           basedOnDates[date].push(d);
  //           // basedOnDates.push({ [date]: d });
  //         });

  //     // basedOnDates.push(futureDiscountTotals[Object.keys(futureDiscountTotals).length - 1]);

  //     let FinalSeprateTableData = [];
  //     basedOnDates !== null &&
  //       Object.keys(basedOnDates)
  //         .sort()
  //         .forEach((date, i) => {
  //           basedOnDates[date][0].length > 0 &&
  //             basedOnDates[date][0].map((order) => {
  //               const seedCompany = this.props.seedCompanies.filter((s) => s.id === order.companyId)[0];
  //               const companies = this.props.companies.filter((s) => s.id === order.companyId)[0];

  //               const CompanyName =
  //                 order.productType == 'Bayer'
  //                   ? 'Bayer'
  //                   : order.productType == 'SeedCompany'
  //                   ? seedCompany !== undefined
  //                     ? `${seedCompany.name}`
  //                     : ''
  //                   : companies !== undefined
  //                   ? `${companies.name || 'regular'}`
  //                   : '';
  //               FinalSeprateTableData.push({
  //                 date: moment.utc(date).format('MMM D, YYYY'),
  //                 companyId: order.companyId,
  //                 CompanyName: CompanyName,

  //                 total: parseFloat(order.total),
  //                 productType: order.productType,
  //                 orderDate: order.orderDate,
  //                 checkDate: date,
  //                 originalPrice: order.originalPrice,
  //                 shareholderData: order.shareholderData,
  //                 // discounts: order.discounts,
  //                 currentDisount: order.currentDisount,
  //               });
  //             });
  //         });

  //     const groupBasedOnTable = [];
  //     let helper0 = {};

  //     FinalSeprateTableData.reduce(function (r, o) {
  //       const key = o.date + '-' + o.companyId + '-' + o.productType;

  //       if (!helper0[key]) {
  //         helper0[key] = Object.assign({}, o); // create a copy of o
  //         groupBasedOnTable.push(helper0[key]);
  //       } else {
  //         helper0[key].total = parseFloat(helper0[key].total) + parseFloat(o.total);
  //       }
  //     }, {});

  //     const bayerProduct = groupBasedOnTable.filter(
  //       (d) => d.productType == 'Bayer' && d.originalPrice !== 0 && d.total !== 0,
  //     );
  //     const regularProduct = groupBasedOnTable.filter(
  //       (d) => d.productType == 'RegularCompany' && d.originalPrice !== 0 && d.total !== 0,
  //     );

  //     const seedProduct = groupBasedOnTable.filter(
  //       (d) => d.productType == 'SeedCompany' && d.originalPrice !== 0 && d.total !== 0,
  //     );

  //     return { futureDiscountTotals, bayerProduct, regularProduct, seedProduct, groupBasedOnTable };
  //   } catch (e) {
  //     console.log('error', e);
  //   }
  // }

  setSelectedShareholder = (e) => {
    const { shareholders } = this.props;
    let selectedShareholder;
    if (!e.target.value) {
      selectedShareholder = '';
    } else if (e.target.value === 'theCustomer') {
      selectedShareholder = { id: 'theCustomer' };
    } else {
      selectedShareholder = shareholders.find((shareholder) => shareholder.id === e.target.value);
    }

    this.setState({ selectedShareholder, printHelperUpdateFlag: new Date() });
    this.earlyPayTableData();
  };

  setselectedFontSize = (e) => {
    const selectedFontSize = e.target.value;
    this.setState({ selectedFontSize });
  };

  onMenuTabChange = (selectedTabIndex) => {
    const { purchaseOrder, customer } = this.props;

    let path = '';
    if (this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket' && c.id == customer.id)) {
      path = '/app/dealers';
    } else {
      path = '/app/customers';
    }
    const isShowPickLater = purchaseOrder.CustomerMonsantoProducts.filter((f) => f.isPickLater == true);

    if (purchaseOrder.isQuote == true) {
      if (selectedTabIndex === 0) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/${purchaseOrder.isQuote ? 'quote' : 'purchase_order'}/${
            purchaseOrder.id
          }?selectedTabIndex=${selectedTabIndex}`,
        );
      }
      if (selectedTabIndex === 1) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/purchase_order/${purchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }
    } else if (isShowPickLater.length > 0) {
      if (selectedTabIndex === 0) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/${purchaseOrder.isQuote ? 'quote' : 'purchase_order'}/${
            purchaseOrder.id
          }?selectedTabIndex=${selectedTabIndex}`,
        );
      }

      if (selectedTabIndex === 5) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/purchase_order/${purchaseOrder.id}/deliveries?selectedTabIndex=${selectedTabIndex}&isReturn=true`,
        );
      }
      if (selectedTabIndex === 1) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/purchase_order/${purchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }
      if (selectedTabIndex === 2) {
        this.props.history.push(
          `${path}/${purchaseOrder.Customer.id}/purchase_order/${purchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }

      if (selectedTabIndex === 3) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/preview/${purchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }

      if (selectedTabIndex === 4) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/purchase_order/${purchaseOrder.id}/deliveries?selectedTabIndex=${selectedTabIndex}&isReturn=false`,
        );
      }
    } else {
      if (selectedTabIndex === 0) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/${purchaseOrder.isQuote ? 'quote' : 'purchase_order'}/${
            purchaseOrder.id
          }?selectedTabIndex=${selectedTabIndex}`,
        );
      }

      if (selectedTabIndex === 1) {
        this.props.history.push(
          `${path}/${purchaseOrder.Customer.id}/purchase_order/${purchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }
      if (selectedTabIndex === 3) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/purchase_order/${purchaseOrder.id}/deliveries?selectedTabIndex=${selectedTabIndex}&isReturn=false`,
        );
      }

      if (selectedTabIndex === 2) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/preview/${purchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }

      if (selectedTabIndex === 4) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/purchase_order/${purchaseOrder.id}/deliveries?selectedTabIndex=${selectedTabIndex}&isReturn=true`,
        );
      }
    }

    this.setState({ selectedTabIndex });
  };

  print = async () => {
    // console.log('print')
    // TODO: if we dont end up using html2pdf.js, remove it as a dependency
    document.getElementById('growerGrid').style.display = 'none';
    // await html2pdf(document.getElementById('invoice'))
    this.setState({ isPrinting: true });
    const { purchaseOrder, customer } = this.props;

    setTimeout(() => {
      const tempTitle = document.title;
      document.title = `${customer.name.split(' ')[0]}${purchaseOrder.isQuote ? '-q-' : '-po-'}${purchaseOrder.id}`;
      window.print();
      document.title = tempTitle;
      this.setState({ isPrinting: false });
      document.getElementById('growerGrid').style.display = 'revert';
    }, 500);
  };

  getTableData(customerOrders, currentPurchaseOrder) {
    let totalDiscount = 0;
    let tableData = [];
    let totals = {
      subTotal: 0,
      quantity: 0,
    };
    const { deliveryReceipts } = this.props;
    const oldDeliveryReceipt = [];

    deliveryReceipts.forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldDeliveryReceipt.push(ddd)));
    const { showDelivery, showOrderDate } = this.state;

    customerOrders &&
      customerOrders
        // .filter((order) => !order.farmId)

        .filter((order) => order.orderQty !== 0 && order.isDeleted == false)

        .forEach((order) => {
          let preTotal;
          let product;
          let msrp;
          if (order.Product) {
            msrp = order.msrpEdited ? order.msrpEdited : order.Product.msrp;
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
          } = customerProductDiscountsTotals(order, discountsPOJO, product, null, null, null, currentPurchaseOrder);
          totals.subTotal += customerProductDiscountsTotal;
          totals.quantity += order.orderQty;

          // const preTotal = isSeedCompany
          //   ? order.orderQty * parseFloat(order.Product.msrp)
          //   : order.orderQty * parseFloat(order.CustomProduct.costUnit);
          // const discountAmount = 0;

          let allLotsDelivered =
            oldDeliveryReceipt &&
            oldDeliveryReceipt
              .filter((dd) =>
                order.productId
                  ? dd.productId === order.productId
                  : order.customProductId === order.customProductId && dd.customerMonsantoProductId === order.id,
              )
              .map((d) => parseFloat(d.amountDelivered || 0) || 0)
              .reduce((partialSum, a) => partialSum + a, 0);

          const companyId =
            order.hasOwnProperty('CustomProduct') && order.CustomProduct.hasOwnProperty('Company')
              ? order.CustomProduct.companyId
              : order.hasOwnProperty('Product') && order.Product.hasOwnProperty('SeedCompany')
              ? order.Product.seedCompanyId
              : order.MonsantoProduct.ApiSeedCompany.id;
          const productType = order.hasOwnProperty('CustomProduct')
            ? 'RegularCompany'
            : order.hasOwnProperty('Product')
            ? 'SeedCompany'
            : 'Bayer';
          const isPaymentData =
            this.props.payments.length > 0 &&
            this.props.payments.filter(
              (p) =>
                currentPurchaseOrder &&
                p.purchaseOrderId == currentPurchaseOrder.id &&
                (p.companyId == companyId || p.companyId == 0) &&
                (this.state.selectedShareholder == ''
                  ? true
                  : this.state.selectedShareholder.id == 'theCustomer'
                  ? p.shareholderId == 0
                  : p.shareholderId === this.state.selectedShareholder.id),
            );

          const remainQty = parseFloat(order.orderQty).toFixed(2) - parseFloat(allLotsDelivered);
          let totalPayment = 0;
          isPaymentData.length > 0 &&
            isPaymentData.map((p) => {
              const isMultiData =
                p.multiCompanyData.length > 0 &&
                p.multiCompanyData.find((c) => c.companyId == companyId && c.companyName == productType);

              return p.multiCompanyData.length > 0 && isMultiData !== undefined
                ? (totalPayment += parseFloat(isMultiData.amount || 0))
                : p.multiCompanyData.length == 0 && (totalPayment += parseFloat(p.amount || 0));
            });

          totalDiscount += discountAmount;
          const total = parseFloat(preTotal) - discountAmount;

          tableData.push({
            qty: parseFloat(order.orderQty).toFixed(2),
            preTotal: preTotal,
            discountTotal: discountAmount.toFixed(2),
            discountsPOJO: discountsPOJO,
            total: total.toFixed(2),

            Product: product,
            shareholderData: order.shareholderData,
            id: order.id,
            isPaymentData: isPaymentData,
            totalPayment: totalPayment,
            order,
            productType,
            companyId: companyId,
            productId: order.productId ? order.productId : order.customProductId,
            remainQty: remainQty.toFixed(2),
          });
        });

    return { tableData, totals };
  }

  getRemainPaymentData = (tableData) => {
    const remainCompainespayment = [];
    tableData.map((t) => {
      let data = t;
      const isShareHolderMatch = t.shareholderData.filter(
        (s) => s.shareholderId == this.state.selectedShareholder.id && s.percentage !== 0,
      );

      if (this.state.selectedShareholder !== '' && isShareHolderMatch.length == 0) {
        data = { ...data, total: 0, remainingPayment: 0 };
      } else if (isShareHolderMatch.length > 0 && isShareHolderMatch[0].percentage) {
        data = {
          ...data,
          total: (parseFloat(t.total || 0) * isShareHolderMatch[0].percentage) / 100,
          remainingPayment: (parseFloat(t.total) * isShareHolderMatch[0].percentage) / 100,
        };
      } else {
        data = {
          ...data,
          remainingPayment: t.total,
        };
      }

      let isEarlyPay = false;
      t.discountsPOJO.length > 0 &&
        t.discountsPOJO.map((d) => {
          if (d.discountStrategy == 'Early Pay Discount') {
            isEarlyPay = true;
          }
        });
      isEarlyPay == false && remainCompainespayment.push(data);
    });

    let finalRemainCompainespayment = [];
    let helper0 = {};
    remainCompainespayment.reduce(function (r, o) {
      const CompanyName = o.Product.hasOwnProperty('ApiSeedCompany')
        ? 'Bayer'
        : o.Product.hasOwnProperty('SeedCompany')
        ? o.Product.SeedCompany.name
        : o.Product.Company.name;

      const key = o.companyId + '' + CompanyName;

      if (!helper0[key]) {
        helper0[key] = Object.assign({}, o); // create a copy of o

        helper0[key].CompanyName = CompanyName;
        finalRemainCompainespayment.push(helper0[key]);
      } else {
        helper0[key].total = parseFloat(helper0[key].total) + parseFloat(o.total);
        helper0[key].remainingPayment = parseFloat(helper0[key].remainingPayment) + parseFloat(o.remainingPayment);
      }
      return r;
    }, {});
    return finalRemainCompainespayment;
  };

  getEarPayTableData = (futureDiscountTotals, type, Product, purchaseOrder) => {
    const { dealerDiscounts, products, customProducts, classes, MonsantoProduct, payments, customers } = this.props;
    const poId = this.props.match.params.id;
    const customerId = this.props.match.params.customer_id;
    const currentCust = customers.filter((c) => c.id == customerId);

    try {
      const purchaseOrder =
        currentCust.length > 0 ? currentCust[0].PurchaseOrders.find((p) => p.id == poId) : purchaseOrder;
      const totalProducts = []; //Merge the total of fiffernt compaines product based on earlyPay date
      Product &&
        Product.map((order, i) => {
          if (
            i == 0
              ? new Date() < new Date(order.checkDate)
              : new Date() < new Date(order.checkDate) && new Date() > new Date(Product[i - 1].checkDate)
          ) {
            totalProducts.push(order);
          } else {
            totalProducts.push({ ...order, total: 0 });
          }
        });

      const paymentCalculation = []; //Including a payment based on earlyapy date and increse subTotal based on earlyPay date
      totalProducts.length > 0 &&
        totalProducts
          .filter((s) => s.productType == type)
          .map((tb, i) => {
            let isPayment = [];

            isPayment = (
              payments.length > 0 ? payments : purchaseOrder !== undefined ? purchaseOrder.Payments : payments
            ).filter((p) => {
              return (
                purchaseOrder &&
                p.purchaseOrderId === purchaseOrder.id &&
                p.multiCompanyData.length > 0 &&
                (this.state.selectedShareholder == ''
                  ? true
                  : this.state.selectedShareholder.id == 'theCustomer'
                  ? p.shareholderId == 0
                  : p.shareholderId === this.state.selectedShareholder.id) &&
                tb.checkDate > p.paymentDate &&
                (i == 0 || totalProducts[i - 1].checkDate <= p.paymentDate)
              );
            });

            const isPaymentInPO = (
              payments.length > 0 ? payments : purchaseOrder !== undefined ? purchaseOrder.Payments : payments
            ).filter(
              (p) =>
                purchaseOrder &&
                p.purchaseOrderId === purchaseOrder.id &&
                (p.companyId == tb.companyId || p.companyId == 0) &&
                (p.companyType == tb.productType || p.companyType == null || p.companyType == ''),
            );

            let discountBatch = totalProducts[i + 1];
            let discountBatchPrev = totalProducts[i - 1];

            let totalpaymentAmount = 0;

            isPayment.length > 0 &&
              isPayment.map((p) => {
                const isMultiData =
                  p.multiCompanyData.length > 0 &&
                  p.multiCompanyData.find((c) => c.companyId == tb.companyId && c.companyName == tb.productType);

                return isMultiData !== undefined && isMultiData !== false
                  ? (totalpaymentAmount += parseFloat(isMultiData.amount || 0))
                  : (totalpaymentAmount += parseFloat(p.amount || 0));
              });
            const remainingPayment = parseFloat(tb.invoiceTotal) - parseFloat(totalpaymentAmount);
            const currentDisValue =
              tb.currentDisount !== undefined || tb.currentDisount !== 0 ? tb.currentDisount.discountValue : 0;

            const nextDisValue =
              0 || discountBatch !== undefined
                ? discountBatch.currentDisount !== undefined
                  ? discountBatch.currentDisount.discountValue
                  : 0
                : 0;

            const prevDisValue =
              0 || discountBatchPrev !== undefined
                ? discountBatchPrev.currentDisount !== undefined
                  ? discountBatchPrev.currentDisount.discountValue
                  : 0
                : 0;

            const newFormulaOfBalanceDue =
              (i == 0 ? 0 : paymentCalculation[i - 1].finalBalanceDue) *
              ((1 - parseFloat(currentDisValue == undefined ? 0 : currentDisValue) / 100) /
                (1 - parseFloat(prevDisValue) / 100));

            const finalBalanceDue = newFormulaOfBalanceDue + tb.orderGroupTotal - totalpaymentAmount;

            if (isPayment.length > 0) {
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
                isPaymentInPO: isPaymentInPO,
                prevDisValue: prevDisValue,
                finalBalanceDue: finalBalanceDue,
                // applyValue:
                //   isPaymentInPO.length > 0
                //     ? remainingPayment *
                //         ((1 - parseFloat(nextDisValue || 0) / 100) / (1 - parseFloat(currentDisValue || 0) / 100)) || 0
                //     : 0,
                totalPayment: totalpaymentAmount,
                discountUnit: tb.currentDisount !== undefined ? tb.currentDisount.unit : 0,
                productType: tb.productType,
                CompanyName: tb.CompanyName,
                companyId: tb.companyId,
                invoiceTotal: tb.invoiceTotal,
                finalInvoiceAmount: tb.finalInvoiceAmount,
                orderGroupTotal: tb.orderGroupTotal,
              });
            } else {
              paymentCalculation.push({
                payment: isPayment,
                isPaymentInPO: isPaymentInPO,
                paymentDate: null,
                subTotal: tb.total,
                earlyPayDeadLinedate: tb.checkDate,
                paymentAmount: totalpaymentAmount,
                remainingPayment: remainingPayment,
                currentAppliedDiscount: tb.currentDisount !== undefined ? tb.currentDisount : 0,
                CompanyName: tb.CompanyName,
                finalBalanceDue: finalBalanceDue,

                prevDisValue: prevDisValue,
                nextDisValue: nextDisValue,
                currentDisValue: currentDisValue,
                // applyValue:
                //   isPaymentInPO.length > 0
                //     ? remainingPayment *
                //         ((1 - parseFloat(nextDisValue || 0) / 100) / (1 - parseFloat(currentDisValue || 0) / 100)) || 0
                //     : 0,
                totalPayment: totalpaymentAmount,
                discountUnit: tb.currentDisount !== undefined ? tb.currentDisount.unit : 0,
                productType: tb.productType,
                companyId: tb.companyId,
                invoiceTotal: tb.invoiceTotal,
                finalInvoiceAmount: tb.finalInvoiceAmount,
                orderGroupTotal: tb.orderGroupTotal,
              });
            }
          });

      const finalPaymentCalculation = paymentCalculation; //from that paymentCalculation add increse Value to subtotal of particular batch

      // paymentCalculation.length > 0 &&
      //   paymentCalculation.map((p, i) => {
      //     //p.subTotal
      //     const finalSubTotal = i == 0 ? 0 : parseFloat(paymentCalculation[i - 1].applyValue || 0);
      //     const newApplyValue =
      //       finalSubTotal *
      //         ((1 - parseFloat(p.nextDisValue || 0) / 100) / (1 - parseFloat(p.currentDisValue || 0) / 100)) -
      //       parseFloat(p.paymentAmount || 0);

      //     finalPaymentCalculation.push({
      //       subTotal: p.subTotal,
      //       CompanyName: p.CompanyName,
      //       invoiceTotal: p.invoiceTotal,

      //       subTotalDeadline: finalSubTotal,
      //       currentDisValue: p.currentDisValue,
      //       isPaymentInPO: p.isPaymentInPO,

      //       paymentOfDeadline: p.paymentAmount,
      //       remainingPayment: finalSubTotal - parseFloat(p.paymentAmount),
      //       increasePaymentValue: newApplyValue || 0,
      //       subTotal: p.subTotal,
      //       totalPayment: p.totalPayment ? p.totalPayment : 0,
      //       earlyPayDeadLinedate: p.earlyPayDeadLinedate,
      //       paymentDate: p.paymentDate ? p.paymentDate : null,
      //       discountUnit: p.discountUnit,
      //       payment: p.payment,
      //       productType: p.productType,
      //       companyId: p.companyId,
      //     });
      //   });

      // console.log(finalPaymentCalculation, 'finalPaymentCalculation');
      // //Update the last object with totalGrowerPaid value means after the early pay dates calculations
      // const lastValue = finalPaymentCalculation[finalPaymentCalculation.length - 1];
      // if (lastValue) {
      //   finalPaymentCalculation[finalPaymentCalculation.length - 1] = {
      //     lastSubTotalOfDeadline: lastValue.subTotal || 0,
      //     lastSubTotalOfDeadline: lastValue.subTotal || 0,
      //     invoiceTotal: lastValue.invoiceTotal || 0,

      //     totalAfterDeadLine:
      //       lastValue.subTotal +
      //       (finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //         ? finalPaymentCalculation[finalPaymentCalculation.length - 2].increasePaymentValue
      //         : 0),
      //     totalPayment: lastValue.totalPayment || 0,
      //     isPaymentInPO: lastValue.isPaymentInPO || 0,
      //     increasePaymentValue: finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //       ? finalPaymentCalculation[finalPaymentCalculation.length - 2].increasePaymentValue
      //       : 0,
      //     remainingPayment:
      //       lastValue.subTotal +
      //       (finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //         ? finalPaymentCalculation[finalPaymentCalculation.length - 2].increasePaymentValue
      //         : 0) -
      //       lastValue.totalPayment,
      //     totalGrowerPaid:
      //       lastValue.subTotal +
      //       (finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //         ? finalPaymentCalculation[finalPaymentCalculation.length - 2].increasePaymentValue
      //         : 0) -
      //       lastValue.totalPayment,
      //     earlyPayDeadLinedate:
      //       totalProducts.length > 0
      //         ? totalProducts[totalProducts.length - 1].checkDate
      //         : new Date('July 31, 2023').toISOString(),
      //     companyId: lastValue.companyId,
      //     CompanyName: lastValue.CompanyName,

      //     payment: finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //       ? finalPaymentCalculation[finalPaymentCalculation.length - 2].payment
      //       : lastValue.payment,

      //     discountValue: finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //       ? finalPaymentCalculation[finalPaymentCalculation.length - 2].discountValue
      //       : lastValue.discountValue,

      //     productType: finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //       ? finalPaymentCalculation[finalPaymentCalculation.length - 2].productType
      //       : lastValue.productType,

      //     finalTotal: true,
      //   };
      // }

      return { finalPaymentCalculation };
    } catch (e) {
      console.log(e);
    }
  };
  handleClickOpen = () => {
    this.setState({ SendEmailDialogState: true });
  };

  handleClose = () => {
    this.setState({ SendEmailDialogState: false });
  };

  updateGrandTotal = (val) => {
    if (this.state.grandTotal !== val) this.setState({ grandTotal: val });
  };

  updateOrderWholeDiscountsAmount = (val) => {
    if (this.state.orderWholeDiscountsAmount !== val) this.setState({ orderWholeDiscountsAmount: val });
  };

  render() {
    const {
      purchaseOrder,
      customer,
      shareholders,
      organization,
      payments,
      customerProducts,
      dealerDiscounts,
      products,
      customProducts,
      seedCompanies,
      companies,
      apiSeedCompanies,
      customerCustomProducts,
      productPackagings,
      seedSizes,
      packagings,
      classes,
      farms,
      customerMonsantoProduct,
      currentPurchaseOrder,
    } = this.props;
    const {
      showPaymentDialog,
      currentInvoiceDate,
      selectedShareholder,
      orderWholeDiscountsAmount,
      selectedFontSize,
      SendEmailDialogState,
      selectedTabIndex,
      selectedMenuTabIndex,
      subjectName,
      grandTotal,
      showHideCheckBox,
    } = this.state;
    const isShowPickLater = currentPurchaseOrder.CustomerMonsantoProducts.filter((f) => f.isPickLater == true);

    const isPaymentData = this.props.payments.filter(
      (p) =>
        p.purchaseOrderId === purchaseOrder.id &&
        (this.state.selectedShareholder == ''
          ? true
          : this.state.selectedShareholder.id == 'theCustomer'
          ? p.shareholderId == 0
          : p.shareholderId === this.state.selectedShareholder.id),
    );

    let tabs =
      currentPurchaseOrder && currentPurchaseOrder.isSimple
        ? [{ tabName: 'Products', tabIndex: 'products' }]
        : !currentPurchaseOrder.isQuote && isShowPickLater.length > 0
        ? [
            { tabName: 'Farms', tabIndex: 'farms' },
            { tabName: 'Pick Later Product', tabIndex: 'picklaterProduct' },
          ]
        : [{ tabName: 'Farms', tabIndex: 'farms' }];

    tabs = purchaseOrder.isQuote
      ? tabs.concat([
          // { tabName: "Package & Seed Size", tabIndex: "packaging" },
          // { tabName: 'Invoice', tabIndex: 'invoice' },
          { tabName: 'Payments', tabIndex: 'payments' },

          { tabName: 'Invoice Preview', tabIndex: 'preview' },
        ])
      : currentPurchaseOrder && currentPurchaseOrder.Customer.name == 'Bayer Dealer Bucket'
      ? tabs.concat([
          // { tabName: "Package & Seed Size", tabIndex: "packaging" },
          // { tabName: 'Invoice', tabIndex: 'invoice' },
          // !isSimple && { tabName: 'Simple Products View', tabIndex: 'simpleView' },
          { tabName: 'Invoice Preview', tabIndex: 'preview' },
          // { tabName: 'Grower Delivery', tabIndex: 'delivery' },
          // { tabName: 'Return', tabIndex: 'returnDelivery' },
          // { tabName: 'Return Products', tabIndex: 'returnProducts' },
        ])
      : tabs.concat([
          // { tabName: "Package & Seed Size", tabIndex: "packaging" },
          // { tabName: 'Invoice', tabIndex: 'invoice' },
          // !isSimple && { tabName: 'Simple Products View', tabIndex: 'simpleView' },
          { tabName: 'Payments', tabIndex: 'payments' },

          { tabName: 'Invoice Preview', tabIndex: 'preview' },
          { tabName: 'Grower Delivery', tabIndex: 'delivery' },
          { tabName: 'Return', tabIndex: 'returnDelivery' },
          // { tabName: 'Return Products', tabIndex: 'returnProducts' },
        ]);
    const customerOrders = currentPurchaseOrder.CustomerProducts.sort((a, b) => a.productId - b.productId).concat(
      currentPurchaseOrder.CustomerCustomProducts.sort((a, b) => a.customProductId - b.customProductId),
      currentPurchaseOrder.CustomerMonsantoProducts,
    );

    const {
      futureDiscountTotals,
      rowsTotal,
      // finalPaymentCalculation,
      balanceTotal,
      bayerProduct,
      regularProduct,
      seedProduct,
    } = this.earlyPayTableData();

    const { tableData, totals } = this.getTableData(customerOrders, currentPurchaseOrder);
    const getRemainPaymentData = this.getRemainPaymentData(tableData);

    // const {
    //   futureDiscountTotals,
    //   bayerProduct: paymentBayer,
    //   regularProduct: regularPayment,
    //   seedProduct: seedpayment,
    // } = this.earlyPayTableDataPaymentTab(purchaseOrder);

    // const balanceDue =
    // finalPaymentCalculation.length > 0 &&
    // finalPaymentCalculation.filter((d) => new Date() < new Date(d.earlyPayDeadLinedate));
    const { finalPaymentCalculation: bayerBalanceDue } = this.getEarPayTableData(
      futureDiscountTotals,
      'Bayer',
      bayerProduct,
    );
    const { finalPaymentCalculation: regularBalanceDue } = this.getEarPayTableData(
      futureDiscountTotals,
      'RegularCompany',
      regularProduct,
    );
    const { finalPaymentCalculation: seedBalanceDue } = this.getEarPayTableData(
      futureDiscountTotals,
      'SeedCompany',
      seedProduct,
    );

    const allPaidTableData = [...bayerProduct, ...regularProduct, ...seedProduct];
    const allBalanceDueData = [...bayerBalanceDue, ...regularBalanceDue, ...seedBalanceDue];
    const allCompanys = [
      ...new Map(
        [...allPaidTableData, ...getRemainPaymentData].map((item) => [item['companyId'] && item['CompanyName'], item]),
      ).values(),
    ];

    const allProduct = [
      ...purchaseOrder.CustomerCustomProducts,
      ...purchaseOrder.CustomerMonsantoProducts,
      ...purchaseOrder.CustomerProducts,
    ];

    const finalRemainNonBayerData =
      getRemainPaymentData.length > 0 &&
      getRemainPaymentData.filter(
        (g) => !allPaidTableData.find((p) => p.CompanyName == g.CompanyName && g.companyId == p.companyId),
      );

    // const remainingPayment =
    //   balanceDue.length > 0
    //     ? parseFloat(balanceDue[0].totalAfterDeadLine) || parseFloat(balanceDue[0].remainingPayment)
    //     : finalPaymentCalculation.length > 0
    //     ? parseFloat(finalPaymentCalculation[0].totalAfterDeadLine)
    //     : '';

    let totalBalanceDue = 0;
    [
      ...new Map(
        [...allBalanceDueData, ...finalRemainNonBayerData].map((item) => [
          item['companyId'] && item['CompanyName'],
          item,
        ]),
      ).values(),
    ].map(
      (p) =>
        (totalBalanceDue += p.hasOwnProperty('total')
          ? parseFloat(p.total) - p.totalPayment
          : parseFloat(p.finalBalanceDue)),
    );
    const isHide = document.getElementById('companys-checkBox')
      ? document.getElementById('companys-checkBox').checked
      : true;
    const customProps = { id: `nonpaymentTable` };
    const perWholeOrderDiscounts = dealerDiscounts.filter((discount) => discount.applyToWholeOrder === true);

    const selectedDiscounts =
      (purchaseOrder && purchaseOrder.dealerDiscounts !== undefined && purchaseOrder.dealerDiscounts) || [];
    const {
      // orderTotal: orderWholeTotal,
      // orderDiscountsAmount: orderWholeDiscountsAmount,
      discountDetails: orderWholeDiscountDetails,
    } = perWholeOrderDiscount(totals.subTotal, totals.quantity, purchaseOrder, perWholeOrderDiscounts);

    let sumOfOrderDisount = 0;
    selectedDiscounts &&
      selectedDiscounts.map((discount) => {
        const selecteddiscount = dealerDiscounts.find((dd) => dd.id === discount.DiscountId);

        sumOfOrderDisount += parseFloat(orderWholeDiscountDetails[selecteddiscount.id]);
      });
    return (
      <div style={{ width: '100%' }}>
        <span className="hide-print" style={{ display: 'flex' }}>
          {customer.name}'s {subjectName}{' '}
          <h4 className={classes.poSelector} style={{ marginLeft: '10px', marginTop: '-1px' }}>
            {`${subjectName === 'Purchase Order' ? 'PO' : 'QT'}#${purchaseOrder.id}${
              purchaseOrder.name ? '-' + purchaseOrder.name : ''
            } `}
          </h4>
        </span>
        <div className={classes.tabContainer}>
          <div style={{ width: '730px' }}>
            <Tabs
              headerColor="gray"
              selectedTab={selectedTabIndex || 0}
              onTabChange={this.onMenuTabChange}
              tabs={tabs}
            />
          </div>

          <div style={{ display: 'flex' }}>
            <div className={`${classes.checkboxText} hide-print`}>
              <Checkbox
                color="primary"
                onClick={() => this.setState({ showHideCheckBox: !showHideCheckBox })}
                label="Customize which sections you want to print"
              />
              Customize which sections you want to print
            </div>

            {!currentPurchaseOrder.isSimple ? (
              <Select
                displayEmpty
                className={`${this.props.classes.shareholdersSelect} hide-print`}
                data-test-id="shareholdersSelect"
                // get id only if is not null
                value={this.state.selectedShareholder.id || ''}
                onChange={this.setSelectedShareholder}
              >
                <MenuItem value={''}>All Shareholder</MenuItem>
                <MenuItem value={'theCustomer'}>{this.props.customer.name}</MenuItem>
                {this.props.shareholders.map((shareholder) => (
                  <MenuItem key={shareholder.id} value={shareholder.id}>
                    {shareholder.name}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              ''
            )}

            <div key={this.state.printHelperUpdateFlag}>
              <PrintHelper showHideCheckBox={showHideCheckBox} key={showHideCheckBox} />
            </div>
            <Button className={`${classes.printButton} hide-print`} onClick={this.print} color="info" id="pdfClick">
              <Print />
            </Button>
            <Button className={`${classes.mailButton} hide-print`} onClick={this.handleClickOpen} color="info">
              <MailOutlineIcon />
            </Button>
          </div>
        </div>

        {/*   <Select
          displayEmpty
          className={'hide-print'}
          style={{ position: 'absolute', left: 30, top: 150 }}
          value={this.state.selectedFontSize || ''}
          onChange={this.setselectedFontSize}
        >
          <MenuItem value={''}>Select FontSize</MenuItem>
          <MenuItem value={'0.8rem'}>0.8 rem</MenuItem>
          <MenuItem value={'0.9rem'}>0.9 rem</MenuItem>
        </Select>*/}
        <div id="invoice" className={classes.printContainer}>
          <div className={classes.content}>
            {/* <InvoiceActionBar
          selectedShareholder={selectedShareholder}
          shareholders={shareholders}
          customer={customer}
          print={print}
          isQuote={purchaseOrder.isQuote}
          showPaymentDialog={() => this.setState({ showPaymentDialog: true })}
          setSelectedShareholder={this.setSelectedShareholder}
        /> */}
            <InvoiceHeader
              organization={organization}
              customer={customer}
              selectedShareholder={selectedShareholder}
              purchaseOrder={purchaseOrder}
              daysToDueDate={organization.daysToInvoiceDueDateDefault}
              handleInvoiceDateChange={this.handleInvoiceDateChange}
              currentInvoiceDate={currentInvoiceDate}
              grandTotal={this.state.grandTotal}
              payments={payments}
            />
            <CropSummaryTable
              customerProducts={customerProducts}
              purchaseOrder={purchaseOrder}
              seedCompanies={seedCompanies}
              apiSeedCompanies={apiSeedCompanies}
              products={products}
              selectedShareholder={selectedShareholder}
              customProducts={customProducts}
              dealerDiscounts={dealerDiscounts}
              companies={companies}
              customerCustomProducts={customerCustomProducts}
              invoicePreview={true}
              updateGrandTotal={this.updateGrandTotal}
              payments={payments}
              orderWholeDiscountsAmount={orderWholeDiscountsAmount}
              selectedFontSize={selectedFontSize ? selectedFontSize : '0.7rem'}
              showHideCheckBox={showHideCheckBox}
            />
            {/*       {rowsTotal.length > 0 && (
              <div
                className="invoice-table-wrapper"
                style={{ fontSize: selectedFontSize ? selectedFontSize : '0.7rem' }}
              >
                <ReactTable
                  sortable={false}
                  showPagination={false}
                  minRows={1}
                  NoDataComponent={() => null}
                  columns={[
                    {
                      Header: 'Summary',
                      accessor: 'Summary',
                      headerStyle: {
                        color: '#000000',
                        // background: '#CDDFC8',
                        fontWeight: 'bold',
                        fontSize: selectedFontSize ? selectedFontSize : '0.7rem',
                      },
                    },
                    {
                      Header: 'Total Invoice Amount',
                      accessor: 'total',
                      headerStyle: {
                        color: '#000000',
                        // background: '#CDDFC8',
                        fontWeight: 'bold',
                        fontSize: selectedFontSize ? selectedFontSize : '0.7rem',
                        textAlign: 'left',
                      },
                    },
                  ]}
                  data={rowsTotal}
                  className={this.props.classes.earlyPayTable}
                  getTrProps={(state, rowInfo) => {
                    return { style: { fontSize: selectedFontSize ? selectedFontSize : '0.7rem' } };
                  }}
                />
              </div>
            )}

            {bayerProduct.length > 0 && (
              <div
                className="invoice-table-wrapper"
                style={{ fontSize: selectedFontSize ? selectedFontSize : '0.7rem' }}
              >
                <h5> Bayer </h5>
                <ReactTable
                  sortable={false}
                  showPagination={false}
                  minRows={1}
                  NoDataComponent={() => null}
                  columns={[
                    {
                      Header: 'Summary',
                      id: 'date',
                      headerStyle: {
                        color: '#000000',
                        // background: '#CDDFC8',
                        fontWeight: 'bold',
                        fontSize: selectedFontSize ? selectedFontSize : '0.7rem',
                      },
                      accessor: (props) => {
                        return (
                          <div>
                            Paid {props.currentDisount == undefined ? 'After' : ' By'}{' '}
                            {props.currentDisount == undefined && bayerProduct.length > 1
                              ? format(bayerProduct[bayerProduct.length - 2].date || new Date(), 'MMM D, YYYY')
                              : format(props.date || new Date(), 'MMM D, YYYY')}
                          </div>
                        );
                      },
                    },
                    {
                      Header: 'Total Invoice Amount',
                      id: 'total',
                      accessor: (props) => {
                        return numberToDollars(props.total);
                      },
                      headerStyle: {
                        color: '#000000',
                        // background: '#CDDFC8',
                        fontWeight: 'bold',
                        fontSize: selectedFontSize ? selectedFontSize : '0.7rem',
                        textAlign: 'left',
                      },
                    },
                  ]}
                  data={bayerProduct}
                  className={this.props.classes.earlyPayTable}
                  getTrProps={(state, rowInfo) => {
                    return { style: { fontSize: selectedFontSize ? selectedFontSize : '0.7rem' } };
                  }}
                />
              </div>
            )}

            {seedProduct.length > 0 && (
              <div
                className="invoice-table-wrapper"
                style={{ fontSize: selectedFontSize ? selectedFontSize : '0.7rem' }}
              >
                <h5> Seed </h5>
                <ReactTable
                  sortable={false}
                  showPagination={false}
                  minRows={1}
                  NoDataComponent={() => null}
                  columns={[
                    {
                      Header: 'Summary',
                      id: 'date',

                      accessor: (props) => {
                        return (
                          <div>
                            Paid {props.currentDisount == undefined ? 'After' : ' By'}{' '}
                            {props.currentDisount == undefined && seedProduct.length > 1
                              ? format(seedProduct[seedProduct.length - 2].date || new Date(), 'MMM D, YYYY')
                              : format(props.date || new Date(), 'MMM D, YYYY')}
                          </div>
                        );
                      },
                      headerStyle: {
                        color: '#000000',
                        // background: '#CDDFC8',
                        fontWeight: 'bold',
                        fontSize: selectedFontSize ? selectedFontSize : '0.7rem',
                      },
                    },
                    {
                      Header: 'Total Invoice Amount',
                      accessor: (props) => {
                        return numberToDollars(props.total);
                      },
                      id: 'total',
                      headerStyle: {
                        color: '#000000',
                        // background: '#CDDFC8',
                        fontWeight: 'bold',
                        fontSize: selectedFontSize ? selectedFontSize : '0.7rem',
                        textAlign: 'left',
                      },
                      id: 'total',
                    },
                  ]}
                  data={seedProduct}
                  className={this.props.classes.earlyPayTable}
                  getTrProps={(state, rowInfo) => {
                    return { style: { fontSize: selectedFontSize ? selectedFontSize : '0.7rem' } };
                  }}
                />
              </div>
            )}

            {regularProduct.length > 0 && (
              <div
                className="invoice-table-wrapper"
                style={{ fontSize: selectedFontSize ? selectedFontSize : '0.7rem' }}
              >
                <h5> Regular </h5>
                <ReactTable
                  sortable={false}
                  showPagination={false}
                  minRows={1}
                  NoDataComponent={() => null}
                  columns={[
                    {
                      Header: 'Summary',
                      id: 'date',
                      accessor: (props) => {
                        return (
                          <div>
                            Paid {props.currentDisount == undefined ? 'After' : ' By'}{' '}
                            {props.currentDisount == undefined
                              ? regularProduct.length > 1
                                ? format(regularProduct[regularProduct.length - 2].date || new Date(), 'MMM D, YYYY')
                                : props.date
                              : format(props.date || new Date(), 'MMM D, YYYY')}
                          </div>
                        );
                      },
                      headerStyle: {
                        color: '#000000',
                        // background: '#CDDFC8',
                        fontWeight: 'bold',
                        fontSize: selectedFontSize ? selectedFontSize : '0.7rem',
                      },
                    },
                    {
                      Header: 'Total Invoice Amount',
                      accessor: (props) => {
                        return numberToDollars(props.total);
                      },
                      id: 'total',
                      headerStyle: {
                        color: '#000000',
                        // background: '#CDDFC8',
                        fontWeight: 'bold',
                        fontSize: selectedFontSize ? selectedFontSize : '0.7rem',
                        textAlign: 'left',
                      },
                    },
                  ]}
                  data={regularProduct}
                  className={this.props.classes.earlyPayTable}
                  getTrProps={(state, rowInfo) => {
                    return { style: { fontSize: selectedFontSize ? selectedFontSize : '0.7rem' } };
                  }}
                />
              </div>
            )}


               <PaymentsTable
              customer={customer}
              selectedShareholder={selectedShareholder}
              payments={payments}
              purchaseOrder={purchaseOrder}
              shareholders={shareholders}
              grandTotal={this.state.grandTotal}
              selectedFontSize={selectedFontSize ? selectedFontSize : '0.7rem'}
              dealerDiscounts={dealerDiscounts}
              currentPurchaseOrder={currentPurchaseOrder}
              updateOrderWholeDiscountsAmount={this.updateOrderWholeDiscountsAmount}
              organization={organization}
              remainingPayment={
                balanceDue.length > 0
                  ? parseFloat(balanceDue[0].totalAfterDeadLine) || parseFloat(balanceDue[0].remainingPayment)
                  : finalPaymentCalculation.length > 0
                  ? parseFloat(finalPaymentCalculation[0].totalAfterDeadLine)
                  : ''
              }
            />

            {isPaymentData.length > 0 && balanceDue.length > 1 && (
              <div
                className="invoice-table-wrapper"
                style={{ fontSize: selectedFontSize ? selectedFontSize : '0.7rem', marginBottom: '20px' }}
              >
                <ReactTable
                  sortable={false}
                  showPagination={false}
                  minRows={1}
                  NoDataComponent={() => null}
                  columns={[
                    {
                      Header: 'Balance Summary',

                      id: 'balanceSummary',
                      headerStyle: {
                        color: '#000000',
                        // background: '#CDDFC8',
                        fontWeight: 'bold',
                        fontSize: selectedFontSize ? selectedFontSize : '0.7rem',
                      },
                      accessor: (props) => {
                        return (
                          <div>
                            BalanceDue Paid {props.hasOwnProperty('lastSubTotalOfDeadline') ? 'After' : ' By'}{' '}
                            {props.hasOwnProperty('lastSubTotalOfDeadline')
                              ? format(
                                  balanceDue[balanceDue.length - 2].earlyPayDeadLinedate || new Date(),
                                  'MMM D, YYYY',
                                )
                              : format(props.earlyPayDeadLinedate || new Date(), 'MMM D, YYYY')}
                          </div>
                        );
                      },
                    },
                    {
                      Header: 'Total Balance Amount',

                      id: 'total',

                      headerStyle: {
                        color: '#000000',
                        // background: '#CDDFC8',
                        fontWeight: 'bold',
                        fontSize: selectedFontSize ? selectedFontSize : '0.7rem',
                        textAlign: 'left',
                      },
                      accessor: (props) => {
                        return numberToDollars(props.remainingPayment);
                      },
                    },
                  ]}
                  data={balanceDue}
                  className={this.props.classes.earlyPayTable}
                  getTrProps={(state, rowInfo) => {
                    return { style: { fontSize: selectedFontSize ? selectedFontSize : '0.7rem' } };
                  }}
                />
              </div>
            )}
                */}

            <div
              className={
                !isHide
                  ? `${this.props.classes.paymentSummaryContainer} hide-print`
                  : this.props.classes.paymentSummaryContainer
              }
              id="companys-border"
            >
              <div
                className={'invoice-table-wrapper'}
                style={{
                  borderBottom: '1px solid black',
                  background: '#9e9e9e8f',
                  height: '50px',
                }}
              >
                <div
                  id="companys-check"
                  className="ReactTable"
                  style={{ padding: '8px', width: '100%', height: '50px' }}
                >
                  <span className={this.props.classes.paymentSummary}>Payment Summary </span>
                </div>
              </div>
              <div id="companys-Section">
                {allCompanys.map((d) => {
                  const balanceDue = allBalanceDueData.filter(
                    (dd) =>
                      dd.companyId === d.companyId &&
                      dd.CompanyName === d.CompanyName &&
                      new Date() < new Date(dd.earlyPayDeadLinedate),
                  );
                  const paidTable = allPaidTableData.filter(
                    (dd) => dd.companyId == d.companyId && dd.CompanyName === d.CompanyName,
                  );

                  const earlyPayData = allBalanceDueData.filter(
                    (dd) => dd.companyId == d.companyId && dd.payment.length > 0,
                  );
                  const customProps = { id: `paymentTable-${d}` };
                  return (
                    paidTable.length > 0 && (
                      <div
                        style={{ padding: '8px', borderBottom: '2px solid #80808096' }}
                        id={`paymentTable-${d}/border`}
                      >
                        <div className="invoice-table-wrapper">
                          <h4 className={this.props.classes.titlePayment} id={`paymentTable-${d}/text`}>
                            {' '}
                            {d.CompanyName}{' '}
                          </h4>

                          {paidTable.length > 0 && (
                            <div>
                              <ReactTable
                                sortable={false}
                                showPagination={false}
                                minRows={1}
                                NoDataComponent={() => null}
                                getProps={() => customProps}
                                columns={[
                                  {
                                    Header: 'Summary',
                                    id: 'date',

                                    headerStyle: {
                                      color: '#000000',
                                      // background: '#CDDFC8',
                                      fontWeight: 'bold',
                                      fontSize: '0.7rem',
                                    },
                                    accessor: (props) => {
                                      return (
                                        <div>
                                          {props.currentDisount == 0
                                            ? `After ${format(
                                                paidTable.length > 1
                                                  ? paidTable[paidTable.length - 2].date || new Date()
                                                  : props.date,
                                                'MMM D, YYYY',
                                              )} (0%)`
                                            : props.currentDisount != undefined &&
                                              `${props.date} (
                                        ${props.currentDisount.discountValue}${props.currentDisount.unit})`}
                                        </div>
                                      );
                                    },
                                  },
                                  {
                                    Header: 'Invoice Amount',
                                    accessor: (props) => {
                                      return numberToDollars(props.finalInvoiceAmount);
                                    },
                                    id: 'finalInvoiceAmount',

                                    headerStyle: {
                                      color: '#000000',
                                      // background: '#CDDFC8',
                                      fontWeight: 'bold',
                                      fontSize: '0.7rem',
                                      textAlign: 'left',
                                    },
                                  },
                                  {
                                    Header: 'Payment History',
                                    id: 'EarlyPayDate',
                                    accessor: (props) => {
                                      const isFind = earlyPayData.find(
                                        (c) => c.earlyPayDeadLinedate == props.checkDate,
                                      );

                                      return isFind !== undefined
                                        ? isFind.payment.map((d) => {
                                            const isMultiData =
                                              d.multiCompanyData.length > 0 &&
                                              d.multiCompanyData.find(
                                                (c) =>
                                                  c.companyId == props.companyId && c.companyName == props.productType,
                                              );

                                            return d.multiCompanyData.length > 0 ? (
                                              <div>
                                                {isMultiData ? (
                                                  <div>
                                                    <span
                                                      className="paymentAmount"
                                                      id={`Pmade-${isMultiData ? isMultiData.amount : d.amount || 0}`}
                                                    >
                                                      {' '}
                                                      {numberToDollars(
                                                        isMultiData ? isMultiData.amount : d.amount || 0,
                                                      )}
                                                    </span>{' '}
                                                    -
                                                    <span id={`Pmade-${d.paymentDate}`}>
                                                      {' '}
                                                      {moment.utc(d.paymentDate).format('MMM Do YYYY')}
                                                    </span>{' '}
                                                    {d.method} - #{d.payBy} - {d.note}
                                                  </div>
                                                ) : (
                                                  ''
                                                )}
                                              </div>
                                            ) : props.productType == d.companyType &&
                                              d.companyId == isFind.companyId ? (
                                              <div>
                                                <div>
                                                  <span className="paymentAmount" id={`Pmade-${d.amount || 0}`}>
                                                    {' '}
                                                    {numberToDollars(d.amount || 0)}
                                                  </span>{' '}
                                                  -
                                                  <span id={`Pmade-${d.paymentDate}`}>
                                                    {' '}
                                                    {moment.utc(d.paymentDate).format('MMM Do YYYY')}
                                                  </span>{' '}
                                                  {d.method} - #{d.payBy} - {d.note}
                                                </div>
                                              </div>
                                            ) : (
                                              '-'
                                            );
                                          })
                                        : '-';
                                    },
                                    headerStyle: {
                                      color: '#000000',
                                      // background: '#CDDFC8',
                                      fontWeight: 'bold',
                                      fontSize: '0.7rem',
                                      textAlign: 'left',
                                    },
                                  },
                                  {
                                    Header: 'Balance Due',

                                    id: 'balance',
                                    headerStyle: {
                                      color: '#000000',
                                      // background: '#CDDFC8',
                                      fontWeight: 'bold',
                                      fontSize: '0.7rem',
                                      textAlign: 'left',
                                    },
                                    accessor: (props) => {
                                      const isFind = balanceDue.find((c) => c.earlyPayDeadLinedate == props.checkDate);

                                      return (
                                        <div className="balanceAmount">
                                          {isFind !== undefined
                                            ? isFind.isPaymentInPO.length == 0
                                              ? numberToDollars(props.finalInvoiceAmount || 0)
                                              : numberToDollars(isFind.finalBalanceDue || 0)
                                            : '-'}
                                        </div>
                                      );
                                    },
                                  },
                                ]}
                                data={paidTable}
                                className={classes.earlyPayTable}
                                getTrProps={(state, rowInfo) => {
                                  return { style: { fontSize: '0.7rem' } };
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  );
                })}
                {finalRemainNonBayerData.length > 0 && (
                  <div style={{ padding: '8px' }} id={`nonpaymentTable/border`}>
                    <div className="invoice-table-wrapper">
                      <h4 className={this.props.classes.titlePayment} id={`nonpaymentTable/text`}>
                        Non-Early-Cash Products
                      </h4>

                      <ReactTable
                        getProps={() => customProps}
                        data={finalRemainNonBayerData}
                        columns={[
                          {
                            Header: 'CompanyName',
                            accessor: (props) => {
                              return props.Product.hasOwnProperty('Company')
                                ? props.Product.Company.name
                                : props.Product.hasOwnProperty('SeedCompany')
                                ? `${props.Product.SeedCompany ? props.Product.SeedCompany.name : ''}`
                                : 'Bayer';
                            },
                            id: 'CompanyName',
                            headerStyle: {
                              color: '#000000',
                              // background: '#CDDFC8',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              textAlign: 'left',
                            },
                          },
                          {
                            Header: 'Invoice Amount',
                            accessor: (props) => {
                              return numberToDollars(props.total);
                            },
                            id: 'total',
                            headerStyle: {
                              color: '#000000',
                              // background: '#CDDFC8',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              textAlign: 'left',
                            },
                          },
                          {
                            Header: 'Payment History',
                            accessor: (props) => {
                              const companyName = props.Product.hasOwnProperty('Company')
                                ? props.Product.Company.name
                                : props.Product.hasOwnProperty('SeedCompany')
                                ? `${props.Product.SeedCompany ? props.Product.SeedCompany.name : ''}`
                                : 'Bayer';

                              return (
                                props.isPaymentData.length > 0 &&
                                props.isPaymentData.map((p) => {
                                  const isMultiData =
                                    p.multiCompanyData.length > 0 &&
                                    p.multiCompanyData.find(
                                      (c) =>
                                        c.companyId == props.companyId &&
                                        c.amount !== 0 &&
                                        c.companyName == props.productType,
                                    );

                                  return p.multiCompanyData.length > 0 ? (
                                    <div>
                                      {isMultiData !== undefined ? (
                                        <div>
                                          {numberToDollars(isMultiData.amount)} -
                                          {moment.utc(p.paymentDate).format('MMM Do YYYY')} {p.method} - #{p.payBy} -{' '}
                                          {p.note}
                                        </div>
                                      ) : (
                                        ''
                                      )}
                                    </div>
                                  ) : (
                                    companyName == p.companyType && props.companyId == p.companyId && (
                                      <div>
                                        {numberToDollars(p.amount)} -{moment.utc(p.paymentDate).format('MMM Do YYYY')}{' '}
                                        {p.method} - #{p.payBy}- {p.note}
                                        <IconButton aria-label="more" id="paymentDot">
                                          <MoreHorizontalIcon fontSize="small" />
                                        </IconButton>
                                      </div>
                                    )
                                  );
                                })
                              );
                            },
                            id: 'Payment',

                            headerStyle: {
                              color: '#000000',
                              // background: '#CDDFC8',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              textAlign: 'left',
                            },
                          },
                          {
                            Header: 'Balance due',
                            accessor: (props) => {
                              let paymentTotal = 0;
                              props.isPaymentData.length > 0 &&
                                props.isPaymentData.map((p) => {
                                  const isMultiData =
                                    p.multiCompanyData.length > 0 &&
                                    p.multiCompanyData.find(
                                      (c) => c.companyId == props.companyId && c.companyName == props.productType,
                                    );

                                  return p.multiCompanyData.length > 0 && isMultiData !== undefined
                                    ? (paymentTotal += parseFloat(isMultiData.amount || 0))
                                    : p.multiCompanyData.length == 0 && (paymentTotal += parseFloat(p.amount || 0));
                                });

                              return numberToDollars(parseFloat(props.remainingPayment || 0) - paymentTotal);
                            },
                            id: 'balanceDue',
                            headerStyle: {
                              color: '#000000',
                              // background: '#CDDFC8',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              textAlign: 'left',
                            },
                          },
                        ]}
                        sortable={false}
                        showPagination={false}
                        minRows={1}
                        NoDataComponent={() => null}
                        getTrProps={(state, rowInfo) => {
                          return { style: { fontSize: '0.7rem' } };
                        }}
                      ></ReactTable>
                    </div>
                  </div>
                )}
                {selectedDiscounts.length > 0 && (
                  <div
                    className={classes.finalrow}
                    style={{ flexDirection: 'column', fontSize: '0.7rem', marginLeft: '8px' }}
                  >
                    <h4 className={this.props.classes.titlePayment}>Whole Order Discount</h4>
                    {selectedDiscounts &&
                      selectedDiscounts.map((discount) => {
                        const selecteddiscount = dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
                        return (
                          <div className={classes.wholeorder}>
                            <span className={classes.discountLabel}>{selecteddiscount && selecteddiscount.name}</span>
                            <span>{numberToDollars(orderWholeDiscountDetails[selecteddiscount.id])}</span>
                          </div>
                        );
                      })}
                  </div>
                )}

                <GridContainer
                  justifyContent="center"
                  style={{
                    padding: '8px',
                    fontWeight: 'bold',
                    fontSize: this.state.selectedFontSize,
                    margin: '15px 0px 0px 0px',
                    border: '0.1px solid gray',
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  <GridItem xs={6}>Grand Total : {this.state.grandTotal}</GridItem>
                  <GridItem xs={6}>Balance Due: {numberToDollars(totalBalanceDue - sumOfOrderDisount)}</GridItem>
                </GridContainer>
              </div>
            </div>

            <InvoiceBreakdown
              customerProducts={customerProducts}
              purchaseOrder={purchaseOrder}
              selectedShareholder={selectedShareholder}
              seedCompanies={seedCompanies}
              products={products}
              customProducts={customProducts}
              dealerDiscounts={dealerDiscounts}
              companies={companies}
              customerCustomProducts={customerCustomProducts}
              customerMonsantoProduct={customerMonsantoProduct}
              currentPurchaseOrder={currentPurchaseOrder}
              productPackagings={productPackagings}
              seedSizes={seedSizes}
              packagings={packagings}
              farms={farms}
              selectedFontSize={selectedFontSize ? selectedFontSize : '0.7rem'}
              showHideCheckBox={showHideCheckBox}
            />
            {/* calculation is wrong that's why sourabh told to comment*/}
            {/* <EarlyPayTable
              purchaseOrder={purchaseOrder}
              selectedShareholder={selectedShareholder}
              customer={customer}
              payments={payments}
              customerProducts={customerProducts}
              dealerDiscounts={dealerDiscounts}
              products={products}
              customProducts={customProducts}
              customerCustomProducts={customerCustomProducts}
              customerMonsantoProduct={customerMonsantoProduct}
              selectedFontSize={selectedFontSize ? selectedFontSize : '0.7rem'}
            /> */}
            {/* <CustomEarlyPayTable
              purchaseOrder={purchaseOrder}
              selectedShareholder={selectedShareholder}
              customer={customer}
              payments={payments}
              customerProducts={customerProducts}
              dealerDiscounts={dealerDiscounts}
              products={products}
              customProducts={customProducts}
              customerCustomProducts={customerCustomProducts}
            /> */}
            <FinanceMethodTable
              customerProducts={customerProducts}
              customerCustomProducts={customerCustomProducts}
              purchaseOrder={purchaseOrder}
              products={products}
              customProducts={customProducts}
              seedCompanies={seedCompanies}
              companies={companies}
            />
            {/*    <PaymentDialog
              customer={customer}
              // updatePayment={this.updatePayment}
              editingPayment={this.state.editingPayment}
              shareholders={shareholders}
              open={showPaymentDialog}
              createPayment={this.createPayment}
              onClose={() =>
                this.setState({
                  showPaymentDialog: false,
                  editingPayment: null,
                })
              }
            />*/}
          </div>
        </div>
        <SendEmailDialog
          open={SendEmailDialogState}
          onClose={this.handleClose}
          organization={organization}
          purchaseOrder={purchaseOrder}
          customer={customer}
        />
        {/* <div id="pageFooter">PO #${currentPurchaseOrder.id}</div> */}
      </div>
    );
  }
}

Presenter.propTypes = {
  purchaseOrder: PropTypes.object.isRequired,
  customer: PropTypes.object.isRequired,

  classes: PropTypes.object.isRequired,
  shareholders: PropTypes.array.isRequired,
};

export default withStyles(invoicePresenterStyles)(Presenter);
