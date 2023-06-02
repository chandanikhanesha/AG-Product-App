import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import { Link } from 'react-router-dom';
import SweetAlert from 'react-bootstrap-sweetalert';
import { createCustomersFromCSV } from '../../utilities/csv';
import axios from 'axios';
import { sortBy } from 'lodash';
import moment from 'moment';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import InputLabel from '@material-ui/core/InputLabel';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import Snackbar from '@material-ui/core/Snackbar';

// material-ui icons
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import SearchIcon from '@material-ui/icons/Search';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';
// import Print from "@material-ui/icons/Print"
import CloseIcon from '@material-ui/icons/Close';
// material-ui components
import CircularProgress from '@material-ui/core/CircularProgress';
import Tooltip from '@material-ui/core/Tooltip';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import FormControl from '@material-ui/core/FormControl';
// import IconButton from "@material-ui/core/IconButton";
import TextField from '@material-ui/core/TextField';
// import LinearProgress from "@material-ui/core/LinearProgress";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import { DialogContent } from '@material-ui/core';
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
// import { getProductFromOrder } from '../../utilities/product';
// import { getOrderTotals } from '../../utilities/purchase_order';
import { downloadCSV } from '../../utilities/csv';

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
import Radio from '@material-ui/core/Radio';
import { downloadCustomers, changeImported } from '../../store/actions/customer';
import { customersStyles } from './customers.styles';
// import { getStore } from '../../store/configureStore';
import { CSVLink } from 'react-csv';
import ViewCsv from './view_csv_popup/view_csv';

var serchCustomer;

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
    showViewCsvDialog: false,
    showMoreStatementsDialog: null,
    showCustomerArchivePODialog: false,
    showViewPaymentDialog: null,
    showAddPaymentDialog: null,
    customerArchiveDialogIsQuote: false,
    viewCustomer: null,
    discountReportsList: [],
    moreFuncMenuOpen: false,
    isLoad: false,
    deleteProductConfirm: null,
    showDeliveriesList: false,
    // Table Related
    customerTableColumns: [],
    tableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,
    activeTableItem: null,
    creatingPurchaseOrderCustomerId: null,
    creatingPurchaseOrderIsQuote: false,
    pageIndex: 0,
    createCustomerDialogStyle: '',
    customerID: null,
    allCustomerData: [],
    searchText: '',
    customerList: [],
    showNotSyncedPO: false,
    showImportCsvFailed: [],
    pageSize: 50,
    seedCsvData: '',
    seedListData: [],
    bannerData: [],
    filterValue: '',
    customers: this.props.customers,
    totalPages: '',
    openArchivedModel: false,
    currentCustItem: '',
    templateList: [],
    openTemplateModel: false,
    updateList: false,
    updatetemplateData: {
      farmId: '',
      farmName: '',
      orderName: '',
      shareHolderData: [],
    },
    isSearchData: false,
    showSnackBar: false,
    messageForSnackBar: '',
  };

  get isLoading() {
    const { dealerDiscountsStatus, customersLoadingStatus, productsStatus, customProductsStatus, isOnline } =
      this.props;

    // return false
    return isOnline && [customersLoadingStatus].some(isUnloadedOrLoading);
  }

  demo = async () => {
    await this.props.syncAllMonsantoOrders(this.props.organizationId);
  };

  componentDidMount = async () => {
    const fecthData = async () => {
      await this.refreshCustomerData(0, this.state.pageSize);
      // await this.props.listDeliveryReceipts();
      // await this.props.listSeedCompanies();
      await this.props.listPayments(true);
      await this.props.listDealerDiscounts(true);

      // await this.props.listProducts(true);
      this.props.listBackupCustomer();
      this.props.listBackupCustomerHistory();

      await axios
        .post(
          `${process.env.REACT_APP_API_BASE}/purchase_orders/orderTemplate`,
          {},
          {
            headers: { 'x-access-token': localStorage.getItem('authToken') },
          },
        )
        .then((res) => {})
        .catch((e) => {
          console.log(e, 'e');
        });

      await axios
        .get(`${process.env.REACT_APP_API_BASE}/purchase_orders/orderTemplate`, {
          headers: { 'x-access-token': localStorage.getItem('authToken') },
        })
        .then((res) => {
          this.setState({ templateList: res.data.data });
        })
        .catch((e) => {
          console.log(e, 'e');
        });

      // await this.props.listAllCustomProducts(true);
      //  await this.props.listCustomerProducts(true);
      this.csvFileInput = React.createRef();
      await this.getTemplateList();
      await this.props.listCustomerCustomProducts(true);

      await axios
        .get(`${process.env.REACT_APP_API_BASE}/bannerMsg`, {
          headers: { 'x-access-token': localStorage.getItem('authToken') },
        })
        .then((res) => {
          res.data && this.setState({ bannerData: res.data });
        })
        .catch((e) => {
          console.log(e, 'e');
        });
      // await this.props.listSeedCompanies(true);
      this.setCustomerTableColumn();

      if (serchCustomer !== undefined) {
        this.searchCustomer(serchCustomer);
      }

      setTimeout(async () => {
        this.setState({
          isLoad: false,
        });
      }, 1000);
      setTimeout(() => {
        this.closeBanner();
      }, 8000);
    };
    fecthData();
  };

  exportTemplateCsv = () => {
    let csvData = '';
    const headers = [
      'name',
      'email',
      'officePhoneNumber',
      'cellPhoneNumber',
      'deliveryAddress',
      'businessStreet',
      'businessCity',
      'businessState',
      'businessZip',
      'monsantoTechnologyId',
      'glnId',
    ];
    csvData += headers.join(',');
    csvData += '\n';

    const row = [
      'Aaron Barclay',
      'example@gmail.com',
      '',
      '',
      '326 E Factory St.',
      '326 E Factory St.',
      'Seymour',
      'WI',
      '54165',
      '',
      '1100018447992',
    ];
    csvData += row.join(',');
    csvData += '\n';

    downloadCSV(csvData, 'customerCsvTemplate');
  };

  getTemplateList = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/purchase_orders/orderTemplate`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((res) => {
        this.setState({ templateList: res.data.data });
      })
      .catch((e) => {
        console.log(e, 'e');
      });
  };

  titleCase = (str) => {
    var splitStr = str.toLowerCase().split(' ');
    for (let i = 0; i < splitStr.length; i++) {
      splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }
    return splitStr.join(' ');
  };

  handleFilterChange = async (event) => {
    this.setState({ filterValue: event.target.value, customers: [] });
    await this.refreshCustomerData(this.state.pageIndex, this.state.pageSize, event.target.value);
    await this.setCustomerTableColumn();
  };
  // exportSeedWarehouseReport = (seedCompanyId) => {
  //   const { seedCompanies, deliveryReceipts, customers } = this.props;
  //   const { allCustomerData } = this.state;
  //   let csvData = '';
  //   const headers = [
  //     'Customer',
  //     'Purchase Order',
  //     'Product Type',
  //     'Product Detail',
  //     'Order Qty',
  //     'Qty Delivered',
  //     'Qty Remaining',
  //   ];
  //   let tableData = [];
  //   // regular company customers product
  //   allCustomerData
  //     .sort((a, b) => a.name.localeCompare(b.name))
  //     .filter((item) => item.PurchaseOrders.length > 0)
  //     .forEach((item) => {
  //       {
  //         return item.PurchaseOrders.filter((po) => po.isQuote == false && po.isDeleted == false).forEach(
  //           (purchaseOrder) => {
  //             if (seedCompanyId == 'all') {
  //               purchaseOrder.CustomerCustomProducts.filter((item) => item.orderQty > 0 && item.isDeleted == false)
  //                 .sort((a, b) => a.CustomProduct.name.localeCompare(b.CustomProduct.name))
  //                 .forEach((customOrder) => {
  //                   const deliveredData =
  //                     deliveryReceipts &&
  //                     deliveryReceipts
  //                       .filter((d) => d.purchaseOrderId === customOrder.purchaseOrderId)
  //                       .map((dd) =>
  //                         dd.DeliveryReceiptDetails.filter(
  //                           (drd) => drd.customerMonsantoProductId === customOrder.id,
  //                         ).reduce((acc, detail) => acc + parseFloat(detail.amountDelivered), 0),
  //                       );
  //                   const deliveredAmount = deliveredData.reduce(
  //                     (partialSum, a) => parseFloat(partialSum) + parseFloat(a),
  //                     0,
  //                   );
  //                   const customProductDetail = `${customOrder.CustomProduct.name} ${customOrder.CustomProduct.description}`;
  //                   tableData.push({
  //                     customer: `"${item.name}"`,
  //                     purchaseOrder: `#PO${purchaseOrder.id}`,
  //                     productDetail: customProductDetail.replace(/(^\&)|,/g, '_'),
  //                     orderQty: customOrder.orderQty,
  //                     qtyDelivered: parseFloat(deliveredAmount || 0).toFixed(2),
  //                     qtyRemaining: parseFloat(customOrder.orderQty).toFixed(2) - (deliveredAmount || 0).toFixed(2),
  //                     type: 'Non Bayer(custom product)',
  //                   });
  //                 });

  //               // seed company customer product

  //               purchaseOrder.CustomerProducts.filter((item) => item.orderQty > 0 && item.isDeleted == false)
  //                 .sort((a, b) => a.Product.brand.localeCompare(b.Product.brand))
  //                 .forEach((customerOrder) => {
  //                   const deliveredData =
  //                     deliveryReceipts &&
  //                     deliveryReceipts
  //                       .filter((d) => d.purchaseOrderId === customerOrder.purchaseOrderId)
  //                       .map((dd) =>
  //                         dd.DeliveryReceiptDetails.filter(
  //                           (drd) => drd.customerMonsantoProductId === customerOrder.id,
  //                         ).reduce((acc, detail) => parseFloat(acc) + parseFloat(detail.amountDelivered), 0),
  //                       );
  //                   const deliveredAmount = deliveredData.reduce(
  //                     (partialSum, a) => parseFloat(partialSum) + parseFloat(a),
  //                     0,
  //                   );
  //                   const seedCompany = seedCompanies.find((sc) => sc.id == customerOrder.Product.seedCompanyId);
  //                   let productSeedType = customerOrder.Product.seedType
  //                     ? this.titleCase(customerOrder.Product.seedType.toLowerCase())
  //                     : '';
  //                   const metadata = JSON.parse(seedCompany.metadata);
  //                   const seedtype = metadata[productSeedType] ? metadata[productSeedType].brandName : '';
  //                   const productFirstLine = `${seedtype}_${seedCompany.name.replace(/(^\&)|,/g, '_')}`;
  //                   const customerProductDetail = `${customerOrder.Product.brand} ${customerOrder.Product.blend} ${customerOrder.Product.treatment} `;

  //                   tableData.push({
  //                     customer: `"${item.name}"`,
  //                     purchaseOrder: `#PO${purchaseOrder.id}`,
  //                     productDetail: customerProductDetail.replace(/(^\&)|,/g, '_'),
  //                     orderQty: customerOrder.orderQty,
  //                     qtyDelivered: parseFloat(deliveredAmount || 0).toFixed(2),
  //                     qtyRemaining: parseFloat(customerOrder.orderQty).toFixed(2) - deliveredAmount.toFixed(2),
  //                     type: 'Non Bayer(seed company product)',
  //                   });
  //                 });
  //             }

  //             // customers monsanto product
  //             purchaseOrder.CustomerMonsantoProducts.filter(
  //               (item) => item.isSent !== false && item.orderQty > 0 && item.isDeleted == false,
  //             ).forEach((order) => {
  //               if (seedCompanyId !== 'all') {
  //                 if (order.MonsantoProduct.seedCompanyId != seedCompanyId) return;
  //               }

  //               const deliveredData =
  //                 deliveryReceipts &&
  //                 deliveryReceipts
  //                   .filter((d) => d.purchaseOrderId === order.purchaseOrderId)
  //                   .map((dd) =>
  //                     dd.DeliveryReceiptDetails.filter((drd) => drd.customerMonsantoProductId === order.id).reduce(
  //                       (acc, detail) => acc + parseFloat(detail.amountDelivered),
  //                       0,
  //                     ),
  //                   );

  //               // if (MONSANTO_SEED_TYPES[order.MonsantoProduct.classification] !== productType.toUpperCase()) return;
  //               const productDetail = order.MonsantoProduct.productDetail
  //                 ? order.MonsantoProduct.productDetail
  //                 : `${order.MonsantoProduct.blend} ${order.MonsantoProduct.seedSize} ${order.MonsantoProduct.brand} ${order.MonsantoProduct.packaging} ${order.MonsantoProduct.treatment}`;
  //               const deliveredAmount = deliveredData.reduce((partialSum, a) => partialSum + a, 0);
  //               tableData.push({
  //                 customer: `"${item.name}"`,
  //                 purchaseOrder: `#PO${purchaseOrder.id}`,
  //                 productDetail,
  //                 orderQty: order.orderQty,
  //                 qtyDelivered: parseFloat(deliveredAmount || 0).toFixed(2),
  //                 qtyRemaining: parseFloat(order.orderQty).toFixed(2) - (deliveredAmount || 0).toFixed(2),
  //                 type: 'Bayer',
  //               });
  //             });
  //           },
  //         );
  //       }
  //     });

  //   csvData += headers.join(',');
  //   csvData += '\n';
  //   tableData.forEach((product) => {
  //     const row = [
  //       product.customer,
  //       product.purchaseOrder,
  //       product.type,
  //       product.productDetail,
  //       product.orderQty,
  //       product.qtyDelivered,
  //       product.qtyRemaining,
  //     ];
  //     csvData += row.join(',');
  //     csvData += '\n';
  //   });

  //   // downloadCSV(csvData, `seedWareHouseReport`);
  //   this.setState({
  //     seedCsvData: csvData,
  //     seedListData: tableData,
  //   });
  // };

  reload = async () => {
    await this.props.listCustomers(true);

    await this.setState({ customers: this.props.customers });
    await this.setCustomerTableColumn();
    await this.props.listPayments(true);
  };
  refreshCustomerData = async (pageNo, pageSize, filterValue) => {
    const url =
      pageNo || pageSize
        ? filterValue
          ? `customers?page=${pageNo}&size=${pageSize}&filter=${filterValue}`
          : `customers?page=${pageNo}&size=${pageSize}`
        : `customers`;
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/${url}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        if (response.data) {
          try {
            const cust = response.data.customersdata;
            this.setState({ customers: cust, totalPages: response.data.totalPages });
          } catch (e) {
            console.log(e);
          }
        }
      });
  };

  componentDidUpdate(prevProps) {
    if (prevProps.customers.length !== this.props.customers.length) {
      this.createCustomerDone();
    }
  }

  searchCustomer = async () => {
    await this.setState({ isSearchData: true });
    await this.props.searchCustomers(serchCustomer);
    await this.setState({ customers: this.props.customers });
    if (this.props.customers.length == 0) {
      this.setState({ showSnackBar: true, messageForSnackBar: 'No Result Found For Serach Customer' });
    }
    console.log(this.props.customers.length);
    await this.setCustomerTableColumn();
    this.setState({ isSearchData: false });
  };
  getDownloadReportList = async () => {
    axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        if (response.data) {
          const cust = response.data.customersdata;
          this.setState({ allCustomerData: response.data.customersdata });
        } else {
          console.log('nope respose: ', response);
        }
      });
  };

  setCustomerTableColumn() {
    const { showDeliveriesList } = this.state;
    this.setState({
      isLoad: true,
    });

    const customerTableColumns = [
      {
        Header: 'Customer',
        show: true,
        id: 'customer',

        sortMethod: (a, b) => {
          return a.name.localeCompare(b.name);
        },
        sortable: true,
        accessor: (d) => d,
        Cell: (props) => {
          const { classes } = this.props;
          const customer = props.value;
          return (
            <div style={{ cursor: 'pointer' }}>
              <Tooltip title="View Custom Details">
                <p
                  onClick={() => {
                    this.handleViewCustomerDialogOpen();
                    this.setState({ viewCustomer: customer });
                  }}
                  id={customer.name}
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
        show: showDeliveriesList ? false : true,
        id: 'quote',

        sortable: true,
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
        width: 350,
        sortable: true,
        accessor: (d) => d,
        Cell: (props) => {
          const { classes } = this.props;
          const customer = props.value;
          let tableDatas = [];
          const purchaseOrders = customer.PurchaseOrders
            ? customer.PurchaseOrders.filter((po) => !po.isQuote && !po.isArchive)
            : null;
          const { amount, purchaseOrderAmount } = this.getPaymentTotal(customer);

          customer &&
            customer.PurchaseOrders &&
            customer.PurchaseOrders.length > 0 &&
            customer.PurchaseOrders.filter((s) => s.isQuote === false && !s.isArchive).map((purchaseOrder) => {
              const total = purchaseOrderAmount.find((_amount) => _amount.purchaseOrderId === purchaseOrder.id);

              let balanceDue = total ? total.orderAmount : 0.0;

              tableDatas.push({
                purchaseOrderId: purchaseOrder.id,

                balanceDue: parseFloat(balanceDue || 0.0).toFixed(2),
              });
            });

          const needsPurchaseOrder = purchaseOrders ? purchaseOrders.length : 0;
          return (
            <div style={{ display: 'flex' }}>
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
                  this.getPurchaseOrderLinks(customer.id, purchaseOrders, tableDatas, customer)
                )}
              </div>
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
      //           to={`/app/customers/${customer.id}/statement/${statement.id}`}
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
        Header: 'Grower Balance Due',
        headerStyle: { textAlign: 'center' },
        show: true,
        id: 'payments',
        sortMethod: (a, b) => {
          const { amount1 } = this.getPaymentTotal(a);
          const { amount2 } = this.getPaymentTotal(b);
          return parseFloat(amount1) - parseFloat(amount2);
        },
        sortable: true,
        accessor: (d) => d,
        Cell: (props) => {
          const { classes, payments } = this.props;
          const customer = props.value;

          const { amount, purchaseOrderAmount } = this.getPaymentTotal(customer);

          if (this.state.isLoad === true) {
            return (
              <div class="snippet" data-title=".dot-flashing">
                <div class="stage">
                  <div class="dot-flashing"></div>
                </div>
              </div>
            );
          } else {
            return (
              <div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    id="balanceDue"
                    simple={true}
                    color="primary"
                    className={`${classes.createQT} hide-print`}
                    data-test-id="balanceDue"
                    style={{ color: '#2F2E2E', fontSize: '.875rem', fontWeight: 300, display: 'flex' }}
                    onClick={() => this.handleViewPaymentsDialogOpen(customer)}
                  >
                    {amount || 0.0}{' '}
                    {/* <p style={{ display: 'contents' }}>{poBalanceData.length > 1 && ' : TotalBalanceDue'}</p> */}
                  </Button>
                </div>
              </div>
            );
          }
        },
      },
      {
        Header: 'Bayer GPOS Sync',
        show: showDeliveriesList && this.props.isapiSeedCompanies,
        id: 'syncStatus',
        sortMethod: (a, b) => {
          return parseFloat(a.props.children) - parseFloat(b.props.children);
        },
        sortable: true,
        accessor: (d) => d,
        Cell: (props) => {
          const { classes } = this.props;
          const customer = props.value;

          return (
            <div style={{ cursor: 'pointer' }}>
              <div>
                {customer.isSynce == 'UnSynced' ? (
                  <div style={{ display: 'flex' }}>
                    <p>UnSynced</p>
                    <Tooltip title="Bayer delivery has not been synced yet">
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
                  customer.isSynce
                )}
              </div>
            </div>
          );
        },
      },
      {
        Header: (
          <p id="BayerDeliveryStatus" style={{ display: 'contents' }}>
            Bayer-DeliveryStatus
          </p>
        ),
        show: showDeliveriesList && this.props.isapiSeedCompanies,
        id: 'bayerPendingQty',
        sortMethod: (a, b) => {
          return parseFloat(a.props.children) - parseFloat(b.props.children);
        },
        sortable: true,
        accessor: (d) => d,
        Cell: (props) => {
          const { classes } = this.props;
          const customer = props.value;

          return (
            <div style={{ cursor: 'pointer' }}>
              <div>
                {customer.bayerDeliveryStatus === false ? (
                  <div style={{ display: 'flex' }}>
                    <p>Units remaining to be delivered</p>
                  </div>
                ) : (
                  'No Units for delivery'
                )}
              </div>
            </div>
          );
        },
      },
      {
        Header: (
          <p id="NonBayerDeliveryStatus" style={{ display: 'contents' }}>
            NonBayer-DeliveryStatus
          </p>
        ),
        show: showDeliveriesList,
        id: 'nonBayerPendingQty',
        sortMethod: (a, b) => {
          return parseFloat(a.props.children) - parseFloat(b.props.children);
        },
        sortable: true,
        accessor: (d) => d,
        Cell: (props) => {
          const { classes } = this.props;
          const customer = props.value;

          return (
            <div style={{ cursor: 'pointer' }}>
              <div>
                {customer.nonBayerDeliveryStatus === false ? (
                  <div style={{ display: 'flex' }}>
                    <p>Units remaining to be delivered </p>
                  </div>
                ) : (
                  'No Units for delivery'
                )}
              </div>
            </div>
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
    setTimeout(() => {
      this.setState({
        isLoad: false,
      });
    }, 500);
  }
  showDeliveryRow = async () => {
    this.setState({ showDeliveriesList: !this.state.showDeliveriesList });
    await this.refreshCustomerData();

    this.setCustomerTableColumn();
  };
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

    let amount = '--';
    let purchaseOrderAmount = [];

    if (!customer.PurchaseOrders || !customer.PurchaseOrders.length) {
      amount = '--';
      purchaseOrderAmount = [];
    } else if (customerProducts.length < 1 && customerCustomProducts.length < 1 && customerMonsantoProduct.length < 1) {
      amount = '--';
      purchaseOrderAmount = [];
    }
    if (customer.PurchaseOrders) {
      const purchaseOrders =
        customer.PurchaseOrders && customer.PurchaseOrders.filter((_purchaseOrder) => !_purchaseOrder.isQuote);
      if (!purchaseOrders.length) {
        amount = '--';
        purchaseOrderAmount = [];
      } else {
        let totalPurchaseOrderAmount = 0,
          orderAmount = 0,
          totalPaymentAmount = 0;
        // const filterByCustomer = (product) => product.customerId === customer.id;
        // const orders = customerProducts.filter(filterByCustomer);
        // const customOrders = customerCustomProducts.filter(filterByCustomer);

        purchaseOrders.forEach((purchaseOrder) => {
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
          // // const orderTotals = getOrderTotals({
          // //   customerOrder,
          // //   shareholder: null,
          // //   purchaseOrder,
          // //   products,
          // //   customProducts,
          // //   dealerDiscounts,
          // // });
          // // orderTotals.forEach((orderTotal) => {
          // //   totalPurchaseOrderAmount += orderTotal.total;
          // //   orderAmount += orderTotal.total;
          // // });

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

                msrp =
                  msrp !== null ? (typeof JSON.parse(msrp) === 'number' ? msrp : Object.values(JSON.parse(msrp))) : 0;

                preTotal = order.orderQty * parseFloat(msrp !== null ? msrp : 0);

                preTotal = preTotal.toFixed(2);
                product = order.MonsantoProduct;
              }

              const discountsPOJO =
                order.discounts &&
                order.discounts.length > 0 &&
                order.discounts
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

              const total = (preTotal === NaN ? 0.0 : preTotal || 0) - discountAmount;
              totalamount += total;
            });

          const perWholeOrderDiscounts = this.props.dealerDiscounts.filter(
            (discount) => discount.applyToWholeOrder === true,
          );
          const { orderTotal: orderWholeTotal, orderDiscountsAmount: orderWholeDiscountsAmount } =
            perWholeOrderDiscount(totals.subTotal, totals.quantity, purchaseOrder, perWholeOrderDiscounts);
          totalPurchaseOrderAmount += totalamount - orderWholeDiscountsAmount;

          purchaseOrderAmount.push({
            purchaseOrderId: purchaseOrder.id,
            orderAmount: totalamount - totalPaymentAmount - orderWholeDiscountsAmount,
          });
        });

        amount = numberToDollars(totalPurchaseOrderAmount - totalPaymentAmount);
      }
    }

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
  pageChange = async (pageIndex) => {
    this.setState({ pageIndex: pageIndex });
    await this.refreshCustomerData(pageIndex, this.state.pageSize);
  };

  pageSizeChange = async (pageSize, pageIndex) => {
    this.setState({ pageSize: pageSize });
    await this.refreshCustomerData(pageIndex, pageSize);
  };
  createCustomerDone = async () => {
    const { removeRecentCreatedCustomer, recentCreatedCustomerMetaId } = this.props;
    await this.reload();
    await this.refreshCustomerData(this.state.pageIndex, this.state.pageSize);
    this.setCustomerTableColumn();
  };

  getPurchaseOrderLinks(customerId, purchaseOrders, tableDatas, customer) {
    const { classes } = this.props;

    return (
      <React.Fragment>
        {this.state.showNotSyncedPO
          ? purchaseOrders
              .sort((a, b) => a.id - b.id)
              .map((po) => {
                const balace = tableDatas.filter((d) => d.purchaseOrderId === po.id)[0];

                return (
                  <div key={po.id}>
                    {po.CustomerMonsantoProducts.filter(
                      (order) => order.isSent == false && parseFloat(order.orderQty) >= 0 && order.isDeleted == false,
                    ).length > 0 ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px' }}>
                          <a
                            key={po.id}
                            href={`/app/customers/${customerId}/purchase_order/${po.id}`}
                            className={classes.linkQT}
                          >
                            <p style={{ display: 'flex' }}>
                              <Tooltip title="Product haven't synced to Bayer yet">
                                <WarningIcon
                                  style={{
                                    color: 'gold',

                                    fontSize: '20',
                                  }}
                                />
                              </Tooltip>
                              PO#{po.id} {po.name ? '(' + po.name + ')' : ''}
                            </p>
                          </a>

                          <p
                            onClick={() => this.handleViewPaymentsDialogOpen(customer, po.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            {' '}
                            {numberToDollars(balace.balanceDue)}
                          </p>
                        </div>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                );
              })
          : purchaseOrders
              .sort((a, b) => a.id - b.id)
              .map((po) => {
                const balace = tableDatas.filter((d) => d.purchaseOrderId === po.id)[0];

                return (
                  <div key={po.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px' }}>
                      <a
                        href={`/app/customers/${customerId}/purchase_order/${po.id}`}
                        className={classes.linkQT}
                        key={po.id}
                      >
                        <p style={{ marginRight: '5px', display: 'flex' }}>
                          {' '}
                          {po.CustomerMonsantoProducts.filter(
                            (order) =>
                              order.isSent == false && parseFloat(order.orderQty) >= 0 && order.isDeleted == false,
                          ).length > 0 ? (
                            <Tooltip title="Product haven't synced to Bayer yet">
                              <WarningIcon
                                style={{
                                  color: 'gold',

                                  fontSize: '20',
                                }}
                              />
                            </Tooltip>
                          ) : (
                            ''
                          )}
                          PO#{po.id} {po.name ? '(' + po.name + ')' : ''}
                        </p>
                      </a>

                      <p
                        onClick={() => this.handleViewPaymentsDialogOpen(customer, po.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        {' '}
                        {numberToDollars(balace.balanceDue)}
                      </p>
                    </div>
                  </div>
                );
              })}
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
              <Link key={quote.id} to={`/app/customers/${customerId}/quote/${quote.id}`} className={classes.linkQT}>
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

  handleViewPaymentsDialogOpen = (customer, poID) => {
    this.setState({
      showViewPaymentDialog: (
        <ViewPaymentsDialog
          open={true}
          onClose={this.handleViewPaymentsDialogClose}
          classes={this.props.classes}
          customer={customer}
          poID={poID}
        />
      ),
    });
  };

  handleViewPaymentsDialogClose = (customer, payments) => {
    this.setState({ showViewPaymentDialog: null });
  };

  handleSearchTextChange = async (event) => {
    this.setState({ searchText: event.target.value });
    serchCustomer = event.target.value;
    if (event.target.value == '') {
      await this.refreshCustomerData(this.state.pageIndex, this.state.pageSize);
    }
  };

  handleAddNewMenuToggle = async () => {
    this.setState((state) => ({ addNewMenuOpen: !state.addNewMenuOpen }));
  };

  handleAddNewMenuClose = (event) => {
    this.setState({ addNewMenuOpen: false });
  };

  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));

    this.getDownloadReportList();
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

  handleViewCsvDialogOpen = () => {
    this.setState({ showViewCsvDialog: true });
  };
  handleViewCsvDialogClose = () => {
    this.setState({ showViewCsvDialog: false });
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

      updatetemplateData: {
        farmId: item.farmId,
        farmName: item.farmName,
        orderName: item.orderName,
        shareHolderData: item.shareHolderData,
      },
    });
  };

  handleTableItemActionMenuClose = () => {
    this.setState({ tableItemActionMenuOpen: false, activeTableItem: null, updatetemplateData: {} });
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
    const currentApiSeedCompany = this.props.apiSeedCompanies.filter(
      (item) => parseInt(item.organizationId) === parseInt(this.props.organizationId),
    )[0];
    const bayerGlnID = currentApiSeedCompany && currentApiSeedCompany.glnId ? currentApiSeedCompany.glnId : '';
    reader.onload = async function (event) {
      const abc = await createCustomersFromCSV(event.target.result, bayerGlnID);
      this.setState({ showImportCsvFailed: abc });
    }.bind(this);
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

  syncAllGPOS = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/monsanto/syncAllGPOS`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((res) => {
        console.log(res.data, 'rwes');
        this.setState({ messageForSnackBar: res.data.success, showSnackBar: true });
        this.handleAddNewMenuClose;
      })
      .catch((e) => {
        console.log(e, 'e');
      });
  };
  componentDidUpdate = async (prevProps) => {
    if (!serchCustomer && prevProps.customers.length !== this.props.customers.length) {
      await this.refreshCustomerData(this.state.pageIndex, this.state.pageSize);
    }
  };

  closeBanner = async () => {
    await axios
      .patch(
        `${process.env.REACT_APP_API_BASE}/bannerMsg`,
        { updatedAt: new Date() },
        {
          headers: { 'x-access-token': localStorage.getItem('authToken') },
        },
      )
      .then((res) => {
        // res.data && this.setState({ bannerData: res.data });
      })
      .catch((e) => {
        console.log(e, 'e');
      });
  };

  handleListChange = (name, id) => (event) => {
    const data = this.state.updatetemplateData;

    if (id !== undefined) {
      const currentdata = data.shareHolderData.map((obj) => {
        if (obj.shareholderId == id) {
          return { ...obj, [name]: event.target.value };
        }

        return obj;
      });

      data['shareHolderData'] = currentdata;
    } else {
      data[name] = event.target.value;
    }

    this.setState({ updatetemplateData: data });
  };

  render() {
    const {
      classes,
      customers,
      listShareholders,
      updateShareholder,
      shareholders,
      imported,
      backupCustomersHistory,
      organizationId,
      totalItemsOfCustomers,
    } = this.props;
    const {
      archiveCustomerConfirm,
      isSearchData,
      addNewMenuOpen,
      bannerData,
      moreFuncMenuOpen,
      showCreateCustomerDialog,
      showViewCustomerDialog,
      showAddQuoteDialog,
      showViewCsvDialog,
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
      customerSearchString,
      searchText,
      discountReportsList,
      showImportCsvFailed,
      pageIndex,
      showDeliveriesList,
      filterValue,
      totalPages,
      templateList,
      activeTableItem,
      updateList,
      updatetemplateData,
      showSnackBar,
      messageForSnackBar,
    } = this.state;

    if (this.isLoading) {
      return <CircularProgress />;
    }
    if (imported) {
      window.location.reload();
    }

    let customerss;
    customerss = this.state.customers.filter((c) => c.isArchive == false && c.name !== 'Bayer Dealer Bucket');

    if (showNotSyncedPO) {
      const cids = [];
      customerss.map((c) => {
        c.PurchaseOrders.length > 0 &&
          c.PurchaseOrders.filter((o) => o.isQuote === false).map((order) => {
            if (
              order.CustomerMonsantoProducts.length > 0 &&
              order.CustomerMonsantoProducts.filter(
                (oo) => oo.isSent == false && parseFloat(oo.orderQty) >= 0 && oo.isDeleted === false,
              ).length > 0
            ) {
              if (!cids.includes(c.id)) {
                return cids.push(c.id);
              }
            }
          });
      });

      customerss = this.state.customers.filter((c) => c.name !== 'Bayer Dealer Bucket' && cids.includes(c.id));
    }
    const vertical = 'top';
    const horizontal = 'right';
    return (
      <div>
        {bannerData.length > 0 && (
          <div className={classes.bannerContainer}>
            <h5>{bannerData[0].bannerText}</h5>
            <CloseIcon onClick={this.closeBanner} />
          </div>
        )}

        <div className={classes.cardHeaderContent}>
          <div style={{ display: 'flex' }}>
            <h3 className={classes.cardIconTitle}>Customers</h3>{' '}
          </div>
          <div className={`${classes.cardHeaderActions} hide-print`}>
            <TextField
              className={`${classes.searchField} hide-print`}
              margin="normal"
              placeholder="Search"
              value={serchCustomer}
              onChange={this.handleSearchTextChange}
            />

            <Button
              className={`${classes.iconButton} hide-print`}
              variant="outlined"
              color="primary"
              onClick={this.searchCustomer}
            >
              <SearchIcon />
            </Button>
            {isSearchData && <CircularProgress style={{ width: '25px', marginRight: '10px', height: '-3px' }} />}
            <Button
              id="customerDot"
              className={`${classes.iconButton} hide-print`}
              variant="contained"
              color="primary"
              align="right"
              buttonRef={(node) => {
                this.moreFuncMenuAnchorEl = node;
              }}
              onClick={this.handleMoreFuncMenuToggle}
            >
              <MoreHorizontalIcon />
            </Button>

            <Button
              id="addNewCustomer"
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

            {/* <Button variant="contained" className={`${classes.addCustomerButton} hide-print`} color="primary">
              <CSVLink data={discountReportsList} style={{ color: 'white' }}>
                Download Discount Report
              </CSVLink>
            </Button> */}
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
                  id="createCustomer"
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.handleCreateCustomerDialogOpen();
                    this.handleAddNewMenuClose();
                  }}
                >
                  Customer
                </MenuItem>
                <MenuItem
                  id="createPO"
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.handleAddNewPurchaseOrderDialogOpen();
                    this.handleAddNewMenuClose();
                  }}
                >
                  Purchase Order
                </MenuItem>
                <MenuItem
                  id="createQuote"
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.handleAddNewQuoteDialogOpen();
                    this.handleAddNewMenuClose();
                  }}
                >
                  Quote
                </MenuItem>
              </MenuList>
            </Paper>
          </Popover>
          <Popover
            className="hide-print"
            open={moreFuncMenuOpen}
            anchorEl={this.moreFuncMenuAnchorEl}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            onClose={this.handleMoreFuncMenuClose}
          >
            <Paper>
              <MenuList>
                {/* <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.print();
                  }}
                >
                  Print
                </MenuItem> */}
                {/* <MenuItem
                  id="dowanloadCust"
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.props.history.push(`/app/csv_preview/CustomerReport`);
                  }}
                >
                  Download Customer Data (CSV)
                </MenuItem> */}
                <MenuItem className={classes.addNewMenuItem} onClick={this.openCSVFileDialog} id="importCustCsv">
                  <input
                    name="upload"
                    type="file"
                    onChange={(e) => {
                      this.importCustomersCSV(e);
                      this.handleMoreFuncMenuClose();
                    }}
                    ref={this.csvFileInput}
                    className={classes.csvFileInput}
                  />
                  Import Customers CSV
                </MenuItem>
                <MenuItem
                  className={classes.addNewMenuItem}
                  id="syncAllPo"
                  onClick={() => this.props.history.push(`/app/purchaseOrder/syncAll`)}
                >
                  Sync All PurchaseOrder
                </MenuItem>
                <MenuItem className={classes.addNewMenuItem} id="syncAllPo" onClick={() => this.syncAllGPOS()}>
                  Sync All GPOS
                </MenuItem>
                <MenuItem
                  className={classes.addNewMenuItem}
                  id="addGrower"
                  onClick={() => this.props.history.push(`/app/customers/addCustomer`)}
                >
                  Search Bayer Grower
                </MenuItem>
                <MenuItem
                  className={classes.addNewMenuItem}
                  id="showArchivedCustomer"
                  onClick={() => this.setState({ openArchivedModel: true })}
                >
                  Show Archived Customers
                </MenuItem>
                <MenuItem
                  className={classes.addNewMenuItem}
                  id="templateList"
                  onClick={() => this.setState({ openTemplateModel: true })}
                >
                  Template List
                </MenuItem>
                {/* <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => this.props.history.push(`/app/csv_preview/DiscountReport`)}
                >
                  Download Discount Report
                  {/* <CSVLink
                    data={sortBy(discountReportsList, (o) => o && o.CustomerName) || []}
                    style={{ color: '#2F2E2E' }}
                    id="downloadDisReport"
                    filename={`discountReport-${organizationId}.csv`}
                  ></CSVLink> 
                </MenuItem> */}
                <MenuItem className={classes.addNewMenuItem} onClick={() => this.exportTemplateCsv()}>
                  Download Template CSV File
                </MenuItem>
                {/* <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => this.props.history.push(`/app/bayer_orders_preview/all`)}
                  id="seedWareHouseReport"
                >
                  Download Seed Warehouse Report [PDF]
                </MenuItem> */}

                {/* <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={async () => {
                    await this.exportSeedWarehouseReport('all');
                    this.props.history.push({
                      pathname: `/app/csv_preview/SeedWareHouseReport`,
                      state: { csvdata: this.state.seedCsvData, seedList: this.state.seedListData },
                    });
                  }}
                  id="DownalodSeedWareHouseReport"
                >
                  Download Seed Warehouse Report
                </MenuItem> */}
                {/* dev@agridealer.com */}
                {localStorage.getItem('userEmail') === 'dev@agridealer.com' && (
                  <MenuItem
                    className={classes.addNewMenuItem}
                    onClick={async () => {
                      await axios
                        .get(`${process.env.REACT_APP_API_BASE}/backup_data/transferLog`, {
                          headers: { 'x-access-token': localStorage.getItem('authToken') },
                        })
                        .then((response) => {
                          // response;
                          console.log(response, 'response');
                          this.props.history.push({
                            pathname: `/app/csv_preview/TransferLog`,
                            state: { csvdata: [], seedList: response.data },
                          });
                        });
                    }}
                  >
                    View Transfer Logs
                  </MenuItem>
                )}
              </MenuList>
            </Paper>
          </Popover>
        </div>
        <Card>
          {/* {this.props.customerMonsantoProduct.length > 0 ? ( */}
          <FormControl style={{ marginLeft: 20 }}>
            <FormControlLabel
              control={<Checkbox value={showNotSyncedPO} onChange={this.handleShowNotSyncedPO} />}
              label="Show Unsynced Bayer Purchase Orders"
            />
          </FormControl>
          {/* )  */}
          <span style={{ marginLeft: 20, color: 'red' }}>
            {showImportCsvFailed.length > 0
              ? showImportCsvFailed.toString() + " these customers couldn't connect with Bayer "
              : ''}
          </span>

          <CardBody className={classes.cardBody}>
            <div style={{ display: 'flex' }}>
              <FormControl>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="showDeliveries"
                      color="primary"
                      checked={showDeliveriesList}
                      value={showDeliveriesList}
                      onChange={this.showDeliveryRow}
                    />
                  }
                  label="Show Deliveries"
                />
              </FormControl>
              {showDeliveriesList && (
                <div>
                  <FormControlLabel
                    value="notSyncedBayerDeliveryReceipt"
                    control={<Radio id="notSyncedBayerDeliveryReceipt" color="primary" />}
                    label="Not Synced Bayer DeliveryReceipt"
                    style={{ marginRight: 40 }}
                    checked={filterValue === 'notSyncedBayerDeliveryReceipt'}
                    onChange={this.handleFilterChange}
                  />
                  <FormControlLabel
                    value="unDeliveredBayerProducts"
                    control={<Radio id="unDeliveredBayerProducts" color="primary" />}
                    label="UnDelivered BayerProducts"
                    style={{ marginRight: 40 }}
                    checked={filterValue === 'unDeliveredBayerProducts'}
                    onChange={this.handleFilterChange}
                  />
                  <FormControlLabel
                    value="unDeliveredNonBayerProducts"
                    control={<Radio id="unDeliveredNonBayerProducts" color="primary" />}
                    label="UnDelivered NonBayer Products"
                    style={{ marginRight: 40 }}
                    checked={filterValue === 'unDeliveredNonBayerProducts'}
                    onChange={this.handleFilterChange}
                  />
                </div>
              )}
            </div>

            <ReactTable
              data={customerss.sort((a, b) => a.name.localeCompare(b.name))}
              columns={customerTableColumns}
              minRows={1}
              resizable={false}
              showPagination={true}
              manual
              // sorted={tableSorted}

              page={pageIndex}
              // pageSize={totalItemsOfCustomers > 20 ? 20 : totalItemsOfCustomers}
              // pageSize={customerss.length || 0}
              pageSize={this.state.pageSize}
              getTrProps={this.getTableRowProps}
              onPageChange={this.pageChange}
              pages={totalPages ? totalPages : this.props.totalPages}
              onPageSizeChange={this.pageSizeChange}
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

          {this.state.openArchivedModel && (
            <Dialog
              open={this.state.openArchivedModel}
              // TransitionComponent={Transition}
              minWidth={'800px'}
              maxWidth={'1000px'}
            >
              <DialogTitle className={classes.dialogTitle}>
                <div className={classes.dialogHeader}>
                  <h5>List Of Archived Customer</h5>
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      this.setState({ openArchivedModel: false });
                    }}
                    aria-label="Close"
                    id="close"
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              </DialogTitle>
              <Divider />

              <DialogContent>
                {this.state.customers
                  .filter((c) => c.isDeleted == false && c.isArchive == true)
                  .map((c) => {
                    return (
                      <React.Fragment>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{c.name}</span>
                          <IconButton
                            aria-label="delete"
                            onClick={this.handleTableItemActionMenuOpen(c)}
                            id="ArchivedCust"
                          >
                            <MoreHorizontalIcon fontSize="small" />
                          </IconButton>
                        </div>
                      </React.Fragment>
                    );
                  })}

                <Popover
                  open={tableItemActionMenuOpen}
                  anchorEl={tableItemActionAnchorEl}
                  anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                  transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                  onClose={this.handleTableItemActionMenuClose}
                >
                  <Paper>
                    <MenuList>
                      <MenuItem
                        className={classes.addNewMenuItem}
                        id="unArchived"
                        onClick={(e) => {
                          this.props
                            .updateCustomer(this.state.activeTableItem.id, {
                              isArchive: false,
                            })
                            .then(async (res) => {
                              if (res && res.payload) {
                                await this.refreshCustomerData(0, this.state.pageSize);
                                this.handleTableItemActionMenuClose();
                              }
                            })
                            .catch((e) => {
                              console.log(e);
                            });
                        }}
                      >
                        UnArchived
                      </MenuItem>
                    </MenuList>
                  </Paper>
                </Popover>
              </DialogContent>
            </Dialog>
          )}

          {this.state.openTemplateModel && (
            <Dialog open={this.state.openTemplateModel} fullWidth={true} maxWidth="md">
              <DialogTitle className={classes.dialogTitle}>
                <div className={classes.dialogHeader}>
                  <h5>List Of Templete of AdvanceOrder</h5>
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      this.setState({ openTemplateModel: false });
                    }}
                    aria-label="Close"
                    id="close"
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              </DialogTitle>
              <Divider />

              <DialogContent>
                <ReactTable
                  data={templateList}
                  columns={[
                    {
                      Header: 'Farm Name',

                      show: true,
                      width: 200,

                      id: 'farmName',
                      accessor: (d) => d,
                      Cell: (props) => {
                        const c = props.value;
                        return <span>{c.farmName}</span>;
                      },
                    },
                    {
                      Header: 'Order Name',

                      show: true,
                      width: 200,

                      id: 'orderName',
                      accessor: (d) => d,
                      Cell: (props) => {
                        const c = props.value;

                        return <span>{c.farmName}</span>;
                      },
                    },
                    {
                      Header: 'shareHolders',
                      // headerStyle: { textAlign: 'center' },
                      show: true,
                      id: 'shareHolders',
                      width: 300,
                      accessor: (d) => d,
                      Cell: (props) => {
                        const c = props.value;
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {' '}
                            {c.shareHolderData.length > 0 &&
                              c.shareHolderData.map((s) => (
                                <span>
                                  {s.name} - {s.percentage}
                                </span>
                              ))}
                          </div>
                        );
                      },
                    },
                    {
                      Header: '',

                      show: true,
                      id: 'Action',
                      accessor: (d) => d,
                      Cell: (props) => {
                        return (
                          <IconButton
                            aria-label=""
                            onClick={this.handleTableItemActionMenuOpen(props.value)}
                            id="ArchivedCust"
                          >
                            <MoreHorizontalIcon fontSize="small" />
                          </IconButton>
                        );
                      },
                    },
                  ]}
                  showPagination={false}
                ></ReactTable>

                <Popover
                  open={tableItemActionMenuOpen}
                  anchorEl={tableItemActionAnchorEl}
                  anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                  transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                  onClose={this.handleTableItemActionMenuClose}
                >
                  <Paper>
                    <MenuList>
                      <MenuItem
                        className={classes.addNewMenuItem}
                        id="deleteList"
                        onClick={async (e) => {
                          await axios
                            .get(
                              `${process.env.REACT_APP_API_BASE}/purchase_orders/orderTemplate/${this.state.activeTableItem.id}`,
                              {
                                headers: { 'x-access-token': localStorage.getItem('authToken') },
                              },
                            )
                            .then((res) => {
                              this.setState({ templateList: res.data.data });
                            })
                            .catch((e) => {
                              console.log(e, 'e');
                            });
                          await this.getTemplateList();
                        }}
                      >
                        Delete
                      </MenuItem>
                      <MenuItem
                        className={classes.addNewMenuItem}
                        id="updateList"
                        onClick={(e) => {
                          this.setState({ updateList: true });
                        }}
                      >
                        Update
                      </MenuItem>
                    </MenuList>
                  </Paper>
                </Popover>
              </DialogContent>
            </Dialog>
          )}

          {updateList && updatetemplateData !== null && (
            <Dialog open={updateList} fullWidth={true} maxWidth="md">
              <DialogTitle className={classes.dialogTitle}>
                <div className={classes.dialogHeader}>
                  <h5>Update Templete of AdvanceOrder</h5>
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      this.setState({ updateList: false });
                    }}
                    aria-label="Close"
                    id="close"
                  >
                    <CloseIcon />
                  </IconButton>
                </div>
              </DialogTitle>
              <Divider />

              <DialogContent>
                <div style={{ display: 'flex' }}>
                  <FormControl className={classes.lotGridItemWidth2} style={{ marginRight: '30px' }}>
                    <InputLabel htmlFor="FarmName" shrink>
                      FarmName
                    </InputLabel>
                    <CustomInput
                      id={'FarmName'}
                      formControlProps={{
                        fullWidth: true,
                        classes: { root: classes.textItemStyles },
                      }}
                      inputProps={{
                        value: updatetemplateData.farmName,
                        classes: { root: classes.itemWidth },
                        name: 'FarmName',
                        onChange: this.handleListChange('farmName'),
                      }}
                    />
                  </FormControl>
                  <FormControl className={classes.lotGridItemWidth2} style={{ marginRight: '30px' }}>
                    <InputLabel htmlFor="OrderName" shrink>
                      OrderName
                    </InputLabel>
                    <CustomInput
                      id={'OrderName'}
                      formControlProps={{
                        fullWidth: true,
                        classes: { root: classes.textItemStyles },
                      }}
                      inputProps={{
                        value: updatetemplateData.orderName,
                        classes: { root: classes.itemWidth },
                        name: 'OrderName',
                        onChange: this.handleListChange('orderName'),
                      }}
                    />
                  </FormControl>
                  <div>
                    {updatetemplateData.shareHolderData.length > 0 &&
                      updatetemplateData.shareHolderData.map((d) => {
                        return (
                          <div style={{ display: 'flex' }}>
                            <FormControl className={classes.lotGridItemWidth2} style={{ marginRight: '30px' }}>
                              <InputLabel htmlFor="ShareHolderName" shrink>
                                ShareHolderName
                              </InputLabel>
                              <CustomInput
                                id={'ShareHolderName'}
                                formControlProps={{
                                  fullWidth: true,
                                  classes: { root: classes.textItemStyles },
                                }}
                                inputProps={{
                                  value: d.name,
                                  classes: { root: classes.itemWidth },
                                  name: 'ShareHolderName',
                                  onChange: this.handleListChange('name', d.shareholderId),
                                }}
                              />
                            </FormControl>
                            <FormControl className={classes.lotGridItemWidth2} style={{ marginRight: '30px' }}>
                              <InputLabel htmlFor="Percentage" shrink>
                                Percentage
                              </InputLabel>
                              <CustomInput
                                id={'Percentage'}
                                formControlProps={{
                                  fullWidth: true,
                                  classes: { root: classes.textItemStyles },
                                }}
                                inputProps={{
                                  type: 'number',
                                  value: d.percentage,
                                  classes: { root: classes.itemWidth },
                                  name: 'Percentage',
                                  onChange: this.handleListChange('percentage', d.shareholderId),
                                }}
                              />
                            </FormControl>
                          </div>
                        );
                      })}
                  </div>
                </div>
                <Button
                  onClick={async () => {
                    await axios
                      .patch(
                        `${process.env.REACT_APP_API_BASE}/purchase_orders/orderTemplate/${this.state.activeTableItem.id}`,
                        updatetemplateData,
                        {
                          headers: { 'x-access-token': localStorage.getItem('authToken') },
                        },
                      )
                      .then(async (res) => {
                        await this.getTemplateList();

                        this.setState({ updateList: false });
                      })
                      .catch((e) => {
                        this.setState({ updateList: false });
                      });
                  }}
                >
                  Edit
                </Button>
              </DialogContent>
            </Dialog>
          )}
          <Snackbar
            open={showSnackBar}
            autoHideDuration={3000}
            onClose={() => this.setState({ showSnackBar: false })}
            anchorOrigin={{ vertical, horizontal }}
            message={messageForSnackBar}
            key={vertical + horizontal}
            onClick={() => this.setState({ showSnackBar: false })}
          ></Snackbar>
          {showCreateCustomerDialog && (
            // <CreateCustomer
            //   open={showCreateCustomerDialog}
            //   onClose={this.handleCreateCustomerDialogClose}
            //   createCustomerDone={this.createCustomerDone}
            // />
            <ViewCustomer
              listShareholders={listShareholders}
              updateShareholder={updateShareholder}
              shareholders={shareholders}
              open={showCreateCustomerDialog}
              onClose={this.handleCreateCustomerDialogClose}
              customer={''}
              handleViewCustomerArchivePODialogOpen={this.handleViewCustomerArchivePODialogOpen}
              handleViewArchivedDialogOpen={this.handleViewArchivedDialogOpen}
              createCustomerDone={this.createCustomerDone}
              isCreateCust={true}
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
              templateList={templateList}
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
              searchText={searchText}
            />
          )}

          {showViewCsvDialog && (
            <ViewCsv
              open={showViewCsvDialog}
              organizationId={organizationId}
              backupCustomersHistory={backupCustomersHistory}
              onClose={this.handleViewCsvDialogClose}
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
