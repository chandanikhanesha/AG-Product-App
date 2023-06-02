import React, { Component } from 'react';
import { debounce } from 'lodash/function';
import ReactTable from 'react-table';
import Sortable from 'react-sortablejs';
import { assign, sortBy } from 'lodash';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import InputLabel from '@material-ui/core/InputLabel';

import CloseIcon from '@material-ui/icons/Close';
// icons
import { withStyles } from '@material-ui/core';
import ArrowDown from '@material-ui/icons/KeyboardArrowDown';
import ArrowRight from '@material-ui/icons/KeyboardArrowRight';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import Snackbar from '@material-ui/core/Snackbar';

// material ui components
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Tooltip from '@material-ui/core/Tooltip';
import WarningIcon from '@material-ui/icons/Warning';
import CheckBox from '@material-ui/core/Checkbox';
import DragHandle from '@material-ui/icons/DragHandle';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
// material-dashboard components
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';

// components
import TextFieldWithConfirm from '../../../components/form/TextFieldWithConfirm';
import ProductDialog from '../product_dialog';
import { farmsTablesStyles } from './farms_tables.styles';

// utils
import { customerProductDiscountsTotals, numberToDollars, perWholeOrderDiscount } from '../../../utilities';
import {
  getProductName,
  //getProductFromOrder,
  getProductSeedBrand,
} from '../../../utilities/product.v2';
import { getAppliedDiscounts } from '../../../utilities/purchase_order';
import FarmRowExtra from './farm_row_extra';
import FarmEditShareholder from './farm_edit_shareholder';
import FarmEntireShareholder from './farm_entire_shareholder';

import NewFieldRow from './farm_new_field_row';
import MoveToFarm from './farm_row_move_to';
import moment from 'moment';
import axios from 'axios';

class FarmsTables extends Component {
  state = {
    showProductForm: false,
    farmId: null,
    purchaseOrder: null,
    customer: null,
    editingProduct: null,
    showAllColumns: false,
    showShareholderColumn: true,
    showShareholderForm: false,
    showFarmEditForm: false,
    showShareholderPercentageDialog: false,
    showShareholderPercentageDialogWholeOrder: false,
    fieldName: '',
    fieldNames: {},
    farmToEdit: null,
    tableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,
    activeTableItem: null,
    syncMonsantoProductIds: [],
    isCheckingProductAvailability: false,
    isSyncingMonsantoProducts: false,
    showSnackbar: false,
    showSnackbarText: '',
    showShareHolderForWholeFarm: false,

    expanded: {},
    expanded1: {},
    addingNew: {},
    addingNewFarmId: null,
    selectedFarm: null,
    showMoveToDialog: false,
    moreFuncMenuOpen: {},
    farmsExpand: {},
    openSwitchDialog: false,
    monsantoProductReduceTransferInfo: {
      transferWay: 'toHolding',
      reduceQuantity: 0,
      growerInfo: {
        customerId: this.props.customers.find((customer) => customer.name === 'Bayer Dealer Bucket')
          ? this.props.customers.find((customer) => customer.name === 'Bayer Dealer Bucket').id
          : '',
        purchaseOrderId: null,
      },
    },

    showAddTreatmentDialog: false,

    allCustomerData: [],
  };

  moreFuncMenuAnchorEl = {};

  constructor(props) {
    super(props);
    this.debouncedUpdateOrder = debounce(async (customerId, orderId, data) => {
      await this.props.editRelatedProduct(customerId, orderId, data);
      this.reload();
    }, 750);
    this.debouncedUpdateCustomOrder = debounce(
      debounce(async (customerId, orderId, data) => {
        await this.props.editRelatedCustomProduct(customerId, orderId, data);
        this.reload();
      }, 750),
    );
    this.debouncedUpdateShareholderPercentage = debounce(this.updateShareholderPercentage, 750);

    this.debouncedUpdateFarm = debounce(async (farm) => {
      await this.props.updateFarm(this.props.match.params.customer_id, farm);
      this.reload();
    }, 750);
  }

  componentWillMount = async () => {
    let farms = [];
    const poId = this.props.match.params.id;
    const customerId = this.props.match.params.customer_id;
    const currentCust = this.props.customers.filter((c) => c.id == customerId);

    const currentPo = currentCust.length > 0 && currentCust[0].PurchaseOrders.filter((p) => p.id == poId);
    await currentCust[0].PurchaseOrders.map((p) => {
      p.farmData.length > 0 &&
        p.farmData.map((f) => {
          return farms.push(f);
        });
    });
    const purchaseOrder =
      this.props.currentPurchaseOrder !== undefined ? this.props.currentPurchaseOrder : currentPo[0];

    const customer = purchaseOrder && purchaseOrder.Customer;

    let purchaseOrderFarmIds = ((purchaseOrder && purchaseOrder.farmData) || []).map((data) => data.farmId);
    const purchaseOrderFarms =
      customer && customer.Farms && customer.Farms.filter((farm) => purchaseOrderFarmIds.includes(farm.id));
    let farmsExpand = {};
    (purchaseOrderFarms || farms).forEach((farm) => {
      farmsExpand = { ...farmsExpand, [farm.id || farm.FarmId]: false };
    });

    this.setState({
      purchaseOrderId: this.props.currentPurchaseOrder,
      farmsExpand,
    });
  };

  componentDidMount = async () => {
    const poId = this.props.match.params.id;
    const customerId = this.props.match.params.customer_id;

    await axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        this.setState({ allCustomerData: response.data.customersdata });
      });
  };

  onClose = async () => {
    this.setState({ openSwitchDialog: false });
    await this.handleTableItemActionMenuClose();
    await this.reload();
  };

  reload = async () => {
    const { purchaseOrder, getPurchaseOrderById } = this.props;
    getPurchaseOrderById(purchaseOrder.id);
  };

  setShowSnackbar = (showSnackbarText, timeout = 3000) => {
    this.setState({
      showSnackbar: true,
      showSnackbarText: showSnackbarText,
    });
    setTimeout(() => {
      this.setState({
        showSnackbar: false,
        showSnackbarText: '',
      });
    }, timeout);
  };

  handleMonsantoProductPendingCheckbox = (order) => (event) => {
    const isCheck = event.target.checked;
    if (isCheck) {
      this.setState({
        syncMonsantoProductIds: [...this.state.syncMonsantoProductIds, order.id],
      });
    } else {
      this.setState({
        syncMonsantoProductIds: this.state.syncMonsantoProductIds.filter((id) => id !== order.id),
      });
    }
  };

  handleMonsantoProductPendingCheckboxAll = (customerOrders) => (event) => {
    const isCheck = event.target.checked;
    if (isCheck) {
      const cvssf = customerOrders
        .filter((order) => order.farmId)
        .filter((order) => order.monsantoProductId)
        // .filter(order => order.orderQty !== 0)
        .filter((order) => {
          if (order.MonsantoProduct && order.isDeleted) return null;
          return order;
        });
      const ids = [];
      cvssf.forEach((order) => {
        ids.push(order.id);
      });
      this.setState({
        syncMonsantoProductIds: this.state.syncMonsantoProductIds.concat(ids),
      });
    } else {
      this.setState({
        syncMonsantoProductIds: [],
      });
    }
  };

  // sync Bayer products
  syncMonsantoOrders = async () => {
    const { currentPurchaseOrder, checkProductAvailability } = this.props;
    const { syncMonsantoProductIds } = this.state;
    const { CustomerMonsantoProducts: monsantoProducts } = currentPurchaseOrder;
    if (!currentPurchaseOrder) return;
    // check Bayer product availability
    let isMonsantoServiceDown = false;
    let noEnoughQtyProducts = [],
      notAvailableProducts = [];
    this.setState({
      isSyncingMonsantoProducts: true,
      // isCheckingProductAvailability: true,
    });
    // const CustomerMonsantoProducts = monsantoProducts.filter(
    //   (monsantoProduct) =>
    //     syncMonsantoProductIds.includes(monsantoProduct.monsantoProductId) ||
    //     (monsantoProduct.isDeleted && !monsantoProduct.isDeletedSynced),
    // );
    // if (CustomerMonsantoProducts.length > 0) {
    //   await checkProductAvailability({
    //     CustomerMonsantoProducts: CustomerMonsantoProducts,
    //   })
    //     .then((res) => {
    //       this.setShowSnackbar('Check product availability done!');
    //       noEnoughQtyProducts = res.data.noEnoughQtyProducts;
    //       notAvailableProducts = res.data.notAvailableProducts;
    //       //compare response availability with orderqty
    //     })
    //     .catch((e) => {
    //       this.setState({
    //         isSyncingMonsantoProducts: false,
    //         isCheckingProductAvailability: false,
    //       });

    //       isMonsantoServiceDown = true;
    //       if (e && e) {
    //         this.setShowSnackbar(e.response.data.error || 'Cannot sync with Monsanto! Please try later!');
    //       } else {
    //         this.setShowSnackbar(
    //           'The Bayer server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later.',
    //         );
    //       }
    //     });
    // }
    this.setState({ isCheckingProductAvailability: false });

    if (isMonsantoServiceDown) return;
    // return;
    await this.props
      .syncMonsantoOrders(
        this.props.currentPurchaseOrder.id,
        this.props.match.params.customer_id,
        notAvailableProducts,
        syncMonsantoProductIds,
        this.props.match.path.includes('dealers'),
      )
      .then((synced) => {
        this.setState({ isSyncingMonsantoProducts: false });
        if (notAvailableProducts.length > 0) {
          this.setShowSnackbar('Sync with Bayer Done! Some products are not available for now!', 5000);
        }
        this.setShowSnackbar(synced.msg || '');
        this.reload();
      })
      .catch((e) => {
        // console.log(e)
        this.setState({ isSyncingMonsantoProducts: false });
        if (e && e) {
          this.setShowSnackbar(e.response.data.error || 'Cannot sync with Monsanto! Please try later!');
        } else {
          this.setShowSnackbar(
            'The Bayer server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later.',
          );
        }
      });
  };

  onExpandedChange(farmId, newExpanded) {
    this.setState((state) => ({
      expanded: {
        ...state.expanded,
        [farmId]: newExpanded,
      },
    }));
  }

  onExpandedChange1(farmId, newExpanded) {
    this.setState((state) => ({
      expanded1: {
        ...state.expanded1,
        [farmId]: newExpanded,
      },
    }));
  }

  hideProductForm = () => {
    this.setState(
      {
        showProductForm: false,
        editingProduct: null,
      },
      () => this.renderFarmTables(),
    );
  };

  addProducts = async (productsData) => {
    const { farmId, fieldName } = this.state;
    // productsData.productsToOrder.map((currElement, index) => {
    //   productsData.productsToOrder[index].fieldName = fieldName;
    // });

    const currentFarm = this.props.currentPurchaseOrder.Customer.Farms.find((data) => data.id === farmId);

    await this.props.addProducts(productsData, farmId, currentFarm.shareholderData);
    this.setState({
      farmId: null,
      showProductForm: false,
      addingNew: {},
    });
    this.reload();
  };

  handleFieldNameChange = (event) => {
    this.setState({ fieldName: event.target.value });
  };

  handleTableItemActionMenuOpen = (item) => (event) => {
    if (item.hasOwnProperty('order')) {
      this.setState({
        tableItemActionMenuOpen: true,
        tableItemActionAnchorEl: event.target,
        activeTableItem: item.order,
      });
    } else {
      this.setState({
        tableItemActionMenuOpen: true,
        tableItemActionAnchorEl: event.target,
        activeTableItem: item,
      });
    }
  };

  handleTableItemActionMenuClose = () => {
    this.setState({ tableItemActionMenuOpen: false, activeTableItem: null });
  };

  getAmountDelivered = (order) => (order.amountDelivered ? order.amountDelivered : 0);

  editProduct = (productLinkId, selectedProductId, data) => {
    const { orderQty, discounts, fieldName, orderDate } = data;
    const customerId = this.props.match.params.customer_id;
    const productData = {
      productId: selectedProductId,
      orderQty,
      discounts,
      fieldName,
      orderDate,
    };
    this.props.editRelatedProduct(customerId, productLinkId, productData).then(() => {
      this.setState({
        showProductForm: false,
        editingProduct: null,
      });
    });
    this.reload();
  };

  editFarmId = async (order, FinalFarmData) => {
    const { editRelatedCustomProduct, editRelatedProduct, editRelatedMonsantoProduct, currentPurchaseOrder, farms } =
      this.props;

    const { selectedFarm } = this.state;

    const selectedFarmData = FinalFarmData.find((f) => f.id == selectedFarm);
    const shareholderData =
      selectedFarmData !== undefined
        ? selectedFarmData.shareholderData.length > 0
          ? selectedFarmData.shareholderData
          : order.shareholderData
        : order.shareholderData;

    if (selectedFarm !== null) {
      if (order.hasOwnProperty('customProductId')) {
        await editRelatedCustomProduct(this.props.match.params.customer_id, order.id, {
          farmId: selectedFarm,
          shareholderData: shareholderData,
        });
      } else if (order.hasOwnProperty('productId')) {
        await editRelatedProduct(this.props.match.params.customer_id, order.id, {
          farmId: selectedFarm,
          shareholderData: shareholderData,
        });
      } else {
        await editRelatedMonsantoProduct(this.props.match.params.customer_id, order.id, {
          farmId: selectedFarm,
          shareholderData: shareholderData,
          monsantoProductId: order.monsantoProductId,
        });
      }
      setTimeout(() => {
        this.onClose();
      }, 1000);
    }
  };
  moveToFarm = async (productId, farmId) => {
    const customerId = this.props.match.params.customer_id;
    await this.props.editRelatedProduct(customerId, productId, {
      farmId,
    });
    this.setState({
      showMoveToDialog: false,
      movingProduct: null,
    });
    this.handleTableItemActionMenuClose();
    this.reload();
  };

  updateFarm = async (farm) => {
    this.debouncedUpdateFarm(farm);
  };
  // end TODO

  getTableHeaders() {
    let headers = ['Field', 'Product', 'Order Date', 'Quantity'];
    if (this.state.showAllColumns) {
      headers = headers.concat(['Delivered', 'MSRP', 'Before Discount', 'Discounts']);
    }
    headers.push('Total');
    if (this.state.showShareholderColumn) headers.push('Shareholders');
    if (this.props.subjectName !== 'Invoice') headers.push('');
    return headers;
  }

  updateOrder(order, data, id) {
    if (order.order.hasOwnProperty('customProductId')) {
      this.setState((state, props) => {
        return {
          fieldNames: { [id]: data.fieldName },
        };
      });
      this.debouncedUpdateCustomOrder(order.order.customerId, order.id, data);
    } else {
      this.setState((state, props) => {
        return {
          fieldNames: { [id]: data.fieldName },
        };
      });
      data.isMonsantoPoruduct = order.order.hasOwnProperty('monsantoProductId') ? true : false;

      if (data.isMonsantoPoruduct == false) {
        data.productId = order.order.productId;
      }

      this.debouncedUpdateOrder(order.order.customerId, order.id, data);
    }
  }

  // getTableData(customerOrders, farmId) {
  //   const {
  //     subjectName,
  //     seedCompanies,
  //     // products,
  //     // business,
  //     dealerDiscounts,
  //     //currentPurchaseOrder
  //   } = this.props;
  //   const { fieldNames } = this.state;
  //   let tableData = [];

  //   let totals = {
  //     discount: 0,
  //     subTotal: 0,
  //     preTotal: 0,
  //     quantity: 0,
  //   };
  //   let discountTotals = [];
  //   const { deliveryReceipts, currentPurchaseOrder } = this.props;
  //   const oldDeliveryReceipt = [];

  //   deliveryReceipts.forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldDeliveryReceipt.push(ddd)));
  //   const { showDelivery } = this.state;
  //   // filter customer orders, and sort by `createdAt` so they dont shift as they're being updated
  //   customerOrders
  //     .sort((a, b) => b.id - a.id)
  //     .forEach((order) => {
  //       let allLotsDelivered =
  //         oldDeliveryReceipt &&
  //         oldDeliveryReceipt
  //           .filter((dd) =>
  //             order.productId
  //               ? dd.productId === order.productId
  //               : order.customProductId === order.customProductId && dd.customerMonsantoProductId === order.id,
  //           )
  //           .map((d) => parseFloat(d.amountDelivered || 0) || 0)
  //           .reduce((partialSum, a) => partialSum + a, 0);
  //       let remainQty =
  //         parseFloat(order.orderQty).toFixed(2) -
  //         (allLotsDelivered.length === 0 ? 0 : parseFloat(allLotsDelivered).toFixed(2));
  //       const quantityDelivered = allLotsDelivered.length === 0 ? 0 : parseFloat(allLotsDelivered).toFixed(2);
  //       remainQty = remainQty.toFixed(2);

  //       if (order.hasOwnProperty('Product')) {
  //         const product = order.Product;
  //         let appliedDiscounts = getAppliedDiscounts(order, dealerDiscounts);
  //         let customerProductDiscounts = customerProductDiscountsTotals(
  //           order,
  //           appliedDiscounts,
  //           product,
  //           null,
  //           null,
  //           null,
  //           this.props.purchaseOrder,
  //         );
  //         discountTotals.push(customerProductDiscounts);
  //         totals.preTotal += customerProductDiscounts.originalPrice;
  //         totals.discount += customerProductDiscounts.discountAmount;
  //         totals.subTotal += customerProductDiscounts.total;
  //         totals.quantity += order.orderQty;
  //         tableData.push({ ...order, customerProductDiscounts, remainQty, quantityDelivered });
  //       } else {
  //         const product = order.CustomProduct;
  //         let appliedDiscounts = getAppliedDiscounts(order, dealerDiscounts);
  //         let customerProductDiscounts = customerProductDiscountsTotals(
  //           order,
  //           appliedDiscounts,
  //           product,
  //           null,
  //           null,
  //           null,
  //           this.props.purchaseOrder,
  //         );
  //         discountTotals.push(customerProductDiscounts);
  //         totals.preTotal += customerProductDiscounts.originalPrice;
  //         totals.discount += customerProductDiscounts.discountAmount;
  //         totals.subTotal += customerProductDiscounts.total;
  //         totals.quantity += order.orderQty;
  //         tableData.push({ ...order, customerProductDiscounts, remainQty, quantityDelivered });
  //       }
  //     });

  //   const tableHeaders = [
  //     {
  //       Header: '',
  //       maxWidth: 35,
  //       expander: true,
  //       Expander: ({ isExpanded, ...rest }) => {
  //         if (rest.original.relatedProducts) {
  //           return;
  //         }
  //         return <div>{isExpanded ? <ArrowDown /> : <ArrowRight />}</div>;
  //       },
  //     },
  //     {
  //       Header: 'Field Name',
  //       show: true,
  //       id: 'field',
  //       accessor: (d) => d,
  //       Cell: (props) => {
  //         const order = props.value;
  //         const fieldId = `${order.id}-field-name`;
  //         return (
  //           <CustomInput
  //             id={fieldId}
  //             inputProps={{
  //               value: fieldNames[fieldId] || order.fieldName || '',
  //               onChange: (e) => this.updateOrder(order, { fieldName: e.target.value }, `${order.id}-field-name`),
  //               disabled: subjectName === 'Invoice',
  //             }}
  //           />
  //         );
  //       },
  //     },
  //     {
  //       Header: 'Product Type',
  //       show: true,
  //       id: 'product',
  //       accessor: (d) => d,
  //       Cell: (props) => {
  //         const order = props.value;
  //         if (order.hasOwnProperty('Product')) {
  //           const product = order.Product.length > 0 ? order.Product[0] : order.Product;

  //           const name = getProductName(product);
  //           const seedBrand = getProductSeedBrand(product, seedCompanies);

  //           return (
  //             <React.Fragment>
  //               {seedBrand}
  //               <br />
  //               <b>{name}</b>
  //               <br />
  //               {`MSRP-${product.msrp}`}
  //               {order.relatedCustomProducts &&
  //                 order.relatedCustomProducts.map((relatedCustomProduct, index) => (
  //                   <React.Fragment key={index}>
  //                     <br />
  //                     <span style={{ fontSize: 10 }}>
  //                       Treatment: {relatedCustomProduct.CompanyName}/{relatedCustomProduct.productType}/
  //                       {relatedCustomProduct.productName}
  //                       {relatedCustomProduct.orderQty} {relatedCustomProduct.unit} <sup>*</sup>
  //                     </span>
  //                   </React.Fragment>
  //                 ))}
  //               {this.renderFarmExtra(order, order.farmId)}
  //             </React.Fragment>
  //           );
  //         } else {
  //           const { name, description, type, costUnit } = order.CustomProduct;
  //           return (
  //             <React.Fragment>
  //               {`${name} / ${description}`}
  //               <br />
  //               <b>{type}</b>
  //               <br />
  //               {`MSRP-${costUnit}`}
  //               {this.renderFarmExtra(order, order.farmId)}
  //             </React.Fragment>
  //           );
  //         }
  //       },
  //     },
  //     {
  //       Header: 'No. of Units',
  //       show: true,
  //       id: 'qty',
  //       //maxWidth: 180,
  //       accessor: (d) => d,
  //       Cell: (props) => {
  //         const order = props.value;
  //         const qtyId = `${order.id}-qty`;
  //         return (
  //           <CustomInput
  //             id={qtyId}
  //             inputProps={{
  //               value: order.orderQty,
  //               type: 'number',
  //               textalign: 'right',
  //               onChange: (e) => this.updateOrder(order, { orderQty: e.target.value }, qtyId),
  //             }}
  //           />
  //         );
  //       },
  //     },
  //     {
  //       Header: 'MSRP',
  //       id: 'msrp',
  //       show: true,
  //       accessor: (d) => d,
  //       Cell: (props) => {
  //         const order = props.value;
  //         const { msrpEdited } = order;
  //         if (order.hasOwnProperty('Product')) {
  //           const product = order.Product;
  //           return (
  //             <Tooltip title={`Original MSRP : ${numberToDollars(parseFloat(product.msrp))}`}>
  //               <div>{numberToDollars(parseFloat(msrpEdited ? msrpEdited : product.msrp))}</div>
  //             </Tooltip>
  //           );
  //         } else {
  //           const product = order.CustomProduct;
  //           return (
  //             <Tooltip title={`Original MSRP : ${numberToDollars(parseFloat(product.costUnit))}`}>
  //               <div>{numberToDollars(parseFloat(msrpEdited ? msrpEdited : product.costUnit))}</div>
  //             </Tooltip>
  //           );
  //         }
  //       },
  //     },
  //     {
  //       Header: 'Pretotal',
  //       show: true,
  //       id: 'pretotal',
  //       //maxWidth: 120,
  //       accessor: (d) => d,
  //       Cell: (props) => (
  //         <React.Fragment>{numberToDollars(props.original.customerProductDiscounts.originalPrice)}</React.Fragment>
  //       ),
  //     },
  //     {
  //       Header: 'Discount Name',
  //       show: true,
  //       id: 'discount_name',
  //       //maxWidth: 120,
  //       accessor: (d) => d,
  //       Cell: (props) => {
  //         const order = props.value;
  //         const discounts = order.discounts;
  //         return (
  //           <React.Fragment>
  //             <div className={this.props.classes.discountList}>
  //               {discounts.map((discount) => {
  //                 const discountId = discount.DiscountId;
  //                 const discountDetial = dealerDiscounts.find((dd) => dd.id === discountId);
  //                 return (
  //                   <div className={this.props.classes.discountListItem} key={discountId}>
  //                     {discountDetial.name + '  (' + discount.unit + discount.discountValue + ')'}
  //                   </div>
  //                 );
  //               })}
  //             </div>
  //           </React.Fragment>
  //         );
  //       },
  //     },
  //     {
  //       Header: 'Discount Amount',
  //       show: true,
  //       id: 'discount_amount',
  //       //maxWidth: 120,
  //       accessor: (d) => d,
  //       Cell: (props) => {
  //         const order = props.value;
  //         const originalDiscounts = order.discounts;
  //         const product = order.hasOwnProperty('Product') ? order.Product : order.CustomProduct;
  //         const discountsPOJO = order.discounts
  //           .map((discount) => {
  //             return dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
  //           })
  //           .filter((el) => el);
  //         const { discounts } = customerProductDiscountsTotals(
  //           order,
  //           discountsPOJO,
  //           product,
  //           null,
  //           null,
  //           null,
  //           this.props.purchaseOrder,
  //         );
  //         return (
  //           <React.Fragment>
  //             <div className={this.props.classes.discountList}>
  //               {originalDiscounts.map((discount, index) => (
  //                 <div className={this.props.classes.discountListItem} key={index}>
  //                   {`$${(discounts[discount.DiscountId] ? discounts[discount.DiscountId].amount : 0).toFixed(2)}`}
  //                 </div>
  //               ))}
  //             </div>
  //           </React.Fragment>
  //         );
  //       },
  //     },
  //     {
  //       Header: 'Total',
  //       show: true,
  //       id: 'total',
  //       accessor: (d) => d,
  //       sortable: true,

  //       Cell: (props) => (
  //         <React.Fragment>{numberToDollars(props.original.customerProductDiscounts.total)}</React.Fragment>
  //       ),
  //     },
  //     {
  //       Header: (
  //         <p id="qtyDelivered" style={{ display: 'contents' }}>
  //           {' '}
  //           Qty Delivered
  //         </p>
  //       ),
  //       show: showDelivery,
  //       id: 'quantityDelivered',
  //       accessor: 'quantityDelivered',
  //       sortMethod: (a, b) => {
  //         return a.props.children !== undefined && parseFloat(a.props.children) - parseFloat(b.props.children);
  //       },
  //       sortable: true,
  //     },
  //     {
  //       Header: 'Qty Remaining',
  //       show: showDelivery,
  //       id: 'remainQty',
  //       accessor: 'remainQty',
  //       sortMethod: (a, b) => {
  //         return parseFloat(a) - parseFloat(b);
  //       },
  //       sortable: true,
  //     },
  //     {
  //       Header: '',
  //       show: true,
  //       id: 'actions',
  //       accessor: (d) => d,
  //       maxWidth: 60,
  //       sortable: false,
  //       Cell: (props) => (
  //         <React.Fragment>
  //           <IconButton aria-label="delete" onClick={this.handleTableItemActionMenuOpen(props.value)}>
  //             <MoreHorizontalIcon fontSize="small" />
  //           </IconButton>
  //         </React.Fragment>
  //       ),
  //     },
  //   ];
  //   return { tableData, tableHeaders, totals, discountTotals };
  // }

  getTableData(customerOrders, selectedTab) {
    let totalDiscount = 0;
    const { subjectName } = this.props;
    const { fieldNames } = this.state;
    let tableData = [];
    let totals = {
      subTotal: 0,
      quantity: 0,
    };
    const { deliveryReceipts, currentPurchaseOrder } = this.props;
    const oldDeliveryReceipt = [];
    const oldReturnDeliveryReceipt = [];

    deliveryReceipts
      .filter((d) => d.isReturn == false)
      .forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldDeliveryReceipt.push(ddd)));
    deliveryReceipts
      .filter((d) => d.isReturn == true)
      .forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldReturnDeliveryReceipt.push(ddd)));
    const { showDelivery, showOrderDate } = this.props;
    customerOrders &&
      customerOrders
        .sort((a, b) => b.id - a.id)
        .forEach((order) => {
          let preTotal;
          let product;
          let msrp;
          if (order.Product) {
            msrp = order.msrpEdited ? order.msrpEdited : order.Product.msrp;
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
            preTotal = order.orderQty * parseFloat(msrp !== null ? msrp : 0);
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
          } = customerProductDiscountsTotals(
            order,
            discountsPOJO,
            product,
            null,
            null,
            null,
            this.props.currentPurchaseOrder,
          );

          totals.subTotal += customerProductDiscountsTotal;
          totals.quantity += order.orderQty;
          const DiscountsNameList = () => {
            let ordered = order.discounts
              .sort((a, b) => a.order - b.order)
              .map((discount) => discounts[discount.DiscountId])
              .filter((x) => x);
            return (
              <div className={this.props.classes.discountList}>
                {ordered.map((discount) => (
                  <Tooltip title={discount.dealerDiscount.name}>
                    <div className={this.props.classes.discountListItem} key={discount.dealerDiscount.id}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '2px solid #00000038',
                          borderBottomStyle: 'dashed',
                        }}
                      >
                        <span> {discount.dealerDiscount.name.substring(0, 25) + '  (' + discount.value + ')'}</span>
                        <span> {numberToDollars(discount.amount)}</span>
                      </div>
                    </div>
                  </Tooltip>
                ))}
              </div>
            );
          };
          const DiscountsSubtotalList = () => {
            let ordered = order.discounts
              .sort((a, b) => a.order - b.order)
              .map((discount) => discounts[discount.DiscountId])
              .filter((x) => x);
            return (
              <div className={this.props.classes.discountList}>
                {ordered.map((discount) => (
                  <div className={this.props.classes.discountListItem} key={discount.dealerDiscount.id}>
                    {numberToDollars(discount.amount)}
                  </div>
                ))}
              </div>
            );
          };

          // const preTotal = isSeedCompany
          //   ? order.orderQty * parseFloat(order.Product.msrp)
          //   : order.orderQty * parseFloat(order.CustomProduct.costUnit);
          // const discountAmount = 0;

          let allLotsDelivered =
            oldDeliveryReceipt &&
            oldDeliveryReceipt
              .filter((dd) =>
                order.productId
                  ? dd.productId === order.productId
                  : order.customProductId === order.customProductId && dd.customerMonsantoProductId === order.id,
              )
              .map((d) => parseFloat(d.amountDelivered || 0) || 0)
              .reduce((partialSum, a) => partialSum + a, 0);
          let allLotsReturned = oldReturnDeliveryReceipt
            .filter((dd) =>
              order.productId
                ? dd.productId === order.productId
                : order.customProductId === order.customProductId && dd.customerMonsantoProductId === order.id,
            )
            .map((d) => parseFloat(d.amountDelivered || 0) || 0)
            .reduce((partialSum, a) => partialSum + a, 0);

          const returnQty = allLotsReturned.length === 0 ? 0 : parseFloat(allLotsReturned);
          const remainQty = parseFloat(order.orderQty) + returnQty - parseFloat(allLotsDelivered);
          totalDiscount += discountAmount;
          const total = preTotal - discountAmount;
          parseFloat(order.orderQty) !== 0 &&
            tableData.push({
              qty: parseFloat(order.orderQty).toFixed(2),
              preTotal: preTotal,
              discountTotal: discountAmount.toFixed(2),
              discountName: <DiscountsNameList />,
              discountSubtotal: <DiscountsSubtotalList />,
              total: total.toFixed(2),
              Product: product,
              msrp: msrp,
              id: order.id,
              order,
              productId: order.productId ? order.productId : order.customProductId,
              remainQty: remainQty.toFixed(2),
              returnQty: returnQty.toFixed(2),
              quantityDelivered: (
                <p id="deliverdQty">{allLotsDelivered.length === 0 ? 0 : parseFloat(allLotsDelivered).toFixed(2)}</p>
              ),
            });
        });
    let tableHeaders = [
      {
        Header: '',
        maxWidth: 35,
        expander: true,
        Expander: ({ isExpanded, ...rest }) => {
          if (rest.original.relatedProducts) {
            return;
          }
          return <div>{isExpanded ? <ArrowDown /> : <ArrowRight />}</div>;
        },
      },
      {
        Header: 'Product Type',
        show: true,
        id: 'product',
        minWidth: 150,
        accessor: (d) => d,
        Cell: (props) => {
          const { classes, seedSizes, packagings, products, customProducts, seedCompanies } = this.props;
          const order = props.value;
          if (order.relatedProducts) {
            return order.relatedProducts;
          }

          const isMonsantoSeedCompany = order.order.hasOwnProperty('monsantoProductId');
          const isSent = isMonsantoSeedCompany ? order.order.isSent : false;
          const product = order.Product.length > 0 ? order.Product[0] : order.Product;

          const seedCompany =
            order.Product.length > 0
              ? seedCompanies.filter((s) => s.id === product.seedCompanyId)[0]
              : order.Product.SeedCompany || order.Product.ApiSeedCompany;
          const isSeedCompany = !!seedCompany && !isMonsantoSeedCompany;
          let productFirstLine = '';
          let productSecondLine = '';
          let productSeedType = product.seedType ? product.seedType.toLowerCase() : this.getProductType(product);
          let productCost;
          let productPackagingValue = [];
          if (seedCompany) {
            productFirstLine += `${seedCompany.name} `;
            const metadata = JSON.parse(seedCompany.metadata);
            productFirstLine += metadata[productSeedType] ? metadata[productSeedType].brandName : '';
          } else if (product.length > 0) {
            productFirstLine += product.name;
            productSecondLine += product.description;
          }

          if (product.companyId) {
            productFirstLine = product.name;
            productSecondLine = product.description;
            productCost = `UN-${product.costUnit}`;
          } else {
            if (product.blend) productSecondLine += `${product.blend}`;
            if (product.brand) productSecondLine += ` ${product.brand}`;
            if (product.treatment) productSecondLine += ` ${product.treatment}`;

            if (product.LineItem) {
              //Monsanto
              const unit = JSON.parse(product.LineItem.suggestedDealerMeasurementUnitCode).value;
              productCost = `${unit}-${product.LineItem.suggestedDealerPrice}`;
              if (product.packaging) productSecondLine += ` ${product.packaging}`;
            } else {
              productCost = `MSRP-${product.msrp}`;
            }
          }
          //productPackagingValue
          const productPackaging = product.ProductPackaging;
          if (productPackaging) {
            productPackaging.packagingGroups
              .filter((packagingGroup) => packagingGroup.CustomerProductId === order.id)
              .forEach((packagingGroup, index) => {
                const seedSize = seedSizes.find((_seedSize) => _seedSize.id === packagingGroup.seedSizeId);
                const packaging = packagings.find((_packaging) => _packaging.id === packagingGroup.packagingId);
                // const sp = `${seedSize ? seedSize.name : "-"} / ${
                //   packaging ? packaging.name : "-"
                // }`;
                if (seedSize) {
                  productPackagingValue.push(`Size: ${seedSize.name}`);
                }
                if (packaging) {
                  productPackagingValue.push(`Package: ${packaging.name}`);
                }
                // if (index > 0) productPackagingValue += ";";
                // productPackagingValue = productPackagingValue + sp;
              });
          }
          if (order.order.comment) {
            productPackagingValue.push(`Comment: ${order.order.comment}`);
          }
          let showSeedSource = false;
          if (product.seedType && seedCompany) {
            if (seedCompany.metadata) {
              let metadata = JSON.parse(seedCompany.metadata);
              let st = productSeedType.toLowerCase();
              let matchingKeyIdx = -1;
              let metadataKeys = Object.keys(metadata);
              metadataKeys.forEach((key, idx) => {
                if (key.toLowerCase() === st) matchingKeyIdx = idx;
              });
              if (matchingKeyIdx !== -1) {
                if (metadata[metadataKeys[matchingKeyIdx]].seedSource === true) showSeedSource = true;
              }
            }
          }
          return (
            <div className={classes.productDetailRow}>
              {this.state.subjectName !== 'Quote' && isMonsantoSeedCompany && !isSent && (
                <CheckBox
                  onChange={this.handleMonsantoProductPendingCheckbox(order.order)}
                  checked={this.state.syncMonsantoProductIds.includes(order.order.id)}
                />
              )}
              <div style={{ minWidth: '10em' }}>
                <p className={this.props.classes.companyBrand}>{productFirstLine}</p>
                <b>{productSecondLine}</b>
                <p> {this.renderFarmExtra(order.order, order.order.farmId)}</p>
                {/* <br /> */}
                {/* {productCost} */}
                {productPackagingValue.length > 0 && (
                  <React.Fragment>
                    <br />
                    {productPackagingValue.join(' | ')}
                  </React.Fragment>
                )}
                {showSeedSource && (
                  <React.Fragment>
                    <br />
                    SeedSource: {`${product.seedSource}`}
                  </React.Fragment>
                )}
                {order.order.relatedCustomProducts &&
                  order.order.relatedCustomProducts.map((relatedCustomProduct, index) => (
                    <React.Fragment key={index}>
                      <br />
                      <span style={{ fontSize: 10 }}>
                        Treatment: {relatedCustomProduct.CompanyName}/{relatedCustomProduct.productType}/
                        {relatedCustomProduct.productName}
                        {relatedCustomProduct.orderQty} {relatedCustomProduct.unit} <sup>*</sup>
                      </span>
                    </React.Fragment>
                  ))}
                {isMonsantoSeedCompany && <br />}
                {isMonsantoSeedCompany && product.crossReferenceId}
              </div>
              <div>
                {isMonsantoSeedCompany && !isSent && !currentPurchaseOrder.isQuote && (
                  <Tooltip title="Product haven't synced to Bayer yet">
                    <WarningIcon className={classes.warningIcon} />
                  </Tooltip>
                )}
              </div>
            </div>
          );
        },
      },
      {
        Header: 'OrderDate',
        show: showOrderDate,
        accessor: (d) => d,
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
        id: 'orderDate',
        sortable: true,

        Cell: (props) => {
          const order = props.value;

          return <div>{moment.utc(order.order.orderDate).format('MM-DD-YYYY')}</div>;
        },
      },

      {
        Header: 'No. of Units',
        show: true,
        accessor: 'qty',
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
        sortable: true,
      },
      {
        Header: 'MSRP',
        id: 'msrp',
        show: true,
        accessor: (d) => d,
        sortable: true,

        Cell: (props) => {
          const order = props.value;
          const product = order.Product;
          const msrpEdited = order.order.msrpEdited;

          let msrp = product.hasOwnProperty('classification')
            ? parseFloat(order.preTotal) / parseFloat(order.qty)
            : product.hasOwnProperty('customId')
            ? product.costUnit
            : product.msrp;
          return (
            <Tooltip title={`Original MSRP : ${numberToDollars(parseFloat(msrp))}`}>
              <div>{numberToDollars(parseFloat(msrpEdited ? msrpEdited : msrp))}</div>
            </Tooltip>
          );
        },
      },
      {
        Header: 'Pre-total',
        id: 'preTotal',
        show: true,
        accessor: (d) => d,
        Cell: (props) => {
          return numberToDollars(props.value.preTotal);
        },
        sortable: true,
        sortMethod: (a, b) => {
          return parseFloat(a.preTotal) - parseFloat(b.preTotal);
        },
      },
      {
        Header: 'Discount Name',
        show: true,
        accessor: 'discountName',
        sortable: true,
        width: 250,

        sortMethod: (a, b) => {
          return a.props.children && a.props.children.localeCompare(b.props.children);
        },
      },
      // {
      //   Header: 'Discount Amount',
      //   id: 'discountAmount',
      //   show: true,
      //   accessor: 'discountSubtotal',
      // },

      {
        Header: 'Discounts Total',
        id: 'discountsTotal',
        show: true,
        accessor: (d) => d,
        Cell: (props) => {
          return numberToDollars(props.value.discountTotal);
        },
        sortable: true,
        sortMethod: (a, b) => {
          return a.props.children && parseFloat(a.props.children) - parseFloat(b.props.children);
        },
      },
      {
        Header: 'Total',
        show: true,
        id: 'total',
        accessor: (d) => d,
        sortMethod: (a, b) => {
          return parseFloat(a.preTotal - a.discountTotal) - parseFloat(b.preTotal - b.discountTotal);
        },
        sortable: true,
        Cell: (props) => {
          const item = props.value;
          return numberToDollars(item.preTotal - item.discountTotal);
        },
      },
      {
        Header: 'Field Name',
        show: true,
        id: 'field',
        show: showDelivery,

        accessor: (d) => d,
        Cell: (props) => {
          const order = props.value;
          const fieldId = `${order.id}-field-name`;

          return (
            <CustomInput
              id={fieldId}
              inputProps={{
                value: fieldNames[fieldId] || order.order.fieldName || '',
                onChange: (e) => this.updateOrder(order, { fieldName: e.target.value }, `${order.id}-field-name`),
                disabled: subjectName === 'Invoice',
              }}
            />
          );
        },
      },
      {
        Header: (
          <p id="qtyDelivered" style={{ display: 'contents' }}>
            {' '}
            Qty Delivered
          </p>
        ),
        show: showDelivery,
        id: 'quantityDelivered',
        accessor: 'quantityDelivered',
        sortMethod: (a, b) => {
          return a.props.children !== undefined && parseFloat(a.props.children) - parseFloat(b.props.children);
        },
        sortable: true,
      },
      {
        Header: 'Qty Returned',
        show: showDelivery,
        id: 'returnQty',
        accessor: 'returnQty',
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
        sortable: true,
      },
      {
        Header: 'Qty Remaining',
        show: showDelivery,
        id: 'remainQty',
        accessor: 'remainQty',
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
        sortable: true,
      },
      {
        Header: '',
        show: selectedTab === 'simpleView' ? false : true,
        id: 'actions',
        accessor: (d) => d,
        maxWidth: 60,
        sortable: false,
        Cell: (props) => (
          <React.Fragment>
            <IconButton
              aria-label="delete"
              onClick={this.handleTableItemActionMenuOpen(props.value)}
              id="productActions"
            >
              <MoreHorizontalIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        ),
      },
    ];

    return { tableData, tableHeaders, totalDiscount, totals };
  }
  getProductType(product) {
    const typesMap = {
      C: 'CORN',
      B: 'SOYBEAN',
      S: 'SORGHUM',
      // A: 'ALFALFA',
      L: 'CANOLA',
      P: 'PACKAGING',
    };
    return typesMap[product.classification];
  }

  getTableDataMonsanto(customerOrders, farmId) {
    const { subjectName } = this.props;
    const { fieldNames } = this.state;
    const { deliveryReceipts, currentPurchaseOrder } = this.props;
    const oldDeliveryReceipt = [];
    const oldReturnDeliveryReceipt = [];

    deliveryReceipts
      .filter((d) => d.isReturn == false)
      .forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldDeliveryReceipt.push(ddd)));
    deliveryReceipts
      .filter((d) => d.isReturn == true)
      .forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldReturnDeliveryReceipt.push(ddd)));
    const { showDelivery, showOrderDate } = this.props;
    let tableHeaders1 = [
      {
        Header: (
          <span>
            <CheckBox
              onChange={this.handleMonsantoProductPendingCheckboxAll(customerOrders)}
              // checked={this.state.syncMonsantoProductIds.includes(product.id)}
            />
            Product
          </span>
        ),
        show: true,
        id: 'customer',
        minWidth: 200,
        accessor: (d) => d,
        Cell: (props) => {
          const { classes, seedSizes, packagings } = this.props;
          const order = props.value;
          if (order.relatedProducts) {
            return order.relatedProducts;
          }

          const isMonsantoSeedCompany = order.order.hasOwnProperty('monsantoProductId');
          const isSent = isMonsantoSeedCompany ? order.order.isSent : false;
          const product = order.Product.length > 0 ? order.Product[0] : order.Product;
          const seedCompany = order.Product.SeedCompany || order.Product.ApiSeedCompany;
          const isSeedCompany = !!seedCompany && !isMonsantoSeedCompany;
          let productFirstLine = '';
          let productSecondLine = '';
          let productSeedType = product.seedType ? product.seedType.toLowerCase() : this.getProductType(product);
          let productCost;
          let productPackagingValue = [];
          if (seedCompany) {
            productFirstLine += `${seedCompany.name} / `;
            const metadata = JSON.parse(seedCompany.metadata);
            productFirstLine += metadata[productSeedType] ? metadata[productSeedType].brandName : '';
          }

          if (product.companyId) {
            productFirstLine = product.name;
            productSecondLine = product.description;
            productCost = `UN-${product.costUnit}`;
          } else {
            if (product.blend) productSecondLine += `${product.blend}`;
            if (product.brand) productSecondLine += ` / ${product.brand}`;
            if (product.treatment) productSecondLine += ` / ${product.treatment}`;
            if (product.blend == null && product.brand == null) productSecondLine += ` / ${product.productDetail}`;

            if (product.LineItem) {
              //Monsanto
              const unit = JSON.parse(product.LineItem.suggestedDealerMeasurementUnitCode).value;
              productCost = `${unit}-${product.LineItem.suggestedDealerPrice}`;
              if (product.seedSize) {
                productSecondLine += order.order.isPickLater == true ? '' : ` / ${product.seedSize}`;
              }
              if (product.packaging)
                productSecondLine += order.order.isPickLater == true ? '' : ` / ${product.packaging}`;
            } else {
              productCost = `MSRP-${product.msrp}`;
            }
          }
          //productPackagingValue
          const productPackaging = product.ProductPackaging;
          if (productPackaging) {
            productPackaging.packagingGroups
              .filter((packagingGroup) => packagingGroup.CustomerProductId === order.id)
              .forEach((packagingGroup, index) => {
                const seedSize = seedSizes.find((_seedSize) => _seedSize.id === packagingGroup.seedSizeId);
                const packaging = packagings.find((_packaging) => _packaging.id === packagingGroup.packagingId);
                // const sp = `${seedSize ? seedSize.name : "-"} / ${
                //   packaging ? packaging.name : "-"
                // }`;
                if (seedSize) {
                  productPackagingValue.push(`Size: ${seedSize.name}`);
                }
                if (packaging) {
                  productPackagingValue.push(`Package: ${packaging.name}`);
                }
                // if (index > 0) productPackagingValue += ";";
                // productPackagingValue = productPackagingValue + sp;
              });
          }
          if (order.order.comment) {
            productPackagingValue.push(`Comment: ${order.order.comment}`);
          }
          let showSeedSource = false;
          if (product.seedType && seedCompany) {
            if (seedCompany.metadata) {
              let metadata = JSON.parse(seedCompany.metadata);
              let st = productSeedType.toLowerCase();
              let matchingKeyIdx = -1;
              let metadataKeys = Object.keys(metadata);
              metadataKeys.forEach((key, idx) => {
                if (key.toLowerCase() === st) matchingKeyIdx = idx;
              });
              if (matchingKeyIdx !== -1) {
                if (metadata[metadataKeys[matchingKeyIdx]].seedSource === true) showSeedSource = true;
              }
            }
          }
          return (
            <div className={classes.productDetailRow}>
              {this.props.subjectName !== 'Quote' &&
                isMonsantoSeedCompany &&
                !isSent &&
                order.qty >= 0 &&
                order.order.isPickLater !== true && (
                  <CheckBox
                    onChange={this.handleMonsantoProductPendingCheckbox(order.order)}
                    checked={this.state.syncMonsantoProductIds.includes(order.order.id)}
                    disabled={order.order.isPickLater}
                  />
                )}
              <div>
                <p className={this.props.classes.companyBrand}>{productFirstLine}</p>
                <b>{productSecondLine}</b>
                {/* <br /> */}
                {/* {productCost} */}
                {isSeedCompany && productPackagingValue.length > 0 && (
                  <React.Fragment>
                    <br />
                    {productPackagingValue.join(' | ')}
                  </React.Fragment>
                )}
                {showSeedSource && (
                  <React.Fragment>
                    <br />
                    SeedSource: {`${product.seedSource}`}
                  </React.Fragment>
                )}
                {order.order.relatedCustomProducts &&
                  order.order.relatedCustomProducts.map((relatedCustomProduct, index) => (
                    <React.Fragment key={index}>
                      <br />
                      <span style={{ fontSize: 10 }}>
                        Treatment: {relatedCustomProduct.CompanyName}/{relatedCustomProduct.productType}/
                        {relatedCustomProduct.productName}
                        {relatedCustomProduct.orderQty} {relatedCustomProduct.unit} <sup>*</sup>
                      </span>
                    </React.Fragment>
                  ))}
                {isMonsantoSeedCompany && <br />}
                {/* {isMonsantoSeedCompany && product.crossReferenceId} */}
                {this.renderFarmExtra(order.order, order.order.farmId)}
              </div>
              {this.props.subjectName !== 'Quote' &&
                isMonsantoSeedCompany &&
                !isSent &&
                order.qty >= 0 &&
                !currentPurchaseOrder.isQuote &&
                order.order.isPickLater !== true && (
                  <Tooltip title="Product haven't synced to Bayer yet">
                    <WarningIcon className={classes.warningIcon} />
                  </Tooltip>
                )}

              {order.order.isPickLater == true && (
                <Tooltip title="Still need to pick seed size/packaging">
                  <AccessTimeIcon />
                </Tooltip>
              )}
            </div>
          );
        },
      },
      {
        Header: 'OrderDate',
        show: showOrderDate,
        accessor: (d) => d,
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
        id: 'orderDate',
        sortable: true,

        Cell: (props) => {
          const order = props.value;

          return <div>{moment.utc(order.order.orderDate).format('MM-DD-YYYY')}</div>;
        },
      },

      {
        Header: 'No. of Units',
        show: true,
        accessor: 'qty',
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
        sortable: true,
      },
      {
        Header: 'MSRP',
        id: 'msrp',
        show: true,
        sortable: true,
        accessor: (d) => d,
        Cell: (props) => {
          const order = props.value;
          const product = order.Product;
          const msrpEdited = order.order.msrpEdited;

          let msrp = product.hasOwnProperty('classification')
            ? order.msrp || parseFloat(order.preTotal) / parseFloat(order.qty)
            : product.hasOwnProperty('customId')
            ? product.costUnit
            : product.msrp;
          return (
            <Tooltip title={`Original MSRP : ${numberToDollars(parseFloat(msrp))}`}>
              <div>{numberToDollars(parseFloat(msrpEdited ? msrpEdited || 0 : msrp || 0))}</div>
            </Tooltip>
          );
        },
      },
      {
        Header: 'Pre-total',
        id: 'preTotal',
        show: true,
        sortable: true,
        sortMethod: (a, b) => {
          return parseFloat(a.preTotal) - parseFloat(b.preTotal);
        },
        accessor: (d) => d,
        Cell: (props) => {
          return numberToDollars(props.value.preTotal);
        },
      },
      {
        Header: 'Discount Name',
        show: true,
        accessor: 'discountName',
        width: 250,

        sortable: true,
        sortMethod: (a, b) => {
          return a.props.children && a.props.children.localeCompare(b.props.children);
        },
      },
      // {
      //   Header: 'Discount Amount',
      //   id: 'discountAmount',
      //   show: true,
      //   accessor: 'discountSubtotal',
      //   sortable: true,
      //   sortMethod: (a, b) => {
      //     return a.props.children && parseFloat(a.props.children) - parseFloat(b.props.children);
      //   },
      // },
      {
        Header: 'Discounts Total',
        id: 'discountsTotal',
        show: true,
        accessor: (d) => d,
        Cell: (props) => {
          return numberToDollars(props.value.discountTotal);
        },
      },
      {
        Header: 'Total',
        show: true,
        id: 'total',
        accessor: (d) => d,
        sortMethod: (a, b) => {
          return parseFloat(a.preTotal - a.discountTotal) - parseFloat(b.preTotal - b.discountTotal);
        },
        sortable: true,
        Cell: (props) => {
          const item = props.value;
          return numberToDollars(item.preTotal - item.discountTotal);
        },
      },
      {
        Header: 'Field Name',
        show: true,
        id: 'field',
        accessor: (d) => d,
        show: showDelivery,

        Cell: (props) => {
          const order = props.value;
          const fieldId = `${order.id}-field-name`;
          return (
            <CustomInput
              id={fieldId}
              inputProps={{
                value: fieldNames[fieldId] || order.order.fieldName || '',
                onChange: (e) => this.updateOrder(order, { fieldName: e.target.value }, `${order.id}-field-name`),
                disabled: subjectName === 'Invoice',
              }}
            />
          );
        },
      },
      {
        Header: (
          <p id="qtyDelivered" style={{ display: 'contents' }}>
            {' '}
            Qty Delivered
          </p>
        ),
        show: showDelivery,
        id: 'quantityDelivered',
        accessor: 'quantityDelivered',
        sortMethod: (a, b) => {
          return a.props.children !== undefined && parseFloat(a.props.children) - parseFloat(b.props.children);
        },
        sortable: true,
      },
      {
        Header: 'Qty Returned',
        show: showDelivery,
        id: 'returnQty',
        accessor: 'returnQty',
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
        sortable: true,
      },
      {
        Header: 'Qty Remaining',
        show: showDelivery,
        id: 'remainQty',
        accessor: 'remainQty',
        sortMethod: (a, b) => {
          return parseFloat(a) - parseFloat(b);
        },
        sortable: true,
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
            <IconButton
              aria-label="delete"
              onClick={this.handleTableItemActionMenuOpen(props.value)}
              id="productActions"
            >
              <MoreHorizontalIcon fontSize="small" />
            </IconButton>
          </React.Fragment>
        ),
      },
    ];
    let totalDiscount1 = 0;
    let preTotal1 = 0;
    let tableData1 = [];
    let tableDataReturn = [];
    let subTotal1 = 0;
    let totals = {
      subTotal: 0,
      quantity: 0,
    };

    const filterOrders = customerOrders
      .filter((order) => order.farmId)
      .filter((order) => order.monsantoProductId)
      // .filter(order => order.orderQty !== 0)
      .filter((order) => {
        if (order.MonsantoProduct && order.isDeleted) return null;
        return order;
      });

    filterOrders.forEach((order) => {
      const { MonsantoProduct, monsantoProductId } = order;
      let preTotal;
      let product;
      let msrp;
      let assignValue = 0;
      filterOrders.filter((f) => f.pickLaterProductId == order.id).map((s) => (assignValue += parseFloat(s.orderQty)));
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

        preTotal =
          (order.isPickLater == true ? order.pickLaterQty : order.orderQty) * parseFloat(msrp !== null ? msrp : 0);
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
      } = customerProductDiscountsTotals(
        order,
        discountsPOJO,
        product,
        null,
        null,
        null,
        this.props.currentPurchaseOrder,
      );
      totals.subTotal += customerProductDiscountsTotal;
      totals.quantity += order.orderQty;
      const DiscountsNameList = () => {
        let ordered = order.discounts
          .sort((a, b) => a.order - b.order)
          .map((discount) => discounts[discount.DiscountId])
          .filter((x) => x);
        return (
          <div className={this.props.classes.discountList}>
            {ordered.map((discount) => (
              <Tooltip title={discount.dealerDiscount.name}>
                <div className={this.props.classes.discountListItem} key={discount.dealerDiscount.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '2px solid #00000038',
                      borderBottomStyle: 'dashed',
                    }}
                  >
                    <span> {discount.dealerDiscount.name.substring(0, 25) + '  (' + discount.value + ')'}</span>
                    <span> {numberToDollars(discount.amount)}</span>
                  </div>
                </div>
              </Tooltip>
            ))}
          </div>
        );
      };
      const DiscountsSubtotalList = () => {
        let ordered = order.discounts
          .sort((a, b) => a.order - b.order)
          .map((discount) => discounts[discount.DiscountId])
          .filter((x) => x);
        return (
          <div className={this.props.classes.discountList}>
            {ordered.map((discount) => (
              <div className={this.props.classes.discountListItem} key={discount.dealerDiscount.id}>
                {numberToDollars(discount.amount)}
              </div>
            ))}
          </div>
        );
      };

      // const preTotal = isSeedCompany
      //   ? order.orderQty * parseFloat(order.Product.msrp)
      //   : order.orderQty * parseFloat(order.CustomProduct.costUnit);
      // const discountAmount = 0;
      let allLotsDelivered =
        oldDeliveryReceipt &&
        oldDeliveryReceipt
          .filter(
            (dd) =>
              dd &&
              monsantoProductId &&
              dd.monsantoProductId === MonsantoProduct.id &&
              dd.customerMonsantoProductId === order.id,
          )
          .map((d) => parseFloat(d.amountDelivered || 0) || 0)
          .reduce((partialSum, a) => partialSum + a, 0);
      let allLotsReturned = oldReturnDeliveryReceipt
        .filter(
          (dd) =>
            dd &&
            monsantoProductId &&
            dd.monsantoProductId === MonsantoProduct.id &&
            dd.customerMonsantoProductId === order.id,
        )
        .map((d) => parseFloat(d.amountDelivered || 0) || 0)
        .reduce((partialSum, a) => partialSum + a, 0);

      const returnQty = allLotsReturned.length === 0 ? 0 : parseFloat(allLotsReturned);
      const remainQty = parseFloat(order.orderQty) + returnQty - parseFloat(allLotsDelivered);
      totalDiscount1 += discountAmount;
      preTotal1 += parseFloat(preTotal);
      const total = preTotal - discountAmount;
      subTotal1 += total;

      order.pickLaterProductId == null &&
        (order.pickLaterQty !== assignValue || (assignValue == 0 && order.pickLaterQty == 0)) &&
        tableData1.push({
          qty:
            order.isPickLater == true
              ? `${parseFloat(assignValue).toFixed(2)} /${parseFloat(order.pickLaterQty).toFixed(2)}`
              : parseFloat(order.orderQty).toFixed(2),
          preTotal: preTotal,
          msrp: msrp,
          discountTotal: discountAmount.toFixed(2),
          discountName: <DiscountsNameList />,
          discountSubtotal: <DiscountsSubtotalList />,
          total: total.toFixed(2),
          Product: product,
          id: order.id,
          order,
          returnQty: returnQty.toFixed(2),
          remainQty: remainQty.toFixed(2),
          quantityDelivered: (
            <p id="deliverdQty">{allLotsDelivered.length === 0 ? 0 : parseFloat(allLotsDelivered).toFixed(2)}</p>
          ),
        });
    });

    let syncWarning1 = false;
    const c = customerOrders
      .filter((order) => order.farmId)
      .filter((order) => order.monsantoProductId)
      .filter((order) => order.isSent == false)
      .filter((order) => {
        if (order.MonsantoProduct && order.isDeleted) return null;
        return order;
      });
    if (c.length > 0) {
      syncWarning1 = true;
    }
    return { tableData1, tableHeaders1, totalDiscount1, preTotal1, subTotal1, syncWarning1, totals, tableDataReturn };
  }

  getReturnTableData = (selectedTab) => {
    let totalDiscount1 = 0;

    let tableDataReturn = [];
    let nonBayerReturnData = [];
    let totals = {
      subTotal: 0,
      quantity: 0,
    };
    const {
      deliveryReceipts,
      currentPurchaseOrder,
      customerReturnProducts,
      products,
      monsantoProducts,
      customProducts,
    } = this.props;
    const oldDeliveryReceipt = [];
    deliveryReceipts.forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldDeliveryReceipt.push(ddd)));
    const { showDelivery } = this.state;

    customerReturnProducts
      // .filter((order) => console.log(!order.farmId))

      // .filter(order => order.orderQty !== 0)
      .filter((order) => {
        if (order.isDeleted) return null;
        return order;
      })
      .forEach((order) => {
        const { monsantoProductId } = order;

        let preTotal;
        let product;
        let msrp;
        if (order.productId) {
          msrp = order.msrpEdited ? order.msrpEdited || 0 : products.filter((p) => p.id === order.productId).msrp || 0;
          preTotal = order.returnOrderQty * parseFloat(msrp);
          preTotal = preTotal.toFixed(2) || 0;
          product = products.filter((p) => p.id === order.productId);
        } else if (order.customProductId) {
          msrp = order.msrpEdited
            ? order.msrpEdited
            : customProducts.filter((cp) => cp.id === order.customProductId).costUnit;
          preTotal = order.returnOrderQty * parseFloat(msrp);
          preTotal = preTotal.toFixed(2) || 0;
          product = customProducts.filter((cp) => cp.id === order.customProductId);
        } else if (order.monsantoProductId !== null && order.monsantoProductId) {
          msrp = order.msrpEdited ? order.msrpEdited : order.price;
          preTotal = order.returnOrderQty * parseFloat(msrp);
          preTotal = preTotal.toFixed(2) || 0;
          product = monsantoProducts.filter((cmp) => cmp.id === order.monsantoProductId);
        }

        const discountsPOJO =
          order &&
          order.discounts
            .map((discount) => {
              return this.props.dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
            })
            .filter((el) => el);
        const {
          discounts,
          discountAmount,
          total: customerProductDiscountsTotal,
        } = customerProductDiscountsTotals(
          order,
          discountsPOJO,
          product,
          null,
          null,
          null,
          this.props.currentPurchaseOrder,
        );
        totals.subTotal += customerProductDiscountsTotal;
        totals.quantity += order.orderQty;
        const DiscountsNameList = () => {
          let ordered = order.discounts
            .sort((a, b) => a.order - b.order)
            .map((discount) => discounts[discount.DiscountId])
            .filter((x) => x);
          return (
            <div className={this.props.classes.discountList}>
              {ordered.map((discount) => (
                <Tooltip title={discount.dealerDiscount.name}>
                  <div className={this.props.classes.discountListItem} key={discount.dealerDiscount.id}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '2px solid #00000038',
                        borderBottomStyle: 'dashed',
                      }}
                    >
                      <span> {discount.dealerDiscount.name.substring(0, 25) + '  (' + discount.value + ')'}</span>
                      <span> {numberToDollars(discount.amount)}</span>
                    </div>
                  </div>
                </Tooltip>
              ))}
            </div>
          );
        };

        let allLotsDelivered =
          oldDeliveryReceipt &&
          oldDeliveryReceipt
            .filter(
              (dd) =>
                dd &&
                monsantoProductId &&
                dd.monsantoProductId === monsantoProductId &&
                dd.customerMonsantoProductId === order.id,
            )
            .map((d) => parseFloat(d.amountDelivered || 0) || 0)
            .reduce((partialSum, a) => partialSum + a, 0);

        let allLotsDeliveredNonBayer =
          oldDeliveryReceipt &&
          oldDeliveryReceipt
            .filter((dd) =>
              order.productId !== null
                ? dd.productId === order.productId
                : order.customProductId === order.customProductId && dd.customerMonsantoProductId === order.id,
            )
            .map((d) => parseFloat(d.amountDelivered || 0) || 0)
            .reduce((partialSum, a) => partialSum + a, 0);

        const remainQty = parseFloat(order.orderQty).toFixed(2) - parseFloat(allLotsDelivered);

        const DiscountsSubtotalList = () => {
          let ordered = order.discounts
            .sort((a, b) => a.order - b.order)
            .map((discount) => discounts[discount.DiscountId])
            .filter((x) => x);
          return (
            <div className={this.props.classes.discountList}>
              {ordered.map((discount) => (
                <div className={this.props.classes.discountListItem} key={discount.dealerDiscount.id}>
                  {numberToDollars(discount.amount)}
                </div>
              ))}
            </div>
          );
        };

        // const preTotal = isSeedCompany
        //   ? order.orderQty * parseFloat(order.Product.msrp)
        //   : order.orderQty * parseFloat(order.CustomProduct.costUnit);
        // const discountAmount = 0;
        totalDiscount1 += discountAmount;
        const total = preTotal - discountAmount;
        if (order.monsantoProductId !== null) {
          tableDataReturn.push({
            qty: parseFloat(order.returnOrderQty).toFixed(2),
            preTotal: preTotal || 0,
            discountTotal: discountAmount.toFixed(2),
            discountName: <DiscountsNameList />,
            discountSubtotal: <DiscountsSubtotalList />,
            total: total.toFixed(2),
            Product: product,
            id: order.id,
            order,
            monsantoProductId: order.monsantoProductId,
            remainQty: remainQty.toFixed(2),
            quantityDelivered: (
              <p id="deliverdQty">{allLotsDelivered.length === 0 ? 0 : parseFloat(allLotsDelivered).toFixed(2)}</p>
            ),
          });
        } else {
          nonBayerReturnData.push({
            qty: parseFloat(order.returnOrderQty).toFixed(2),
            preTotal: preTotal || 0,
            discountTotal: discountAmount.toFixed(2),
            discountName: <DiscountsNameList />,
            discountSubtotal: <DiscountsSubtotalList />,
            total: total.toFixed(2),
            Product: product,
            id: order.id,
            order,
            productId: order.productId ? order.productId : order.customProductId,
            remainQty: remainQty.toFixed(2),
            quantityDelivered: (
              <p id="deliverdQty">
                {allLotsDeliveredNonBayer.length === 0 ? 0 : parseFloat(allLotsDeliveredNonBayer).toFixed(2)}
              </p>
            ),
          });
        }
      });

    return { totals, tableDataReturn, nonBayerReturnData };
  };

  updateShareholderPercentage(farmId, shareholderId, percentage) {
    const { updatePurchaseOrder } = this.props;
    const { currentPurchaseOrder: purchaseOrder } = this.props;

    const shareholdersData = purchaseOrder.farmData.find((data) => data.farmId === farmId);
    let shareholderData = shareholdersData.shareholderData.find((data) => data.shareholderId === shareholderId);
    if (shareholderData) {
      shareholderData.percentage = parseInt(percentage, 0);
    } else {
      shareholdersData.shareholderData.push({
        shareholderId: shareholderId,
        percentage: parseInt(percentage, 0),
      });
    }

    updatePurchaseOrder(purchaseOrder.customerId, purchaseOrder.id, {
      farmData: purchaseOrder.farmData,
    });
  }
  showDeliveryRow = () => {
    this.setState({ showDelivery: !this.state.showDelivery });
  };
  getShareholdersRowData(customerProduct, farmId) {
    const { shareholders, classes, currentPurchaseOrder: purchaseOrder } = this.props;
    const customer = purchaseOrder.Customer;
    let shareholdersData = [];
    if (customerProduct.hasOwnProperty('isSimple')) {
      shareholdersData = customerProduct;
    } else {
      shareholdersData = (purchaseOrder.farmData || []).find((data) => data.farmId === farmId);
    }

    let customerData = (shareholdersData !== undefined &&
      shareholdersData.shareholderData.length > 0 &&
      shareholdersData.shareholderData.find((data) => data.shareholderId === 'theCustomer')) || {
      shareholderId: 'theCustomer',
    };
    let currentOrderCustomerData = ((customerProduct && customerProduct.shareholderData) || []).find(
      (data) => data.shareholderId === 'theCustomer',
    );

    let customerRowData =
      currentOrderCustomerData &&
      (currentOrderCustomerData.hasOwnProperty('percentage')
        ? Number(currentOrderCustomerData.percentage)
        : Number(currentOrderCustomerData.units)) > 0 ? (
        <li key={'theCustomer-percent'} className={classes.shareholderValue}>
          <span className={classes.shareholderName}>{customer.name}</span>
          <span className={classes.percentageValue}>
            {currentOrderCustomerData &&
            !Number.isNaN(Number(currentOrderCustomerData.percentage || currentOrderCustomerData.units || 0))
              ? Number(currentOrderCustomerData.percentage || currentOrderCustomerData.units || 0)
              : Number(customerData.percentage || customerData.units || 0)
              ? Number(customerData.percentage || customerData.units || 0)
              : 0}

            {currentOrderCustomerData
              ? currentOrderCustomerData.hasOwnProperty('percentage')
                ? '%'
                : 'Units'
              : customerData && customerData.hasOwnProperty('percentage')
              ? '%'
              : 'Units'}
          </span>
        </li>
      ) : undefined;

    let shareholdersRowData = shareholders.map((shareholder) => {
      if (shareholder.customerId !== this.props.currentPurchaseOrder.customerId) return null;
      let currentOrderShareholderData =
        customerProduct &&
        customerProduct.shareholderData &&
        customerProduct.shareholderData.find((data) => data.shareholderId === shareholder.id);
      let purchaseOrderShareholderData = (shareholdersData &&
        shareholdersData.shareholderData &&
        shareholdersData.shareholderData.find((data) => data.shareholderId === shareholder.id)) || {
        shareholderId: shareholder.id,
      };

      if (
        !currentOrderShareholderData ||
        (currentOrderShareholderData.hasOwnProperty('percentage')
          ? Number(currentOrderShareholderData.percentage === 0) || currentOrderShareholderData.percentage === null
          : Number(currentOrderShareholderData.units === 0) || currentOrderShareholderData.units === null)
      )
        return null;

      return (
        <li key={shareholder.id} className={classes.shareholderValue}>
          <span className={classes.shareholderName}>{shareholder.name}</span>
          <span className={classes.percentageValue}>
            {currentOrderShareholderData
              ? currentOrderShareholderData.hasOwnProperty('percentage')
                ? currentOrderShareholderData.percentage || 0
                : currentOrderShareholderData.units || 0
              : purchaseOrderShareholderData.hasOwnProperty('percentage')
              ? purchaseOrderShareholderData.percentage || 0
              : purchaseOrderShareholderData.units || 0}
            {currentOrderShareholderData
              ? currentOrderShareholderData.hasOwnProperty('percentage')
                ? '%'
                : 'Units'
              : purchaseOrderShareholderData.hasOwnProperty('percentage')
              ? '%'
              : 'Units'}
          </span>
        </li>
      );
    });

    return (
      <ul className={classes.percentageList}>
        {customerRowData}
        {shareholdersRowData}
      </ul>
    );
  }
  editReplatProduct = async (order) => {
    const { editRelatedCustomProduct, editRelatedProduct, editRelatedMonsantoProduct, currentPurchaseOrder } =
      this.props;
    if (order.hasOwnProperty('customProductId')) {
      await editRelatedCustomProduct(this.props.match.params.customer_id, order.id, {
        isReplant: !order.isReplant,
      });
    } else if (order.hasOwnProperty('productId')) {
      await editRelatedProduct(this.props.match.params.customer_id, order.id, {
        isReplant: !order.isReplant,
      });
    } else {
      await editRelatedMonsantoProduct(this.props.match.params.customer_id, order.id, {
        isReplant: !order.isReplant,
        monsantoProductId: order.monsantoProductId,
      });
    }

    this.reload();
  };
  getTableRowProps = (_, rowInfo) => {
    const { recentCreatedCustomerProductId } = this.props;
    return {
      style: {
        background:
          rowInfo && rowInfo.original && rowInfo.original.id && rowInfo.original.id === recentCreatedCustomerProductId
            ? '#FFF6E1'
            : 'transparent',
      },
    };
  };

  createShareholder = (name) => {
    const { createShareholder } = this.props;
    const customerId = this.props.match.params.customer_id;
    createShareholder(customerId, { name }).then(() => {
      this.setState({
        showShareholderForm: false,
      });
    });
  };

  cancelShareholderDialog = () => {
    this.setState({
      showShareholderForm: false,
    });
  };

  cancelShareholderPercentageModal = () => {
    this.setState(
      {
        showShareholderPercentageDialog: false,
        showShareholderPercentageDialogWholeOrder: false,
        showShareHolderForWholeFarm: false,
      },
      () => {
        this.renderFarmTables();
      },
    );
  };

  closeFarmNameForm = () => {
    this.setState(
      {
        showFarmEditForm: false,
        farmToEdit: null,
      },
      () => {
        this.renderFarmTables();
      },
    );
  };

  renderFarmExtra = (order, farmId) => {
    const shareholders = this.getShareholdersRowData(order, farmId);

    return (
      <FarmRowExtra
        shareholders={shareholders}
        onAddShareholder={() => {
          this.setState({
            showShareholderPercentageDialog: true,
            shareHolderPercentageScope: order,
          });
        }}
      ></FarmRowExtra>
    );
  };

  handleMoreFuncMenuOpen = (farmId) => {
    this.setState({
      moreFuncMenuOpen: { ...this.state.moreFuncMenuOpen, [farmId]: true },
    });
  };

  handleMoreFuncMenuClose = (farmId) => {
    this.setState({
      moreFuncMenuOpen: { ...this.state.moreFuncMenuOpen, [farmId]: false },
    });
  };

  handleAddTreatementDialogOpen = (item) => {
    this.setState({
      showAddTreatmentDialog: true,
      addingRelatedCustomProductProduct: item,
    });
  };

  handleAddTreatementDialogClose = () => {
    this.setState({ showAddTreatmentDialog: false });
  };

  renderFarmTables = () => {
    const {
      classes,
      subjectName,
      shareholders,
      //updateFarm,
      deleteFarm,
      currentPurchaseOrder,
      seedCompanies,
      dealerDiscounts,
      showPerWholeOrderDiscounts,

      selectedTab,
    } = this.props;
    const {
      //showFarmEditForm,
      showShareholderPercentageDialog,
      showShareholderPercentageDialogWholeOrder,
      shareHolderPercentageScope,
      //farmToEdit,
      addingNew,
      tableItemActionAnchorEl,
      tableItemActionMenuOpen,
      fieldName,
      moreFuncMenuOpen,
      farmsExpand,
      isSyncingMonsantoProducts,
      showShareHolderForWholeFarm,
      farmId,
      showDelivery,
      allCustomerData,
    } = this.state;
    let farms = [];
    const poId = this.props.match.params.id;
    const customerId = this.props.match.params.customer_id;
    const currentCust = allCustomerData.filter((c) => c.id == customerId);

    const currentPo = currentCust.length > 0 && currentCust[0].PurchaseOrders.filter((p) => p.id == poId);
    currentCust.length > 0 &&
      currentCust[0].PurchaseOrders.map((p) => {
        p.farmData.length > 0 &&
          p.farmData.map((f) => {
            return farms.push(f);
          });
      });
    const purchaseOrder = currentPurchaseOrder !== undefined ? currentPurchaseOrder : currentPo;
    const customerShareholders = shareholders.filter((sh) => sh.customerId === purchaseOrder.customerId);

    const customer = purchaseOrder.Customer || currentCust;
    // const customerOrders = purchaseOrder.CustomerProducts.concat(
    //   purchaseOrder.CustomerCustomProducts
    // );

    let purchaseOrderFarmIds = (purchaseOrder.farmData || []).map((data) => data.farmId);
    const purchaseOrderFarms = (currentPurchaseOrder !== undefined ? customer.Farms : farms).filter((farm) =>
      purchaseOrderFarmIds.includes(farm.id),
    );

    let preTotal = 0;
    let discount = 0;
    let grandTotal = 0;
    let wholeOrderData = { subTotal: 0, quantity: 0 };
    const farmTables = purchaseOrderFarms
      .map((farm) => {
        const customerOrders = purchaseOrder.CustomerProducts.concat(purchaseOrder.CustomerCustomProducts);
        const customerOrders1 = purchaseOrder.CustomerProducts.concat(purchaseOrder.CustomerMonsantoProducts);

        const farmOrders = customerOrders.filter((order) => order.farmId && order.farmId === farm.id);
        const farmOrdersMonsanto = customerOrders1.filter((order) => order.farmId && order.farmId === farm.id);
        let { tableData, tableHeaders, totalDiscount, totals } = this.getTableData(farmOrders, farm.id);
        // let nonBayerTableData = tableData.filter((s) => Number(s.orderQty) < 0);
        tableData = tableData.filter((s) => Number(s.qty) > 0);

        let {
          tableData1,
          tableHeaders1,
          totalDiscount1,
          preTotal1,
          subTotal1,
          syncWarning1,

          totals: monsantoTotals,
        } = this.getTableDataMonsanto(farmOrdersMonsanto, farm.id);

        let { tableDataReturn, nonBayerReturnData } = this.getReturnTableData();

        preTotal += parseFloat(totals.preTotal || 0) + parseFloat(preTotal1 || 0);
        discount += parseFloat(totalDiscount || 0) + parseFloat(totalDiscount1 || 0);
        grandTotal += parseFloat(totals.subTotal || 0) + parseFloat(subTotal1 || 0);
        wholeOrderData.subTotal += monsantoTotals.subTotal + totals.subTotal;
        wholeOrderData.quantity += monsantoTotals.quantity + totals.quantity;
        const farmForm = { ...farm };
        tableData1 = sortBy(tableData1, (o) => o.Product.productDetail);
        tableData = sortBy(tableData, (o) => {
          if (o.hasOwnProperty('productId')) {
            o.Product.SeedCompany ? o.Product.SeedCompany.name : o.Product.name;
          } else {
            o.CustomProduct ? o.CustomProduct.name : o.CustomProduct.description;
          }
        });
        tableDataReturn = sortBy(tableDataReturn, (o) => o.Product.productDetail);

        return (
          <div>
            <Paper
              key={farm.id}
              className={classes.farmPaper}
              style={{ borderBottom: '5px solid #ECF3EE', marginBottom: '0px' }}
            >
              <header className={classes.farmHeader}>
                <div className={classes.farmHeaderRow}>
                  <p className={classes.farmHeaderRowText}>Farm</p>
                  {farmsExpand[farm.id] ? (
                    <Button
                      id="farmExpand"
                      className={classes.addNewButton}
                      variant="contained"
                      onClick={() => {
                        this.setState({
                          farmsExpand: { ...farmsExpand, [farm.id]: false },
                        });
                      }}
                    >
                      <ExpandMoreIcon style={{ fontSize: 40 }} />
                    </Button>
                  ) : (
                    <Button
                      id="farmExpand"
                      className={classes.addNewButton}
                      variant="contained"
                      onClick={() => {
                        this.setState({
                          farmsExpand: { ...farmsExpand, [farm.id]: true },
                        });
                      }}
                    >
                      <NavigateNextIcon style={{ fontSize: 40 }} />
                    </Button>
                  )}
                  <TextFieldWithConfirm
                    onSave={(value) => {
                      this.debouncedUpdateFarm({
                        id: farm.id,
                        name: value,
                      });
                    }}
                    placeholder="Farm Name"
                    originalValue={farmForm.name}
                    type="text"
                  />
                  {this.props.subjectName !== 'Quote' && syncWarning1 && !currentPurchaseOrder.isQuote ? (
                    <Tooltip title="Product haven't synced to Bayer yet">
                      <WarningIcon className={classes.warningIcon} />
                    </Tooltip>
                  ) : (
                    ''
                  )}
                </div>
                <Button
                  id="openMenuItem"
                  className={classes.addNewButton}
                  variant="contained"
                  buttonRef={(node) => {
                    this.moreFuncMenuAnchorEl[farm.id] = node;
                  }}
                  onClick={() => this.handleMoreFuncMenuOpen(farm.id)}
                >
                  <MoreHorizontalIcon style={{ fontSize: 40 }} />
                </Button>

                <Popover
                  open={moreFuncMenuOpen[farm.id] || false}
                  anchorEl={this.moreFuncMenuAnchorEl[farm.id]}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  onClose={() => this.handleMoreFuncMenuClose(farm.id)}
                  className="hide-print"
                >
                  <Paper>
                    <MenuItem
                      id="addProduct"
                      className={`${classes.moreFuncMenuItem} hide-print`}
                      onClick={() => {
                        this.handleMoreFuncMenuClose(farm.id);
                        this.setState({
                          showProductForm: true,
                          farmId: farm.id,
                        });
                        this.setState((state) => ({
                          // addingNew: {
                          //   ...state.addingNew,
                          //   [farm.id]: {
                          //     show: true,
                          //   },
                          // },
                        }));
                      }}
                    >
                      Add New Product
                    </MenuItem>
                    <MenuItem
                      id="addShareHolderPer"
                      className={`${classes.moreFuncMenuItem} hide-print`}
                      onClick={() => {
                        this.setState({
                          showShareHolderForWholeFarm: true,
                          farmId: farm.id,
                        });
                      }}
                    >
                      Add Shareholder distribution for Entire Farm
                    </MenuItem>
                    <MenuItem
                      className={`${classes.moreFuncMenuItem} hide-print`}
                      onClick={async () => {
                        this.handleMoreFuncMenuClose(farm.id);
                        await deleteFarm(customer.id, { id: farm.id })
                          .then((res) => {
                            this.setShowSnackbar(`Farm deleted succesfully`, 5000);
                          })
                          .catch((e) => {
                            this.setShowSnackbar(`Farm Error: ${e}`, 5000);
                          });
                      }}
                    >
                      Delete Farm
                    </MenuItem>
                  </Paper>
                </Popover>
              </header>
            </Paper>

            {farmsExpand[farm.id] && (
              <div>
                {showShareholderPercentageDialog && (
                  <FarmEditShareholder
                    closeDialog={this.cancelShareholderPercentageModal}
                    open={this.state.showShareholderPercentageDialog}
                    farmId={farm.id}
                    purchaseOrder={purchaseOrder}
                    customer={customer}
                    shareholders={customerShareholders}
                    classes={classes}
                    subjectName={subjectName}
                    customerProduct={shareHolderPercentageScope}
                    editRelatedProduct={this.debouncedUpdateOrder}
                    editRelatedCustomProduct={this.debouncedUpdateCustomOrder}
                    isWholeOrderShareHolderPercentage={false}
                  />
                )}
                <div>
                  <Paper style={{ borderBottom: '5px solid #ECF3EE' }}>
                    {!purchaseOrder.isQuote && purchaseOrder.CustomerMonsantoProducts.length > 0 && (
                      <React.Fragment>
                        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                          <Button
                            onClick={this.syncMonsantoOrders}
                            disabled={
                              isSyncingMonsantoProducts ||
                              (!customer.glnId && !customer.monsantoTechnologyId) ||
                              this.state.syncMonsantoProductIds.length == 0
                            }
                          >
                            {isSyncingMonsantoProducts ? 'Syncing With Bayer' : 'Sync With Bayer'}
                          </Button>

                          <p style={{ display: 'flex', alignContent: 'center' }}>
                            {!customer.glnId &&
                              !customer.monsantoTechnologyId &&
                              'This P.O. cannot be synced with Bayer yet because this grower has no GLN ID on file.'}
                          </p>
                          <div></div>
                        </div>
                      </React.Fragment>
                    )}

                    <ReactTable
                      id="PO_product"
                      minRows={1}
                      data={tableData1}
                      columns={tableHeaders1}
                      resizable={false}
                      showPagination={false}
                      // onExpandedChange={(newExpanded) => this.onExpandedChange1(farm.id, newExpanded)}
                      // expanded={this.state.expanded1[farm.id]}
                      getTrProps={this.getTableRowProps}
                      defaultPageSize={500}
                    />
                  </Paper>
                  {/* {tableDataReturn.length > 0 || this.props.match.url.split('/')[2] === 'dealers' ? (
                    <Paper className={classes.farmPaper}>
                      <React.Fragment>
                        <h4>Returned</h4>
                      </React.Fragment>
                      <ReactTable
                        data={tableDataReturn.sort(
                          (a, b) =>
                            a.Product.blend.localeCompare(b.Product.blend) ||
                            (a.Product.treatment && a.Product.treatment.localeCompare(b.Product.treatment)),
                        )}
                        columns={tableHeaders1}
                        minRows={1}
                        resizable={false}
                        showPagination={false}
                        pageSize={tableDataReturn.length || 0}
                        getTrProps={this.getTableRowProps}
                      />
                    </Paper>
                  ) : (
                    ''
                  )} */}

                  <Paper style={{ borderBottom: '5px solid #ECF3EE' }}>
                    <ReactTable
                      minRows={1}
                      data={tableData}
                      columns={tableHeaders}
                      resizable={false}
                      showPagination={false}
                      // onExpandedChange={(newExpanded) => this.onExpandedChange(farm.id, newExpanded)}
                      // expanded={this.state.expanded[farm.id]}
                      getTrProps={this.getTableRowProps}
                      defaultPageSize={500}
                    />
                  </Paper>
                  {/* 
                  {selectedTab === 'returnProducts' && nonBayerReturnData.length > 0 && (
                    <Paper className={classes.farmPaper}>
                      <h4>Returned</h4>
                      <ReactTable
                        data={
                          this.state.groupBySimple ? this.groupDataByproduct(nonBayerReturnData) : nonBayerReturnData
                        }
                        columns={tableHeaders}
                        minRows={1}
                        resizable={false}
                        showPagination={false}
                        pageSize={nonBayerReturnData.length || 0}
                        getTrProps={this.getTableRowProps}
                      />
                    </Paper>
                  )} */}
                  {addingNew[farm.id] && addingNew[farm.id].show && (
                    <NewFieldRow
                      seedCompanies={seedCompanies}
                      selectedProducts={addingNew[farm.id].data}
                      onOpenProductDialog={() => {
                        this.setState({
                          showProductForm: true,
                          farmId: farm.id,
                        });
                      }}
                      onAddProducts={() => {
                        this.addProducts(addingNew[farm.id].data);
                        this.setState((state) => ({
                          addingNew: {
                            ...state.addingNew,
                            [farm.id]: {
                              show: false,
                            },
                          },
                        }));
                      }}
                      fieldName={fieldName}
                      handleFieldNameChange={this.handleFieldNameChange}
                      onCancel={() => {
                        this.setState((state) => ({
                          addingNew: {
                            ...state.addingNew,
                            [farm.id]: {
                              show: false,
                            },
                          },
                        }));
                      }}
                    />
                  )}

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
                          id="editQuantity"
                          className={classes.addNewMenuItem}
                          onClick={() => {
                            this.props.onShowEditProduct(this.state.activeTableItem);
                            this.handleTableItemActionMenuClose();
                          }}
                        >
                          {this.state.activeTableItem !== null && this.state.activeTableItem.isPickLater == true
                            ? 'Edit Qty & Discount'
                            : 'Edit Qty/Discount/Product'}
                        </MenuItem>
                        <MenuItem
                          id="editMsrp"
                          className={classes.addNewMenuItem}
                          onClick={() => {
                            this.props.openMSRPEdit(this.state.activeTableItem);
                            this.handleTableItemActionMenuClose();
                          }}
                        >
                          Edit MSRP
                        </MenuItem>
                        <MenuItem
                          className={classes.addNewMenuItem}
                          onClick={async () => {
                            await this.editReplatProduct(this.state.activeTableItem);
                            this.handleTableItemActionMenuClose();
                          }}
                          id="productReplant"
                        >
                          {this.state.activeTableItem && this.state.activeTableItem.isReplant !== true
                            ? 'Mark as Replant'
                            : 'UnMark as Replant'}
                        </MenuItem>
                        <MenuItem
                          className={classes.addNewMenuItem}
                          onClick={() => {
                            this.setState({
                              showShareholderPercentageDialog: true,
                              shareHolderPercentageScope: this.state.activeTableItem,
                            });
                          }}
                        >
                          Add Shareholder Percentage/units
                        </MenuItem>
                        <MenuItem
                          id="switchFarms"
                          className={classes.addNewMenuItem}
                          onClick={() => {
                            this.setState({
                              openSwitchDialog: true,
                            });
                          }}
                        >
                          Switch Farm
                        </MenuItem>
                        {this.state.activeTableItem &&
                          this.state.activeTableItem.Product &&
                          this.state.activeTableItem.Product.hasOwnProperty('SeedCompany') && (
                            <MenuItem
                              className={classes.addNewMenuItem}
                              onClick={() => {
                                this.handleAddTreatementDialogOpen(this.state.activeTableItem);
                                this.handleTableItemActionMenuClose();
                              }}
                            >
                              Add Treatment
                            </MenuItem>
                          )}
                        {/* <MenuItem
                          className={classes.addNewMenuItem}
                          onClick={() => {
                            this.setState({
                              showMoveToDialog: true,
                            });
                            this.handleTableItemActionMenuClose();
                          }}
                        >
                          Move To
                        </MenuItem>
                        <MenuItem
                          className={classes.addNewMenuItem}
                          onClick={() => {
                            this.props.duplicateProducts(this.state.activeTableItem);
                            this.handleTableItemActionMenuClose();
                          }}
                        >
                          Duplicate
                        </MenuItem> */}
                        <MenuItem
                          className={classes.addNewMenuItem}
                          onClick={() => {
                            this.props.removeRelatedProduct(this.state.activeTableItem);
                            this.handleTableItemActionMenuClose();
                          }}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Paper>
                  </Popover>
                </div>
                <div className={classes.tableTotalRow}>
                  <h4 className={classes.tableTotalRowLabel}>Farm Totals</h4>
                  <div className={classes.tableTotalRowNumber}>
                    {numberToDollars(parseFloat(totals.discount || 0) + parseFloat(totalDiscount1 || 0) || 0)}
                  </div>
                  <div className={classes.tableTotalRowNumber}>
                    {numberToDollars(parseFloat(totals.subTotal || 0) + parseFloat(subTotal1 || 0) || 0)}
                  </div>
                </div>
              </div>
            )}
            {showShareholderPercentageDialogWholeOrder && (
              <FarmEditShareholder
                closeDialog={this.cancelShareholderPercentageModal}
                open={this.state.showShareholderPercentageDialogWholeOrder}
                farmId={farm.id}
                purchaseOrder={purchaseOrder}
                customer={customer}
                shareholders={customerShareholders}
                classes={classes}
                subjectName={subjectName}
                customerProduct={shareHolderPercentageScope}
                editRelatedProduct={this.debouncedUpdateOrder}
                editRelatedCustomProduct={this.debouncedUpdateCustomOrder}
                isWholeOrderShareHolderPercentage={true}
              />
            )}
          </div>
        );
      })
      .sort((a, b) => {
        return b.key - a.key;
      });

    const perWholeOrderDiscounts = dealerDiscounts.filter((discount) => discount.applyToWholeOrder === true);

    const selectedDiscounts = purchaseOrder.dealerDiscounts || [];
    const unselectedDiscounts = perWholeOrderDiscounts.filter(
      (discount) => !(purchaseOrder.dealerDiscounts || []).some((Ddiscount) => discount.id === Ddiscount.DiscountId),
    );
    const { orderDiscountsAmount: orderWholeDiscountsAmount, discountDetails: orderWholeDiscountDetails } =
      perWholeOrderDiscount(wholeOrderData.subTotal, wholeOrderData.quantity, purchaseOrder, perWholeOrderDiscounts);
    discount += orderWholeDiscountsAmount;
    const orderTotal = purchaseOrder.purchaseOrderTotalPayment;

    grandTotal = parseFloat(orderTotal) - discount;

    return (
      <React.Fragment>
        {farmTables}
        {/* <span>
          <sup>*</sup> The prices for these additional products are in a
          separate table
        </span> */}
        {showShareHolderForWholeFarm && (
          <FarmEntireShareholder
            closeDialog={this.cancelShareholderPercentageModal}
            open={this.state.showShareHolderForWholeFarm}
            farmId={farmId}
            purchaseOrder={purchaseOrder}
            customer={customer}
            shareholders={customerShareholders}
            classes={classes}
            subjectName={subjectName}
            isWholeOrderShareHolderPercentage={false}
            reload={this.reload}
            customerProducts={purchaseOrder.CustomerProducts.concat(purchaseOrder.CustomerCustomProducts)
              .concat(purchaseOrder.CustomerMonsantoProducts)
              .filter((item) => item.farmId === farmId)}
            farms={purchaseOrderFarms.filter((f) => f.id == farmId)}
          />
        )}
        <Paper style={{ margin: '10px 0px' }}>
          {(showPerWholeOrderDiscounts || selectedDiscounts.length > 0) && perWholeOrderDiscounts.length > 0 && (
            <div>
              <Grid container direction="column" spacing={16}>
                <h4 style={{ margin: '15px 0px 15px 15px' }}>Whole Order Discounts</h4>
                <Sortable
                  options={{ handle: `.${classes.discountRowHandle}` }}
                  onChange={(order, sortable, e) => this.props.onDiscountsReorder(order, sortable, e)}
                >
                  {selectedDiscounts.map((discount) => {
                    const selecteddiscount = dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
                    return (
                      <div
                        style={{ marginBottom: '0px', width: '90%' }}
                        className={classes.farmHeader}
                        key={selecteddiscount.id}
                        data-id={selecteddiscount.id}
                      >
                        <CheckBox checked={true} onChange={() => this.props.removeDiscount(discount)} />

                        <span className={classes.discountLabel}>{selecteddiscount.name}</span>

                        {selecteddiscount.discountStrategy === 'Flat Amount Discount' && (
                          <span>
                            <TextField
                              className={classes.valueInput}
                              label={'Value'}
                              defaultValue={discount.discountValue}
                              style={{ width: 80 }}
                              onBlur={(e) => this.props.onValueChange(e, discount, false)}
                            />
                            <Select
                              style={{ marginLeft: '10px', marginTop: '15px' }}
                              value={discount.unit}
                              onChange={(e) => this.props.onValueChange(e, discount, true)}
                            >
                              <MenuItem value={'$'}>$</MenuItem>
                              <MenuItem value={'%'}>%</MenuItem>
                            </Select>
                          </span>
                        )}

                        <span>
                          <a
                            style={{ color: '#38A154', marginLeft: 20 }}
                            onClick={() => {
                              this.setState({
                                showShareholderPercentageDialogWholeOrder: true,
                                shareHolderPercentageScope: purchaseOrder,
                              });
                            }}
                          >
                            Add a shareholder
                          </a>
                          {this.getShareholdersRowData(purchaseOrder, this.state.farmId)}
                        </span>

                        <span style={{ marginLeft: '30px', minWidth: '0px' }} className={classes.discountLabel}>
                          {numberToDollars(orderWholeDiscountDetails[selecteddiscount.id])}
                        </span>

                        <span style={{ marginLeft: '30px' }}>
                          <TextField
                            className={classes.valueInput}
                            label={'comment'}
                            defaultValue={discount.comment}
                            style={{ width: 600, marginLeft: '60px' }}
                            onBlur={(e) => this.props.onValueChange(e, discount, 'comment')}
                          />
                        </span>

                        <span className={classes.discountRowHandle}>
                          <DragHandle />
                        </span>
                      </div>
                    );
                  })}
                </Sortable>

                <Divider />

                {unselectedDiscounts.map((discount) => {
                  return (
                    <div
                      style={{ marginBottom: '10px', width: '14%' }}
                      className={classes.farmHeader}
                      key={discount.id}
                    >
                      <CheckBox checked={false} onChange={() => this.props.addDiscount(discount)} />
                      {discount.name}
                    </div>
                  );
                })}
              </Grid>
            </div>
          )}
        </Paper>

        <Paper classes={{ root: classes.orderTotalPaper }} style={{ marginTop: '20px' }}>
          <h2 className={classes.orderTotalTitle}>Order Total</h2>
          <div className={classes.orderTotalDisplayRow}>
            <div className={classes.orderTotalDisplayContainer}>
              <p className={classes.orderTotalDisplayLabel}>Pretotal</p>
              <div className={classes.orderTotalDisplayNumber}>{numberToDollars(orderTotal || 0)}</div>
            </div>
            <div className={classes.orderTotalDisplayContainer}>
              <p className={classes.orderTotalDisplayLabel}>Discount</p>
              <div className={classes.orderTotalDisplayNumber}>{numberToDollars(discount || 0)}</div>
            </div>
            <div className={classes.orderTotalDisplayContainer}>
              <h4 className={classes.orderTotalDisplayLabel}>Grand Total</h4>
              <div className={classes.orderTotalDisplayNumber}>{numberToDollars(grandTotal || 0)}</div>
            </div>
          </div>
        </Paper>
      </React.Fragment>
    );
  };

  handleProductSelect = async (data) => {
    const { farmId } = this.state;
    this.setState((state) => ({
      showProductForm: false,
      addingNew: {
        ...state.addingNew,
        [farmId]: {
          ...state.addingNew[farmId],
          data,
        },
      },
    }));
  };

  addRelatedCustomProducts = async (data) => {
    const { currentPurchaseOrder, linkRelatedCustomProduct, editRelatedProduct, companies } = this.props;
    const { productsToOrder: relatedProducts, discounts } = data;
    const { addingRelatedCustomProductProduct } = this.state;
    const farmId = addingRelatedCustomProductProduct.farmId;
    relatedProducts.forEach(async (relatedProduct, index) => {
      await linkRelatedCustomProduct(
        currentPurchaseOrder.id,
        this.props.match.params.customer_id,
        relatedProduct.id,
        relatedProduct.orderQty,
        discounts,
        farmId,
        relatedProduct.fieldName || null,
        new Date(),
        relatedProduct.unit,
        '' + index,
      );
    });
    const relatedCustomProducts = relatedProducts.map((relatedProduct) => {
      const company = companies.find((_company) => _company.id === relatedProduct.companyId);
      return {
        productId: relatedProduct.id,
        companyId: relatedProduct.companyId,
        CompanyName: company.name,
        productType: relatedProduct.type,
        productName: relatedProduct.name,
        unit: relatedProduct.unit,
        orderQty: relatedProduct.orderQty,
      };
    });
    await editRelatedProduct(addingRelatedCustomProductProduct.customerId, addingRelatedCustomProductProduct.id, {
      relatedCustomProducts,
    });
    this.handleAddTreatementDialogClose();
    this.reload();
  };

  render() {
    const {
      showProductForm,
      showMoveToDialog,
      editingProduct,
      activeTableItem,
      fieldName,
      showAddTreatmentDialog,
      showSnackbar,
      addingRelatedCustomProductProduct,
      // showShareholderColumn,
      // showShareholderForm,

      // preTotal,
      // discount,
      // grandTotal
      monsantoProductReduceTransferInfo,
      showSnackbarText,
      openSwitchDialog,

      allCustomerData,
    } = this.state;
    const {
      currentPurchaseOrder,
      relatedProducts,
      companies,
      products,
      business,
      dealerDiscounts,
      discountPackages,
      packagings,
      seedSizes,
      //subjectName,
      seedCompanies,
      classes,
      selectedFarm,
      apiSeedCompanies,
    } = this.props;
    const FinalFarmData = [];
    const poId = this.props.match.params.id;
    const customerId = this.props.match.params.customer_id;
    const currentCust = allCustomerData.filter((c) => c.id == customerId);

    const currentPo =
      currentPurchaseOrder !== undefined
        ? currentPurchaseOrder
        : currentCust[0].PurchaseOrders.find((p) => p.id == poId);
    (currentPo !== undefined ? currentPo.farmData : []).filter((f) => {
      const find = (
        currentPurchaseOrder !== undefined ? currentPurchaseOrder.Customer.Farms : currentCust[0].Farms
      ).find((ff) => ff.id == f.farmId);

      find !== undefined && FinalFarmData.push(find);
    });

    return (
      <div>
        <h2 id="PO_product"></h2>

        {this.renderFarmTables()}

        {showProductForm && (
          <ProductDialog
            classes={classes}
            fieldName={fieldName}
            purchaseOrder={currentPurchaseOrder}
            customerOrders={relatedProducts}
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
            apiSeedCompanies={apiSeedCompanies}
            type="farm"
            reload={this.reload}
            monsantoProductReduceTransferInfo={monsantoProductReduceTransferInfo}
          />
        )}
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showSnackbar}
          message={<span style={{ whiteSpace: 'pre-line' }}>{showSnackbarText}</span>}
          onClick={() => this.setState({ showSnackbar: false })}
          onClose={() => this.setState({ showSnackbar: false })}
        />
        {showMoveToDialog && (
          <MoveToFarm
            farms={currentPurchaseOrder.Customer.Farms}
            currentFarm={activeTableItem.Farm}
            onClose={() => {
              this.setState({
                showMoveToDialog: false,
              });
            }}
            onSave={(farmId) => {
              this.moveToFarm(activeTableItem.id, farmId);
            }}
          />
        )}

        {openSwitchDialog && (
          <Dialog
            open={openSwitchDialog}
            onClose={this.onClose}
            fullWidth={true}
            maxWidth="md"
            style={{ padding: '10px 20px' }}
          >
            <DialogTitle className={classes.dialogTitle}>
              <div className={classes.dialogHeader}>
                Switch Farm for{' '}
                {activeTableItem.hasOwnProperty('monsantoProductId')
                  ? activeTableItem.MonsantoProduct.productDetail
                  : activeTableItem.hasOwnProperty('productId')
                  ? `${activeTableItem.Product.blend}/${activeTableItem.Product.brand}/${activeTableItem.Product.treatment}`
                  : `${activeTableItem.CustomProduct.name}/${activeTableItem.CustomProduct.description}`}
                <div className={classes.dialogHeaderActions}>
                  <IconButton color="inherit" onClick={this.onClose} aria-label="Close">
                    <CloseIcon />
                  </IconButton>
                </div>
              </div>
            </DialogTitle>
            <Divider />
            <Grid container className={classes.gridContainer}>
              <Grid item className={classes.gridItem}>
                <FormControl
                  variant="standard"
                  sx={{ m: 1, minWidth: 120 }}
                  style={{ marginLeft: '30px', width: '300px' }}
                >
                  <InputLabel id="demo-simple-select-standard-label">Select Farm For Switch</InputLabel>
                  <Select
                    value={selectedFarm}
                    onChange={(e) => {
                      this.setState({ selectedFarm: e.target.value });
                    }}
                    data-test-id="SelectFarmForSwitch"
                    autoWidth
                    inputProps={{
                      className: classes.packagingSelect,
                      required: true,
                      name: 'SelectFarmForSwitch',
                      id: 'SelectFarmForSwitch',
                    }}
                  >
                    {FinalFarmData.length > 0 &&
                      FinalFarmData.filter((f) => f.id !== activeTableItem.farmId).map((f) => {
                        return (
                          <MenuItem value={f.id} key={f.id} id={f.name}>
                            {`${f.name}`}
                          </MenuItem>
                        );
                      })}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <DialogActions style={{ marginBottom: '20px' }}>
              <Button
                onClick={() => this.editFarmId(activeTableItem, FinalFarmData)}
                id="saveSwitchFarm"
                color="primary"
                className={classes.addButton}
                disabled={FinalFarmData.filter((f) => f.id !== activeTableItem.farmId).length > 0 ? false : true}
              >
                SAVE
              </Button>
              <Button
                onClick={() => {
                  this.onClose();
                }}
                color="primary"
              >
                Cancel
              </Button>
            </DialogActions>
            <a style={{ display: 'flex', justifyContent: 'flex-end', marginRight: '10px' }}>
              {FinalFarmData.filter((f) => f.id !== activeTableItem.farmId).length > 0
                ? ''
                : 'No Other Farm Found For Switch'}
            </a>
          </Dialog>
        )}

        {showAddTreatmentDialog && (
          <ProductDialog
            classes={classes}
            fieldName={fieldName}
            purchaseOrder={currentPurchaseOrder}
            customerOrders={relatedProducts}
            companies={companies}
            products={products}
            business={business}
            dealerDiscounts={dealerDiscounts}
            onClose={this.handleAddTreatementDialogClose}
            discountPackages={discountPackages}
            onAddProducts={this.handleProductSelect}
            onEditProduct={this.editProduct}
            editingProduct={editingProduct}
            packagings={packagings}
            seedSizes={seedSizes}
            seedCompanies={[]}
            apiSeedCompanies={[]}
            type="farm"
            reload={this.reload}
            addRelatedCustomProducts={this.addRelatedCustomProducts}
            isAddingTreatment={true}
            addingRelatedCustomProductProduct={addingRelatedCustomProductProduct}
          />
        )}
      </div>
    );
  }
}

export default withStyles(farmsTablesStyles)(FarmsTables);
