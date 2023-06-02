import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { debounce } from 'lodash/function';
import { format } from 'date-fns';
import Sortable from 'react-sortablejs';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Link } from 'react-router-dom';
import sweetAlertStyle from '../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';
import ReactTable from 'react-table';

// material-ui icons
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import DragHandle from '@material-ui/icons/DragHandle';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';
import Print from '@material-ui/icons/Print';

// creative tim components
import Table from '../../components/material-dashboard/Table/Table';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';

// core components
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Checkbox from '@material-ui/core/Checkbox';
import Paper from '@material-ui/core/Paper';
import LinearProgress from '@material-ui/core/LinearProgress';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';

// utilities
import {
  isUnloadedOrLoading,
  customerProductDiscountsTotals,
  numberToDollars,
  perWholeOrderDiscount,
} from '../../utilities';
import { getProductName, getProductSeedBrand, getProductFromOrder } from '../../utilities/product.v2';
import { getAppliedDiscounts } from '../../utilities/purchase_order';
import { LoadingStatus } from '../../store/constants';

// components
// import Invoice from './invoice'
import PurchaseOrderDialog from './purchase_order_dialog';
import PurchaseOrderDeliveryDialog from './purchase_order_delivery_dialog';
import PurchaseOrderDeliveryReceiptDialog from './purchase_order_delivery_receipt_dialog';
import ConvertQuoteDialog from './ConvertQuoteDialog';
import PurchaseOrderFarms from './farms_tables';
import FarmFormDialog from './farm_form_dialog';
import AddExistingFarmDialog from './add_existing_farm_dialog';
import Packaging from './packaging.v2';

const styles = Object.assign(
  {
    root: {
      flexGrow: 1,
    },
    nameInput: {
      width: 300,
    },
    selectDropDown: {
      maxHeight: '22.5em',
      overflowY: 'auto',
    },
    purchaseOrderInput: {
      display: 'inline-block',
      paddingRight: 20,
      position: 'relative',
      minWidth: 205,
    },
    createdAt: {
      marginRight: 15,
      fontSize: 12,
    },
    farmHeader: {
      display: 'flex',
      alignItems: 'center',
    },
    utilBtns: {
      display: 'flex',
      justifyContent: 'space-between',
    },
    purchaseOrderInputLabel: {
      position: 'absolute',
      top: -25,
      left: 0,
    },
    discountLabel: {
      minWidth: 300,
      display: 'inline-block',
    },
    discountRowHandle: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
    },
    farmPaper: {
      padding: 10,
      marginTop: 20,
      marginBottom: 50,
    },
    percentagePaper: {
      width: '100%',
    },
    percentageList: {
      margin: 0,
      padding: 0,
      display: 'flex',
      flexWrap: 'wrap',
    },
    shareholderValue: {
      background: '#DDDDDD',
      borderRadius: '11.5px',
      margin: '2px',
      listStyleType: 'none',
      padding: '4px 8px',
      fontSize: 10,
      fontWeight: 600,
    },
    shareholderName: {},
    percentageValue: {
      marginLeft: 5,
    },
    farmFieldShareholderInput: {
      '& div': {
        marginBottom: 0,
      },
    },
    shareholderContainer: {
      maxWidth: 250,
      display: 'inline-block',
      marginRight: 10,
    },
    discountSummaryCard: {
      marginBottom: 20,
    },
    productTypeContainer: {
      '&:first-of-type': {
        borderBottom: '3px solid #ddd',
        marginBottom: 20,
        paddingBottom: 10,
      },
    },
    productTypeMeta: {
      display: 'flex',
      '& *': {
        marginRight: 30,
      },
    },
    newButtonBar: {
      display: 'flex',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    newButtonBarSpacing: {
      flexGrow: 1,
    },
    progressItem: {
      width: 150,
      marginRight: 24,
    },
    progressTitle: {
      marginRight: 8,
    },
    iconButton: {
      background: 'transparent',
      color: 'grey',
      border: '1px solid #38A154',
      padding: 7,
      marginRight: 16,
    },
    tableTotalRow: {
      background: 'rgb(236, 243, 238)',
      padding: '10px 100px',
      textAlign: 'right',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    tableTotalRowLabe: {
      margin: 0,
    },
    tableTotalRowNumber: {
      width: 150,
      margin: 0,
    },
    orderTotalPaper: {
      color: 'white',
      background: 'black',
      padding: '32px 0',
    },
    orderTotalTitle: {
      fontSize: 25,
      lineHeight: '40px',
      paddingLeft: 24,
      borderBottom: '1px solid white',
      margin: 0,
      paddingBottom: 24,
    },
    orderTotalDisplayRow: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      padding: '20px 100px 0 0',
    },
    orderTotalDisplayContainer: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
    },
    orderTotalDisplayLabel: {
      textAlign: 'right',
      margin: 0,
    },
    orderTotalDisplayNumber: {
      width: 150,
      textAlign: 'right',
    },
    moreFuncMenuItem: {
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
    companyBrand: {
      marginBottom: -5,
      color: '#605E5E',
    },
    poSelector: {
      margin: 0,
    },
  },
  sweetAlertStyle,
);

class PurchaseOrder extends Component {
  constructor(props) {
    super(props);

    this.state = {
      subjectName: '',
      seedType: '',
      selectedProduct: null,
      selectedReceipt: null,
      showProductForm: false,
      showDeliveryForm: false,
      showDeliverReceiptDialog: false,
      showConvertDialog: false,
      showAddProductSuccessSnackbar: false,
      purchaseOrder: null,
      editingProduct: null,
      showFarmForm: false,
      showAddExistingFarm: false,
      generatingPDF: false,
      deleteProductConfirm: null,
      deletePurchaseOrderConfirm: null,
      moreFuncMenuOpen: false,
      tableItemActionAnchorEl: null,
      tableItemActionMenuOpen: false,
      activeTableItem: null,
      orderDate: new Date(),
    };

    this.debouncedUpdateName = debounce(this.updateName, 1000);
  }

  componentWillMount() {
    const { match } = this.props;

    let subjectName;
    if (match.path.includes(':customer_id/purchase_order/:id')) {
      subjectName = 'Purchase Order';
    } else if (match.path.includes(':customer_id/quote/:id')) {
      subjectName = 'Quote';
    } else if (match.path.includes(':customer_id/invoice/:id')) {
      subjectName = 'Invoice';
    }
    this.setState({ subjectName });
  }

  componentDidMount() {
    const {
      listCustomers,
      listProducts,
      listDealerDiscounts,
      listAllCustomProducts,
      listPurchaseOrders,
      listDiscountPackages,
      listPackagings,
      listSeedSizes,
      listFarms,
      listShareholders,
      organizationId,
      loadOrganization,
      listProductPackagings,
      listRelatedProducts,
      listRelatedCustomProducts,
      listDeliveryReceipts,
      listPayments,
      match,
    } = this.props;
    const customerId = this.props.match.params.customer_id;

    loadOrganization(organizationId);
    listCustomers();
    listProducts();
    listDealerDiscounts();
    listDiscountPackages();
    listPackagings();
    listSeedSizes();
    listAllCustomProducts();
    listPurchaseOrders();
    listFarms(customerId);
    listShareholders(customerId);
    listProductPackagings();
    listDeliveryReceipts();
    listRelatedProducts();
    listRelatedCustomProducts(match.params.customer_id);
    listPayments('x');
  }

  componentDidUpdate(prevProps) {
    if (this.state.purchaseOrder === null) {
      this.setPurchaseOrderState();
    }
  }

  setPurchaseOrderState() {
    const { items, match } = this.props;
    const purchaseOrder = items.find((po) => `${po.id}` === `${match.params.id}`);
    this.setState({
      purchaseOrder,
    });
    return purchaseOrder;
  }

  get isLoading() {
    const {
      isOnline,
      productsStatus,
      dealerDiscountsStatus,
      discountPackagesStatus,
      packagingsStatus,
      deliveryReceiptsStatus,
      relatedProductsStatus,
      relatedCustomProductsStatus,
      itemsStatus,
      productPackagingsStatus,
    } = this.props;
    return (
      this.state.generatingPDF ||
      (isOnline &&
        [
          productsStatus,
          dealerDiscountsStatus,
          discountPackagesStatus,
          packagingsStatus,
          deliveryReceiptsStatus,
          relatedProductsStatus,
          relatedCustomProductsStatus,
          itemsStatus,
          productPackagingsStatus,
        ].some(isUnloadedOrLoading))
    );
  }

  // getProductNameFromDeliveryDetail = detail => {
  //   const {
  //     products,
  //     seedSizes,
  //     packagings,
  //     seedCompanies,
  //     business
  //   } = this.props;
  //   let name = "";
  //   let product, lot;

  //   if (detail.lotId) {
  //     for (let i = 0; i < products.length; i++) {
  //       for (let y = 0; y < products[i].lots.length; y++) {
  //         if (products[i].lots[y].id === detail.lotId) {
  //           product = products[i];
  //           lot = product.lots[y];
  //           break;
  //         }
  //       }
  //       if (product && lot) break;
  //     }
  //     if (product === undefined || lot === undefined) return "error";
  //     name = getProductName(product, seedCompanies);
  //     console.log(name);
  //     name += " / " + seedSizes.find(ss => lot.seedSizeId === ss.id).name;
  //     console.log(name);
  //     name += " / " + packagings.find(p => lot.packagingId === p.id).name;
  //     console.log(name);
  //     name += " / lot no: " + lot.lotNumber;
  //     console.log(name);
  //   } else {
  //     name = getProductName(
  //       business.find(p => p.id === detail.customProductId)
  //     );
  //     console.log(name);
  //   }

  //   return name;
  // };

  hideProductForm = () => {
    this.setState({
      showProductForm: false,
      editingProduct: null,
    });
  };

  hideDeliveryForm = () => {
    this.setState({
      showDeliveryForm: false,
    });
  };

  hideDeliveryReceiptDialog = () => {
    this.setState({
      showDeliverReceiptDialog: false,
    });
  };

  duplicateProducts = () => {
    const product = this.state.activeTableItem;
    const { purchaseOrder } = this.state;
    const {
      linkRelatedProduct,
      linkRelatedCustomProduct,
      removeRecentCreatedCustomerProduct,
      recentCreatedCustomerProductId,
    } = this.props;

    const linkFunction = product.hasOwnProperty('companyId') ? linkRelatedCustomProduct : linkRelatedProduct;
    linkFunction(
      purchaseOrder.id,
      this.props.match.params.customer_id,
      product.id,
      product.orderQty,
      [], //discount
      null, //Farmid
      product.packagingId || null,
      product.seedSizeId || null,
      product.fieldName || null,
      this.state.orderDate,
    );
    this.setState({
      showAddProductSuccessSnackbar: true,
    });
    setTimeout(() => {
      removeRecentCreatedCustomerProduct(recentCreatedCustomerProductId);
      this.setState({
        showAddProductSuccessSnackbar: false,
      });
    }, 4000);

    this.handleTableItemActionMenuClose();
  };

  addProducts = (data, farmId) => {
    console.log(data);
    const { purchaseOrder } = this.state;
    const {
      linkRelatedProduct,
      linkRelatedCustomProduct,
      removeRecentCreatedCustomerProduct,
      recentCreatedCustomerProductId,
    } = this.props;
    data.productsToOrder.forEach((productOrder) => {
      const linkFunction = productOrder.hasOwnProperty('companyId') ? linkRelatedCustomProduct : linkRelatedProduct;
      linkFunction(
        purchaseOrder.id,
        this.props.match.params.customer_id,
        productOrder.id,
        productOrder.orderQty,
        data.discounts,
        farmId,
        productOrder.packagingId || null,
        productOrder.seedSizeId || null,
        productOrder.fieldName || null,
        data.orderDate,
      );
      this.setState({
        showAddProductSuccessSnackbar: true,
      });
      setTimeout(() => {
        removeRecentCreatedCustomerProduct(recentCreatedCustomerProductId);
        this.setState({
          showAddProductSuccessSnackbar: false,
        });
      }, 4000);
    });

    this.setState({
      showProductForm: false,
    });
  };

  editProduct = (customerProductId, selectedProductId, data) => {
    const customerId = this.props.match.params.customer_id;
    data.productId = selectedProductId;
    let editFunction = this.state.editingProduct.hasOwnProperty('customProductId')
      ? this.props.editRelatedCustomProduct
      : this.props.editRelatedProduct;
    editFunction(customerId, customerProductId, data).then(() => {
      this.setState({
        showProductForm: false,
        showEditProductSuccessSnackbar: true,
      });
      setTimeout(() => {
        this.setState({
          showEditProductSuccessSnackbar: false,
        });
      }, 4000);
    });
  };

  removeRelatedProduct = (customerProduct) => {
    const { removeRelatedProduct, removeRelatedCustomProduct, classes } = this.props;
    const { purchaseOrder } = this.state;

    customerProduct &&
      this.setState({
        deleteProductConfirm: (
          <SweetAlert
            warning
            showCancel
            title={`Delete Product`}
            onConfirm={() => {
              removeRelatedProduct(this.props.match.params.customer_id, purchaseOrder.id, customerProduct.orderId);
              this.setState({ deleteProductConfirm: null });
            }}
            onCancel={() => {
              this.setState({
                deleteProductConfirm: null,
              });
            }}
            confirmBtnCssClass={classes.button + ' ' + classes.success}
            cancelBtnCssClass={classes.button + ' ' + classes.danger}
          >
            Are you sure you want to delete this product? This will also remove the product from any purchase orders or
            quotes it has been added to.
          </SweetAlert>
        ),
      });

    this.handleTableItemActionMenuClose();
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

  getAmountDelivered = (order) => (order.amountDelivered ? order.amountDelivered : 0);

  getTableRowProps = (_, rowInfo) => {
    const { recentCreatedCustomerProductId } = this.props;
    return {
      style: {
        background:
          rowInfo && rowInfo.original && rowInfo.original.orderId === recentCreatedCustomerProductId
            ? '#FFF6E1'
            : 'transparent',
      },
    };
  };

  getTableData(customerOrders, farmId) {
    const { subjectName } = this.state;
    const { seedCompanies, products, business, dealerDiscounts } = this.props;

    let tableHeaders = [
      {
        Header: 'Product',
        show: true,
        id: 'customer',
        minWidth: 200,
        accessor: (d) => d,
        Cell: (props) => {
          const product = props.value;
          let seedCompany = seedCompanies.find((sc) => sc.id === product.seedCompanyId);
          //const name = getProductName(product, seedCompanies);
          let companyBrand = '';
          let brandTreatment = '';

          if (seedCompany) {
            companyBrand += `${seedCompany.name} / `;
            switch (product.seedType.toLowerCase()) {
              case 'soybean':
                companyBrand += seedCompany.soybeanBrandName || 'Soybean';
                break;
              case 'sorghum':
                companyBrand += seedCompany.sorghumBrandName || 'Sorghum';
                break;
              case 'corn':
                companyBrand += seedCompany.cornBrandName || 'Corn';
                break;
              default:
                break;
            }
          }
          if (product.blend) brandTreatment += `${product.blend}`;
          if (product.brand) brandTreatment += ` / ${product.brand}`;
          if (product.treatment) brandTreatment += ` / ${product.treatment}`;
          return (
            <div>
              <p className={this.props.classes.companyBrand}>{companyBrand}</p>
              <b>{brandTreatment}</b>
              <br></br>
              MSRP-${product.msrp}
            </div>
          );
        },
      },
      {
        Header: 'Qty (bags)',
        show: true,
        accessor: 'qty',
      },
      {
        Header: 'Pre-total',
        show: true,
        accessor: 'originalPrice',
      },
      {
        Header: 'Discounts',
        show: true,
        accessor: 'discountAmount',
      },
      {
        Header: 'Total',
        show: true,
        accessor: 'total',
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

    const invoiceData = {};
    let tableData = [];
    let totals = {
      subTotal: 0,
      quantity: 0,
    };
    let discountTotals = [];

    customerOrders.forEach((order) => {
      // only show products that arent added to a farm, they are in the farms tab

      if (farmId === undefined && order.farmId) return;
      if (farmId !== undefined && order.farmId !== farmId) return;
      const product = getProductFromOrder(order, products, business);
      //separate out by product seedType or name if custom product
      const packaging = this.props.packagings.find((packaging) => packaging.id === order.packagingId);
      const seedSize = this.props.seedSizes.find((seedSize) => seedSize.id === order.seedSizeId);
      let appliedDiscounts = getAppliedDiscounts(order, dealerDiscounts);
      let customerProductDiscounts = customerProductDiscountsTotals(order, appliedDiscounts, product);
      discountTotals.push(customerProductDiscounts);

      totals.subTotal += customerProductDiscounts.total;
      totals.quantity += order.orderQty;
      let amountDelivered = JSON.parse(this.getAmountDelivered(order));

      let rowData = [
        //this.productIsDelivered(order.orderQty, order.amountDelivered),
        getProductName(product, seedCompanies),
        format(order.orderDate || order.createdAt, 'MMM Do, YYYY'),
        order.orderQty,
        Array.isArray(amountDelivered)
          ? amountDelivered
              .map((amount) => {
                return amount.delivered;
              })
              .reduce((del, tot) => {
                return parseInt(del, 10) + parseInt(tot, 10);
              })
          : amountDelivered,
        packaging ? packaging.name : '',
        seedSize ? seedSize.name : '',
        numberToDollars(product.msrp || product.costUnit),
        numberToDollars(customerProductDiscounts.originalPrice),
        numberToDollars(customerProductDiscounts.discountAmount),
        numberToDollars(customerProductDiscounts.total),
      ];

      if (subjectName !== 'Invoice') {
        rowData.push(
          <React.Fragment>
            <IconButton
              className="hide-print"
              color="primary"
              onClick={() => this.setState({ editingProduct: order, showProductForm: true })}
            >
              <EditIcon />
            </IconButton>
            <IconButton className="hide-print" color="primary" onClick={() => this.removeRelatedProduct(order)}>
              <DeleteIcon />
            </IconButton>
          </React.Fragment>,
        );
        tableData.push({
          ...product,
          ...customerProductDiscounts,
          qty: order.orderQty,
          orderId: order.id,
        });
      }

      // TODO: refactor this to something more readable
      ((obj, productType, costType) => {
        obj[productType] = {
          type: obj[productType] ? [...obj[productType].type, rowData] : [rowData],
          cost: obj[productType] ? [...obj[productType].cost, parseInt(costType, 10)] : [parseInt(costType, 10)],
          costAfterDiscount: obj[productType]
            ? [...obj[productType].costAfterDiscount, costType - customerProductDiscounts.discountAmount]
            : [costType - customerProductDiscounts.discountAmount],
        };
      })(invoiceData, product.seedType || product.name, product.msrp || product.costUnit);
    });
    return { tableData, invoiceData, totals, discountTotals, tableHeaders };
  }

  getDeliveryTableData = (customerOrders) => {
    return customerOrders.map((order, idx) => {
      return {
        product: getProductFromOrder(order, this.props.prducts, this.props.business),
        customerOrder: order,
      };
    });
  };

  updateName(name) {
    const { updatePurchaseOrder } = this.props;
    const { purchaseOrder } = this.state;

    updatePurchaseOrder(this.props.match.params.customer_id, purchaseOrder.id, {
      name,
    });
  }

  reload() {
    this.setState({
      purchaseOrder: this.props.items.find((po) => `${po.id}` === `${this.props.match.params.id}`),
    });
  }

  goToDeliveryReceipt = (id) => {
    const { deliveryReceipts } = this.props;

    const selectedReceipt = deliveryReceipts.find((deliveryReceipt) => deliveryReceipt.id === id);
    this.setState({
      showDeliverReceiptDialog: true,
      selectedReceipt,
    });
  };

  gotoPurchaseOrder = (id) => {
    const route = this.props.match.path.replace(':customer_id', this.props.match.params.customer_id).replace(':id', id);
    this.props.history.push(route);
    this.reload();
  };

  createNewPurchaseOrder = () => {
    let isQuote = this.state.subjectName === 'Quote';
    return this.props.history.push(
      `/app/customers/${this.props.match.params.customer_id}/purchase_order/new?is_quote=${isQuote}`,
    );
  };

  removePurchaseOrder = () => {
    const { classes, removeItemForCustomer, match, history } = this.props;
    const { subjectName, purchaseOrder } = this.state;

    this.setState({
      deletePurchaseOrderConfirm: (
        <SweetAlert
          warning
          showCancel
          title={`Delete ${subjectName}`}
          onConfirm={() => removeItemForCustomer(match.params.customer_id, purchaseOrder.id, history)}
          onCancel={() => {
            this.setState({
              deletePurchaseOrderConfirm: null,
            });
          }}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to delete this {subjectName} ?
        </SweetAlert>
      ),
    });
  };

  openConvert = () => {
    this.setState({
      showConvertDialog: true,
    });
  };

  hideConvertDialog = () => {
    this.setState({
      showConvertDialog: false,
    });
  };

  cloneItem = () => {
    const { match, cloneItem } = this.props;
    cloneItem(match.params.id).then((response) => this.gotoPurchaseOrder(response.payload.id));
  };

  onDiscountsReorder(order, sortable, e) {
    const { purchaseOrder } = this.state;
    const { updatePurchaseOrder } = this.props;

    let dealerDiscountIds = order.map((id) => parseInt(id, 10));
    updatePurchaseOrder(this.props.match.params.customer_id, purchaseOrder.id, {
      dealerDiscountIds,
    }).then(() => {
      const purchaseOrder = this.props.items.find((po) => `${po.id}` === `${this.props.match.params.id}`);
      this.setState({
        purchaseOrder,
      });
    });
  }

  addDiscount = (discount) => {
    const { purchaseOrder } = this.state;
    const { updatePurchaseOrder } = this.props;

    let dealerDiscountIds = purchaseOrder.dealerDiscountIds || [];
    dealerDiscountIds.push(discount.id);

    updatePurchaseOrder(this.props.match.params.customer_id, purchaseOrder.id, {
      dealerDiscountIds,
    });
  };

  removeDiscount = (discount) => {
    const { purchaseOrder } = this.state;
    const { updatePurchaseOrder } = this.props;

    let dealerDiscountIds = purchaseOrder.dealerDiscountIds;
    let index = dealerDiscountIds.indexOf(discount.id);
    dealerDiscountIds.splice(index, 1);

    updatePurchaseOrder(this.props.match.params.customer_id, purchaseOrder.id, {
      dealerDiscountIds,
    });
  };

  cancelFarmDialog = () => {
    this.setState({
      showFarmForm: false,
    });
  };

  createFarm = (name) => {
    const { createFarm, updatePurchaseOrder } = this.props;
    const { purchaseOrder } = this.state;
    const customerId = this.props.match.params.customer_id;

    createFarm(customerId, { name })
      .then((action) => {
        purchaseOrder.farmData.push({
          farmId: action.payload.id,
          shareholderData: [],
        });
        return updatePurchaseOrder(customerId, purchaseOrder.id, purchaseOrder);
      })
      .then(() =>
        this.setState({
          showFarmForm: false,
        }),
      );
  };

  addExistingFarm = (farmId) => {
    const { updatePurchaseOrder } = this.props;
    const { purchaseOrder } = this.state;

    purchaseOrder.farmData.push({
      farmId: farmId,
      shareholderData: [],
    });
    updatePurchaseOrder(this.props.match.params.customer_id, purchaseOrder.id, purchaseOrder);
    this.setState({ showAddExistingFarm: false });
  };

  savePageAsPdf = () => {
    const { location } = this.props;
    const path = location.pathname;
    const query = location.search;
    const clientUrl = `${path}${query}`;

    this.setState(
      {
        generatingPDF: true,
      },
      () => {
        this.props
          .getPdfForPage(clientUrl, this.state.subjectName)
          .then(() => this.setState({ generatingPDF: false }))
          .catch(() => this.setState({ generatingPDF: false }));
      },
    );
  };

  print = () => {
    setTimeout(() => {
      window.print();
    }, 500);
  };

  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));
  };

  handleMoreFuncMenuClose = (event) => {
    this.setState({ moreFuncMenuOpen: false });
  };

  getTotalDeliveries(purchaseOrderId) {
    const { relatedProducts } = this.props;
    const totalCustomerProductsDeliveries = relatedProducts
      .filter((cp) => cp.purchaseOrderId === purchaseOrderId)
      .reduce((sum, order) => sum + order.orderQty, 0);
    return totalCustomerProductsDeliveries;
  }

  render() {
    const {
      subjectName,
      showProductForm,
      showDeliveryForm,
      showDeliverReceiptDialog,
      selectedReceipt,
      showAddProductSuccessSnackbar,
      showConvertDialog,
      purchaseOrder,
      editingProduct,
      showFarmForm,
      showAddExistingFarm,
      deletePurchaseOrderConfirm,
      moreFuncMenuOpen,
      tableItemActionAnchorEl,
      tableItemActionMenuOpen,
      deleteProductConfirm,
    } = this.state;

    if (!purchaseOrder || this.isLoading) {
      return <CircularProgress />;
    }

    const {
      classes,
      companies,
      seedCompanies,
      items,
      products,
      dealerDiscounts,
      business,
      discountPackages,
      deliveryReceipts,
      editRelatedProduct,
      linkDeliveryReceipt,
      cloneItem,
      packagings,
      seedSizes,
      updatePurchaseOrder,
      convertQuoteToExistingPurchaseOrder,
      listProducts,
      productPackagings,
      match,
      customers,
      payments,
      history,
    } = this.props;

    const customerId = match.params.customer_id;
    const customer = customers.find((_customer) => _customer.id === parseInt(customerId));
    const customerOrders = this.props.getCustomerOrders.call(this); // todo: hack to allow custom filtering logic between PO & quotes for now
    const customerPurchaseOrders = items.filter((po) => {
      return `${po.customerId}` === `${customerId}`;
    });
    const { tableData, totals, tableHeaders } = this.getTableData(customerOrders);
    const perWholeOrderDiscounts = dealerDiscounts.filter((discount) => discount.applyToWholeOrder === true);

    const { orderTotal, orderDiscountsAmount } = perWholeOrderDiscount(
      totals.subTotal,
      totals.quantity,
      purchaseOrder,
      perWholeOrderDiscounts,
    );

    const orderPaid = payments
      .filter((payment) => payment.purchaseOrderId === purchaseOrder.id)
      .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);

    const orderDelivered = deliveryReceipts
      .filter((receipt) => receipt.purchaseOrderId === purchaseOrder.id)
      .reduce(
        (totalSum, receipt) =>
          totalSum + receipt.DeliveryReceiptDetails.reduce((itemSum, detail) => itemSum + detail.amountDelivered, 0),
        0,
      );
    const orderTotalDeliveries = this.getTotalDeliveries(purchaseOrder.id);

    return (
      <div>
        <div>
          <Link key={purchaseOrder.id} to={`/app/customers`}>
            Back to Customers
          </Link>{' '}
          /{' '}
          {customer && (
            <span>
              {customer.name}'s {subjectName}
            </span>
          )}
        </div>

        <div className={classes.newButtonBar}>
          <div className={`${classes.purchaseOrderInput} hide-print`}>
            <Select
              value={purchaseOrder.id}
              onChange={(e) => this.gotoPurchaseOrder(e.target.value)}
              className={classes.poSelector}
            >
              {customerPurchaseOrders.map((po) => {
                return (
                  <MenuItem value={po.id} key={po.id}>
                    <h4 className={classes.poSelector}>
                      {`${subjectName === 'Purchase Order' ? 'PO' : 'QT'}#${po.id} `}
                    </h4>
                    {/* } ${po.name}`} */}
                  </MenuItem>
                );
              })}
            </Select>
          </div>

          {subjectName === 'Purchase Order' && (
            <React.Fragment>
              <div className={classes.progressItem}>
                <div class a e={classes.progressHead}>
                  <b className={classes.progressTitle}>IN#{purchaseOrder.id} </b>
                  <span>
                    ${orderPaid}/{orderTotal}
                  </span>
                </div>
                <LinearProgress
                  className={classes.tableItemLinearProgress}
                  variant="determinate"
                  value={(orderPaid / orderTotal) * 100}
                />
              </div>
              <div className={classes.progressItem}>
                <div className={classes.progressHead}>
                  <b className={classes.progressTitle}>DL#{purchaseOrder.id}</b>
                  <span>
                    {orderDelivered}/{orderTotalDeliveries}
                  </span>
                </div>
                <LinearProgress
                  className={classes.tableItemLinearProgress}
                  variant="determinate"
                  value={(orderDelivered / orderTotalDeliveries) * 100}
                />
              </div>
            </React.Fragment>
          )}

          <div className={classes.newButtonBarSpacing}></div>

          <span className={classes.createdAt}>Created on {format(purchaseOrder.createdAt, 'MMM D, YYYY')}</span>

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
                  className={classes.moreFuncMenuItem}
                  onClick={() => {
                    this.savePageAsPdf();
                  }}
                >
                  Download PDF
                </MenuItem>
                <MenuItem
                  className={classes.moreFuncMenuItem}
                  onClick={() => {
                    this.print();
                  }}
                >
                  Print
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    history.push(
                      `/app/customers/${match.params.customer_id}/purchase_order/${match.params.id}/deliveries`,
                    );
                  }}
                >
                  Delivery List
                </MenuItem>

                <MenuItem
                  className={classes.moreFuncMenuItem}
                  onClick={() => {
                    {
                    }
                  }}
                >
                  SwitchView
                </MenuItem>
                <MenuItem
                  className={classes.moreFuncMenuItem}
                  onClick={() => {
                    this.removePurchaseOrder();
                  }}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Paper>
          </Popover>

          {subjectName === 'Purchase Order' ? (
            <Button size="sm" color="primary" className="hide-print">
              Generate Invoice
            </Button>
          ) : (
            <React.Fragment>
              <Button size="sm" color="primary" className="hide-print" onClick={this.createNewPurchaseOrder}>
                Add Version
              </Button>

              {customerOrders.length > 0 && (
                <Button size="sm" color="primary" className="hide-print" onClick={this.openConvert}>
                  Convert
                </Button>
              )}
            </React.Fragment>
          )}
        </div>
        {purchaseOrder.isSimple === true && (
          <React.Fragment>
            <h2>Products</h2>
            <Paper className={classes.farmPaper}>
              <ReactTable
                data={tableData}
                columns={tableHeaders}
                minRows={1}
                resizable={false}
                showPagination={false}
                getTrProps={this.getTableRowProps}
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
                    {/* <MenuItem
                      className={classes.addNewMenuItem}
                      onClick={() => {
                        this.duplicateProducts();
                      }}
                    >
                      Duplicate
                    </MenuItem> */}
                    <MenuItem
                      className={classes.addNewMenuItem}
                      onClick={() => {
                        this.removeRelatedProduct(this.state.activeTableItem);
                      }}
                    >
                      Delete
                    </MenuItem>
                  </MenuList>
                </Paper>
              </Popover>
              <Button
                onClick={() => {
                  this.setState({
                    showProductForm: true,
                  });
                }}
              >
                Add Product
              </Button>

              <div className={classes.tableTotalRow}>
                <h4 className={classes.tableTotalRowLabel}>Total</h4>
                <div className={classes.tableTotalRowNumber}>
                  <b>${orderTotal - orderDiscountsAmount}</b>
                </div>
              </div>
            </Paper>
            <Paper classes={{ root: classes.orderTotalPaper }}>
              <h2 className={classes.orderTotalTitle}>Order Total</h2>
              <div className={classes.orderTotalDisplayRow}>
                <div className={classes.orderTotalDisplayContainer}>
                  <p className={classes.orderTotalDisplayLabel}>Pretotal</p>
                  <div className={classes.orderTotalDisplayNumber}>${orderTotal}</div>
                </div>
                <div className={classes.orderTotalDisplayContainer}>
                  <p className={classes.orderTotalDisplayLabel}>Discount</p>
                  <div className={classes.orderTotalDisplayNumber}>{orderDiscountsAmount}</div>
                </div>
                <div className={classes.orderTotalDisplayContainer}>
                  <h4 className={classes.orderTotalDisplayLabel}>Grand Total</h4>
                  <div className={classes.orderTotalDisplayNumber}>${orderTotal - orderDiscountsAmount}</div>
                </div>
              </div>
            </Paper>
          </React.Fragment>
        )}
        {purchaseOrder.isSimple === false && (
          <React.Fragment>
            <PurchaseOrderFarms
              {...this.props}
              subjectName={subjectName}
              addProducts={this.addProducts}
              seedSizes={seedSizes}
              seedCompanies={seedCompanies}
            />
            <FarmFormDialog
              showFarmForm={showFarmForm}
              cancelFarmDialog={this.cancelFarmDialog}
              createFarm={this.createFarm}
            />
            <AddExistingFarmDialog
              {...this.props}
              showAddExistingFarm={showAddExistingFarm}
              addExistingFarm={this.addExistingFarm}
              cancelShowAddExistingFarm={() => this.setState({ showAddExistingFarm: false })}
            />
          </React.Fragment>
        )}
        <Packaging />
        {showProductForm && (
          <PurchaseOrderDialog
            purchaseOrder={purchaseOrder}
            customerOrders={customerOrders}
            companies={companies}
            products={products}
            business={business}
            dealerDiscounts={dealerDiscounts}
            onClose={this.hideProductForm}
            onAddProducts={this.addProducts}
            onEditProduct={this.editProduct}
            discountPackages={discountPackages}
            editingProduct={editingProduct}
            packagings={packagings}
            seedSizes={seedSizes}
            seedCompanies={seedCompanies}
          />
        )}
        {linkDeliveryReceipt && showDeliveryForm && (
          <PurchaseOrderDeliveryDialog
            purchaseOrder={purchaseOrder}
            customerOrders={customerOrders}
            onClose={this.hideDeliveryForm}
            onAddDelivery={this.addDelivery}
            getTableData={this.getDeliveryTableData}
            open={showDeliveryForm}
            editRelatedProduct={editRelatedProduct}
            customerId={this.props.match.params.customer_id}
            addDeliveryReceipt={linkDeliveryReceipt}
            listProducts={listProducts}
            packagings={packagings}
            seedSizes={seedSizes}
            deliveryReceipts={deliveryReceipts}
            seedCompanies={seedCompanies}
            productPackagings={productPackagings}
          />
        )}
        {showDeliverReceiptDialog && (
          <PurchaseOrderDeliveryReceiptDialog
            onClose={this.hideDeliveryReceiptDialog}
            open={showDeliverReceiptDialog}
            purchaseOrderId={purchaseOrder.id}
            deliveryReceipt={selectedReceipt}
            getProductNameFromDeliveryDetail={this.getProductNameFromDeliveryDetail}
          />
        )}
        {showConvertDialog && (
          <ConvertQuoteDialog
            onClose={this.hideConvertDialog}
            open={showConvertDialog}
            match={this.props.match}
            history={this.props.history}
            updatePurchaseOrder={updatePurchaseOrder}
            convertQuoteToExistingPurchaseOrder={convertQuoteToExistingPurchaseOrder}
          />
        )}

        {deletePurchaseOrderConfirm}
        {deleteProductConfirm}

        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showAddProductSuccessSnackbar}
          message={<span>Product added successfully</span>}
        />
      </div>
    );
  }
}

PurchaseOrder.displayName = 'PurchaseOrder';
PurchaseOrder.propTypes = {
  subjectName: PropTypes.string,
  products: PropTypes.array,
  productsStatus: PropTypes.oneOf(Object.values(LoadingStatus)),
  business: PropTypes.array,
  dealerDiscounts: PropTypes.array,
  dealerDiscountsStatus: PropTypes.oneOf(Object.values(LoadingStatus)),
  companies: PropTypes.array,
  items: PropTypes.array,
  cloneItem: PropTypes.func,
  listDeliveryReceipts: PropTypes.func,
  linkDeliveryReceipt: PropTypes.func,
  listRelatedProducts: PropTypes.func.isRequired,
  linkRelatedProduct: PropTypes.func.isRequired,
  editRelatedProduct: PropTypes.func.isRequired,
  listProducts: PropTypes.func.isRequired,
  removeRelatedProduct: PropTypes.func.isRequired,
  listDealerDiscounts: PropTypes.func.isRequired,
  listAllCustomProducts: PropTypes.func.isRequired,
  listRelatedCustomProducts: PropTypes.func.isRequired,
  linkRelatedCustomProduct: PropTypes.func.isRequired,
  removeRelatedCustomProduct: PropTypes.func.isRequired,
  listPurchaseOrders: PropTypes.func.isRequired,
  updatePurchaseOrder: PropTypes.func.isRequired,
  createItemForCustomer: PropTypes.func.isRequired,

  // provided by withStyles HoC
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PurchaseOrder);
