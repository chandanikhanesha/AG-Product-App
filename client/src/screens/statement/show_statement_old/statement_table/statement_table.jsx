import React, { Component } from 'react';
import ReactTable from 'react-table';
import { format } from 'date-fns';
import moment from 'moment';
import { groupBy } from 'lodash';

import { withStyles } from '@material-ui/core';

import { numberToDollars, customerProductDiscountsTotals } from '../../../../utilities';
import { getProductFromOrder } from '../../../../utilities/product';
import { getAppliedDiscounts } from '../../../../utilities/purchase_order';

import StatementHeader from './statement_header';

import { statementTableStyles } from './statement_table.styles';

class StatementTable extends Component {
  state = {
    summmaryColumns: [
      {
        Header: 'Date',
        accessor: 'date',
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      {
        Header: 'Transaction',
        accessor: 'transaction',
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      {
        Header: 'Amount',
        accessor: 'amount',
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      {
        Header: 'Balance',
        accessor: 'balance',
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
    ],
    interestChargeColumns: [
      {
        Header: 'Date',
        accessor: 'date',
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      {
        Header: 'New Items',
        id: 'newItems',
        accessor: (d) => d,
        Cell: (props) => {
          return <div>{`$${props.value.newItems}`}</div>;
        },
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      {
        Header: 'Balance From Prev Date',
        id: 'prevBalance',
        accessor: (d) => d,
        Cell: (props) => {
          return <div>{`$${props.value.prevBalance}`}</div>;
        },
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      // {
      //   Header: "Interest Compounding Days",
      //   accessor: "interestCompoundingDays",
      //   headerStyle: {
      //     textAlign: "center",
      //     borderBottom: "2px solid",
      //     borderRight: "2px solid",
      //     backgroundColor: "lightgrey"
      //   }
      // },
      // {
      //   Header: "Interest Rate",
      //   id: "InterestRate",
      //   accessor: d => d,
      //   Cell: props => {
      //     return <div>{`${props.value.InterestRate}%`}</div>;
      //   },
      //   headerStyle: {
      //     textAlign: "center",
      //     borderBottom: "2px solid",
      //     borderRight: "2px solid",
      //     backgroundColor: "lightgrey"
      //   }
      // },
      {
        Header: 'Interest Charged',
        id: 'interestChargeValue',
        accessor: (d) => d,
        Cell: (props) => {
          return <div>{`$${props.value.interestChargeValue}`}</div>;
        },
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      {
        Header: 'Past Due with Interest',
        id: 'pastDueWithInterest',
        accessor: (d) => d,
        Cell: (props) => {
          return <div>{`$${props.value.pastDueWithInterest}`}</div>;
        },
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      {
        Header: 'New Amount',
        id: 'newAmount',
        accessor: (d) => d,
        Cell: (props) => {
          return <div>{`$${props.value.newAmount}`}</div>;
        },
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      {
        Header: ' Payment Made',
        id: 'payment',
        accessor: (d) => d,
        Cell: (props) => {
          return <div>{`$${props.value.payment}`}</div>;
        },
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          borderRight: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
      {
        Header: 'Remaining Balance',
        id: 'remainingBalance',
        accessor: (d) => d,
        Cell: (props) => {
          return <div>{`$${props.value.remainingBalance}`}</div>;
        },
        headerStyle: {
          textAlign: 'center',
          borderBottom: '2px solid',
          backgroundColor: 'lightgrey',
        },
      },
    ],
    statementTableRows: null,
    interestChargeTableRows: null,
  };

  componentDidMount = () => {
    const statementTableData = this.statementTable();
    const interestChargeTableData = this.interestChargeTable();
    this.setState({
      statementTableRows: statementTableData,
      interestChargeTableRows: interestChargeTableData,
    });
  };

  statementTableData = () => {
    const { currentpurchaseOrderStatements, purchaseOrders } = this.props;
    let rows = [];
    if (currentpurchaseOrderStatements.length < 1) return rows;
    currentpurchaseOrderStatements.forEach((purchaseOrderStatement) => {
      let po = purchaseOrders.find((po) => po.id === purchaseOrderStatement.purchaseOrderId);
      let statementDatas = purchaseOrderStatement.statementData;
      let count = 0;
      let balance = 0;
      statementDatas &&
        statementDatas.forEach((statementData) => {
          let date = null;
          if (count === 0) {
            date = po.updatedAt;
            count++;
          }
          let transaction = '---' + statementData.description + ' ' + statementData.rate;
          let amount = parseFloat(statementData.amountValue);
          balance += amount;
          rows.push({
            date: <div>{date ? format(date, 'MM/DD/YYYY') : null}</div>,
            transaction: <div>{transaction}</div>,
            amount: <div>{numberToDollars(amount.toFixed(2))}</div>,
            balance: <div>{numberToDollars(balance.toFixed(2))}</div>,
          });
        });
    });
    return rows;
  };

  statementTable() {
    const { classes } = this.props;
    let tableData = this.statementTableData();
    if (tableData.length < 1) return null;
    return (
      <React.Fragment>
        <ReactTable
          sortable={false}
          showPagination={false}
          defaultPageSize={tableData.length}
          minRows={1}
          columns={this.state.summmaryColumns}
          data={tableData}
          className={classes.reactTable}
        />
      </React.Fragment>
    );
  }

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

  interestChargeTableData = () => {
    const {
      currentpurchaseOrderStatements,
      purchaseOrders,
      // customerCustomProducts,
      // customerProducts,
      financeMethods,
      payments,
    } = this.props;
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

    currentpurchaseOrderStatements.forEach((purchaseOrderStatement) => {
      const purchaseOrderId = purchaseOrderStatement.purchaseOrderId;
      let purchaseOrder = purchaseOrders.find((po) => po.id === purchaseOrderId);
      // let products = [...customerProducts, ...customerCustomProducts].find(
      //   cp => cp.purchaseOrderId === purchaseOrderId
      // );
      let currentPayment = payments.find((p) => p.purchaseOrderId === purchaseOrderId);
      let getProductDiscountsDatas = this.getProductDiscountsData(purchaseOrder);
      if (getProductDiscountsDatas) {
        productDiscountsDatas = productDiscountsDatas.concat(getProductDiscountsDatas);
      }
      if (currentPayment) {
        paymentDatas = paymentDatas.concat(currentPayment);
      }
    });
    //console.log(productDiscountsDatas)
    let productDiscountsDataGroups = [];
    if (productDiscountsDatas.length > 0) {
      productDiscountsDataGroups = groupBy(productDiscountsDatas, (productDiscountsData) => {
        return moment.utc(productDiscountsData.order.createdAt).format('MM/DD/YYYY');
      });
      //console.log(productDiscountsDataGroups)
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
          nextCharge = 0;
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
          if (interestMethod === 'fixed') nextCharge += parseFloat(interestRate);
          if (interestMethod === 'compound')
            nextCharge += parseFloat(productDiscountsData.discountData.total) * parseFloat(interestRate);
          newItems += parseFloat(productDiscountsData.discountData.total);
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
          paymentDatas.forEach((payment) => (total += parseFloat(payment.amount)));
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
          paymentDatas.forEach((payment) => (total += parseFloat(payment.amount)));
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
          });
        }
      });
    }
    if (!data) return;
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    //let startDate = moment.utc(data[0].date).format("MM/DD/YYYY");
    let chargeDate = moment.utc(data[0].date).add(1, 'month').format('MM/DD/YYYY');
    const today = moment.utc().format('MM/DD/YYYY');
    let chargeDates = [],
      dataDates = [];
    while (chargeDate < today) {
      chargeDates.push(chargeDate);
      chargeDate = moment.utc(chargeDate).add(1, 'month').format('MM/DD/YYYY');
    }
    data.forEach((d) => dataDates.push(d.date));
    chargeDates.forEach((chargeDate) => {
      if (!dataDates.includes(chargeDate)) {
        data.push({
          date: chargeDate,
          newItems: 0,
          prevBalance: 0,
          interestCompoundingDays: 0,
          InterestRate: 0,
          interestChargeValue: 0,
          pastDueWithInterest: 0,
          newAmount: 0,
          payment: 0,
          remainingBalance: 0,
          nextCharge: 0,
        });
      }
    });
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
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
    return data;
  };

  interestChargeTable() {
    const { classes } = this.props;
    let tableData = this.interestChargeTableData();
    if (tableData.length < 1) return null;
    return (
      <React.Fragment>
        <ReactTable
          sortable={false}
          showPagination={false}
          defaultPageSize={tableData.length}
          minRows={1}
          columns={this.state.interestChargeColumns}
          data={tableData}
          className={classes.interestChargeTable}
        />
      </React.Fragment>
    );
  }

  render() {
    const { classes, currentstatement } = this.props;
    const { statementTableRows, interestChargeTableRows } = this.state;
    return (
      <div className={classes.tableStyle}>
        <StatementHeader statement={currentstatement} />
        {statementTableRows}
        {interestChargeTableRows}
      </div>
    );
  }
}

export default withStyles(statementTableStyles)(StatementTable);
