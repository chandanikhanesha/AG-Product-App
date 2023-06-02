import React, { Component } from 'react';
import { renderToString } from 'react-dom/server';
import { withStyles } from '@material-ui/core';
import { debounce } from 'lodash/function';
import { format, isThisSecond } from 'date-fns';
import SweetAlert from 'react-bootstrap-sweetalert';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table';
import Sortable from 'react-sortablejs';
import { sortBy } from 'lodash';
import InputLabel from '@material-ui/core/InputLabel';
import Print from '@material-ui/icons/Print';
import PrintHelper from '../invoice_preview/print_helper/index';
import InvoiceHeader from '../invoice_preview/invoice_header/index';
import axios from 'axios';

// material-ui icons
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';
import AddIcon from '@material-ui/icons/Add';

import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import { groupBy } from 'lodash';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import { DialogContent } from '@material-ui/core';
import AccessTimeIcon from '@material-ui/icons/AccessTime';

// creative tim components
import Button from '../../components/material-dashboard/CustomButtons/Button';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import Tabs from '../../components/material-dashboard/CustomTabsWithoutBody/CustomTabsWithoutBody';

// core components
import IconButton from '@material-ui/core/IconButton';
import CircularProgress from '@material-ui/core/CircularProgress';
import Select from '@material-ui/core/Select';
import Snackbar from '@material-ui/core/Snackbar';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import CheckBox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import { Checkbox, FormControlLabel } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import WarningIcon from '@material-ui/icons/Warning';
import DragHandle from '@material-ui/icons/DragHandle';
import Divider from '@material-ui/core/Divider';
import TextField from '@material-ui/core/TextField';
import PaymentDialog from '../../screens/components/payment_dialog/index';

// utilities
import {
  isUnloadedOrLoading,
  customerProductDiscountsTotals,
  numberToDollars,
  perWholeOrderDiscount,
} from '../../utilities';
import { getFutureDiscountTotals } from '../../utilities/purchase_order';

//getProductName,
import { getProductFromOrder } from '../../utilities/product.v2';
//import { getAppliedDiscounts } from '../../../utilities/purchase_order'

// components
import ProductDialog from './product_dialog';
import TransferPo from './transfer_po';
import DeliveryDialog from './delivery_dialog';
import DeliveryReceiptDialog from './delivery_receipt_dialog';
import ConvertQuoteDialog from './convert_quote_dialog';
import PurchaseOrderFarms from './farms_tables';
import FarmFormDialog from './farm_form_dialog';
import AddExistingFarmDialog from './add_existing_farm_dialog';
import Packaging from './packaging';
import FarmEditMSRPDialog from './farms_tables/farm_edit_msrp';
import AddNoteDialog from './add_note_dialog';

import { purchaseOrderStyles } from './purchase_order.styles';
import SwitchDialog from './switch_dialog';
import ConvertToAdvancedDialog from './convert_to_advanced_dialog';
import CustomEarlyPayDialog from './custom_early_pays_dialog';
import ViewPaymentsDialog from './../customers/view_payment_dialog';
import moment from 'moment';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
// import {
//   cornProduct,
//   flatAmountDiscount
// } from "../../tests/purchase_order/setup/data";
const typesMap = {
  B: 'SOYBEAN',
  C: 'CORN',
  S: 'SORGHUM',
  // A: 'ALFALFA',
  L: 'CANOLA',
  P: 'PACKAGING',
};
const cropTypesMonsanto = ['B', 'C', 'S', 'L', 'P'];

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
      showSnackbar: false,
      showSnackbarText: '',
      purchaseOrder: [],
      purchaseOrderNote: null,
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
      currentPurchaseOrderName: null,
      switchDialogOpen: false,
      isChangingName: false,
      name: '',
      convertToAdvancedDialogOpen: null,
      archivePurchaseOrderConfirm: null,
      openMSRPEditDialog: null,
      isCheckingProductAvailability: false,
      isSyncingMonsantoProducts: false,
      syncMonsantoProductIds: [],
      isMonsantoProductReduceQuantity: false,
      selectedTabIndex: 0,
      productActionAnchorEl: null,
      editType: '',
      monsantoProductReduceTransferInfo: {
        transferWay: 'toHolding',
        reduceQuantity: 0,
        growerInfo: {
          customerId: this.props.customers.find((customer) => customer.name === 'Bayer Dealer Bucket')
            ? this.props.customers.find((customer) => customer.name === 'Bayer Dealer Bucket').id
            : '',
          // purchaseOrderId: null,
          // farmId: null,
          // lineItemNumber: null,
        },
      },
      showAddNoteDialog: false,
      reminderDate: null,
      showAddTreatmentDialog: false,
      showAddCustomEarlyPayDialog: false,
      isProductOrderBooking: false,
      wantToTransferAll: false,
      wantToTransferPo: false,
      transferingProducts: null,
      showEditProductSuccessSnackbar: false,
      messageForSnackBar: '',
      showPerWholeOrderDiscounts: false,
      showViewPaymentDialog: null,
      impactSummary: null,
      groupByProduct: false,
      groupBySimple: false,
      isLoading: false,
      showDelivery: false,
      isOpen: false,
      setOfRow: [],
      ischeckingProductavaiblty: false,
      productAvailability: null,
      pickLaterShow: true,
      paymentTableDatas: [],
      selectedShareholder: 'all',
      paymentDialogOpen: false,
      tablePaymentItemActionMenuOpen: false,
      activeTablePaymentItem: null,
      activeTablePaymentMultiData: null,
      paymentRemoveAlert: null,
      showOrderDate: false,
      showPreviousModel: false,
      addPreviousData: [],
      paymentDialogType: 1,
      allCustomerData: [],
      isDeleteLoading: false,
    };
    this.debouncedUpdateName = debounce(this.updateName, 1000);
  }
  setSelectedShareholder = (e) => {
    const { shareholders, currentPurchaseOrder } = this.props;
    let selectedShareholder;
    if (e.target.value == 'all') {
      selectedShareholder = 'all';
    } else if (e.target.value === 'theCustomer') {
      selectedShareholder = { id: 'theCustomer' };
    } else {
      selectedShareholder = shareholders.find((shareholder) => shareholder.id === e.target.value);
    }

    this.setState({ selectedShareholder, printHelperUpdateFlag: new Date() }, async () => {
      this.earlyPayTableData(currentPurchaseOrder);
    });
  };
  componentWillMount() {
    const { match, location } = this.props;
    let selectedTabIndex = 0;

    let subjectName;
    if (match.path.includes(':customer_id/purchase_order/:id')) {
      subjectName = 'Purchase Order';
    } else if (match.path.includes(':customer_id/quote/:id')) {
      subjectName = 'Quote';
    } else if (match.path.includes(':customer_id/invoice/:id')) {
      subjectName = 'Invoice';
    }
    if (location.search.includes('?selectedTabIndex')) {
      selectedTabIndex = parseInt(location.search.slice(-1), 10);
    }
    this.setState({ subjectName, selectedTabIndex });
  }

  reload = async () => {
    const { match, getPurchaseOrderById, totalItemsOfCustomers, listCustomers } = this.props;
    const purchaseOrderId = match.params.id;
    await listCustomers(true, 0, totalItemsOfCustomers);

    let subjectName;
    if (match.path.includes(':customer_id/purchase_order/:id')) {
      subjectName = 'Purchase Order';
    } else if (match.path.includes(':customer_id/quote/:id')) {
      subjectName = 'Quote';
    } else if (match.path.includes(':customer_id/invoice/:id')) {
      subjectName = 'Invoice';
    }

    await getPurchaseOrderById(purchaseOrderId);

    const { currentPurchaseOrder } = this.props;
    this.setState({
      purchaseOrder: currentPurchaseOrder,
      subjectName,
      purchaseOrderNote:
        currentPurchaseOrder && currentPurchaseOrder.Notes.length > 0 ? currentPurchaseOrder.Notes[0].note : '',
      reminderDate:
        currentPurchaseOrder && currentPurchaseOrder.Notes.length > 0
          ? currentPurchaseOrder.Notes[0].reminderDate
          : null,
    });
  };

  deleteFarm = async (customerId, farm) => {
    await this.props.deleteFarm(customerId, farm);
    this.reload();
  };

  componentDidMount = async () => {
    const {
      listCustomers,
      listProducts,
      listDealerDiscounts,
      listAllCustomProducts,
      listPurchaseOrders,
      listDiscountPackages,
      listPackagings,
      listSeedSizes,
      // listFarms,
      listShareholders,

      listDeliveryReceipts,

      listPayments,
      listCustomerAllReturnProducts,
      listSeedCompanies,
      listCompanies,
      currentPurchaseOrder,
      totalItemsOfCustomers,
      customers,
    } = this.props;
    const customerId = this.props.match.params.customer_id;
    await this.reload();
    await this.setTheAllCustomerData();
    await listPayments(true);

    await listProducts();
    await listAllCustomProducts();
    await listSeedCompanies(true);
    await listCustomers(true, 0, totalItemsOfCustomers);

    await listCustomerAllReturnProducts(true);
    listDealerDiscounts();
    listDiscountPackages();
    listShareholders(customerId);
    listPackagings();
    listSeedSizes();
    await listPurchaseOrders();
    await listCompanies(true);
    listDeliveryReceipts(parseInt(this.props.match.params.id));
    // this.getPaymentTotal();

    const poId = this.props.match.params.id;

    const currentCust = customers.filter((c) => c.id == customerId);

    const currentPo = currentCust.length > 0 && currentCust[0].PurchaseOrders.filter((p) => p.id == poId)[0];
    const purchaseOrder = currentPurchaseOrder !== undefined ? currentPurchaseOrder : currentPo;
    await this.setState({
      purchaseOrder: purchaseOrder,
    });
    // this.setPaymentTableData();

    setTimeout(() => {
      // this.addDiscountReport();
      this.setState({
        purchaseOrder: purchaseOrder,
      });
      this.setPurchaseOrderState();
    }, 1000);
  };

  setPurchaseOrderState() {
    const { currentPurchaseOrder } = this.props;
    this.setState({
      purchaseOrder: currentPurchaseOrder,
    });

    return currentPurchaseOrder;
  }
  setTheAllCustomerData = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        this.setState({ allCustomerData: response.data.customersdata });
      });
  };

  get isLoading() {
    const { isOnline, currentPurchaseOrderLoadingStatus, customersStatus, deliveryReceipts } = this.props;
    return this.state.generatingPDF ||
      (customersStatus === 'Loading' && deliveryReceipts === [] && this.state.purchaseOrder === [])
      ? true
      : false || (isOnline && [currentPurchaseOrderLoadingStatus].some(isUnloadedOrLoading));
  }

  hideProductForm = () => {
    this.setState({
      showProductForm: false,
      editingProduct: null,
      wantToTransferAll: false,
      editType: '',
    });
  };

  openProductFormEdit = (product, type) => {
    this.handleTableItemActionMenuClose();
    this.setState({
      showProductForm: true,
      editingProduct: product,
      isLoading: false,
      editType: type,
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

  duplicateProducts = async (customerProduct) => {
    const product = customerProduct || this.state.activeTableItem.order;
    const currentPurchaseOrder =
      this.props.currentPurchaseOrder !== undefined ? this.props.currentPurchaseOrder : this.state.purchaseOrder;
    const {
      linkRelatedProduct,
      linkRelatedCustomProduct,
      removeRecentCreatedCustomerProduct,
      linkRelatedMonsantoProduct,
      recentCreatedCustomerProductId,
    } = this.props;

    let linkFunction;
    if (product.hasOwnProperty('customProductId')) linkFunction = linkRelatedCustomProduct;
    else if (product.hasOwnProperty('monsantoProductId')) linkFunction = linkRelatedMonsantoProduct;
    else linkFunction = linkRelatedProduct;

    await linkFunction(
      product.msrp || product.msrpEdited || product.price,
      currentPurchaseOrder.id,
      this.props.match.params.customer_id,
      product.Product
        ? product.Product.id
        : product.CustomProduct
        ? product.CustomProduct.id
        : product.MonsantoProduct.id,
      product.orderQty,
      [],
      [],
      product.farmId || null,
      product.packagingId || null,
      product.seedSizeId || null,
      product.fieldName || null,
      product.orderDate,
      product.unit,
      '' + 0,
      product.comment,
    );
    this.reload();
    this.setState({
      showSnackbar: true,
      showSnackbarText: 'Product added successfully',
    });
    this.handleTableItemActionMenuClose();
    setTimeout(() => {
      removeRecentCreatedCustomerProduct(recentCreatedCustomerProductId);
      this.setState({
        showSnackbar: false,
        showSnackbarText: '',
      });
    }, 4000);
  };

  onSavePickLaterProduct = async () => {
    const { linkRelatedMonsantoProduct, apiSeedCompanies, currentPurchaseOrder } = this.props;
    const { activeTableItem, setOfRow } = this.state;
    const newMonsantoProduct =
      apiSeedCompanies && apiSeedCompanies[0].Products.find((p) => p.id == setOfRow[0].monsantoProductId);

    let msrp = this.getMSRP(newMonsantoProduct);

    await linkRelatedMonsantoProduct(
      msrp,
      currentPurchaseOrder.id,

      this.props.match.params.customer_id,
      newMonsantoProduct.id,
      setOfRow[0].quantity,
      [],
      activeTableItem.order.shareholderData,
      activeTableItem.order.farmId,
      activeTableItem.order.packagingId || null,
      activeTableItem.order.seedSizeId || null,
      activeTableItem.order.fieldName || null,
      activeTableItem.order.orderDate,
      activeTableItem.order.unit,
      '' + 0,
      activeTableItem.order.comment,
      null,
      false,
      0,
      activeTableItem.order.id,
    )
      .then((res) => {
        this.setState({
          setOfRow: [],
        });
      })
      .catch((e) => {
        console.log(e, 'error from ');
      });

    this.setState({
      showSnackbar: true,
      showSnackbarText: 'Product added successfully',
      showProductForm: false,
    });
    this.reload();

    setTimeout(() => {
      this.reload();
      this.setState({
        showSnackbar: false,
        showSnackbarText: '',
      });
    }, 4000);
  };

  addProducts = async (data, farmId, shareholdersData) => {
    const {
      createProductPackaging,
      updateProductPackaging,
      linkRelatedProduct,
      linkRelatedCustomProduct,
      linkRelatedMonsantoProduct,
      removeRecentCreatedCustomerProduct,
      recentCreatedCustomerProductId,
    } = this.props;
    const currentPurchaseOrder =
      this.props.currentPurchaseOrder !== undefined ? this.props.currentPurchaseOrder : this.state.purchaseOrder;

    let index = 0;
    for (const productOrder of data.productsToOrder) {
      let linkFunction;
      if (productOrder.hasOwnProperty('companyId')) linkFunction = linkRelatedCustomProduct;
      else if (productOrder.isMonsantoProduct) linkFunction = linkRelatedMonsantoProduct;
      else linkFunction = linkRelatedProduct;
      const orderQty = productOrder.isPickLater && productOrder.isPickLater == true ? 0 : productOrder.orderQty;
      const pickLaterQty =
        productOrder.isPickLater && productOrder.isPickLater == true ? productOrder.orderQty : 0 || 0;
      await linkFunction(
        productOrder.msrp,
        currentPurchaseOrder.id,

        this.props.match.params.customer_id,
        productOrder.id,
        orderQty,
        data.discounts || [],
        shareholdersData ? shareholdersData : [],
        farmId == '' ? null : farmId || null,
        productOrder.packagingId || null,
        productOrder.seedSizeId || null,
        productOrder.fieldName || null,
        data.orderDate,
        productOrder.unit,
        '' + index,
        productOrder.comment,
        productOrder.classification == 'P' ? true : null,
        productOrder.isPickLater,
        pickLaterQty,
      )
        .then((response) => {
          const createdProduct = response.payload;
          if (productOrder.hasOwnProperty('seedCompanyId') && !productOrder.isMonsantoProduct) {
            if (productOrder.seedSizeId || productOrder.packagingId) {
              let orderProductPackagings = currentPurchaseOrder.ProductPackagings
                ? currentPurchaseOrder.ProductPackagings
                : null;
              if (orderProductPackagings && orderProductPackagings.length > 0) {
                const existPackagings = orderProductPackagings.find(
                  (packaging) => packaging.productId === productOrder.id,
                );
                if (existPackagings) {
                  let newPackagingGroup = [
                    ...existPackagings.packagingGroups,
                    {
                      CustomerProductId: createdProduct.id,
                      packagingId: productOrder.packagingId,
                      seedSizeId: productOrder.seedSizeId,
                      quantity: parseInt(productOrder.orderQty, 10),
                    },
                  ];
                  updateProductPackaging({
                    id: existPackagings.id,
                    packagingGroups: newPackagingGroup,
                  });
                } else {
                  createProductPackaging({
                    organizationId: currentPurchaseOrder.organizationId,
                    purchaseOrderId: currentPurchaseOrder.id,

                    productId: productOrder.id,
                    packagingGroups: [
                      {
                        CustomerProductId: createdProduct.id,
                        packagingId: productOrder.packagingId,
                        seedSizeId: productOrder.seedSizeId,
                        quantity: parseInt(productOrder.orderQty, 10),
                      },
                    ],
                  });
                }
              } else {
                createProductPackaging({
                  organizationId: currentPurchaseOrder.organizationId,
                  purchaseOrderId: currentPurchaseOrder.id,
                  productId: productOrder.id,
                  packagingGroups: [
                    {
                      CustomerProductId: createdProduct.id,
                      packagingId: productOrder.packagingId,
                      seedSizeId: productOrder.seedSizeId,
                      quantity: parseInt(productOrder.orderQty, 10),
                    },
                  ],
                });
              }
            } else {
              createProductPackaging({
                organizationId: currentPurchaseOrder.organizationId,
                purchaseOrderId: currentPurchaseOrder.id,
                productId: productOrder.id,
                packagingGroups: [],
              });
            }
          }
        })
        .catch((err) => {
          console.log(err, 'err while creating monsanto product');
        });
      index = index + 1;
    }

    this.setState({
      showSnackbar: true,
      showSnackbarText: 'Product added successfully',
      showProductForm: false,
    });
    this.reload();

    setTimeout(() => {
      removeRecentCreatedCustomerProduct(recentCreatedCustomerProductId);
      this.reload();
      this.setState({
        showSnackbar: false,
        showSnackbarText: '',
      });
    }, 4000);
  };

  openInNewtab = (url) => {
    let win = window.open(url, '_blank');
    if (win) {
      win.focus();
    }
  };
  editProduct = async (customerProductId, selectedProductId, data, selectedProduct) => {
    const {
      customers,
      apiSeedCompanies,
      linkRelatedMonsantoProduct,
      editRelatedCustomProduct,
      editRelatedProduct,
      editRelatedMonsantoProduct,

      createProductPackaging,
      updateProductPackaging,
    } = this.props;
    const currentPurchaseOrder =
      this.props.currentPurchaseOrder !== undefined ? this.props.currentPurchaseOrder : this.state.purchaseOrder;
    let originalMonsantoProduct;
    const {
      editingProduct,
      purchaseOrder,
      isMonsantoProductReduceQuantity,
      monsantoProductReduceTransferInfo,
      wantToTransferAll,
    } = this.state;

    const customerId = this.props.match.params.customer_id;

    let IDname;
    if (editingProduct.hasOwnProperty('customProductId')) {
      IDname = 'CustomerCustomProduct';
    } else if (editingProduct.hasOwnProperty('monsantoProductId')) {
      IDname = 'MonsantoProduct';
    } else if (editingProduct.hasOwnProperty('productId')) {
      IDname = 'customerProduct';
    }
    let newProductLineItemNumber = 0;

    if (editingProduct.monsantoProductId !== selectedProductId) {
      data.productId = selectedProductId;
    } else {
      data.productId = editingProduct.monsantoProductId;
    }

    let editFunction;
    if (data.isQuote) {
      await this.props
        .updateQuoteMonsantoProduct(customerId, customerProductId, data, IDname)
        .then(({ payload: response }) => {
          this.setState({
            wantToTransferAll: false,
            showProductForm: false,
            showEditProductSuccessSnackbar: true,
            messageForSnackBar: response.msg || 'Successfully updated!',
          });
          this.reload();
        });
    } else {
      if (editingProduct.hasOwnProperty('customProductId')) {
        editFunction = editRelatedCustomProduct;
      } else if (editingProduct.hasOwnProperty('monsantoProductId')) {
        editFunction = editRelatedMonsantoProduct;
        originalMonsantoProduct = currentPurchaseOrder.CustomerMonsantoProducts.find(
          (customerMonsantoProduct) => customerMonsantoProduct.id === customerProductId,
        );

        if (editingProduct.monsantoProductId == selectedProductId) {
          data.monsantoProductId = selectedProductId;
        } else {
          data.monsantoProductId = editingProduct.monsantoProductId;
        }
        if (parseInt(data.orderQty, 10) !== parseInt(originalMonsantoProduct.monsantoOrderQty, 10)) {
          data.isSent = false;
        }
      } else editFunction = editRelatedProduct;
      if (editingProduct.hasOwnProperty('productId')) {
        if (data.seedSizeId || data.packagingId) {
          let orderProductPackagings = currentPurchaseOrder.ProductPackagings
            ? currentPurchaseOrder.ProductPackagings
            : null;
          if (orderProductPackagings && orderProductPackagings.length > 0) {
            const existPackagings = orderProductPackagings.find(
              (packaging) => packaging.productId === selectedProductId,
            );
            if (existPackagings) {
              let newPackagingGroup;
              const existCustomerProductPackaging = existPackagings.packagingGroups.find(
                (_packaging) => _packaging.CustomerProductId === customerProductId,
              );
              if (existCustomerProductPackaging) {
                const otherPackagings = existPackagings.packagingGroups.filter(
                  (_packaging) => _packaging.CustomerProductId !== customerProductId,
                );
                newPackagingGroup = [
                  ...otherPackagings,
                  {
                    CustomerProductId: customerProductId,
                    packagingId: data.packagingId,
                    seedSizeId: data.seedSizeId,
                    quantity: parseInt(data.orderQty, 10),
                  },
                ];
              } else {
                newPackagingGroup = [
                  ...existPackagings.packagingGroups,
                  {
                    CustomerProductId: customerProductId,
                    packagingId: data.packagingId,
                    seedSizeId: data.seedSizeId,
                    quantity: parseInt(data.orderQty, 10),
                  },
                ];
              }
              updateProductPackaging({
                id: existPackagings.id,
                packagingGroups: newPackagingGroup,
              });
            } else {
              createProductPackaging({
                organizationId: currentPurchaseOrder.organizationId,
                purchaseOrderId: currentPurchaseOrder.id,
                productId: selectedProductId,
                packagingGroups: [
                  {
                    CustomerProductId: customerProductId,
                    packagingId: data.packagingId,
                    seedSizeId: data.seedSizeId,
                    quantity: parseInt(data.orderQty, 10),
                  },
                ],
              });
            }
          } else {
            createProductPackaging({
              organizationId: currentPurchaseOrder.organizationId,
              purchaseOrderId: currentPurchaseOrder.id,
              productId: selectedProductId,
              packagingGroups: [
                {
                  CustomerProductId: customerProductId,
                  packagingId: data.packagingId,
                  seedSizeId: data.seedSizeId,
                  quantity: parseInt(data.orderQty, 10),
                },
              ],
            });
          }
        } else {
          createProductPackaging({
            organizationId: currentPurchaseOrder.organizationId,
            purchaseOrderId: currentPurchaseOrder.id,
            productId: selectedProductId,
            packagingGroups: [],
          });
        }
      }

      if (
        editingProduct.hasOwnProperty('monsantoProductId') &&
        (isMonsantoProductReduceQuantity ? isMonsantoProductReduceQuantity : true || wantToTransferAll)
      ) {
        // if (originalMonsantoProduct.id !== selectedProductId) {
        // TODO: how to do this
        // this.setState({
        //   isMonsantoProductReduceQuantity: false,
        //   monsantoProductReduceTransferInfo: {
        //     transferWay: "toMonsanto",
        //     reduceQuantity: 0,
        //     growerInfo: { customerId: null, purchaseOrderId: null },
        //   },
        // });
        // }
        if (
          monsantoProductReduceTransferInfo.transferWay === 'toGrower' ||
          monsantoProductReduceTransferInfo.transferWay === 'toHolding'
        ) {
          // if (monsantoProductReduceTransferInfo.transferWay === "toHolding") {
          //   const monsantoProduct = currentPurchaseOrder.CustomerMonsantoProducts.find(
          //     customerMonsantoProduct =>
          //       customerMonsantoProduct.purchaseOrderId ===
          //         currentPurchaseOrder.id &&
          //       customerMonsantoProduct.id === customerProductId
          //   );
          //   const apiSeedCompanyId =
          //     monsantoProduct.MonsantoProduct.seedCompanyId;
          //   const apiSeedCompany = apiSeedCompanies.find(
          //     apiSeedCompany => apiSeedCompany.id === apiSeedCompanyId
          //   );
          //   const holdingCustomer = customers.find(
          //     customer => customer.name === `Bayer Dealer Bucket`
          //   );
          //   const holdingPurchaseOrder = holdingCustomer.PurchaseOrders[0];
          //   monsantoProductReduceTransferInfo.growerInfo = {
          //     customerId: holdingCustomer.id,
          //     purchaseOrderId: holdingPurchaseOrder.id
          //   };
          // }

          const toCustomerPurchaseOrderMonsantoProduct = currentPurchaseOrder.CustomerMonsantoProducts.find(
            (customerMonsantoProduct) => {
              return (
                customerMonsantoProduct.purchaseOrderId ===
                  monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId &&
                customerMonsantoProduct.monsantoProductId === customerProductId
              );
            },
          );

          // data.isSent = true;
          if (toCustomerPurchaseOrderMonsantoProduct) {
            const { orderQty } = toCustomerPurchaseOrderMonsantoProduct;
            data.isSent = orderQty === data.orderQty;
            data.monsantoProductReduceTransferInfo = monsantoProductReduceTransferInfo;
            const FromCustomerdetail = {
              purchaseOrderId: currentPurchaseOrder.id,
              customerId: parseInt(customerId),
            };
            data[`FromCustomerdetail`] = FromCustomerdetail;
            if (wantToTransferAll) {
              data.orderQty = 0;
            }

            await editFunction(monsantoProductReduceTransferInfo.growerInfo.customerId, customerProductId, data).then(
              ({ payload: response }) => {
                this.setState({
                  wantToTransferAll: false,
                  showProductForm: false,
                  showEditProductSuccessSnackbar: true,
                  messageForSnackBar: response.msg || 'Successfully updated!',
                });
                this.openInNewtab(
                  `app/customers/${monsantoProductReduceTransferInfo.growerInfo.customerId}/purchase_order/${monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId}`,
                );
                this.reload();

                setTimeout(() => {
                  this.setState({
                    showEditProductSuccessSnackbar: false,
                  });
                }, 4000).catch((err) => {
                  this.setState({
                    wantToTransferAll: false,
                    showProductForm: false,
                    showEditProductSuccessSnackbar: true,
                    messageForSnackBar: err.response
                      ? err.response.data.error
                      : 'Something went wrong while editing product!',
                    isLoading: false,
                  });

                  this.reload();
                  setTimeout(() => {
                    this.setState({
                      showEditProductSuccessSnackbar: false,
                    });
                  }, 4000);
                });
              },
            );
          } else if (
            monsantoProductReduceTransferInfo.growerInfo.lineItemNumber === null ||
            monsantoProductReduceTransferInfo.growerInfo.lineItemNumber === 'newline'
          ) {
            const toCustZoneId =
              customers &&
              customers.filter((c) => c.id == monsantoProductReduceTransferInfo.growerInfo.customerId)[0].zoneIds;

            const isZoneId =
              toCustZoneId &&
              JSON.parse(toCustZoneId).filter(
                (z) => z.classification == this.getProductType(editingProduct.MonsantoProduct),
              );

            const toCustProduct =
              apiSeedCompanies &&
              apiSeedCompanies[0].Products.filter(
                (p) =>
                  p.crossReferenceId == editingProduct.MonsantoProduct.crossReferenceId &&
                  p.zoneId == `{${isZoneId.length > 0 ? isZoneId[0].zoneId : 'NZI'}}`,
              );

            await linkRelatedMonsantoProduct(
              data.price,
              monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId,
              monsantoProductReduceTransferInfo.growerInfo.customerId,
              toCustProduct && toCustProduct.length > 0 ? toCustProduct[0].id : editingProduct.monsantoProductId,

              editingProduct.monsantoProductId != selectedProduct.id
                ? editingProduct.orderQty
                : monsantoProductReduceTransferInfo.reduceQuantity,

              data.discounts || [],
              editingProduct.monsantoProductId != selectedProduct.id ? editingProduct.shareholderData : [],

              monsantoProductReduceTransferInfo.growerInfo.farmId || null,
              data.packagingId || null,
              data.seedSizeId || null,
              data.fieldName || null,
              new Date(),
              null,
              monsantoProductReduceTransferInfo,
              null,
              false,
            ).then(async (res) => {
              if (res.payload) {
                newProductLineItemNumber = res.payload.lineItemNumber;
                console.log(res.payload.lineItemNumber, 'res.payload');
                // await this.props
                //   .syncMonsantoOrders(
                //     res.payload.purchaseOrderId,
                //     monsantoProductReduceTransferInfo.growerInfo.customerId,
                //     [],
                //     [res.payload.id],
                //     this.props.match.path.includes('dealers'),
                //   )
                //   .then((data) => {
                //     this.setState({ isSyncingMonsantoProducts: false });
                //     this.reload();
                //   })
                //   .catch((e) => {
                //     this.setState({ isSyncingMonsantoProducts: false });
                //     if (e && e.response) {
                //       this.setShowSnackbar(e.response.data.error || 'Cannot sync with Monsanto! Please try later!');
                //     } else {
                //       this.setShowSnackbar(
                //         'The Bayer server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later.',
                //       );
                //     }
                //   });
              }
            });
          }

          if (editingProduct.monsantoProductId != selectedProduct.id) {
            await linkRelatedMonsantoProduct(
              selectedProduct.msrp,
              currentPurchaseOrder.id,

              this.props.match.params.customer_id,
              selectedProduct.id,
              selectedProduct.orderQty,
              editingProduct.discounts || [],
              editingProduct.shareholderData || [],
              editingProduct.farmId,
              selectedProduct.packagingId || null,
              selectedProduct.seedSizeId || null,
              editingProduct.fieldName || null,
              editingProduct.orderDate,
              selectedProduct.unit,
              null,
              selectedProduct.comment,
              false,
            );
          }
          data.monsantoProductReduceTransferInfo = monsantoProductReduceTransferInfo;
          const FromCustomerdetail = {
            purchaseOrderId: currentPurchaseOrder.id,
            customerId: parseInt(customerId),
          };
          data[`FromCustomerdetail`] = FromCustomerdetail;
          if (wantToTransferAll) {
            data.orderQty = 0;
          }
          if (editingProduct.monsantoProductId != selectedProductId) {
            data.orderQty = 0;
            data.monsantoProductReduceTransferInfo = {
              ...monsantoProductReduceTransferInfo,
              reduceQuantity: editingProduct.orderQty,
            };
          }

          if (newProductLineItemNumber !== 0) {
            data.monsantoProductReduceTransferInfo.growerInfo.lineItemNumber = newProductLineItemNumber;
          }
          editFunction(customerId, customerProductId, data)
            .then(({ payload: response }) => {
              this.setState({
                wantToTransferAll: false,
                showProductForm: false,
                showEditProductSuccessSnackbar: true,
                messageForSnackBar: response.msg || 'Successfully updated!',
                isLoading: false,
              });
              this.hideProductForm();

              monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId &&
                this.openInNewtab(
                  `app/customers/${monsantoProductReduceTransferInfo.growerInfo.customerId}/purchase_order/${monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId}`,
                );
              this.reload();

              setTimeout(() => {
                this.setState({
                  showEditProductSuccessSnackbar: false,
                });
              }, 4000);
            })
            .catch((err) => {
              this.setState({
                wantToTransferAll: false,
                showProductForm: false,
                showEditProductSuccessSnackbar: true,
                messageForSnackBar: err.response
                  ? err.response.data.error
                  : 'Something went wrong while editing product!',
                isLoading: false,
              });
              this.hideProductForm();

              this.reload();
              setTimeout(() => {
                this.setState({
                  showEditProductSuccessSnackbar: false,
                });
              }, 4000);
            });
        }
        this.setState({
          isMonsantoProductReduceQuantity: false,
          monsantoProductReduceTransferInfo: {
            transferWay: 'toMonsanto',
            reduceQuantity: 0,
            growerInfo: { customerId: null, purchaseOrderId: null, farmId: null, lineItemNumber: null },
          },
        });
      }

      if (
        editingProduct.hasOwnProperty('customProductId') ||
        editingProduct.hasOwnProperty('productId') ||
        (editingProduct.hasOwnProperty('monsantoProductId') &&
          JSON.stringify(originalMonsantoProduct.discounts) !== JSON.stringify(data.discounts))
      ) {
        delete data.monsantoProductReduceTransferInfo;

        editFunction(customerId, customerProductId, data)
          .then(({ payload: response }) => {
            this.setState({
              wantToTransferAll: false,
              showProductForm: false,
              showEditProductSuccessSnackbar: true,
              messageForSnackBar: response.msg || 'Successfully updated!!',
              isLoading: false,
            });
            this.reload();
            this.hideProductForm();
            setTimeout(() => {
              this.setState({
                showEditProductSuccessSnackbar: false,
              });
            }, 4000);
          })
          .catch((err) => {
            this.setState({
              wantToTransferAll: false,
              showProductForm: false,
              showEditProductSuccessSnackbar: true,
              messageForSnackBar: 'Something went wrong while editing product!',
            });
            this.reload();
            this.hideProductForm();
            setTimeout(() => {
              this.setState({
                showEditProductSuccessSnackbar: false,
              });
            }, 4000);
          });
      }
      // if (monsantoProductReduceTransferInfo.transferWay === 'toHolding') {
      //   editFunction(customerId, customerProductId, data)
      //     .then(({ payload: response }) => {
      //       this.setState({
      //         wantToTransferAll: false,
      //         showProductForm: false,
      //         showEditProductSuccessSnackbar: true,
      //         messageForSnackBar: response.msg || 'Successfully updated!',
      //         isLoading: false,
      //       });
      //       this.reload();
      //       this.hideProductForm();
      //       setTimeout(() => {
      //         this.setState({
      //           showEditProductSuccessSnackbar: false,
      //         });
      //       }, 4000);
      //     })
      //     .catch((err) => {
      //       this.setState({
      //         wantToTransferAll: false,
      //         showProductForm: false,
      //         showEditProductSuccessSnackbar: true,
      //         messageForSnackBar: err.response
      //           ? err.response && err.response.data.error
      //           : 'Something went wrong while editing product!',
      //       });
      //       this.reload();
      //       this.hideProductForm();
      //       setTimeout(() => {
      //         this.setState({
      //           showEditProductSuccessSnackbar: false,
      //         });
      //       }, 4000);
      //     });
      // }
      if (monsantoProductReduceTransferInfo.transferWay === 'toMonsanto') {
        data.monsantoProductReduceTransferInfo = monsantoProductReduceTransferInfo;
        if (editingProduct.monsantoProductId != selectedProductId) {
          data.orderQty = 0;

          data.monsantoProductReduceTransferInfo = {
            ...monsantoProductReduceTransferInfo,
            reduceQuantity: editingProduct.orderQty,
          };
        }

        if (editingProduct.monsantoProductId != selectedProductId) {
          await linkRelatedMonsantoProduct(
            selectedProduct.msrp,
            currentPurchaseOrder.id,
            this.props.match.params.customer_id,
            selectedProduct.id,
            selectedProduct.orderQty,
            editingProduct.discounts || [],
            editingProduct.shareholderData || [],

            editingProduct.farmId || selectedProduct.farmId,
            selectedProduct.packagingId || null,
            selectedProduct.seedSizeId || null,
            editingProduct.fieldName || null,
            editingProduct.orderDate,
            selectedProduct.unit,
            null,
            selectedProduct.comment,
          );
        }

        if (monsantoProductReduceTransferInfo.reduceQuantity > 0) {
          const FromCustomerdetail = {
            purchaseOrderId: currentPurchaseOrder.id,
            customerId: parseInt(customerId),
          };

          data[`FromCustomerdetail`] = FromCustomerdetail;
          if (wantToTransferAll) {
            data.orderQty = 0;
          }

          editFunction(customerId, customerProductId, data)
            .then(({ payload: response }) => {
              this.setState({
                wantToTransferAll: false,
                showProductForm: false,
                showEditProductSuccessSnackbar: true,
                messageForSnackBar: response.msg || 'Successfully updated!',
              });
              this.reload();
              this.hideProductForm();
              setTimeout(() => {
                this.setState({
                  showEditProductSuccessSnackbar: false,
                });
              }, 4000);
            })
            .catch((err) => {
              this.setState({
                wantToTransferAll: false,
                showProductForm: false,
                showEditProductSuccessSnackbar: true,
                messageForSnackBar: err.response
                  ? err.response.data.error
                  : 'Something went wrong while editing product!',
              });
              this.reload();
              this.hideProductForm();
              setTimeout(() => {
                this.setState({
                  showEditProductSuccessSnackbar: false,
                });
              }, 4000);
            });
        } else {
          if (editingProduct.monsantoProductId != selectedProduct.id) {
            data.isSent = false;
          }
          editFunction(customerId, customerProductId, data)
            .then(({ payload: response }) => {
              this.setState({
                wantToTransferAll: false,
                showProductForm: false,
                showEditProductSuccessSnackbar: true,
                messageForSnackBar: response.msg || 'Successfully updated!',
              });
              this.reload();
              this.hideProductForm();
              setTimeout(() => {
                this.setState({
                  showEditProductSuccessSnackbar: false,
                });
              }, 4000);
            })
            .catch((err) => {
              this.setState({
                wantToTransferAll: false,
                showProductForm: false,
                showEditProductSuccessSnackbar: true,
                messageForSnackBar: err.response
                  ? err.response && err.response.data.error
                  : 'Something went wrong while editing product!',
              });
              this.reload();
              this.hideProductForm();
              setTimeout(() => {
                this.setState({
                  showEditProductSuccessSnackbar: false,
                });
              }, 4000);
            });
        }
      }
    }
  };

  editOnlyQty = (order, data) => {
    const { editRelatedMonsantoProduct } = this.props;
    const currentPurchaseOrder =
      this.props.currentPurchaseOrder !== undefined ? this.props.currentPurchaseOrder : this.state.purchaseOrder;
    const customerId = this.props.match.params.customer_id;

    editRelatedMonsantoProduct(customerId, order.id, data)
      .then(({ payload: response }) => {
        this.setState({
          wantToTransferAll: false,
          showProductForm: false,
          showEditProductSuccessSnackbar: true,
          messageForSnackBar: response.msg || 'Successfully updated!',
        });
        this.reload();

        setTimeout(() => {
          this.setState({
            showEditProductSuccessSnackbar: false,
          });
        }, 4000);
      })
      .catch((err) => {
        this.setState({
          wantToTransferAll: false,
          showProductForm: false,
          showEditProductSuccessSnackbar: true,
          messageForSnackBar: err.response
            ? err.response && err.response.data.error
            : 'Something went wrong while editing product!',
        });
        this.reload();

        setTimeout(() => {
          this.setState({
            showEditProductSuccessSnackbar: false,
          });
        }, 4000);
      });
  };

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
  removeRelatedProduct = (customerProduct) => {
    const { removeRelatedProduct, removeRelatedCustomProduct, removeRelatedMonsantoProduct, classes } = this.props;
    const { subjectName } = this.state;
    let removeFunction;

    const currentPurchaseOrder =
      this.props.currentPurchaseOrder !== undefined ? this.props.currentPurchaseOrder : this.state.purchaseOrder;
    if (customerProduct.hasOwnProperty('classification')) {
      removeFunction = removeRelatedMonsantoProduct; // monsanto Company product's
    } else if (customerProduct.hasOwnProperty('monsantoProductId')) {
      removeFunction = removeRelatedMonsantoProduct; // monsanto company product
    } else if (customerProduct.productType == 'SeedCompany') {
      removeFunction = removeRelatedProduct; //seed company product
    } else if (customerProduct && customerProduct.productType == 'RegularCompany') {
      removeFunction = removeRelatedCustomProduct; //regular company product's
    }

    customerProduct &&
      this.setState({
        deleteProductConfirm: (
          <SweetAlert
            warning
            showCancel
            title={`Delete Product`}
            onConfirm={async () => {
              try {
                await removeFunction(this.props.match.params.customer_id, currentPurchaseOrder.id, customerProduct.id);
                this.reload();
                this.setState(
                  {
                    deleteProductConfirm: null,
                    showEditProductSuccessSnackbar: true,
                    messageForSnackBar: 'Successfully deleted',
                  },
                  () => {
                    if (this.state.wantToTransferAll) {
                      this.setState({ wantToTransferAll: false });
                    }
                  },
                );
              } catch (error) {
                this.setState(
                  {
                    deleteProductConfirm: null,
                    showEditProductSuccessSnackbar: true,
                    messageForSnackBar: 'Error deleting customer product!',
                  },
                  () => {
                    if (this.state.wantToTransferAll) {
                      this.setState({ wantToTransferAll: false });
                    }
                  },
                );
              }
            }}
            onCancel={() => {
              this.setState(
                {
                  deleteProductConfirm: null,
                },
                () => {
                  if (this.state.wantToTransferAll) {
                    this.setState({ wantToTransferAll: false });
                  }
                },
              );
            }}
            confirmBtnText={<span id="productOk">Ok</span>}
            cancelBtnText={<span id="productCancel">Cancel</span>}
            confirmBtnCssClass={classes.button + ' ' + classes.success}
            cancelBtnCssClass={classes.button + ' ' + classes.danger}
          >
            Are you sure you want to delete this product? This will also remove the product from any purchase orders or
            quotes it has been added to.
            {!subjectName == 'Quote' ? (
              <Button
                onClick={() => {
                  this.setState({
                    wantToTransferAll: true,
                    deleteProductConfirm: null,
                    editingProduct: customerProduct.order,
                  });
                }}
              >
                transfer
              </Button>
            ) : (
              ''
            )}
          </SweetAlert>
        ),
      });

    this.handleTableItemActionMenuClose();
  };

  // removeRelatedProduct(customerProduct) {
  //   const { removeRelatedProduct, removeRelatedCustomProduct } = this.props;
  //   const { purchaseOrder } = this.state;
  //   console.log(customerProduct);
  //   // if (this.props.match.params.customer_id) {
  //   //   console.log("removeRelatedCustomProduct");
  //   //   return removeRelatedCustomProduct(
  //   //     this.props.match.params.customer_id,
  //   //     purchaseOrder.id,
  //   //     customerProduct.orderId
  //   //   );
  //   // }
  //   removeRelatedProduct(
  //     this.props.match.params.customer_id,
  //     purchaseOrder.id,
  //     customerProduct.orderId
  //   );
  // }

  handlePurchaseOrderNameChange = (PurchaseOrderName) => {
    this.setState({ currentPurchaseOrderName: PurchaseOrderName });
  };

  handleProductActionMenuOpen = (item) => (event) => {
    this.setState({
      productActionMenuOpen: true,
      productActionAnchorEl: event.target,
      activeProductItem: item,
    });
  };

  handleProductItemActionMenuClose = () => {
    this.setState({ productActionMenuOpen: false, activeProductItem: null });
  };

  handleTableItemActionMenuOpen = (item) => (event) => {
    this.setState({
      tableItemActionMenuOpen: true,
      tableItemActionAnchorEl: event.target,
      activeTableItem: item,
    });
  };

  handleTableItemActionMenuClose = () => {
    this.setState({ tableItemActionMenuOpen: false, activeTableItem: null, editType: '' });
  };

  getAmountDelivered = (order) => (order.amountDelivered ? order.amountDelivered : 0);

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

  handleMonsantoProductPendingCheckboxAll = (customerOrders, type) => (event) => {
    const isCheck = event.target.checked;
    if (isCheck) {
      const cvssf =
        type == 'pickLater'
          ? customerOrders
              .filter((order) => order.order.farmId)
              .filter(
                (order) =>
                  order.order.monsantoProductId && order.order.isPickLater != true && order.order.isSent == false,
              )
              // .filter(order => order.order.orderQty !== 0)
              .filter((order) => {
                if (order.order.MonsantoProduct && order.order.isDeleted) return null;
                return order.order;
              })
          : customerOrders
              // .filter((order) => !order.farmId)
              .filter((order) => order.monsantoProductId && order.isPickLater != true && order.isSent == false)
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
  getProductType(product) {
    return typesMap[product.classification];
  }

  makeProductBooking() {
    const { currentPurchaseOrder, makeProductOrderBooking } = this.props;
    const { syncMonsantoProductIds } = this.state;
    const { CustomerMonsantoProducts: monsantoProducts } = currentPurchaseOrder;
    const CustomerMonsantoProducts = monsantoProducts.filter(
      (monsantoProduct) =>
        syncMonsantoProductIds.includes(monsantoProduct.monsantoProductId) ||
        (monsantoProduct.isDeleted && !monsantoProduct.isDeletedSynced),
    );
    this.setState({ isProductOrderBooking: true });
    // makeProductOrderBooking({
    //   orders: [
    //     {
    //       orderNumber: "4111241123",
    //       orderType: "New",
    //       // "orderReference": "111",
    //       directShip: 0,
    //       specialInstructions: {
    //         type: "MarkingInstructions",
    //         content: "West Farm"
    //       },
    //       issuedDate: new Date().toISOString(),
    //       products: CustomerMonsantoProducts.map(
    //         ({ orderQty, MonsantoProduct }) => {
    //           const {
    //             crossReferenceProductId,
    //             lineNumber,
    //             suggestedDealerMeasurementUnitCode
    //           } = MonsantoProduct.LineItem || {};
    //           return {
    //             lineNumber: lineNumber,
    //             monsantoOrderQty: "1",
    //             productBookingLineItemNumber: "1",
    //             lineItemNumber: "1",
    //             action: "Add",
    //             requestedDate: new Date().toISOString(),
    //             crossReferenceProductId: crossReferenceProductId,
    //             increaseOrDecrease: {
    //               type: "Increase",
    //               value: orderQty,
    //               unit: "BG"
    //             },
    //             directShip: 1,
    //             quantity: {
    //               value: orderQty,
    //               unit: "BG"
    //             },
    //             requestedShipDate: new Date().toISOString(),
    //             specialInstructions: {
    //               type: "General",
    //               content: "Plant Early"
    //             },
    //             lineItem: {
    //               suggestedDealerMeasurementUnitCode: JSON.parse(
    //                 suggestedDealerMeasurementUnitCode
    //               )
    //             }
    //           };
    //         }
    //       )
    //     }
    //   ]
    // })
    //   .then(({ data }) => {
    //     this.setState({ isProductOrderBooking: false });
    //     this.setShowSnackbar(data.properties.responseStatus.description);
    //     console.log(data);
    //   })
    //   .catch(error => {
    //     this.setState({ isProductOrderBooking: false });
    //     this.setShowSnackbar(error);
    //     console.log(error);
    //   });
  }

  getTableData(customerOrders, selectedTab, currentPurchaseOrder) {
    let totalDiscount = 0;
    let tableData = [];
    let totals = {
      subTotal: 0,
      quantity: 0,
    };
    const { deliveryReceipts } = this.props;
    const oldDeliveryReceipt = [];
    const oldReturnDeliveryReceipt = [];

    deliveryReceipts
      .filter((d) => d.isReturn == false)
      .forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldDeliveryReceipt.push(ddd)));
    deliveryReceipts
      .filter((d) => d.isReturn == true)
      .forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldReturnDeliveryReceipt.push(ddd)));
    const { showDelivery, showOrderDate } = this.state;
    customerOrders &&
      customerOrders
        // .filter((order) => !order.farmId)
        .filter((order) => !order.monsantoProductId)
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
          } = customerProductDiscountsTotals(order, discountsPOJO, product, null, null, null, currentPurchaseOrder);
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
          const companyId =
            order.CustomProduct && order.CustomProduct.hasOwnProperty('Company')
              ? order.CustomProduct.companyId
              : order.Product.seedCompanyId;
          const productType =
            order.CustomProduct && order.CustomProduct.hasOwnProperty('Company') ? 'RegularCompany' : 'SeedCompany';
          const isPaymentData =
            this.props.payments.length > 0 &&
            this.props.payments.filter(
              (p) =>
                currentPurchaseOrder &&
                p.purchaseOrderId == currentPurchaseOrder.id &&
                (p.companyId == companyId || p.companyId == 0) &&
                (this.state.selectedShareholder == 'all'
                  ? true
                  : this.state.selectedShareholder.id == 'theCustomer'
                  ? p.shareholderId == 0
                  : p.shareholderId === this.state.selectedShareholder.id),
            );

          const remainQty = parseFloat(order.orderQty) + returnQty - parseFloat(allLotsDelivered);
          let totalPayment = 0;
          isPaymentData.length > 0 &&
            isPaymentData.map((p) => {
              const isMultiData =
                p.multiCompanyData.length > 0 &&
                p.multiCompanyData.find((c) => c.companyId == companyId && c.companyName == productType);

              return p.multiCompanyData.length > 0 && isMultiData !== undefined
                ? (totalPayment += parseFloat(isMultiData.amount || 0))
                : p.multiCompanyData.length == 0 && (totalPayment += parseFloat(p.amount || 0));
            });

          totalDiscount += discountAmount;
          const total = preTotal - discountAmount;

          tableData.push({
            qty: parseFloat(order.orderQty).toFixed(2),
            preTotal: preTotal,
            discountTotal: discountAmount.toFixed(2),
            discountName: <DiscountsNameList />,
            discountSubtotal: <DiscountsSubtotalList />,
            total: total.toFixed(2),
            discountsPOJO: discountsPOJO,
            Product: product,
            shareholderData: order.shareholderData,
            id: order.id,
            isPaymentData: isPaymentData,
            totalPayment: totalPayment,
            order,
            productType,
            companyId: companyId,
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
        Header: 'Product',
        show: true,
        id: 'customer',
        minWidth: 260,
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
              <div style={{ minWidth: '21em' }}>
                <p className={this.props.classes.companyBrand}>{productFirstLine}</p>
                <b>{productSecondLine}</b>
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
              <div>{numberToDollars(parseFloat(msrpEdited ? msrpEdited : msrp || 0))}</div>
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
          return numberToDollars(props.value.preTotal || 0);
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

  getTableDataMonsanto(customerOrders, selectedTab, currentPurchaseOrder) {
    let totalDiscount1 = 0;
    let tableData1 = [];

    let totals = {
      subTotal: 0,
      quantity: 0,
    };
    const {
      deliveryReceipts,

      customerReturnProducts,
      products,
      monsantoProducts,
      customProducts,
    } = this.props;
    const oldDeliveryReceipt = [];
    const oldReturnDeliveryReceipt = [];

    deliveryReceipts
      .filter((d) => d.isReturn == false)
      .forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldDeliveryReceipt.push(ddd)));
    deliveryReceipts
      .filter((d) => d.isReturn == true)
      .forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldReturnDeliveryReceipt.push(ddd)));
    const { showDelivery, showOrderDate } = this.state;
    customerOrders &&
      customerOrders
        // .filter((order) => console.log(!order.farmId))
        .filter((order) => order.monsantoProductId)
        .filter((order) => order.orderQty !== 0)
        .filter((order) => {
          if (order.MonsantoProduct && order.isDeleted) return null;
          return order;
        })
        .forEach((order) => {
          const { MonsantoProduct, monsantoProductId } = order;

          let preTotal;
          let product;
          let msrp;
          if (order.Product) {
            msrp = order.msrpEdited ? order.msrpEdited || 0 : order.Product.msrp || 0;
            preTotal = order.orderQty * parseFloat(msrp || 0);
            preTotal = preTotal.toFixed(2) || 0;
            product = order.Product;
          } else if (order.CustomProduct) {
            msrp = order.msrpEdited ? order.msrpEdited : order.CustomProduct.costUnit;
            preTotal = order.orderQty * parseFloat(msrp || 0);
            preTotal = preTotal.toFixed(2) || 0;
            product = order.CustomProduct;
          } else if (order.MonsantoProduct !== null && order.MonsantoProduct) {
            msrp = order.msrpEdited ? order.msrpEdited : order.price;
            preTotal = order.orderQty * parseFloat(msrp || 0);
            preTotal = preTotal.toFixed(2) || 0;
            product = order.MonsantoProduct;
          }

          const discountsPOJO =
            order &&
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
          } = customerProductDiscountsTotals(order, discountsPOJO, product, null, null, null, currentPurchaseOrder);
          totals.subTotal += customerProductDiscountsTotal;
          totals.quantity += order.orderQty;

          const DiscountsNameList = () => {
            let ordered =
              order &&
              order.discounts
                .sort((a, b) => a && a.order - b.order)
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
                  dd.monsantoProductId === ((MonsantoProduct !== null && MonsantoProduct.id) || monsantoProductId) &&
                  dd.customerMonsantoProductId === order.id,
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

          const DiscountsSubtotalList = () => {
            let ordered =
              order &&
              order.discounts &&
              order.discounts
                .sort((a, b) => a && a.order - b.order)
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
          const companyId = order.MonsantoProduct.ApiSeedCompany.id;

          const isPaymentData =
            this.props.payments.length > 0 &&
            this.props.payments.filter(
              (p) =>
                currentPurchaseOrder &&
                p.purchaseOrderId == currentPurchaseOrder.id &&
                (p.companyId == companyId || p.companyId == 0) &&
                (this.state.selectedShareholder == 'all'
                  ? true
                  : this.state.selectedShareholder.id == 'theCustomer'
                  ? p.shareholderId == 0
                  : p.shareholderId === this.state.selectedShareholder.id),
            );

          // const preTotal = isSeedCompany
          //   ? order.orderQty * parseFloat(order.Product.msrp)
          //   : order.orderQty * parseFloat(order.CustomProduct.costUnit);
          // const discountAmount = 0;
          totalDiscount1 += discountAmount;
          const total = preTotal - discountAmount;
          let totalPayment = 0;
          isPaymentData.length > 0 &&
            isPaymentData.map((p) => {
              const isMultiData =
                p.multiCompanyData.length > 0 &&
                p.multiCompanyData.find((c) => c.companyId == companyId && c.companyName == 'Bayer');

              return p.multiCompanyData.length > 0 && isMultiData !== undefined
                ? (totalPayment += parseFloat(isMultiData.amount || 0))
                : p.multiCompanyData.length == 0 && (totalPayment += parseFloat(p.amount || 0));
            });
          if (MonsantoProduct) {
            tableData1.push({
              orderDate: order.orderDate,
              qty: parseFloat(order.orderQty).toFixed(2),
              preTotal: preTotal || 0,
              discountTotal: discountAmount.toFixed(2),
              discountName: <DiscountsNameList />,
              discountSubtotal: <DiscountsSubtotalList />,
              total: total.toFixed(2),
              shareholderData: order.shareholderData,
              totalPayment: totalPayment,
              Product: product,
              msrp: msrp,
              id: order.id,
              classification: typesMap[order.MonsantoProduct.classification],
              order,
              isPaymentData: isPaymentData,
              discountsPOJO: discountsPOJO,
              pickLaterQty: order.pickLaterQty,
              companyId: companyId,
              productType: 'Bayer',
              monsantoProductId: order.monsantoProductId,
              remainQty: remainQty.toFixed(2),
              returnQty: returnQty.toFixed(2),
              quantityDelivered: (
                <p id="deliverdQty">{allLotsDelivered.length === 0 ? 0 : parseFloat(allLotsDelivered).toFixed(2)}</p>
              ),
            });
          }
        });
    let tableHeaders1 = [
      {
        Header: (
          <span>
            <CheckBox
              id="selectPOforsync"
              onChange={this.handleMonsantoProductPendingCheckboxAll(customerOrders)}
              // checked={this.state.syncMonsantoProductIds.includes(product.id)}
            />{' '}
            Product
          </span>
        ),
        show: true,

        id: 'customer',
        minWidth: Math.round(window.innerWidth * 0.2 - (window.innerWidth <= 1400 ? 0 : 100)),
        accessor: (d) => d,
        Cell: (props) => {
          const { classes, seedSizes, packagings } = this.props;
          const { impactSummary } = this.state;
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
            productFirstLine += `${seedCompany.name} `;
            const metadata = JSON.parse(seedCompany.metadata);
            productFirstLine += metadata[productSeedType] ? metadata[productSeedType].brandName : '';
          }

          if (product.companyId) {
            productFirstLine = product.name;
            productSecondLine = product.description;
            productCost = `UN-${product.costUnit}`;
          } else {
            if (product.blend) productSecondLine += `${product.blend}`;
            if (product.LineItem) {
              if (product.seedSize) {
                productSecondLine += ` ${product.seedSize}`;
              }
            }
            if (product.brand) productSecondLine += ` ${product.brand}`;
            if (product.LineItem) {
              if (product.packaging) productSecondLine += ` ${product.packaging}`;
            }

            if (product.blend == null && product.brand == null) productSecondLine += ` ${product.productDetail}`;
            if (product.treatment) productSecondLine += ` ${product.treatment}`;

            if (product.LineItem) {
              //Monsanto
              const unit = JSON.parse(product.LineItem.suggestedDealerMeasurementUnitCode).value;
              productCost = `${unit}-${product.LineItem.suggestedDealerPrice}`;
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

          const summaryData = impactSummary
            ? impactSummary.find((s) => s.crossReferenceId == product.LineItem.crossReferenceProductId)
            : '';

          return (
            <div className={classes.productDetailRow}>
              <div className={classes.productDetailRow}>
                {this.state.subjectName !== 'Quote' &&
                  isMonsantoSeedCompany &&
                  !isSent &&
                  order.qty >= 0 &&
                  order.order.MonsantoProduct.classification !== 'P' && (
                    <CheckBox
                      onChange={this.handleMonsantoProductPendingCheckbox(order.order)}
                      checked={this.state.syncMonsantoProductIds.includes(order.order.id)}
                    />
                  )}
                <div style={{ marginRight: '20px' }}>
                  {this.state.subjectName !== 'Quote' &&
                    isMonsantoSeedCompany &&
                    !isSent &&
                    order.qty >= 0 &&
                    !currentPurchaseOrder.isQuote &&
                    order.order.MonsantoProduct.classification !== 'P' && (
                      <Tooltip title="Product haven't synced to Bayer yet">
                        <WarningIcon className={classes.warningIcon} />
                      </Tooltip>
                    )}
                </div>

                <div>
                  <p className={this.props.classes.companyBrand}>{productFirstLine}</p>
                  <b>{productSecondLine}</b>
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
                  {/* {isMonsantoSeedCompany && <br />} */}
                  {/* {isMonsantoSeedCompany && product.crossReferenceId} */}
                  {summaryData && (
                    <React.Fragment>
                      <br />
                      Impact Summary
                      <br />
                      {/* {summaryData.increaseDecrease.type} : {`${summaryData.increaseDecrease.value}`} */}
                      <span>Supply (Dealer Order) : {`${summaryData.supply.replace('.000', '')}`}</span>
                      <br />
                      <span style={{ marginRight: '10px' }}>
                        {' '}
                        Total Demand : {`${summaryData.demand.replace('.000', '')}`}
                      </span>
                      <span>
                        Total Long/Short :{' '}
                        {`${summaryData.longShort.type == 'Short' ? '-' : ''}${summaryData.longShort.value.replace(
                          '.000',
                          '',
                        )}`}
                      </span>
                    </React.Fragment>
                  )}
                </div>
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
        // sortMethod: (a, b) => {
        //   const order = a;
        //   const product = order.Product;
        //   const msrpEdited = order.order.msrpEdited;
        //   let msrp = product.hasOwnProperty('classification')
        //     ? parseFloat(order.preTotal) / parseFloat(order.qty)
        //     : product.hasOwnProperty('customId')
        //     ? product.costUnit
        //     : product.msrp;
        //   const order1 = b;
        //   const product2 = order1.Product;
        //   const msrpEdited2 = order1.order.msrpEdited;
        //   let msrp2 = product2.hasOwnProperty('classification')
        //     ? parseFloat(order1.preTotal) / parseFloat(order1.qty)
        //     : product2.hasOwnProperty('customId')
        //     ? product2.costUnit
        //     : product2.msrp;

        //   return parseFloat(msrpEdited ? msrpEdited : msrp) - parseFloat(msrpEdited2 ? msrpEdited2 : msrp2);
        // },
        sortable: true,
        accessor: (d) => d,
        Cell: (props) => {
          const order = props.value;
          const product = order.Product;
          const msrpEdited = order.order.msrpEdited;

          let msrp = product.hasOwnProperty('classification')
            ? parseFloat(order.preTotal) / parseFloat(order.qty) || order.msrp
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
          return numberToDollars(props.value.preTotal || 0);
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
        sortMethod: (a, b) => {
          return parseFloat(a.discountTotal) - parseFloat(b.discountTotal);
        },
        sortable: true,

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
          return numberToDollars(item.preTotal - item.discountTotal || 0);
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

    return { tableData1, tableHeaders1, totalDiscount1, totals };
  }

  // getReturnTableData = (selectedTab, currentPurchaseOrder) => {
  //   let totalDiscountReturn = 0;

  //   let tableDataReturn = [];
  //   let nonBayerReturnData = [];
  //   let totalPreTotalreturn = 0;
  //   let totalsReturn = {
  //     subTotal: 0,
  //     quantity: 0,
  //   };
  //   const {
  //     deliveryReceipts,

  //     customerReturnProducts,
  //     products,
  //     monsantoProducts,
  //     customProducts,
  //   } = this.props;
  //   const oldDeliveryReceipt = [];
  //   deliveryReceipts.forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldDeliveryReceipt.push(ddd)));
  //   const { showDelivery } = this.state;
  //   // const currentPurchaseOrder =
  //   //   this.props.currentPurchaseOrder !== undefined ? this.props.currentPurchaseOrder : this.state.purchaseOrder;
  //   customerReturnProducts
  //     // .filter((order) => console.log(!order.farmId))

  //     // .filter(order => order.orderQty !== 0)
  //     .filter((order) => {
  //       if (order.isDeleted) return null;
  //       return order;
  //     })
  //     .forEach((order) => {
  //       const { monsantoProductId } = order;

  //       let preTotal;
  //       let product;
  //       let msrp;
  //       if (order.productId) {
  //         msrp = order.msrpEdited ? order.msrpEdited || 0 : products.filter((p) => p.id === order.productId).msrp || 0;
  //         preTotal = order.returnOrderQty * parseFloat(msrp);
  //         preTotal = preTotal.toFixed(2) || 0;
  //         product = products.filter((p) => p.id === order.productId);
  //       } else if (order.customProductId) {
  //         msrp = order.msrpEdited
  //           ? order.msrpEdited
  //           : customProducts.filter((cp) => cp.id === order.customProductId).costUnit;
  //         preTotal = order.returnOrderQty * parseFloat(msrp);
  //         preTotal = preTotal.toFixed(2) || 0;
  //         product = customProducts.filter((cp) => cp.id === order.customProductId);
  //       } else if (order.monsantoProductId !== null && order.monsantoProductId) {
  //         msrp = order.msrpEdited ? order.msrpEdited : order.price;
  //         preTotal = order.returnOrderQty * parseFloat(msrp);
  //         preTotal = preTotal.toFixed(2) || 0;
  //         product = monsantoProducts.filter((cmp) => cmp.id === order.monsantoProductId);
  //       }

  //       const discountsPOJO =
  //         order &&
  //         order.discounts
  //           .map((discount) => {
  //             return this.props.dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
  //           })
  //           .filter((el) => el);
  //       const {
  //         discounts,
  //         discountAmount,
  //         total: customerProductDiscountsTotal,
  //       } = customerProductDiscountsTotals(order, discountsPOJO, product, null, null, null, currentPurchaseOrder);
  //       totalsReturn.subTotal += customerProductDiscountsTotal;
  //       totalsReturn.quantity += order.returnOrderQty;
  //       const DiscountsNameList = () => {
  //         let ordered = order.discounts
  //           .sort((a, b) => a.order - b.order)
  //           .map((discount) => discounts[discount.DiscountId])
  //           .filter((x) => x);
  //         return (
  //           <div className={this.props.classes.discountList}>
  //             {ordered.map((discount) => (
  //               <Tooltip title={discount.dealerDiscount.name}>
  //                 <div className={this.props.classes.discountListItem} key={discount.dealerDiscount.id}>
  //                   {' '}
  //                   {discount.dealerDiscount.name.substring(0, 25) + '  (' + discount.value + ')'}
  //                 </div>
  //               </Tooltip>
  //             ))}
  //           </div>
  //         );
  //       };

  //       let allLotsDelivered =
  //         oldDeliveryReceipt &&
  //         oldDeliveryReceipt
  //           .filter(
  //             (dd) =>
  //               dd &&
  //               monsantoProductId &&
  //               dd.monsantoProductId === monsantoProductId &&
  //               dd.customerMonsantoProductId === order.id,
  //           )
  //           .map((d) => parseFloat(d.amountDelivered || 0) || 0)
  //           .reduce((partialSum, a) => partialSum + a, 0);

  //       let allLotsDeliveredNonBayer =
  //         oldDeliveryReceipt &&
  //         oldDeliveryReceipt
  //           .filter((dd) =>
  //             order.productId !== null
  //               ? dd.productId === order.productId
  //               : order.customProductId === order.customProductId && dd.customerMonsantoProductId === order.id,
  //           )
  //           .map((d) => parseFloat(d.amountDelivered || 0) || 0)
  //           .reduce((partialSum, a) => partialSum + a, 0);

  //       const remainQty = parseFloat(order.returnOrderQty).toFixed(2) - parseFloat(allLotsDelivered);

  //       const DiscountsSubtotalList = () => {
  //         let ordered = order.discounts
  //           .sort((a, b) => a.order - b.order)
  //           .map((discount) => discounts[discount.DiscountId])
  //           .filter((x) => x);
  //         return (
  //           <div className={this.props.classes.discountList}>
  //             {ordered.map((discount) => (
  //               <div className={this.props.classes.discountListItem} key={discount.dealerDiscount.id}>
  //                 {numberToDollars(discount.amount)}
  //               </div>
  //             ))}
  //           </div>
  //         );
  //       };

  //       // const preTotal = isSeedCompany
  //       //   ? order.orderQty * parseFloat(order.Product.msrp)
  //       //   : order.orderQty * parseFloat(order.CustomProduct.costUnit);
  //       // const discountAmount = 0;
  //       totalDiscountReturn += discountAmount;
  //       totalPreTotalreturn += preTotal;
  //       const total = preTotal - discountAmount;
  //       if (order.monsantoProductId !== null) {
  //         tableDataReturn.push({
  //           qty: parseFloat(order.returnOrderQty).toFixed(2),
  //           preTotal: preTotal || 0,
  //           discountTotal: discountAmount.toFixed(2),
  //           discountName: <DiscountsNameList />,
  //           discountSubtotal: <DiscountsSubtotalList />,
  //           total: total.toFixed(2),
  //           Product: product,
  //           id: order.id,
  //           order,
  //           monsantoProductId: order.monsantoProductId,
  //           remainQty: remainQty.toFixed(2),
  //           quantityDelivered: (
  //             <p id="deliverdQty">{allLotsDelivered.length === 0 ? 0 : parseFloat(allLotsDelivered).toFixed(2)}</p>
  //           ),
  //         });
  //       } else {
  //         nonBayerReturnData.push({
  //           qty: parseFloat(order.returnOrderQty).toFixed(2),
  //           preTotal: preTotal || 0,
  //           discountTotal: discountAmount.toFixed(2),
  //           discountName: <DiscountsNameList />,
  //           discountSubtotal: <DiscountsSubtotalList />,
  //           total: total.toFixed(2),
  //           Product: product,
  //           id: order.id,
  //           order,
  //           productId: order.productId ? order.productId : order.customProductId,
  //           remainQty: remainQty.toFixed(2),
  //           quantityDelivered: (
  //             <p id="deliverdQty">
  //               {allLotsDeliveredNonBayer.length === 0 ? 0 : parseFloat(allLotsDeliveredNonBayer).toFixed(2)}
  //             </p>
  //           ),
  //         });
  //       }
  //     });

  //   return { tableDataReturn, nonBayerReturnData, totalDiscountReturn, totalsReturn, totalPreTotalreturn };
  // };
  getDeliveryTableData = (customerOrders) => {
    return customerOrders.map((order, idx) => {
      return {
        product: getProductFromOrder(order, this.props.prducts, this.props.business),
        customerOrder: order,
      };
    });
  };

  handleDateChange = (date) => {
    this.setState({
      reminderDate: date,
    });
  };

  handleAddNoteDialogShow = () => {
    this.setState({ showAddNoteDialog: true });
  };

  handleAddNoteDialogClose = () => {
    this.setState({ showAddNoteDialog: false });
  };

  handleTranferPoDialogClose = () => {
    this.setState({ wantToTransferPo: false });
  };

  updateNote = () => {
    const { createNote, updateNote, organizationId } = this.props;
    const { purchaseOrder, purchaseOrderNote, reminderDate } = this.state;
    purchaseOrder.Notes.length > 0
      ? updateNote(purchaseOrder.Notes[0].id, {
          note: purchaseOrderNote,
          relatedType: 'purchase order',
          reminderDate: reminderDate,
        })
          .then(() => {
            this.handleAddNoteDialogClose();
            this.reload();
          })
          .catch((e) => {
            console.log(e);
          })
      : createNote({
          organizationId: organizationId,
          note: purchaseOrderNote,
          relatedType: 'purchase order',
          reminderDate: reminderDate,
          purchaseOrderId: purchaseOrder.id,
        })
          .then(() => {
            this.handleAddNoteDialogClose();
            this.reload();
          })
          .catch((e) => {
            console.log(e);
          });
  };

  updateName(name) {
    const { updatePurchaseOrder } = this.props;
    const { purchaseOrder } = this.state;

    updatePurchaseOrder(this.props.match.params.customer_id, purchaseOrder.id, {
      name,
    });
  }

  archivePurchaseOrder = () => {
    const { classes, updatePurchaseOrder } = this.props;
    const { purchaseOrder, subjectName } = this.state;

    this.setState({
      archivePurchaseOrderConfirm: (
        <SweetAlert
          warning
          showCancel
          title={`Archive ${subjectName}`}
          onConfirm={() =>
            updatePurchaseOrder(this.props.match.params.customer_id, purchaseOrder.id, {
              isArchive: true,
            }).then(() => {
              this.setState({
                archivePurchaseOrderConfirm: null,
              });
            })
          }
          onCancel={() => {
            this.setState({
              archivePurchaseOrderConfirm: null,
            });
          }}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to archive this {subjectName} ?
        </SweetAlert>
      ),
    });
  };

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
    if (
      this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket' && c.id == this.props.match.params.customer_id)
    ) {
      return this.props.history.push(
        `/app/dealers/${this.props.match.params.customer_id}/purchase_order/new?is_quote=${isQuote}`,
      );
    } else {
      return this.props.history.push(
        `/app/customers/${this.props.match.params.customer_id}/purchase_order/new?is_quote=${isQuote}`,
      );
    }
  };

  removePurchaseOrder = () => {
    const { classes, removeItemForCustomer, match, history } = this.props;
    const { subjectName, purchaseOrder, isDeleteLoading } = this.state;
    this.setState({
      deletePurchaseOrderConfirm: (
        <SweetAlert
          warning
          showCancel
          title={`Delete ${subjectName}`}
          confirmBtnText={<span id="ok">Ok</span>}
          cancelBtnText={<span id="cancel">Cancel</span>}
          onConfirm={() => {
            this.setState({ isDeleteLoading: true });
            removeItemForCustomer(match.params.customer_id, match.params.id, history)
              .then(() => {
                if (
                  this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket' && c.id == match.params.customer_id)
                ) {
                  this.props.history.push('/app/dealers');
                } else {
                  this.props.history.push('/app/customers');
                  window.location.reload();
                }
              })
              .catch((e) => {
                this.setState({ isDeleteLoading: false });

                console.log(e, 'e.response.data.error');
                this.setShowSnackbar(e ? e.toString() : 'Error While deleting Order');
              });
          }}
          onCancel={() => {
            this.setState({
              deletePurchaseOrderConfirm: null,
            });
          }}
          confirmBtnCssClass={classes.button + ' ' + classes.success + ' '}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to delete this 963963{subjectName} ?
          {!subjectName == 'Quote' ? (
            <Button
              onClick={() => {
                this.setState({
                  wantToTransferPo: true,
                  deletePurchaseOrderConfirm: true,
                  transferingProducts: purchaseOrder,
                });
              }}
            >
              transfer
            </Button>
          ) : (
            ''
          )}
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

  updateProductMSRP = async (product, editMSRP) => {
    const { editRelatedProduct, editRelatedCustomProduct } = this.props;
    const updateFunction = product.hasOwnProperty('customProductId') ? editRelatedCustomProduct : editRelatedProduct;
    await updateFunction(product.customerId, product.id, {
      msrpEdited: parseFloat(editMSRP),
      isMonsantoPoruduct: product.hasOwnProperty('monsantoProductId') ? true : false,
    });
    this.reload();
  };

  openMSRPEdit = (product) => {
    this.setState({
      openMSRPEditDialog: (
        <FarmEditMSRPDialog
          open={true}
          onClose={this.hideMSRPEdit}
          updateProductMSRP={this.updateProductMSRP}
          product={product}
        />
      ),
    });
  };

  hideMSRPEdit = () => {
    this.setState({ openMSRPEditDialog: null });
  };

  cloneItem = () => {
    const { match, cloneItem } = this.props;
    cloneItem(match.params.id).then((response) => this.gotoPurchaseOrder(response.payload.id));
  };

  onDiscountsReorder(order, sortable, e) {
    const { purchaseOrder } = this.state;
    const { updatePurchaseOrder } = this.props;
    const currentPurchaseOrder =
      this.props.currentPurchaseOrder !== undefined ? this.props.currentPurchaseOrder : this.state.purchaseOrder;
    let dealerDiscountIds = order.map((id) => parseInt(id, 10));
    updatePurchaseOrder(this.props.match.params.customer_id, purchaseOrder.id, {
      dealerDiscountIds,
    }).then(() => {
      // const purchaseOrder = this.props.items.find((po) => `${po.id}` === `${this.props.match.params.id}`);
      this.setState({
        purchaseOrder: currentPurchaseOrder,
      });
    });
  }

  addDiscount = (discount) => {
    const { purchaseOrder } = this.state;
    const { updatePurchaseOrder } = this.props;
    let dealerDiscounts = purchaseOrder.dealerDiscounts || [];

    let selected = {
      order: dealerDiscounts.length,
      DiscountId: discount.id,
    };
    if (discount.discountStrategy === 'Flat Amount Discount' && discount.detail.length === 1) {
      selected.unit = discount.detail[0].unit;
      selected.discountValue = discount.detail[0].discountValue;
    }
    dealerDiscounts.push(selected);
    updatePurchaseOrder(this.props.match.params.customer_id, purchaseOrder.id, {
      dealerDiscounts,
    }).then(() => {
      this.reload();
    });
  };

  removeDiscount = (discount) => {
    const { purchaseOrder } = this.state;
    const { updatePurchaseOrder } = this.props;

    let dealerDiscounts = purchaseOrder.dealerDiscounts;

    updatePurchaseOrder(this.props.match.params.customer_id, purchaseOrder.id, {
      dealerDiscounts: dealerDiscounts.filter((dd) => dd !== discount),
    }).then(() => {
      this.reload();
    });
  };

  onValueChange = (event, selected, isUnit) => {
    const { purchaseOrder } = this.state;
    const { updatePurchaseOrder } = this.props;

    const updated = Object.assign({}, selected);
    if (isUnit == true) {
      updated.unit = event.target.value;
    } else if (isUnit == 'comment') {
      updated.comment = event.target.value;
    } else {
      updated.discountValue = event.target.value;
    }

    updatePurchaseOrder(this.props.match.params.customer_id, purchaseOrder.id, {
      dealerDiscounts: purchaseOrder.dealerDiscounts.map((discount) => {
        if (discount.DiscountId !== selected.DiscountId) return discount;
        return updated;
      }),
    }).then(() => {
      this.reload();
    });
  };

  cancelFarmDialog = () => {
    this.setState({
      showFarmForm: false,
    });
  };

  createFarm = (name) => {
    const { createFarm, updatePurchaseOrder, currentPurchaseOrder: purchaseOrder } = this.props;
    const customerId = this.props.match.params.customer_id;

    createFarm(customerId, { name })
      .then((action) => {
        if (!purchaseOrder.farmData) {
          purchaseOrder.farmData = [];
        }
        purchaseOrder.farmData.push({
          farmId: action.payload.id,
          shareholderData: [],
        });
        return updatePurchaseOrder(customerId, purchaseOrder.id, {
          farmData: purchaseOrder.farmData,
        });
      })
      .then(() =>
        this.setState({
          showFarmForm: false,
        }),
      )
      .then(() => {
        this.reload();
      });
  };

  addExistingFarm = (farmId) => {
    const { updatePurchaseOrder, currentPurchaseOrder: purchaseOrder } = this.props;

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

  // print = () => {
  //   setTimeout(() => {
  //     window.print();
  //   }, 500);
  // };

  handleMoreFuncMenuToggle = () => {
    this.setState((state) => ({ moreFuncMenuOpen: !state.moreFuncMenuOpen }));
  };

  handleMoreFuncMenuClose = () => {
    this.setState({ moreFuncMenuOpen: false });
  };

  getTotalDeliveries(purchaseOrderId) {
    const { relatedProducts } = this.props;
    const totalCustomerProductsDeliveries = relatedProducts
      .filter((cp) => cp.purchaseOrderId === purchaseOrderId)
      .reduce((sum, order) => sum + order.orderQty, 0);
    return totalCustomerProductsDeliveries;
  }

  openSwitchDialog = () => {
    this.setState({
      switchDialogOpen: true,
    });
  };

  closeSwitchDialog = () => {
    this.setState({
      switchDialogOpen: false,
    });
  };

  handleChangeNameOpen = () => {
    this.setState({ isChangingName: true });
  };

  handleChangeNameClose = () => {
    this.setState({ isChangingName: false });
  };

  handleNameChange = () => (event) => {
    this.setState({
      name: event.target.value,
    });
  };

  handleNoteChange = (e) => {
    this.setState({ purchaseOrderNote: e.target.value });
  };

  handleNameChangeSubmit = async (customerId, purchaseOrderId) => {
    const { updatePurchaseOrder } = this.props;
    const { name } = this.state;
    await updatePurchaseOrder(customerId, purchaseOrderId, { name });
    this.setState({ isChangingName: false });
    this.reload();
  };

  handleConvertToAdvancedDialogOpen = () => {
    this.setState({ convertToAdvancedDialogOpen: true });
  };

  handleConvertToAdvancedDialogClose = () => {
    this.setState({ convertToAdvancedDialogOpen: false });
  };

  setShowSnackbar = (showSnackbarText) => {
    this.setState({
      showSnackbar: true,
      showSnackbarText: showSnackbarText,
    });
  };
  getMSRP(selectedProduct) {
    const { customers } = this.props;
    const customerId = this.props.match.params.customer_id;

    let currentzone = 'NZI';
    const currentCust = customers.filter((c) => c.id == customerId)[0];

    const customerZones =
      currentCust !== undefined && Array.isArray(currentCust.zoneIds)
        ? currentCust && currentCust.zoneIds
        : currentCust && JSON.parse(currentCust.zoneIds);

    customerZones &&
      customerZones.map((item) => {
        if (item.classification && item.classification.toUpperCase() === typesMap[selectedProduct.classification]) {
          currentzone = item.zoneId;
        }
      });
    let growerPrice = 0;
    let msrp = 0;

    if (
      selectedProduct &&
      selectedProduct.hasOwnProperty('seedCompanyId') &&
      selectedProduct.msrp &&
      selectedProduct.msrp !== undefined &&
      selectedProduct.msrp !== null
    ) {
      msrp =
        typeof selectedProduct.msrp === 'string'
          ? selectedProduct.msrp
          : currentzone && JSON.parse(selectedProduct.msrp)[currentzone];
      return msrp;
    }

    if (selectedProduct && (selectedProduct.length === 1 || selectedProduct.length === undefined)) {
      if (JSON.parse(selectedProduct.LineItem.suggestedEndUserPrice).hasOwnProperty('NZI')) {
        growerPrice = JSON.parse(selectedProduct.LineItem.suggestedEndUserPrice)['NZI'];
      } else {
        growerPrice = JSON.parse(selectedProduct.LineItem.suggestedEndUserPrice)[currentzone];
      }
    } else {
      growerPrice = 0;
    }
    return growerPrice || 0;
  }
  // sync Bayer products
  syncMonsantoOrders = async () => {
    const { currentPurchaseOrder, checkProductAvailability, deliveryReceipts } = this.props;
    const { syncMonsantoProductIds } = this.state;
    const { CustomerMonsantoProducts } = currentPurchaseOrder;
    if (!currentPurchaseOrder) return;
    // check Bayer product availability
    let isMonsantoServiceDown = false;
    let noEnoughQtyProducts = [],
      notAvailableProducts = [];

    const deleteprodct =
      currentPurchaseOrder.DeliveryReceipts.length > 0 &&
      CustomerMonsantoProducts.length > 0 &&
      CustomerMonsantoProducts.filter(
        (c) =>
          c.isSent === false &&
          parseFloat(c.orderQty) === 0 &&
          c.isDeleted === false &&
          syncMonsantoProductIds.includes(c.monsantoProductId),
      );

    this.setState({
      isSyncingMonsantoProducts: true,
      // isCheckingProductAvailability: true
    });

    currentPurchaseOrder.DeliveryReceipts.length > 0 &&
      deleteprodct.length > 0 &&
      this.setShowSnackbar(
        'Looks like you have already delivered this product. By deleting this product, it will nullify whatever you have reported to Bayer GPOS previously',
      );
    // const CustomerMonsantoProducts = monsantoProducts.filter(
    //   monsantoProduct =>
    //     syncMonsantoProductIds.includes(monsantoProduct.monsantoProductId) ||
    //     (monsantoProduct.isDeleted && !monsantoProduct.isDeletedSynced)
    // );
    // if (CustomerMonsantoProducts.length > 0) {
    //   await checkProductAvailability({
    //     CustomerMonsantoProducts: CustomerMonsantoProducts
    //   })
    //     .then(res => {
    //       this.setShowSnackbar("Check product availability done!");
    //       noEnoughQtyProducts = res.data.noEnoughQtyProducts;
    //       notAvailableProducts = res.data.notAvailableProducts;
    //       //compare response availability with orderqty
    //     })
    //     .catch(e => {
    //       // console.log(e.message)
    //       this.setState({
    //         isSyncingMonsantoProducts: false,
    //         isCheckingProductAvailability: false
    //       });
    //       // console.log(e.message);
    //       isMonsantoServiceDown = true;
    //       if (e.message === "Request failed with status code 503") {
    //         this.setShowSnackbar(
    //           "The Bayer server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later."
    //         );
    //       } else {
    //         this.setShowSnackbar(
    //           "Cannot check product availability! Please try later!"
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
      .then((data) => {
        this.setState({ isSyncingMonsantoProducts: false, impactSummary: data.impactSummary });
        if (notAvailableProducts.length > 0) {
          this.setShowSnackbar('Sync with Bayer Done! Some products are not available for now!');
        }
        this.setShowSnackbar(data.msg || '');
        this.reload();
      })
      .catch((e) => {
        this.setState({ isSyncingMonsantoProducts: false });
        if (e && e.response) {
          this.setShowSnackbar(e.response.data.error || 'Cannot sync with Monsanto! Please try later!');
        } else {
          this.setShowSnackbar(
            'The Bayer server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later.',
          );
        }
      });
  };

  getPickLaterData = (tableData1) => {
    const { currentPurchaseOrder } = this.props;

    const group = groupBy(
      currentPurchaseOrder &&
        currentPurchaseOrder.CustomerMonsantoProducts.filter((f) => f.isDeleted == false && f.isPickLater == true),
      (o) => {
        return o.MonsantoProduct.blend + '-' + o.MonsantoProduct.brand + '-' + o.MonsantoProduct.treatment;
      },
    );
    const pickLaterData = [];
    Object.keys(group).map((d) => {
      let totalQty = 0;
      let totalMonsantoOrderQty = 0;
      let qtyValue = [];

      group[d].map((g) => {
        totalQty += parseFloat(g.pickLaterQty !== null ? g.pickLaterQty : 0);
        qtyValue.push(g.pickLaterQty);
      });

      const product = group[d][0].MonsantoProduct;
      tableData1
        .filter(
          (t) =>
            t.pickLaterQty == 0 &&
            parseFloat(t.qty) > 0 &&
            t.Product.blend == product.blend &&
            t.Product.brand == product.brand &&
            t.Product.classification == product.classification &&
            t.Product.treatment == product.treatment,
        )
        .map((g) => {
          return (totalMonsantoOrderQty += parseFloat(
            g.order.monsantoOrderQty !== null ? g.order.monsantoOrderQty : 0,
          ));
        });
      pickLaterData.push({
        total: totalQty,
        blend: product.blend,
        brand: product.brand,
        treatment: product.treatment,
        classification: product.classification,
        allQtyValue: qtyValue,
        monsantoOrderQty: totalMonsantoOrderQty,
        order: group[d][0],
      });
    });

    return pickLaterData;
  };

  setIsMonsantoProductReduceQuantity = (isMonsantoProductReduceQuantity) => {
    this.setState({ isMonsantoProductReduceQuantity });
  };

  setMonsantoProductReduceInfo = (monsantoProductReduceTransferInfo) => {
    this.setState({ monsantoProductReduceTransferInfo });
  };

  onTabChange = (selectedTabIndex) => {
    const { currentPurchaseOrder } = this.props;
    let path = '';
    if (
      this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket' && c.id == currentPurchaseOrder.Customer.id)
    ) {
      path = '/app/dealers';
    } else {
      path = '/app/customers';
    }
    // if (selectedTabIndex === 1) {
    //   this.props.history.push(`${path}/${currentPurchaseOrder.Customer.id}/invoice/${currentPurchaseOrder.id}`);
    // }
    const isShowPickLater = currentPurchaseOrder.CustomerMonsantoProducts.filter((f) => f.isPickLater == true);

    if (currentPurchaseOrder.isQuote) {
      if (selectedTabIndex === 0) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/${currentPurchaseOrder.isQuote ? 'quote' : 'purchase_order'}/${
            currentPurchaseOrder.id
          }?selectedTabIndex=${selectedTabIndex}`,
        );
      }

      if (selectedTabIndex === 1) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/purchase_order/${currentPurchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }
      if (selectedTabIndex === 2) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/preview/${currentPurchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }
    } else if (isShowPickLater.length > 0) {
      if (selectedTabIndex === 0) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/${currentPurchaseOrder.isQuote ? 'quote' : 'purchase_order'}/${
            currentPurchaseOrder.id
          }?selectedTabIndex=${selectedTabIndex}`,
        );
      }

      if (selectedTabIndex === 5) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/purchase_order/${currentPurchaseOrder.id}/deliveries?selectedTabIndex=${selectedTabIndex}&isReturn=true`,
        );
      }
      if (selectedTabIndex === 1) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/purchase_order/${currentPurchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }
      if (selectedTabIndex === 2) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/purchase_order/${currentPurchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }

      if (selectedTabIndex === 3) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/preview/${currentPurchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }

      if (selectedTabIndex === 4) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/purchase_order/${currentPurchaseOrder.id}/deliveries?selectedTabIndex=${selectedTabIndex}&isReturn=false`,
        );
      }
    } else {
      if (selectedTabIndex === 0) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/${currentPurchaseOrder.isQuote ? 'quote' : 'purchase_order'}/${
            currentPurchaseOrder.id
          }?selectedTabIndex=${selectedTabIndex}`,
        );
      }

      if (selectedTabIndex === 3) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/purchase_order/${currentPurchaseOrder.id}/deliveries?selectedTabIndex=${selectedTabIndex}&isReturn=false`,
        );
      }

      if (selectedTabIndex === 1) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/purchase_order/${currentPurchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }
      if (selectedTabIndex === 2) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/preview/${currentPurchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }

      if (selectedTabIndex === 4) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/purchase_order/${currentPurchaseOrder.id}/deliveries?selectedTabIndex=${selectedTabIndex}&isReturn=true`,
        );
      }
      if (selectedTabIndex === 5) {
        this.props.history.push(
          `${path}/${currentPurchaseOrder.Customer.id}/purchase_order/${currentPurchaseOrder.id}?selectedTabIndex=${selectedTabIndex}`,
        );
      }
    }

    this.setState({ selectedTabIndex });
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

  handleAddCustomEarlyDialogOpen = () => {
    this.setState({
      showAddCustomEarlyPayDialog: true,
    });
  };

  handleAddCustomEarlyDialogClose = () => {
    this.setState({ showAddCustomEarlyPayDialog: false });
  };

  addRelatedCustomProducts = async (data, farmId) => {
    const {
      currentPurchaseOrder,
      linkRelatedCustomProduct,
      linkRelatedProduct,
      editRelatedProduct,
      companies,
      seedCompanies,
    } = this.props;
    const { productsToOrder: relatedProducts, discounts } = data;
    const linkFunction = relatedProducts[0].hasOwnProperty('seedCompanyId')
      ? linkRelatedProduct
      : linkRelatedCustomProduct;
    const { addingRelatedCustomProductProduct } = this.state;
    relatedProducts.forEach(async (relatedProduct, index) => {
      await linkFunction(
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
      let company = null;
      if (relatedProducts[0].hasOwnProperty('seedCompanyId')) {
        company = seedCompanies.find((co) => co.id === relatedProduct.seedCompanyId);
      } else {
        company = companies.find((_company) => _company.id === relatedProduct.companyId);
      }
      if (!company) return;
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

  showDeliveryRow = () => {
    this.setState({ showDelivery: !this.state.showDelivery });
  };

  handleViewPaymentsDialogOpen = (customer) => {
    const { currentPurchaseOrder, shareholders, payments } = this.props;
    if (customer && customer.PurchaseOrders) {
      customer.PurchaseOrders = [customer.PurchaseOrders.find((p) => p.id === currentPurchaseOrder.id)];
      customer.PurchaseOrders !== undefined &&
        this.setState({
          showViewPaymentDialog: (
            <ViewPaymentsDialog
              open={true}
              onClose={this.handleViewPaymentsDialogClose}
              classes={this.props.classes}
              customer={customer}
              currentPurchaseOrder={currentPurchaseOrder}
              shareholders={shareholders}
              payments={payments}
            />
          ),
        });
    }
  };

  handleViewPaymentsDialogClose = (customer, payments) => {
    this.setState({ showViewPaymentDialog: null });
  };

  addDiscountReport = async () => {
    const { currentPurchaseOrder } = this.props;

    if (currentPurchaseOrder) {
      const customerOrders = currentPurchaseOrder.CustomerProducts.sort((a, b) => a.productId - b.productId).concat(
        currentPurchaseOrder.CustomerCustomProducts.sort((a, b) => a.customProductId - b.customProductId),
        currentPurchaseOrder.CustomerMonsantoProducts,
      );
      const { tableData } = this.getTableData(customerOrders);
      const { tableData1 } = this.getTableDataMonsanto(customerOrders);
      const discountJSON = [];
      [...tableData, ...tableData1].map((item) => {
        const ele1 = document.createElement('div');
        ele1.innerHTML = renderToString(item.discountName);
        const ele2 = document.createElement('div');
        ele2.innerHTML = renderToString(item.discountSubtotal);
        const DiscountName = Array.from(ele1.firstChild.children, ({ textContent }) => textContent.trim()).filter(
          Boolean,
        );
        const DiscountSubtotal = Array.from(ele2.firstChild.children, ({ textContent }) => textContent.trim()).filter(
          Boolean,
        );
        item.order.discounts.map((inneritem, i) =>
          discountJSON.push({
            DiscountName: DiscountName[i],
            DiscountSubtotal: DiscountSubtotal[i],
            discountId: inneritem.DiscountId,
          }),
        );
      });

      this.props.createDiscounReport({
        discountJSON: discountJSON,
        purchaseOrderId: this.props.currentPurchaseOrder.id,
      });
    }
  };

  groupDataByproduct = (arr) => {
    var tableDataGroup = [];
    arr.reduce(function (res, value) {
      const pID = value.monsantoProductId ? value.monsantoProductId : value.productId;
      if (!res[pID]) {
        res[pID] = {
          Product: value.Product,
          order: value.order,
          id: value.id,
          discountName: value.discountName,
          discountSubtotal: value.discountSubtotal,
          qty: 0,
          preTotal: 0,
          total: 0,
          discountTotal: 0,
        };
        tableDataGroup.push(res[pID]);
      }
      res[pID].qty += Number(value.qty);
      res[pID].preTotal += Number(value.preTotal);
      res[pID].total += Number(value.total);
      res[pID].discountTotal += Number(value.discountTotal);

      return res;
    }, {});

    return tableDataGroup;
  };

  checkProductavaiblty = async (selectedProduct) => {
    const { checkinOrderProductAvailability } = this.props;

    const { crossReferenceId, classification } = selectedProduct.MonsantoProduct;
    this.setState({ [`ischeckingProductavaiblty${selectedProduct.id}`]: true });
    await checkinOrderProductAvailability({
      productList: [
        {
          crossReferenceId: crossReferenceId,
          classification: classification,
          LineItem: {
            suggestedDealerMeasurementValue: selectedProduct.orderQty,
            suggestedDealerMeasurementUnitCode: {
              value: 'BG',
              domain: 'UN-Rec-20',
            },
          },
        },
      ],
    })
      .then((res) => {
        this.setState({
          [`ischeckingProductavaiblty${selectedProduct.id}`]: false,
          [`productAvailability${selectedProduct.id}`]: res.data.length > 0 ? res.data[0].quantityComment : '0 Units',
        });
      })
      .catch((e) => {
        console.log(e, 'e');
        this.setShowSnackbar(e.response.data.error || e);
        this.setState({ [`ischeckingProductavaiblty${selectedProduct.id}`]: false });
      });
  };

  handleSelectChange = (event) => {
    const { activeTableItem } = this.state;
    const { apiSeedCompanies } = this.props;
    if (this.state.setOfRow.length > 0) {
      let data = this.state.setOfRow[0];
      if (data !== undefined) {
        data[event.target.name] = event.target.value;
      }
      if (data.seedSize !== '' && data.packaging != '') {
        const currentProduct =
          apiSeedCompanies &&
          apiSeedCompanies[0].Products.filter(
            (d) =>
              d.blend == activeTableItem.blend &&
              d.brand == activeTableItem.brand &&
              d.treatment == activeTableItem.treatment &&
              d.seedSize == data.seedSize &&
              d.packaging == data.packaging &&
              d.classification == activeTableItem.classification,
          );
        data['monsantoProductId'] = currentProduct.length > 0 && currentProduct[0].id;
      }
      this.setState({ setOfRow: [data] });
    }
  };
  unique(arr, keyProps) {
    const kvArray = arr.map((entry) => {
      const key = keyProps.map((k) => entry[k]).join('|');
      return [key, entry];
    });
    const map = new Map(kvArray);
    return Array.from(map.values());
  }
  handleEditChange = (e, order) => {
    this.setState({ [`editQty${order.id}`]: e.target.value });
  };

  print = async () => {
    // console.log('print')
    // TODO: if we dont end up using html2pdf.js, remove it as a dependency

    await this.setState({ isPrinting: true, pickLaterShow: false });

    const { purchaseOrder, customer } = this.props;
    const tempTitle = document.title;
    document.title = `paymentInvoice-${this.props.match.params.id}`;
    window.print();
    document.title = tempTitle;
    this.setState({ isPrinting: false });
  };

  earlyPayTableData = (purchaseOrders) => {
    const {
      dealerDiscounts,
      products,
      customProducts,
      classes,
      MonsantoProduct,
      payments,
      customers,
      currentPurchaseOrder,
    } = this.props;
    const poId = this.props.match.params.id;
    const customerId = this.props.match.params.customer_id;

    const currentCust = (this.state.allCustomerData.length > 0 ? this.state.allCustomerData : customers).filter(
      (c) => c.id == customerId,
    );

    let purchaseOrder =
      currentCust.length > 0
        ? currentCust[0].PurchaseOrders.length > 0 &&
          currentCust[0].PurchaseOrders.find((p) => p.id == poId) == undefined
          ? currentPurchaseOrder
          : currentCust[0].PurchaseOrders.find((p) => p.id == poId)
        : currentPurchaseOrder;

    purchaseOrder = currentPurchaseOrder == undefined ? purchaseOrders : currentPurchaseOrder || purchaseOrders;

    const CustomerCustomProducts =
      purchaseOrders && purchaseOrder.CustomerCustomProducts.length > 0 && purchaseOrder.CustomerCustomProducts;

    const CustomerMonsantoProducts =
      purchaseOrders && purchaseOrder.CustomerMonsantoProducts.length > 0 && purchaseOrder.CustomerMonsantoProducts;

    const allProduct = [...CustomerCustomProducts, ...CustomerMonsantoProducts, ...purchaseOrder.CustomerProducts];

    const futureDiscountTotals = getFutureDiscountTotals({
      customerOrders: allProduct.length > 0 ? allProduct.filter((c) => c.isDeleted == false) : [],
      shareholder: this.state.selectedShareholder == 'all' ? '' : this.state.selectedShareholder,
      dealerDiscounts,
      purchaseOrder,
      products,
      customProducts,
      MonsantoProduct,
    });
    const selectedTab = this.state.selectedTabIndex;

    const basedOnDates = [];

    futureDiscountTotals !== null &&
      Object.keys(futureDiscountTotals)

        .sort()
        .forEach((date, i) => {
          let total = 0;
          basedOnDates[date] = [];

          const d = futureDiscountTotals[date].filter((c) => {
            const discountId =
              c.discounts &&
              Object.keys(c.discounts).filter((d) => {
                return (
                  c.discounts[d] &&
                  c.discounts[d].discountStrategy == 'Early Pay Discount' &&
                  c.discounts[d].discountDate == date
                );
              });

            return (
              (c.currentDisount == undefined &&
                Object.keys(c.discounts).length > 0 &&
                (Object.keys(c.discounts).length !== 0 && discountId.length !== 0
                  ? Object.keys(c.discounts).includes(discountId)
                  : true)) ||
              (c.currentDisount !== undefined &&
                // Object.keys(c.discounts).length > 0 &&
                c.currentDisount.hasOwnProperty('date') &&
                c.currentDisount.date >= c.orderDate &&
                c.currentDisount.date == date)
            );
            // discountId.length > 0 &&
          });

          basedOnDates[date].push(d);
          // basedOnDates.push({ [date]: d });
        });

    // basedOnDates.push(futureDiscountTotals[Object.keys(futureDiscountTotals).length - 1]);

    let FinalSeprateTableData = [];
    basedOnDates !== null &&
      Object.keys(basedOnDates)
        .sort()
        .forEach((date, index) => {
          basedOnDates[date][0].length > 0 &&
            basedOnDates[date][0].map((order, i) => {
              const seedCompany = this.props.seedCompanies.filter((s) => s.id === order.companyId)[0];
              const companies = this.props.companies.filter((s) => s.id === order.companyId)[0];

              const CompanyName =
                order.productType == 'Bayer'
                  ? 'Bayer'
                  : order.productType == 'SeedCompany'
                  ? seedCompany !== undefined
                    ? `${seedCompany.name}`
                    : ''
                  : companies !== undefined
                  ? `${companies.name || 'regular'}`
                  : '';
              FinalSeprateTableData.push({
                date: moment.utc(date).format('MMM D, YYYY'),
                companyId: order.companyId,
                CompanyName: CompanyName,
                index: index,
                total: parseFloat(order.total),
                productType: order.productType,
                orderDate: order.orderDate,
                checkDate: date,
                originalPrice: order.originalPrice,
                shareholderData: order.shareholderData,
                // discounts: order.discounts,
                currentDisount: order.currentDisount == undefined ? 0 : order.currentDisount,
                order: order,
              });
            });
        });

    const groupBasedOnTable = [];
    let helper0 = {};

    FinalSeprateTableData.reduce(function (r, o) {
      const key = o.date + '-' + o.companyId + '-' + o.productType;

      if (!helper0[key]) {
        helper0[key] = Object.assign({}, o);
        helper0[key].orderGroup = [o.order];
        helper0[key].invoiceTotal = parseFloat(o.total); // create a copy of o
        groupBasedOnTable.push(helper0[key]);
      } else {
        helper0[key].total = parseFloat(helper0[key].total) + parseFloat(o.total);
        helper0[key].invoiceTotal = parseFloat(helper0[key].invoiceTotal) + parseFloat(o.total);
        helper0[key].orderGroup = helper0[key].orderGroup ? [...helper0[key].orderGroup, o.order] : [o.order];
      }
    }, {});

    // for bayer product
    const bayerProduct = [];

    const b = groupBasedOnTable.filter((d) => d.productType == 'Bayer' && d.originalPrice !== 0 && d.total !== 0);

    b.map((d, i) => {
      const filterOrder = d.orderGroup.filter((p) => {
        return i == 0 ? p.orderDate <= d.checkDate : p.orderDate <= d.checkDate && p.orderDate >= b[i - 1].checkDate;
      });
      const total =
        (i == 0 ? 0 : bayerProduct[i - 1].finalInvoiceAmount) *
        ((1 - parseFloat(d.currentDisount == 0 ? 0 : d.currentDisount.discountValue) / 100) /
          (1 - parseFloat(i == 0 ? 0 : b[i - 1].currentDisount.discountValue) / 100));
      let orderTotal = 0;
      filterOrder.map((f) => (orderTotal += f.total));

      const finalTotal = total + orderTotal;

      bayerProduct.push({ ...d, finalInvoiceAmount: finalTotal, orderGroupTotal: orderTotal });
    });

    //for regular product
    const regularProduct = [];

    const r = groupBasedOnTable.filter(
      (d) => d.productType == 'RegularCompany' && d.originalPrice !== 0 && d.total !== 0,
    );
    r.map((d, i) => {
      const filterOrder = d.orderGroup.filter((p) => {
        return i == 0 ? p.orderDate <= d.checkDate : p.orderDate <= d.checkDate && p.orderDate >= r[i - 1].checkDate;
      });
      const total =
        (i == 0 ? 0 : regularProduct[i - 1].finalInvoiceAmount) *
        ((1 - parseFloat(d.currentDisount == 0 ? 0 : d.currentDisount.discountValue) / 100) /
          (1 - parseFloat(i == 0 ? 0 : r[i - 1].currentDisount.discountValue) / 100));
      let orderTotal = 0;
      filterOrder.map((f) => (orderTotal += f.total));

      const finalTotal = total + orderTotal;

      regularProduct.push({ ...d, finalInvoiceAmount: finalTotal, orderGroupTotal: orderTotal });
    });
    //for seed product's
    const seedProduct = [];

    const s = groupBasedOnTable.filter((d) => d.productType == 'SeedCompany' && d.originalPrice !== 0 && d.total !== 0);
    s.map((d, i) => {
      const filterOrder = d.orderGroup.filter((p) => {
        return i == 0 ? p.orderDate <= d.checkDate : p.orderDate <= d.checkDate && p.orderDate >= s[i - 1].checkDate;
      });
      const total =
        (i == 0 ? 0 : seedProduct[i - 1].finalInvoiceAmount) *
        ((1 - parseFloat(d.currentDisount == 0 ? 0 : d.currentDisount.discountValue) / 100) /
          (1 - parseFloat(i == 0 ? 0 : s[i - 1].currentDisount.discountValue) / 100));
      let orderTotal = 0;
      filterOrder.map((f) => (orderTotal += f.total));

      const finalTotal = total + orderTotal;

      seedProduct.push({ ...d, finalInvoiceAmount: finalTotal, orderGroupTotal: orderTotal });
    });
    return { futureDiscountTotals, bayerProduct, regularProduct, seedProduct, groupBasedOnTable };
  };

  getEarPayTableData = (futureDiscountTotals, type, Product, purchaseOrder) => {
    const { dealerDiscounts, products, customProducts, classes, MonsantoProduct, payments, customers } = this.props;
    const poId = this.props.match.params.id;
    const customerId = this.props.match.params.customer_id;

    const currentCust = (this.state.allCustomerData.length > 0 ? this.state.allCustomerData : customers).filter(
      (c) => c.id == customerId,
    );

    try {
      const purchaseOrder =
        currentCust.length > 0 ? currentCust[0].PurchaseOrders.find((p) => p.id == poId) : purchaseOrder;
      const totalProducts = []; //Merge the total of fiffernt compaines product based on earlyPay date
      Product &&
        Product.map((order, i) => {
          if (
            i == 0
              ? new Date() < new Date(order.checkDate)
              : new Date() < new Date(order.checkDate) && new Date() > new Date(Product[i - 1].checkDate)
          ) {
            totalProducts.push(order);
          } else {
            totalProducts.push({ ...order, total: 0 });
          }
        });

      const paymentCalculation = []; //Including a payment based on earlyapy date and increse subTotal based on earlyPay date
      totalProducts.length > 0 &&
        totalProducts
          .filter((s) => s.productType == type)
          .map((tb, i) => {
            let isPayment = [];

            isPayment = (
              payments.length > 0 ? payments : purchaseOrder !== undefined ? purchaseOrder.Payments : payments
            ).filter((p) => {
              return (
                purchaseOrder &&
                p.purchaseOrderId === purchaseOrder.id &&
                p.multiCompanyData.length > 0 &&
                (this.state.selectedShareholder == 'all'
                  ? true
                  : this.state.selectedShareholder.id == 'theCustomer'
                  ? p.shareholderId == 0
                  : p.shareholderId === this.state.selectedShareholder.id) &&
                tb.checkDate > p.paymentDate &&
                (i == 0 || totalProducts[i - 1].checkDate <= p.paymentDate)
              );
            });

            const isPaymentInPO = (
              payments.length > 0 ? payments : purchaseOrder !== undefined ? purchaseOrder.Payments : payments
            ).filter(
              (p) =>
                purchaseOrder &&
                p.purchaseOrderId === purchaseOrder.id &&
                (p.companyId == tb.companyId || p.companyId == 0) &&
                (p.companyType == tb.productType || p.companyType == null || p.companyType == ''),
            );

            let discountBatch = totalProducts[i + 1];
            let discountBatchPrev = totalProducts[i - 1];

            let totalpaymentAmount = 0;

            isPayment.length > 0 &&
              isPayment.map((p) => {
                const isMultiData =
                  p.multiCompanyData.length > 0 &&
                  p.multiCompanyData.find((c) => c.companyId == tb.companyId && c.companyName == tb.productType);

                return isMultiData !== undefined && isMultiData !== false
                  ? (totalpaymentAmount += parseFloat(isMultiData.amount || 0))
                  : (totalpaymentAmount += parseFloat(p.amount || 0));
              });
            const remainingPayment = parseFloat(tb.invoiceTotal) - parseFloat(totalpaymentAmount);
            const currentDisValue =
              tb.currentDisount !== undefined || tb.currentDisount !== 0 ? tb.currentDisount.discountValue : 0;

            const nextDisValue =
              0 || discountBatch !== undefined
                ? discountBatch.currentDisount !== undefined
                  ? discountBatch.currentDisount.discountValue
                  : 0
                : 0;

            const prevDisValue =
              0 || discountBatchPrev !== undefined
                ? discountBatchPrev.currentDisount !== undefined
                  ? discountBatchPrev.currentDisount.discountValue
                  : 0
                : 0;

            const newFormulaOfBalanceDue =
              (i == 0 ? 0 : paymentCalculation[i - 1].finalBalanceDue) *
              ((1 - parseFloat(currentDisValue == undefined ? 0 : currentDisValue) / 100) /
                (1 - parseFloat(prevDisValue) / 100));

            const finalBalanceDue = newFormulaOfBalanceDue + tb.orderGroupTotal - totalpaymentAmount;

            if (isPayment.length > 0) {
              paymentCalculation.push({
                paymentDate: isPayment[0].paymentDate,
                payment: isPayment,
                subTotal: tb.total,
                earlyPayDeadLinedate: tb.checkDate,
                paymentAmount: totalpaymentAmount,
                remainingPayment: remainingPayment,
                currentAppliedDiscount: tb.currentDisount !== undefined ? tb.currentDisount : 0,
                nextDisValue: nextDisValue,
                currentDisValue: currentDisValue,
                isPaymentInPO: isPaymentInPO,
                prevDisValue: prevDisValue,
                finalBalanceDue: finalBalanceDue,
                // applyValue:
                //   isPaymentInPO.length > 0
                //     ? remainingPayment *
                //         ((1 - parseFloat(nextDisValue || 0) / 100) / (1 - parseFloat(currentDisValue || 0) / 100)) || 0
                //     : 0,
                totalPayment: totalpaymentAmount,
                discountUnit: tb.currentDisount !== undefined ? tb.currentDisount.unit : 0,
                productType: tb.productType,
                CompanyName: tb.CompanyName,
                companyId: tb.companyId,
                invoiceTotal: tb.invoiceTotal,
                finalInvoiceAmount: tb.finalInvoiceAmount,
                orderGroupTotal: tb.orderGroupTotal,
              });
            } else {
              paymentCalculation.push({
                payment: isPayment,
                isPaymentInPO: isPaymentInPO,
                paymentDate: null,
                subTotal: tb.total,
                earlyPayDeadLinedate: tb.checkDate,
                paymentAmount: totalpaymentAmount,
                remainingPayment: remainingPayment,
                currentAppliedDiscount: tb.currentDisount !== undefined ? tb.currentDisount : 0,
                CompanyName: tb.CompanyName,
                finalBalanceDue: finalBalanceDue,

                prevDisValue: prevDisValue,
                nextDisValue: nextDisValue,
                currentDisValue: currentDisValue,
                // applyValue:
                //   isPaymentInPO.length > 0
                //     ? remainingPayment *
                //         ((1 - parseFloat(nextDisValue || 0) / 100) / (1 - parseFloat(currentDisValue || 0) / 100)) || 0
                //     : 0,
                totalPayment: totalpaymentAmount,
                discountUnit: tb.currentDisount !== undefined ? tb.currentDisount.unit : 0,
                productType: tb.productType,
                companyId: tb.companyId,
                invoiceTotal: tb.invoiceTotal,
                finalInvoiceAmount: tb.finalInvoiceAmount,
                orderGroupTotal: tb.orderGroupTotal,
              });
            }
          });

      const finalPaymentCalculation = paymentCalculation; //from that paymentCalculation add increse Value to subtotal of particular batch

      // paymentCalculation.length > 0 &&
      //   paymentCalculation.map((p, i) => {
      //     //p.subTotal
      //     const finalSubTotal = i == 0 ? 0 : parseFloat(paymentCalculation[i - 1].applyValue || 0);
      //     const newApplyValue =
      //       finalSubTotal *
      //         ((1 - parseFloat(p.nextDisValue || 0) / 100) / (1 - parseFloat(p.currentDisValue || 0) / 100)) -
      //       parseFloat(p.paymentAmount || 0);

      //     finalPaymentCalculation.push({
      //       subTotal: p.subTotal,
      //       CompanyName: p.CompanyName,
      //       invoiceTotal: p.invoiceTotal,

      //       subTotalDeadline: finalSubTotal,
      //       currentDisValue: p.currentDisValue,
      //       isPaymentInPO: p.isPaymentInPO,

      //       paymentOfDeadline: p.paymentAmount,
      //       remainingPayment: finalSubTotal - parseFloat(p.paymentAmount),
      //       increasePaymentValue: newApplyValue || 0,
      //       subTotal: p.subTotal,
      //       totalPayment: p.totalPayment ? p.totalPayment : 0,
      //       earlyPayDeadLinedate: p.earlyPayDeadLinedate,
      //       paymentDate: p.paymentDate ? p.paymentDate : null,
      //       discountUnit: p.discountUnit,
      //       payment: p.payment,
      //       productType: p.productType,
      //       companyId: p.companyId,
      //     });
      //   });

      // console.log(finalPaymentCalculation, 'finalPaymentCalculation');
      // //Update the last object with totalGrowerPaid value means after the early pay dates calculations
      // const lastValue = finalPaymentCalculation[finalPaymentCalculation.length - 1];
      // if (lastValue) {
      //   finalPaymentCalculation[finalPaymentCalculation.length - 1] = {
      //     lastSubTotalOfDeadline: lastValue.subTotal || 0,
      //     lastSubTotalOfDeadline: lastValue.subTotal || 0,
      //     invoiceTotal: lastValue.invoiceTotal || 0,

      //     totalAfterDeadLine:
      //       lastValue.subTotal +
      //       (finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //         ? finalPaymentCalculation[finalPaymentCalculation.length - 2].increasePaymentValue
      //         : 0),
      //     totalPayment: lastValue.totalPayment || 0,
      //     isPaymentInPO: lastValue.isPaymentInPO || 0,
      //     increasePaymentValue: finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //       ? finalPaymentCalculation[finalPaymentCalculation.length - 2].increasePaymentValue
      //       : 0,
      //     remainingPayment:
      //       lastValue.subTotal +
      //       (finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //         ? finalPaymentCalculation[finalPaymentCalculation.length - 2].increasePaymentValue
      //         : 0) -
      //       lastValue.totalPayment,
      //     totalGrowerPaid:
      //       lastValue.subTotal +
      //       (finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //         ? finalPaymentCalculation[finalPaymentCalculation.length - 2].increasePaymentValue
      //         : 0) -
      //       lastValue.totalPayment,
      //     earlyPayDeadLinedate:
      //       totalProducts.length > 0
      //         ? totalProducts[totalProducts.length - 1].checkDate
      //         : new Date('July 31, 2023').toISOString(),
      //     companyId: lastValue.companyId,
      //     CompanyName: lastValue.CompanyName,

      //     payment: finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //       ? finalPaymentCalculation[finalPaymentCalculation.length - 2].payment
      //       : lastValue.payment,

      //     discountValue: finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //       ? finalPaymentCalculation[finalPaymentCalculation.length - 2].discountValue
      //       : lastValue.discountValue,

      //     productType: finalPaymentCalculation[finalPaymentCalculation.length - 2]
      //       ? finalPaymentCalculation[finalPaymentCalculation.length - 2].productType
      //       : lastValue.productType,

      //     finalTotal: true,
      //   };
      // }

      return { finalPaymentCalculation };
    } catch (e) {
      console.log(e);
    }
  };
  getPaymentTotal = (poID) => {
    const { currentPurchaseOrder, payments, customer } = this.props;
    let totalPurchaseOrderAmount = 0,
      totalPaymentAmount = 0,
      purchaseOrderAmount = [];

    const purchaseOrders =
      customer && customer.PurchaseOrders.filter((_purchaseOrder) => _purchaseOrder && !_purchaseOrder.isQuote);

    const data = currentPurchaseOrder !== undefined ? [currentPurchaseOrder] : purchaseOrders || [];
    (poID !== undefined ? data.filter((s) => s.id == poID) : data).forEach((purchaseOrder) => {
      (payments.length > 0 ? payments : currentPurchaseOrder !== undefined ? purchaseOrder.Payments : payments)
        .filter((_payment) => _payment.purchaseOrderId === purchaseOrder.id)
        .forEach((payment) => {
          if (payment.method === 'Return') {
            totalPaymentAmount -= parseFloat(payment.amount);
          } else {
            totalPaymentAmount += parseFloat(payment.amount);
          }
        });
      const unique = purchaseOrder.CustomerProducts.sort((a, b) => a.productId - b.productId).concat(
        purchaseOrder.CustomerCustomProducts.sort((a, b) => a.customProductId - b.customProductId),
        purchaseOrder.CustomerMonsantoProducts,
      );
      const customerOrders = [...new Map(unique.map((item, key) => [item['id'], item])).values()];

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
          } = customerProductDiscountsTotals(order, discountsPOJO, product, null, null, null, purchaseOrder);
          totals.subTotal += customerProductDiscountsTotal;
          totals.quantity += order.orderQty;
          const total = preTotal - discountAmount;
          totalamount += total;
        });

      const perWholeOrderDiscounts = this.props.dealerDiscounts.filter(
        (discount) => discount.applyToWholeOrder === true,
      );
      const { orderDiscountsAmount: orderWholeDiscountsAmount } = perWholeOrderDiscount(
        totals.subTotal,
        totals.quantity,
        purchaseOrder,
        perWholeOrderDiscounts,
      );

      totalPurchaseOrderAmount += totalamount - orderWholeDiscountsAmount;

      purchaseOrderAmount.push({
        purchaseOrderId: purchaseOrder.id,
        orderAmount: totalamount - orderWholeDiscountsAmount,
      });
    });
    let amount = totalPurchaseOrderAmount - totalPaymentAmount;
    return { amount, purchaseOrderAmount };
  };

  getRemainPaymentData = (tableData, tableData1) => {
    const remainCompainespayment = [];
    [...tableData, ...tableData1].map((t) => {
      let data = t;
      const isShareHolderMatch = t.shareholderData.filter(
        (s) => s.shareholderId == this.state.selectedShareholder.id && s.percentage !== 0,
      );

      if (this.state.selectedShareholder !== 'all' && isShareHolderMatch.length == 0) {
        data = { ...data, total: 0, remainingPayment: 0 };
      } else if (isShareHolderMatch.length > 0 && isShareHolderMatch[0].percentage) {
        data = {
          ...data,
          total: (parseFloat(t.total || 0) * isShareHolderMatch[0].percentage) / 100,
          remainingPayment: (parseFloat(t.total) * isShareHolderMatch[0].percentage) / 100,
        };
      } else {
        data = {
          ...data,
          remainingPayment: t.total,
        };
      }

      let isEarlyPay = false;
      t.discountsPOJO.length > 0 &&
        t.discountsPOJO.map((d) => {
          if (d.discountStrategy == 'Early Pay Discount') {
            isEarlyPay = true;
          }
        });
      remainCompainespayment.push({ ...data, isEarlyPay: isEarlyPay });
    });
    let finalRemainCompainespayment = [];
    let helper0 = {};
    remainCompainespayment.reduce(function (r, o) {
      const CompanyName = o.Product.hasOwnProperty('ApiSeedCompany')
        ? 'Bayer'
        : o.Product.hasOwnProperty('SeedCompany')
        ? o.Product.SeedCompany.name
        : o.Product.Company.name;

      const key = o.companyId + '' + CompanyName + '' + o.isEarlyPay;

      if (!helper0[key]) {
        helper0[key] = Object.assign({}, o); // create a copy of o

        helper0[key].CompanyName = CompanyName;
        helper0[key].ids = [o.id];
        finalRemainCompainespayment.push(helper0[key]);
      } else {
        helper0[key].total = parseFloat(helper0[key].total) + parseFloat(o.total);
        helper0[key].ids = helper0[key].ids ? [...helper0[key].ids, o.id] : [o.id];
        helper0[key].remainingPayment = parseFloat(helper0[key].remainingPayment) + parseFloat(o.remainingPayment);
      }
      return r;
    }, {});

    const group = groupBy(finalRemainCompainespayment, (o) => {
      return o.CompanyName;
    });

    const gropedRemainData = [];
    Object.keys(group).map((g) => group[g].length == 1 && gropedRemainData.push(...group[g]));

    return gropedRemainData.filter((g) => g.isEarlyPay == false);
  };

  setPaymentTableData = async (allBalanceDueData, allCompanys, getRemainPaymentData) => {
    const { customer, payments, getCustomerShareholders, currentPurchaseOrder } = this.props;
    const customerId = this.props.match.params.customer_id;
    const poID = this.props.match.params.id;

    const shareholders = await getCustomerShareholders(customerId);
    const { amount: totalAmount, purchaseOrderAmount } = this.getPaymentTotal(poID);
    let paymentTableDatas = [];
    const data = currentPurchaseOrder !== undefined ? [currentPurchaseOrder] : customer && customer.PurchaseOrders;

    (poID !== undefined ? data.filter((s) => s.id == poID) : data)
      // .filter((_purchaseOrder) => !_purchaseOrder.isQuote)
      .forEach((purchaseOrder) => {
        const currentPayments = (
          payments.length > 0 ? payments : currentPurchaseOrder !== undefined ? purchaseOrder.Payments : payments
        ).filter((_payment) => _payment.purchaseOrderId === purchaseOrder.id);
        const total = purchaseOrderAmount.find((_amount) => _amount.purchaseOrderId === purchaseOrder.id);
        const allPayments = [];
        let balanceDue = total.orderAmount;
        currentPayments.forEach((payment) => {
          const {
            id,
            purchaseOrderId,
            paymentDate,
            amount,
            method,
            note,
            companyId,
            shareholderId,
            companyType,
            multiCompanyData,
          } = payment;
          allPayments.push({
            id,
            purchaseOrderId,
            amount,
            paymentDate: paymentDate,
            method: method,
            note,
            companyId,
            shareholderId,
            companyType,
            multiCompanyData: multiCompanyData == undefined ? [] : multiCompanyData,
          });

          balanceDue = parseFloat(balanceDue) - parseFloat(amount);
        });
        allPayments.sort((a, b) => a.paymentDate - b.paymentDate);

        paymentTableDatas.push({
          purchaseOrderId: purchaseOrder.id,
          purchaseOrderName: purchaseOrder.name,
          amount: total.orderAmount,
          allPayments,
          allBalanceDueData:
            allBalanceDueData.length > 0 &&
            allBalanceDueData.filter(
              (g) => !getRemainPaymentData.find((p) => p.CompanyName == g.CompanyName && g.companyId == p.companyId),
            ),
          getRemainPaymentData,
          allCompanys,
          balanceDue: parseFloat(balanceDue).toFixed(2),
        });
      });
    this.setState({ paymentTableDatas });
  };

  createPayment = async (data) => {
    const { createPayment } = this.props;
    const poID = this.props.match.params.id;

    try {
      await createPayment(poID, data);
      this.reload();
    } catch (err) {
      console.log(err);
      this.reload();
    }
  };

  updatePayment = async (data) => {
    const { updatePayment } = this.props;
    const poID = this.props.match.params.id;
    const { activeTablePaymentItem } = this.state;

    try {
      await updatePayment(poID, activeTablePaymentItem.id, data);
      this.handlePaymentDialogClose();
      this.refreshpayment();
    } catch (err) {
      console.log(err);
      this.refreshpayment();
    }
  };

  refreshpayment = async () => {
    await this.reload();
    const selectedTab = this.state.selectedTabIndex;

    const customerOrders =
      this.props.currentPurchaseOrder &&
      this.props.currentPurchaseOrder.CustomerProducts.sort((a, b) => a.productId - b.productId).concat(
        this.props.currentPurchaseOrder.CustomerCustomProducts.sort((a, b) => a.customProductId - b.customProductId),
        this.props.currentPurchaseOrder.CustomerMonsantoProducts,
      );
    let { tableData, tableHeaders, totalDiscount, totals } = this.getTableData(
      customerOrders,
      selectedTab,
      this.props.currentPurchaseOrder,
    );

    let { tableData1 } = this.getTableDataMonsanto(customerOrders, selectedTab, this.props.currentPurchaseOrder);

    const getRemainPaymentData = this.getRemainPaymentData(tableData1, tableData);

    tableData1 = sortBy(tableData1, (o) => o.Product && o.Product.productDetail);
    tableData = sortBy(tableData, (o) => (o.Product.SeedCompany ? o.Product.SeedCompany.name : o.Product.name));

    const { futureDiscountTotals, bayerProduct, regularProduct, seedProduct, groupBasedOnTable } =
      this.earlyPayTableData(this.props.currentPurchaseOrder);

    const { finalPaymentCalculation: bayerBalanceDue } = this.getEarPayTableData(
      futureDiscountTotals,
      'Bayer',
      bayerProduct,
    );
    const { finalPaymentCalculation: regularBalanceDue } = this.getEarPayTableData(
      futureDiscountTotals,
      'RegularCompany',
      regularProduct,
    );
    const { finalPaymentCalculation: seedBalanceDue } = this.getEarPayTableData(
      futureDiscountTotals,
      'SeedCompany',
      seedProduct,
    );

    const allPaidTableData = [...bayerProduct, ...regularProduct, ...seedProduct];
    const allBalanceDueData =
      bayerBalanceDue !== undefined ? [...bayerBalanceDue, ...regularBalanceDue, ...seedBalanceDue] : [];

    const allCompanys = [
      ...new Map([...allPaidTableData, ...getRemainPaymentData].map((item) => [item['companyId'], item])).values(),
    ];

    await this.setPaymentTableData(allBalanceDueData, allCompanys, getRemainPaymentData);
  };

  removePayment = (payment) => {
    const { deletePayment } = this.props;
    const { activeTablePaymentItem } = this.state;
    const poID = this.props.match.params.id;

    deletePayment(poID, activeTablePaymentItem);
  };

  handlePaymentDialogClose = () => {
    this.setState({
      paymentDialogOpen: null,
      tableItemActionMenuOpen: false,
      tablePaymentItemActionMenuOpen: false,
    });
    this.reload();
  };

  handleTablePaymentItemActionMenuOpen = (item, data) => (event) => {
    this.setPaymentTableData();
    this.setState({
      paymentDialogType: 2,
      tablePaymentItemActionMenuOpen: true,
      tablePaymentItemActionAnchorEl: event.target,
      activeTablePaymentItem: item,
      activeTablePaymentMultiData: data,
    });
  };

  handleTablePaymentItemActionMenuClose = () => {
    this.setState({
      tablePaymentItemActionMenuOpen: false,
      activeTablePaymentItem: null,
      activeTablePaymentMultiData: null,
    });
  };

  handlePaymentDeleteAlert = () => {
    const { classes, deletePayment } = this.props;
    const { activeTablePaymentItem, activeTablePaymentMultiData } = this.state;
    this.setState({
      paymentRemoveAlert: (
        <SweetAlert
          showCancel
          title={'Remove Payment for Invoice#' + activeTablePaymentItem.purchaseOrderId}
          onConfirm={async () => {
            if (activeTablePaymentItem.multiCompanyData.length > 0) {
              const data = activeTablePaymentItem.multiCompanyData.filter(
                (d) => d.companyId != activeTablePaymentMultiData.companyId,
              );

              const update = activeTablePaymentItem;
              update['multiCompanyData'] = data;

              await this.props
                .updatePayment(activeTablePaymentItem.purchaseOrderId, activeTablePaymentItem.id, update)
                .then(() => {
                  this.setState({ paymentRemoveAlert: null }, async () => {
                    if (activeTablePaymentItem.multiCompanyData.length == 0) {
                      await deletePayment(activeTablePaymentItem.purchaseOrderId, activeTablePaymentItem);
                      this.setState({ paymentRemoveAlert: null }, () => {
                        this.handleTablePaymentItemActionMenuClose();
                        this.reload();
                      });
                    }

                    this.handleTablePaymentItemActionMenuClose();
                    this.reload();
                  });
                });
            } else {
              await deletePayment(activeTablePaymentItem.purchaseOrderId, activeTablePaymentItem);
              this.setState({ paymentRemoveAlert: null }, () => {
                this.handleTablePaymentItemActionMenuClose();
                this.reload();
              });
            }
          }}
          onCancel={() => this.setState({ paymentRemoveAlert: null })}
          confirmBtnText="Remove"
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnText="Cancel"
          cancelBtnCssClass={classes.button + ' ' + classes.white + ' ' + classes.primary}
        >
          You are going to remove Invoice #{activeTablePaymentItem.purchaseOrderId} with {activeTablePaymentItem.method}
          : {activeTablePaymentItem.amount}
        </SweetAlert>
      ),
    });
  };

  handlePreviousChange = (name, value, payment) => {
    const data = this.state.addPreviousData;

    const index = data.findIndex((n) => n.id == payment.id);

    data[index][name] = value;

    this.setState({ addPreviousData: data });
  };
  render() {
    const {
      tablePaymentItemActionMenuOpen,
      tablePaymentItemActionAnchorEl,
      activeTablePaymentItem,
      subjectName,
      showProductForm,
      showDeliveryForm,
      showDeliverReceiptDialog,
      selectedReceipt,
      showConvertDialog,
      editingProduct,
      showFarmForm,
      showAddExistingFarm,
      deletePurchaseOrderConfirm,
      moreFuncMenuOpen,
      tableItemActionAnchorEl,
      tableItemActionMenuOpen,
      deleteProductConfirm,
      switchDialogOpen,
      isChangingName,
      name,
      convertToAdvancedDialogOpen,
      archivePurchaseOrderConfirm,
      openMSRPEditDialog,
      showSnackbar,
      showSnackbarText,
      isSyncingMonsantoProducts,
      isMonsantoProductReduceQuantity,
      monsantoProductReduceTransferInfo,
      selectedTabIndex,
      showAddNoteDialog,
      reminderDate,
      purchaseOrderNote,
      showAddTreatmentDialog,
      showAddCustomEarlyPayDialog,
      addingRelatedCustomProductProduct,
      isProductOrderBooking,
      wantToTransferAll,
      wantToTransferPo,
      transferingProducts,
      showEditProductSuccessSnackbar,
      messageForSnackBar,
      showPerWholeOrderDiscounts,
      showViewPaymentDialog,
      editType,
      isLoading,
      showDelivery,
      activeTableItem,
      setOfRow,
      paymentTableDatas,
      paymentDialogOpen,
      paymentRemoveAlert,
      showOrderDate,
      allCustomerData,
    } = this.state;
    const {
      currentPurchaseOrder,
      classes,
      companies,
      seedCompanies,
      apiSeedCompanies,
      products,
      dealerDiscounts,
      business,
      discountPackages,
      deliveryReceipts,
      editRelatedProduct,
      linkDeliveryReceipt,
      packagings,
      seedSizes,
      updatePurchaseOrder,
      convertQuoteToExistingPurchaseOrder,
      listProducts,
      productPackagings,
      noFound,
      customers,
      customerReturnProducts,
      shareholders,
      payments,
    } = this.props;
    const customerId = this.props.match.params.customer_id;
    const poId = this.props.match.params.id;
    const currentCust = allCustomerData.filter((c) => c.id == customerId);

    const currentPo = currentCust.length > 0 && currentCust[0].PurchaseOrders.find((p) => p.id == poId);

    const purchaseOrder = currentPurchaseOrder !== undefined ? currentPurchaseOrder : currentPo;

    if (this.isLoading || purchaseOrder == undefined || purchaseOrder == false || allCustomerData.length == 0) {
      return <CircularProgress />;
    }

    if (noFound) {
      return <h1 id="PO_product">No order found</h1>;
    }

    const customer = currentPurchaseOrder !== undefined ? currentPurchaseOrder.Customer : currentCust[0];
    //const customerId = match.params.customerId

    const customerOrders =
      purchaseOrder &&
      purchaseOrder.CustomerProducts.sort((a, b) => a.productId - b.productId).concat(
        purchaseOrder.CustomerCustomProducts.sort((a, b) => a.customProductId - b.customProductId),
        purchaseOrder.CustomerMonsantoProducts,
      );
    // const customerpurchaseOrders = customer.purchaseOrders;

    const perWholeOrderDiscounts = dealerDiscounts.filter((discount) => discount.applyToWholeOrder === true);

    const selectedDiscounts =
      (purchaseOrder && purchaseOrder.dealerDiscounts !== undefined && purchaseOrder.dealerDiscounts) || [];

    const unselectedDiscounts =
      perWholeOrderDiscounts &&
      purchaseOrder &&
      perWholeOrderDiscounts.filter(
        (discount) =>
          !((purchaseOrder.dealerDiscounts !== undefined && purchaseOrder.dealerDiscounts) || []).some(
            (Ddiscount) => discount.id === Ddiscount.DiscountId,
          ),
      );
    const isShowPickLater = purchaseOrder.CustomerMonsantoProducts
      ? purchaseOrder.CustomerMonsantoProducts.filter((f) => f.isPickLater && f.isPickLater == true)
      : [];

    let tabs =
      purchaseOrder && purchaseOrder.isSimple
        ? [{ tabName: 'Products', tabIndex: 'products' }]
        : !purchaseOrder.isQuote && isShowPickLater.length > 0
        ? [
            { tabName: 'Farms', tabIndex: 'farms' },
            { tabName: 'Pick Later Product', tabIndex: 'picklaterProduct' },
          ]
        : [{ tabName: 'Farms', tabIndex: 'farms' }];

    tabs =
      purchaseOrder && purchaseOrder.isQuote
        ? tabs.concat([
            // { tabName: "Package & Seed Size", tabIndex: "packaging" },
            // { tabName: 'Invoice', tabIndex: 'invoice' },
            { tabName: 'Payments', tabIndex: 'payments' },

            { tabName: 'Invoice Preview', tabIndex: 'preview' },
          ])
        : customer && customer.name == 'Bayer Dealer Bucket'
        ? tabs.concat([
            // { tabName: "Package & Seed Size", tabIndex: "packaging" },
            // { tabName: 'Invoice', tabIndex: 'invoice' },
            // !isSimple && { tabName: 'Simple Products View', tabIndex: 'simpleView' },
            { tabName: 'Invoice Preview', tabIndex: 'preview' },
            // { tabName: 'Grower Delivery', tabIndex: 'delivery' },
            // { tabName: 'Return', tabIndex: 'returnDelivery' },
            // { tabName: 'Return Products', tabIndex: 'returnProducts' },
          ])
        : tabs.concat([
            // { tabName: "Package & Seed Size", tabIndex: "packaging" },
            // { tabName: 'Invoice', tabIndex: 'invoice' },
            // !isSimple && { tabName: 'Simple Products View', tabIndex: 'simpleView' },
            { tabName: 'Payments', tabIndex: 'payments' },

            { tabName: 'Invoice Preview', tabIndex: 'preview' },
            { tabName: 'Grower Delivery', tabIndex: 'delivery' },
            { tabName: 'Return', tabIndex: 'returnDelivery' },
            // { tabName: 'Payments2', tabIndex: 'payments2' },
            // { tabName: 'Return Products', tabIndex: 'returnProducts' },
          ]);

    const selectedTab = tabs[selectedTabIndex].tabIndex;
    let tablink = '';
    if (customer && customer.name == 'Bayer Dealer Bucket') {
      tablink = '/app/dealers';
    } else {
      tablink = '/app/customers';
    }

    let { tableData, tableHeaders, totalDiscount, totals } = this.getTableData(
      customerOrders,
      selectedTab,
      purchaseOrder,
    );

    // let nonBayerTableData = tableData.filter((s) => s.qty < 0);
    // tableData = tableData.filter((s) => s.qty > 0);
    let {
      tableData1,
      tableHeaders1,
      totalDiscount1,
      totals: totals1,
    } = this.getTableDataMonsanto(customerOrders, selectedTab, purchaseOrder);

    // let { tableDataReturn, nonBayerReturnData, totalDiscountReturn, totalsReturn, totalPreTotalreturn } =
    //   this.getReturnTableData(purchaseOrder);
    const pickLaterData = this.getPickLaterData(tableData1);

    const getRemainPaymentData = this.getRemainPaymentData(tableData1, tableData);

    const {
      orderTotal: orderWholeTotal,
      orderDiscountsAmount: orderWholeDiscountsAmount,
      discountDetails: orderWholeDiscountDetails,
    } = perWholeOrderDiscount(
      totals.subTotal + totals1.subTotal,
      totals.quantity + totals1.quantity,
      purchaseOrder,
      perWholeOrderDiscounts,
    );

    const orderDiscountsAmount = totalDiscount + totalDiscount1 + orderWholeDiscountsAmount;
    const orderTotal = purchaseOrder.purchaseOrderTotalPayment;
    const vertical = 'top';
    const horizontal = 'right';
    tableData1 = sortBy(tableData1, (o) => o.Product && o.Product.productDetail);
    tableData = sortBy(tableData, (o) => (o.Product.SeedCompany ? o.Product.SeedCompany.name : o.Product.name));
    // tableDataReturn = sortBy(tableDataReturn, (o) => o.Product && o.Product.productDetail);

    const currentCornZoneId =
      customer.zoneIds !== null &&
      !Array.isArray(customer.zoneIds) &&
      JSON.parse(customer.zoneIds).length > 1 &&
      JSON.parse(customer.zoneIds).find((c) => c.classification == 'CORN' || c.classification == 'C').zoneId;

    let assignValue = 0;
    let totalBayerValue = 0;
    activeTableItem &&
      tableData1
        .filter(
          (t) =>
            t.pickLaterQty == '0' &&
            t.order.pickLaterProductId !== null &&
            t.order.pickLaterProductId == activeTableItem.order.id,
        )
        .map((d) => {
          assignValue += parseFloat(d.order.orderQty);
          totalBayerValue += parseFloat(d.order.monsantoOrderQty || 0);
        });

    const { futureDiscountTotals, bayerProduct, regularProduct, seedProduct, groupBasedOnTable } =
      this.earlyPayTableData(purchaseOrder, getRemainPaymentData);
    const { finalPaymentCalculation: bayerBalanceDue } = this.getEarPayTableData(
      futureDiscountTotals,
      'Bayer',
      bayerProduct,
      purchaseOrder,
    );
    const { finalPaymentCalculation: regularBalanceDue } = this.getEarPayTableData(
      futureDiscountTotals,
      'RegularCompany',
      regularProduct,
      purchaseOrder,
    );
    const { finalPaymentCalculation: seedBalanceDue } = this.getEarPayTableData(
      futureDiscountTotals,
      'SeedCompany',
      seedProduct,
      purchaseOrder,
    );
    const allPaidTableData = [...bayerProduct, ...regularProduct, ...seedProduct].filter(
      (g) => !getRemainPaymentData.find((p) => p.CompanyName == g.CompanyName && g.companyId == p.companyId),
    );

    const finalRemaingData =
      getRemainPaymentData.length > 0 &&
      getRemainPaymentData.filter(
        (g) => !allPaidTableData.find((p) => p.CompanyName == g.CompanyName && g.companyId == p.companyId),
      );
    const allBalanceDueData =
      bayerBalanceDue !== undefined ? [...bayerBalanceDue, ...regularBalanceDue, ...seedBalanceDue] : [];

    const allCompanys = [
      ...new Map(
        [...allPaidTableData, ...finalRemaingData].map((item) => [item['companyId'] && item['CompanyName'], item]),
      ).values(),
    ];

    // console.log(allBalanceDueData, 'allBalanceDueData');
    const allProduct = (purchaseOrder.CustomerCustomProducts ||
      purchaseOrder.CustomerMonsantoProducts ||
      purchaseOrder.CustomerProducts) && [
      ...purchaseOrder.CustomerCustomProducts,
      ...purchaseOrder.CustomerMonsantoProducts,
      ...purchaseOrder.CustomerProducts,
    ];

    const compines = [];
    allProduct &&
      allProduct.length > 0 &&
      allProduct.map((a) => {
        const companyType = a.hasOwnProperty('monsantoProductId')
          ? 'Bayer'
          : a.hasOwnProperty('productId')
          ? `SeedCompany`
          : `RegularCompany`;
        const productName = a.hasOwnProperty('monsantoProductId')
          ? 'Bayer'
          : a.hasOwnProperty('productId')
          ? a.Product.SeedCompany.name
          : a.CustomProduct.Company.name;

        const companyId = a.hasOwnProperty('monsantoProductId')
          ? a.MonsantoProduct.ApiSeedCompany.id
          : a.hasOwnProperty('productId')
          ? a.Product.SeedCompany.id
          : a.CustomProduct.Company.id;
        a.discounts.length > 0
          ? a.discounts.map((d) => {
              const discount = dealerDiscounts !== undefined && dealerDiscounts.find((dd) => dd.id == d.DiscountId);

              if (discount && discount.discountStrategy == 'Early Pay Discount') {
                compines.push({
                  isEarlyPayDiscount: true,

                  companyType: companyType,
                  productName: productName,

                  companyId: companyId,
                });
              } else {
                compines.push({
                  isEarlyPayDiscount: false,

                  companyType: companyType,
                  productName: productName,
                  companyId: companyId,
                });
              }
            })
          : compines.push({
              isEarlyPayDiscount: false,
              product: a,
              companyType: companyType,
              productName: productName,
              companyId: companyId,
            });
      });

    let compainesMenuList = [];
    compines &&
      compines.reduce(function (res, value) {
        const pID = value.productName;
        if (!res[pID]) {
          res[pID] = {
            companyType: value.companyType,
            productName: value.productName,
            companyId: value.companyId,
          };
          compainesMenuList.push(res[pID]);
        }

        res[pID].List =
          res[pID].List !== undefined ? res[pID].List.concat(value.isEarlyPayDiscount) : [value.isEarlyPayDiscount];
        return res;
      }, {});

    let totalBalanceDue = 0;
    let totalBalancePayment = 0;

    [
      ...new Map(
        [...allBalanceDueData, ...finalRemaingData].map((item) => [item['companyId'] && item['CompanyName'], item]),
      ).values(),
    ].map(
      (p) =>
        (totalBalanceDue += p.hasOwnProperty('total')
          ? parseFloat(p.total) - p.totalPayment
          : parseFloat(p.finalBalanceDue)),
    );

    [...allBalanceDueData, ...finalRemaingData].map((p) => (totalBalancePayment += p.totalPayment));

    let sumOfOrderDisount = 0;
    selectedDiscounts &&
      selectedDiscounts.map((discount) => {
        const selecteddiscount = dealerDiscounts.find((dd) => dd.id === discount.DiscountId);

        sumOfOrderDisount += parseFloat(orderWholeDiscountDetails[selecteddiscount.id]);
      });
    return (
      <div>
        {showEditProductSuccessSnackbar && (
          <Snackbar
            open={showEditProductSuccessSnackbar}
            autoHideDuration={null}
            onClose={() => this.setState({ showEditProductSuccessSnackbar: false })}
            anchorOrigin={{ vertical, horizontal }}
            message={messageForSnackBar}
            key={vertical + horizontal}
            onClick={() => this.setState({ showEditProductSuccessSnackbar: false })}
          ></Snackbar>
        )}
        <div>
          {/* <Link
            className={`${classes.backToCustomerLink} hide-print`}
            key={purchaseOrder.id}
            to={`/app/customers`}
          >
            Back to Customers
          </Link> */}

          {customer && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="hide-print" style={{ display: 'flex' }}>
                {customer.name}'s {subjectName}{' '}
                <h4 className={classes.poSelector} style={{ marginLeft: '10px' }}>
                  {`${subjectName === 'Purchase Order' ? 'PO' : 'QT'}#${purchaseOrder.id}${
                    purchaseOrder.name ? '-' + purchaseOrder.name : ''
                  } `}
                </h4>
              </span>
              <span className={`${classes.createdAt} hide-print`}>
                Created on {moment.utc(purchaseOrder.createdAt).format('MMM D, YYYY')}
              </span>
            </div>
          )}
        </div>
        {/*<div className={`${classes.purchaseOrderInput} hide-print`}>*/}

        <div className={classes.poFlexClass}>
          <div style={{ width: '60%', height: '110px' }}>
            <Tabs headerColor="gray" selectedTab={selectedTabIndex || 0} onTabChange={this.onTabChange} tabs={tabs} />
          </div>
          <div style={{ display: 'flex' }}>
            <div className={classes.newButtonBar}>
              <div>
                {/* <Select
            value={purchaseOrder.id}
            onChange={e => this.gotoPurchaseOrder(e.target.value)}
            className={classes.poSelector}
          >
            {customerPurchaseOrders.map(po => {
              return (
                <MenuItem value={po.id} key={po.id}>
                  <h4 className={classes.poSelector}>
                    {`${subjectName === "Purchase Order" ? "PO" : "QT"}#${
                      po.id
                    }-${po.name} `}
                  </h4>
                </MenuItem>
              );
            })}
          </Select> */}
              </div>

              {/* {subjectName === "Purchase Order" && (
          <React.Fragment>
            <div className={classes.progressItem}>
              <div className={classes.progressHead}>
                <b className={classes.progressTitle}>
                  IN#{purchaseOrder.id}{" "}
                </b>
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
        )} */}
            </div>
            {purchaseOrder.isSimple && selectedTabIndex !== 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="showDeliveries"
                        color="primary"
                        checked={showDelivery}
                        value={showDelivery}
                        onChange={this.showDeliveryRow}
                      />
                    }
                    label="Show Deliveries"
                  />
                </FormControl>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="showOrderDate"
                        color="primary"
                        checked={showOrderDate}
                        value={showOrderDate}
                        onChange={() => this.setState({ showOrderDate: !this.state.showOrderDate })}
                      />
                    }
                    label="Show OrderDate"
                  />
                </FormControl>
                <Button
                  id="addProduct"
                  style={{ height: '45px' }}
                  onClick={() => {
                    this.setState({
                      showProductForm: true,
                    });
                  }}
                >
                  Add Product
                </Button>
              </div>
            )}

            {!purchaseOrder.isSimple && selectedTabIndex !== 1 && selectedTabIndex !== 2 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="showDeliveries"
                        color="primary"
                        checked={showDelivery}
                        value={showDelivery}
                        onChange={this.showDeliveryRow}
                      />
                    }
                    label="Show Deliveries"
                  />
                </FormControl>
                <FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="showOrderDate"
                        color="primary"
                        checked={showOrderDate}
                        value={showOrderDate}
                        onChange={() => this.setState({ showOrderDate: !this.state.showOrderDate })}
                      />
                    }
                    label="Show OrderDate"
                  />
                </FormControl>
                <Button
                  id="addFarm"
                  color="info"
                  className={classes.button}
                  // className={classes.button + ' ' + classes.white + ' ' + classes.primary}
                  onClick={() => this.setState({ showFarmForm: true })}
                >
                  Add Farm
                </Button>
              </div>
            )}

            {selectedTabIndex !== 1 && selectedTabIndex !== 2 && (
              <Button
                id="addproductDots"
                className={`${classes.iconButton} hide-print`}
                variant="contained"
                color="primary"
                buttonRef={(node) => {
                  this.moreFuncMenuAnchorEl = node;
                }}
                onClick={this.handleMoreFuncMenuToggle}
              >
                <MoreHorizontalIcon />
              </Button>
            )}

            {selectedTab === 'payments' && (
              <div
                id="paymentTab"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {!purchaseOrder.isQuote && (
                  <Button
                    id="addPayment2"
                    className={`${classes.addNewMenuItem} hide-print`}
                    style={{ marginRight: '20px' }}
                    onClick={async () => {
                      await this.setPaymentTableData(allBalanceDueData, allCompanys, getRemainPaymentData);
                      this.setState({ paymentDialogOpen: true, activeTablePaymentItem: null, paymentDialogType: 2 });
                    }}
                  >
                    Manage Payment
                  </Button>
                )}
                <Button className={`${classes.printButton} hide-print`} onClick={this.print} color="info" id="pdfClick">
                  <Print />
                </Button>
              </div>
            )}
          </div>
        </div>
        <Popover
          open={moreFuncMenuOpen}
          anchorEl={this.moreFuncMenuAnchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          onClose={this.handleMoreFuncMenuClose}
          className="hide-print"
        >
          <Paper>
            <MenuList>
              {/* <MenuItem
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
              this.handleMoreFuncMenuClose();
              setTimeout(() => {
                this.print();
              }, 500);
            }}
          >
            Print
          </MenuItem>
          <MenuItem
            className={classes.moreFuncMenuItem}
            onClick={() => {
              if (purchaseOrder.isSimple === true) {
                this.openSwitchDialog();
              }
            }}
            disabled={purchaseOrder.isSimple === false}
          >
            SwitchView
          </MenuItem> */}
              {subjectName === 'Purchase Order' ? (
                ''
              ) : (
                // <MenuItem
                //   className={`${classes.moreFuncMenuItem} hide-print`}
                //   component={Link}
                //   to={`${tablink}/${customer.id}/invoice/${purchaseOrder.id}`}
                // >
                //   Invoice
                // </MenuItem>
                <React.Fragment>
                  {customerOrders.length > 0 && (
                    <MenuItem
                      id="convertToPO"
                      className={`${classes.moreFuncMenuItem} hide-print`}
                      onClick={() => {
                        this.handleMoreFuncMenuClose();
                        this.openConvert();
                      }}
                    >
                      Convert Quote to Purchase Order
                    </MenuItem>
                  )}
                </React.Fragment>
              )}
              {/* {subjectName === 'Purchase Order' && (
            <MenuItem
              className={`${classes.moreFuncMenuItem} hide-print`}
              component={Link}
              to={`${tablink}/${customer.id}/purchase_order/${purchaseOrder.id}/deliveries`}
              ///app/customers/:customer_id/purchase_order/:id/deliveries
            >
              Delivery
            </MenuItem>
          )} */}
              {/* <MenuItem
            className={`${classes.moreFuncMenuItem} hide-print`}
            onClick={() => {
              this.handleMoreFuncMenuClose();
              this.handleAddNoteDialogShow();
            }}
          >
            Add Purchase Order Note
          </MenuItem> */}
              {subjectName === 'Quote' && (
                <MenuItem
                  className={`${classes.moreFuncMenuItem} hide-print`}
                  component={Link}
                  to={`${tablink}/${customer.id}/invoice/${purchaseOrder.id}`}
                >
                  Printable View
                </MenuItem>
              )}
              {purchaseOrder.isSimple && (
                <MenuItem
                  id="convertToadvance"
                  className={`${classes.moreFuncMenuItem} hide-print`}
                  onClick={() => {
                    this.handleMoreFuncMenuClose();
                    this.handleConvertToAdvancedDialogOpen();
                  }}
                >
                  Convert to advanced view
                </MenuItem>
              )}
              {/*  <MenuItem
            id="payments"
            className={`${classes.moreFuncMenuItem} hide-print`}
            onClick={() => {
              this.handleViewPaymentsDialogOpen(this.props.customers.find((c) => c.id == customer.id));
            }}
          >
            Payments
          </MenuItem>*/}
              <MenuItem
                id="addWholeDiscount"
                className={`${classes.moreFuncMenuItem} hide-print`}
                onClick={() => {
                  this.setState({ showPerWholeOrderDiscounts: true });
                  this.handleMoreFuncMenuClose();
                }}
              >
                Whole Order Discounts
              </MenuItem>

              <MenuItem
                className={classes.moreFuncMenuItem}
                id="editAllProduct"
                onClick={() =>
                  this.props.history.push(
                    `/app/${this.props.match.params.customer_id}/purchaseOrder/editAllProducts/${purchaseOrder.id}`,
                  )
                }
              >
                Edit Discount/Order Date for all Products
              </MenuItem>

              <MenuItem
                id="markAsReplant"
                className={`${classes.moreFuncMenuItem} hide-print`}
                onClick={async () => {
                  const { updatePurchaseOrder } = this.props;
                  const replantData = !purchaseOrder.isReplant;
                  const customerId = this.props.match.params.customer_id;
                  await updatePurchaseOrder(customerId, purchaseOrder.id, { isReplant: replantData });
                  this.reload();
                }}
              >
                {purchaseOrder && purchaseOrder.isReplant !== true
                  ? `Mark ${subjectName} as Replant`
                  : `UnMark ${subjectName} as Replant`}
              </MenuItem>
              {purchaseOrder.name !== "Dealer's Bucket Default PO" ? (
                <MenuItem
                  className={`${classes.moreFuncMenuItem} hide-print`}
                  id="changePoName"
                  onClick={() => {
                    this.handleMoreFuncMenuClose();
                    this.handleChangeNameOpen();
                  }}
                >
                  Change Name of {subjectName}
                </MenuItem>
              ) : (
                ''
              )}

              {/* <MenuItem
            className={`${classes.moreFuncMenuItem} hide-print`}
            onClick={() => {
              this.handleMoreFuncMenuClose();
              this.archivePurchaseOrder();
            }}
          >
            Archive
          </MenuItem> */}
              {purchaseOrder.name !== "Dealer's Bucket Default PO" ? (
                <MenuItem
                  className={`${classes.moreFuncMenuItem} hide-print`}
                  id="deletePO"
                  onClick={() => {
                    this.handleMoreFuncMenuClose();
                    this.removePurchaseOrder();
                  }}
                >
                  Delete
                </MenuItem>
              ) : (
                ''
              )}
              {/* <MenuItem
            className={`${classes.moreFuncMenuItem} hide-print`}
            onClick={() => {
              this.handleMoreFuncMenuClose();
              this.handleAddCustomEarlyDialogOpen();
            }}
          >
            Add Custom Early Pay
          </MenuItem> */}
            </MenuList>
          </Paper>
        </Popover>

        {purchaseOrder.isSimple === true && selectedTabIndex == 0 && (
          <React.Fragment>
            {/*  <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2 id="PO_product">Products</h2>
              {isProductOrderBooking && <CircularProgress />}
              <div>
                {/* <Button
                  onClick={() => {
                    this.makeProductBooking();
                  }}
                >
                  Make bayer order 
                </Button> 
              </div>
              </div>*/}

            {tableData1.length > 0 && (
              <Paper className={classes.farmPaper} id="PO_product">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {!purchaseOrder.isQuote && purchaseOrder.CustomerMonsantoProducts.length > 0 && (
                    <React.Fragment>
                      <div>
                        <Button
                          id="syncwithbayer"
                          onClick={this.syncMonsantoOrders}
                          disabled={
                            isSyncingMonsantoProducts ||
                            (!customer.monsantoTechnologyId && !customer.glnId) ||
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
                      </div>
                    </React.Fragment>
                  )}
                  {/* 
                  <Button
                    onClick={() => {
                      this.setState({ groupBySimple: !this.state.groupBySimple }),
                        this.groupDataByproduct(tableData1).map((item) => {
                          item.qty - Math.floor(item.qty) !== 0
                            ? this.setShowSnackbar(
                                "These following product rows have fractional quantities where they don't add up to a whole number",
                              )
                            : null;
                        });
                      this.groupDataByproduct(tableData).map((item) => {
                        item.qty - Math.floor(item.qty) !== 0
                          ? this.setShowSnackbar(
                              "These following product rows have fractional quantities where they don't add up to a whole number",
                            )
                          : null;
                      });
                    }}
                  >
                    Check Fractional Quantities
                  </Button> */}
                </div>
                <ReactTable
                  data={
                    this.state.groupBySimple
                      ? this.groupDataByproduct(tableData1)
                      : tableData1.sort((a, b) =>
                          a.Product.blend
                            ? a.Product.blend.localeCompare(b.Product.blend) ||
                              (a.Product.treatment && a.Product.treatment.localeCompare(b.Product.treatment))
                            : a.Product.productDetail.localeCompare(b.Product.productDetail),
                        )
                  }
                  columns={tableHeaders1}
                  minRows={1}
                  resizable={false}
                  showPagination={false}
                  pageSize={tableData1.length || 0}
                  getTrProps={this.getTableRowProps}
                />

                {/* <span>
                <sup>*</sup> The prices for these additional products are in a
                separate table
              </span> */}
              </Paper>
            )}

            {/* {selectedTab === 'returnProducts' &&
            (tableDataReturn.length > 0 || this.props.match.url.split('/')[2] === 'dealers') ? (
              <Paper className={classes.farmPaper}>
                <React.Fragment></React.Fragment>
                <ReactTable
                  data={this.state.groupBySimple ? this.groupDataByproduct(tableDataReturn) : tableDataReturn}
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

            {this.props.match.url.split('/')[2] !== 'dealers' ? (
              <div>
                <Paper className={classes.farmPaper}>
                  <ReactTable
                    data={this.state.groupBySimple ? this.groupDataByproduct(tableData) : tableData}
                    columns={tableHeaders}
                    minRows={1}
                    resizable={false}
                    showPagination={false}
                    pageSize={tableData.length || 0}
                    getTrProps={this.getTableRowProps}
                  />
                </Paper>

                {/* {selectedTab === 'returnProducts' && (
                  <Paper className={classes.farmPaper}>
                    <ReactTable
                      data={this.state.groupBySimple ? this.groupDataByproduct(nonBayerReturnData) : nonBayerReturnData}
                      columns={tableHeaders}
                      minRows={1}
                      resizable={false}
                      showPagination={false}
                      pageSize={nonBayerReturnData.length || 0}
                      getTrProps={this.getTableRowProps}
                    />
                  </Paper>
                )} */}
              </div>
            ) : (
              ''
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
                      this.openProductFormEdit(this.state.activeTableItem.order, 'edit');
                      this.handleTableItemActionMenuClose();
                      this.setState({ editType: 'edit' });
                    }}
                  >
                    Edit Qty/Discount/Product
                  </MenuItem>

                  <MenuItem
                    id="editMsrp"
                    className={classes.addNewMenuItem}
                    onClick={() => {
                      this.openMSRPEdit(this.state.activeTableItem.order);
                      this.handleTableItemActionMenuClose();
                    }}
                  >
                    Edit MSRP
                  </MenuItem>
                  <MenuItem
                    className={classes.addNewMenuItem}
                    onClick={async () => {
                      await this.editReplatProduct(this.state.activeTableItem.order);
                      this.handleTableItemActionMenuClose();
                    }}
                    id="productReplant"
                  >
                    {this.state.activeTableItem && this.state.activeTableItem.order.isReplant !== true
                      ? 'Mark as Replant'
                      : 'UnMark as Replant'}
                  </MenuItem>
                  {this.state.activeTableItem && this.state.activeTableItem.Product.hasOwnProperty('SeedCompany') && (
                    <MenuItem
                      className={classes.addNewMenuItem}
                      onClick={() => {
                        this.handleAddTreatementDialogOpen(this.state.activeTableItem.order);
                        this.handleTableItemActionMenuClose();
                      }}
                    >
                      Add Treatment
                    </MenuItem>
                  )}
                  {/* <MenuItem
                    className={classes.addNewMenuItem}
                    onClick={() => {
                      this.duplicateProducts(this.state.activeTableItem && this.state.activeTableItem.order);
                      this.handleTableItemActionMenuClose();
                    }}
                  >
                    Duplicate
                  </MenuItem> */}
                  <MenuItem
                    id="deleteProduct"
                    className={classes.addNewMenuItem}
                    onClick={() => {
                      this.removeRelatedProduct(this.state.activeTableItem);
                      this.handleTableItemActionMenuClose();
                    }}
                  >
                    Delete
                  </MenuItem>
                </MenuList>
              </Paper>
            </Popover>
            <Paper>
              {(showPerWholeOrderDiscounts || selectedDiscounts.length > 0) && perWholeOrderDiscounts.length > 0 && (
                <div>
                  <Grid container direction="column" spacing={16}>
                    <h4 style={{ margin: '15px 0px 15px 15px' }}>Whole Order Discounts</h4>
                    <Sortable
                      options={{ handle: `.${classes.discountRowHandle}` }}
                      onChange={(order, sortable, e) => this.onDiscountsReorder(order, sortable, e)}
                    >
                      {selectedDiscounts &&
                        selectedDiscounts.map((discount) => {
                          const selecteddiscount = dealerDiscounts.find((dd) => dd.id === discount.DiscountId);

                          if (selecteddiscount !== undefined) {
                            return (
                              <div
                                style={{ marginBottom: '10px' }}
                                className={classes.farmHeader}
                                key={discount.DiscountId}
                                data-id={discount.DiscountId}
                              >
                                <CheckBox
                                  checked={true}
                                  onChange={() => this.removeDiscount(discount)}
                                  id="wholeDiscount"
                                />

                                <span className={classes.discountLabel}>
                                  {selecteddiscount && selecteddiscount.name}
                                </span>

                                {selecteddiscount.discountStrategy === 'Flat Amount Discount' && (
                                  <span>
                                    <TextField
                                      className={classes.valueInput}
                                      label={'Value'}
                                      defaultValue={discount.discountValue}
                                      style={{ width: 80 }}
                                      onBlur={(e) => this.onValueChange(e, discount, false)}
                                    />
                                    <Select
                                      id="discountChoose"
                                      select
                                      style={{ marginLeft: '10px', marginTop: '15px' }}
                                      value={discount.unit}
                                      onChange={(e) => this.onValueChange(e, discount, true)}
                                    >
                                      <MenuItem value={'$'} id="discount$">
                                        $
                                      </MenuItem>
                                      <MenuItem value={'%'} id="discount%">
                                        %
                                      </MenuItem>
                                    </Select>
                                  </span>
                                )}
                                <span style={{ marginLeft: '30px', marginTop: '10px' }}>
                                  {numberToDollars(orderWholeDiscountDetails[selecteddiscount.id])}
                                </span>
                                <span style={{ marginLeft: '30px' }}>
                                  <TextField
                                    id="wholeComment"
                                    className={classes.valueInput}
                                    label={'comment'}
                                    defaultValue={discount.comment}
                                    style={{ width: 600, marginLeft: '60px' }}
                                    onBlur={(e) => this.onValueChange(e, discount, 'comment')}
                                  />
                                </span>

                                <span className={classes.discountRowHandle}>
                                  <DragHandle />
                                </span>
                              </div>
                            );
                          }
                        })}
                    </Sortable>

                    <Divider />

                    {unselectedDiscounts.map((discount) => {
                      return (
                        <div style={{ marginBottom: '10px' }} className={classes.farmHeader} key={discount.id}>
                          <CheckBox checked={false} onChange={() => this.addDiscount(discount)} id="wholeDiscount" />
                          {discount.name}
                        </div>
                      );
                    })}
                  </Grid>
                </div>
              )}
            </Paper>
            <Paper className={classes.farmPaper}>
              {/* <div className={classes.tableTotalRow}>
                <h4 className={classes.tableTotalRowLabel}>Total</h4>
                <div className={classes.tableTotalRowNumber}>
                  <b>{numberToDollars(orderTotal)}</b>
                </div>
                <div
                  className={classes.tableTotalRowNumber}
                ></div>
                <div className={classes.tableTotalRowNumber}>
                  <b>{numberToDollars(orderDiscountsAmount)}</b>
                </div>
                <div className={classes.tableTotalRowNumber}>
                  <b>{numberToDollars(orderDiscountsAmount)}</b>
                </div>
                <div className={classes.tableTotalRowNumber}>
                  <b>{numberToDollars(orderTotal - orderDiscountsAmount)}</b>
                </div>
              </div> */}
              <Grid container spacing={3}>
                <Grid item xs={4} sm={4} style={{ textAlign: 'center' }}>
                  <h4 style={{ width: '200px', margin: '0' }}>Total</h4>
                </Grid>
                <Grid item xs={1} sm={1}></Grid>
                <Grid item xs={1} sm={1} style={{ textAlign: 'center' }}>
                  <b>{numberToDollars(orderTotal)}</b>
                </Grid>
                <Grid item xs={1} sm={1}></Grid>
                <Grid item xs={2} sm={2} style={{ textAlign: 'center' }}>
                  <b>{numberToDollars(orderDiscountsAmount)}</b>
                </Grid>
                <Grid item xs={1} sm={1}>
                  <b>{numberToDollars(orderDiscountsAmount)}</b>
                </Grid>
                <Grid item xs={1} sm={1} style={{ textAlign: 'center' }}>
                  <b>{numberToDollars(orderTotal - orderDiscountsAmount)}</b>
                </Grid>
                <Grid item xs={1} sm={1}></Grid>
              </Grid>
            </Paper>
            <Paper classes={{ root: classes.orderTotalPaper }}>
              <h2 className={classes.orderTotalTitle}>Order Total</h2>
              <div className={classes.orderTotalDisplayRow}>
                <div className={classes.orderTotalDisplayContainer}>
                  <p className={classes.orderTotalDisplayLabel}>Pretotal</p>
                  <div className={classes.orderTotalDisplayNumber} data-test-id="pretotal">
                    {numberToDollars(orderTotal)}
                  </div>
                </div>
                <div className={classes.orderTotalDisplayContainer}>
                  <p className={classes.orderTotalDisplayLabel}>Discount</p>
                  <div className={classes.orderTotalDisplayNumber} data-test-id="discount">
                    {numberToDollars(orderDiscountsAmount)}
                  </div>
                </div>
                <div className={classes.orderTotalDisplayContainer}>
                  <h4 className={classes.orderTotalDisplayLabel}>Grand Total</h4>
                  <div className={classes.orderTotalDisplayNumber} data-test-id="gradTotal">
                    {numberToDollars(orderTotal - orderDiscountsAmount)}
                  </div>
                </div>
              </div>
            </Paper>
          </React.Fragment>
        )}
        {!purchaseOrder.isSimple && selectedTab === 'simpleView' && (
          <React.Fragment>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2>Simple Product View</h2>
              {isProductOrderBooking && <CircularProgress />}
            </div>

            {tableData1.length > 0 || this.props.match.url.split('/')[2] === 'dealers' ? (
              <Paper className={classes.farmPaper}>
                {!purchaseOrder.isQuote && purchaseOrder.CustomerMonsantoProducts.length > 0 && (
                  <React.Fragment>
                    <Button
                      onClick={this.syncMonsantoOrders}
                      style={{ marginRight: '20px' }}
                      disabled={
                        isSyncingMonsantoProducts ||
                        (!customer.monsantoTechnologyId && !customer.glnId) ||
                        this.state.syncMonsantoProductIds.length === 0
                      }
                    >
                      {isSyncingMonsantoProducts ? 'Syncing With Bayer' : 'Sync With Bayer'}
                    </Button>

                    <FormControl>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={this.state.groupByProduct}
                            value={this.state.groupByProduct}
                            onChange={(event) => this.setState({ groupByProduct: event.target.checked })}
                            color="primary"
                          />
                        }
                        label="GroupBy Product"
                      />
                    </FormControl>

                    <p style={{ display: 'flex', alignContent: 'center' }}>
                      {!customer.glnId &&
                        !customer.monsantoTechnologyId &&
                        'This P.O. cannot be synced with Bayer yet because this grower has no GLN ID on file.'}
                    </p>
                  </React.Fragment>
                )}
                <ReactTable
                  data={
                    this.state.groupByProduct
                      ? this.groupDataByproduct(tableData1)
                      : tableData1.sort(
                          (a, b) =>
                            a.Product.blend.localeCompare(b.Product.blend) ||
                            (a.Product.treatment && a.Product.treatment.localeCompare(b.Product.treatment)),
                        )
                  }
                  columns={tableHeaders1}
                  minRows={1}
                  resizable={false}
                  showPagination={false}
                  pageSize={
                    this.state.groupByProduct ? this.groupDataByproduct(tableData1).length : tableData1.length || 0
                  }
                  getTrProps={this.getTableRowProps}
                />

                {/* <span>
                <sup>*</sup> The prices for these additional products are in a
                separate table
              </span> */}
              </Paper>
            ) : (
              ''
            )}
            {/* {(selectedTab === 'returnProducts' && tableDataReturn.length > 0) ||
            this.props.match.url.split('/')[2] === 'dealers' ? (
              <Paper className={classes.farmPaper}>
                <React.Fragment></React.Fragment>
                <ReactTable
                  data={
                    this.state.groupByProduct
                      ? this.groupDataByproduct(tableDataReturn)
                      : tableDataReturn.sort(
                          (a, b) =>
                            a.Product.blend.localeCompare(b.Product.blend) ||
                            (a.Product.treatment && a.Product.treatment.localeCompare(b.Product.treatment)),
                        )
                  }
                  columns={tableHeaders1}
                  minRows={1}
                  resizable={false}
                  showPagination={false}
                  pageSize={
                    this.state.groupByProduct
                      ? this.groupDataByproduct(tableDataReturn).length
                      : tableDataReturn.length || 0
                  }
                  getTrProps={this.getTableRowProps}
                />
              </Paper>
            ) : (
              ''
            )} */}
            {this.props.match.url.split('/')[2] !== 'dealers' ? (
              <div>
                <Paper className={classes.farmPaper}>
                  <ReactTable
                    data={this.state.groupByProduct !== true ? tableData : this.groupDataByproduct(tableData)}
                    columns={tableHeaders}
                    minRows={1}
                    resizable={false}
                    showPagination={false}
                    pageSize={
                      this.state.groupByProduct !== true
                        ? tableData.length
                        : this.groupDataByproduct(tableData).length || 0
                    }
                    getTrProps={this.getTableRowProps}
                  />
                </Paper>
                {/*              
                {selectedTab === 'returnProducts' && nonBayerReturnData.length > 0 && (
                  <Paper className={classes.farmPaper}>
                    <ReactTable
                      data={this.state.groupBySimple ? this.groupDataByproduct(nonBayerReturnData) : nonBayerReturnData}
                      columns={tableHeaders}
                      minRows={1}
                      resizable={false}
                      showPagination={false}
                      pageSize={nonBayerReturnData.length || 0}
                      getTrProps={this.getTableRowProps}
                    />
                  </Paper>
                )} */}
              </div>
            ) : (
              ''
            )}
            <Paper>
              {(showPerWholeOrderDiscounts || selectedDiscounts.length > 0) && perWholeOrderDiscounts.length > 0 && (
                <div>
                  <Grid container direction="column" spacing={16}>
                    <h4 style={{ margin: '15px 0px 15px 15px' }}>Whole Order Discounts</h4>
                    <Sortable
                      options={{ handle: `.${classes.discountRowHandle}` }}
                      onChange={(order, sortable, e) => this.onDiscountsReorder(order, sortable, e)}
                    >
                      {selectedDiscounts.map((discount) => {
                        const selecteddiscount = dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
                        return (
                          <div
                            style={{ marginBottom: '10px' }}
                            className={classes.farmHeader}
                            key={discount.DiscountId}
                            data-id={discount.DiscountId}
                          >
                            <CheckBox checked={true} onChange={() => this.removeDiscount(discount)} />

                            <span className={classes.discountLabel}>{selecteddiscount.name}</span>

                            {selecteddiscount.discountStrategy === 'Flat Amount Discount' && (
                              <span>
                                <TextField
                                  className={classes.valueInput}
                                  label={'Value'}
                                  defaultValue={discount.discountValue}
                                  style={{ width: 80 }}
                                  onBlur={(e) => this.onValueChange(e, discount, false)}
                                />
                                <Select
                                  style={{ marginLeft: '10px', marginTop: '15px' }}
                                  value={discount.unit}
                                  onChange={(e) => this.onValueChange(e, discount, true)}
                                >
                                  <MenuItem value={'$'}>$</MenuItem>
                                  <MenuItem value={'%'}>%</MenuItem>
                                </Select>
                              </span>
                            )}
                            <span style={{ marginLeft: '30px' }} className={classes.discountLabel}>
                              {numberToDollars(orderWholeDiscountDetails[selecteddiscount.id])}
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
                        <div style={{ marginBottom: '10px' }} className={classes.farmHeader} key={discount.id}>
                          <CheckBox checked={false} onChange={() => this.addDiscount(discount)} />
                          {discount.name}
                        </div>
                      );
                    })}
                  </Grid>
                </div>
              )}
            </Paper>
            <Paper className={classes.farmPaper}>
              {/* <div className={classes.tableTotalRow}>
                <h4 className={classes.tableTotalRowLabel}>Total</h4>
                <div className={classes.tableTotalRowNumber}>
                  <b>{numberToDollars(orderTotal)}</b>
                </div>
                <div
                  className={classes.tableTotalRowNumber}
                ></div>
                <div className={classes.tableTotalRowNumber}>
                  <b>{numberToDollars(orderDiscountsAmount)}</b>
                </div>
                <div className={classes.tableTotalRowNumber}>
                  <b>{numberToDollars(orderDiscountsAmount)}</b>
                </div>
                <div className={classes.tableTotalRowNumber}>
                  <b>{numberToDollars(orderTotal - orderDiscountsAmount)}</b>
                </div>
              </div> */}
              <Grid container spacing={3}>
                <Grid item xs={4} sm={4} style={{ textAlign: 'center' }}>
                  <h4 style={{ width: '200px', margin: '0' }}>Total</h4>
                </Grid>
                <Grid item xs={1} sm={1}></Grid>
                <Grid item xs={1} sm={1} style={{ textAlign: 'center' }}>
                  <b>{numberToDollars(orderTotal)}</b>
                </Grid>
                <Grid item xs={1} sm={1}></Grid>
                <Grid item xs={2} sm={2} style={{ textAlign: 'center' }}>
                  <b>{numberToDollars(orderDiscountsAmount)}</b>
                </Grid>
                <Grid item xs={1} sm={1}>
                  <b>{numberToDollars(orderDiscountsAmount)}</b>
                </Grid>
                <Grid item xs={1} sm={1} style={{ textAlign: 'center' }}>
                  <b>{numberToDollars(orderTotal - orderDiscountsAmount)}</b>
                </Grid>
                <Grid item xs={1} sm={1}></Grid>
              </Grid>
            </Paper>
            <Paper classes={{ root: classes.orderTotalPaper }}>
              <h2 className={classes.orderTotalTitle}>Order Total</h2>
              <div className={classes.orderTotalDisplayRow}>
                <div className={classes.orderTotalDisplayContainer}>
                  <p className={classes.orderTotalDisplayLabel}>Pretotal</p>
                  <div className={classes.orderTotalDisplayNumber} data-test-id="pretotal">
                    {numberToDollars(orderTotal)}
                  </div>
                </div>
                <div className={classes.orderTotalDisplayContainer}>
                  <p className={classes.orderTotalDisplayLabel}>Discount</p>
                  <div className={classes.orderTotalDisplayNumber} data-test-id="discount">
                    {numberToDollars(orderDiscountsAmount)}
                  </div>
                </div>
                <div className={classes.orderTotalDisplayContainer}>
                  <h4 className={classes.orderTotalDisplayLabel}>Grand Total</h4>
                  <div className={classes.orderTotalDisplayNumber} data-test-id="gradTotal">
                    {numberToDollars(orderTotal - orderDiscountsAmount)}
                  </div>
                </div>
              </div>
            </Paper>
          </React.Fragment>
        )}
        {!purchaseOrder.isSimple && selectedTab === 'farms' && allCustomerData.length !== 0 && (
          <React.Fragment>
            <PurchaseOrderFarms
              selectedTab={selectedTab}
              {...this.props}
              subjectName={subjectName}
              addProducts={this.addProducts}
              duplicateProducts={this.duplicateProducts}
              removeRelatedProduct={this.removeRelatedProduct}
              seedSizes={seedSizes}
              seedCompanies={seedCompanies}
              onShowEditProduct={this.openProductFormEdit}
              purchaseOrder={purchaseOrder}
              openMSRPEdit={this.openMSRPEdit}
              deleteFarm={this.deleteFarm}
              showPerWholeOrderDiscounts={showPerWholeOrderDiscounts}
              onDiscountsReorder={this.onDiscountsReorder}
              addDiscount={this.addDiscount}
              removeDiscount={this.removeDiscount}
              onValueChange={this.onValueChange}
              currentPurchaseOrder={currentPurchaseOrder}
              allCustomerData={allCustomerData}
              showDelivery={showDelivery}
              showOrderDate={showOrderDate}
            />
            {showFarmForm && (
              <FarmFormDialog
                showFarmForm={showFarmForm}
                cancelFarmDialog={this.cancelFarmDialog}
                createFarm={this.createFarm}
              />
            )}
            {showAddExistingFarm && (
              <AddExistingFarmDialog
                {...this.props}
                showAddExistingFarm={showAddExistingFarm}
                addExistingFarm={this.addExistingFarm}
                cancelShowAddExistingFarm={() => this.setState({ showAddExistingFarm: false })}
              />
            )}
          </React.Fragment>
        )}
        {selectedTab === 'picklaterProduct' && (
          <React.Fragment>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h2>Pick Later Product View</h2>
              {isProductOrderBooking && <CircularProgress />}
              <Button className={`${classes.printButton} hide-print`} onClick={this.print} color="info" id="pdfClick">
                <Print />
              </Button>
            </div>

            <Paper className={classes.farmPaper}>
              <div key={this.state.printHelperUpdateFlag}>
                <PrintHelper />
              </div>
              <div>
                {pickLaterData.map((d) => {
                  const style = {
                    color: '#3C4858',
                    // background: '#CDDFC8',
                    fontWeight: 'bold',
                    fontSize: '0.7rem',
                    textAlign: 'left',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                  };
                  return (
                    <div
                      style={{
                        display: 'flex',
                        padding: '10px',

                        flexDirection: 'column',
                      }}
                      className="invoice-table-wrapper"

                      // id="pickLaterTable"
                    >
                      <ReactTable
                        data={tableData1.filter(
                          (t) =>
                            t.pickLaterQty == 0 &&
                            d.blend == t.Product.blend &&
                            d.brand == t.Product.brand &&
                            d.classification == t.Product.classification &&
                            d.treatment == t.Product.treatment &&
                            d.order.id == t.order.pickLaterProductId,
                        )}
                        columns={[
                          {
                            Header: (
                              <div style={{ marginTop: '10px' }}>
                                <Tooltip title="Still need to pick seed size/packaging">
                                  <AccessTimeIcon />
                                </Tooltip>
                              </div>
                            ),

                            id: 'logo',
                            width: 50,
                            headerStyle: style,
                            accessor: (props) => {},
                          },

                          {
                            Header: <div>{d.blend}</div>,

                            id: 'blend',
                            headerStyle: style,
                            accessor: (props) => {
                              return (
                                <span>
                                  {!props.order.isSent ? (
                                    <Tooltip title="Product haven't synced to Bayer yet">
                                      <WarningIcon className={classes.warningIcon} />
                                    </Tooltip>
                                  ) : (
                                    <div style={{ marginLeft: '25px', marginRight: '36px' }}> </div>
                                  )}
                                </span>
                              );
                            },
                          },
                          {
                            Header: <div>{d.brand}</div>,

                            id: 'brand',
                            width: 100,
                            headerStyle: style,

                            accessor: (props) => {
                              return <span>{props.Product.seedSize}</span>;
                            },
                          },
                          {
                            Header: <div>{d.treatment}</div>,

                            id: 'treatment',
                            headerStyle: style,

                            accessor: (props) => {
                              return <span>{props.Product.packaging}</span>;
                            },
                          },
                          {
                            Header: <div>Farm Ordered :{`${assignValue}/ ${d.total}`} Units</div>,

                            id: 'farmOrder',
                            headerStyle: style,

                            accessor: (props) => {
                              return <span>{props.qty} Units</span>;
                            },
                          },
                          {
                            Header: <div>Bayer synced : {d.monsantoOrderQty} Units</div>,

                            id: 'bayerSynced',
                            headerStyle: style,

                            accessor: (props) => {},
                          },
                          {
                            Header: (
                              <div>
                                <IconButton
                                  aria-label="delete"
                                  onClick={this.handleTableItemActionMenuOpen(d)}
                                  id="productActions"
                                >
                                  <MoreHorizontalIcon fontSize="small" />
                                </IconButton>
                              </div>
                            ),

                            id: 'pickLaterProductActions',
                            headerStyle: style,
                            show: this.state.pickLaterShow,

                            accessor: (props) => {},
                          },
                        ]}
                        sortable={false}
                        showPagination={false}
                        minRows={1}
                      ></ReactTable>
                    </div>
                  );
                })}
              </div>
            </Paper>
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
                    onClick={(e) => {
                      this.setState({ isOpen: true });
                    }}
                    id="manageSeedSize"
                  >
                    Manage SeedSize/Packaging
                  </MenuItem>
                </MenuList>
              </Paper>
            </Popover>
          </React.Fragment>
        )}

        {selectedTab === 'payments' && (
          <React.Fragment>
            <div
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              id="paymentPage"
            >
              {allPaidTableData.length == 0 && getRemainPaymentData.length == 0 ? (
                <a>Please add a few products to see an Invoice Total.</a>
              ) : (
                currentPurchaseOrder !== undefined &&
                currentPurchaseOrder.isSimple == false && (
                  <div id="shareHolderPayment">
                    <Select
                      data-test-id="shareholdersSelect"
                      value={this.state.selectedShareholder.id || 'all'}
                      onChange={this.setSelectedShareholder}
                      style={{ width: '100%' }}
                      className="hide-print"
                    >
                      <MenuItem value={'all'}>All Shareholder</MenuItem>
                      <MenuItem value={'theCustomer'}>{currentPurchaseOrder.Customer.name}</MenuItem>
                      {shareholders
                        .filter((c) => c.customerId == currentPurchaseOrder.customerId)
                        .map((shareholder) => (
                          <MenuItem key={shareholder.id} value={shareholder.id}>
                            {shareholder.name}
                          </MenuItem>
                        ))}
                    </Select>
                  </div>
                )
              )}

              {/*   <Button
                id="addPayment"
                className={`${classes.addNewMenuItem} hide-print`}
                onClick={async () => {
                  await this.setPaymentTableData(allBalanceDueData, allCompanys, getRemainPaymentData);
                  this.setState({ paymentDialogOpen: true, activeTablePaymentItem: null, paymentDialogType: 1 });
                }}
              >
                Manage Payment-1
              </Button>*/}
            </div>
            <Paper style={{ marginTop: '30px' }} className={classes.farmPaper}>
              <InvoiceHeader
                organization={this.props.organization}
                customer={customer}
                selectedShareholder={this.state.selectedShareholder}
                purchaseOrder={purchaseOrder}
                daysToDueDate={this.props.organization.daysToInvoiceDueDateDefault}
                handleInvoiceDateChange={this.handleInvoiceDateChange}
                currentInvoiceDate={purchaseOrder.createdAt}
                grandTotal={0}
                payments={this.props.payments}
              />

              {allPaidTableData.length > 0 && (
                <Grid container className={classes.productGridContainer}>
                  <Grid item xs={3} className={classes.productGrid}></Grid>
                  <Grid item xs={3} className={classes.productGrid}>
                    <span className={classes.paymentDescription}>
                      This shows what the Invoice Amount is based on when the products were ordered within the different
                      Early Pay deadlines and assumes no payment has been made.
                    </span>
                  </Grid>
                  <Grid item xs={3} className={classes.productGrid}>
                    <span className={classes.paymentDescription}>
                      This shows when the different payments have been made and to which Early Pay deadlines they
                      applied to
                    </span>
                  </Grid>
                  <Grid item xs={3} className={classes.productGrid}>
                    <span className={classes.paymentDescription}>
                      This shows what the Balance Due is by or after Early Pay deadlines after partial or full payments
                      have been made
                    </span>
                  </Grid>
                </Grid>
              )}

              <div className={this.props.classes.paymentSummaryContainer}>
                <div
                  className="invoice-table-wrapper"
                  style={{
                    borderBottom: '1px solid black',
                    background: '#9e9e9e57',
                    height: '50px',
                  }}
                >
                  <div
                    id="companys-check"
                    className="ReactTable"
                    style={{ padding: '8px', width: '100%', height: '50px' }}
                  >
                    <span className={this.props.classes.invoicepaymentSummary}>Invoice Amounts & Payment History </span>
                  </div>
                </div>
                {allCompanys.map((d) => {
                  const balanceDue = allBalanceDueData.filter(
                    (dd) =>
                      dd.companyId === d.companyId &&
                      dd.CompanyName === d.CompanyName &&
                      new Date() < new Date(dd.earlyPayDeadLinedate),
                  );

                  // const isPaymentData = this.props.payments.filter(
                  //   (p) =>
                  //     p.purchaseOrderId === purchaseOrder.id &&
                  //     p.companyType == d &&
                  //     (this.state.selectedShareholder == 'all'
                  //       ? true
                  //       : this.state.selectedShareholder.id == 'theCustomer'
                  //       ? p.shareholderId == 0
                  //       : p.shareholderId === this.state.selectedShareholder.id),
                  // );
                  // const nonEarlyPayDataId = getRemainPaymentData.find((p) => p.companyId === d.companyId);

                  const paidTable = allPaidTableData.filter(
                    (dd) => dd.companyId == d.companyId && dd.CompanyName === d.CompanyName,
                    // (nonEarlyPayDataId !== undefined
                    //   ? nonEarlyPayDataId.companyId !== d.companyId || nonEarlyPayDataId.CompanyName !== d.CompanyName
                    //   : true),
                  );

                  const earlyPayData = allBalanceDueData.filter(
                    (dd) => dd.companyId == d.companyId && dd.payment.length > 0,
                  );

                  // console.log(allBalanceDueData, 'allBalanceDueData');

                  return (
                    <div>
                      {paidTable.length > 0 && (
                        <div style={{ padding: '8px', borderBottom: '2px solid #80808096' }}>
                          <h4 className={this.props.classes.titlePayment}>{d.CompanyName}</h4>
                          <div>
                            <div className="invoice-table-wrapper">
                              {paidTable.length > 0 && (
                                <div>
                                  <ReactTable
                                    sortable={false}
                                    showPagination={false}
                                    minRows={1}
                                    NoDataComponent={() => null}
                                    columns={[
                                      {
                                        Header: 'Summary',
                                        id: 'date',

                                        headerStyle: {
                                          color: '#3C4858',
                                          // background: '#CDDFC8',
                                          fontWeight: 'bold',
                                          fontSize: '0.7rem',
                                        },
                                        accessor: (props) => {
                                          const groupBayer = groupBy(
                                            tableData1.filter(
                                              (o) =>
                                                o.order.orderDate <= props.checkDate &&
                                                (paidTable.length == 1 || paidTable[0].index == props.index
                                                  ? true
                                                  : paidTable[props.index - 1] !== undefined &&
                                                    o.order.orderDate >= paidTable[props.index - 1].checkDate),
                                            ),
                                            (o) => {
                                              return o.classification;
                                            },
                                          );

                                          const productLine =
                                            d.productType == 'Bayer'
                                              ? Object.keys(groupBayer).length > 0
                                                ? Object.keys(groupBayer).map((s, i) => (
                                                    <span>
                                                      {`${groupBayer[s].length} ${s.toLocaleLowerCase()} ${
                                                        Object.keys(groupBayer).length - 1 == i ? 'products' : ','
                                                      }  `}
                                                    </span>
                                                  ))
                                                : '0 products'
                                              : `${
                                                  d.productType == 'SeedCompany'
                                                    ? tableData.filter(
                                                        (o) =>
                                                          o.order.orderDate <= props.checkDate &&
                                                          (paidTable.length == 1 || paidTable[0].index == props.index
                                                            ? true
                                                            : paidTable[props.index - 1] !== undefined &&
                                                              o.order.orderDate >=
                                                                paidTable[props.index - 1].checkDate) &&
                                                          o.productType == 'SeedCompany',
                                                      ).length
                                                    : tableData.filter(
                                                        (o) =>
                                                          o.order.orderDate <= props.checkDate &&
                                                          (paidTable.length == 1 || paidTable[0].index == props.index
                                                            ? true
                                                            : paidTable[props.index - 1] !== undefined &&
                                                              o.order.orderDate >=
                                                                paidTable[props.index - 1].checkDate) &&
                                                          o.productType == 'RegularCompany',
                                                      ).length
                                                } products`;

                                          return (
                                            <div>
                                              {props.currentDisount == 0
                                                ? `After ${format(
                                                    paidTable.length > 1
                                                      ? paidTable[paidTable.length - 2].date || new Date()
                                                      : props.date,
                                                    'MMM D, YYYY',
                                                  )} (0%)`
                                                : props.currentDisount != undefined &&
                                                  `${props.date} (
                                            ${props.currentDisount.discountValue}${props.currentDisount.unit})`}
                                              <br />
                                              {productLine.length > 0 && (
                                                <span style={{ fontSize: '0.6rem' }}>
                                                  {'('} {productLine}
                                                  {')'}
                                                </span>
                                              )}
                                            </div>
                                          );
                                        },
                                      },
                                      {
                                        Header: 'Invoice Amount',
                                        accessor: (props) => {
                                          return (
                                            <div className="invoiceAmount">
                                              {numberToDollars(props.finalInvoiceAmount)}
                                            </div>
                                          );
                                        },
                                        id: 'finalInvoiceAmount',

                                        headerStyle: {
                                          color: '#3C4858',
                                          // background: '#CDDFC8',
                                          fontWeight: 'bold',
                                          fontSize: '0.7rem',
                                          textAlign: 'left',
                                        },
                                      },
                                      {
                                        Header: 'Payment History',
                                        id: 'EarlyPayDate',
                                        accessor: (props) => {
                                          const isFind = earlyPayData.find(
                                            (c) => c.earlyPayDeadLinedate == props.checkDate,
                                          );

                                          return isFind !== undefined
                                            ? isFind.payment.map((d) => {
                                                const isMultiData =
                                                  d.multiCompanyData.length > 0 &&
                                                  d.multiCompanyData.find(
                                                    (c) =>
                                                      c.companyId == props.companyId &&
                                                      c.companyName == props.productType,
                                                  );

                                                return d.multiCompanyData.length > 0 ? (
                                                  <div>
                                                    {isMultiData ? (
                                                      <div>
                                                        <span
                                                          className="paymentAmount"
                                                          id={`Pmade-${
                                                            isMultiData ? isMultiData.amount : d.amount || 0
                                                          }`}
                                                        >
                                                          {' '}
                                                          {numberToDollars(
                                                            isMultiData ? isMultiData.amount : d.amount || 0,
                                                          )}
                                                        </span>{' '}
                                                        -
                                                        <span id={`Pmade-${d.paymentDate}`}>
                                                          {' '}
                                                          {moment.utc(d.paymentDate).format('MMM Do YYYY')}
                                                        </span>{' '}
                                                        {d.method} - #{d.payBy} -{d.note}
                                                        <IconButton
                                                          aria-label="more"
                                                          onClick={this.handleTablePaymentItemActionMenuOpen(
                                                            d,
                                                            isMultiData,
                                                          )}
                                                          id="paymentDot"
                                                        >
                                                          <MoreHorizontalIcon fontSize="small" />
                                                        </IconButton>
                                                      </div>
                                                    ) : (
                                                      ''
                                                    )}
                                                  </div>
                                                ) : props.productType == d.companyType &&
                                                  d.companyId == isFind.companyId ? (
                                                  <div>
                                                    <div>
                                                      <span className="paymentAmount" id={`Pmade-${d.amount || 0}`}>
                                                        {' '}
                                                        {numberToDollars(d.amount || 0)}
                                                      </span>{' '}
                                                      -
                                                      <span id={`Pmade-${d.paymentDate}`}>
                                                        {' '}
                                                        {moment.utc(d.paymentDate).format('MMM Do YYYY')}
                                                      </span>{' '}
                                                      {d.method} - #{d.payBy} -{d.note}
                                                      <IconButton
                                                        aria-label="more"
                                                        onClick={this.handleTablePaymentItemActionMenuOpen(d)}
                                                        id="paymentDot"
                                                      >
                                                        <MoreHorizontalIcon fontSize="small" />
                                                      </IconButton>
                                                    </div>
                                                  </div>
                                                ) : (
                                                  '-'
                                                );
                                              })
                                            : '-';
                                        },
                                        headerStyle: {
                                          color: '#3C4858',
                                          // background: '#CDDFC8',
                                          fontWeight: 'bold',
                                          fontSize: '0.7rem',
                                          textAlign: 'left',
                                        },
                                      },
                                      {
                                        Header: 'Balance Due',

                                        id: 'balance',
                                        headerStyle: {
                                          color: '#3C4858',
                                          // background: '#CDDFC8',
                                          fontWeight: 'bold',
                                          fontSize: '0.7rem',
                                          textAlign: 'left',
                                        },
                                        accessor: (props) => {
                                          const isFind = balanceDue.find(
                                            (c) => c.earlyPayDeadLinedate == props.checkDate,
                                          );

                                          return (
                                            <div className="balanceAmount">
                                              {isFind !== undefined
                                                ? isFind.isPaymentInPO.length == 0
                                                  ? numberToDollars(props.finalInvoiceAmount || 0)
                                                  : numberToDollars(isFind.finalBalanceDue || 0)
                                                : '-'}
                                            </div>
                                          );
                                        },
                                      },
                                    ]}
                                    data={paidTable}
                                    className={classes.earlyPayTable}
                                    getTrProps={(state, rowInfo) => {
                                      return { style: { fontSize: '0.7rem' } };
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {finalRemaingData.length > 0 && (
                  <div style={{ padding: '8px' }}>
                    <div className="invoice-table-wrapper">
                      <h4 className={this.props.classes.titlePayment}>Non-Early-Cash Products</h4>

                      <ReactTable
                        data={finalRemaingData}
                        columns={[
                          {
                            Header: 'CompanyName',
                            accessor: (props) => {
                              const companyName = props.Product.hasOwnProperty('Company')
                                ? props.Product.Company.name
                                : props.Product.hasOwnProperty('SeedCompany')
                                ? `${props.Product.SeedCompany ? props.Product.SeedCompany.name : ''}`
                                : 'Bayer';

                              return (
                                <div>
                                  {companyName} <br /> {'('}
                                  <span style={{ fontSize: '0.6rem' }}>
                                    {finalRemaingData
                                      .filter((p) => p.CompanyName == companyName)
                                      .map((d, i) => `${d.ids.length} products`)}
                                    {')'}
                                  </span>
                                </div>
                              );
                            },
                            id: 'CompanyName',
                            headerStyle: {
                              color: '#3C4858',
                              // background: '#CDDFC8',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              textAlign: 'left',
                            },
                          },
                          {
                            Header: 'Invoice Amount',
                            accessor: (props) => {
                              return <div className="invoiceAmount">{numberToDollars(props.total)}</div>;
                            },
                            id: 'total',
                            headerStyle: {
                              color: '#3C4858',
                              // background: '#CDDFC8',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              textAlign: 'left',
                            },
                          },
                          {
                            Header: 'Payment History',
                            accessor: (props) => {
                              const companyName = props.Product.hasOwnProperty('Company')
                                ? props.Product.Company.name
                                : props.Product.hasOwnProperty('SeedCompany')
                                ? `${props.Product.SeedCompany ? props.Product.SeedCompany.name : ''}`
                                : 'Bayer';

                              return (
                                props.isPaymentData.length > 0 &&
                                props.isPaymentData.map((p) => {
                                  const isMultiData =
                                    p.multiCompanyData.length > 0 &&
                                    p.multiCompanyData.find(
                                      (c) =>
                                        c.companyId == props.companyId &&
                                        c.amount !== 0 &&
                                        c.companyName == props.productType,
                                    );

                                  return p.multiCompanyData.length > 0 ? (
                                    <div>
                                      {isMultiData !== undefined ? (
                                        <div>
                                          <span className="paymentAmount">{numberToDollars(isMultiData.amount)}</span> -
                                          {moment.utc(p.paymentDate).format('MMM Do YYYY')} {p.method} - #{p.payBy} -
                                          {p.note}
                                          <IconButton
                                            aria-label="more"
                                            onClick={this.handleTablePaymentItemActionMenuOpen(p, isMultiData)}
                                            id="paymentDot"
                                          >
                                            <MoreHorizontalIcon fontSize="small" />
                                          </IconButton>
                                        </div>
                                      ) : (
                                        ''
                                      )}
                                    </div>
                                  ) : (
                                    props.productType == p.companyType && props.companyId == p.companyId && (
                                      <div>
                                        <span className="paymentAmount"> {numberToDollars(p.amount)}</span> -
                                        {moment.utc(p.paymentDate).format('MMM Do YYYY')} {p.method} - #{p.payBy} -{' '}
                                        {p.note}
                                        <IconButton
                                          aria-label="more"
                                          onClick={this.handleTablePaymentItemActionMenuOpen(p)}
                                          id="paymentDot"
                                        >
                                          <MoreHorizontalIcon fontSize="small" />
                                        </IconButton>
                                      </div>
                                    )
                                  );
                                })
                              );
                            },
                            id: 'Payment',

                            headerStyle: {
                              color: '#3C4858',
                              // background: '#CDDFC8',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              textAlign: 'left',
                            },
                          },
                          {
                            Header: 'Balance due',
                            accessor: (props) => {
                              let paymentTotal = 0;
                              props.isPaymentData.length > 0 &&
                                props.isPaymentData.map((p) => {
                                  const isMultiData =
                                    p.multiCompanyData.length > 0 &&
                                    p.multiCompanyData.find(
                                      (c) => c.companyId == props.companyId && c.companyName == props.productType,
                                    );

                                  return p.multiCompanyData.length > 0 &&
                                    isMultiData !== undefined &&
                                    isMultiData !== false
                                    ? (paymentTotal += parseFloat(isMultiData.amount || 0))
                                    : p.multiCompanyData.length == 0 && (paymentTotal += parseFloat(p.amount || 0));
                                });

                              return (
                                <div className="balanceAmount">
                                  {numberToDollars(parseFloat(props.remainingPayment || 0) - paymentTotal)}
                                </div>
                              );
                            },
                            id: 'balanceDue',
                            headerStyle: {
                              color: '#3C4858',
                              // background: '#CDDFC8',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                              textAlign: 'left',
                            },
                          },
                        ]}
                        sortable={false}
                        showPagination={false}
                        minRows={1}
                        NoDataComponent={() => null}
                        getTrProps={(state, rowInfo) => {
                          return { style: { fontSize: '0.7rem' } };
                        }}
                        className={classes.earlyPayTable}
                      ></ReactTable>
                    </div>
                  </div>
                )}
              </div>
              {selectedDiscounts.length > 0 && (
                <div className={classes.finalrow} style={{ flexDirection: 'column', fontSize: '0.7rem' }}>
                  <h4 className={this.props.classes.titlePayment}>Whole Order Discount</h4>
                  {selectedDiscounts &&
                    selectedDiscounts.map((discount) => {
                      const selecteddiscount = dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
                      return (
                        <div>
                          <span className={classes.discountLabel}>{selecteddiscount && selecteddiscount.name}</span>
                          <span style={{ marginLeft: '30px', marginTop: '10px' }}>
                            {numberToDollars(orderWholeDiscountDetails[selecteddiscount.id])}
                          </span>
                        </div>
                      );
                    })}
                </div>
              )}

              <div className={classes.finalrow}>
                <p>TotalBalanceDue : {numberToDollars(totalBalanceDue - sumOfOrderDisount || 0)} </p>
                <p style={{ marginLeft: '105px' }}>TotalPaymentAmount : {numberToDollars(totalBalancePayment || 0)}</p>
              </div>
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
                      onClick={(e) => {
                        this.setState({ isOpen: true });
                      }}
                    >
                      Manage SeedSize/Packaging
                    </MenuItem>
                  </MenuList>
                </Paper>
              </Popover>
            </Paper>
          </React.Fragment>
        )}
        {selectedTab === 'packaging' && <Packaging />}

        {(showProductForm || wantToTransferAll) && (
          <ProductDialog
            wantToTransferAll={wantToTransferAll}
            purchaseOrder={purchaseOrder}
            customerOrders={customerOrders}
            companies={companies}
            products={products}
            business={business}
            editType={editType}
            dealerDiscounts={dealerDiscounts}
            onClose={this.hideProductForm}
            onAddProducts={this.addProducts}
            onEditProduct={this.editProduct}
            isLoading={isLoading}
            setValues={(value) => {
              this.setState({
                isLoading: value,
              });
            }}
            customers={customers}
            updateQuoteMonsantoProduct={this.props.updateQuoteMonsantoProduct}
            discountPackages={discountPackages}
            editingProduct={editingProduct}
            packagings={packagings}
            seedSizes={seedSizes}
            seedCompanies={seedCompanies}
            apiSeedCompanies={apiSeedCompanies}
            type={purchaseOrder.isSimple ? null : 'farm'}
            reload={this.reload}
            setIsMonsantoProductReduceQuantity={this.setIsMonsantoProductReduceQuantity}
            setMonsantoProductReduceInfo={this.setMonsantoProductReduceInfo}
            isMonsantoProductReduceQuantity={isMonsantoProductReduceQuantity}
            monsantoProductReduceTransferInfo={monsantoProductReduceTransferInfo}
          />
        )}
        {linkDeliveryReceipt && showDeliveryForm && (
          <DeliveryDialog
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
          <DeliveryReceiptDialog
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
            purchaseOrder={currentPurchaseOrder}
            updatePurchaseOrder={updatePurchaseOrder}
            convertQuoteToExistingPurchaseOrder={convertQuoteToExistingPurchaseOrder}
            reload={this.reload}
          />
        )}

        {deletePurchaseOrderConfirm}
        {deleteProductConfirm}
        {archivePurchaseOrderConfirm}
        {openMSRPEditDialog}
        {convertToAdvancedDialogOpen && (
          <ConvertToAdvancedDialog
            open={convertToAdvancedDialogOpen}
            onClose={this.handleConvertToAdvancedDialogClose}
            purchaseOrder={currentPurchaseOrder}
            reload={this.reload}
          />
        )}

        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showSnackbar}
          message={<span style={{ whiteSpace: 'pre-line' }}>{showSnackbarText}</span>}
          onClick={() => this.setState({ showSnackbar: false })}
          onClose={() => this.setState({ showSnackbar: false })}
        />

        {isChangingName && (
          <Dialog open={isChangingName} maxWidth="sm">
            <DialogTitle className={classes.dialogTitle}>
              <div className={classes.dialogHeader}>
                <h4>Change the name of purchaseOrder</h4>
                <IconButton
                  color="inherit"
                  onClick={() => {
                    this.setState({ isChangingName: false });
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
              <div className={classes.poFlexClass} style={{ justifyContent: 'space-around' }}>
                <CustomInput
                  labelText="Name"
                  id="changeName"
                  style={{ width: '100px', mariginRight: 10 }}
                  formControlProps={{}}
                  inputProps={{
                    value: name,
                    type: 'text',
                    onChange: this.handleNameChange(),
                  }}
                  className="hide-print"
                />
                <Button
                  onClick={() => this.handleNameChangeSubmit(customer.id, purchaseOrder.id)}
                  variant="contained"
                  color="primary"
                  className={`${classes.submitButton} hide-print`}
                  id="SubmitName"
                >
                  Submit
                </Button>
                <Button
                  onClick={() => this.handleChangeNameClose()}
                  variant="contained"
                  color="primary"
                  className={`${
                    classes.submitButton + ' ' + classes.button + ' ' + classes.white + ' ' + classes.primary
                  } hide-print`}
                >
                  Cancel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        <SwitchDialog open={switchDialogOpen} onClose={this.closeSwitchDialog} />
        {showAddNoteDialog && (
          <AddNoteDialog
            open={showAddNoteDialog}
            onClose={this.handleAddNoteDialogClose}
            purchaseOrderNote={purchaseOrderNote}
            reminderDate={reminderDate}
            handleNoteChange={this.handleNoteChange}
            handleDateChange={this.handleDateChange}
            updateNote={this.updateNote}
            classes={classes}
          />
        )}

        {showAddTreatmentDialog && (
          <ProductDialog
            purchaseOrder={purchaseOrder}
            customerOrders={customerOrders}
            companies={companies}
            products={products}
            business={business}
            dealerDiscounts={dealerDiscounts}
            onClose={this.handleAddTreatementDialogClose}
            discountPackages={discountPackages}
            editingProduct={editingProduct}
            packagings={packagings}
            currentPurchaseOrder={currentPurchaseOrder}
            seedSizes={seedSizes}
            seedCompanies={seedCompanies}
            apiSeedCompanies={[]}
            customers={customers}
            type={purchaseOrder.isSimple ? null : 'farm'}
            reload={this.reload}
            addRelatedCustomProducts={this.addRelatedCustomProducts}
            isAddingTreatment={true}
            addingRelatedCustomProductProduct={addingRelatedCustomProductProduct}
          />
        )}
        {showAddCustomEarlyPayDialog && (
          <CustomEarlyPayDialog
            open={showAddCustomEarlyPayDialog}
            onClose={this.handleAddCustomEarlyDialogClose}
            purchaseOrderId={purchaseOrder.id}
          />
        )}

        {activeTableItem !== null && (
          <Dialog
            open={this.state.isOpen}
            // TransitionComponent={Transition}
            minWidth={'600px'}
            maxWidth={'800px'}
          >
            <DialogTitle className={classes.dialogTitle}>
              <div className={classes.dialogHeader}>
                <h3>Transfer Information</h3>
                <IconButton
                  color="inherit"
                  onClick={() => {
                    this.setState({ isOpen: false });
                    this.handleTableItemActionMenuClose();
                    this.handleProductItemActionMenuClose();
                    this.setState({
                      setOfRow: [],
                    });
                  }}
                  aria-label="Close"
                  id="close"
                >
                  <CloseIcon />
                </IconButton>
              </div>
            </DialogTitle>
            <DialogContent>
              <Grid
                container
                className={classes.productGridContainer}
                style={{ width: '1000px', lineBreak: 'anywhere', textAlign: 'center' }}
              >
                <Grid item xs={2} className={classes.productGrid}>
                  <p className={classes.productGridHeader}>Blend</p>

                  <h5 className={classes.productGridBody}>{activeTableItem.blend}</h5>
                </Grid>
                <Grid item xs={2} className={classes.productGrid}>
                  <p className={classes.productGridHeader}>Brand</p>

                  <h5 className={classes.productGridBody}>{activeTableItem.brand}</h5>
                </Grid>
                <Grid item xs={2} className={classes.productGrid}>
                  <p className={classes.productGridHeader}>Treatment</p>

                  <h5 className={classes.productGridBody}>{activeTableItem.treatment}</h5>
                </Grid>
                <Grid item xs={2} className={classes.productGrid}>
                  <p className={classes.productGridHeader}>FarmOrdered</p>

                  <h5 className={classes.productGridBody}>{`${assignValue} / ${activeTableItem.total}`} Units</h5>
                </Grid>
                <Grid item xs={2} className={classes.productGrid}>
                  <p className={classes.productGridHeader}>BayerSynced</p>
                  <h5 className={classes.productGridBody}>
                    {totalBayerValue || activeTableItem.monsantoOrderQty} Units
                  </h5>
                </Grid>
                <Grid item xs={2} className={classes.productGrid}>
                  <p className={classes.productGridHeader}>AddRow</p>
                  <div className={classes.productGridBody}>
                    <AddIcon
                      id="addSeedSize"
                      aria-label="delete"
                      onClick={() => {
                        setOfRow.length <= 0 &&
                          this.setState({
                            setOfRow: [
                              {
                                seedSize: '',
                                packaging: '',
                                quantity: 0,
                                monsantoProductId: activeTableItem.order.monsantoProductId,
                              },
                            ],
                          });
                      }}
                      style={{ color: setOfRow.length >= 1 ? 'gray' : 'black' }}
                      disabled={setOfRow.length >= 1 ? true : false}
                    ></AddIcon>
                  </div>
                </Grid>
              </Grid>

              {tableData1.filter(
                (t) =>
                  t.pickLaterQty == '0' &&
                  t.order.pickLaterProductId !== null &&
                  t.order.pickLaterProductId == activeTableItem.order.id,
              ).length > 0 && (
                <div className={classes.productDetailRow}>
                  <div>
                    <CheckBox
                      id="selectPOforsync"
                      onChange={this.handleMonsantoProductPendingCheckboxAll(
                        tableData1.filter(
                          (t) =>
                            t.pickLaterQty == '0' &&
                            t.order.pickLaterProductId !== null &&
                            t.order.pickLaterProductId == activeTableItem.order.id,
                        ),
                        'pickLater',
                      )}
                      // checked={this.state.syncMonsantoProductIds.includes(product.id)}
                    />
                    Select All
                  </div>
                  <Button
                    id="syncwithbayer"
                    onClick={this.syncMonsantoOrders}
                    disabled={
                      isSyncingMonsantoProducts ||
                      (!customer.monsantoTechnologyId && !customer.glnId) ||
                      this.state.syncMonsantoProductIds.length == 0
                    }
                  >
                    {isSyncingMonsantoProducts ? 'Syncing With Bayer' : 'Sync With Bayer'}
                  </Button>
                </div>
              )}

              {setOfRow.length >= 0 &&
                setOfRow.map((s) => {
                  const menuList =
                    apiSeedCompanies &&
                    apiSeedCompanies[0].Products.filter(
                      (d) =>
                        d.blend == activeTableItem.blend &&
                        d.brand == activeTableItem.brand &&
                        d.treatment == activeTableItem.treatment &&
                        d.classification == activeTableItem.classification &&
                        (activeTableItem.classification == 'C'
                          ? d.zoneId.includes(currentCornZoneId || 0)
                          : d.zoneId.includes('NZI')),
                    );

                  return (
                    <div className={classes.productDetailRow}>
                      <FormControl className={classes.selectField} style={{ marginRight: 20, width: '200px' }}>
                        <InputLabel htmlFor="company">SeedSize</InputLabel>
                        <Select
                          value={s.seedSize}
                          onChange={this.handleSelectChange}
                          autoWidth
                          select
                          id="seedSizeSelect"
                          inputProps={{
                            className: classes.select,
                            required: true,

                            name: 'seedSize',
                          }}
                          // disabled={editMode && editingProduct.hasOwnProperty('monsantoProductId')}
                        >
                          {this.unique(menuList, ['seedSize']).map((apiSeedCompany) => {
                            return (
                              <MenuItem
                                className="apiSeedCompany"
                                value={apiSeedCompany.seedSize}
                                key={apiSeedCompany.seedSize}
                                id={apiSeedCompany.seedSize}
                              >
                                {apiSeedCompany.seedSize}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                      <FormControl className={classes.selectField} style={{ marginRight: 20, width: '200px' }}>
                        <InputLabel htmlFor="company">Packaging</InputLabel>
                        <Select
                          value={s.packaging}
                          onChange={this.handleSelectChange}
                          autoWidth
                          select
                          id="packagingSelect"
                          inputProps={{
                            className: classes.select,
                            required: true,
                            name: 'packaging',
                          }}
                          // disabled={editMode && editingProduct.hasOwnProperty('monsantoProductId')}
                        >
                          {this.unique(
                            menuList.filter((f) => s.seedSize !== '' && s.seedSize == f.seedSize),
                            ['packaging'],
                          ).map((apiSeedCompany) => {
                            return (
                              <MenuItem
                                className="apiSeedCompany"
                                value={apiSeedCompany.packaging}
                                key={apiSeedCompany.packaging}
                                id={apiSeedCompany.packaging}
                              >
                                {apiSeedCompany.packaging}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>

                      <div style={{ marginLeft: 20, marginRight: 20, width: '80px' }}>
                        <CustomInput
                          labelText="Quantity"
                          id="quantity"
                          formControlProps={{
                            fullWidth: true,
                          }}
                          inputProps={{
                            value: s.quantity,
                            className: classes.quantityInput,
                            onChange: this.handleSelectChange,
                            name: 'quantity',
                            type: 'number',
                            step: 0.1,
                            min: 0,
                          }}
                        />
                      </div>

                      <div>
                        {s.seedSize !== '' && s.packaging !== '' && s.quantity >= 0 && (
                          <CheckIcon
                            id="checkTransfer"
                            onClick={() => {
                              this.onSavePickLaterProduct();
                            }}
                            style={{ color: 'green' }}
                          />
                        )}
                        <CloseIcon
                          style={{ color: 'red' }}
                          onClick={() => {
                            this.setState({
                              setOfRow: [],
                            });
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              {tableData1
                .filter(
                  (t) =>
                    t.pickLaterQty == '0' &&
                    t.order.pickLaterProductId !== null &&
                    t.order.pickLaterProductId == activeTableItem.order.id,
                )
                .map((s) => {
                  return (
                    <div className={classes.productDetailRow}>
                      {!s.order.isSent && !currentPurchaseOrder.isQuote ? (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <CheckBox
                            onChange={this.handleMonsantoProductPendingCheckbox(s)}
                            checked={this.state.syncMonsantoProductIds.includes(s.id)}
                          />
                          <Tooltip title="Product haven't synced to Bayer yet">
                            <WarningIcon className={classes.warningIcon} style={{ margin: 0 }} />
                          </Tooltip>
                        </div>
                      ) : (
                        <div style={{ marginRight: '73px' }}> </div>
                      )}

                      <FormControl className={classes.selectField} style={{ marginRight: 20, width: '200px' }}>
                        <InputLabel htmlFor="company">SeedSize</InputLabel>
                        <Select
                          value={s.Product.seedSize}
                          // onChange={this.handleEditChange(s)}
                          autoWidth
                          disabled={true}
                          select
                          data-test-id="companySelect"
                          inputProps={{
                            className: classes.select,
                            required: true,

                            name: 'seedSize',
                          }}
                          // disabled={editMode && editingProduct.hasOwnProperty('monsantoProductId')}
                        >
                          <MenuItem
                            className="apiSeedCompany"
                            value={s.Product.seedSize}
                            key={s.Product.seedSize}
                            id={s.Product.seedSize}
                          >
                            {s.Product.seedSize}
                          </MenuItem>
                          )
                        </Select>
                      </FormControl>
                      <FormControl className={classes.selectField} style={{ marginRight: 20, width: '200px' }}>
                        <InputLabel htmlFor="company">Packaging</InputLabel>
                        <Select
                          value={s.Product.packaging}
                          // onChange={(e) => this.handleEditChange(e,s)}
                          autoWidth
                          select
                          data-test-id="companySelect"
                          disabled={true}
                          inputProps={{
                            className: classes.select,
                            required: true,
                            name: 'packaging',
                          }}
                        >
                          <MenuItem
                            className="apiSeedCompany"
                            value={s.Product.packaging}
                            key={s.Product.packaging}
                            id={s.Product.packaging}
                          >
                            {s.Product.packaging}
                          </MenuItem>
                        </Select>
                      </FormControl>
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                        <Button
                          style={{ height: '40px' }}
                          disabled={this.state[`ischeckingProductavaiblty${s.order.id}`] == true ? true : false}
                          onClick={() => this.checkProductavaiblty(s.order)}
                        >
                          Check Availability
                        </Button>
                        ({this.state[`productAvailability${s.order.id}`]})
                      </div>
                      <div style={{ marginLeft: 20, marginRight: 20, width: '80px' }}>
                        <CustomInput
                          labelText="Quantity"
                          id="quantity"
                          formControlProps={{
                            fullWidth: true,
                          }}
                          inputProps={{
                            value: this.state[`editQty${s.id}`] || s.qty,
                            className: classes.quantityInput,
                            onChange: (e) => this.handleEditChange(e, s),
                            name: 'quantity',
                            type: 'number',
                            step: 0.1,
                            min: 0,
                          }}
                        />
                      </div>

                      {/* {this.state[`editQty${s.id}`] !== undefined && this.state[`editQty${s.id}`] != s.qty && (
                        <div>
                          <CheckIcon
                            id="checkTransfer"
                            onClick={() => {
                              const data = {
                                comment: s.order.comment,
                                discounts: s.order.discounts,
                                isSent: false,
                                monsantoProductId: s.order.monsantoProductId,
                                monsantoProductReduceTransferInfo: {
                                  transferWay: 'toMonsanto',
                                  reduceQuantity: 0,
                                },
                                orderDate: s.order.orderDate,
                                orderQty: this.state[`editQty${s.id}`],
                                price: s.order.price,
                              };
                              this.editOnlyQty(s.order, data);
                              this.setState({
                                [`editQty${s.id}`]: undefined,
                              });
                              // this.onSavePickLaterProduct();
                            }}
                            style={{ color: 'green' }}
                          />

                          <CloseIcon
                            style={{ color: 'red' }}
                            onClick={() => {
                              this.setState({
                                [`editQty${s.id}`]: s.qty,
                              });
                            }}
                          />
                        </div>
                          )} */}
                      <React.Fragment>
                        <IconButton
                          aria-label="delete"
                          onClick={this.handleProductActionMenuOpen(s)}
                          id="productActions"
                        >
                          <MoreHorizontalIcon fontSize="small" />
                        </IconButton>
                      </React.Fragment>
                    </div>
                  );
                })}

              <Popover
                open={this.state.productActionMenuOpen}
                anchorEl={this.state.productActionAnchorEl}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                onClose={this.handleProductItemActionMenuClose}
              >
                <Paper>
                  <MenuList>
                    <MenuItem
                      className={classes.addNewMenuItem}
                      onClick={(e) => {
                        this.removeRelatedProduct(this.state.activeProductItem);
                        this.handleProductItemActionMenuClose();
                      }}
                      id="pickLaterDelete"
                    >
                      Delete
                    </MenuItem>
                    <MenuItem
                      className={classes.addNewMenuItem}
                      onClick={(e) => {
                        console.log(this.state.activeProductItem, 'this.state.activeProductItem');
                        this.openProductFormEdit(this.state.activeProductItem.order, 'edit');
                        this.handleProductItemActionMenuClose();
                      }}
                      id="pickLaterDelete"
                    >
                      Edit
                    </MenuItem>
                  </MenuList>
                </Paper>
              </Popover>
            </DialogContent>
          </Dialog>
        )}

        {/*        <Dialog
          open={this.state.showPreviousModel}
          // TransitionComponent={Transition}
          fullWidth
          maxWidth="md"
        >
          <DialogTitle className={classes.dialogTitle}>
            <div className={classes.dialogHeader}>
              <span>Previous Balance Data</span>

              <Button
                id="addRow"
                className={classes.addNewMenuItem}
                onClick={async () => {
                  this.setState({
                    addPreviousData: [
                      ...this.state.addPreviousData,
                      {
                        amount: 0,
                        paymentDate: new Date(),
                        note: '',
                        companyId: 99999,
                        companyType: 'previousBalance',
                        id: this.state.addPreviousData.length + 1,
                        method: 'Check',
                        payBy: '',
                        shareholderId: 0,
                        paymentHistory: '',
                      },
                    ],
                  });
                }}
              >
                Add Row
              </Button>
            </div>
          </DialogTitle>
          <DialogContent>
            {this.state.addPreviousData.map((a) => {
              return (
                a.hasOwnProperty('id') && (
                  <div style={{ display: 'flex', marginBottom: '30px' }}>
                    <FormControl style={{ width: '20%', marginRight: '30px' }}>
                      <TextField
                        label="BalanceAmount"
                        id="amount"
                        inputProps={{
                          type: 'number',
                          defaultValue: a.amount,
                          onChange: (e) => this.handlePreviousChange('amount', e.target.value, a),

                          step: 0.1,
                          min: 0,
                        }}
                      />
                    </FormControl>
                    <FormControl style={{ width: '20%', marginRight: '30px' }}>
                      <TextField
                        label="Note"
                        id="note"
                        inputProps={{
                          type: 'text',
                          defaultValue: a.note,
                          onChange: (e) => this.handlePreviousChange('note', e.target.value, a),
                        }}
                      />
                    </FormControl>
                    <FormControl style={{ width: '20%', marginRight: '30px' }}>
                      <TextField
                        label="Payment History"
                        id="paymentHistory"
                        inputProps={{
                          type: 'text',
                          defaultValue: a.paymentHistory,
                          onChange: (e) => this.handlePreviousChange('paymentHistory', e.target.value, a),
                        }}
                      />
                    </FormControl>

                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <CheckIcon
                        id="checkTransfer"
                        onClick={async (e) => {
                          delete a.id;
                          await this.props.createPayment(currentPurchaseOrder.id, a);
                          await this.refreshpayment();
                        }}
                        style={{ color: 'green' }}
                      />
                      <CloseIcon
                        style={{ color: 'red' }}
                        onClick={() => {
                          this.setState({
                            addPreviousData: this.state.addPreviousData.filter((n) => n.id !== a.id),
                          });
                        }}
                      />
                    </div>
                  </div>
                )
              );
            })}

            {payments
              .filter((p) => p.companyType == 'previousBalance')
              .map((p) => {
                return (
                  <div style={{ display: 'flex', marginBottom: '30px' }}>
                    <FormControl style={{ width: '20%', marginRight: '30px' }}>
                      <TextField
                        label="BalanceAmount"
                        id="amount"
                        inputProps={{
                          type: 'number',
                          defaultValue: p.amount,
                          // onChange: (e) => this.handlePreviousChange('amount', e.target.value, a),

                          step: 0.1,
                          min: 0,
                        }}
                      />
                    </FormControl>
                    <FormControl style={{ width: '20%', marginRight: '30px' }}>
                      <TextField
                        label="Note"
                        id="note"
                        inputProps={{
                          type: 'text',
                          defaultValue: p.note,
                          // onChange: (e) => this.handlePreviousChange('note', e.target.value, a),
                        }}
                      />
                    </FormControl>
                    <FormControl style={{ width: '20%', marginRight: '30px' }}>
                      <TextField
                        label="Payment History"
                        id="paymentHistory"
                        inputProps={{
                          type: 'text',
                          defaultValue: p.paymentHistory,
                          // onChange: (e) => this.handlePreviousChange('paymentHistory', e.target.value, a),
                        }}
                      />
                    </FormControl>
                  </div>
                );
              })}
          </DialogContent>
            </Dialog>*/}
        {paymentDialogOpen && (
          <PaymentDialog
            open={paymentDialogOpen}
            onClose={this.handlePaymentDialogClose}
            shareholders={shareholders}
            editingPayment={activeTablePaymentItem}
            customer={customer}
            createPayment={this.props.createPayment}
            updatePayment={this.updatePayment}
            deletePayment={this.props.deletePayment}
            updatePaymentProps={this.props.updatePayment}
            refreshpayment={this.refreshpayment}
            tableDatas={paymentTableDatas}
            dealerDiscounts={dealerDiscounts}
            currentPurchaseOrder={currentPurchaseOrder}
            compainesMenuList={compainesMenuList}
            paymentDialogType={this.state.paymentDialogType}
          />
        )}
        {paymentRemoveAlert}
        <Popover
          open={tablePaymentItemActionMenuOpen}
          anchorEl={tablePaymentItemActionAnchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          onClose={this.handleTablePaymentItemActionMenuClose}
        >
          <Paper>
            <MenuList>
              <MenuItem
                className={classes.addNewMenuItem}
                onClick={async () => {
                  await this.setPaymentTableData(allBalanceDueData, allCompanys, getRemainPaymentData);
                  this.setState({ paymentDialogOpen: true });
                }}
              >
                Edit
              </MenuItem>
              <MenuItem className={classes.addNewMenuItem} onClick={this.handlePaymentDeleteAlert}>
                Delete
              </MenuItem>
            </MenuList>
          </Paper>
        </Popover>

        {wantToTransferPo && (
          <TransferPo
            open={wantToTransferPo}
            onClose={this.handleTranferPoDialogClose}
            customers={this.props.customers}
            purchaseOrder={transferingProducts}
            monsantoProductReduceTransferInfo={monsantoProductReduceTransferInfo}
            setMonsantoProductReduceInfo={this.setMonsantoProductReduceInfo}
            history={this.props.history}
          />
        )}
        {showViewPaymentDialog}
      </div>
    );
  }
}

export default withStyles(purchaseOrderStyles)(PurchaseOrder);
