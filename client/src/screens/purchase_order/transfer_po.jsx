import React, { Component, Fragment } from 'react';
import { Dialog, TextField } from '@material-ui/core';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import CreatePurchaseOrderDialog from './create_dialog';
import { transferWays } from '../../utilities/monsanto_product';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { transferPo } from '../../store/actions';
class TransferPo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transferWays: transferWays,
      toCustomerDetails: {},
      showCreatePurchaseOrderDialog: false,
      creatingPurchaseOrderCustomerId: null,
      creatingPurchaseOrderIsQuote: false,
      selectedPurchaseOrders: [],
      messageForSnackBar: '',
      showTransferPoSuccessSnackbar: false,
    };
  }

  handeleTransferInfoChange = (name) => (event) => {
    const { monsantoProductReduceTransferInfo, customers } = this.props;

    if (name === 'customerId' || name === 'purchaseOrderId') {
      if (name === 'customerId') {
        const purchaseOrders = customers.find((customer) => customer.id === event.target.value).PurchaseOrders;
        const currentcustomer = customers.find((customer) => customer.id === event.target.value);
        if (name == 'customerId') {
          this.setToCustomerDetails({ name: currentcustomer.name });
        }
        this.setState({ selectedPurchaseOrders: [...purchaseOrders] });
      }
      if (name == 'purchaseOrderId') {
        this.setToCustomerDetails({
          purchaseOrderId: event.target.value,
        });
      }
      if (name === 'customerId') {
        this.props.setMonsantoProductReduceInfo({
          ...monsantoProductReduceTransferInfo,
          growerInfo: {
            customerId: event.target.value,
            purchaseOrderId: null,
          },
        });
      }
      this.props.setMonsantoProductReduceInfo({
        ...monsantoProductReduceTransferInfo,
        growerInfo: {
          ...monsantoProductReduceTransferInfo.growerInfo,
          [name]: event.target.value,
        },
      });
      return;
    }
    if (event.target.value === 'toHolding') {
      const purchaseOrders = customers.find((customer) => customer.name === 'Bayer Dealer Bucket').PurchaseOrders;
      const currentcustomer = customers.find((customer) => customer.name === 'Bayer Dealer Bucket');

      this.setToCustomerDetails({ name: currentcustomer.name });

      this.setState({ selectedPurchaseOrders: [...purchaseOrders] });
      this.props.setMonsantoProductReduceInfo({
        ...monsantoProductReduceTransferInfo,
        growerInfo: {
          customerId: currentcustomer.id,
        },
        transferWay: 'toHolding',
      });
      return;
    }
    this.props.setMonsantoProductReduceInfo({
      ...monsantoProductReduceTransferInfo,
      growerInfo: {
        ...monsantoProductReduceTransferInfo.growerInfo,
        customerId: null,
      },
      [name]: event.target.value,
    });
  };

  setToCustomerDetails = (data) => {
    this.setState({
      toCustomerDetails: { ...this.state.toCustomerDetails, ...data },
    });
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

  handleCreatePurchaseOrderDialogOpen =
    (customerId, isQuote = false) =>
    () => {
      this.setState({
        showCreatePurchaseOrderDialog: true,
        creatingPurchaseOrderCustomerId: customerId,
        creatingPurchaseOrderIsQuote: isQuote,
      });
    };

  newCreatedPurchaseOrder = (poid) => {
    this.setState({ selectedPurchaseOrders: this.state.selectedPurchaseOrders.concat([poid]) });
  };

  handleCreatePurchaseOrderDialogClose = () => {
    this.setState({
      showCreatePurchaseOrderDialog: false,
      creatingPurchaseOrderCustomerId: null,
    });
  };
  reload = (toCustomerId, toPurchaseOrderId) => {
    if (this.props.customers.find((c) => c.name === 'Bayer Dealer Bucket' && c.id == toCustomerId)) {
      this.props.history.push(`/app/dealers/${toCustomerId}/purchase_order/${toPurchaseOrderId}`);
    } else {
      this.props.history.push(`/app/customers/${toCustomerId}/purchase_order/${toPurchaseOrderId}`);
    }
    window.location.reload();
  };

  onSubmitTransferPo = async (monsantoProductReduceTransferInfo) => {
    const { customers, purchaseOrder, transferPo, onClose } = this.props;
    if (
      monsantoProductReduceTransferInfo.transferWay === 'toGrower' ||
      monsantoProductReduceTransferInfo.transferWay === 'toHolding'
    ) {
      const toPurchaseOrderId = monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId;
      const toCustomerId = monsantoProductReduceTransferInfo.growerInfo.customerId;
      const data = {
        fromPurchaseOrderId: purchaseOrder.id,
        fromCustomerId: purchaseOrder.customerId,
        toPurchaseOrderId: monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId,
        toCustomerId: monsantoProductReduceTransferInfo.growerInfo.customerId,
        organizationId: purchaseOrder.organizationId,
      };
      // await transferPo(data);
      // this.reload();
      transferPo(data)
        .then((response) => {
          this.reload(toCustomerId, toPurchaseOrderId);
          setTimeout(() => {
            this.setState({
              showTransferPoSuccessSnackbar: true,
              messageForSnackBar: response || 'Successfully transfered!',
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
            });
          }, 4000);
        })
        .catch((err) => {
          this.reload(toCustomerId, toPurchaseOrderId);
          setTimeout(() => {
            this.setState({
              showTransferPoSuccessSnackbar: true,
              messageForSnackBar: 'Something went wrong while transfering purchase order!',
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
            });
          }, 4000);
        });
    }
  };
  render() {
    const { open, onClose, customers, purchaseOrder, monsantoProductReduceTransferInfo, setMonsantoProductReduceInfo } =
      this.props;
    const {
      selectedPurchaseOrders,
      toCustomerDetails,
      showCreatePurchaseOrderDialog,
      creatingPurchaseOrderCustomerId,
      creatingPurchaseOrderIsQuote,
    } = this.state;
    const { Customer } = purchaseOrder;
    const currentCustomerid = purchaseOrder.customerId;
    return (
      <Dialog open={open} onClose={onClose}>
        <div style={{ minWidth: '400px', minHeight: '200px' }}>
          <div style={{ padding: '10px 50px', marginTop: '20px' }}>
            <Fragment>
              <div style={{ marginLeft: '40px' }}>
                <Select
                  value={monsantoProductReduceTransferInfo.transferWay}
                  onChange={this.handeleTransferInfoChange('transferWay')}
                  style={{ width: '200px' }}
                  inputProps={{
                    // className: classes.packagingSelect,
                    required: true,
                    name: 'Transfer Way',
                    id: 'transferWay',
                  }}
                >
                  {transferWays
                    .filter((way) => {
                      if (Customer.name === 'Bayer Dealer Bucket' && way.id === 'toHolding') {
                        return false;
                      } else if (way.id === 'toMonsanto') {
                        return false;
                      } else {
                        return true;
                      }
                    })
                    .map((way) => (
                      <MenuItem value={way.id} key={way.id}>
                        {way.value}
                      </MenuItem>
                    ))}
                </Select>
              </div>
              {monsantoProductReduceTransferInfo.transferWay === 'toGrower' && (
                <Fragment>
                  <div style={{ marginLeft: '40px' }}>
                    <Select
                      value={monsantoProductReduceTransferInfo.growerInfo.customerId}
                      onChange={this.handeleTransferInfoChange('customerId')}
                      style={{ width: '200px' }}
                      inputProps={{
                        // className: classes.packagingSelect,
                        required: true,
                        name: 'Customer',
                        id: 'customer',
                      }}
                    >
                      {customers.length > 0 &&
                        customers
                          .filter((customer) => {
                            if (customer.name !== 'Bayer Dealer Bucket') {
                              if (customer.id == currentCustomerid) {
                                if (customer.PurchaseOrders.length > 1) {
                                  return true;
                                } else {
                                  return false;
                                }
                              } else {
                                return true;
                              }
                            } else {
                              return false;
                            }
                          })
                          .map((customer) => (
                            <MenuItem value={customer.id} key={customer.id}>
                              {customer.name}
                            </MenuItem>
                          ))}
                    </Select>
                  </div>
                  {/* {monsantoProductReduceTransferInfo.growerInfo.customerId && selectedPurchaseOrders.length == 0 && ( */}
                  {monsantoProductReduceTransferInfo.growerInfo.customerId && (
                    <Button
                      simple={true}
                      color="primary"
                      // className={`${classes.createPO} hide-print`}
                      onClick={this.handleCreatePurchaseOrderDialogOpen(
                        monsantoProductReduceTransferInfo.growerInfo.customerId,
                        false,
                      )}
                      style={{ marginLeft: '33px', marginTop: '15px' }}
                      // disabled={isPending(customer)}
                    >
                      New Purchase Order
                    </Button>
                  )}
                  {monsantoProductReduceTransferInfo.growerInfo.customerId && selectedPurchaseOrders.length > 0 && (
                    <div style={{ marginLeft: '40px' }}>
                      <Select
                        value={monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId}
                        onChange={this.handeleTransferInfoChange('purchaseOrderId')}
                        style={{ width: '200px' }}
                        inputProps={{
                          // className: classes.packagingSelect,
                          required: true,
                          name: 'Purchase Order',
                          id: 'purchaseOrder',
                        }}
                      >
                        {selectedPurchaseOrders.length > 0 &&
                          selectedPurchaseOrders
                            .filter((po) => po.isSimple && !po.isQuote && po.id !== purchaseOrder.id)
                            .map((purchaseOrder) => (
                              <MenuItem value={purchaseOrder.id} key={purchaseOrder.id}>
                                #{purchaseOrder.id} - {purchaseOrder.name}
                              </MenuItem>
                            ))}
                      </Select>
                    </div>
                  )}
                </Fragment>
              )}
              {monsantoProductReduceTransferInfo.transferWay === 'toHolding' && (
                <Fragment>
                  {monsantoProductReduceTransferInfo.growerInfo.customerId && (
                    <div style={{ marginLeft: '40px' }}>
                      <Select
                        value={monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId}
                        onChange={this.handeleTransferInfoChange('purchaseOrderId')}
                        style={{ width: '200px' }}
                        inputProps={{
                          // className: classes.packagingSelect,
                          required: true,
                          name: 'Purchase Order',
                          id: 'purchaseOrder',
                        }}
                      >
                        {customers.find((customer) => customer.name === 'Bayer Dealer Bucket').PurchaseOrders.length >
                          0 &&
                          customers
                            .find((customer) => customer.name === 'Bayer Dealer Bucket')
                            .PurchaseOrders.filter((po) => po.isSimple && !po.isQuote)
                            .map((purchaseOrder) => (
                              <MenuItem value={purchaseOrder.id} key={purchaseOrder.id}>
                                #{purchaseOrder.id} - {purchaseOrder.name}
                              </MenuItem>
                            ))}
                      </Select>
                    </div>
                  )}
                </Fragment>
              )}
            </Fragment>
          </div>
          <div style={{ marginTop: '80px', marginLeft: '85px', marginBottom: '20px' }}>
            <Button
              onClick={() => {
                this.onSubmitTransferPo(monsantoProductReduceTransferInfo);
              }}
              style={{ background: '#4CAF50' }}
            >
              Transfer
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
        {creatingPurchaseOrderCustomerId && (
          <CreatePurchaseOrderDialog
            customerId={creatingPurchaseOrderCustomerId}
            open={showCreatePurchaseOrderDialog}
            onClose={this.handleCreatePurchaseOrderDialogClose}
            isQuote={creatingPurchaseOrderIsQuote}
            fromPurchaseOrder={true}
            newCreatedPurchaseOrder={this.newCreatedPurchaseOrder}
          />
        )}
      </Dialog>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      transferPo,
    },
    dispatch,
  );

export default connect(null, mapDispatchToProps)(TransferPo);
