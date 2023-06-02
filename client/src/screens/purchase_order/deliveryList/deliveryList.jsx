import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table';
import Tooltip from '@material-ui/core/Tooltip';
import { sortBy } from 'lodash';
// creative tim components
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Tabs from '../../../components/material-dashboard/CustomTabsWithoutBody/CustomTabsWithoutBody';
import IconButton from '@material-ui/core/IconButton';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';
import WarningIcon from '@material-ui/icons/Warning';
import Snackbar from '@material-ui/core/Snackbar';
// core components
import CircularProgress from '@material-ui/core/CircularProgress';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Paper from '@material-ui/core/Paper';
import { getProductName } from '../../../utilities/product.v2';

import { LoadingStatus } from '../../../store/constants';
import { deliveryListStyles } from './deliveryList.styles';

import DeliveryDialog from './deliveryDialog';
import axios from 'axios';
import moment from 'moment';

class DeliveriesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subjectName: '',
      purchaseOrder: null,
      orderDate: new Date(),
      newDeliveryList: [],
      selectedMenuTabIndex: 2,
      showManageDeliveryDialog: false,
      tableItemActionAnchorEl: null,
      tableItemActionMenuOpen: false,
      activeTableItem: null,
      isEdit: false,
      isSynceProcess: false,
      showSnackbar: false,
      showSnackbarText: '',
      deliveryReceipts: this.props.deliveryReceipts,
    };
  }

  componentDidMount = async () => {
    const {
      listCustomers,
      listProducts,
      listAllCustomProducts,
      listPurchaseOrders,
      listPackagings,
      listSeedSizes,
      organizationId,
      loadOrganization,
      listProductPackagings,
      listRelatedProducts,
      listRelatedCustomProducts,
      listDeliveryReceipts,
      getPurchaseOrderById,
      match: {
        params: { customer_id, id: purchaseOrderId },
      },
    } = this.props;

    await listDeliveryReceipts(purchaseOrderId);
    await listPurchaseOrders().then(this.setPurchaseOrderState);

    getPurchaseOrderById(purchaseOrderId);
    loadOrganization(organizationId);

    listProducts();
    listPackagings();
    listSeedSizes();
    listAllCustomProducts();
    listProductPackagings();
    listRelatedProducts();
    listRelatedCustomProducts(customer_id);
    this.refreshList();
  };

  componentWillMount() {
    const { match, location } = this.props;
    let selectedMenuTabIndex = 0;

    if (location.search.includes('?selectedTabIndex')) {
      selectedMenuTabIndex = parseInt(location.search.split('&')[0].split('?selectedTabIndex=')[1]);
    }
    this.setState({ selectedMenuTabIndex });
  }

  refreshList = async () => {
    const {
      listDeliveryReceipts,

      match: {
        params: { customer_id, id: purchaseOrderId },
      },
    } = this.props;

    listDeliveryReceipts(purchaseOrderId);
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/purchase_orders/${purchaseOrderId}/delivery_receipts`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        this.setState({ deliveryReceipts: response.data.items });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  get isLoading() {
    return this.props.isLoading.call(this);
  }

  handleTableItemActionMenuOpen = (item) => (event) => {
    this.setState({
      tableItemActionMenuOpen: true,
      tableItemActionAnchorEl: event.target,
      activeTableItem: item,
    });
  };
  handleTableItemActionMenuClose = () => {
    this.setState({ tableItemActionMenuOpen: false });
  };
  onDelete = async () => {
    const { currentPurchaseOrder } = this.props;
    const { purchaseOrder, activeTableItem } = this.state;
    // this.props.deleteDeliveryReceipt(purchaseOrder.id, activeTableItem);
    await this.props.updateDeliveryReceipt(purchaseOrder.id, activeTableItem);

    await this.refreshList();
  };
  setPurchaseOrderState = () => {
    const {
      purchaseOrders,
      match: {
        params: { id },
      },
    } = this.props;
    const purchaseOrder = purchaseOrders.find((po) => `${po.id}` === `${id}`);
    this.setState({ purchaseOrder });
    return purchaseOrder;
  };

  getDeliveryReceiptDetailsData = (DeliveryReceiptDetails) => {
    const { currentPurchaseOrder } = this.props;

    const data =
      DeliveryReceiptDetails &&
      DeliveryReceiptDetails.map((item) => {
        const {
          amountDelivered,
          monsantoLotId,
          MonsantoLot,
          monsantoProductId,
          Lot,
          customProductId,
          CustomLot,
          productId,
          customerMonsantoProductId,
        } = item;
        const product = currentPurchaseOrder.CustomerProducts.filter((a) => a.productId === productId);
        const monsantoProduct = currentPurchaseOrder.CustomerMonsantoProducts.filter(
          (a) => a.monsantoProductId === monsantoProductId,
        );

        const customproduct =
          currentPurchaseOrder.CustomerCustomProducts.length > 0 &&
          currentPurchaseOrder.CustomerCustomProducts.filter((a) => a && a.customProductId === customProductId);
        return {
          productDetail:
            monsantoProductId !== null && currentPurchaseOrder
              ? monsantoProduct.length > 0 &&
                monsantoProduct[0].MonsantoProduct &&
                monsantoProduct[0].MonsantoProduct.productDetail !== null &&
                monsantoProduct[0].MonsantoProduct.productDetail
              : (customProductId !== null || productId !== null) &&
                getProductName(
                  customProductId !== null
                    ? customproduct.length > 0 && customproduct[0].CustomProduct
                    : product.length > 0 && product[0].Product,
                ),
          lotNumber:
            (monsantoLotId !== null && monsantoLotId
              ? MonsantoLot && MonsantoLot.lotNumber
              : CustomLot !== null && CustomLot
              ? CustomLot.lotNumber
              : Lot !== null && Lot.lotNumber) || '-',
          amountDelivered,
        };
      });
    return data;
  };
  setShowSnackbar = (showSnackbarText) => {
    this.setState({
      showSnackbar: true,
      showSnackbarText: showSnackbarText,
    });
  };

  getCustomerOrders = () => this.props.getCustomerOrders.call(this);

  onMenuTabChange = (selectedMenuTabIndex) => {
    const { purchaseOrder } = this.state;

    let path = '';
    if (
      purchaseOrder &&
      this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket' && c.id == purchaseOrder.customerId)
    ) {
      path = '/app/dealers';
    } else {
      path = '/app/customers';
    }

    const isShowPickLater =
      purchaseOrder && purchaseOrder.CustomerMonsantoProducts.length > 0
        ? purchaseOrder.CustomerMonsantoProducts.filter((f) => f.isPickLater == true)
        : [];

    if (purchaseOrder && purchaseOrder.isQuote) {
      if (selectedMenuTabIndex === 0) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/${purchaseOrder.isQuote ? 'quote' : 'purchase_order'}/${
            purchaseOrder.id
          }?selectedTabIndex=${selectedMenuTabIndex}`,
        );
      }
      if (selectedMenuTabIndex === 1) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/preview/${purchaseOrder.id}?selectedTabIndex=${selectedMenuTabIndex}`,
        );
      }
    } else if (isShowPickLater.length > 0) {
      if (selectedMenuTabIndex === 0) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/${purchaseOrder.isQuote ? 'quote' : 'purchase_order'}/${
            purchaseOrder.id
          }?selectedTabIndex=${selectedMenuTabIndex}`,
        );
      }

      if (selectedMenuTabIndex === 5) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/purchase_order/${purchaseOrder.id}/deliveries?selectedTabIndex=${selectedMenuTabIndex}&isReturn=true`,
        );
      }
      if (selectedMenuTabIndex === 1) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/purchase_order/${purchaseOrder.id}?selectedTabIndex=${selectedMenuTabIndex}`,
        );
      }
      if (selectedMenuTabIndex === 2) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/purchase_order/${purchaseOrder.id}?selectedTabIndex=${selectedMenuTabIndex}`,
        );
      }

      if (selectedMenuTabIndex === 3) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/preview/${purchaseOrder.id}?selectedTabIndex=${selectedMenuTabIndex}`,
        );
      }

      if (selectedMenuTabIndex === 4) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/purchase_order/${purchaseOrder.id}/deliveries?selectedTabIndex=${selectedMenuTabIndex}&isReturn=false`,
        );
      }
    } else {
      if (selectedMenuTabIndex === 0) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/${purchaseOrder.isQuote ? 'quote' : 'purchase_order'}/${
            purchaseOrder.id
          }?selectedTabIndex=${selectedMenuTabIndex}`,
        );
      }

      if (selectedMenuTabIndex === 4) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/purchase_order/${purchaseOrder.id}/deliveries?selectedTabIndex=${selectedMenuTabIndex}&isReturn=true`,
        );
      }
      if (selectedMenuTabIndex === 1) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/purchase_order/${purchaseOrder.id}?selectedTabIndex=${selectedMenuTabIndex}`,
        );
      }

      if (selectedMenuTabIndex === 2) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/preview/${purchaseOrder.id}?selectedTabIndex=${selectedMenuTabIndex}`,
        );
      }

      if (selectedMenuTabIndex === 3) {
        this.props.history.push(
          `${path}/${purchaseOrder.customerId}/purchase_order/${purchaseOrder.id}/deliveries?selectedTabIndex=${selectedMenuTabIndex}&isReturn=false`,
        );
      }
    }

    this.setState({ selectedMenuTabIndex });
  };

  onSynce = () => {
    const { currentPurchaseOrder } = this.props;
    this.setState({ isSynceProcess: true });
    this.props
      .movementReport(currentPurchaseOrder.id)
      .then((res) => {
        if (res.payload) {
          this.refreshList();
          this.setState({ isSynceProcess: false }, this.setShowSnackbar('DeliveryRecepit are synce successfully!!'));
        }
      })
      .catch((e) => {
        console.log(e);
        this.setState({ isSynceProcess: false });
        this.setShowSnackbar(e.response ? e.response.data.error : 'Timeout the error');
      });
  };

  render() {
    const {
      subjectName,
      purchaseOrder,
      selectedMenuTabIndex,
      showManageDeliveryDialog,
      tableItemActionAnchorEl,
      tableItemActionMenuOpen,
      activeTableItem,
      isSynceProcess,
      showSnackbar,
      showSnackbarText,
    } = this.state;
    const { currentPurchaseOrder } = this.props;

    if (!currentPurchaseOrder && this.isLoading) {
      return <CircularProgress />;
    }
    const {
      classes,
      match: {
        params: { customer_id },
      },
      customers,
      lots,
      location,
    } = this.props;
    const isReturn = location.search.split('isReturn=')[1];

    let { deliveryReceipts } = this.state;
    deliveryReceipts = sortBy(deliveryReceipts, function (dateObj) {
      return new Date(dateObj.deliveredAt);
    })
      .reverse()
      .filter((d) =>
        currentPurchaseOrder && d.purchaseOrderId === currentPurchaseOrder.id && isReturn == 'true'
          ? d.isReturn === true
          : d.isReturn === false,
      );

    const isShowPickLater =
      currentPurchaseOrder.CustomerMonsantoProducts.length > 0
        ? currentPurchaseOrder.CustomerMonsantoProducts.filter((f) => f.isPickLater == true)
        : [];
    const returnIndex = currentPurchaseOrder.isSimple ? 4 : 5;
    const customer = currentPurchaseOrder && currentPurchaseOrder.Customer;

    // const customerOrders = this.getCustomerOrders();
    let menuTabs =
      currentPurchaseOrder && currentPurchaseOrder.isSimple
        ? [{ tabName: 'Products', tabIndex: 'products' }]
        : !currentPurchaseOrder.isQuote && isShowPickLater.length > 0
        ? [
            { tabName: 'Farms', tabIndex: 'farms' },
            { tabName: 'Pick Later Product', tabIndex: 'picklaterProduct' },
          ]
        : [{ tabName: 'Farms', tabIndex: 'farms' }];

    menuTabs =
      customer.name == 'Bayer Dealer Bucket'
        ? menuTabs.concat([
            // { tabName: "Package & Seed Size", tabIndex: "packaging" },
            // { tabName: 'Invoice', tabIndex: 'invoice' },
            // !purchaseOrder.isSimple && { tabName: 'Simple Products View', tabIndex: 'simpleView' },
            { tabName: 'Invoice Preview', tabIndex: 'preview' },
            // { tabName: 'Grower Delivery', tabIndex: 'delivery' },
            // { tabName: 'Return', tabIndex: 'returnDelivery' },
            // { tabName: 'Return Products', tabIndex: 'returnProducts' },
          ])
        : menuTabs.concat([
            // { tabName: "Package & Seed Size", tabIndex: "packaging" },
            // { tabName: 'Invoice', tabIndex: 'invoice' },
            // !purchaseOrder.isSimple && { tabName: 'Simple Products View', tabIndex: 'simpleView' },
            { tabName: 'Payments', tabIndex: 'payments' },

            { tabName: 'Invoice Preview', tabIndex: 'preview' },
            { tabName: 'Grower Delivery', tabIndex: 'delivery' },
            { tabName: 'Return', tabIndex: 'returnDelivery' },
            // { tabName: 'Return Products', tabIndex: 'returnProducts' },
          ]);
    currentPurchaseOrder && localStorage.setItem('currentPurchaseOrderId', currentPurchaseOrder.id);

    return (
      <div>
        <div className="hide-print" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '-5px' }}>
          <div>
            <Link key={currentPurchaseOrder.id} to={`/app/customers`}>
              Back to Customers
            </Link>{' '}
            /{' '}
            {customer && (
              <span>
                {customer.name}'s {subjectName}
              </span>
            )}
            {/*   <div className={`${classes.purchaseOrderInput} hide-print`}>
              <Select
                value={1}
                // onChange={e => this.gotoPurchaseOrder(e.target.value)}
              >
                <MenuItem value={1}>DL #1</MenuItem>
              </Select>
            </div>*/}
          </div>
          <span className={classes.createdAt}>
            Created on {moment.utc(currentPurchaseOrder.createdAt).format('DD/MM/YYYY hh:mm a')}
          </span>
        </div>

        <div className={`${classes.newButtonBar} hide-print`}>
          <div style={{ height: '90px' }}>
            <Tabs
              headerColor="gray"
              selectedTab={selectedMenuTabIndex}
              onTabChange={this.onMenuTabChange}
              tabs={menuTabs}
            />
          </div>

          <div style={{ display: 'flex' }}>
            <Button
              id="addDeliveryReturn"
              onClick={() => this.setState({ showManageDeliveryDialog: true })}
              color="primary"
              className={classes.saveTableButton}
            >
              {isReturn == 'true' ? 'Add Return' : 'Add Grower Delivery'}
            </Button>
            <Button color="primary" onClick={this.onSynce} disabled={isSynceProcess === true ? true : false}>
              Sync Now
            </Button>
            {isSynceProcess === true && (
              <CircularProgress size={24} style={{ position: 'absolute', marginRight: '150px', marginTop: '16px' }} />
            )}
            <Button
              color="primary"
              className={classes.saveTableButton}
              onClick={() =>
                this.props.history.push({
                  pathname: `/app/customers/${currentPurchaseOrder.customerId}/delivery_preview/${currentPurchaseOrder.id}/print`,
                  state: { isReturn },
                })
              }
            >
              Print
            </Button>
          </div>
        </div>

        <React.Fragment>
          {/* <Paper className={classes.tableTitleContainer}>
            <h4 className={classes.tableTitle}>Bayer Corn </h4>
          </Paper> */}

          <div style={{ marginTop: '10px' }} id="delivery_container">
            {deliveryReceipts.length !== 0 ? (
              deliveryReceipts &&
              deliveryReceipts.map((item) => {
                const { deliveredAt, deliveredBy, name, DeliveryReceiptDetails, isSynce } = item;
                const data1 = {
                  isReturn: isReturn == 'true' && item.isReturn === true ? <b> - (Return)</b> : null,
                  isSynce:
                    isSynce !== true ? (
                      <Tooltip title="Product haven't synced to Bayer yet">
                        <WarningIcon
                          style={{
                            color: 'gold',
                            fontSize: '20',
                          }}
                        />
                      </Tooltip>
                    ) : null,
                  deliveredAt: `${moment.utc(deliveredAt).format('MM/DD/YYYY hh:mm a')} `,
                  notes: name,
                  deliveredBy,
                  actions: (
                    <React.Fragment>
                      <IconButton aria-label="delete" onClick={this.handleTableItemActionMenuOpen(item.id)}>
                        <MoreHorizontalIcon fontSize="small" />
                      </IconButton>
                    </React.Fragment>
                  ),

                  DeliveryReceiptDetails,
                };

                const data = this.getDeliveryReceiptDetailsData(DeliveryReceiptDetails);
                return (
                  <Paper className={classes.tableContainer}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px' }}>
                      <span>
                        {data1.notes} - {data1.deliveredAt} - {data1.deliveredBy || '#'} {data1.isReturn}
                        {data1.isSynce}
                      </span>
                      {data1.actions}
                    </div>
                    <ReactTable
                      data={data}
                      getTrProps={() => ({
                        style: {
                          flexGrow: 0,
                        },
                      })}
                      columns={[
                        {
                          Header: 'Product Detail',
                          accessor: 'productDetail',
                          headerStyle: {
                            fontWeight: 'bold',
                          },
                        },
                        {
                          Header: 'Lot Number',
                          accessor: 'lotNumber',
                          headerStyle: {
                            fontWeight: 'bold',
                          },
                        },
                        {
                          Header: isReturn == 'true' ? 'Return Qty' : 'Delivered Qty',
                          accessor: 'amountDelivered',
                          headerStyle: {
                            textAlign: 'left',
                            fontWeight: 'bold',
                          },
                        },
                      ]}
                      minRows={1}
                      showPagination={false}
                      defaultPageSize={500}
                    />
                  </Paper>
                );
              })
            ) : (
              <Paper className={classes.tableContainer}>
                <span className={classes.noFoundMess}>No Grower Delivery/Return Found</span>
              </Paper>
            )}
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
                  id="deliveryEdit"
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.setState({ showManageDeliveryDialog: true, isEdit: true });
                    this.handleTableItemActionMenuClose();
                  }}
                >
                  Edit
                </MenuItem>
                <MenuItem
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.props.history.push({
                      pathname: `/app/customers/${currentPurchaseOrder.customerId}/delivery_preview/${currentPurchaseOrder.id}/print`,
                      state: { singleEvent: true, activeTableItem, isReturn },
                    });
                    this.handleTableItemActionMenuClose();
                  }}
                >
                  Print
                </MenuItem>

                <MenuItem
                  id="deliveryDelete"
                  className={classes.addNewMenuItem}
                  onClick={() => {
                    this.onDelete();

                    this.handleTableItemActionMenuClose();
                  }}
                >
                  Delete
                </MenuItem>
              </MenuList>
            </Paper>
          </Popover>
          <Snackbar
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={showSnackbar}
            autoHideDuration={5000}
            message={<span>{showSnackbarText}</span>}
            onClick={() => this.setState({ showSnackbar: false })}
            onClose={() => this.setState({ showSnackbar: false })}
          />

          {showManageDeliveryDialog && (
            <DeliveryDialog
              isOpen={showManageDeliveryDialog}
              refreshList={this.refreshList}
              onClose={(value, msg) => {
                (value === false || value === true) && this.setShowSnackbar(msg);
                this.props.listDeliveryReceipts(currentPurchaseOrder.id);
                this.setState({ showManageDeliveryDialog: false, isEdit: false });
              }}
              classes={classes}
              customer_id={customer_id}
              currentPurchaseOrder={currentPurchaseOrder}
              activeTableItem={activeTableItem}
              isEdit={this.state.isEdit}
              isReturnIndex={isReturn == 'true' ? true : false}
              {...this.props}
            />
          )}
        </React.Fragment>
      </div>
    );
  }
}

DeliveriesList.propTypes = {
  subjectName: PropTypes.string,
  products: PropTypes.array,
  productsStatus: PropTypes.oneOf(Object.values(LoadingStatus)),
  business: PropTypes.array,
  purchaseOrders: PropTypes.array,
  listDeliveryReceipts: PropTypes.func,
  createDeliveryReceipt: PropTypes.func,
  updateDeliveryReceipt: PropTypes.func,
  listRelatedProducts: PropTypes.func.isRequired,
  listProducts: PropTypes.func.isRequired,
  listAllCustomProducts: PropTypes.func.isRequired,
  listRelatedCustomProducts: PropTypes.func.isRequired,
  listPurchaseOrders: PropTypes.func.isRequired,
  // provided by withStyles HoC
  classes: PropTypes.object.isRequired,
};

export default withStyles(deliveryListStyles)(DeliveriesList);
