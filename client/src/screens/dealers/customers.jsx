import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { Link } from 'react-router-dom';
import SweetAlert from 'react-bootstrap-sweetalert';
import { createCustomersFromCSV } from '../../utilities/csv';

// material-ui icons
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
//import SearchIcon from "@material-ui/icons/Search";
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';
// import Print from "@material-ui/icons/Print"

// material-ui components
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import FormControl from '@material-ui/core/FormControl';
// import IconButton from "@material-ui/core/IconButton";
// import TextField from "@material-ui/core/TextField";
// import LinearProgress from "@material-ui/core/LinearProgress";

// core components
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Card from '../../components/material-dashboard/Card/Card';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import ReactTable from 'react-table';
import WarningIcon from '@material-ui/icons/Warning';

import {
  isPending,
  isUnloadedOrLoading,
  numberToDollars,
  customerProductDiscountsTotals,
  perWholeOrderDiscount,
} from '../../utilities';
// import { getProductFromOrder } from '../../utilities/product'
import { getOrderTotals } from '../../utilities/purchase_order';

import CreateCustomer from './create_customer';
import ViewCustomer from './view_customer';
import NewQuote from './new_quote';
import NewPurchaseOrder from './new_purchase_order';
import CreateCustomerFromQTPO from './create_from_qt_po';
import ViewArchivedDialog from './view_archived_dialog';
import CreatePurchaseOrderDialog from '../purchase_order/create_dialog';
import ShowMoreStatementsDialog from './show_more_statements_dialog';
import ViewCustomerPOArchiveDialog from './view_customer_po_archive_dialog';
import ViewPaymentsDialog from './view_payment_dialog';

import { downloadCustomers, changeImported } from '../../store/actions/customer';
import { customersStyles } from './customers.styles';
import { getStore } from '../../store/configureStore';

class CustomersList extends Component {
  state = {
    activeTab: 0,
    addNewMenuOpen: false,
    showCreateCustomerDialog: false,
    showCreateCustomerFromQTPODialog: false,
    showCreatePurchaseOrderDialog: true,
    showViewCustomerDialog: false,
    showAddQuoteDialog: false,
    showAddPurchaseOrderDialog: false,
    showViewArchivedDialog: false,
    showMoreStatementsDialog: null,
    showCustomerArchivePODialog: false,
    showViewPaymentDialog: null,
    showAddPaymentDialog: null,
    customerArchiveDialogIsQuote: false,
    viewCustomer: null,

    moreFuncMenuOpen: false,

    deleteProductConfirm: null,
    // Table Related
    customerTableColumns: [],
    tableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,
    activeTableItem: null,
    creatingPurchaseOrderCustomerId: null,
    creatingPurchaseOrderIsQuote: false,

    createCustomerDialogStyle: '',
    customerID: null,

    searchText: '',
    customerList: [],
    showNotSyncedPO: false,
  };

  get isLoading() {
    const {
      customersLoadingStatus,
      dealerDiscountsStatus,
      customerCustomProductsStatus,
      customerProductsStatus,
      productsStatus,
      customProductsStatus,
      isOnline,
    } = this.props;
    // return false
    return (
      isOnline &&
      [
        dealerDiscountsStatus,
        productsStatus,
        customProductsStatus,

        // customerCustomProductsStatus,
        // customerProductsStatus,
        // customersLoadingStatus,
      ].some(isUnloadedOrLoading)
    );
  }

  componentDidMount = () => {
    const fecthData = async () => {
      await this.props.listPayments(true);
      await this.props.listDealerDiscounts(true);
      await this.props.listProducts(true);

      // await this.props.listAllCustomProducts(true);
      //  await this.props.listCustomerProducts(true);

      await this.props.listCustomerCustomProducts(true);

      await this.props.listCustomers(true);

      // await this.props.listSeedCompanies(true);
      this.setCustomerTableColumn();
      this.csvFileInput = React.createRef();
    };
    fecthData();
  };

  reload = async () => {
    await this.props.listCustomers(true);
    await this.props.listPayments(true);
    this.setCustomerTableColumn();
  };

  searchCustomer = () => {
    this.props.searchCustomers(this.state.searchText);
  };

  setCustomerTableColumn() {
    const customerTableColumns = [
      {
        Header: 'Customer',
        show: true,
        id: 'customer',
        accessor: (d) => d,
        Cell: (props) => {
          const { classes } = this.props;
          const customer = props.value;
          return (
            <div style={{ cursor: 'none' }}>
              {/* <Tooltip title="View Custom Details"> */}
              <p
                // onClick={() => {
                //   this.handleViewCustomerDialogOpen();
                //   this.setState({ viewCustomer: customer });
                // }}
                className={classes.linkQT}
              >
                {customer.name}
              </p>
              {/* </Tooltip> */}
            </div>
          );
        },
      },
      {
        Header: 'Quotes',
        show: true,
        id: 'quote',
        accessor: (d) => d,
        Cell: (props) => {
          const { classes } = this.props;
          const customer = props.value;

          if (!customer) {
            return null;
          }
          const quotes = customer.PurchaseOrders
            ? customer.PurchaseOrders.filter((po) => po.isQuote && !po.isArchive)
            : null;
          const needsQuote = quotes ? quotes.length : 0;
          return (
            <div>
              {needsQuote === 0 ? (
                <Tooltip title="Create a new order">
                  <Button
                    simple={true}
                    color="primary"
                    className={`${classes.createQT} hide-print`}
                    onClick={this.handleCreatePurchaseOrderDialogOpen(customer.id, true)}
                    disabled={isPending(customer)}
                  >
                    Create Quote
                  </Button>
                </Tooltip>
              ) : (
                this.getQuoteLinks(customer.id, quotes)
              )}
            </div>
          );
        },
      },
      {
        Header: 'Purchase Orders',
        show: true,
        id: 'purchase_orders',
        accessor: (d) => d,
        Cell: (props) => {
          const { classes } = this.props;
          const customer = props.value;
          const purchaseOrders = customer.PurchaseOrders
            ? customer.PurchaseOrders.filter((po) => !po.isQuote && !po.isArchive)
            : null;
          const needsPurchaseOrder = purchaseOrders ? purchaseOrders.length : 0;
          return (
            <div>
              {needsPurchaseOrder === 0 ? (
                <Tooltip title="Create a new purchase order">
                  <Button
                    simple={true}
                    color="primary"
                    className={`${classes.createPO} hide-print`}
                    onClick={this.handleCreatePurchaseOrderDialogOpen(customer.id, false)}
                    disabled={isPending(customer)}
                  >
                    New Purchase Order
                  </Button>
                </Tooltip>
              ) : (
                this.getPurchaseOrderLinks(customer.id, purchaseOrders)
              )}
            </div>
          );
        },
      },
      // {
      //   Header: "Invoices & Payments",
      //   show: true,
      //   id: "invoices_payments",
      //   accessor: d => d,
      //   Cell: props => {
      //     const customer = props.value;
      //     const purchaseOrders = customer.PurchaseOrders
      //       ? customer.PurchaseOrders.filter(po => !po.isQuote)
      //       : null;
      //     if (purchaseOrders === null || purchaseOrders.length === 0) {
      //       return <div>N/A</div>;
      //     }
      //     const total = customer.customerTotalPayment;
      //     if (total === 0) {
      //       return (
      //         <div>
      //           IN#{purchaseOrders[0].id}
      //           <br />
      //           <p>$0/$0</p>
      //         </div>
      //       );
      //     }
      //     const paid = customer.customerTotalPaid;
      //     return (
      //       <div>
      //         IN#{purchaseOrders[0].id}
      //         <br />
      //         <LinearProgress
      //           className={this.props.classes.tableItemLinearProgress}
      //           variant="determinate"
      //           value={(paid / total) * 100}
      //         />
      //         <p>
      //           ${paid}/${total}
      //         </p>
      //       </div>
      //     );
      //   }
      // },
      // {
      //   Header: "Deliveries",
      //   show: true,
      //   id: "deliveries",
      //   accessor: d => d,
      //   Cell: props => {
      //     const customer = props.value;
      //     //const { deliveryReceipts } = this.props
      //     const purchaseOrders = customer.PurchaseOrders
      //       ? customer.PurchaseOrders.filter(po => !po.isQuote)
      //       : null;
      //     if (purchaseOrders === null || purchaseOrders.length === 0) {
      //       return <div>N/A</div>;
      //     }
      //     const purchaseOrder = purchaseOrders[0];
      //     const delivered = customer.customerTotalDelivered;
      //     const totalDeliveries = customer.customerTotalDelivery;
      //     return (
      //       <div>
      //         {delivered}/{totalDeliveries}
      //         <br />
      //         {totalDeliveries !== 0 && (
      //           <LinearProgress
      //             className={this.props.classes.tableItemLinearProgress}
      //             variant="determinate"
      //             value={(delivered / totalDeliveries) * 100}
      //           />
      //         )}
      //         <p>DL#{purchaseOrder.id}</p>
      //       </div>
      //     );
      //   }
      // },
      // {
      //   Header: "Statements",
      //   show: true,
      //   id: "statements",
      //   accessor: (d) => d,
      //   Cell: (props) => {
      //     const customer = props.value;
      //     let statements = customer.Statements;
      //     //console.log(statements)
      //     if (!statements || statements.length === 0) {
      //       return <div>N/A</div>;
      //     }
      //     statements.sort((a, b) => b.id - a.id);
      //     const statement = statements[0];
      //     return (
      //       <div>
      //         <Link
      //           key={statement.id}
      //           to={`/app/dealers/${customer.id}/statement/${statement.id}`}
      //           className={this.props.classes.linkQT}
      //         >
      //           #{statement.statementNo}
      //         </Link>
      //         <br />
      //         {statements.length > 1 && (
      //           <Tooltip title="View previous statements">
      //             <Button
      //               simple={true}
      //               color="primary"
      //               className={this.props.classes.createPO}
      //               onClick={() => {
      //                 this.handleShowMoreStatementsDialogOpen(
      //                   customer,
      //                   statements.filter((s) => s.id !== statement.id)
      //                 );
      //               }}
      //             >
      //               Previous
      //             </Button>
      //           </Tooltip>
      //         )}
      //       </div>
      //     );
      //   },
      // },
      {
        Header: 'Balance Due',
        headerStyle: { textAlign: 'left' },
        show: true,
        id: 'payments',
        accessor: (d) => d,
        Cell: (props) => {
          const { classes, payments } = this.props;
          const customer = props.value;
          const { amount, purchaseOrderAmount } = this.getPaymentTotal(customer);
          return (
            <Button
              simple={true}
              color="primary"
              className={`${classes.createQT} hide-print`}
              style={{ color: '#2F2E2E', fontSize: '.875rem', fontWeight: 300 }}
              data-test-id="balanceDue"
              onClick={() => this.handleViewPaymentsDialogOpen(customer, payments, purchaseOrderAmount)}
            >
              {amount}
            </Button>
          );
        },
      },
      // {
      //   Header: "",
      //   show: true,
      //   id: "actions",
      //   accessor: d => d,
      //   maxWidth: 60,
      //   sortable: false,
      //   Cell: props => (
      //     <React.Fragment>
      //       <IconButton
      //         className="hide-print"
      //         aria-label="delete"
      //         onClick={this.handleTableItemActionMenuOpen(props.value)}
      //       >
      //         <MoreHorizontalIcon fontSize="small" />
      //       </IconButton>
      //     </React.Fragment>
      //   )
      // }
    ];
    this.setState({
      customerTableColumns,
    });
  }

  getPaymentTotal = (customer) => {
    const {
      customerProducts,
      customerCustomProducts,
      customerMonsantoProduct,
      dealerDiscounts,
      products = [],
      customProducts = [],
      payments,
    } = this.props;
    if (!customer.PurchaseOrders || !customer.PurchaseOrders.length) return { amount: '--', purchaseOrderAmount: [] };

    if (customerProducts.length < 1 && customerCustomProducts.length < 1 && customerMonsantoProduct.length < 1) {
      return { amount: '--', purchaseOrderAmount: [] };
    }
    if (!customer.PurchaseOrders || !customer.PurchaseOrders.length) return { amount: '--', purchaseOrderAmount: [] };

    const purchaseOrders = customer.PurchaseOrders.filter((_purchaseOrder) => !_purchaseOrder.isQuote);
    if (!purchaseOrders.length) return { amount: '--', purchaseOrderAmount: [] };
    let totalPurchaseOrderAmount = 0,
      totalPaymentAmount = 0,
      purchaseOrderAmount = [];
    // const filterByCustomer = (product) => product.customerId === customer.id;
    // const orders = customerProducts.filter(filterByCustomer);
    // const customOrders = customerCustomProducts.filter(filterByCustomer);

    purchaseOrders.forEach((purchaseOrder) => {
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
      const { orderTotal: orderWholeTotal, orderDiscountsAmount: orderWholeDiscountsAmount } = perWholeOrderDiscount(
        totals.subTotal,
        totals.quantity,
        purchaseOrder,
        perWholeOrderDiscounts,
      );
      totalPurchaseOrderAmount += totalamount - orderWholeDiscountsAmount;
    });

    let amount = numberToDollars(totalPurchaseOrderAmount - totalPaymentAmount);
    return { amount, purchaseOrderAmount };
  };

  getTableRowProps = (_, rowInfo) => {
    const { recentCreatedCustomerMetaId } = this.props;
    return {
      style: {
        background:
          rowInfo &&
          rowInfo.original &&
          rowInfo.original.meta &&
          rowInfo.original.meta.id === recentCreatedCustomerMetaId
            ? '#FFF6E1'
            : 'transparent',
      },
    };
  };

  createCustomerDone = () => {
    const { removeRecentCreatedCustomer, recentCreatedCustomerMetaId } = this.props;
    this.reload();
    setTimeout(() => {
      removeRecentCreatedCustomer(recentCreatedCustomerMetaId);
    }, 3000);
  };

  getPurchaseOrderLinks(customerId, purchaseOrders) {
    const { classes } = this.props;
    return (
      <React.Fragment>
        {this.state.showNotSyncedPO
          ? purchaseOrders
              .sort((a, b) => a.id - b.id)
              .map((po) => (
                <div key={po.id}>
                  {po.CustomerMonsantoProducts.filter((order) => order.isSent == false && order.isDeleted == false)
                    .length > 0 ? (
                    <div>
                      <Link
                        key={po.id}
                        to={`/app/dealers/${customerId}/purchase_order/${po.id}`}
                        className={classes.linkQT}
                      >
                        PO#{po.id} {po.name ? '(' + po.name + ')' : ''}
                      </Link>

                      <Tooltip title="Product haven't synced to Bayer yet">
                        <WarningIcon
                          style={{
                            color: 'gold',
                            marginLeft: '15',
                            fontSize: '20',
                          }}
                        />
                      </Tooltip>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
              ))
          : purchaseOrders
              .sort((a, b) => a.id - b.id)
              .map((po) => (
                <div key={po.id}>
                  <Link
                    key={po.id}
                    to={`/app/dealers/${customerId}/purchase_order/${po.id}`}
                    className={classes.linkQT}
                  >
                    PO#{po.id} {po.name ? '(' + po.name + ')' : ''}
                  </Link>
                  {po.CustomerMonsantoProducts.filter((order) => order.isSent == false && order.isDeleted == false)
                    .length > 0 ? (
                    <Tooltip title="Product haven't synced to Bayer yet">
                      <WarningIcon
                        style={{
                          color: 'gold',
                          marginLeft: '15',
                          fontSize: '20',
                        }}
                      />
                    </Tooltip>
                  ) : (
                    ''
                  )}
                </div>
              ))}
      </React.Fragment>
    );
  }

  getQuoteLinks(customerId, quotes) {
    const { classes } = this.props;
    return (
      <React.Fragment>
        {quotes
          .sort((a, b) => a.id - b.id)
          .map((quote) => (
            <div key={quote.id}>
              <Link key={quote.id} to={`/app/dealers/${customerId}/quote/${quote.id}`} className={classes.linkQT}>
                QT#{quote.id} {quote.name ? '(' + quote.name + ')' : ''}
              </Link>
              {/* <Tooltip
                title="Add version creates a revision of the existing quote for a customer. If you want to create a new quote for the same customer.You can click on New Quote on the top right of the screen."
                aria-label="add"
                classes={{ tooltip: classes.tooltip }}
              >
                <p
                  className={`${this.props.classes.tableItemButton} hide-print`}
                >
                  Add Version
                </p>
              </Tooltip> */}
            </div>
          ))}
      </React.Fragment>
    );
  }

  print = () => {
    this.setState(
      {
        moreFuncMenuOpen: false,
      },
      () => setTimeout(() => window.print(), 250),
    ); // 250ms necessary due close animation of popover
  };

  archiveCustomer = () => {
    const { classes } = this.props;
    const customer = this.state.activeTableItem;

    this.setState({
      archiveCustomerConfirm: (
        <SweetAlert
          showCancel
          title={customer.name + '’s transaction has been archived.'}
          onConfirm={() => {
            this.setState({ archiveCustomerConfirm: null });
          }}
          onCancel={() => this.setState({ archiveCustomerConfirm: null })}
          confirmBtnText="Okay"
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnText="Undo"
          cancelBtnCssClass={classes.button + ' ' + classes.white + ' ' + classes.primary}
        >
          You can access it by clicking on {customer.name} and clicking on “View Archived”
        </SweetAlert>
      ),
    });
  };

  // duplicateCustomer = () => {
  //   const { classes } = this.props
  //   const customer = this.state.activeTableItem
  // }

  handleShowMoreStatementsDialogOpen = (customer, statements) => {
    this.setState({
      showMoreStatementsDialog: (
        <ShowMoreStatementsDialog
          open={true}
          onClose={this.handleShowMoreStatementsDialogClose}
          classes={this.props.classes}
          customer={customer}
          statements={statements}
        />
      ),
    });
  };

  handleShowMoreStatementsDialogClose = () => {
    this.setState({ showMoreStatementsDialog: null });
  };

  handleViewPaymentsDialogOpen = (customer, payments, purchaseOrderAmount) => {
    this.setState({
      showViewPaymentDialog: (
        <ViewPaymentsDialog
          open={true}
          onClose={this.handleViewPaymentsDialogClose}
          classes={this.props.classes}
          customer={customer}
        />
      ),
    });
  };

  handleViewPaymentsDialogClose = (customer, payments) => {
    this.setState({ showViewPaymentDialog: null });
  };

  handleSearchTextChange = (event) => {
    this.setState({ searchText: event.target.value });
  };

  handleAddNewMenuToggle = () => {
    this.setState((state) => ({ addNewMenuOpen: !state.addNewMenuOpen }));
  };

  handleAddNewMenuClose = (event) => {
    this.setState({ addNewMenuOpen: false });
  };

  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));
  };

  handleMoreFuncMenuClose = (event) => {
    this.setState({ moreFuncMenuOpen: false });
  };

  handleCreateCustomerDialogOpen = () => {
    this.setState({ showCreateCustomerDialog: true });
  };

  handleCreateCustomerDialogClose = () => {
    this.setState({ showCreateCustomerDialog: false });
  };

  handleCreateCustomerFromQTPODialogOpen = () => {
    this.setState({ showCreateCustomerFromQTPODialog: true });
  };

  handleCreateCustomerFromQTPODialogClose = () => {
    this.setState({ showCreateCustomerFromQTPODialog: false });
  };

  handleCreatePurchaseOrderDialogOpen =
    (customerId, isQuote = false) =>
    () => {
      this.setState({
        showCreatePurchaseOrderDialog: true,
        creatingPurchaseOrderCustomerId: customerId,
        creatingPurchaseOrderIsQuote: isQuote,
      });
    };

  handleCreatePurchaseOrderDialogClose = () => {
    this.setState({
      showCreatePurchaseOrderDialog: false,
      creatingPurchaseOrderCustomerId: null,
    });
  };

  handleViewCustomerDialogOpen = () => {
    this.setState({ showViewCustomerDialog: true });
  };

  handleViewCustomerDialogClose = () => {
    this.setState({ showViewCustomerDialog: false });
  };

  handleViewArchivedDialogOpen = () => {
    this.setState({
      showViewArchivedDialog: true,
      showViewCustomerDialog: false,
    });
  };

  handleViewArchivedDialogClose = () => {
    this.setState({ showViewArchivedDialog: false });
  };

  handleViewCustomerArchivePODialogOpen = (customerArchiveDialogIsQuote) => () => {
    this.setState({
      showCustomerArchivePODialog: true,
      showViewCustomerDialog: false,
      customerArchiveDialogIsQuote,
    });
  };

  handleViewCustomerArchivePODialogClose = () => {
    this.setState({ showCustomerArchivePODialog: false });
  };

  handleAddNewQuoteDialogOpen = () => {
    this.setState({ showAddQuoteDialog: true });
  };

  handleAddNewQuoteDialogClose = () => {
    this.setState({ showAddQuoteDialog: false });
  };

  handleAddNewPurchaseOrderDialogOpen = () => {
    this.setState({ showAddPurchaseOrderDialog: true });
  };

  handleAddNewPurchaseOrderDialogClose = () => {
    this.setState({ showAddPurchaseOrderDialog: false });
  };

  handleTableItemActionMenuOpen = (item) => (event) => {
    this.setState({
      tableItemActionMenuOpen: true,
      tableItemActionAnchorEl: event.target,
      activeTableItem: item,
    });
  };

  handleTableItemActionMenuClose = () => {
    this.setState({ tableItemActionMenuOpen: false, activeTableItem: null });
  };

  handleCreateCustomerDialogStyle = (style) => {
    this.setState({ createCustomerDialogStyle: style });
  };

  handleHighlightNewAddCustomer = () => {
    setTimeout(() => {
      this.setState({ isNewCustomer: false });
    }, 3000);
  };

  openCSVFileDialog = () => {
    this.csvFileInput.current.click();
  };

  importCustomersCSV = (e) => {
    if (!e.target.value.endsWith('.csv')) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      createCustomersFromCSV(event.target.result);
    };
    reader.readAsText(file);
  };

  deleteCustomer = async (customerId) => {
    await this.props.deleteCustomer(customerId);
    this.handleViewArchivedDialogClose();
    this.reload();
  };

  handleShowNotSyncedPO = (event) => {
    this.setState({ showNotSyncedPO: event.target.checked });
  };

  render() {
    const { classes, customers, listShareholders, updateShareholder, shareholders, imported } = this.props;
    const {
      archiveCustomerConfirm,
      addNewMenuOpen,
      moreFuncMenuOpen,
      showCreateCustomerDialog,
      showViewCustomerDialog,
      showAddQuoteDialog,
      showAddPurchaseOrderDialog,
      showViewArchivedDialog,
      showCreatePurchaseOrderDialog,
      customerTableColumns,
      tableItemActionAnchorEl,
      tableItemActionMenuOpen,
      creatingPurchaseOrderCustomerId,
      creatingPurchaseOrderIsQuote,
      createCustomerDialogStyle,
      showCreateCustomerFromQTPODialog,
      showMoreStatementsDialog,
      showViewPaymentDialog,
      showCustomerArchivePODialog,
      customerArchiveDialogIsQuote,
      showNotSyncedPO,
    } = this.state;
    // if (this.isLoading) {
    //   return <CircularProgress />;
    // }
    if (imported) {
      window.location.reload();
    }
    let customerss;

    customerss = this.props.customers.filter((c) => c.name == 'Bayer Dealer Bucket');
    if (showNotSyncedPO) {
      const cids = [];
      customerss.map((c) => {
        c.PurchaseOrders.map((order) => {
          if (order.CustomerMonsantoProducts.filter((oo) => oo.isSent == false && oo.isDeleted == false).length > 0) {
            if (!cids.includes(c.id)) {
              cids.push(c.id);
            }
          }
        });
      });
      customerss = this.props.customers.filter((c) => c.name == 'Bayer Dealer Bucket' && cids.includes(c.id));
    }

    return (
      <div>
        {/* {this.isLoading ? <CircularProgress /> : null} */}
        <div className={classes.cardHeaderContent}>
          <h3 className={classes.cardIconTitle}>Bayer Bucket Dealer</h3>
          <div className={`${classes.cardHeaderActions} hide-print`}>
            {/* <TextField
              className={`${classes.searchField} hide-print`}
              margin="normal"
              placeholder="Search"
              value={searchText}
              onChange={this.handleSearchTextChange}
            />
            <Button
              className={`${classes.iconButton} hide-print`}
              variant="outlined"
              color="primary"
              onClick={this.searchCustomer}
            >
              <SearchIcon />
            </Button> */}

            {/* <Button
              className={`${classes.iconButton} hide-print`}
              variant="contained"
              color="primary"
              align="right"
              buttonRef={node => {
                this.moreFuncMenuAnchorEl = node;
              }}
              onClick={this.handleMoreFuncMenuToggle}
            >
              <MoreHorizontalIcon />
            </Button> */}

            <Button
              variant="contained"
              className={`${classes.addCustomerButton} hide-print`}
              color="primary"
              buttonRef={(node) => {
                this.addNewAnchorEl = node;
              }}
              onClick={this.handleAddNewMenuToggle}
            >
              <span>Add New</span>
              <ArrowDropDown className={classes.addCustomerButtonDropdownIcon} />
            </Button>
          </div>
          <Popover
            className="hide-print"
            open={addNewMenuOpen}
            anchorEl={this.addNewAnchorEl}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            onClose={this.handleAddNewMenuClose}
          >
            <Paper>
              <MenuList>
                <MenuItem
                  id="dealerQuote"
                  className={classes.addNewMenuItem}
                  onClick={
                    this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket')
                      ? this.handleCreatePurchaseOrderDialogOpen(
                          this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket').id,
                          true,
                        )
                      : ''
                  }
                >
                  Quote
                </MenuItem>
                <MenuItem
                  id="dealerPo"
                  className={classes.addNewMenuItem}
                  onClick={
                    this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket')
                      ? this.handleCreatePurchaseOrderDialogOpen(
                          this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket').id,
                          false,
                        )
                      : ''
                  }
                >
                  Purchase Order
                </MenuItem>
                {/* <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.handleCreateCustomerDialogOpen();
                    this.handleAddNewMenuClose();
                  }}
                >
                  Customer
                </MenuItem> */}
              </MenuList>
            </Paper>
          </Popover>
          {/* <Popover
            className="hide-print"
            open={moreFuncMenuOpen}
            anchorEl={this.moreFuncMenuAnchorEl}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            onClose={this.handleMoreFuncMenuClose}
          >
            <Paper>
              <MenuList>
                <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.print();
                  }}
                >
                  Print
                </MenuItem>
                <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    downloadCustomers();
                  }}
                >
                  Download Customer Data (CSV)
                </MenuItem>
                <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={this.openCSVFileDialog}
                >
                  <input
                    type="file"
                    onChange={e => {
                      this.importCustomersCSV(e);
                      this.handleMoreFuncMenuClose();
                    }}
                    ref={this.csvFileInput}
                    className={classes.csvFileInput}
                  />
                  Import Customers CSV
                </MenuItem>
              </MenuList>
            </Paper>
          </Popover> */}
        </div>
        <Card>
          {this.props.customerMonsantoProduct.length > 0 ? (
            <FormControl style={{ marginLeft: 20 }}>
              <FormControlLabel
                control={<Checkbox value={showNotSyncedPO} onChange={this.handleShowNotSyncedPO} />}
                label="Show Not Synced Purchase Orders"
              />
            </FormControl>
          ) : (
            ''
          )}

          <CardBody className={classes.cardBody}>
            <ReactTable
              data={customerss.sort((a, b) => a.name.localeCompare(b.name))}
              columns={customerTableColumns}
              minRows={1}
              resizable={false}
              showPagination={true}
              pageSize={customerss.length > 10 ? 10 : customerss.length}
              // pageSize={customerss.length || 0}
              getTrProps={this.getTableRowProps}
            />
            <Popover
              open={tableItemActionMenuOpen}
              anchorEl={tableItemActionAnchorEl}
              anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
              transformOrigin={{ horizontal: 'left', vertical: 'top' }}
              onClose={this.handleTableItemActionMenuClose}
            >
              <Paper>
                <MenuList>
                  {/* <MenuItem
                    className={classes.addNewMenuItem}
                    onClick={() => {
                      this.duplicateCustomer();
                      this.handleTableItemActionMenuClose();
                    }}
                  >
                    Duplicate
                  </MenuItem> */}
                  <MenuItem
                    className={classes.addNewMenuItem}
                    onClick={() => {
                      this.archiveCustomer();
                      this.handleTableItemActionMenuClose();
                    }}
                  >
                    Archive
                  </MenuItem>
                </MenuList>
              </Paper>
            </Popover>
          </CardBody>

          {showCreateCustomerDialog && (
            <CreateCustomer
              open={showCreateCustomerDialog}
              onClose={this.handleCreateCustomerDialogClose}
              createCustomerDone={this.createCustomerDone}
            />
          )}
          {showCreateCustomerFromQTPODialog && (
            <CreateCustomerFromQTPO
              open={showCreateCustomerFromQTPODialog}
              onClose={this.handleCreateCustomerFromQTPODialogClose}
              handleAddNewQuoteDialogOpen={this.handleAddNewQuoteDialogOpen}
              handleAddNewPurchaseOrderDialogOpen={this.handleAddNewPurchaseOrderDialogOpen}
              handleCreatePurchaseOrderDialogOpen={this.handleCreatePurchaseOrderDialogOpen}
              CreateCustomerDialogstyle={createCustomerDialogStyle}
              createCustomerDone={this.createCustomerDone}
            />
          )}
          {creatingPurchaseOrderCustomerId && (
            <CreatePurchaseOrderDialog
              customerId={creatingPurchaseOrderCustomerId}
              open={showCreatePurchaseOrderDialog}
              onClose={this.handleCreatePurchaseOrderDialogClose}
              isQuote={creatingPurchaseOrderIsQuote}
            />
          )}
          {showAddQuoteDialog && (
            <NewQuote
              open={showAddQuoteDialog}
              onClose={this.handleAddNewQuoteDialogClose}
              handleCreateCustomerFromQTPODialogOpen={this.handleCreateCustomerFromQTPODialogOpen}
              handleCreateCustomerDialogStyle={this.handleCreateCustomerDialogStyle}
              handleCreatePurchaseOrderDialogOpen={this.handleCreatePurchaseOrderDialogOpen}
            />
          )}
          {showAddPurchaseOrderDialog && (
            <NewPurchaseOrder
              open={showAddPurchaseOrderDialog}
              onClose={this.handleAddNewPurchaseOrderDialogClose}
              handleCreateCustomerFromQTPODialogOpen={this.handleCreateCustomerFromQTPODialogOpen}
              handleCreateCustomerDialogStyle={this.handleCreateCustomerDialogStyle}
              handleCreatePurchaseOrderDialogOpen={this.handleCreatePurchaseOrderDialogOpen}
            />
          )}
          {archiveCustomerConfirm}
          {showViewCustomerDialog && (
            <ViewCustomer
              listShareholders={listShareholders}
              updateShareholder={updateShareholder}
              shareholders={shareholders}
              open={showViewCustomerDialog}
              onClose={this.handleViewCustomerDialogClose}
              customer={this.state.viewCustomer}
              handleViewCustomerArchivePODialogOpen={this.handleViewCustomerArchivePODialogOpen}
              handleViewArchivedDialogOpen={this.handleViewArchivedDialogOpen}
            />
          )}
          {showViewArchivedDialog && (
            <ViewArchivedDialog
              open={showViewArchivedDialog}
              onClose={this.handleViewArchivedDialogClose}
              customer={this.state.viewCustomer}
              openViewCustomerDialog={this.handleViewCustomerDialogOpen}
              deleteCustomer={this.deleteCustomer}
            />
          )}
          {showMoreStatementsDialog}
          {showViewPaymentDialog}
          {showCustomerArchivePODialog && (
            <ViewCustomerPOArchiveDialog
              open={showCustomerArchivePODialog}
              onClose={this.handleViewCustomerArchivePODialogClose}
              isQuote={customerArchiveDialogIsQuote}
              customer={this.state.viewCustomer}
            />
          )}
        </Card>
      </div>
    );
  }
}

export default withStyles(customersStyles)(CustomersList);
