import React, { Component } from 'react';
import ReactTable from 'react-table';
import { capitalize } from 'lodash/string';
import { isEmpty } from 'lodash/lang';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { sortBy } from 'lodash';
import CheckBox from '@material-ui/core/Checkbox';

import { numberToDollars, customerProductDiscountsTotals } from '../../../utilities';
import { getProductFromOrder } from '../../../utilities/product';
import { getAppliedDiscounts } from '../../../utilities/purchase_order';
import Paper from '@material-ui/core/Paper';

import { cropSummaryTableStyles } from './crop_summary_table.styles';

// const MONSANTO_SEED_TYPES = ["CORN", "SOYBEAN", "SORGHUM"];
// const SEED_TYPES_CODES = ["C", "B", "S"];
const classificationSeedTypeMap = {
  B: 'SOYBEAN',
  C: 'CORN',
  S: 'SORGHUM',
  // A: 'ALFALFA',
  L: 'CANOLA',
  P: 'PACKAGING',
};

const safeDecimalPrecisionString = (val) => {
  let fixed = val.toFixed(2);
  if (fixed.endsWith('.00')) fixed = fixed.split('.')[0];
  return fixed;
};

class CropSummaryTable extends Component {
  getSummmaryColumns() {
    const { selectedFontSize } = this.props;
    return [
      // {
      //   Header: 'Crop',
      //   accessor: 'crop'
      // },
      {
        Header: 'Units',
        accessor: 'numberOfUnits',
        headerStyle: { fontSize: selectedFontSize, fontWeight: 'bold' },
        width: 60,
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
      },
      {
        Header: 'Pre-Total',
        accessor: 'itemTotal',
        headerStyle: { fontSize: selectedFontSize, fontWeight: 'bold' },
        width: 140,
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
      },
      {
        Header: <span>Discount Name</span>,
        accessor: 'discountSummary',

        headerStyle: { fontSize: selectedFontSize, fontWeight: 'bold' },
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
      },
      {
        Header: '',
        accessor: 'discountValue',
        headerStyle: { fontSize: selectedFontSize, fontWeight: 'bold' },
        width: 80,
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
      },
      {
        Header: <span>Discount Amount</span>,
        accessor: 'discountAmount',
        headerStyle: { fontSize: selectedFontSize, fontWeight: 'bold' },
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
      },
      {
        Header: 'After Discount',
        accessor: 'total',
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
        headerStyle: { textAlign: 'left', fontSize: selectedFontSize, fontWeight: 'bold' },
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
          company = product && companies.find((c) => c.id === product.companyId);
        } else {
          seedCompany = product && seedCompanies.find((sc) => sc.id === product.seedCompanyId);
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
    let allShareHolder = [];

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
          const productName = customProducts.find((p) => p.id === data.order.customProductId).type;
          customProductNames.push(productName);
        }
        const shareHolder =
          this.props.selectedShareholder &&
          data.order.shareholderData &&
          data.order.shareholderData.find((s) => s.shareholderId == this.props.selectedShareholder.id);
        allShareHolder.push(shareHolder);

        shareHolder;
        if (this.props.selectedShareholder) {
          shareholderPercentage = data.discountData.shareholderPercentage;
        } else {
          shareholderPercentage = 0;
        }
        numberOfUnits += parseFloat(data.order.orderQty - shareholderPercentage);
        numberOfUnitsValue = numberOfUnits;
        Object.keys(data.discountData.discounts).forEach((discountId) => {
          if (!groupedByDiscountId[discountId]) groupedByDiscountId[discountId] = [];
          groupedByDiscountId[discountId].push(data.discountData.discounts[discountId]);
        });
      });

      totalNumberOfUnits += numberOfUnits;
      numberOfUnits = <div> {safeDecimalPrecisionString(numberOfUnits)} </div>;

      let itemTotal = discountsData.reduce((acc, data) => acc + data.discountData.originalPrice, 0);
      totalItemTotal += itemTotal;
      itemTotal = <div> {numberToDollars(itemTotal)} </div>;

      let discountSummary = (
        <div>
          {Object.keys(groupedByDiscountId).length > 0
            ? Object.keys(groupedByDiscountId).map((dealerDiscountId) => (
                <div key={dealerDiscountId}>{groupedByDiscountId[dealerDiscountId][0].dealerDiscount.name}</div>
              ))
            : '-'}
        </div>
      );

      let discountValue = (
        <div>
          {Object.keys(groupedByDiscountId).length > 0
            ? Object.keys(groupedByDiscountId).map((dealerDiscountId) => (
                <div key={dealerDiscountId}>{groupedByDiscountId[dealerDiscountId][0].value}</div>
              ))
            : '-'}
        </div>
      );

      let discountAmount = (
        <div>
          {Object.keys(groupedByDiscountId).length > 0
            ? Object.keys(groupedByDiscountId).map((dealerDiscountId) => (
                <div key={dealerDiscountId}>
                  {numberToDollars(
                    groupedByDiscountId[dealerDiscountId].reduce((acc, discountData) => {
                      totalDiscountAmounts += discountData.amount;
                      return acc + discountData.amount;
                    }, 0),
                  )}
                </div>
              ))
            : '-'}
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

    // totalDiscountAmounts !== 0 &&
    rows.push({
      crop: 'SUMMARY',
      numberOfUnits: safeDecimalPrecisionString(totalNumberOfUnits),
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

    // const { summmaryColumns } = this.state;
    const summmaryColumns = this.getSummmaryColumns();
    const { selectedFontSize } = this.props;
    const columns = [
      {
        Header: 'Crop',
        accessor: 'crop',
        headerStyle: { fontSize: selectedFontSize, fontWeight: 'bold' },
        width: 150,
      },
      ...summmaryColumns,
    ];
    const customProps = { id: 'summaryCrop-seed' };

    return {
      summaryRow: tableData[tableData.length - 1],
      table: (
        <div
          className="invoice-table-wrapper summaryCrop"
          key={`SC${seedCompany.id}`}
          id="summaryCrop-seed/border"
          style={{ fontSize: this.props.selectedFontSize, padding: '8px', borderBottom: '2px solid #80808096' }}
        >
          <h4 style={{ color: '#008000' }} id="summaryCrop-seed/text">
            {seedCompany.name}
          </h4>
          <ReactTable
            sortable={true}
            getProps={() => customProps}
            showPagination={false}
            resizable={false}
            minRows={1}
            columns={columns}
            // data={sortBy(tableData, (o) => o.crop)}
            data={tableData}
            className={`${this.props.classes.summaryTable} no-white-space`}
            getTheadTrProps={() => {
              return {
                style: {
                  color: 'black',
                  // color: '#3C4858',
                  // background: '#CDDFC8',
                  fontWeight: 'bold',
                },
              };
            }}
            getTrProps={(state, rowInfo) => {
              let style = { fontSize: selectedFontSize };
              if (rowInfo.index === state.resolvedData.length - 1) {
                style = {
                  ...style, // background: 'green',
                  color: 'black',
                  fontWeight: 'bold',
                  borderTop: '1px solid #00000024',
                  height: '50px',
                };
              }
              return {
                style,
              };
            }}
          />
        </div>
      ),
    };
  }

  companyTable(company) {
    const { classes } = this.props;
    const tableData = this.summaryTableData(company, 'nonSeed');
    // checking if length is 1, because we add a summary row to all

    if (tableData.length < 2) return null;
    // const { summmaryColumns } = this.state;
    const summmaryColumns = this.getSummmaryColumns();
    const { selectedFontSize } = this.props;
    const columns = [
      {
        Header: 'Type',
        accessor: 'crop',
        headerStyle: { fontSize: selectedFontSize, fontWeight: 'bold' },
        width: 150,
      },
      ...summmaryColumns,
    ];
    const customProps = { id: 'summaryCrop-company' };
    return {
      summaryRow: tableData[tableData.length - 1],
      table: (
        <div
          className="invoice-table-wrapper summaryCrop"
          key={`C${company.id}`}
          id="summaryCrop-company/border"
          style={{ padding: '8px', fontSize: this.props.selectedFontSize, borderBottom: '2px solid #80808096' }}
        >
          <h4 style={{ color: '#008000' }} id="summaryCrop-company/text">
            {company.name}
          </h4>
          <ReactTable
            sortable={true}
            getProps={() => customProps}
            showPagination={false}
            resizable={false}
            minRows={1}
            columns={columns}
            // data={sortBy(tableData, (o) => o.crop)}
            data={tableData}
            className={`${classes.summaryTable} no-white-space`}
            getTheadTrProps={() => {
              return {
                style: {
                  color: 'black',
                  // color: '#3C4858',
                  // background: '#CDDFC8',
                  fontWeight: 'bold',
                },
              };
            }}
            getTrProps={(state, rowInfo) => {
              let style = { fontSize: selectedFontSize };
              if (rowInfo.index === state.resolvedData.length - 1) {
                style = {
                  ...style,
                  // background: 'green',
                  color: 'black',
                  fontWeight: 'bold',
                  borderTop: '1px solid #00000024',
                  height: '50px',
                };
              }
              return {
                style,
              };
            }}
          />
        </div>
      ),
    };
  }

  apiSummaryTableData(apiSeedCompany) {
    const {
      purchaseOrder: { CustomerMonsantoProducts },
    } = this.props;
    let dataByType = { C: [], B: [], S: [], A: [], L: [], P: [] };
    let rows = [];
    let companyTotal = 0;
    let totalNumberOfUnits = 0;
    let totalItemTotal = 0;
    let totalDiscountAmounts = 0;
    CustomerMonsantoProducts &&
      CustomerMonsantoProducts.filter((cp) => cp && !cp.isDeleted).forEach((product) => {
        const shareHolder =
          this.props.selectedShareholder &&
          product.shareholderData &&
          product.shareholderData.find((s) => s.shareholderId == this.props.selectedShareholder.id);
        let shareholderPercentage = shareHolder && shareHolder.hasOwnProperty('percentage') ? 1 : 0;

        if (this.props.selectedShareholder) {
          if (product.shareholderData) {
            const shareHolder = product.shareholderData.find(
              (s) => s.shareholderId == this.props.selectedShareholder.id,
            );
            if (shareHolder) {
              shareholderPercentage = shareHolder.hasOwnProperty('percentage')
                ? parseFloat(shareHolder.percentage) / 100
                : parseFloat(shareHolder.percentage);
            } else {
              shareholderPercentage = 0;
            }
          }
        }

        if (
          product.MonsantoProduct &&
          product.MonsantoProduct.seedCompanyId &&
          product.MonsantoProduct.seedCompanyId === apiSeedCompany.id
        ) {
          const { id, orderQty, MonsantoProduct, price, msrpEdited } = product;
          const { classification } = MonsantoProduct;
          const discountsPOJO = product.discounts
            .map((discount) => {
              return this.props.dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
            })
            .filter((el) => el);
          const { discounts, discountAmount } = customerProductDiscountsTotals(
            product,
            discountsPOJO,
            MonsantoProduct,
            null,
            null,
            this.props.selectedShareholder,
            this.props.purchaseOrder,
          );

          classification &&
            shareHolder !== undefined &&
            dataByType[classification].push({
              id,
              orderQty:
                shareHolder && shareHolder.hasOwnProperty('percentage')
                  ? orderQty * shareholderPercentage
                  : orderQty - shareholderPercentage,
              price: msrpEdited ? msrpEdited : price,
              productDiscount: product.discounts,
              discounts,
              discountAmount,
            });
        }
      });

    Object.keys(dataByType).forEach((seedTYpe) => {
      const data = dataByType[seedTYpe];
      let typeTotalQuantity = 0;
      let typeTotalAmount = 0;
      let discountAmountAll = 0;
      let finalTotal = 0;
      let DiscountsNameList = [],
        DiscountsSubtotalList = [],
        DiscountValues = [];
      let discountArrayBefore = [];
      data.forEach((_product) => {
        typeTotalQuantity += parseFloat(_product.orderQty, 10);
        typeTotalAmount += parseFloat(_product.price, 10) * parseFloat(_product.orderQty, 10);
        discountAmountAll += parseFloat(_product.discountAmount);
        let ordered = _product.productDiscount
          .sort((a, b) => a.order - b.order)
          .map((discount) => _product.discounts[discount.DiscountId])
          .filter((x) => x);
        ordered.map((discount) => {
          discountArrayBefore.push({
            name: discount.dealerDiscount.name,
            value: discount.value,
            subTotal: discount.amount,
          });
          DiscountsNameList.push(discount.dealerDiscount.name);
          DiscountsSubtotalList.push(numberToDollars(discount.amount));
          DiscountValues.push(discount.value);
        });
      });
      const helper = {};
      const discountArray = [];
      discountArrayBefore.reduce(function (r, o) {
        const key = o.name + '-' + o.value;
        if (!helper[key]) {
          helper[key] = Object.assign({}, o); // create a copy of o
          helper[key].ids = o.id;
          discountArray.push(helper[key]);
        } else {
          helper[key].subTotal = parseInt(helper[key].subTotal) + parseInt(o.subTotal);
        }

        return r;
      }, {});
      totalNumberOfUnits += typeTotalQuantity;
      totalItemTotal += typeTotalAmount;
      totalDiscountAmounts += discountAmountAll;
      finalTotal = parseFloat(typeTotalAmount) - parseFloat(discountAmountAll);
      companyTotal += parseFloat(finalTotal);
      const AllDiscountsValueList = () => {
        return (
          <div className={this.props.classes.discountList}>
            {discountArray.map(({ value }) => (
              <div className={value} key={value}>
                {value}
              </div>
            ))}
          </div>
        );
      };

      const AllDiscountsNameList = () => {
        return (
          <div className={this.props.classes.discountList}>
            {discountArray.map(({ name }) => (
              <div className={name} key={name}>
                {name}
              </div>
            ))}
          </div>
        );
      };
      const AllDiscountsSubtotalList = () => {
        return (
          <div className={this.props.classes.discountList}>
            {discountArray.map(({ subTotal }) => (
              <div className={subTotal} key={subTotal}>
                {numberToDollars(subTotal)}
              </div>
            ))}
          </div>
        );
      };
      typeTotalQuantity > 0 &&
        rows.push({
          numberOfUnits: typeTotalQuantity,
          crop: classificationSeedTypeMap[seedTYpe],
          itemTotal: numberToDollars(typeTotalAmount),
          discountSummary: <AllDiscountsNameList />,
          discountValue: <AllDiscountsValueList />,
          discountAmount: <AllDiscountsSubtotalList />,
          total: numberToDollars(finalTotal),
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

  apiSeedCompanyTable(apiSeedCompany) {
    const tableData = this.apiSummaryTableData(apiSeedCompany);
    if (tableData.length < 2) return null;
    // const { summmaryColumns } = this.state;
    const summmaryColumns = this.getSummmaryColumns();
    const { selectedFontSize } = this.props;
    const columns = [
      {
        Header: 'Crop',
        accessor: 'crop',
        headerStyle: { fontSize: selectedFontSize, fontWeight: 'bold' },
        width: 150,
      },
      ...summmaryColumns,
    ];
    const customProps = { id: 'summaryCrop-bayer' };
    return {
      summaryRow: tableData[tableData.length - 1],
      table: (
        <div
          className="invoice-table-wrapper summaryCrop"
          key={`SC${apiSeedCompany.id}`}
          id="summaryCrop-bayer/border"
          style={{ fontSize: this.props.selectedFontSize, padding: '8px', borderBottom: '2px solid #80808096' }}
        >
          <h4 style={{ color: '#008000' }} id="summaryCrop-bayer/text">
            {apiSeedCompany.name}
          </h4>

          <ReactTable
            sortable={true}
            showPagination={false}
            minRows={1}
            resizable={false}
            columns={columns}
            data={sortBy(tableData, (o) => o.crop)}
            className={`${this.props.classes.summaryTable} no-white-space`}
            getTheadTrProps={() => {
              return {
                style: {
                  color: 'black',
                  // color: '#3C4858',
                  // background: '#CDDFC8',
                  fontWeight: 'bold',
                },
              };
            }}
            getProps={() => customProps}
            getTrProps={(state, rowInfo) => {
              let style = { fontSize: selectedFontSize };
              if (rowInfo.index === state.resolvedData.length - 1) {
                style = {
                  ...style,
                  // background: 'green',
                  color: 'black',
                  fontWeight: 'bold',
                  borderTop: '1px solid #00000024',
                  height: '50px',
                };
              }
              return {
                style,
              };
            }}
          />
        </div>
      ),
    };
  }

  getPaymentsTotal() {
    const { payments, selectedShareholder, purchaseOrder } = this.props;
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
        let amount = 0;
        if (!(payment.method === 'Return')) {
          //if (payment.method === 'Cash' || payment.method === 'Check') {
          amount = payment.amount;
        } else {
          amount = -1 * parseFloat(payment.amount);
        }
        total += parseFloat(amount);
      });
    return total;
  }

  get getCompanyTables() {
    let grandTotal = 0;
    const { seedCompanies = [], companies = [], apiSeedCompanies = [], orderWholeDiscountsAmount = 0 } = this.props;
    const apiSeedCompanyTables =
      apiSeedCompanies &&
      apiSeedCompanies.map((apiSeedCompany) => {
        const apiSeedCompanyTable = this.apiSeedCompanyTable(apiSeedCompany);
        if (apiSeedCompanyTable) {
          const {
            table,
            summaryRow: { total_raw },
          } = apiSeedCompanyTable;
          grandTotal += total_raw;
          return table;
        }
        return null;
      });
    const seedCompanyTables =
      seedCompanies &&
      seedCompanies.map((seedCompany) => {
        const seedCompanyTable = this.seedCompanyTable(seedCompany);
        if (seedCompanyTable) {
          const {
            table,
            summaryRow: { total_raw },
          } = seedCompanyTable;
          grandTotal += total_raw;
          return table;
        }
        return null;
      });

    const companyTables =
      companies &&
      companies.map((company) => {
        const companyTable = this.companyTable(company);
        if (companyTable) {
          const {
            table,
            summaryRow: { total_raw },
          } = companyTable;
          grandTotal += total_raw;
          return table;
        }
        return null;
      });

    if (this.props.updateGrandTotal)
      this.props.updateGrandTotal(numberToDollars(grandTotal - orderWholeDiscountsAmount));
    return {
      apiSeedCompanyTables,
      seedCompanyTables,
      companyTables,
      grandTotal,
    };
  }

  render() {
    const { apiSeedCompanyTables, seedCompanyTables, companyTables, grandTotal } = this.getCompanyTables;
    const paymentTotal = this.getPaymentsTotal();
    const balanceDue = numberToDollars(grandTotal - paymentTotal);
    const showBalanceDue = balanceDue !== '$-0.00' && balanceDue !== '$0.00';

    const isHide = document.getElementById('summary-checkBox')
      ? document.getElementById('summary-checkBox').checked
      : true;

    return (
      <div
        className={
          !isHide ? `${this.props.classes.orderSummaryContainer} hide-print` : this.props.classes.orderSummaryContainer
        }
        id="summary-border"
      >
        {!this.props.invoicePreview && (
          <Paper className={this.props.classes.grandTotal}>
            <h5>
              <strong>Grand Total:</strong> {numberToDollars(grandTotal)}
            </h5>
            {showBalanceDue && (
              <h5>
                <strong>Balance Due:</strong> {balanceDue}
              </h5>
            )}
          </Paper>
        )}
        <div className={'invoice-table-wrapper'}>
          <div
            className="invoice-table-wrapper"
            style={{
              borderBottom: '1px solid black',
              background: '#9e9e9e8f',
              height: '50px',
            }}
          >
            <div style={{ padding: '8px', width: '100%', height: '50px' }} className="ReactTable" id="summary-check">
              <span className={this.props.classes.orderSummary}>Order Summary</span>
            </div>
          </div>

          <div id="summary-Section" className={this.props.classes.summarySection}>
            {apiSeedCompanyTables}

            {seedCompanyTables}
            {companyTables}
          </div>
        </div>
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

export default withStyles(cropSummaryTableStyles)(CropSummaryTable);
