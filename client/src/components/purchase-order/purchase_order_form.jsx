import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { debounce } from 'lodash/function';
import { format } from 'date-fns';
import Sortable from 'react-sortablejs';
import SweetAlert from 'react-bootstrap-sweetalert';
// import sweetAlertStyle from '../../material-dashboard-pro-react/views/sweetAlertStyle';

// material-ui icons
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import DragHandle from '@material-ui/icons/DragHandle';
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

// utilities
import {
  isUnloadedOrLoading,
  customerProductDiscountsTotals,
  numberToDollars,
  perWholeOrderDiscount,
} from '../../utilities';
import { getProductName, getProductFromOrder } from '../../utilities/product';
import { getAppliedDiscounts } from '../../utilities/purchase_order';
import { LoadingStatus } from '../../store/constants';

// components
// import Invoice from './invoice'
import PurchaseOrderDialog from './purchase_order_dialog';
import PurchaseOrderDeliveryDialog from './purchase_order_delivery_dialog';
import PurchaseOrderDeliveryReceiptDialog from './purchase_order_delivery_receipt_dialog';
import ConvertQuoteDialog from './ConvertQuoteDialog';
import PurchaseOrderFarms from './purchase_order_farms';
import FarmFormDialog from './farm_form_dialog';
import AddExistingFarmDialog from './add_existing_farm_dialog';

import styles from './purchase_order_form.styles';

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
      deletePurchaseOrderConfirm: null,
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

  getProductNameFromDeliveryDetail = (detail) => {
    const { products, seedSizes, packagings, seedCompanies, business } = this.props;
    let name = '';
    let product, lot;

    if (detail.lotId) {
      for (let i = 0; i < products.length; i++) {
        for (let y = 0; y < products[i].lots.length; y++) {
          if (products[i].lots[y].id === detail.lotId) {
            product = products[i];
            lot = product.lots[y];
            break;
          }
        }
        if (product && lot) break;
      }
      if (product === undefined || lot === undefined) return 'error';
      name = getProductName(product, seedCompanies);
      name += ' / ' + seedSizes.find((ss) => lot.seedSizeId === ss.id).name;
      name += ' / ' + packagings.find((p) => lot.packagingId === p.id).name;
      name += ' / lot no: ' + lot.lotNumber;
    } else {
      name = getProductName(business.find((p) => p.id === detail.customProductId));
    }

    return name;
  };

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

  addProducts = (data, farmId) => {
    const { purchaseOrder } = this.state;
    const { linkRelatedProduct, linkRelatedCustomProduct } = this.props;
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

  removeRelatedProduct(customerProduct) {
    const { removeRelatedProduct, removeRelatedCustomProduct } = this.props;
    const { purchaseOrder } = this.state;
    if (customerProduct.hasOwnProperty('customProductId')) {
      return removeRelatedCustomProduct(this.props.match.params.customer_id, purchaseOrder.id, customerProduct.id);
    }
    removeRelatedProduct(this.props.match.params.customer_id, purchaseOrder.id, customerProduct.id);
  }

  getAmountDelivered = (order) => (order.amountDelivered ? order.amountDelivered : 0);

  getTableData(customerOrders, farmId) {
    const { subjectName } = this.state;
    const { seedCompanies, products, business, dealerDiscounts } = this.props;
    let tableHeaders = [
      'Product',
      'Order Date',
      'Quantity',
      'Delivered',
      'Packaging',
      'Seed Size',
      'MSRP',
      'Before Discount',
      'Discounts',
      'Total',
    ];
    if (subjectName !== 'Invoice') tableHeaders.push('');

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
        tableData.push(rowData);
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
        product: getProductFromOrder(order, this.props.products, this.props.business),
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
    } = this.props;

    const customerId = match.params.customer_id;
    const customerOrders = this.props.getCustomerOrders.call(this); // todo: hack to allow custom filtering logic between PO & quotes for now
    const customerPurchaseOrders = items.filter((po) => {
      return `${po.customerId}` === `${customerId}`;
    });
    const { tableData, totals, tableHeaders } = this.getTableData(customerOrders);
    const perWholeOrderDiscounts = dealerDiscounts.filter((discount) => discount.applyToWholeOrder === true);
    const selectedDiscounts = purchaseOrder.dealerDiscounts || [];
    const unselectedDiscounts = perWholeOrderDiscounts.filter(
      (discount) => !(purchaseOrder.dealerDiscounts || []).some((Ddiscount) => discount.id === Ddiscount.DiscountId),
    );
    const { orderTotal, orderDiscountsAmount } = perWholeOrderDiscount(
      totals.subTotal,
      totals.quantity,
      purchaseOrder,
      perWholeOrderDiscounts,
    );

    return (
      <div>
        <div className={classes.buttonBar}>
          {/*{subjectName === "Purchase Order" && (*/}
          <Button
            className="hide-print"
            color="info"
            onClick={() => this.props.history.push(`/app/customers/${customerId}/invoice/${purchaseOrder.id}`)}
          >
            View Invoice
          </Button>
          {/*)}*/}

          <React.Fragment>
            <Button className="hide-print" color="info" onClick={this.savePageAsPdf}>
              Save as PDF
            </Button>

            <Button color="primary" className="hide-print" onClick={this.createNewPurchaseOrder}>
              New {subjectName}
            </Button>
          </React.Fragment>

          <React.Fragment>
            <Button color="danger" className="hide-print" onClick={this.removePurchaseOrder}>
              Delete {subjectName}
            </Button>

            {customerOrders.length > 0 && (
              <Button color="info" className="hide-print" onClick={this.openConvert}>
                Convert {subjectName}
              </Button>
            )}
          </React.Fragment>

          {linkDeliveryReceipt && subjectName === 'Purchase Order' && (
            <Button color="info" className="hide-print" onClick={() => this.setState({ showDeliveryForm: true })}>
              New Delivery
            </Button>
          )}
          {cloneItem && (
            <Button color="primary" className="hide-print" onClick={this.cloneItem}>
              Duplicate {subjectName}
            </Button>
          )}

          <Button className="hide-print" onClick={this.print} color="info">
            <Print />
          </Button>
        </div>

        <br />

        <React.Fragment>
          <div className={`${classes.purchaseOrderInput} hide-print`}>
            <CustomInput
              labelText={`${subjectName} Name`}
              id="name"
              inputProps={{
                className: classes.nameInput,
                defaultValue: purchaseOrder.name,
                onChange: (e) => this.debouncedUpdateName(e.target.value),
              }}
            />
          </div>

          <div className={`${classes.purchaseOrderInput} hide-print`}>
            <div className={classes.purchaseOrderInputLabel}>Select {subjectName.toLowerCase()}</div>
            <Select value={purchaseOrder.id} onChange={(e) => this.gotoPurchaseOrder(e.target.value)}>
              {customerPurchaseOrders.map((po) => {
                return (
                  <MenuItem value={po.id} key={po.id}>
                    {po.name}
                  </MenuItem>
                );
              })}
            </Select>
          </div>
        </React.Fragment>

        {deliveryReceipts.length > 0 && (
          <div className={`${classes.purchaseOrderInput} hide-print`}>
            <div className={classes.purchaseOrderInputLabel}>Select delivery receipt</div>
            <Select value={purchaseOrder.id} onChange={(e) => this.goToDeliveryReceipt(e.target.value)}>
              {deliveryReceipts.map((deliveryReceipt) => {
                const createdDate = format(new Date(deliveryReceipt.createdAt), 'MMMM Do YYYY | h:mm a');
                return (
                  <MenuItem value={deliveryReceipt.id} key={deliveryReceipt.id}>
                    {createdDate}
                  </MenuItem>
                );
              })}
            </Select>
          </div>
        )}

        <br />

        <React.Fragment>
          {purchaseOrder.isSimple === false && (
            <div>
              <Button
                simple={true}
                color="info"
                onClick={() =>
                  this.props.history.push(`/app/customers/${customerId}/purchase_order/${purchaseOrder.id}/packaging`)
                }
              >
                Packaging
              </Button>

              <Button
                simple={true}
                color="info"
                onClick={() =>
                  this.props.history.push(`/app/customers/${customerId}/purchase_order/${purchaseOrder.id}/summary`)
                }
              >
                Shareholder Summary
              </Button>

              <Button
                simple={true}
                color="info"
                onClick={() =>
                  this.props.history.push(
                    `/app/customers/${customerId}/purchase_order/${purchaseOrder.id}/discount_summary`,
                  )
                }
              >
                Discount Summary
              </Button>
            </div>
          )}

          <div className={classes.buttonBar}>
            {purchaseOrder.isSimple === true && (
              <Button color="primary" className="hide-print" onClick={() => this.setState({ showProductForm: true })}>
                New product
              </Button>
            )}

            {purchaseOrder.isSimple === false && (
              <React.Fragment>
                <Button color="info" onClick={() => this.setState({ showFarmForm: true })}>
                  New Farm
                </Button>
                <Button color="primary" onClick={() => this.setState({ showAddExistingFarm: true })}>
                  Add Existing Farm
                </Button>
              </React.Fragment>
            )}
          </div>
        </React.Fragment>

        <Paper className={classes.farmPaper}>
          {purchaseOrder.isSimple === true && (
            <React.Fragment>
              {perWholeOrderDiscounts.length > 0 && (
                <div>
                  <h4>{subjectName} Discounts</h4>
                  <Grid container spacing={16}>
                    <Grid item xs={4}>
                      <div>
                        <strong>Sub-total: &nbsp;</strong>

                        {numberToDollars(totals.subTotal)}
                      </div>

                      <div>
                        <strong>Total Quantity: &nbsp;</strong>

                        {totals.quantity}
                      </div>

                      <div>
                        <strong>Discounts: &nbsp;</strong>

                        {numberToDollars(orderDiscountsAmount)}
                      </div>

                      <div>
                        <strong>Total: &nbsp;</strong>

                        {numberToDollars(orderTotal)}
                      </div>
                    </Grid>

                    <Grid item xs={8} className="hide-print">
                      <h4>Apply Discounts</h4>

                      <Sortable
                        options={{ handle: `.${classes.discountRowHandle}` }}
                        onChange={(order, sortable, e) => this.onDiscountsReorder(order, sortable, e)}
                      >
                        {selectedDiscounts.map((discount) => {
                          const selecteddiscount = dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
                          return (
                            <div key={selecteddiscount.id} data-id={selecteddiscount.id}>
                              <Checkbox checked={true} onChange={() => this.removeDiscount(discount)} />

                              <span className={classes.discountLabel}>{selecteddiscount.name}</span>

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
                          <div key={discount.id}>
                            <Checkbox checked={false} onChange={() => this.addDiscount(discount)} />

                            {discount.name}
                          </div>
                        );
                      })}
                    </Grid>
                  </Grid>
                </div>
              )}

              <Table striped={true} tableHead={tableHeaders} tableData={tableData} />
            </React.Fragment>
          )}

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
        </Paper>

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
