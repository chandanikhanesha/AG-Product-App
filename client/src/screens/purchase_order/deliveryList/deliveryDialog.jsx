import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';
import ReactTable from 'react-table';
import axios from 'axios';
// creative tim components
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import FormControl from '@material-ui/core/FormControl';
import { sortBy } from 'lodash';
// core components
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Checkbox from '@material-ui/core/Checkbox';
import { green } from '@material-ui/core/colors';
import { getGrowerOrderDelivered, getQtyShipped, getProductName } from '../../../utilities/product.v2';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { DatePicker } from '@material-ui/pickers';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import DeliveryLotsAndDetailsCell from './deliveryLotsAndDetailsCell';
import CircularProgress from '@material-ui/core/CircularProgress';
import { uniq } from 'lodash/array';
import { deliveryListStyles } from './deliveryList.styles';
import { flatten } from 'lodash';
import WarningIcon from '@material-ui/icons/Warning';
import moment from 'moment';

import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';

class DeliveryDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      subjectName: '',
      purchaseOrder: null,
      orderDate: new Date(),
      isCreating: false,
      showManageDeliveryDialog: true,
      deliveryDetailTableData: [],
      deliveredAt: new Date(),
      deliveredBy: '',
      allDeliveryReceiptDetails: [],
      name: '',

      productList: [],
      quantity: [],
      deliveryReceiptId: '',
      fillAllData: true,
      showAllproduct: false,
      errorMessage: '',
      isBayerChecked: false,
      deliveryReceiptsAll: [],
    };
  }

  get deliveryReceiptsDetails() {
    return flatten(this.props.deliveryReceipts.map((dr) => dr.DeliveryReceiptDetails));
  }

  tableHeaders = [
    {
      Header: 'Action',
      accessor: 'checkbox',
      width: 100,
    },
    {
      Header: '',
      accessor: 'warnicon',
      width: 50,
    },
    {
      Header: 'Product Type',
      accessor: 'productType',
      width: 200,
      sortable: true,
    },
    {
      Header: 'Qty Ordered',
      accessor: 'quantityOrdered',
      width: 200,
      sortable: true,
      sortMethod: (a, b) => {
        return parseFloat(a) - parseFloat(b);
      },
    },
    {
      Header: 'Qty Delivered',
      accessor: 'quantityDelivered',
      width: 200,
      sortable: true,
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
    },

    {
      Header: 'Qty Returned',
      accessor: 'returnedQty',
      width: 200,
      headerStyle: {
        textAlign: 'left',
      },
      sortable: true,
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
    },
    {
      Header: 'Qty Remaining',
      accessor: 'quantityRemaining',
      width: 200,
      headerStyle: {
        textAlign: 'left',
      },
      sortable: true,
      sortMethod: (a, b) => {
        return parseFloat(a.props.children) - parseFloat(b.props.children);
      },
    },
  ];

  setFillAllData = (data) => {
    this.setState({ fillAllData: data });
  };
  setErrorMessage = (data) => {
    this.setState({ errorMessage: data });
  };

  componentDidMount = async () => {
    await axios
      .get(`${process.env.REACT_APP_API_BASE}/purchase_orders/purchase_order_id/delivery_receipts`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        this.setState({ deliveryReceiptsAll: response.data.items });
      })
      .catch((e) => {
        console.log('e : ', e);
      });
    await this.props.shipNoticeList(true);

    if (this.props.isEdit) {
      const customOrder = this.props.currentPurchaseOrder.CustomerProducts.map((item) => ({
        ...item,
        isSeedCompany: true,
      }))
        .sort((a, b) => a.productId - b.productId)
        .concat(
          this.props.currentPurchaseOrder.CustomerCustomProducts.sort((a, b) => a.customProductId - b.customProductId),
          this.props.currentPurchaseOrder.CustomerMonsantoProducts.map((item) => ({
            ...item,
            isMonsantoProduct: true,
          })),
        )
        .filter((item) => !item.isDeleted);
      let tableData = [];
      axios
        .get(
          `${process.env.REACT_APP_API_BASE}/purchase_orders/${this.props.currentPurchaseOrder.id}/delivery_receipts`,
          {
            headers: { 'x-access-token': localStorage.getItem('authToken') },
          },
        )
        .then((response) => {
          response &&
            response.data.items
              .filter((item) => item.id === this.props.activeTableItem)
              .map((item) => {
                item.DeliveryReceiptDetails.map((detail) => {
                  const { customerMonsantoProductId, deliveryReceiptId } = detail;
                  customOrder.filter((item) => (item.id === customerMonsantoProductId ? tableData.push(item) : null));

                  this.setState({
                    deliveryDetailTableData: uniq(tableData),

                    deliveryReceiptId: deliveryReceiptId,
                  });
                });
                this.setState({ name: item.name, deliveredBy: item.deliveredBy, deliveredAt: item.deliveredAt });
              });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  getProductNameTemplate(product) {
    const { isMonsantoProduct, isSeedCompany, CustomProduct, Product } = product;
    const msrp = isMonsantoProduct ? product.price : isSeedCompany ? Product.msrp : CustomProduct.costUnit;

    return (
      <p>
        <span>
          {isMonsantoProduct
            ? product.MonsantoProduct !== null && product.MonsantoProduct.productDetail
            : getProductName(isSeedCompany ? Product : CustomProduct)}
        </span>
        <br />
        <span>{`MSRP-  $${product.msrpEdited ? product.msrpEdited : msrp}`}</span>
      </p>
    );
  }

  getProductName(product) {
    const { isMonsantoProduct, isSeedCompany, CustomProduct, Product } = product;
    const msrp = isMonsantoProduct ? product.price : isSeedCompany ? Product.msrp : CustomProduct.costUnit;

    return isMonsantoProduct
      ? product.MonsantoProduct !== null && product.MonsantoProduct.productDetail
      : getProductName(isSeedCompany ? Product : CustomProduct);
  }

  getTableData(customerOrders) {
    const { classes, deliveryReceipts, currentPurchaseOrder } = this.props;
    const oldDeliveryReceipt = [];
    const oldReturnDeliveryReceipt = [];

    deliveryReceipts
      .filter((d) => d.isReturn == false)
      .forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldDeliveryReceipt.push(ddd)));
    deliveryReceipts
      .filter((d) => d.isReturn == true)
      .forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldReturnDeliveryReceipt.push(ddd)));

    let data = [];

    customerOrders
      // .filter((c) => (c.monsantoProductId ? c.isSent == true : !c.isSent))
      .filter((c) => (this.state.isBayerChecked ? c.hasOwnProperty('monsantoProductId') : c))
      .forEach((item, i) => {
        const { CustomProduct, MonsantoProduct, isMonsantoProduct, isSeedCompany, Product, monsantoProductId } = item;
        const productType = this.getProductNameTemplate(item);
        const productName = this.getProductName(item);
        let allLotsDelivered = oldDeliveryReceipt
          .filter((dd) =>
            isMonsantoProduct
              ? dd.monsantoProductId === monsantoProductId && dd.customerMonsantoProductId === item.id
              : isSeedCompany
              ? dd.productId === Product.id && dd.customerMonsantoProductId === item.id
              : dd.customProductId === CustomProduct.id && dd.customerMonsantoProductId === item.id,
          )
          .map((d) => parseFloat(d.amountDelivered || 0) || 0)
          .reduce((partialSum, a) => partialSum + a, 0);

        let allLotsReturned = oldReturnDeliveryReceipt
          .filter((dd) =>
            isMonsantoProduct
              ? dd.monsantoProductId === monsantoProductId && dd.customerMonsantoProductId === item.id
              : isSeedCompany
              ? dd.productId === Product.id && dd.customerMonsantoProductId === item.id
              : dd.customProductId === CustomProduct.id && dd.customerMonsantoProductId === item.id,
          )

          .map((d) => parseFloat(d.amountDelivered || 0) || 0)
          .reduce((partialSum, a) => partialSum + a, 0);

        const returnQty = allLotsReturned.length === 0 ? 0 : parseFloat(allLotsReturned);

        const remainQty = parseFloat(item.orderQty) + returnQty - parseFloat(allLotsDelivered);

        const checkboxDefaultValue =
          this.state.deliveryDetailTableData && this.state.deliveryDetailTableData.map((d) => d.id);

        data.push({
          checkbox: (
            <div>
              <Checkbox
                color="primary"
                checked={checkboxDefaultValue && checkboxDefaultValue.find((data) => data === item.id) ? true : false}
                onChange={(e) => {
                  this.setState({
                    deliveryDetailTableData: e.target.checked
                      ? [...this.state.deliveryDetailTableData, item]
                      : this.state.deliveryDetailTableData.filter((dd) => dd.id !== item.id),
                  });
                }}
              />
            </div>
          ),
          warnicon:
            item.isSent === false && item.MonsantoProduct.classification !== 'P' ? (
              <WarningIcon style={{ color: '#ff7900' }} />
            ) : (
              ''
            ),
          productType,
          quantityRemaining: <p id="remainQty">{remainQty.toFixed(2)}</p>,
          quantityOrdered: parseFloat(item.orderQty).toFixed(2),
          quantityDelivered: (
            <p id="deliverdQty">{allLotsDelivered.length === 0 ? 0 : parseFloat(allLotsDelivered).toFixed(2)}</p>
          ),
          productName: productName,
          returnedQty: Math.abs(returnQty),
        });
      });

    return {
      tableHeaders: this.tableHeaders,
      tableData: data.filter((s) => parseFloat(s.quantityOrdered) > 0),
    };
  }

  getWarehouseQuantity = (lot) => {
    return getQtyShipped({ lots: [lot] }) - getGrowerOrderDelivered({ lots: [lot] }, this.deliveryReceiptsDetails);
  };

  handleInputChange = (index, attribute, id) => (e) => {
    const value = e.target.value;
    let item = [];
    this.state.quantity.length !== 0
      ? this.state.quantity.filter((qua) =>
          qua.id === id
            ? (qua.quantity = value)
            : item.push({
                id: id,
                quantity: value,
              }),
        )
      : item.push({
          id: id,
          quantity: value,
        });
    const data = [...this.state.quantity.concat(item)];
    var result = data.reduce((unique, o) => {
      if (!unique.some((obj) => obj.id === o.id && obj.quantity === o.quantity)) {
        unique.push(o);
      }
      return unique;
    }, []);

    this.setState({
      quantity: result,
    });
    // console.log(this.state.quantity, 'quantity');
  };
  getDeliveryDetailTableData() {
    const {
      classes,
      packagings,
      seedSizes,
      isReturnChecked,
      currentPurchaseOrder,
      deliveryReceipts,
      ship_notice_list,
    } = this.props;
    const { deliveryDetailTableData, allDeliveryReceiptDetails, quantity, deliveryReceiptsAll } = this.state;
    const oldDeliveryReceipt = [];
    const oldReturnDeliveryReceipt = [];

    deliveryReceipts
      .filter((d) => d.isReturn == false)
      .forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldDeliveryReceipt.push(ddd)));
    deliveryReceipts
      .filter((d) => d.isReturn == true)
      .forEach((dd) => dd.DeliveryReceiptDetails.forEach((ddd) => oldReturnDeliveryReceipt.push(ddd)));

    let data = [];
    deliveryDetailTableData
      .filter((d) => (d.orderQty > 0 && this.state.isBayerChecked ? d.hasOwnProperty('monsantoProductId') : d))
      .map((item, i) => {
        const { isMonsantoProduct, isSeedCompany, CustomProduct, Product, id, monsantoProductId, MonsantoProduct } =
          item;

        const monsantoLotData =
          isMonsantoProduct &&
          ship_notice_list.filter(
            (l) => l.crossReferenceId == MonsantoProduct.crossReferenceId && l.isAccepted == true,
          );

        const productType = this.getProductNameTemplate(item);
        const productName = this.getProductName(item);
        const Lots =
          isMonsantoProduct && MonsantoProduct
            ? monsantoLotData
            : isSeedCompany
            ? Product.lots
            : CustomProduct.customLots;
        const productOrderQuantityInBags = item.orderQty;
        // const allLotsDelivered = Lots.reduce(
        //   (acc, detail) => acc + parseFloat(isMonsantoProduct ? detail.receivedQty : detail.quantity),
        //   0,
        // );
        let allLotsDelivered = oldDeliveryReceipt
          .filter((dd) =>
            isMonsantoProduct
              ? dd.monsantoProductId === monsantoProductId && dd.customerMonsantoProductId === item.id
              : isSeedCompany
              ? dd.productId === Product.id && dd.customerMonsantoProductId === item.id
              : dd.customProductId === CustomProduct.id && dd.customerMonsantoProductId === item.id,
          )
          .map((d) => parseFloat(d.amountDelivered || 0) || 0)
          .reduce((partialSum, a) => partialSum + a, 0);

        let allLotsReturned = oldReturnDeliveryReceipt
          .filter((dd) =>
            isMonsantoProduct
              ? dd.monsantoProductId === monsantoProductId && dd.customerMonsantoProductId === item.id
              : isSeedCompany
              ? dd.productId === Product.id && dd.customerMonsantoProductId === item.id
              : dd.customProductId === CustomProduct.id && dd.customerMonsantoProductId === item.id,
          )

          .map((d) => parseFloat(d.amountDelivered || 0) || 0)
          .reduce((partialSum, a) => partialSum + a, 0);

        const returnQty = allLotsReturned.length === 0 ? 0 : parseFloat(allLotsReturned);

        const remainQty = parseFloat(item.orderQty) + returnQty - parseFloat(allLotsDelivered);

        data.push({
          product: item,
          productType,
          qtyRemaining: remainQty.toFixed(2) || 0,

          // quantity: (
          //   <FormControl>
          //     <TextField
          //       type="number"
          //       label="Quantity"
          //       id={`quantity-${item.id}`}
          //       onChange={this.handleInputChange(i, 'quantity', item.id)}
          //     />
          //   </FormControl>
          // ),
          detail: (
            <DeliveryLotsAndDetailsCell
              lots={Lots}
              remainQty={remainQty}
              index={i}
              productName={productName}
              deliveryReceipts={this.props.deliveryReceipts}
              deliveryDetailTableData={deliveryDetailTableData}
              packagings={packagings}
              currentProduct={item}
              seedSizes={seedSizes}
              activeTableItem={this.props.activeTableItem}
              isEdit={this.props.isEdit}
              deliveryReceiptsAll={this.state.deliveryReceiptsAll}
              customerMonsantoProductId={item.id}
              setFillAllData={this.setFillAllData}
              ship_notice_list={ship_notice_list}
              setErrorMessage={this.setErrorMessage}
              deliveryReceiptId={this.state.deliveryReceiptId}
              quantityRemaining={productOrderQuantityInBags - allLotsDelivered}
              deliveryReceiptsDetails={this.deliveryReceiptsDetails}
              setallDeliveryReceiptDetails={(data) => {
                allDeliveryReceiptDetails[i] = data.map((inneritem) => ({
                  amountDelivered: Number(inneritem.quantity),
                  monsantoLotId: isMonsantoProduct
                    ? inneritem.lotId !== '-' && inneritem.lotId !== 0
                      ? inneritem.lotId
                      : null || null
                    : null,
                  lotId: isSeedCompany
                    ? inneritem.lotId !== '-' && inneritem.lotId !== 0
                      ? inneritem.lotId
                      : null
                    : null,
                  customLotId:
                    !isMonsantoProduct && !isSeedCompany
                      ? inneritem.lotId !== '-' && inneritem.lotId !== 0
                        ? inneritem.lotId
                        : null
                      : null,
                  monsantoProductId: isMonsantoProduct
                    ? MonsantoProduct !== null
                      ? MonsantoProduct.id
                      : monsantoProductId
                    : null, //monsantoProduct
                  productId: isSeedCompany ? Product.id : null, //seed Product
                  customProductId: !isMonsantoProduct && !isSeedCompany ? CustomProduct.id : null, //regularProduct
                  customerProductId: item.id,
                  customerMonsantoProductId: id,
                  deliveryDetailsId: inneritem.deliveryDetailId,
                  crossReferenceId: isMonsantoProduct && MonsantoProduct !== null && MonsantoProduct.crossReferenceId,
                }));
              }}
            />
          ),
          productName: productName,
        });
      });

    return {
      deliveryDetailTableData: data,
      DeliveryDetailTableHeaders: [
        {
          Header: 'Product Type',
          accessor: 'productType',
          width: 300,
        },
        {
          Header: 'Details',
          accessor: 'detail',
          width: 500,
          headerStyle: {
            textAlign: 'left',
          },
        },
        // {
        //   Header: 'Quantity',
        //   accessor: 'quantity',
        //   width: 300,
        //   show: this.state.isReturnChecked !== false ? true : false,
        // },
        {
          Header: 'Qty Remaining',
          accessor: 'qtyRemaining',
          width: 200,
          headerStyle: {
            textAlign: 'left',
          },
        },
      ],
    };
  }
  onUpdate = async () => {
    const { currentPurchaseOrder, onClose, refreshList } = this.props;
    const deliveryID = this.props.activeTableItem;
    const {
      deliveredBy,
      deliveredAt,
      allDeliveryReceiptDetails,
      name,
      deliveryDetailTableData,
      quantity,
      isReturnChecked,
    } = this.state;

    const { linkRelatedMonsantoProduct } = this.props;

    const updatedDeliveries = allDeliveryReceiptDetails.flat();

    this.setState({ isCreating: true });
    await this.props
      .updateDeliveryReceipt(currentPurchaseOrder.id, deliveryID, {
        deliveryID,
        deliveredBy,
        deliveredAt,
        name,
        updatedDeliveries,
      })
      .then((res) => {
        onClose();
        this.setState({ isCreating: false });
        refreshList();
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  onSave = async () => {
    try {
      const { currentPurchaseOrder, onClose, refreshList } = this.props;
      const { deliveredBy, deliveredAt, allDeliveryReceiptDetails, name, deliveryDetailTableData, quantity } =
        this.state;
      const { createAllReturnProduct } = this.props;

      const updatedDeliveries = allDeliveryReceiptDetails.flat();
      let isReturnChecked = this.props.isReturnIndex ? true : false;
      this.props.isReturnIndex &&
        deliveryDetailTableData &&
        deliveryDetailTableData.map((item) => {
          updatedDeliveries
            .filter((qua) => qua.customerProductId === item.id && qua.amountDelivered > 0)
            .map(async (value, i) => {
              const data = {
                purchaseOrderId: currentPurchaseOrder.id,
                customerId: this.props.match.params.customer_id,
                farmId: item.farmId ? item.farmId : null,
                productId: item.productId || null,
                monsantoProductId: item.monsantoProductId || null,
                orderQty: value.amountDelivered || 0,
                customProductId: item.customProductId || null,
                unit: item.unit,
                msrpEdited: item.msrpEdited,
                customerProductId: item.id,
                discounts: item.discounts || [],
                orderDate: new Date(),
                price: item.price,
                comment: null,
                fieldName: null,
                isSent: null,
              };

              await createAllReturnProduct(data);
            });
        });

      this.setState({ isCreating: true });

      const bayerDeliveries = updatedDeliveries.filter(
        (item) => item.monsantoProductId !== null && parseFloat(item.amountDelivered) > 0,
      );
      const nonBayerDeliveries = updatedDeliveries.filter(
        (item) => item.monsantoProductId === null && parseFloat(item.amountDelivered) > 0,
      );

      bayerDeliveries.length > 0 &&
        this.props
          .createDeliveryReceipt(currentPurchaseOrder.id, isReturnChecked, {
            deliveredBy,
            deliveredAt,
            updatedDeliveries: bayerDeliveries,
            name,
          })
          .then(() => {
            onClose(true, 'DeliveryRecepit created succesfully !!');
            this.setState({ isCreating: false });
            refreshList();
          })
          .catch((error) => {
            onClose(false, error.response.data ? error.response.data.error : error);
            this.setState({ isCreating: false });
            refreshList();
          });
      nonBayerDeliveries.length > 0 &&
        this.props
          .createDeliveryReceipt(currentPurchaseOrder.id, isReturnChecked, {
            deliveredBy,
            deliveredAt,
            updatedDeliveries: nonBayerDeliveries,
            name,
          })
          .then(() => {
            onClose(true, 'DeliveryRecepit created succesfully !!');
            this.setState({ isCreating: false });
            refreshList();
          })
          .catch((error) => {
            onClose(false, error.response.data ? error.response.data.error : error);
            this.setState({ isCreating: false });
            refreshList();
          });
    } catch (error) {
      console.log(' deliveries', error);
    }
  };

  render() {
    const {
      deliveredBy,
      deliveredAt,
      isCreating,
      name,
      // isReturnChecked,
      productList,
      fillAllData,
      errorMessage,
      allDeliveryReceiptDetails,
    } = this.state;
    const { classes, currentPurchaseOrder, onClose, isOpen, selectedMenuTabIndex } = this.props;
    let customerOrders = currentPurchaseOrder.CustomerProducts.map((item) => ({ ...item, isSeedCompany: true }))
      .sort((a, b) => a.productId - b.productId)
      .concat(
        currentPurchaseOrder.CustomerCustomProducts.sort((a, b) => a.customProductId - b.customProductId),
        currentPurchaseOrder.CustomerMonsantoProducts.map((item) => ({ ...item, isMonsantoProduct: true })),
      )
      .filter((item) => !item.isDeleted);

    const { tableData, tableHeaders } = this.getTableData(customerOrders);
    const { deliveryDetailTableData, DeliveryDetailTableHeaders } = this.getDeliveryDetailTableData();
    let isbayerproduct;
    deliveryDetailTableData.map((item) => {
      if (item.product.monsantoProductId) {
        isbayerproduct = true;
      } else {
        isbayerproduct = true;
      }
    });

    return (
      <Dialog open={isOpen} maxWidth="xl" onClose={onClose}>
        <DialogTitle>
          <Typography variant="h6">Grower Delivery/Return Manage</Typography>
          <IconButton className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className={classes.contentContainer}>
          <Accordion preExpanded={!this.props.isEdit ? ['a'] : ['b']}>
            <AccordionItem uuid="a">
              <AccordionItemHeading>
                <AccordionItemButton>Select Products for Delivery</AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel>
                <FormControl style={{ display: 'block' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        id="selectAll"
                        color="primary"
                        onChange={(e) => {
                          this.setState({
                            deliveryDetailTableData: e.target.checked
                              ? customerOrders.filter((c) => c.orderQty > 0) //.filter((c) => (c.monsantoProductId ? c.isSent == true : !c.isSent))
                              : [],
                          });
                        }}
                      />
                    }
                    label="Select All"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={this.state.isBayerChecked}
                        onChange={(e) => {
                          this.setState({
                            isBayerChecked: e.target.checked,
                          });
                        }}
                      />
                    }
                    label="Show Bayer Product"
                  />
                </FormControl>

                <ReactTable
                  data={sortBy(tableData, (o) => o && o.productName)}
                  columns={tableHeaders}
                  minRows={1}
                  showPagination={false}
                  defaultPageSize={500}
                />
              </AccordionItemPanel>
            </AccordionItem>

            <AccordionItem uuid="b">
              <AccordionItemHeading>
                <AccordionItemButton>Grower Delivery Detail</AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel>
                <div style={{ display: 'flex', marginBottom: '12px' }}>
                  {/* {selectedMenuTabIndex === 3 && (
                    <FormControl className={classes.deliveredByFormControl}>
                      <FormControlLabel
                        style={{ marginTop: '15px' }}
                        control={
                          <Checkbox
                            disabled={this.props.isEdit || !isbayerproduct ? true : false}
                            checked={isReturnChecked}
                            value={isReturnChecked}
                            onChange={(event) => this.setState({ isReturnChecked: event.target.checked })}
                            color="primary"
                          />
                        }
                        label="Return"
                      />
                    </FormControl>
                  )} */}
                  <FormControl className={classes.deliveredByFormControl}>
                    <TextField
                      type="text"
                      label="Event Note"
                      value={name}
                      style={{ width: '225px' }}
                      onChange={(event) => this.setState({ name: event.target.value })}
                    />
                  </FormControl>
                  <FormControl className={classes.deliveredAtFormControl}>
                    <TextField
                      type="text"
                      label="Delivered By"
                      value={deliveredBy}
                      onChange={(event) => this.setState({ deliveredBy: event.target.value })}
                    />
                  </FormControl>

                  <FormControl className={classes.deliveredAtFormControl}>
                    <DatePicker
                      label="Delivered At"
                      ref={(ref) => (this.invoiceCurrentDatePicker = ref)}
                      leftArrowIcon={<NavigateBefore />}
                      rightArrowIcon={<NavigateNext />}
                      value={moment.utc(deliveredAt)}
                      format="MM/DD/YYYY"
                      disablePast={false}
                      onChange={(date) =>
                        this.setState({ deliveredAt: moment.utc(date).format('YYYY-MM-DD') + 'T00:00:00.000Z' })
                      }
                    />
                  </FormControl>
                </div>
                <ReactTable
                  // data={sorBy(deliveryDetailTableData, (o) => o && o.productName)}
                  data={deliveryDetailTableData}
                  columns={DeliveryDetailTableHeaders}
                  minRows={1}
                  showPagination={false}
                  defaultPageSize={500}
                  getTheadTrProps={() => {
                    const style = {
                      color: '#757575',
                      fontSize: '20px',
                    };

                    return { style };
                  }}
                  getTrProps={() => {
                    const style = {
                      borderBottom: '1px solid #9e9e9e54',
                    };

                    return { style };
                  }}
                />
              </AccordionItemPanel>
            </AccordionItem>
          </Accordion>
        </DialogContent>
        <DialogActions className={classes.dialogAction}>
          <Button className={`${classes.CTABar} hide-print`} color="info" onClick={onClose}>
            Cancel
          </Button>

          <div style={{ position: 'relative' }}>
            <Button
              id="submitDelivery"
              className={`${classes.CTABar} hide-print`}
              onClick={this.props.isEdit ? this.onUpdate : this.onSave}
              disabled={
                this.props.isEdit || this.props.isReturnIndex
                  ? false
                  : isbayerproduct || isCreating
                  ? fillAllData
                  : true
              }
              color="primary"
              variant="contained"
              style={{ backgroundColor: isCreating ? '#999999' : '#38a154' }}
            >
              {this.props.isEdit ? 'Edit' : 'Done'}
            </Button>

            {isCreating && (
              <CircularProgress
                size={24}
                style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -12, marginLeft: -12 }}
              />
            )}
          </div>
        </DialogActions>
        <a className={classes.returnText}>
          {this.props.isReturnIndex ? 'This will reduce the Growers product order by that quantity' : null}
        </a>
        <a className={classes.returnText}>{errorMessage}</a>
      </Dialog>
    );
  }
}

export default withStyles(deliveryListStyles)(DeliveryDialog);
