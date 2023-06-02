import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import { Link } from 'react-router-dom';
import SweetAlert from 'react-bootstrap-sweetalert';

// material-ui icons
import AccountBox from '@material-ui/icons/AccountBox';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import SearchIcon from '@material-ui/icons/Search';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';
// import Print from "@material-ui/icons/Print"

// material-ui components
import CircularProgress from '@material-ui/core/CircularProgress';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Tooltip from '@material-ui/core/Tooltip';
import Popper from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import IconButton from '@material-ui/core/IconButton';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';

// core components
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Card from '../../components/material-dashboard/Card/Card';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import Table from '../../components/material-dashboard/Table/Table';
import ReactTable from 'react-table';

import { getId, isPending, isUnloadedOrLoading, customerProductDiscountsTotals } from '../../utilities';
import { getProductFromOrder } from '../../utilities/product';
import { getAppliedDiscounts } from '../../utilities/purchase_order';
import {
  listCustomers,
  listPurchaseOrders,
  listPayments,
  listCustomerProducts,
  listAllCustomProducts,
  listDealerDiscounts,
  listProducts,
  listDeliveryReceipts,
  removeRecentCreatedCustomer,
} from '../../store/actions';

import { cardTitle } from '../../assets/jss/material-dashboard-pro-react';
import sweetAlertStyle from '../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';

import CreateCustomer from './create.v2';
import ViewCustomer from './view';
import NewQuote from './new_quote';
import NewPurchaseOrder from './new_purchase_order';
import CreateCustomerFromQTPO from './create_from_qt_po';
import ViewArchivedDialog from './view_archived_dialog';

import CreatePurchaseOrderDialog from '../purchase-order/create.dialog';

const styles = (theme) =>
  Object.assign({}, sweetAlertStyle, {
    cardIconTitle: {
      ...cardTitle,
      marginBottom: '0px',
      fontWeight: 600,
    },
    cardHeaderContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '15px',
    },
    cardHeaderActions: {
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    iconButton: {
      background: 'transparent',
      color: 'grey',
      border: '1px solid #38A154',
      padding: 7,
      marginRight: 16,
    },
    cardBody: {
      display: 'flex',
      flexDirection: 'column',
    },
    addCustomerButton: {
      paddingLeft: 15,
      paddingRight: 15,
    },
    addCustomerButtonDropdownIcon: {
      marginTop: '-3px !important',
    },
    searchField: {
      marginRight: 8,
    },
    addNewMenuItem: {
      borderRadius: '3px',
      margin: '0 8px',
      padding: '12px 24px',
      transition: 'none',
      '&:hover': {
        background: '#38A154',
        color: 'white',
        boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.36)',
      },
    },
    addIcon: {
      margin: '0 !important',
    },
    leftIcon: {
      marginRight: 8,
    },
    rightIcon: {
      marginLeft: 8,
    },
    fullWidth: {
      display: 'block',
    },
    printBtn: {
      marginRight: 13,
      marginLeft: 'auto',
    },
    tableItemButton: {
      fontSize: 12,
      cursor: 'pointer',
      color: '#38A154',
    },
    tableItemLinearProgress: {
      width: 100,
    },
    createQT: {
      width: 70,
      textAlign: 'left',
      margin: 'auto',
      textTransform: 'none',
    },
    createPO: {
      width: 115,
      textAlign: 'left',
      margin: 'auto',
      textTransform: 'none',
    },
    linkQT: {
      width: 'auto',
      display: 'block',
      color: '#2F2E2E',
      '&:hover': {
        display: 'inline-block',
        background: '#DDDDDD',
        color: '#2F2E2E',
      },
    },
    tooltip: {
      width: 20,
      position: 'relative',
      backgroundColor: theme.palette.common.black,
    },
    arrow: {
      position: 'absolute',
      fontSize: 6,
      '&::before': {
        content: '""',
        margin: 'auto',
        display: 'block',
        width: 0,
        height: 0,
        borderStyle: 'solid',
      },
    },
    popper: {
      // '&tooltipPlacementBottom $arrow': {
      //   top: 0,
      //   left: 0,
      //   marginTop: '-0.95em',
      //   width: '2em',
      //   height: '1em',
      //   '&::before': {
      //     borderWidth: '0 1em 1em 1em',
      //     borderColor: `transparent transparent ${theme.palette.common.black} transparent`,
      //   },
      // },
    },
  });

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
  };

  get isLoading() {
    const { purchaseOrdersLoadingStatus, customersLoadingStatus, isOnline } = this.props;

    return isOnline && [purchaseOrdersLoadingStatus, customersLoadingStatus].some(isUnloadedOrLoading);
  }

  handleTabChange = (event, value) => {
    this.setState({
      activeTab: value,
    });
  };

  componentWillMount() {
    this.props.listCustomers();
    this.props.listPurchaseOrders();
    this.props.listDealerDiscounts();
    this.props.listProducts();
    this.props.listPayments();
    this.props.listCustomerProducts();
    this.props.listAllCustomProducts();
    this.props.listDeliveryReceipts();
    this.setCustomerTableColumn();
  }

  setCustomerTableColumn() {
    const customerTableColumns = [
      {
        Header: 'Customer',
        show: true,
        id: 'customer',
        accessor: (d) => d,
        Cell: (props) => {
          const { classes, history } = this.props;
          const customer = props.value;
          return (
            <div>
              <Tooltip title="View Custom Details">
                <p
                  onClick={() => {
                    this.handleViewCustomerDialogOpen();
                    this.setState({ viewCustomer: customer });
                  }}
                  className={classes.linkQT}
                >
                  {customer.name}
                </p>
              </Tooltip>
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
          const { classes, history } = this.props;
          const customer = props.value;
          const quotes = this.getPurchaseOrdersForCustomer(customer).filter((po) => po.isQuote);
          const needsQuote = quotes.length;
          return (
            <div>
              {needsQuote === 0 ? (
                <Tooltip title="Create a new order">
                  <Button
                    simple={true}
                    color="primary"
                    className={classes.createQT}
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
          const { classes, history } = this.props;
          const customer = props.value;
          const purchaseOrders = this.getPurchaseOrdersForCustomer(customer).filter((po) => !po.isQuote);
          const needsPurchaseOrder = purchaseOrders.length;
          return (
            <div>
              {needsPurchaseOrder === 0 ? (
                <Tooltip title="Create a new purchase order">
                  <Button
                    simple={true}
                    color="primary"
                    className={classes.createPO}
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
      {
        Header: 'Invoices & Payments',
        show: true,
        id: 'invoices_payments',
        accessor: (d) => d,
        Cell: (props) => {
          const customer = props.value;
          const purchaseOrders = this.getPurchaseOrdersForCustomer(customer).filter((po) => !po.isQuote);
          if (purchaseOrders.length === 0) {
            return <div>N/A</div>;
          }
          const { total } = this.getInvoicesAndPayments(purchaseOrders[0].id);
          if (total === 0) {
            return (
              <div>
                IN#{purchaseOrders[0].id}
                <br />
                <p>$0/$0</p>
              </div>
            );
          }
          const paid = this.props.payments
            .filter((payment) => payment.purchaseOrderId === purchaseOrders[0].id)
            .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
          return (
            <div>
              IN#{purchaseOrders[0].id}
              <br />
              <LinearProgress
                className={this.props.classes.tableItemLinearProgress}
                variant="determinate"
                value={(paid / total) * 100}
              />
              <p>
                &#36;{paid}/&#36;{total}
              </p>
            </div>
          );
        },
      },
      {
        Header: 'Deliveries',
        show: true,
        id: 'deliveries',
        accessor: (d) => d,
        Cell: (props) => {
          const customer = props.value;
          const { deliveryReceipts } = this.props;
          const purchaseOrders = this.getPurchaseOrdersForCustomer(customer).filter((po) => !po.isQuote);

          if (purchaseOrders.length === 0) {
            return <div>N/A</div>;
          }
          const purchaseOrder = purchaseOrders[0];
          const delivered = deliveryReceipts
            .filter((receipt) => receipt.purchaseOrderId === purchaseOrder.id)
            .reduce(
              (totalSum, receipt) =>
                totalSum +
                receipt.DeliveryReceiptDetails.reduce((itemSum, detail) => itemSum + detail.amountDelivered, 0),
              0,
            );
          const totalDeliveries = this.getTotalDeliveries(purchaseOrder.id);
          return (
            <div>
              {delivered}/{totalDeliveries}
              <br />
              {totalDeliveries !== 0 && (
                <LinearProgress
                  className={this.props.classes.tableItemLinearProgress}
                  variant="determinate"
                  value={(delivered / totalDeliveries) * 100}
                />
              )}
              <p>DL#{purchaseOrder.id}</p>
            </div>
          );
        },
      },
      {
        Header: '',
        show: true,
        id: 'actions',
        accessor: (d) => d,
        maxWidth: 60,
        sortable: false,
        Cell: (props) => (
          <React.Fragment>
            <IconButton aria-label="delete" onClick={this.handleTableItemActionMenuOpen(props.value)}>
              <MoreHorizontalIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        ),
      },
    ];
    this.setState({
      customerTableColumns,
    });
  }

  getTotalDeliveries(purchaseOrderId) {
    const { customerProducts } = this.props;

    const totalCustomerProductsDeliveries = customerProducts
      .filter((cp) => cp.purchaseOrderId === purchaseOrderId)
      .reduce((sum, order) => sum + order.orderQty, 0);
    return totalCustomerProductsDeliveries;
  }

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
    setTimeout(() => {
      removeRecentCreatedCustomer(recentCreatedCustomerMetaId);
    }, 3000);
  };

  getInvoicesAndPayments(purchaseOrderId) {
    const { customerProducts, customerCustomProducts, dealerDiscounts, products, customProducts } = this.props;
    const total = customerProducts
      .filter((cp) => cp.purchaseOrderId === purchaseOrderId)
      .map((order) => {
        let appliedDiscounts = getAppliedDiscounts(order, dealerDiscounts);
        let product = getProductFromOrder(order, products, customProducts);
        if (!product) {
          return 0;
        }
        return customerProductDiscountsTotals(order, appliedDiscounts, product).total;
      })
      .reduce((acc, total) => acc + total, 0);
    return {
      total,
    };
  }

  getPurchaseOrderLinks(customerId, purchaseOrders) {
    const { classes } = this.props;
    return (
      <React.Fragment>
        {purchaseOrders.map((po) => (
          <Link key={po.id} to={`/app/v2/customers/${customerId}/purchase_order/${po.id}`} className={classes.linkQT}>
            PO#{po.id}
          </Link>
        ))}
      </React.Fragment>
    );
  }

  getQuoteLinks(customerId, quotes) {
    const { classes } = this.props;
    this.ArrowTooltip.propTypes = {
      title: PropTypes.node,
    };
    return (
      <React.Fragment>
        {quotes.map((quote) => (
          <div>
            <Link key={quote.id} to={`/app/v2/customers/${customerId}/quote/${quote.id}`} className={classes.linkQT}>
              QT#{quote.id}
            </Link>
            {/* <this.ArrowTooltip title={"Add version creates a revision of the existing quote for a customer. If you want to create a new quote for the same customer.You can click on New Quote on the top right of the screen."
            }>
              <p className={this.props.classes.tableItemButton}>Add Version</p>
            </this.ArrowTooltip> */}
            <Tooltip
              title="Add version creates a revision of the existing quote for a customer. If you want to create a new quote for the same customer.You can click on New Quote on the top right of the screen."
              aria-label="add"
              // PopperProps={{
              //   popper: {
              //     modifiers: {
              //       arrow: {
              //         enabled: "true",
              //       },
              //     },
              //   },
              // }}
            >
              <p className={this.props.classes.tableItemButton}>Add Version</p>
            </Tooltip>
          </div>
        ))}
      </React.Fragment>
    );
  }

  getPurchaseOrdersForCustomer(customer) {
    return this.props.purchaseOrders.filter((po) => po.customerId === customer.id);
  }

  print = () => {
    setTimeout(() => {
      window.print();
    }, 500);
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
          confirmBtnCssClass={classes.button + ' ' + classes.primary}
          cancelBtnText="Undo"
          cancelBtnCssClass={classes.button + ' ' + classes.white + ' ' + classes.primary}
        >
          You can access it by clicking on {customer.name} and clicking on “View Archived”
        </SweetAlert>
      ),
    });
  };

  duplicateCustomer = () => {
    const { classes } = this.props;
    const customer = this.state.activeTableItem;
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
    this.setState({ showViewArchivedDialog: true });
  };

  handleViewArchivedDialogClose = () => {
    this.setState({ showViewArchivedDialog: false });
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

  ArrowTooltip = (prop) => {
    const [arrowRef, setArrowRef] = React.useState(null);

    return (
      <Tooltip
        classes={this.props.classes.tooltip + ' ' + this.props.classes.popper}
        PopperProps={{
          popperoptions: {
            modifiers: {
              arrow: {
                enabled: Boolean(arrowRef),
                element: arrowRef,
              },
            },
          },
        }}
        title="Add version creates a revision of the existing quote for a customer. If you want to create a new quote for the same customer.You can click on New Quote on the top right of the screen."
      />
    );
  };

  render() {
    const { classes, customers, history } = this.props;
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
    } = this.state;

    if (this.isLoading) {
      return <CircularProgress />;
    }

    return (
      <div>
        <div className={classes.cardHeaderContent}>
          <h3 className={classes.cardIconTitle}>Customers</h3>
          <div className={classes.cardHeaderActions}>
            <TextField className={classes.searchField} margin="normal" placeholder="Search" />
            <Button className={classes.iconButton} variant="outlined" color="primary">
              <SearchIcon />
            </Button>

            <Button
              className={classes.iconButton}
              variant="contained"
              color="primary"
              buttonRef={(node) => {
                this.moreFuncMenuAnchorEl = node;
              }}
              onClick={this.handleMoreFuncMenuToggle}
            >
              <MoreHorizontalIcon />
            </Button>
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
            open={addNewMenuOpen}
            anchorEl={this.addNewAnchorEl}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
            onClose={this.handleAddNewMenuClose}
          >
            <Paper>
              <MenuList>
                <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.handleAddNewQuoteDialogOpen();
                    this.handleAddNewMenuClose();
                  }}
                >
                  Quote
                </MenuItem>
                <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.handleAddNewPurchaseOrderDialogOpen();
                    this.handleAddNewMenuClose();
                  }}
                >
                  Purchase Order
                </MenuItem>
                <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.handleCreateCustomerDialogOpen();
                    this.handleAddNewMenuClose();
                  }}
                >
                  Customer
                </MenuItem>
              </MenuList>
            </Paper>
          </Popover>
          <Popover
            open={moreFuncMenuOpen}
            anchorEl={this.moreFuncMenuAnchorEl}
            anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            transformOrigin={{ horizontal: 'left', vertical: 'top' }}
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
              </MenuList>
            </Paper>
          </Popover>
        </div>
        <Card>
          <CardBody className={classes.cardBody}>
            <ReactTable
              data={customers}
              columns={customerTableColumns}
              minRows={1}
              resizable={false}
              showPagination={false}
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
            ></CreateCustomer>
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
            ></CreateCustomerFromQTPO>
          )}
          {creatingPurchaseOrderCustomerId && (
            <CreatePurchaseOrderDialog
              customerId={creatingPurchaseOrderCustomerId}
              open={showCreatePurchaseOrderDialog}
              onClose={this.handleCreatePurchaseOrderDialogClose}
              isQuote={creatingPurchaseOrderIsQuote}
            ></CreatePurchaseOrderDialog>
          )}
          {showAddQuoteDialog && (
            <NewQuote
              open={showAddQuoteDialog}
              onClose={this.handleAddNewQuoteDialogClose}
              handleCreateCustomerFromQTPODialogOpen={this.handleCreateCustomerFromQTPODialogOpen}
              handleCreateCustomerDialogStyle={this.handleCreateCustomerDialogStyle}
              handleCreatePurchaseOrderDialogOpen={this.handleCreatePurchaseOrderDialogOpen}
            ></NewQuote>
          )}
          {showAddPurchaseOrderDialog && (
            <NewPurchaseOrder
              open={showAddPurchaseOrderDialog}
              onClose={this.handleAddNewPurchaseOrderDialogClose}
              handleCreateCustomerFromQTPODialogOpen={this.handleCreateCustomerFromQTPODialogOpen}
              handleCreateCustomerDialogStyle={this.handleCreateCustomerDialogStyle}
              handleCreatePurchaseOrderDialogOpen={this.handleCreatePurchaseOrderDialogOpen}
            ></NewPurchaseOrder>
          )}
          {archiveCustomerConfirm}
          {showViewCustomerDialog && (
            <ViewCustomer
              open={showViewCustomerDialog}
              onClose={this.handleViewCustomerDialogClose}
              customer={this.state.viewCustomer}
              openViewArchivedDialog={this.handleViewArchivedDialogOpen}
            ></ViewCustomer>
          )}
          {showViewArchivedDialog && (
            <ViewArchivedDialog
              open={showViewArchivedDialog}
              onClose={this.handleViewArchivedDialogClose}
              customer={this.state.viewCustomer}
              openViewCustomerDialog={this.handleViewCustomerDialogOpen}
            ></ViewArchivedDialog>
          )}
        </Card>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isOnline: state.offline.online,
    customers: state.customerReducer.customers,
    customersLoadingStatus: state.customerReducer.loadingStatus,
    recentCreatedCustomerMetaId: state.customerReducer.recentCreatedCustomerMetaId,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
    purchaseOrdersLoadingStatus: state.purchaseOrderReducer.loadingStatus,
    customerProducts: state.customerProductReducer.customerProducts,
    customerProductsStatus: state.customerProductReducer.loadingStatus,
    customProducts: state.customProductReducer.products,
    customProductsStatus: state.customProductReducer.loadingStatus,
    payments: state.paymentReducer.payments,
    paymentsStatus: state.paymentReducer.loadingStatus,
    products: state.productReducer.products,
    productsStatus: state.productReducer.loadingStatus,
    dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
    dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
    deliveryReceipts: state.deliveryReceiptReducer.deliveryReceipts,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomers,
      listPurchaseOrders,
      listCustomerProducts,
      listPayments,
      listDealerDiscounts,
      listProducts,
      listAllCustomProducts,
      listDeliveryReceipts,
      removeRecentCreatedCustomer,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CustomersList));
