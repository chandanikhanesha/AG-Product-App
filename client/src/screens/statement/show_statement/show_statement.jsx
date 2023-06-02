import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { differenceInDays } from 'date-fns';
import moment from 'moment';
import { format } from 'date-fns';
import { groupBy } from 'lodash';
import SweetAlert from 'react-bootstrap-sweetalert';
import ReactTable from 'react-table';
//import ReactToPrint from "react-to-print";

import {
  withStyles,
  //FormControl,
  //InputLabel,
  Select,
  MenuItem,
  Popover,
  MenuList,
  Paper,
  CircularProgress,
} from '@material-ui/core';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
// import Print from "@material-ui/icons/Print";

// material-ui icons
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';

import { isUnloadedOrLoading } from '../../../utilities';
import { showStatementStyles } from './show_statement.styles';
import AddPaymentDialog from './add_payment_dialog';

import { numberToDollars, customerProductDiscountsTotals } from '../../../utilities';
import { getProductFromOrder } from '../../../utilities/product';
import { getAppliedDiscounts } from '../../../utilities/purchase_order';

class ShowStatement extends Component {
  state = {
    shareholders: [],
    statementId: null,
    removeStatementConfirm: null,
    currentStatement: null,
    customerId: null,
    renderTablesDone: false,
    customer: null,
    moreFuncMenuOpen: false,
    addPaymentDialogOpen: false,
    loadingData: true,
    monthTableHeaders: [
      {
        Header: 'Item',
        show: true,
        accessor: 'item',
        headerStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          width: 350,
        },
      },
      {
        Header: 'Invoice',
        show: true,
        id: 'invoice',
        headerStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
        accessor: (d) => d,
        Cell: (props) => {
          const { classes } = this.props;
          const { customerId } = this.state;
          const item = props.value;
          return (
            <Button
              simple={true}
              className={classes.statementNoButton}
              onClick={() => {
                this.openInNewtab(`/app/customers/${customerId}/invoice/${item.invoice}`);
              }}
            >
              Invoice #{item.invoice}
            </Button>
          );
        },
      },
      {
        Header: 'Qty',
        show: true,
        accessor: 'qty',
        headerStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
      },
      {
        Header: 'Amount $',
        id: 'amount',
        show: true,
        headerStyle: {
          fontSize: 18,
          fontWeight: 'bold',
        },
        accessor: (d) => d,
        Cell: (props) => {
          return numberToDollars(props.value.amount);
        },
      },
      {
        Header: 'Total $',
        show: true,
        id: 'total',
        headerStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'left',
        },
        accessor: (d) => d,
        Cell: (props) => {
          return numberToDollars(props.value.total);
        },
      },
    ],
    pendingTableHeaders: [
      {
        Header: 'Date',
        show: true,
        headerStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'left',
        },
        accessor: 'date',
      },
      {
        Header: 'Invoice#',
        id: 'invoiceNo',
        show: true,
        headerStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'left',
        },
        accessor: (d) => d,
        Cell: (props) => {
          const { classes } = this.props;
          const { customerId } = this.state;
          const purchaseOrderIds = props.value.invoiceNo;
          return (
            <div>
              <React.Fragment>
                {purchaseOrderIds &&
                  purchaseOrderIds.map((purchaseOrderId) => {
                    return (
                      <Button
                        simple={true}
                        className={classes.statementNoButton}
                        onClick={() => {
                          this.openInNewtab(`/app/customers/${customerId}/invoice/${purchaseOrderId}`);
                        }}
                      >
                        Invoice #{purchaseOrderId}
                      </Button>
                    );
                  })}
              </React.Fragment>
            </div>
          );
        },
      },
      {
        Header: 'Invoice Total $',
        show: true,
        id: 'invoiceTotal',
        headerStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'left',
        },
        accessor: (d) => d,
        Cell: (props) => {
          return numberToDollars(props.value.invoiceTotal);
        },
      },
      {
        Header: 'Payment',
        show: true,
        id: 'payment',
        headerStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'left',
        },
        accessor: (d) => d,
        Cell: (props) => {
          return numberToDollars(props.value.payment);
        },
      },
      {
        Header: 'Remaining $',
        show: true,
        id: 'remaining',
        headerStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'left',
        },
        accessor: (d) => d,
        Cell: (props) => {
          return numberToDollars(props.value.remaining);
        },
      },
      {
        Header: 'Interest $',
        show: true,
        id: 'interest',
        headerStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'left',
        },
        accessor: (d) => d,
        Cell: (props) => {
          return numberToDollars(props.value.interest);
        },
      },
      {
        Header: 'Total $',
        show: true,
        id: 'total',
        headerStyle: {
          fontSize: 18,
          fontWeight: 'bold',
          textAlign: 'left',
        },
        accessor: (d) => d,
        Cell: (props) => {
          return numberToDollars(props.value.total);
        },
      },
    ],
  };

  monthTableLength = 0;
  pendingTableLength = 0;

  componentDidMount = async () => {
    await this.props.listCustomerProducts();
    await this.props.listCustomers();
    await this.props.listShareholders();
    await this.props.loadOrganization(this.props.organizationId);
    await this.props.listDealerDiscounts();
    await this.props.listProducts();
    await this.props.listAllCustomProducts();
    await this.props.listSeedCompanies();
    await this.props.listPayments();
    await this.props.listCompanies();
    await this.props.listCustomerCustomProducts();
    await this.props.listProductPackagings();
    await this.props.listSeedSizes();
    await this.props.listPackagings();
    await this.props.listPurchaseOrders();
    await this.props.listStatements();
    await this.props.listPurchaseOrderStatements();
    await this.props.listStatementSettings();
    await this.props.listDelayProducts();
    await this.props.listFinanceMethods();
    this.reload();
  };

  reload = async () => {
    const customerId = this.props.match.params.customer_id;
    const statementId = this.props.match.params.id;
    const currentStatement = await this.props.getStatementById(statementId);
    const customer = this.props.customers.find((customer) => customer.id === parseInt(customerId, 10));
    const shareholders = await this.props.getCustomerShareholders(customerId);
    this.setState({
      shareholders,
      statementId,
      currentStatement: currentStatement.payload,
      customerId,
      customer,
      loadingData: false,
    });
  };

  renderData = () => {
    const { listPurchaseOrders, listStatements, listPurchaseOrderStatements } = this.props;
    listPurchaseOrders(true);
    listStatements(true);
    listPurchaseOrderStatements(true);
  };

  get isLoading() {
    const loading = [
      this.props.statementStatus,
      this.props.purchaseOrderStatementsStatus,
      this.props.customerProductsStatus,
      this.props.customerCustomProductsLoadingStatus,
      this.props.productsStatus,
      this.props.seedCompaniesStatus,
      this.props.dealerDiscountsStatus,
      this.props.companiesStatus,
      this.props.paymentsStatus,
      this.props.seedSizesStatus,
      this.props.packagingsStatus,
      this.props.statementSettingsLoadingStatus,
      this.props.delayProductsLoadingStatus,
      this.props.financeMethodsLoadingStatus,
    ].some(isUnloadedOrLoading);

    return loading;
  }

  openInNewtab = (url) => {
    let win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  };

  handleAddPaymentDialogOpen = () => {
    this.setState({ addPaymentDialogOpen: true });
  };

  handleAddPaymentDialogClose = () => {
    this.setState({ addPaymentDialogOpen: false }, this.props.listPayments(true));
  };

  removeConfirm = async () => {
    const { classes, deleteStatement, customers } = this.props;

    const { statementId, currentStatement } = this.state;

    const statementNo = currentStatement.statementNo;

    const customer = customers.find((customer) => customer.id === currentStatement.customerId);

    this.setState({
      removeStatementConfirm: (
        <SweetAlert
          showCancel
          title={'Remove Statement #' + statementNo}
          onConfirm={async () => {
            await deleteStatement(statementId);
            this.setState({ removeStatementConfirm: null, statementId: '' }, () => {
              this.renderData();
            });
          }}
          onCancel={() => this.setState({ removeStatementConfirm: null })}
          confirmBtnText="Remove"
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnText="Cancel"
          cancelBtnCssClass={classes.button + ' ' + classes.white + ' ' + classes.primary}
        >
          You are going to remove Statement #{statementNo} For {customer.name}
        </SweetAlert>
      ),
    });
  };

  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));
  };

  handleMoreFuncMenuClose = () => {
    this.setState({ moreFuncMenuOpen: false });
  };

  print() {
    // console.log('print')
    // TODO: if we dont end up using html2pdf.js, remove it as a dependency
    // html2pdf(document.getElementById('invoice'))
    window.print();
  }

  getMonthTableData = () => {
    const { purchaseOrderStatements } = this.props;
    const { currentStatement } = this.state;
    if (!purchaseOrderStatements) return;
    let monthTotal = 0;
    const currentPurchaseOrderStatements = purchaseOrderStatements
      .filter(
        (purchaseOrderStatement) =>
          purchaseOrderStatement.statementId === currentStatement.id &&
          purchaseOrderStatement.isRemoved === false &&
          (purchaseOrderStatement.isDeferred
            ? differenceInDays(moment.utc().format(), purchaseOrderStatement.deferredDate) === 0
            : true),
      )
      .sort((a, b) => {
        return a.purchaseOrderId - b.purchaseOrderId;
      });
    let monthTableData = [];
    currentPurchaseOrderStatements.forEach((purchaseOrderStatement) => {
      purchaseOrderStatement.statementData
        .filter((statement) => moment.utc(statement.orderDate).format('YYYY MM') === moment.utc().format('YYYY MM'))
        .forEach((data) => {
          monthTableData.push({
            item: data.description,
            invoice: purchaseOrderStatement.purchaseOrderId,
            qty: data.qty,
            amount: data.rateValue,
            total: data.amountValue,
          });
          monthTotal += data.amountValue;
        });
    });
    this.monthTableLength = monthTableData.length;
    return { monthTableData, monthTotal };
  };

  getMonthTableHeaderProps = () => {
    return {
      style: {
        borderBottom: '1px solid #dddddd',
      },
    };
  };

  getMonthTableRowProps = (_, rowInfo) => {
    return {
      style: {
        fontSize: 16,
        fontWeight: '600',
        borderBottom: rowInfo && rowInfo.index < this.monthTableLength - 1 ? '1px solid #dddddd' : null,
        height: 84,
        margin: 0,
      },
    };
  };

  getProductDiscountsData(purchaseOrder) {
    const {
      customerProducts,
      customerCustomProducts,
      seedCompanies,
      products,
      customProducts,
      dealerDiscounts,
      companies,
      selectedShareholder,
    } = this.props;
    return [...customerProducts, ...customerCustomProducts]
      .filter((cp) => cp.purchaseOrderId === purchaseOrder.id)
      .map((order) => {
        let appliedDiscounts = getAppliedDiscounts(order, dealerDiscounts);
        let product = getProductFromOrder(order, products, customProducts);
        let seedCompany;
        let company;
        if (order.hasOwnProperty('customProductId')) {
          company = companies.find((c) => c.id === product.companyId);
        } else {
          seedCompany = seedCompanies.find((sc) => sc.id === product.seedCompanyId);
        }
        return {
          discountData: customerProductDiscountsTotals(
            order,
            appliedDiscounts,
            product,
            null,
            null,
            selectedShareholder,
            purchaseOrder,
          ),
          product,
          seedCompany,
          company,
          order,
        };
      });
  }

  pendingTableData = () => {
    const { purchaseOrderStatements, financeMethods, payments, getPurchaseOrderById } = this.props;

    const { currentStatement } = this.state;

    if (!purchaseOrderStatements) return;
    let data = [];
    let productDiscountsDatas = [];
    let paymentDatas = [];
    let financeSeedCompaniesMethods = [];
    let financeCompaniesMethods = [];
    let financeSeedCompaniesIds = [];
    let financeCompaniesIds = [];

    financeMethods.forEach((financeMethod) => {
      financeCompaniesIds = [...financeCompaniesIds, ...financeMethod.companyIds];
      financeSeedCompaniesIds = [...financeSeedCompaniesIds, ...financeMethod.seedCompanyIds];
      financeMethod.companyIds.forEach((id) => {
        financeCompaniesMethods.push({
          companyId: id,
          interestMethod: financeMethod.interestMethod,
          interestRate: financeMethod.interestRate,
        });
      });
      financeMethod.seedCompanyIds.forEach((id) => {
        financeSeedCompaniesMethods.push({
          seedCompanyId: id,
          interestMethod: financeMethod.interestMethod,
          interestRate: financeMethod.interestRate,
        });
      });
    });

    const currentPurchaseOrderStatements = purchaseOrderStatements
      .filter(
        (purchaseOrderStatement) =>
          purchaseOrderStatement.statementId === currentStatement.id && purchaseOrderStatement.isRemoved === false,
      )
      .sort((a, b) => {
        return a.purchaseOrderId - b.purchaseOrderId;
      });

    currentPurchaseOrderStatements.forEach(async (purchaseOrderStatement) => {
      const purchaseOrderId = purchaseOrderStatement.purchaseOrderId;
      await getPurchaseOrderById(purchaseOrderId);
      const { currentPurchaseOrder: purchaseOrder } = this.props;
      // let products = [...customerProducts, ...customerCustomProducts].find(
      //   cp => cp.purchaseOrderId === purchaseOrderId
      // );
      let currentPayments = payments.filter((p) => p.purchaseOrderId === purchaseOrderId);
      let getProductDiscountsDatas = this.getProductDiscountsData(purchaseOrder);
      if (getProductDiscountsDatas) {
        productDiscountsDatas = productDiscountsDatas.concat(getProductDiscountsDatas);
      }
      if (currentPayments) {
        currentPayments.forEach((currentPayment) => (paymentDatas = paymentDatas.concat(currentPayment)));
      }
    });
    //console.log(productDiscountsDatas)
    let productDiscountsDataGroups = [];
    if (productDiscountsDatas.length > 0) {
      productDiscountsDataGroups = groupBy(
        productDiscountsDatas.filter(
          (_data) => moment.utc(_data.order.createdAt).format('MM YYYY') < moment.utc().format('MM YYYY'),
        ),
        (productDiscountsData) => {
          return moment.utc(productDiscountsData.order.createdAt).format('MM/DD/YYYY');
        },
      );
      //console.log(productDiscountsDataGroups);
      Object.keys(productDiscountsDataGroups).forEach((date) => {
        let newItems = 0,
          prevBalance = 0,
          interestCompoundingDays = 0,
          InterestRate = 0,
          interestChargeValue = 0,
          pastDueWithInterest = 0,
          newAmount = 0,
          payment = 0,
          remainingBalance = 0,
          nextCharge = 0,
          purchaseOrderIds = [];
        productDiscountsDataGroups[date].forEach((productDiscountsData) => {
          const { seedCompany, company } = productDiscountsData;
          let interestMethod, interestRate;
          if (seedCompany) {
            if (financeSeedCompaniesIds.includes(seedCompany.id)) {
              const method = financeSeedCompaniesMethods.find(
                (financeSeedCompaniesMethod) => financeSeedCompaniesMethod.seedCompanyId === seedCompany.id,
              );
              interestMethod = method.interestMethod;
              interestRate = method.interestRate;
            }
          }
          if (company) {
            if (financeCompaniesIds.includes(company.id)) {
              const method = financeCompaniesMethods.find(
                (financeCompaniesMethod) => financeCompaniesMethod.companyId === company.id,
              );
              interestMethod = method.interestMethod;
              interestRate = method.interestRate;
            }
          }
          if (interestMethod === 'fixed') {
            nextCharge += parseFloat(interestRate);
          }
          if (interestMethod === 'compound') {
            nextCharge += parseFloat(productDiscountsData.discountData.total) * parseFloat(interestRate);
          }
          newItems += parseFloat(productDiscountsData.discountData.total);
          if (!purchaseOrderIds.includes(productDiscountsData.order.purchaseOrderId)) {
            purchaseOrderIds.push(productDiscountsData.order.purchaseOrderId);
          }
        });

        newItems = parseFloat(newItems.toFixed(2));
        data.push({
          date,
          newItems,
          prevBalance,
          interestCompoundingDays,
          InterestRate,
          interestChargeValue,
          pastDueWithInterest,
          newAmount,
          payment,
          remainingBalance,
          nextCharge,
          purchaseOrderIds,
        });
      });
    }
    if (paymentDatas.length > 0) {
      const paymentDataGroups = groupBy(paymentDatas, (paymentData) => {
        return moment.utc(paymentData.createdAt).format('MM/DD/YYYY');
      });

      Object.keys(paymentDataGroups).forEach((paymentDate) => {
        if (productDiscountsDataGroups && productDiscountsDataGroups[paymentDate]) {
          const item = data.find((item) => item.date === paymentDate);
          let total = 0;
          paymentDataGroups[paymentDate].forEach((payment) =>
            payment.method === 'Return' ? (total -= parseFloat(payment.amount)) : (total += parseFloat(payment.amount)),
          );
          if (item) {
            item.payment = parseFloat(total.toFixed(2));
          }
        } else {
          let date = paymentDate,
            newItems = 0,
            prevBalance = 0,
            interestCompoundingDays = 0,
            InterestRate = 0,
            interestChargeValue = 0,
            pastDueWithInterest = 0,
            newAmount = 0,
            payment = 0,
            remainingBalance = 0;
          let total = 0;
          paymentDataGroups[paymentDate].forEach((payment) =>
            payment.method === 'Return' ? (total -= parseFloat(payment.amount)) : (total += parseFloat(payment.amount)),
          );
          payment = parseFloat(total.toFixed(2));
          data.push({
            date,
            newItems,
            prevBalance,
            interestCompoundingDays,
            InterestRate,
            interestChargeValue,
            pastDueWithInterest,
            newAmount,
            payment,
            remainingBalance,
            nextCharge: 0,
          });
        }
      });
    }
    // if(!data) return;
    // data.sort((a, b) => new Date(a.date) - new Date(b.date));
    // let startDate = moment.utc(data[0].date).format("MM/DD/YYYY");
    // let chargeDate = moment.utc(data[0].date)
    //   .add(1, "month")
    //   .format("MM/DD/YYYY");
    // const today = moment.utc().format("MM/DD/YYYY");
    // let chargeDates = [],
    //   dataDates = [];
    // while (chargeDate < today) {
    //   chargeDates.push(chargeDate);
    //   chargeDate = moment.utc(chargeDate)
    //     .add(1, "month")
    //     .format("MM/DD/YYYY");
    // }
    // data.forEach(d => dataDates.push(d.date));
    // chargeDates.forEach(chargeDate => {
    //   if (!dataDates.includes(chargeDate)) {
    //     data.push({
    //       date: chargeDate,
    //       newItems: 0,
    //       prevBalance: 0,
    //       interestCompoundingDays: 0,
    //       InterestRate: 0,
    //       interestChargeValue: 0,
    //       pastDueWithInterest: 0,
    //       newAmount: 0,
    //       payment: 0,
    //       remainingBalance: 0,
    //       nextCharge:0
    //     });
    //   }
    // });
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    //console.log(data);
    for (let index in data) {
      if (parseInt(index, 10) !== 0) {
        data[index].prevBalance = parseFloat(data[index - 1].remainingBalance.toFixed(2));
        data[index].interestChargeValue = parseFloat(data[index - 1].nextCharge.toFixed(2));
      }
      data[index].pastDueWithInterest = parseFloat(
        (data[index].prevBalance + data[index].interestChargeValue).toFixed(2),
      );
      data[index].newAmount = parseFloat(
        (data[index].newItems + data[index].prevBalance + data[index].interestChargeValue).toFixed(2),
      );
      data[index].remainingBalance = parseFloat((data[index].newAmount - data[index].payment).toFixed(2));
    }
    //console.log(data)
    // const groupData = groupBy(data, d => {
    //   return moment.utc(d.date).format("MMM YYYY");
    // });

    let result = [];
    let totalInvoice = 0,
      totalPayment = 0,
      totalRemaining = 0,
      totalInterest = 0,
      totalAmount = 0;
    data.forEach((monthData) => {
      let date = monthData.date,
        invoiceNo = monthData.purchaseOrderIds,
        invoiceTotal = monthData.newItems,
        payment = monthData.payment,
        remaining = invoiceTotal - payment,
        interest = monthData.nextCharge ? monthData.nextCharge : 0,
        total = remaining + interest;
      totalAmount += total;
      totalRemaining += remaining;
      totalInvoice += invoiceTotal;
      totalPayment += payment;
      totalInterest += interest;
      result.push({
        date,
        invoiceNo,
        invoiceTotal,
        payment,
        remaining,
        interest,
        total: total,
      });
    });
    // for (let index in groupData) {
    //   let month = index,
    //     invoiceNo = "IN#03",
    //     invoiceTotal = 0,
    //     payment = 0,
    //     remaining = 0,
    //     interest = 0,
    //     total = 0;
    //   groupData[index].forEach(monthData => {
    //     invoiceTotal += monthData.newItems;
    //     payment += monthData.payment;
    //     remaining += invoiceTotal - payment;
    //     interest += monthData.nextCharge ? monthData.nextCharge : 0;
    //   });
    //   total = remaining + interest;
    //   totalAmount += total;
    //   totalRemaining += remaining;
    //   totalInvoice += invoiceTotal;
    //   totalPayment += payment;
    //   totalInterest += interest;
    //   result.push({
    //     month,
    //     invoiceNo,
    //     invoiceTotal,
    //     payment,
    //     remaining,
    //     interest,
    //     total: total
    //   });
    // }
    result.push({
      month: '',
      invoiceNo: '',
      invoiceTotal: totalInvoice,
      payment: totalPayment,
      remaining: totalRemaining,
      interest: totalInterest,
      total: totalAmount,
      totalValue: totalAmount,
    });

    this.pendingTableLength = result.length;
    return result;
  };

  getPendingTableHeaderProps = () => {
    return {
      style: {
        borderBottom: '1px solid #dddddd',
        margin: '21px 25px 0 40px',
      },
    };
  };

  getPendingTableRowProps = (_, rowInfo) => {
    return {
      style: {
        borderBottom: rowInfo && rowInfo.index < this.pendingTableLength - 1 ? '1px solid #dddddd' : null,
        height: rowInfo && rowInfo.index < this.pendingTableLength - 1 ? 84 : 60,
        margin: rowInfo && rowInfo.index < this.pendingTableLength - 1 ? '0 25px 0 40px' : null,
        padding: rowInfo && rowInfo.index < this.pendingTableLength - 1 ? null : '0 25px 0 40px',
        background: rowInfo && rowInfo.index === this.pendingTableLength - 1 ? 'rgb(236, 243, 238)' : 'transparent',
        fontSize: rowInfo && rowInfo.index < this.pendingTableLength - 1 ? '16px' : '21px',
        fontWeight: rowInfo && rowInfo.index < this.pendingTableLength - 1 ? '600' : '800',
      },
    };
  };

  gotoStatement = (id) => {
    const route = this.props.match.path.replace(':customer_id', this.state.customer.id).replace(':id', id);
    this.props.history.push(route);
    this.reload();
  };

  render() {
    const {
      currentStatement,
      customer,
      moreFuncMenuOpen,
      monthTableHeaders,
      pendingTableHeaders,
      shareholders,
      addPaymentDialogOpen,
      loadingData,
    } = this.state;
    if (this.isLoading || loadingData) return <CircularProgress />;

    const { statements = [], classes, purchaseOrderStatements } = this.props;
    const { monthTableData, monthTotal } = this.getMonthTableData();
    const pendingTableData = this.pendingTableData();

    const currentPurchaseOrderStatements = purchaseOrderStatements
      .filter(
        (purchaseOrderStatement) =>
          purchaseOrderStatement.statementId === currentStatement.id && purchaseOrderStatement.isRemoved === false,
      )
      .sort((a, b) => {
        return a.purchaseOrderId - b.purchaseOrderId;
      });

    let currentStatements = statements
      .filter((statement) => statement.customerId === parseInt(customer.id, 10))
      .sort((a, b) => b.id - a.id);

    let previousStatementNo = null,
      previousStatementDate = null,
      previousAmount = null;
    let statementsBefore = currentStatements
      .filter((statement) => statement.createdAt < currentStatement.createdAt)
      .sort((a, b) => b.id - a.id);
    if (statementsBefore.length > 0) {
      previousStatementNo = statementsBefore[0].statementNo;
      previousStatementDate = moment.utc(statementsBefore[0].createdAt).format('MMM YYYY');
      previousAmount = pendingTableData[pendingTableData.length - 1].totalValue;
    }
    return (
      <React.Fragment>
        <div style={{ marginBottom: 40 }}>
          <div style={{ marginBottom: 20 }}>
            <Link
              className={`${classes.backToCustomerLink} hide-print`}
              key={currentStatement.id}
              to={`/app/customers`}
            >
              Back to Customers/
            </Link>

            {customer && <span className={`${classes.customerStatement} hide-print`}>{customer.name}'s Statement</span>}
          </div>

          <div className={classes.newButtonBar}>
            <div className={`${classes.purchaseOrderInput} hide-print`}>
              <Select
                value={currentStatement.id}
                onChange={(e) => this.gotoStatement(e.target.value)}
                className={classes.poSelector}
              >
                {currentStatements.map((statement) => {
                  return (
                    <MenuItem
                      value={statement.id}
                      key={statement.id}
                      component={Link}
                      to={`/app/customers/${customer.id}/statement/${statement.id}`}
                    >
                      <span className={classes.poSelector}>{`ST#${statement.statementNo}`}</span>
                    </MenuItem>
                  );
                })}
              </Select>
            </div>

            <div className={`${classes.newButtonBarSpacing}  hide-print`}></div>

            <span className={`${classes.createdAt} hide-print`}>
              <span className={classes.generateText}>{currentStatement.statementNo} Generated on</span>{' '}
              {format(currentStatement.createdAt, 'MMM D, YYYY')}
            </span>

            <Button
              className={`${classes.iconButton} hide-print`}
              variant="contained"
              color="primary"
              buttonRef={(node) => {
                this.moreFuncMenuAnchorEl = node;
              }}
              onClick={this.handleMoreFuncMenuToggle}
            >
              <MoreHorizontalIcon />
            </Button>
            <Popover
              open={moreFuncMenuOpen}
              anchorEl={this.moreFuncMenuAnchorEl}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              onClose={this.handleMoreFuncMenuClose}
              className="hide-print"
            >
              <Paper>
                <MenuList>
                  <MenuItem
                    className={`${classes.moreFuncMenuItem} hide-print`}
                    onClick={() => {
                      this.print();
                    }}
                  >
                    Print
                  </MenuItem>
                  <MenuItem
                    className={`${classes.moreFuncMenuItem} hide-print`}
                    onClick={() => {
                      this.removeConfirm();
                    }}
                  >
                    Remove Statement
                  </MenuItem>
                </MenuList>
              </Paper>
            </Popover>
            <Button variant="contained" color="primary" onClick={this.handleAddPaymentDialogOpen}>
              Add Payment
            </Button>
          </div>
        </div>
        <span className={classes.paperHeader}>NEW ITEMS THIS MONTH ({moment.utc().format('MMM YYYY')})</span>
        <Paper className={classes.farmPaper}>
          <div style={{ padding: '21px 25px 0 40px' }}>
            <ReactTable
              data={monthTableData}
              columns={monthTableHeaders}
              minRows={1}
              resizable={false}
              showPagination={false}
              getTrProps={() => this.getMonthTableRowProps(monthTableData.length)}
              getTheadProps={this.getMonthTableHeaderProps}
            />
          </div>
          <div className={classes.tableTotalRow}>
            <div className={classes.tableTotalRowNumber}>
              <b>{numberToDollars(monthTotal)}</b>
            </div>
          </div>
        </Paper>
        <span className={classes.paperHeader}>Pending payment from previous months</span>
        <Paper className={classes.farmPaper}>
          <ReactTable
            data={pendingTableData}
            columns={pendingTableHeaders}
            minRows={1}
            resizable={false}
            showPagination={false}
            getTrProps={this.getPendingTableRowProps}
            getTheadProps={this.getPendingTableHeaderProps}
          />
        </Paper>
        <Paper classes={{ root: classes.orderTotalPaper }}>
          <h2 className={classes.orderTotalTitle}>Summary</h2>
          <div className={classes.orderTotalDisplayRow}>
            <div style={{ display: 'flex' }}>
              <div className={classes.orderTotalDisplayCol}>
                <span className={classes.orderTotalDisplayColHeader}>Past</span>
                <span className={classes.orderTotalDisplayColSubHeader}>
                  {previousStatementNo ? `ST#${previousStatementNo} ${previousStatementDate}` : 'No previous Statement'}
                </span>
                <span className={classes.orderTotalDisplayColText}>
                  {previousAmount ? numberToDollars(previousAmount) : null}
                </span>
              </div>
              <div className={classes.orderTotalDisplayCol}>
                <span className={classes.orderTotalDisplayColHeader}>This Month</span>
                <span className={classes.orderTotalDisplayColSubHeader}>
                  ST#{currentStatement.statementNo} {moment.utc().format('MMM YYYY')}
                </span>
                <span className={classes.orderTotalDisplayColText}>{numberToDollars(monthTotal)}</span>
              </div>
            </div>
            <div className={classes.orderTotalDisplayCol}>
              <span className={classes.orderTotalDisplaySummaryHeader}>Total</span>
              <span className={classes.orderTotalDisplaySummaryText}>
                {previousAmount ? numberToDollars(previousAmount + monthTotal) : numberToDollars(monthTotal)}
              </span>
            </div>
          </div>
        </Paper>
        <AddPaymentDialog
          open={addPaymentDialogOpen}
          onClose={this.handleAddPaymentDialogClose}
          shareholders={shareholders}
          customer={customer}
          currentPurchaseOrderStatements={currentPurchaseOrderStatements}
        />
      </React.Fragment>
    );
  }
}

export default withStyles(showStatementStyles)(ShowStatement);
