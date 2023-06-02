import React, { Component } from 'react';
import ReactTable from 'react-table';
import { capitalize } from 'lodash/string';
import { isEmpty } from 'lodash/lang';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';

import { numberToDollars, customerProductDiscountsTotals } from '../../utilities';
import { getProductFromOrder } from '../../utilities/product';
import { getAppliedDiscounts } from '../../utilities/purchase_order';
import Paper from '@material-ui/core/Paper';

const styles = {
  summaryTable: {
    border: '2px solid green',
    marginBottom: 20,
  },
  grandTotal: {
    textAlign: 'right',
    backgroundColor: 'transparent',
    boxShadow: '0 0 0 0',
    '& h2': {
      margin: 0,
    },
  },
};

class CropSummaryTable extends Component {
  state = {
    summmaryColumns: [
      {
        Header: 'Crop',
        accessor: 'crop',
      },
      {
        Header: '# Units',
        accessor: 'numberOfUnits',
      },
      {
        Header: 'Item total',
        accessor: 'itemTotal',
      },
      {
        Header: 'Discount Summary',
        accessor: 'discountSummary',
      },
      {
        Header: 'Discount',
        accessor: 'discountValue',
      },
      {
        Header: 'Discount amount',
        accessor: 'discountAmount',
      },
      {
        Header: 'Total',
        accessor: 'total',
        headerStyle: { textAlign: 'left' },
      },
    ],
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

  /**
   * Return discount / product data grouped by seed type
   */
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

  summaryTableData(company, type) {
    let rows = [];
    let companyTotal = 0;
    const isSeedCompany = type === 'seed';
    const { customProducts } = this.props;
    if (isEmpty(this.groupedDiscountsData)) return rows;

    let iterator = isSeedCompany
      ? Object.keys(this.groupedDiscountsData).filter((group) => !['BUSINESS'].includes(group))
      : ['BUSINESS'];

    let totalNumberOfUnits = 0;
    let totalItemTotal = 0;
    let totalDiscountAmounts = 0;

    iterator.forEach((seedType) => {
      let discountsData = this.groupedDiscountsData[seedType].filter((d) => {
        if (isSeedCompany) {
          return d.seedCompany.id === company.id;
        } else {
          return d.company.id === company.id;
        }
      });
      let numberOfUnits = 0;
      let numberOfUnitsValue = 0;
      if (discountsData.length === 0) return;

      // group data by discount id: {dealerDiscountId: discountData[]}
      let groupedByDiscountId = {};
      let customProductNames = [];
      discountsData.forEach((data) => {
        let shareholderPercentage;

        if (seedType === 'BUSINESS') {
          const productName = customProducts.find((p) => p.id === data.order.customProductId).name;
          customProductNames.push(productName);
        }

        if (this.props.selectedShareholder) {
          shareholderPercentage = data.discountData.shareholderPercentage / 100;
        } else {
          shareholderPercentage = 1;
        }

        numberOfUnits += parseInt(data.order.orderQty * shareholderPercentage, 10);
        numberOfUnitsValue = numberOfUnits;
        Object.keys(data.discountData.discounts).forEach((discountId) => {
          if (!groupedByDiscountId[discountId]) groupedByDiscountId[discountId] = [];
          groupedByDiscountId[discountId].push(data.discountData.discounts[discountId]);
        });
      });

      totalNumberOfUnits += numberOfUnits;
      numberOfUnits = <div> {numberOfUnits} </div>;

      let itemTotal = discountsData.reduce((acc, data) => acc + data.discountData.originalPrice, 0);
      totalItemTotal += itemTotal;
      itemTotal = <div> {numberToDollars(itemTotal)} </div>;

      let discountSummary = (
        <div>
          {Object.keys(groupedByDiscountId).map((dealerDiscountId) => (
            <div key={dealerDiscountId}>{groupedByDiscountId[dealerDiscountId][0].dealerDiscount.name}</div>
          ))}
        </div>
      );

      let discountValue = (
        <div>
          {Object.keys(groupedByDiscountId).map((dealerDiscountId) => (
            <div key={dealerDiscountId}>{groupedByDiscountId[dealerDiscountId][0].value}</div>
          ))}
        </div>
      );

      let discountAmount = (
        <div>
          {Object.keys(groupedByDiscountId).map((dealerDiscountId) => (
            <div key={dealerDiscountId}>
              {numberToDollars(
                groupedByDiscountId[dealerDiscountId].reduce((acc, discountData) => {
                  totalDiscountAmounts += discountData.amount;
                  return acc + discountData.amount;
                }, 0),
              )}
            </div>
          ))}
        </div>
      );
      let total = (
        <div>
          {numberToDollars(
            discountsData.reduce((acc, data) => {
              let t = acc + data.discountData.total;
              companyTotal += data.discountData.total;
              return t;
            }, 0),
          )}
        </div>
      );

      if (customProductNames.length > 3) {
        customProductNames = customProductNames.slice(0, 3);
        customProductNames.concat('...');
      }
      const businessGroupName = customProductNames.join(', ');
      const crop = seedType.toUpperCase() === 'BUSINESS' ? businessGroupName : capitalize(seedType);

      numberOfUnitsValue > 0 &&
        rows.push({
          numberOfUnits,
          crop,
          itemTotal,
          discountSummary,
          discountValue,
          discountAmount,
          total,
        });
    });

    rows.push({
      crop: 'SUMMARY',
      numberOfUnits: totalNumberOfUnits,
      itemTotal: numberToDollars(totalItemTotal),
      ///discountAmount: 'Order Total',
      discountAmount: numberToDollars(totalDiscountAmounts),
      total: numberToDollars(companyTotal),
      total_raw: companyTotal,
    });

    return rows;
  }

  seedCompanyTable(seedCompany) {
    const tableData = this.summaryTableData(seedCompany, 'seed');
    if (tableData.length < 2) return null;
    return {
      summaryRow: tableData[tableData.length - 1],
      table: (
        <React.Fragment key={`SC${seedCompany.id}`}>
          <h4>{seedCompany.name}</h4>
          <ReactTable
            sortable={false}
            showPagination={false}
            minRows={1}
            columns={this.state.summmaryColumns}
            data={tableData}
            className={this.props.classes.summaryTable}
            getTrProps={(state, rowInfo) => {
              let style = {};
              if (rowInfo.index === state.resolvedData.length - 1) {
                style = {
                  background: 'green',
                  color: 'white',
                  fontWeight: 'bold',
                };
              }
              return {
                style,
              };
            }}
          />
        </React.Fragment>
      ),
    };
  }

  companyTable(company) {
    const { classes } = this.props;
    const tableData = this.summaryTableData(company, 'nonSeed');
    // checking if length is 1, because we add a summary row to all
    if (tableData.length < 2) return null;

    return {
      summaryRow: tableData[tableData.length - 1],
      table: (
        <React.Fragment key={`C${company.id}`}>
          <h4>{company.name}</h4>
          <ReactTable
            sortable={false}
            showPagination={false}
            minRows={1}
            columns={this.state.summmaryColumns}
            data={tableData}
            className={classes.summaryTable}
            getTrProps={(state, rowInfo) => {
              let style = {};
              if (rowInfo.index === state.resolvedData.length - 1) {
                style = {
                  background: 'green',
                  color: 'white',
                };
              }
              return {
                style,
              };
            }}
          />
        </React.Fragment>
      ),
    };
  }

  get getCompanyTables() {
    let grandTotal = 0;
    const { seedCompanies, companies } = this.props;

    const seedCompanyTables = seedCompanies.map((seedCompany) => {
      const seedCompanyTable = this.seedCompanyTable(seedCompany);
      if (seedCompanyTable) {
        const {
          table,
          summaryRow: { total_raw },
        } = seedCompanyTable;
        grandTotal += total_raw;
        return table;
      }
    });

    const companyTables = companies.map((company) => {
      const companyTable = this.companyTable(company);
      if (companyTable) {
        const {
          table,
          summaryRow: { total_raw },
        } = companyTable;
        grandTotal += total_raw;
        return table;
      }
    });
    return {
      seedCompanyTables,
      companyTables,
      grandTotal: numberToDollars(grandTotal),
    };
  }

  render() {
    const { seedCompanyTables, companyTables, grandTotal } = this.getCompanyTables;
    return (
      <div>
        <Paper className={this.props.classes.grandTotal}>
          <h5>
            <strong>Grand Total:</strong> {grandTotal}
          </h5>
        </Paper>
        {seedCompanyTables}
        {companyTables}
      </div>
    );
  }
}

CropSummaryTable.propTypes = {
  customerProducts: PropTypes.array.isRequired,
  customerCustomProducts: PropTypes.array.isRequired,
  purchaseOrder: PropTypes.object.isRequired,
  seedCompanies: PropTypes.array.isRequired,
  products: PropTypes.array.isRequired,
  customProducts: PropTypes.array.isRequired,
  dealerDiscounts: PropTypes.array.isRequired,
  companies: PropTypes.array.isRequired,
};

export default withStyles(styles)(CropSummaryTable);
