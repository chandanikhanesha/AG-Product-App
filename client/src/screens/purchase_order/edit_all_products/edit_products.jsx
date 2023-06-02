import React, { Component } from 'react';
import {
  listCustomerProducts,
  listCustomerMonsantoProducts,
  listCustomerCustomProducts,
  listDealerDiscounts,
  editCustomerProduct,
  editCustomerMonsantoProduct,
  updateCustomerCustomProduct,
} from '../../../store/actions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import ReactTable from 'react-table';
import { withStyles } from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';

import Checkbox from '@material-ui/core/Checkbox';
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';
import Card from '../../../components/material-dashboard/Card/Card';

import { numberToDollars, customerProductDiscountsTotals } from '../../../utilities';
import { editProductsStyles } from './edit_products.styles';
import DiscountSelector from '../discount_selector';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import moment from 'moment';

class EditProducts extends Component {
  state = {
    previewOpen: false,
    previewDiscount: null,
    discounts: [],
    orderDate: new Date(),
    fieldName: '',
    farmName: '',
    productIDs: [],
    isLoading: false,
  };
  componentDidMount = async () => {
    await this.props.listCustomerCustomProducts(true);
    await this.props.listCustomerMonsantoProducts(true);
    await this.props.listCustomerProducts(true);
    await this.props.listDealerDiscounts(true);
  };

  onDiscountsUpdate = (data) => {
    this.setState({ discounts: data });
  };
  refreshData = async () => {
    await this.props.listCustomerCustomProducts(true);
    await this.props.listCustomerMonsantoProducts(true);
    await this.props.listCustomerProducts(true);
  };

  saveChangesToAllProducts = async (name) => {
    const {
      editRelatedCustomProduct,
      editRelatedProduct,
      editRelatedMonsantoProduct,
      customerMonsantoProduct,
      customerProducts,
      customerCustomProducts,
      match,
    } = this.props;
    const combineProduct = [...customerMonsantoProduct, ...customerProducts, ...customerCustomProducts].filter(
      (c) => c.purchaseOrderId == match.params.id && c.isDeleted == false,
    );
    const { discounts, productIDs, orderDate, isLoading } = this.state;
    this.setState({ isLoading: true });
    await combineProduct
      .filter((cp) => productIDs.includes(cp.id))
      .map(async (order) => {
        if (order.hasOwnProperty('customProductId')) {
          await editRelatedCustomProduct(this.props.match.params.customer_id, order.id, {
            [name]: name == 'discounts' ? discounts : orderDate,
          });
        } else if (order.hasOwnProperty('productId')) {
          await editRelatedProduct(this.props.match.params.customer_id, order.id, {
            [name]: name == 'discounts' ? discounts : orderDate,
          });
        } else {
          await editRelatedMonsantoProduct(this.props.match.params.customer_id, order.id, {
            [name]: name == 'discounts' ? discounts : orderDate,

            monsantoProductId: order.monsantoProductId,
          });
        }
      });

    setTimeout(async () => {
      this.setState({ isLoading: false });

      await this.refreshData();
    }, 600);
  };

  render() {
    const {
      customerMonsantoProduct,
      customerProducts,
      customerCustomProducts,
      dealerDiscounts,
      classes,
      companies,
      match,
      purchaseOrder,
      customers,
    } = this.props;
    const { discounts, orderDate, fieldName, farmName, productIDs, isLoading } = this.state;

    const combineProduct = [...customerMonsantoProduct, ...customerProducts, ...customerCustomProducts].filter(
      (c) => c.purchaseOrderId == match.params.id && c.isDeleted == false,
    );
    const currentPo = purchaseOrder.find((p) => p.id == match.params.id);
    const currentCust = customers.find((c) => c.id == match.params.customer_id);
    const allProductId = [];
    combineProduct
      .filter((c) => c.purchaseOrderId == match.params.id && c.isDeleted == false)
      .map((c) => allProductId.push(c.id));

    let tableHeaders = [
      {
        Header: (
          <span>
            <Checkbox
              id="selectPOforsync"
              color="primary"
              onChange={async (e) => {
                if (e.target.checked) {
                  this.setState({ productIDs: allProductId });
                } else {
                  this.setState({ productIDs: [] });
                }
              }}
            />
          </span>
        ),
        show: true,
        id: 'checkbox',
        width: 60,
        accessor: (d) => d,
        Cell: (props) => {
          const product = props.value;

          return (
            <Checkbox
              id="selectPOforsync"
              color="primary"
              checked={productIDs.includes(product.id) ? true : false}
              onChange={async (e) => {
                if (e.target.checked) {
                  this.setState({ productIDs: [...this.state.productIDs, product.id] });
                } else {
                  this.setState({ productIDs: this.state.productIDs.filter((d) => d !== product.id) });
                }
              }}
            />
          );
        },
      },
      {
        Header: 'ProductDetails',
        show: true,
        id: 'cname',
        width: 200,

        accessor: (d) => d,
        Cell: (props) => {
          const order = props.value;
          let productDetail;
          let product;
          if (order.Product) {
            product = order.Product;
            productDetail = `${product.blend} / ${product.brand} / ${product.treatment}`;
          } else if (order.CustomProduct) {
            product = order.CustomProduct;
            productDetail = `${product.name} / ${product.type} / ${product.description}`;
          } else if (order.MonsantoProduct) {
            product = order.MonsantoProduct;
            productDetail = product.productDetail
              ? product.productDetail
              : `${product.blend} / ${product.brand} / ${product.treatment}`;
          }
          return productDetail;
        },
      },
      {
        Header: 'Qty',
        show: true,
        id: 'poid',
        width: 160,

        accessor: (d) => d,
        Cell: (props) => {
          const product = props.value;
          return product.orderQty;
        },
      },
      {
        Header: 'Discounts',
        show: true,
        id: 'poname',

        accessor: (d) => d,
        Cell: (props) => {
          const order = props.value;
          let product;

          if (order.Product) {
            product = order.Product;
          } else if (order.CustomProduct) {
            product = order.CustomProduct;
          } else if (order.MonsantoProduct) {
            product = order.MonsantoProduct;
          }

          const discountsPOJO =
            order.discounts.length > 0 &&
            order.discounts &&
            order.discounts
              .map((discount) => {
                return this.props.dealerDiscounts.find((dd) => dd.id === discount.DiscountId);
              })
              .filter((el) => el);
          const { discounts, discountAmount } = customerProductDiscountsTotals(
            order,
            discountsPOJO,
            product,
            null,
            null,
            null,
            order.PurchaseOrder,
          );
          const DiscountsNameList = () => {
            let ordered = order.discounts
              .sort((a, b) => a.order - b.order)
              .map((discount) => discounts[discount.DiscountId])
              .filter((x) => x);
            return (
              <div>
                {ordered.map((discount) => (
                  <div key={discount.dealerDiscount.id}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderBottom: '2px solid #00000038',
                        borderBottomStyle: 'dashed',
                        margin: '0px 60px 0px 0px',
                      }}
                    >
                      <span> {discount.dealerDiscount.name.substring(0, 25) + '  (' + discount.value + ')'}</span>
                      <span> {numberToDollars(discount.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            );
          };
          return <DiscountsNameList />;
        },
      },
      {
        Header: 'Order Date',
        show: true,
        id: 'status',

        headerStyle: {
          textAlign: 'left',
          overflow: 'auto',
        },
        accessor: (d) => d,
        Cell: (props) => {
          const product = props.value;
          return moment.utc(product.orderDate).format('MM/DD/YYYY');
        },
      },
      {
        Header: 'FieldName',
        show: currentPo.isSimple ? false : true,
        id: 'fieldName',
        headerStyle: {
          textAlign: 'left',
          overflow: 'auto',
        },
        accessor: (d) => d,
        Cell: (props) => {
          const product = props.value;
          return product.fieldName || '-';
        },
      },
      {
        Header: 'Farm Name',
        id: 'farmName',
        show: currentPo.isSimple ? false : true,

        headerStyle: {
          textAlign: 'left',
          overflow: 'auto',
        },
        accessor: (d) => d,
        Cell: (props) => {
          const product = props.value;

          return product.Farm !== null && product.Farm !== undefined
            ? product.Farm.name
              ? product.Farm.name
              : '-'
            : '-';
        },
      },
    ];

    const link = `app/customers/${match.params.customer_id}/purchase_order/${match.params.id}`;
    return (
      <div>
        <a href={link} style={{ cursor: 'pointer' }} id="goBackToProduct">
          {' '}
          {`<  Go back to Products`}{' '}
        </a>

        <div className="hide-print">
          <span>
            {' '}
            {currentCust.name}'s {currentPo.isQuote === false ? 'Purchase Order' : 'Quote'}
          </span>
        </div>

        <h5>
          {`${currentPo.isQuote === false ? 'PO' : 'QT'} #${currentPo.id}${
            currentPo.name ? '-' + currentPo.name : ''
          } `}
        </h5>
        <h3> Edit Discount/Order Date for all Products</h3>
        <div>
          <GridContainer>
            <GridItem xs={6}>
              <DiscountSelector
                discounts={discounts}
                companies={companies}
                dealerDiscounts={dealerDiscounts.filter((d) => !d.applyToWholeOrder)}
                onUpdate={this.onDiscountsUpdate}
              />
            </GridItem>
            <GridItem className={classes.discountGridItem} xs={6}>
              <DatePicker
                leftArrowIcon={<NavigateBefore />}
                rightArrowIcon={<NavigateNext />}
                format="MMMM Do YYYY"
                utcOffset={0}
                disablePast={false}
                label="Order Date"
                emptyLabel="Order Date"
                value={moment.utc(orderDate)}
                onChange={(date) =>
                  this.setState({
                    orderDate: moment.utc(date._d).format('YYYY-MM-DD') + 'T00:00:00.000Z',
                  })
                }
                className={classes.datePicker}
              />
            </GridItem>
          </GridContainer>
          <div className={classes.btnContainer}>
            <Button
              id="appliedToAllDiscount"
              onClick={() => this.saveChangesToAllProducts('discounts')}
              disabled={isLoading}
            >
              Apply discount to all selected products
            </Button>
            <Button
              id="appliedOrderDate"
              onClick={() => this.saveChangesToAllProducts('orderDate')}
              disabled={isLoading}
            >
              Apply orderDate to all selected products
            </Button>
          </div>
          <Card className={classes.cardContainer}>
            <ReactTable
              columns={tableHeaders}
              data={combineProduct}
              showPagination={true}
              minRows={1}
              resizable={false}
              // defaultPageSize={500}
            ></ReactTable>
          </Card>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
    customerMonsantoProduct: state.customerMonsantoProductReducer.customerMonsantoProducts,
    customerProducts: state.customerProductReducer.customerProducts,
    customerCustomProducts: state.customerCustomProductReducer.customerCustomProducts,
    dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
    companies: state.companyReducer.companies,
    currentPurchaseOrder: state.purchaseOrderReducer.current,
    purchaseOrder: state.purchaseOrderReducer.purchaseOrders,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomerProducts,
      listCustomerMonsantoProducts,
      listCustomerCustomProducts,
      listDealerDiscounts,
      editRelatedCustomProduct: updateCustomerCustomProduct,
      editRelatedMonsantoProduct: editCustomerMonsantoProduct,
      editRelatedProduct: editCustomerProduct,
    },
    dispatch,
  );
export default connect(mapStateToProps, mapDispatchToProps)(withStyles(editProductsStyles)(EditProducts));
