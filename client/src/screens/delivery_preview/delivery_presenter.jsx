import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import PropTypes from 'prop-types';
import moment from 'moment';
import ReactTable from 'react-table';
import DeliveryListPreviewHeader from './delivery_header';

import { delivery_preview_Styles } from './delivery_preview_styles';
import { getProductName } from '../../utilities/product.v2';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Print from '@material-ui/icons/Print';
import Button from '../../components/material-dashboard/CustomButtons/Button';
// import CustomEarlyPayTable from '../../invoice/custom_early_pay_table';
import PrintHelper from '../inventory_preview/print_helper/index';
import MailOutlineIcon from '@material-ui/icons/MailOutline';

import SendEmailDialog from '../invoice_preview/send_email_dialog';

class DeliveryListPreviewPresenter extends Component {
  state = {
    showPaymentDialog: false,
    editingPayment: null,

    selectedShareholder: '',
    selectedMenuTabIndex: 0,
    selectedMenuTabIndex: 1,
    printHelperUpdateFlag: new Date(),
    grandTotal: '$0.00',
    orderWholeDiscountsAmount: 0,
    selectedFontSize: '',
    SendEmailDialogState: false,
  };

  setselectedFontSize = (e) => {
    const selectedFontSize = e.target.value;
    this.setState({ selectedFontSize });
  };

  print = async () => {
    this.setState({ isPrinting: true });
    const { purchaseOrder, customer } = this.props;
    setTimeout(() => {
      const tempTitle = document.title;
      document.title = 'Delivery Invoice';
      window.print();
      document.title = tempTitle;
      this.setState({ isPrinting: false });
    }, 500);
  };

  handleClickOpen = () => {
    this.setState({ SendEmailDialogState: true });
  };

  handleClose = () => {
    this.setState({ SendEmailDialogState: false });
  };

  updateGrandTotal = (val) => {
    if (this.state.grandTotal !== val) this.setState({ grandTotal: val });
  };

  updateOrderWholeDiscountsAmount = (val) => {
    if (this.state.orderWholeDiscountsAmount !== val) this.setState({ orderWholeDiscountsAmount: val });
  };

  getDeliveryReceiptDetailsData = (DeliveryReceiptDetails) => {
    const { currentPurchaseOrder, purchaseOrders } = this.props;

    const currentPo =
      currentPurchaseOrder !== undefined
        ? currentPurchaseOrder
        : purchaseOrders.find((d) => d.id == this.props.match.params.purchase_order);

    const data = DeliveryReceiptDetails.map((item) => {
      const currentOrder =
        item.monsantoProductId !== null
          ? currentPo.CustomerMonsantoProducts
          : item.customProductId !== null
          ? currentPo.CustomerCustomProducts
          : currentPo.CustomerProducts;

      const currentDetail = currentOrder.find((f) => f.id === item.customerMonsantoProductId);
      const { amountDelivered, monsantoLotId, MonsantoLot, Lot, CustomLot } = item;

      if (item.length !== 0 && currentDetail !== undefined) {
        return {
          productDetail: currentDetail.hasOwnProperty('monsantoProductId')
            ? currentDetail.MonsantoProduct.productDetail
            : currentDetail.hasOwnProperty('CustomProduct')
            ? `${currentDetail.CustomProduct.name} / ${currentDetail.CustomProduct.type} / ${currentDetail.CustomProduct.description}`
            : `${currentDetail.Product.blend} / ${currentDetail.Product.brand} / ${currentDetail.Product.treatment}`,

          lotNumber: monsantoLotId
            ? MonsantoLot == null
              ? '-'
              : MonsantoLot.lotNumber
            : CustomLot
            ? CustomLot == null
              ? '-'
              : CustomLot.lotNumber
            : Lot == null
            ? '-'
            : Lot.lotNumber,
          amountDelivered,
          remainQty: currentDetail.orderQty - amountDelivered || 0,
          poQty: currentDetail.orderQty || 0,
        };
      }
    });
    // console.log(data, 'data');

    return data;
  };

  render() {
    const {
      purchaseOrders,
      customers,
      shareholders,
      organization,
      paramsData,
      classes,
      farms,
      customerMonsantoProduct,
      currentPurchaseOrder,
      location,
      deliveryReceipts,
    } = this.props;
    const { SendEmailDialogState } = this.state;

    const isReturn = location.state ? location.state.isReturn : false;
    const activeTableItem = location.state ? location.state.activeTableItem : undefined;

    const cpID = localStorage.getItem('currentPurchaseOrderId');
    return (
      <div>
        <div key={this.state.printHelperUpdateFlag}>
          <PrintHelper />
        </div>
        <Button className={`${classes.printButton} hide-print`} onClick={this.print} color="info">
          <Print />
        </Button>
        {/* <Button className={`${classes.mailButton} hide-print`} onClick={this.handleClickOpen} color="info">
          <MailOutlineIcon />
        </Button> */}
        {/*
        <Select
          displayEmpty
          className={'hide-print'}
          style={{ position: 'absolute', left: 30, top: 100 }}
          value={this.state.selectedFontSize || ''}
          onChange={this.setselectedFontSize}
        >
          <MenuItem value={''}>Select FontSize</MenuItem>
          <MenuItem value={'0.8rem'}>0.8 rem</MenuItem>
          <MenuItem value={'0.9rem'}>0.9 rem</MenuItem>
</Select>*/}
        <div className={classes.printContainer} style={{ marginTop: '40px' }}>
          <div className={classes.content}>
            <DeliveryListPreviewHeader
              organization={organization}
              purchaseOrder={purchaseOrders}
              customers={customers}
              paramsData={paramsData}
            />
            <div>
              {(activeTableItem !== undefined
                ? deliveryReceipts &&
                  deliveryReceipts.filter(
                    (item) => item.purchaseOrderId === parseInt(cpID) && item.id == activeTableItem,
                  )
                : deliveryReceipts.filter(
                    (item) => String(item.isReturn) == isReturn && item.purchaseOrderId === parseInt(cpID),
                  )
              ).map((item) => {
                return (
                  <div
                    style={{ fontSize: this.state.selectedFontSize, marginTop: '50px' }}
                    className="invoice-table-wrapper"
                  >
                    <div className={classes.delivery_list_note}>
                      {moment.utc(item.deliveredAt).format('MMMM DD, YYYY') || ''} - {item.name || ''} -{' '}
                      {item.deliveredBy || ''}
                      {item.isReturn ? '(Returned)' : ''}
                    </div>
                    <div>
                      <ReactTable
                        sortable={false}
                        showPagination={false}
                        resizable={false}
                        minRows={1}
                        columns={[
                          {
                            Header: 'Product Detail',
                            accessor: 'productDetail',
                          },
                          {
                            Header: 'Lot Number',
                            accessor: 'lotNumber',
                          },
                          {
                            Header: 'Delivered Qty',
                            accessor: 'amountDelivered',
                            headerStyle: {
                              textAlign: 'left',
                            },
                          },
                          {
                            Header: 'Remaining Qty',
                            accessor: 'remainQty',
                            headerStyle: {
                              textAlign: 'left',
                            },
                          },
                          {
                            Header: 'PurchaseOrder Qty',
                            accessor: 'poQty',
                            headerStyle: {
                              textAlign: 'left',
                            },
                          },
                        ]}
                        data={this.getDeliveryReceiptDetailsData(item.DeliveryReceiptDetails)}
                        className={`${classes.summaryTable} no-white-space`}
                        getTheadTrProps={() => {
                          return {
                            style: {
                              color: '#3C4858',
                              background: '#CDDFC8',
                              fontWeight: 'bold',
                            },
                          };
                        }}
                        getTrProps={() => {
                          let style = { fontSize: this.state.selectedFontSize };

                          style = {
                            ...style,
                            color: 'black',
                            fontWeight: 'bold',
                          };

                          return {
                            style,
                          };
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <SendEmailDialog
              open={SendEmailDialogState}
              onClose={this.handleClose}
              organization={organization}
              purchaseOrder={purchaseOrders}
              customer={customers}
            />
            {/* <div id="pageFooter">PO #${currentPurchaseOrder.id}</div> */}
          </div>
        </div>
      </div>
    );
  }
}

export default withStyles(delivery_preview_Styles)(DeliveryListPreviewPresenter);
