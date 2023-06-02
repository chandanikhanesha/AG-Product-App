import React, { Component } from 'react';
import ReactTable from 'react-table';
import { format, addDays, addMonths, differenceInDays, isToday } from 'date-fns';
import { isEmpty } from 'lodash/lang';
import moment from 'moment';

import { withStyles, Grid } from '@material-ui/core';

import InvoiceHeader from './invoice_header';
import { invoiceTableStyles } from './invoice_table.styles';

import { numberToDollars, customerProductDiscountsTotals } from '../../../../utilities';
import { getProductFromOrder, getProductName } from '../../../../utilities/product';
import { getAppliedDiscounts } from '../../../../utilities/purchase_order';

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
    const {
      purchaseOrderStatement,
      currentstatement: { compoundingDays, startDate },
    } = this.props;
    const refreshData =
      !isToday(startDate) &&
      differenceInDays(startDate, moment.utc().format()) % compoundingDays === 0 &&
      format(purchaseOrderStatement.updatedAt, 'YYYY-MM-DD HH:mm') !==
        format(purchaseOrderStatement.reportUpdatedDate, 'YYYY-MM-DD HH:mm');
    let tableData = [];
    if (refreshData || purchaseOrderStatement.statementData === null) {
      tableData = this.invoiceTableData();
    } else {
      tableData = purchaseOrderStatement.statementData;
      this.totalNetPrice = purchaseOrderStatement.totalAmount;
    }
    this.invoiceTableData();

    this.setState({
      tableData,
    });
  };

  getProductDiscountsData() {
    const {
      customerProducts,
      customerCustomProducts,
      purchaseOrder,
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

  get groupedDiscountsData() {
    let productDiscountsData = this.getProductDiscountsData();
    let seedTypeGrouping = { BUSINESS: [] };
    productDiscountsData.forEach((data) => {
      if (data.product.hasOwnProperty('companyId')) {
        seedTypeGrouping['BUSINESS'] = [...seedTypeGrouping['BUSINESS'], data];
      } else {
        if (seedTypeGrouping[data.product.seedType]) {
          seedTypeGrouping[data.product.seedType] = [...seedTypeGrouping[data.product.seedType], data];
        } else {
          seedTypeGrouping[data.product.seedType] = [data];
        }
      }
    });
    return seedTypeGrouping;
  }

  getPackaging(packagingGroup) {
    return this.props.packagings.find((p) => p.id === packagingGroup.packagingId);
  }

  getSeedSize(packagingGroup) {
    return this.props.seedSizes.find((ss) => ss.id === packagingGroup.seedSizeId);
  }

  invoiceTableData() {
    const { seedCompanies, companies, purchaseOrder, currentstatement, updatePurchaseOrderStatement, customer } =
      this.props;
    let rows = [];
    let saveRows = [];
    let totalUnits = 0;
    let totalItemTotals = 0;
    let totalNetPrices = 0;
    let total = 0;
    let isDefferedProduct = customer.isDefferedProduct;
    let defferedSeedCompanyId = [];
    let defferedCompanyId = [];
    if (isDefferedProduct) {
    }
    seedCompanies.map((seedCompany) => {
      const metadata = JSON.parse(seedCompany.metadata);
      const cropTypes = Object.keys(metadata);
      cropTypes.forEach((seedType) => {
        if (isEmpty(this.groupedDiscountsData)) {
          return rows;
        }
        let discountsData = this.groupedDiscountsData[seedType.toUpperCase()].filter(
          (d) => d.seedCompany.id === seedCompany.id,
        );

        discountsData.forEach((data) => {
          let units = data.order.orderQty;
          totalUnits += units;
          totalItemTotals += data.discountData.originalPrice;
          const netPrice = units === 0 ? units : (data.discountData.total / units).toFixed(2);

          totalNetPrices += parseFloat(netPrice);

          total += data.discountData.total;

          rows.push({
            qty: <div>{units}</div>,
            item: <div>{seedType.toUpperCase()}</div>,
            description: <div>{getProductName(data.product, seedCompanies)}</div>,
            rate: <div>{numberToDollars(netPrice)}</div>,
            amount: <div>{numberToDollars(data.discountData.total)}</div>,
          });

          saveRows.push({
            qty: units,
            item: seedType.toUpperCase(),
            description: getProductName(data.product, seedCompanies),
            rate: numberToDollars(netPrice),
            rateValue: netPrice,
            amount: numberToDollars(data.discountData.total),
            amountValue: data.discountData.total,
          });
        });
      });
    });

    companies.map((company) => {
      if (isEmpty(this.groupedDiscountsData)) return rows;
      let discountsData = this.groupedDiscountsData['BUSINESS'].filter((d) => d.company.id === company.id);
      discountsData.forEach((data) => {
        let netPrice = 0;
        if (data.discountData.total && (data.product.msrp || data.product.costUnit)) {
          netPrice = (data.discountData.total / (data.product.msrp || data.product.costUnit)).toFixed(2);
          total += data.discountData.total;
        }
        if (data.discountData.total) {
          rows.push({
            qty: <div>{data.product.unit}</div>,
            item: <div>{data.product.name}</div>,
            description: <div>{data.product.description}</div>,
            rate: <div>{numberToDollars(netPrice)}</div>,
            amount: <div>{numberToDollars(data.discountData.total)}</div>,
          });
          saveRows.push({
            qty: data.product.unit,
            item: data.product.name,
            description: data.product.description,
            rate: numberToDollars(netPrice),
            rateValue: netPrice,
            amount: numberToDollars(data.discountData.total),
            amountValue: data.discountData.total,
          });
        }
      });
    });

    this.totalNetPrice = total;

    let data = {
      statementId: currentstatement.id,
      purchaseOrderId: purchaseOrder.id,
      statementData: saveRows,
      totalAmount: this.totalNetPrice,
      reportUpdatedDate: moment.utc().format(),
    };
    updatePurchaseOrderStatement(data);

    return rows;
  }

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
    const { classes, currentstatement } = this.props;
    const { compoundingDays, startDate, statementNo } = currentstatement;

    let dueDate = null;
    if (compoundingDays === 14) dueDate = addDays(startDate, 14);
    if (compoundingDays === 30) dueDate = addMonths(startDate, 1);
    if (compoundingDays === 90) dueDate = addMonths(startDate, 3);

    return (
      <div className={classes.tableStyle}>
        <InvoiceHeader statementNo={statementNo} />
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
