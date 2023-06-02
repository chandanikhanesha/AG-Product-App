import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import { Link } from 'react-router-dom';
import qs from 'qs';

// icons
import Print from '@material-ui/icons/Print';
import CircularProgress from '@material-ui/core/CircularProgress';

// core components
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import CardContent from '@material-ui/core/CardContent';
import Table from '../../components/material-dashboard/Table/Table';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';

import { createPDFTableLayout } from '../../utilities/pdf/tableGenerator';

import {
  listProducts,
  listReports,
  listDealerDiscounts,
  listPurchaseOrders,
  listCustomerProducts,
  listCustomerCustomProducts,
  listCustomerMonsantoProducts,
  createReport,
  deleteReport,
  updateReport,
  getPdfForPage,
  loadOrganization,
} from '../../store/actions';
import { isUnloadedOrLoading, customerProductDiscountsTotals, numberToDollars } from '../../utilities';
import { getProductFromOrder } from '../../utilities/product';

const styles = (theme) => ({
  title: {
    marginTop: 0,
    marginBottom: 40,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  actions: {
    marginRight: 0,
    marginLeft: 'auto',
    float: 'right',
  },
  pdfButton: {
    marginRight: 15,
  },
  reportContainer: {
    marginTop: 90,
  },
  formControl: {
    margin: theme.spacing.unit * 3,
  },
  totalsContainer: {
    display: 'flex',
    justifyContent: 'space-evenly',
    padding: 0,
    margin: 0,
    '& li': {
      listStyleType: 'none',
      padding: '12px 8px',
      flex: '1 1 auto',
    },
  },
  totatlsLabel: {
    display: 'block',
    textDecoration: 'underline',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  totalsValue: {
    display: 'block',
    fontWeight: 'bold',
  },
});

class Reports extends Component {
  state = {
    selectedDiscountIds: [],
    createdReports: [],
    report: {
      headers: [''],
      rows: [],
    },
    reportTotals: {},
  };

  componentDidMount() {
    const {
      listProducts,
      listCustomerProducts,
      listCustomerCustomProducts,
      listCustomerMonsantoProducts,
      listDealerDiscounts,
      listPurchaseOrders,
      loadOrganization,
      organizationId,
    } = this.props;

    listPurchaseOrders();

    Promise.all([
      listProducts(),
      listCustomerProducts(),
      listCustomerMonsantoProducts(),
      listCustomerCustomProducts(),
      listDealerDiscounts(),
      loadOrganization(organizationId),
      // this.props.listReports(),
    ]).then(() => {
      const {
        purchaseOrders,
        customers,
        location,
        dealerDiscountsStatus,
        purchaseOrdersStatus,
        customersStatus,
        customerProductsStatus,
      } = this.props;
      const query = qs.parse(location.search, { ignoreQueryPrefix: true });

      const headers = ['Name', 'Purchase Order'];
      const filteredCustomers = customers.filter((customer) => customer.isDeleted === false);

      const rows = purchaseOrders
        .filter((order) =>
          order.isQuote === false ? filteredCustomers.some((customer) => customer.id === order.customerId) : false,
        )
        .map((order) => {
          // Find the customer this purchase order belongs to for their name
          const customer = filteredCustomers.find((customer) => customer.id === order.customerId);

          return [
            <Link to={`/app/customers/${customer.id}`}>{customer.name}</Link>,
            <Link to={`/app/customers/${customer.id}/purchase_order/${order.id}`}>{order.name}</Link>,
          ];
        });
      const selectedDiscountIds =
        query && query.selectedDiscountIds ? query.selectedDiscountIds.map((id) => parseInt(id, 10)) : [];

      this.setState({ report: { headers, rows }, selectedDiscountIds }, () => {
        if (
          selectedDiscountIds.length > 0 &&
          [dealerDiscountsStatus, purchaseOrdersStatus, customersStatus, customerProductsStatus].some(
            isUnloadedOrLoading,
          )
        ) {
          console.log('loaded and ready to fire toggleColumn()');
          this.toggleColumn();
        }
      });
    });
  }

  /**
   * If currently selected remove from array otherwise add to array.
   * After updating state call this.toggleColumn()
   * @param {String} name Discount name
   * @param {Number} id Discount id
   *
   */
  handleChange = (name, id) => (event) => {
    const { selectedDiscountIds } = this.state;
    const selected = selectedDiscountIds.includes(id)
      ? selectedDiscountIds.filter((n) => n !== id)
      : [...selectedDiscountIds, id];

    this.setState({ selectedDiscountIds: selected }, () => {
      this.toggleColumn();
    });
  };

  /**
   * Toggle a discount table column depending on the state of the discount checkbox.
   * After updating state with the current column selection, call this.getReportTotals()
   *
   */
  toggleColumn = () => {
    const { dealerDiscounts } = this.props;
    const { selectedDiscountIds } = this.state;

    const discounts = dealerDiscounts.filter((discount) => selectedDiscountIds.includes(discount.id));

    this.generateDiscountsData(discounts);
  };

  /**
   * Returns an array of table rows (arrays)
   * @param {Array} currentDiscounts Array of currently selected discounts
   */
  generateDiscountsData = (currentDiscounts) => {
    const {
      purchaseOrders,
      customerProducts,
      customers,
      products,
      business,
      customerMonsantoProduct,
      monsantoProducts,
      companies,
      customerCustomProducts,
    } = this.props;
    const { report } = this.state;

    let currentDiscountHeaders = [];
    const currentDiscountIds = currentDiscounts.map((currDiscount) => currDiscount.id);
    const filteredCustomers = customers.filter((customer) => customer.isDeleted === false);

    const allCustomerProducts = [...customerProducts, ...customerMonsantoProduct, ...customerCustomProducts];
    const allProducts = [
      ...products,
      ...companies.map((item) => ({ ...item, companyId: item.id })),
      ...monsantoProducts.map((item) => ({ ...item, isMonsantoProduct: true })),
    ];

    const updatedRows = purchaseOrders
      .filter((order) =>
        order.isQuote === false ? filteredCustomers.some((customer) => customer.id === order.customerId) : false,
      )
      .map((order, idx) => {
        // Filter to only products that are contained in this purchase order
        const orderProducts = allCustomerProducts.filter((cProd) => cProd.purchaseOrderId === order.id);
        const orderDiscounts = orderProducts
          .filter((orderProduct) => {
            if (orderProduct.discounts === null || orderProduct.discounts.length === 0) return false;
            return orderProduct.discounts.some((orderProductDiscount) =>
              currentDiscountIds.includes(orderProductDiscount.DiscountId),
            );
          })
          .map((orderProduct, index) => {
            const product = getProductFromOrder(orderProduct, allProducts, business);
            return customerProductDiscountsTotals(
              orderProduct,
              currentDiscounts,
              product ? product : {},
              null,
              null,
              null,
              {
                CustomerProducts: allCustomerProducts
                  .filter((customerProduct) => customerProduct.purchaseOrderId === order.id)
                  .map((_customerProduct) => {
                    return {
                      ..._customerProduct,
                      Product: product,
                    };
                  }),
              },
            );
          })
          .filter((item) => item);
        // Each discount total
        const individualDiscountTotals = this.getDiscountsTotal(orderDiscounts, currentDiscounts);
        const discountTotal = individualDiscountTotals.slice(-1);
        const individualDiscounts = individualDiscountTotals.slice(0, -1);
        const discountsLength = individualDiscounts.length;
        const rowMeta = report.rows[idx] ? report.rows[idx].slice(0, 2) : [];

        return discountsLength > 0 ? [...rowMeta, ...individualDiscounts, ...discountTotal] : [...rowMeta];
      });
    // updating table headers based on the toggle state of the discount checkbox
    const currentDiscountNames = currentDiscounts.map((discount) => discount.name);
    if (currentDiscountNames.length > 0) {
      currentDiscountHeaders = [...currentDiscountNames, 'Total Discount'];
    }
    const headers = [...report.headers.slice(0, 2), ...currentDiscountHeaders];

    this.setState({ report: { headers, rows: updatedRows } }, () => {
      if (currentDiscountNames.length > 0) {
        this.getReportTotals([...currentDiscountNames, 'Total Discount']);
      } else {
        this.getReportTotals();
      }
    });
  };

  getDiscountsTotal(discountTotals, discounts) {
    let totalDiscount = 0;
    let dataRow = discounts
      .filter((discount) => {
        return discountTotals.map((total) => Object.keys(total.discounts).includes(discount.id.toString()));
      })
      .map((discount) => {
        let total = 0;
        discountTotals.forEach((discountTotal) => {
          Object.keys(discountTotal.discounts).forEach((discountId) => {
            if (discountId === discount.id.toString()) {
              total += discountTotal.discounts[discountId].amount;
            }
          });
        });
        totalDiscount += total;
        return numberToDollars(total);
      });

    dataRow.push(numberToDollars(totalDiscount));
    return dataRow;
  }

  getReportTotals = (discountNames = []) => {
    const { classes } = this.props;
    const { report } = this.state;

    const reportTotals = report.rows
      .map((row) => row.slice(2))
      .reduce((initial, current) => {
        current.forEach((value, idx) => {
          if (!initial[discountNames[idx]]) {
            initial[discountNames[idx]] = 0;
          }
          initial[discountNames[idx]] += parseFloat(value.replace(/[^0-9-.]/g, ''));
        });
        return initial;
      }, {});

    const reportTotalsRow = Object.keys(reportTotals).map((total, idx) => {
      return (
        <div key={`${total}-${idx}`}>
          {total === 'Total Discount' ? (
            <span className={classes.totatlsLabel}>{total}</span>
          ) : (
            <span className={classes.totatlsLabel}>{total} Total</span>
          )}
          <span className={classes.totatlsValue}>{numberToDollars(reportTotals[total])}</span>
        </div>
      );
    });

    const row = ['', '', ...reportTotalsRow];
    const rowsWithoutTotals = report.rows;
    const tableTotalsData = reportTotalsRow.length > 0 ? [...report.rows, row] : [...rowsWithoutTotals];

    this.setState({
      report: { rows: tableTotalsData, headers: report.headers },
    });
  };

  get isLoading() {
    const { dealerDiscountsStatus, purchaseOrdersStatus, customersStatus, customerProductsStatus, productsStatus } =
      this.props;

    return (
      this.state.generatingPDF ||
      [dealerDiscountsStatus, purchaseOrdersStatus, customersStatus, customerProductsStatus, productsStatus].some(
        isUnloadedOrLoading,
      )
    );
  }

  removeReport = (id) => (event) => {
    const { deleteReport } = this.props;
    const { createdReports } = this.state;
    const updatedCreatedReports = createdReports.filter((cr) => cr.id !== id);
    deleteReport(id).then(() => {
      this.setState((state, props) => ({
        createdReports: updatedCreatedReports,
      }));
    });
  };

  savePageAsPdf = () => {
    const { organization, userFirstName, userLastName } = this.props;
    const { report } = this.state;
    const headers = report.headers;
    const totalHeaders = {};
    const totalValues = {};
    const formattedRows = report.rows.map((row, idx, arr) => {
      if (idx === arr.length - 1) {
        return row.reduce((row, col, index) => {
          if (col === '') {
            row[headers[index]] = col;
          } else if (col.props.children[0].props.children === 'Total Discount') {
            totalHeaders[headers[index]] = col.props.children[0].props.children;
            totalValues[headers[index]] = col.props.children[1].props.children;
          } else {
            totalHeaders[headers[index]] = col.props.children[0].props.children.join('');
            totalValues[headers[index]] = col.props.children[1].props.children;
          }
          return row;
        }, {});
      }

      return row.reduce((row, col, index) => {
        if (headers[index] === 'Name' || headers[index] === 'Purchase Order') {
          row[headers[index]] = col.props.children;
          return row;
        }
        row[headers[index]] = col;
        return row;
      }, {});
    });

    const data = [...formattedRows, totalHeaders, totalValues];

    this.setState(
      {
        generatingPDF: true,
      },
      () => {
        createPDFTableLayout({
          tableData: data,
          dynamicColumns: report.headers,
          organization,
          userFirstName,
          userLastName,
          pdfType: 'Discount_Report',
        })
          .then(() => this.setState({ generatingPDF: false }))
          .catch((e) => {
            console.error(new Error(e));
            this.setState({ generatingPDF: false });
          });
      },
    );
  };

  print = () => {
    setTimeout(() => {
      window.print();
    }, 500);
  };

  render() {
    const { classes, dealerDiscounts } = this.props;
    const { selectedDiscountIds, report } = this.state;
    const reportDiscounts = selectedDiscountIds
      .map((selected) => dealerDiscounts.find((discount) => discount.id === selected).name)
      .join(', ');

    if (this.isLoading) {
      return <CircularProgress />;
    }

    /**
     * BUG
     * this.props.createReport API call returns 403. This conditional is commented out until that is resolved.
     */
    // if (reports.length < 1) {
    //   return (
    //     <Card>
    //       <CardHeader>
    //         <h4>Discount Report</h4>
    //         <p>Create a report to see discount totals</p>
    //       </CardHeader>
    //       <CardBody>
    //         <Button
    //           color="primary"
    //           onClick={() => this.props.createReport()} >
    //           Create report
    //       </Button>
    //       </CardBody>
    //     </Card>
    //   )
    // }
    return (
      <div>
        <h3 className={classes.title}>Discount Reporting</h3>
        <Card className="hide-print">
          <React.Fragment>
            <CardHeader>
              <h4>Create Report</h4>
            </CardHeader>
            <CardBody>
              {dealerDiscounts.length > 0 && (
                <FormControl component="fieldset" className={classes.formControl}>
                  <FormLabel component="legend">Select Discounts</FormLabel>
                  <FormGroup row={true}>
                    {dealerDiscounts.map((discount, idx) => {
                      return (
                        <FormControlLabel
                          key={`${discount.name}-${idx}`}
                          control={
                            <Checkbox
                              checked={selectedDiscountIds.includes(discount.id)}
                              onChange={this.handleChange(discount.name, discount.id)}
                              value={discount.name}
                            />
                          }
                          label={discount.name}
                        />
                      );
                    })}
                  </FormGroup>
                </FormControl>
              )}
            </CardBody>
          </React.Fragment>
        </Card>

        <div className={classes.actions}>
          <Button className={`${classes.pdfButton} hide-print`} color="info" onClick={this.savePageAsPdf}>
            Save as PDF
          </Button>
          <Button className="hide-print" onClick={this.print} color="info">
            <Print />
          </Button>
        </div>

        <div className={classes.reportContainer}>
          <Card>
            <CardHeader>
              <h4>Discount Report {reportDiscounts}</h4>
              {/* <Button justIcon round color="primary"
                onClick={this.removeReport(report.id)}
                className={`${classes.removeButton} hide-print`} >
                <Remove />
              </Button> */}
            </CardHeader>
            <CardContent>
              <Table
                striped={true}
                hover={true}
                tableHeaderColor="primary"
                tableHead={report.headers}
                tableData={report.rows}
                isCheckBox={false}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
  dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
  reports: state.reportReducer.reports,
  reportsStatus: state.reportReducer.loadingStatus,
  purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
  purchaseOrdersStatus: state.purchaseOrderReducer.loadingStatus,
  customers: state.customerReducer.customers,
  customersStatus: state.customerReducer.loadingStatus,
  customerProducts: state.customerProductReducer.customerProducts,
  customerProductsStatus: state.customerProductReducer.loadingStatus,
  customerMonsantoProduct: state.customerMonsantoProductReducer.customerMonsantoProducts,
  customerMonsantoProductStatus: state.customerMonsantoProductReducer.loadingStatus,
  products: state.productReducer.products,
  productsStatus: state.productReducer.loadingStatus,
  business: state.customProductReducer.products,
  organization: state.organizationReducer,
  organizationId: state.userReducer.organizationId,
  userFirstName: state.userReducer.firstName,
  userLastName: state.userReducer.lastName,
  monsantoProducts: state.monsantoProductReducer.monsantoProducts,
  companies: state.companyReducer.companies,
  customerCustomProducts: state.customerCustomProductReducer.customerCustomProducts,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listProducts,
      createReport,
      deleteReport,
      updateReport,
      getPdfForPage,
      listDealerDiscounts,
      listReports,
      listPurchaseOrders,
      listCustomerProducts,
      listCustomerMonsantoProducts,
      listCustomerCustomProducts,
      loadOrganization,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Reports));
