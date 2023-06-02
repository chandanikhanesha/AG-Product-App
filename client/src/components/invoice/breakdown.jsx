import React, { Component } from 'react';
import ReactTable from 'react-table';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { capitalize } from 'lodash/string';
import { isEmpty } from 'lodash/lang';

import { numberToDollars, customerProductDiscountsTotals } from '../../utilities';
import { getProductFromOrder, getProductName } from '../../utilities/product';
import { getAppliedDiscounts } from '../../utilities/purchase_order';

const styles = {
  breakdownTable: {
    border: '1px solid gray',
  },
  summaryCellTitle: {
    fontSize: '10px',
  },
  discount: {
    display: 'block',
  },
};

class InvoiceBreakdown extends Component {
  state = {
    companyColumns: [
      {
        Header: 'Product',
        accessor: 'product',
      },
      {
        Header: 'Type',
        accessor: 'type',
      },
      {
        Header: 'Description',
        accessor: 'description',
      },
      {
        Header: 'ID',
        accessor: 'id',
      },
      {
        Header: 'Unit',
        accessor: 'unit',
      },
      {
        Header: 'Discounts',
        accessor: 'discounts',
      },
      {
        Header: 'Net Price $',
        accessor: 'netPrice',
      },
      {
        Header: 'Total $',
        accessor: 'total',
        headerStyle: {
          textAlign: 'left',
        },
      },
    ],
  };

  seedCompanyColumns(seedType) {
    return [
      {
        Header: capitalize(seedType),
        accessor: 'product',
        width: 180,
      },
      {
        Header: 'Unit',
        accessor: 'unit',
        width: 60,
      },
      {
        Header: 'Seed Size',
        accessor: 'seedSize',
        width: 100,
      },
      {
        Header: 'Packaging',
        accessor: 'packaging',
        width: 90,
      },
      {
        Header: 'MSRP/Unit',
        accessor: 'msrp',
        width: 100,
      },
      {
        Header: 'Item total',
        accessor: 'itemTotal',
        width: 95,
      },
      {
        Header: 'Discounts',
        accessor: 'discounts',
        width: 110,
      },
      {
        Header: '',
        accessor: 'discountValues',
        width: 90,
      },
      {
        Header: 'Price after discount',
        accessor: 'netPrice',
        width: 95,
      },
      {
        Header: 'Total $',
        accessor: 'total',
        width: 95,
        headerStyle: {
          textAlign: 'left',
        },
      },
    ];
  }

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

  getPackaging(packagingGroup) {
    return this.props.packagings.find((p) => p.id === packagingGroup.packagingId);
  }

  getSeedSize(packagingGroup) {
    return this.props.seedSizes.find((ss) => ss.id === packagingGroup.seedSizeId);
  }

  seedCompanyTableData(seedCompany, seedType) {
    const { seedCompanies, productPackagings, purchaseOrder, classes } = this.props;
    let rows = [];
    let totalUnits = 0;
    let totalItemTotals = 0;
    let totalNetPrices = 0;
    let total = 0;

    if (isEmpty(this.groupedDiscountsData)) {
      return rows;
    }
    let discountsData = this.groupedDiscountsData[seedType].filter((d) => d.seedCompany.id === seedCompany.id);

    discountsData.forEach((data) => {
      let productPackaging = productPackagings
        .filter((pp) => pp.purchaseOrderId === purchaseOrder.id)
        .find((pp) => pp.productId === data.product.id);

      let shareholderPercentage;
      if (this.props.selectedShareholder) {
        shareholderPercentage = data.discountData.shareholderPercentage / 100;
      } else {
        shareholderPercentage = 1;
      }

      let seedSizeEl = null;
      let packagingEl = null;

      if (productPackaging) {
        seedSizeEl = (
          <div>
            {productPackaging.packagingGroups.map((packagingGroup, idx) => (
              <React.Fragment key={`SS${packagingGroup.seedSizeId}${idx}`}>
                <span>{this.getSeedSize(packagingGroup).name}</span>
                <br />
              </React.Fragment>
            ))}
          </div>
        );

        packagingEl = (
          <div>
            {productPackaging.packagingGroups.map((packagingGroup, idx) => (
              <React.Fragment key={`PKG${packagingGroup.packagingId}${idx}`}>
                <span>
                  {this.getPackaging(packagingGroup).name} -{this.getPackaging(packagingGroup).quantity}
                </span>
                <br />
              </React.Fragment>
            ))}
          </div>
        );
      }

      let discountsEl = (
        <div>
          {Object.keys(data.discountData.discounts).map((discountId) => (
            <span key={discountId} className={classes.discount}>
              {data.discountData.discounts[discountId].dealerDiscount.name}
            </span>
          ))}
        </div>
      );

      let discountsValueEl = (
        <div>
          {Object.keys(data.discountData.discounts).map((discountId) => (
            <span key={`${discountId}-value`} className={classes.discount}>
              {numberToDollars(data.discountData.discounts[discountId].amount)}
            </span>
          ))}
        </div>
      );
      let units = data.order.orderQty * shareholderPercentage;
      totalUnits += units;
      totalItemTotals += data.discountData.originalPrice;
      const netPrice = units === 0 ? units : (data.discountData.total / units).toFixed(2);

      totalNetPrices += parseFloat(netPrice);

      total += data.discountData.total;

      units > 0 &&
        rows.push({
          product: <div>{getProductName(data.product, seedCompanies)}</div>,
          unit: <div>{units}</div>,
          seedSize: seedSizeEl,
          packaging: packagingEl,
          msrp: numberToDollars(data.product.msrp || data.product.costUnit),
          itemTotal: numberToDollars(data.discountData.originalPrice),
          discounts: discountsEl,
          discountValues: discountsValueEl,
          netPrice: numberToDollars(netPrice),
          total: numberToDollars(data.discountData.total),
        });
    });

    const avgMsrp = totalItemTotals / totalUnits;
    const avgNetPrice = total / totalUnits;

    rows.push({
      unit: (
        <div>
          <span className={classes.summaryCellTitle}> Total Units </span>
          <br />
          <span> {totalUnits}</span>
        </div>
      ),
      msrp: (
        <div>
          <span className={classes.summaryCellTitle}> Avg unit MSRP </span>
          <br />
          <span>{isNaN(avgMsrp) ? '' : numberToDollars(avgMsrp)}</span>
        </div>
      ),
      itemTotal: (
        <div>
          <span className={classes.summaryCellTitle}> Total before discount </span>
          <br />
          <span>{isNaN(totalItemTotals) ? '' : numberToDollars(totalItemTotals)}</span>
        </div>
      ),
      netPrice: (
        <div>
          <span className={classes.summaryCellTitle}> Avg Unit price after discount </span>
          <br />
          <span>{isNaN(avgNetPrice) ? '' : numberToDollars(avgNetPrice)}</span>
        </div>
      ),
      total: (
        <div>
          <span className={classes.summaryCellTitle}> Total after discount </span>
          <br />
          <span>{isNaN(avgMsrp) ? '' : numberToDollars(total)}</span>
        </div>
      ),
    });
    return rows;
  }

  seedCompanyTable(seedCompany, seedType) {
    const tableData = this.seedCompanyTableData(seedCompany, seedType);
    if (tableData.length < 2) {
      return null;
    }
    return (
      <React.Fragment key={`${seedType}${seedCompany.id}`}>
        <ReactTable
          sortable={false}
          showPagination={false}
          minRows={1}
          columns={this.seedCompanyColumns(seedType)}
          data={tableData}
          className={`${this.props.classes.breakdownTable} no-white-space BreakDownTable`}
          getTrProps={(state, rowInfo) => {
            let style = {};
            if (rowInfo.index === state.resolvedData.length - 1) {
              style = {
                background: '#DDDDDD',
                fontWeight: 'bold',
              };
            }
            return { style };
          }}
        />
      </React.Fragment>
    );
  }

  companyTableData(company) {
    const { classes } = this.props;

    let rows = [];
    if (isEmpty(this.groupedDiscountsData)) return rows;
    let discountsData = this.groupedDiscountsData['BUSINESS'].filter((d) => d.company.id === company.id);

    discountsData.forEach((data) => {
      let discountsEl = (
        <div>
          {Object.keys(data.discountData.discounts).map((discountId) => (
            <div key={discountId}>
              <span className={classes.discountName}>
                {data.discountData.discounts[discountId].dealerDiscount.name}
              </span>
              <span>{numberToDollars(data.discountData.discounts[discountId].amount)}</span>
            </div>
          ))}
        </div>
      );

      let netPrice = 0;
      if (data.discountData.total && (data.product.msrp || data.product.costUnit)) {
        netPrice = (data.discountData.total / (data.product.msrp || data.product.costUnit)).toFixed(2);
      }
      if (data.product.unit) {
        rows.push({
          product: data.product.name,
          type: data.product.type,
          description: data.product.description,
          id: data.product.customId,
          unit: data.product.unit,
          discounts: discountsEl,
          netPrice: numberToDollars(netPrice),
          total: numberToDollars(data.discountData.total),
        });
      }
    });
    return rows;
  }

  companyTable(company) {
    let tableData = this.companyTableData(company);
    if (tableData.length === 0) {
      return null;
    }
    return (
      <React.Fragment key={`COMPANY${company.id}`}>
        <ReactTable
          sortable={false}
          showPagination={false}
          minRows={1}
          columns={this.state.companyColumns}
          data={tableData}
          className={`${this.props.classes.breakdownTable} no-white-space BreakDownTable`}
        />
      </React.Fragment>
    );
  }

  checkDataExist() {
    const { seedCompanies, companies } = this.props;
    let data = 0;
    seedCompanies.map((seedCompany) =>
      ['CORN', 'SOYBEAN', 'SORGHUM'].map((seedType) => {
        let tableData = this.seedCompanyTableData(seedCompany, seedType);
        if (tableData.length > 1) {
          data++;
        }
      }),
    );
    companies.map((company) => {
      let tableData = this.companyTableData(company);
      console.log('Companies table data ' + tableData.length);
      if (tableData.length > 0) {
        data++;
      }
    });
    return data > 0 ? true : false;
  }

  render() {
    const { seedCompanies, companies } = this.props;
    return (
      <div>
        {this.checkDataExist() && <h4>Breakdown</h4>}
        {seedCompanies.map((seedCompany) => (
          <div key={seedCompany.id}>
            {['CORN', 'SOYBEAN', 'SORGHUM'].map((seedType) => this.seedCompanyTable(seedCompany, seedType))}
          </div>
        ))}

        {companies.map((company) => this.companyTable(company))}
      </div>
    );
  }
}

InvoiceBreakdown.propTypes = {
  customerProducts: PropTypes.array.isRequired,
  customerCustomProducts: PropTypes.array.isRequired,
  purchaseOrder: PropTypes.object.isRequired,
  seedCompanies: PropTypes.array.isRequired,
  products: PropTypes.array.isRequired,
  customProducts: PropTypes.array.isRequired,
  dealerDiscounts: PropTypes.array.isRequired,
  companies: PropTypes.array.isRequired,
  productPackagings: PropTypes.array.isRequired,
  seedSizes: PropTypes.array.isRequired,
  packagings: PropTypes.array.isRequired,
};

export default withStyles(styles)(InvoiceBreakdown);
