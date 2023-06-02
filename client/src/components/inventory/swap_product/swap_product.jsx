import React, { Component } from 'react';
import ReactTable from 'react-table';
import CheckBox from '@material-ui/core/Checkbox';
import Snackbar from '@material-ui/core/Snackbar';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';
import moment from 'moment';

import { getCustomerProducts } from '../../../utilities/product';
import { DatePicker } from '@material-ui/pickers';
import { withStyles, Checkbox, FormControlLabel } from '@material-ui/core';

import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Grow from '@material-ui/core/Grow';
import Select from '@material-ui/core/Select';

import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import { productDialogStyles } from '../../../screens/purchase_order/product_dialog/product_dialog.styles-v2';
import ProductSelector from '../../../screens/purchase_order/product_selector';
import axios from 'axios';
let isDisabledCheckBtn = true;

class swap_product extends Component {
  state = {
    selectedProductRelatedPurchaseOrders: [],
    checkPoId: [],
    isLoading: true,
    showProductForm: false,
    productsToOrder: [],
    purchaseOrdersData: [],
    dealerCompanyId: '',
    selectedProductId: '',
    showSnackbarText: '-',
    errormsgs: [],
    swapType: 'Bayer',
    productForCheckAvailability: [],
    productAvailability: [],
    isLoadingAvailability: false,
    monsantoProductReduceTransferInfo: {
      transferWay: 'toHolding',
      reduceQuantity: 0,
      growerInfo: {
        customerId: this.props.customers.find((customer) => customer.name === 'Bayer Dealer Bucket')
          ? this.props.customers.find((customer) => customer.name === 'Bayer Dealer Bucket').id
          : '',
        purchaseOrderId: this.props.customers.find((customer) => customer.name === 'Bayer Dealer Bucket')
          ? this.props.customers.find((customer) => customer.name === 'Bayer Dealer Bucket').PurchaseOrders.length <= 1
            ? this.props.customers.find((customer) => customer.name === 'Bayer Dealer Bucket').PurchaseOrders.id
            : ''
          : '',
      },
    },
  };
  columns = [
    {
      Header: 'Purchase Order / Quote',
      id: 'purchaseOrder',
      accessor: (d) => d,
      Cell: (props) => {
        const { purchaseOrder, customer } = props.value;

        return (
          <div>
            <span>
              <CheckBox
                id="selectPOforsync"
                color="primary"
                checked={this.state.checkPoId.includes(purchaseOrder.id) ? true : false}
                onChange={async (e) => {
                  if (e.target.checked) {
                    this.setState({ checkPoId: [...this.state.checkPoId, purchaseOrder.id] });
                  } else {
                    this.setState({ checkPoId: this.state.checkPoId.filter((d) => d !== purchaseOrder.id) });
                  }
                }}
              />
            </span>
            {purchaseOrder.isQuote ? 'Quote' : 'PO'}#{purchaseOrder.id}-{purchaseOrder.name}
          </div>
        );
      },
    },

    {
      Header: 'Customer',
      id: 'customer',
      accessor: (d) => d,
      Cell: (props) => {
        return props.value.customer.name;
      },
    },

    {
      Header: 'Quantity',
      id: 'quantity',
      accessor: (d) => d,
      headerStyle: { textAlign: 'left' },
      Cell: (props) => {
        return parseFloat(props.value.quantity).toFixed(2);
      },
    },
    {
      Header: 'Status',
      id: 'status',
      accessor: (d) => d,
      headerStyle: { textAlign: 'left' },
      Cell: (props) => {
        const { purchaseOrder } = props.value;

        return (
          this.state.errormsgs.length > 0 &&
          this.state.errormsgs.filter((e) => e.pid == purchaseOrder.id).length > 0 &&
          this.state.errormsgs.filter((e) => e.pid == purchaseOrder.id)[0].msg
        );
      },
    },
    {
      Header: 'ProductAvailability',
      id: 'status',
      accessor: (d) => d,
      headerStyle: { textAlign: 'left' },
      Cell: (props) => {
        const { purchaseOrder } = props.value;

        return (
          this.state.errormsgs.length > 0 &&
          this.state.errormsgs.filter((e) => e.pid == purchaseOrder.id).length > 0 &&
          this.state.errormsgs.filter((e) => e.pid == purchaseOrder.id)[0].productAvailability
        );
      },
    },
  ];
  mapObj = {
    C: 'CORN',
    B: 'SOYBEAN',
    S: 'SORGHUM',
    // A: 'ALFALFA',
    L: 'CANOLA',
    P: 'PACKAGING',
  };
  componentDidMount = async () => {
    await this.props.listCustomers();

    await this.props.listDeliveryReceipts();

    await this.props.listMonsantoProducts();
    await this.setValueToState();
  };

  setValueToState = async () => {
    const params = this.props.match.params;
    const companyType = 'Api Seed Company';
    const dealerCompanyId = params.seedId;
    const selectedProductId = parseInt(params.id);
    const selectedProductcrossRefId = params.crossRefId;

    const id = selectedProductcrossRefId == '000' ? selectedProductId : selectedProductcrossRefId;

    const productRelatedPurchaseOrders = getCustomerProducts(
      this.props.customers,
      companyType,
      parseInt(dealerCompanyId),
      this.props.deliveryReceipts,
      selectedProductcrossRefId == '000' ? false : true,
    );

    const purchaseOrdersData =
      productRelatedPurchaseOrders &&
      productRelatedPurchaseOrders[id] &&
      productRelatedPurchaseOrders[id]
        .filter((product) => product.purchaseOrder.isQuote == false)
        .sort((a, b) => a.purchaseOrder.id - b.purchaseOrder.id);

    this.setState({
      purchaseOrdersData: purchaseOrdersData || [],
      selectedProductId: selectedProductId,
      dealerCompanyId: dealerCompanyId,
    });
  };
  setMonsantoProductReduceInfo = (monsantoProductReduceTransferInfo) => {
    this.setState({ monsantoProductReduceTransferInfo });
  };
  updateProduct = async () => {
    const { customers, checkinOrderProductAvailability, linkRelatedMonsantoProduct } = this.props;
    const {
      checkPoId,
      purchaseOrdersData,
      productsToOrder,
      selectedProductId,
      swapType,
      monsantoProductReduceTransferInfo,
    } = this.state;

    try {
      const { monsantoProducts, editCustomerMonsantoProduct } = this.props;
      // const editingProduct =
      //   (monsantoProducts.length > 0 && monsantoProducts.filter((f) => f.id == selectedProductId)) || [];
      const errormsgs = [];
      new Promise((resolve, reject) => {
        purchaseOrdersData
          .filter((p) => checkPoId.includes(p.purchaseOrderId))
          .map(async (d, i) => {
            const selectedProduct =
              (productsToOrder[0].length > 0
                ? productsToOrder[0].filter((p) => d.zoneId.includes(Array.isArray(p.zoneId) ? p.zoneId[0] : p.zoneId))
                : productsToOrder[0]) || productsToOrder[0];

            let data = {
              comment: '',
              monsantoProductId: selectedProduct.length >= 1 ? selectedProduct[0].id : selectedProduct.id,
              orderDate: new Date(),
              packagingId: '',
              orderQty: d.quantity,
              productId: selectedProduct.length >= 1 ? selectedProduct[0].id : selectedProduct.id,
              seedSizeId: '',
            };

            if (swapType !== 'Bayer') {
              await linkRelatedMonsantoProduct(
                d.product.price,
                monsantoProductReduceTransferInfo.growerInfo.purchaseOrderId,
                monsantoProductReduceTransferInfo.growerInfo.customerId,
                d.product.monsantoProductId,

                d.product.orderQty,
                d.product.discounts || [],
                [],

                monsantoProductReduceTransferInfo.growerInfo.farmId || null,
                null,
                null,
                null,
                d.product.orderDate,
                null,
                null,
                null,
                false,
                false,
              );
            }

            await editCustomerMonsantoProduct(d.customer.id, d.customerProductId, data).then(
              async ({ payload: response }) => {
                await checkinOrderProductAvailability({
                  productList: [
                    {
                      crossReferenceId:
                        selectedProduct.length >= 1
                          ? selectedProduct[0].crossReferenceId
                          : selectedProduct.crossReferenceId,
                      classification:
                        selectedProduct.length >= 1
                          ? selectedProduct[0].classification
                          : selectedProduct.classification,
                      LineItem: {
                        suggestedDealerMeasurementValue: d.quantity,
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
                      productAvailability: res.data.length > 0 ? res.data[0].quantityComment : '0 Units',
                    });
                    errormsgs.push({
                      pid: d.purchaseOrder.id,
                      msg: response.msg || 'Successfully updated!',
                      productAvailability: res.data.length > 0 ? res.data[0].quantityComment : '0 Units',
                    });
                  })
                  .catch((e) => {
                    errormsgs.push({
                      pid: d.purchaseOrder.id,
                      msg: response.msg || 'Successfully updated!',
                      productAvailability: e.response ? e.response.data.error : 'CheckAvailability API Failed' || e,
                    });
                  });

                this.setState({
                  showSnackbar: true,
                  showSnackbarText: response.msg || 'Successfully updated!',
                  isLoading: false,
                  errormsgs: errormsgs,
                });
              },
            );
          });
      });
    } catch (e) {
      console.log(e, 'error at swap product');
    }
  };

  syncMonsantoOrder = async () => {
    const { checkPoId, productsToOrder, purchaseOrdersData } = this.state;
    let syncPoList = [];
    let errormsgs = [];

    await axios
      .get(`${process.env.REACT_APP_API_BASE}/customers?page=${0}&size=${this.props.totalItemsOfCustomers}`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then(async (response) => {
        if (response.data) {
          const cust = response.data.customersdata;

          cust.map((c) => {
            c.PurchaseOrders.map((f) => {
              if (checkPoId.includes(f.id)) {
                return syncPoList.push(f);
              }
            });
          });

          syncPoList.map(async (sp, i) => {
            let syncMonsantoProductIds = [];
            await sp.CustomerMonsantoProducts.filter(
              (cm) => cm.isSent == false && cm.isDeleted == false && parseFloat(cm.orderQty) >= 0,
            ).map((c) => syncMonsantoProductIds.push(c.id));

            await this.props
              .syncMonsantoOrders(
                sp.id,
                sp.customerId,
                [],
                syncMonsantoProductIds,
                this.props.match.path.includes('dealers'),
              )
              .then(async (data) => {
                this.setState({ isSyncingMonsantoProducts: false });
                errormsgs.push({
                  pid: sp.id,
                  msg: data.msg || 'Sync with Bayer Done! Some products are not available for now!',
                  productAvailability: '',
                });

                this.setState({
                  showSnackbar: true,
                  showSnackbarText: data.msg || 'Sync with Bayer Done! Some products are not available for now!',
                  productAvailability: '',
                });

                const removeSelectPo = purchaseOrdersData.filter((val) => {
                  return !syncPoList.find((val2) => {
                    return val.purchaseOrderId === val2.id;
                  });
                });

                if (syncPoList.length == i + 1) {
                  setTimeout(async () => {
                    await this.setValueToState();
                    this.setState({
                      purchaseOrdersData: removeSelectPo,
                    });
                  }, 1000);
                }
              })
              .catch((e) => {
                this.setState({ isSyncingMonsantoProducts: false });
                if (e && e.response) {
                  errormsgs.push({
                    pid: sp.id,
                    msg: e.response.data.error || 'Cannot sync with Monsanto! Please try later!',
                  });
                  this.setState({
                    showSnackbar: true,
                    showSnackbarText: e.response.data.error || 'Cannot sync with Monsanto! Please try later!',
                  });
                } else {
                  errormsgs.push({
                    pid: sp.id,
                    msg: 'The Bayer server is temporarily unable to service your request due to maintenance downtime or capacity problems. Please try again later.',
                  });
                }
              });
          });

          this.setState({
            isSyncingMonsantoProducts: true,
            errormsgs: errormsgs,
            // isCheckingProductAvailability: true
          });
        }
      });
  };
  close = () => {
    this.setState({
      showProductForm: false,
      editingProduct: null,
    });
  };

  onEditOnlyProductChange = (productOrder) => {
    this.setState({
      productsToOrder: [productOrder],
    });
  };
  setAvailabilityProduct = (data) => {
    this.setState({ productForCheckAvailability: data });
  };
  updateDisableBtn = (data) => {
    isDisabledCheckBtn = data;
  };

  checkProductavaiblty = async () => {
    const { checkinOrderProductAvailability } = this.props;
    const { quantity, selectedProduct, productForCheckAvailability } = this.state;
    this.setState({ isLoadingAvailability: true });
    isDisabledCheckBtn = true;

    const productList = [];
    productForCheckAvailability.length > 0
      ? productForCheckAvailability.map((p) => {
          return productList.push({
            crossReferenceId: p.crossReferenceId,
            classification: p.classification,
            LineItem: {
              suggestedDealerMeasurementValue: 0,
              suggestedDealerMeasurementUnitCode: JSON.parse(p.LineItem.suggestedDealerMeasurementUnitCode),
            },
          });
        })
      : productList.push({
          crossReferenceId: productForCheckAvailability.crossReferenceId,
          classification: productForCheckAvailability.classification,
          LineItem: {
            suggestedDealerMeasurementValue: 0,
            suggestedDealerMeasurementUnitCode: JSON.parse(
              productForCheckAvailability.LineItem.suggestedDealerMeasurementUnitCode,
            ),
          },
        });

    await checkinOrderProductAvailability({
      productList: productList,
    })
      .then((res) => {
        isDisabledCheckBtn = false;

        this.setState({
          productAvailability: res.data.length > 0 ? res.data : '0 Units',

          isLoadingAvailability: false,
        });
      })
      .catch((e) => {
        isDisabledCheckBtn = false;

        this.setState({ ischeckingProductavaiblty: false, isLoadingAvailability: false });
        this.setShowSnackbar(e.response.data.error || e);
      });
  };

  submitProduct = async () => {
    this.setState({ isLoading: false });
    await this.close();
    await this.updateProduct();
    await this.props.listCustomers();
  };
  render() {
    const {
      customers,
      deliveryReceipts,
      monsantoProducts,
      companies,
      apiSeedCompanies,
      seedSizes,

      classes,
    } = this.props;
    const {
      checkPoId,
      isSyncingMonsantoProducts,
      showProductForm,
      purchaseOrdersData,
      selectedProductId,
      productsToOrder,
      isLoading,
      swapType,
      monsantoProductReduceTransferInfo,
      productAvailability,
      // isDisabledCheckBtn,
    } = this.state;

    const poList = [];
    purchaseOrdersData && purchaseOrdersData.map((p) => poList.push(p.purchaseOrder.id));

    const selectedMonsantoProduct =
      (monsantoProducts.length > 0 && monsantoProducts.filter((f) => f.id == selectedProductId)) || [];

    let seedType = '';
    if (selectedMonsantoProduct.length > 0) {
      selectedMonsantoProduct[0]['ApiSeedCompany'] = apiSeedCompanies[0];
      (seedType = this.mapObj[selectedMonsantoProduct[0].classification]), 'selectedMonsantoProduct';
    }

    return (
      <div id="swapProductPage">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 id="swapProductContainer">
            Swap Grower Product {selectedMonsantoProduct.length > 0 && selectedMonsantoProduct[0].productDetail}
          </h3>

          <Select
            value={swapType}
            onChange={(e) => this.setState({ swapType: e.target.value })}
            autoWidth
            inputProps={{
              className: classes.packagingSelect,
              required: true,
              name: 'swapType',
              id: 'swapType',
            }}
            style={{ width: '200px' }}
          >
            <MenuItem value={'Bayer'} key={'Bayer'}>
              Bayer
            </MenuItem>
            <MenuItem value={'BayerDealerBucket'} key={'BayerDealerBucket'}>
              BayerDealerBucket
            </MenuItem>
          </Select>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            <CheckBox
              id="selectPOforsync"
              color="primary"
              checked={checkPoId.length == purchaseOrdersData.length ? true : false}
              onChange={(e) =>
                this.setState({
                  checkPoId: e.target.checked ? poList : [],
                })
              }
            />
            <p style={{ display: 'flex', alignItems: 'center', fontSize: '15px', marginTop: '9px' }}>Select All</p>
          </div>
          <div>
            <Button
              id="addProduct"
              onClick={() => {
                this.setState({
                  showProductForm: true,
                });
              }}
              disabled={checkPoId.length == 0}
            >
              Swap With Product
            </Button>
            <Button
              id="syncwithbayer"
              onClick={this.syncMonsantoOrder}
              disabled={productsToOrder.length == 0 || isLoading}
            >
              {isSyncingMonsantoProducts ? 'Syncing With Bayer' : 'Sync With Bayer'}
            </Button>
          </div>
        </div>

        {purchaseOrdersData.length > 0 ? (
          <ReactTable
            columns={this.columns}
            data={purchaseOrdersData.filter((s) => s.purchaseOrder.isQuote == false) || []}
            showPagination={false}
            minRows={1}
            resizable={false}
          ></ReactTable>
        ) : (
          <div style={{ textAlign: 'center', marginTop: '30px' }}>No data Found</div>
        )}

        {showProductForm && (
          <Dialog open={true} maxWidth="xl" PaperProps={{ classes: { root: classes.dialog } }}>
            <div>
              <Accordion preExpanded={['a']}>
                <AccordionItem uuid="a">
                  <AccordionItemHeading>
                    <AccordionItemButton>Select Products </AccordionItemButton>
                  </AccordionItemHeading>
                  <AccordionItemPanel>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        marginBottom: '20px',
                        justifyContent: 'space-between',
                      }}
                    >
                      <DatePicker
                        leftArrowIcon={<NavigateBefore />}
                        rightArrowIcon={<NavigateNext />}
                        format="MMMM Do YYYY"
                        disablePast={false}
                        label="Order Date"
                        emptyLabel="Order Date"
                        value={moment.utc(new Date())}
                        onChange={this.handleDateChange}
                        className={classes.datePicker}
                      />
                      {
                        <div>
                          <Button onClick={this.checkProductavaiblty} disabled={isDisabledCheckBtn}>
                            Check Availability
                          </Button>
                          {this.state.isLoadingAvailability && (
                            <CircularProgress
                              size={24}
                              style={{ width: '35px', position: 'absolute', marginTop: 15, marginLeft: -100 }}
                            />
                          )}
                        </div>
                      }
                    </div>
                    <Card className={classes.secondCard}>
                      <Grid container>
                        <Grid container>
                          <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                            Traits
                          </Grid>
                          <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                            Variety
                          </Grid>
                          <Grid item xs={2} className={classes.gridHeader + ' ' + classes.gridHeaderBorderStyle}>
                            Treatment
                          </Grid>
                          <Grid item xs={2} className={classes.gridHeader}>
                            Seed Size
                          </Grid>
                          <Grid item xs={2} className={classes.gridHeader}>
                            packaging
                          </Grid>
                          <Grid item xs={2} className={classes.gridHeader}>
                            Quantity and MSRP
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={12}>
                          <Grow in={apiSeedCompanies.length > 0 && seedType !== ''} timeout={500}>
                            <div>
                              {seedType !== '' && (
                                <ProductSelector
                                  iseditMode={true}
                                  wantToTransferAll={false}
                                  setToCustomerBaseQuantity={this.setToCustomerBaseQuantity}
                                  setToCustomerDetails={this.setToCustomerDetails}
                                  changequantity={this.changequantity}
                                  changezone={this.changezone}
                                  editingProduct={selectedMonsantoProduct[0]}
                                  purchaseOrder={[]}
                                  customerOrders={[]}
                                  seedType={seedType}
                                  packagingId={''}
                                  seedSizeId={''}
                                  comment={''}
                                  products={monsantoProducts}
                                  selectDiscountProduct={this.selectDiscountProduct}
                                  addProductToOrder={this.addProductToOrder}
                                  onEditOnlyProductChange={this.onEditOnlyProductChange}
                                  selectedProduct={selectedMonsantoProduct[0]}
                                  quantity={0}
                                  packagings={[]}
                                  seedSizes={seedSizes}
                                  isApiSeedCompany={true}
                                  seedCompany={[]}
                                  type="allPo"
                                  editType="edit"
                                  companies={companies}
                                  purchaseOrdersData={purchaseOrdersData}
                                  swapType={swapType}
                                  monsantoProductReduceTransferInfo={monsantoProductReduceTransferInfo}
                                  setMonsantoProductReduceInfo={this.setMonsantoProductReduceInfo}
                                  setAvailabilityProduct={this.setAvailabilityProduct}
                                  setIsDisabledCheckBtn={this.updateDisableBtn}
                                  productAvailabilityData={productAvailability}
                                />
                              )}
                            </div>
                          </Grow>
                        </Grid>
                      </Grid>
                    </Card>
                  </AccordionItemPanel>
                </AccordionItem>
              </Accordion>
            </div>
            <div className={classes.dialogHeaderActions} style={{ marginTop: '20px' }}>
              <Button
                className={classes.button + ' ' + classes.white + ' ' + classes.primary}
                style={{ width: '114px', height: '44px' }}
                onClick={this.close}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                className={classes.CTABar}
                // disabled
                onClick={this.submitProduct}
                id="submitProduct"
              >
                Submit
              </Button>
            </div>
          </Dialog>
        )}
      </div>
    );
  }
}
export default withStyles(productDialogStyles)(swap_product);
