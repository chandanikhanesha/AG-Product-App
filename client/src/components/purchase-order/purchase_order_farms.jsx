import React, { Component } from 'react';
import { debounce } from 'lodash/function';
import { format } from 'date-fns';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

// icons
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import PersonAdd from '@material-ui/icons/PersonAdd';

// material ui components
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MButton from '@material-ui/core/Button';

// material-dashboard components
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Table from '../../components/material-dashboard/Table/Table';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';

// components
import PurchaseOrderDialog from './purchase_order_dialog';
import ShareholderDialog from './shareholder_dialog';
import FarmNameDialog from './farm_dialog';
import AddShareHolderPercentageDialog from './shareholder_percentage_dialog';

// utils
import { customerProductDiscountsTotals, numberToDollars } from '../../utilities';
import { getProductName, getProductFromOrder } from '../../utilities/product';
import { getAppliedDiscounts } from '../../utilities/purchase_order';
import { getCustomerShareholders } from '../../store/actions';

class PurchaseOrderFarms extends Component {
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
    fieldNames: {},
    farmToEdit: null,
  };

  constructor(props) {
    super(props);

    this.debouncedUpdateOrder = debounce(this.props.editRelatedProduct, 750);
    this.debouncedUpdateCustomOrder = debounce(this.props.editRelatedCustomProduct, 750);
    this.debouncedUpdateShareholderPercentage = debounce(this.updateShareholderPercentage, 750);
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

  addProducts = (productsData) => {
    this.props.addProducts(productsData, this.state.farmId);
    this.setState({
      farmId: null,
      showProductForm: false,
    });
  };

  // TODO: These are copied from `purchase_order_form.jsx` parent component
  //  move to contextual or shared component

  getAmountDelivered = (order) => (order.amountDelivered ? order.amountDelivered : 0);

  removeRelatedProduct(customerProduct) {
    const { removeRelatedProduct, removeRelatedCustomProduct } = this.props;
    const { purchaseOrder } = this.state;
    if (customerProduct.hasOwnProperty('customProductId')) {
      return removeRelatedCustomProduct(this.props.match.params.customer_id, purchaseOrder.id, customerProduct.id);
    }
    removeRelatedProduct(this.props.match.params.customer_id, purchaseOrder.id, customerProduct.id);
  }

  editProduct = (productLinkId, selectedProductId, data) => {
    const customerId = this.props.match.params.customer_id;
    const productData = { productId: selectedProductId, ...data };
    this.props.editRelatedProduct(customerId, productLinkId, productData).then(() => {
      this.setState({
        showProductForm: false,
        editingProduct: null,
      });
    });
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
    if (order.hasOwnProperty('customProductId')) {
      this.setState((state, props) => {
        return {
          fieldNames: { [id]: data.fieldName },
        };
      });
      this.debouncedUpdateCustomOrder(order.customerId, order.id, data);
    } else {
      this.setState((state, props) => {
        return {
          fieldNames: { [id]: data.fieldName },
        };
      });
      this.debouncedUpdateOrder(order.customerId, order.id, data);
    }
  }

  getTableData(customerOrders, farmId) {
    const { subjectName, seedCompanies, products, business, dealerDiscounts } = this.props;
    const { fieldNames } = this.state;
    let tableData = [];
    let totals = {
      subTotal: 0,
      quantity: 0,
    };
    let discountTotals = [];

    // filter customer orders, and sort by `createdAt` so they dont shift as they're being updated
    let orders = customerOrders
      .filter((order) => {
        if (farmId === undefined && order.farmId) return false;
        if (farmId !== undefined && order.farmId !== farmId) return false;
        return true;
      })
      .sort((a, b) => {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })
      .reverse();

    orders.forEach((order) => {
      const product = getProductFromOrder(order, products, business);
      let appliedDiscounts = getAppliedDiscounts(order, dealerDiscounts);
      let customerProductDiscounts = customerProductDiscountsTotals(order, appliedDiscounts, product);
      discountTotals.push(customerProductDiscounts);

      totals.subTotal += customerProductDiscounts.total;
      totals.quantity += order.orderQty;
      const fieldId = `${order.id}-field-name`;

      let orderTableData = [
        <React.Fragment>
          <CustomInput
            labelText={'Field Name'}
            id={fieldId}
            inputProps={{
              value: fieldNames[fieldId] || order.fieldName || '',
              onChange: (e) => this.updateOrder(order, { fieldName: e.target.value }, `${order.id}-field-name`),
              disabled: subjectName === 'Invoice',
            }}
          />
        </React.Fragment>,
        getProductName(product, seedCompanies),
        format(order.orderDate || order.createdAt, 'MMM Do, YYYY'),
        order.orderQty,
      ];

      if (this.state.showAllColumns) {
        orderTableData = orderTableData.concat([
          this.getAmountDelivered(order),
          numberToDollars(product.msrp || product.costUnit),
          numberToDollars(customerProductDiscounts.originalPrice),
          numberToDollars(customerProductDiscounts.discountAmount),
        ]);
      }

      orderTableData.push(numberToDollars(customerProductDiscounts.total));
      if (this.state.showShareholderColumn) orderTableData.push(this.getShareholdersRowData(order, farmId));
      if (subjectName !== 'Invoice')
        orderTableData.push(
          <React.Fragment>
            {this.state.showShareholderColumn && (
              <IconButton
                color="primary"
                onClick={() =>
                  this.setState({ showShareholderPercentageDialog: true, shareHolderPercentageScope: order })
                }
              >
                <PersonAdd />
              </IconButton>
            )}
            <IconButton color="primary" onClick={() => this.setState({ editingProduct: order, showProductForm: true })}>
              <EditIcon />
            </IconButton>
            <IconButton color="primary" onClick={() => this.removeRelatedProduct(order)}>
              <DeleteIcon />
            </IconButton>
          </React.Fragment>,
        );

      tableData.push(orderTableData);
    });
    return { tableData, totals, discountTotals };
  }

  updateShareholderPercentage(farmId, shareholderId, percentage) {
    const { updatePurchaseOrder } = this.props;
    const { purchaseOrder } = this.state;

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

    updatePurchaseOrder(purchaseOrder.customerId, purchaseOrder.id, purchaseOrder);
  }

  getShareholdersRowData(customerProduct, farmId) {
    const { shareholders, classes } = this.props;
    const { purchaseOrder, customer } = this.state;
    const shareholdersData = purchaseOrder.farmData.find((data) => data.farmId === farmId) || { shareholderData: [] };
    let customerData = shareholdersData.shareholderData.find((data) => data.shareholderId === 'theCustomer') || {
      shareholderId: 'theCustomer',
    };
    let currentOrderCustomerData = customerProduct.shareholderData.find((data) => data.shareholderId === 'theCustomer');

    let customerRowData =
      currentOrderCustomerData && Number(currentOrderCustomerData.percentage) > 0 ? (
        <li key={'theCustomer-percent'} className={classes.shareholderValue}>
          <span className={classes.shareholderName}>{customer.name}</span>
          <span className={classes.percentageValue}>
            {currentOrderCustomerData && !Number.isNaN(Number(currentOrderCustomerData.percentage))
              ? Number(currentOrderCustomerData.percentage)
              : Number(customerData.percentage)
              ? Number(customerData.percentage)
              : 0}
            %
          </span>
        </li>
      ) : undefined;

    let shareholdersRowData = shareholders.map((shareholder) => {
      let currentOrderShareholderData = customerProduct.shareholderData.find(
        (data) => data.shareholderId === shareholder.id,
      );
      let purchaseOrderShareholderData = shareholdersData.shareholderData.find(
        (data) => data.shareholderId === shareholder.id,
      ) || { shareholderId: shareholder.id };

      if (!currentOrderShareholderData || Number(currentOrderShareholderData.percentage === 0)) return null;
      return (
        <li key={shareholder.id} className={classes.shareholderValue}>
          <span className={classes.shareholderName}>{shareholder.name}</span>
          <span className={classes.percentageValue}>
            {currentOrderShareholderData
              ? currentOrderShareholderData.percentage
              : purchaseOrderShareholderData.percentage}
            %
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

  renderFarmTables() {
    const { classes, subjectName, updateFarm, getCustomerShareholders } = this.props;
    const { showFarmEditForm, showShareholderPercentageDialog, shareHolderPercentageScope, customer, farmToEdit } =
      this.state;
    const customerShareHolders = getCustomerShareholders(customer.id);
    const purchaseOrder = this.props.items.find((po) => `${po.id}` === `${this.props.match.params.id}`);

    let purchaseOrderFarmIds = purchaseOrder.farmData.map((data) => data.farmId);
    const purchaseOrderFarms = this.props.farms.filter((farm) => purchaseOrderFarmIds.includes(farm.id));
    const customerOrders = this.props.getCustomerOrders.call(this);

    return purchaseOrderFarms
      .map((farm) => {
        const farmOrders = customerOrders.filter((order) => order.farmId === farm.id);
        const { tableData } = this.getTableData.call(this, farmOrders, farm.id);

        return (
          <Paper key={farm.id} className={classes.farmPaper}>
            <header className={classes.farmHeader}>
              <h3>{farm.name}</h3>
              <MButton
                size="small"
                onClick={() => {
                  this.setState({ showFarmEditForm: true, farmToEdit: farm.id });
                }}
              >
                Edit
              </MButton>
            </header>
            {/* <h4>Shareholders: </h4>
              {this.renderShareholders(farm.id)} */}
            {showFarmEditForm && (
              <FarmNameDialog
                open={showFarmEditForm}
                close={this.closeFarmNameForm}
                update={updateFarm}
                farm={purchaseOrderFarms.find((farm) => farm.id === farmToEdit)}
                match={this.props.match}
              />
            )}
            {showShareholderPercentageDialog && (
              <AddShareHolderPercentageDialog
                closeDialog={this.cancelShareholderPercentageModal}
                open={this.state.showShareholderPercentageDialog}
                farmId={farm.id}
                purchaseOrder={purchaseOrder}
                customer={customer}
                shareholders={customerShareHolders}
                classes={classes}
                subjectName={subjectName}
                customerProduct={shareHolderPercentageScope}
                editRelatedProduct={this.debouncedUpdateOrder}
                editRelatedCustomProduct={this.debouncedUpdateCustomOrder}
              />
            )}
            {subjectName !== 'Invoice' && (
              <div>
                <div>
                  <Button color="primary" onClick={() => this.setState({ showProductForm: true, farmId: farm.id })}>
                    Add Product
                  </Button>
                </div>
              </div>
            )}
            <Table striped={true} tableHead={this.getTableHeaders()} tableData={tableData} />
          </Paper>
        );
      })
      .sort((a, b) => {
        return b.key - a.key;
      });
  }

  componentWillMount() {
    const purchaseOrder = this.props.items.find((po) => `${po.id}` === `${this.props.match.params.id}`);
    const customer = this.props.customers.find((customer) => customer.id === purchaseOrder.customerId);

    //let showShareholderColumn = this.props.subjectName === 'Invoice'
    this.setState({
      purchaseOrder,
      customer,
      //showShareholderColumn
    });
  }

  render() {
    const { showProductForm, editingProduct, showShareholderColumn, showShareholderForm, purchaseOrder } = this.state;
    const {
      relatedProducts,
      companies,
      products,
      business,
      dealerDiscounts,
      discountPackages,
      packagings,
      seedSizes,
      subjectName,
      seedCompanies,
    } = this.props;

    return (
      <div>
        <div>
          {subjectName !== 'Invoice' && (
            <React.Fragment>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showShareholderColumn}
                    onChange={() => this.setState({ showShareholderColumn: !showShareholderColumn })}
                  />
                }
                label="Show shareholders column"
              />

              <Button color="info" onClick={() => this.setState({ showShareholderForm: true })}>
                New Shareholder
              </Button>
            </React.Fragment>
          )}

          <ShareholderDialog
            showShareholderForm={showShareholderForm}
            createShareholder={this.createShareholder}
            cancelShareholderDialog={this.cancelShareholderDialog}
          />
        </div>

        {this.renderFarmTables()}

        {showProductForm && (
          <PurchaseOrderDialog
            purchaseOrder={purchaseOrder}
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
            type="farm"
          />
        )}
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      getCustomerShareholders,
    },
    dispatch,
  );

export default connect(null, mapDispatchToProps)(PurchaseOrderFarms);
