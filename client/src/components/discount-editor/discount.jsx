import React from 'react';
import { withStyles } from '@material-ui/core';
import { format } from 'date-fns';
import SweetAlert from 'react-bootstrap-sweetalert';
import moment from 'moment';
// core components
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import Table from '../../components/material-dashboard/Table/Table';
import { useState } from 'react';

const styles = {
  editButton: {
    backgroundColor: '#999',
    padding: '8px 12px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  removeButton: {
    marginLeft: 15,
    padding: '8px 12px',
  },
  danger: {
    backgroundColor: '#999',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '5%',
    width: '70px',
    height: '35px',
    textTransform: 'uppercase',
  },
  success: {
    backgroundColor: '#38A154',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '5%',
    width: '70px',
    height: '35px',
    textTransform: 'uppercase',
  },
};

const dealerDiscountHeaders = (dealerDiscount) => {
  switch (dealerDiscount.discountStrategy) {
    case 'Quantity Discount':
      return ['Min Qty', 'Max Qty', 'Discount Value', 'Unit', ''];
    case 'Dollar Volume Discount':
      return ['Min $', 'Max $', 'Discount Value', 'Unit', ''];
    case 'Early Pay Discount':
      return ['Date', 'Discount Value', 'Unit', ''];
    case 'Flat Amount Discount':
      return ['Discount Value', 'Unit', ''];
    default:
      throw new Error('Discount strategy not correct');
  }
};

const dealerDiscountData = (dealerDiscount) => {
  switch (dealerDiscount.discountStrategy) {
    case 'Quantity Discount':
      return dealerDiscount.detail.map((detail) => [detail.minQty, detail.maxQty, detail.discountValue, detail.unit]);
    case 'Dollar Volume Discount':
      return dealerDiscount.detail.map((detail) => [
        detail.minDollars,
        detail.maxDollars,
        detail.discountValue,
        detail.unit,
      ]);
    case 'Early Pay Discount':
      return dealerDiscount.detail.map((detail) => [
        moment.utc(detail.date).format('MMMM Do YYYY'),

        detail.discountValue,
        detail.unit,
      ]);
    case 'Flat Amount Discount':
      return dealerDiscount.detail.map((detail) => [detail.discountValue, detail.unit]);
    default:
      throw new Error('Discount strategy not correct');
  }
};

const Discount = (props) => {
  const [isShow, setisShow] = useState(false);
  const [product, setproduct] = useState();
  const {
    dealerDiscount,
    companies,
    classes,
    deleteDealerDiscount,
    preview = false,
    history,
    seedCompanies = [],
    isAdmin,
    customerMonsantoProduct,
    purchaseOrders,
  } = props;

  const {
    seedCompanyId,
    name,
    id,
    applyToWholeOrder,
    applyToSeedType,
    productCategories,
    applyToParticularProducts,
    applyParticularProducts,
    companyIds,
    lastDate,
    discountStrategy,
    useByDefault,
    seedCompanyIds,
    applyAsOverAllTotal,
  } = dealerDiscount;
  // if (!seedCompanies || !seedCompanies.length) return null;

  let seedCompany = seedCompanies.find((sc) => sc.id === seedCompanyId);

  let companyName = '';
  if (dealerDiscount.apiSeedCompanyIds.length > 0) {
    companyName = 'Bayer,';
  }

  if (dealerDiscount.companyIds.length > 0) {
    companyIds.map((c) => {
      const isFind = companies.find((cp) => cp.id == c);
      if (isFind) {
        companyName = companyName + isFind.name + ',';
      }
    });
  }

  if (dealerDiscount.seedCompanyIds.length > 0) {
    seedCompanyIds.map((c) => {
      const isFind = seedCompanies.find((cp) => cp.id == c);
      if (isFind) {
        companyName = companyName + isFind.name + ',';
      }
    });
  }

  const companyNameIndex = companyName.lastIndexOf(',');

  return (
    <Card style={preview ? { margin: 0 } : null}>
      <CardHeader className={classes.cardHeader}>
        <h4>{name}</h4>
        {!preview && (isAdmin === true || isAdmin === 'true') && (
          <div>
            <Button
              className={classes.editButton}
              onClick={() => history.push(`/app/setting/discount_editor/${id}/edit`)}
            >
              Edit
            </Button>
            <Button
              color="danger"
              onClick={async () => {
                const data = [];
                customerMonsantoProduct.map((c) => {
                  c.discounts.length > 0 &&
                    c.discounts.map((d) => {
                      if (dealerDiscount.id == d.DiscountId) {
                        data.push(c.purchaseOrderId);
                      }
                    });
                });
                await setproduct(data);

                setisShow(true);
              }}
              className={classes.removeButton}
            >
              Remove
            </Button>
          </div>
        )}
      </CardHeader>

      <CardBody>
        {!applyToWholeOrder && (applyToSeedType || applyToParticularProducts) && productCategories.length > 0 && (
          <div>
            {applyToSeedType && 'Apply To Seed Types'}
            {applyToParticularProducts && 'Apply To Particular Products'}
            <br />
            Seed brands:&nbsp;
            {productCategories.map((productCategory, index) => {
              return (
                seedCompany && (
                  <span key={productCategory}>
                    {index > 0
                      ? ` / ${seedCompany[`${productCategory.toLowerCase()}BrandName`]}`
                      : seedCompany[`${productCategory.toLowerCase()}BrandName`]}
                    &nbsp;
                  </span>
                )
              );
            })}
          </div>
        )}
        {!applyToWholeOrder &&
          applyToParticularProducts &&
          applyParticularProducts &&
          Object.keys(applyParticularProducts).map(
            (seedType) =>
              seedCompany && (
                <div>
                  {`${seedCompany[`${seedType.toLowerCase()}BrandName`]} : `}
                  {applyParticularProducts[seedType].map((blend, index) => (
                    <span>{index > 0 ? ` / ${blend}` : blend}</span>
                  ))}
                </div>
              ),
          )}
        {applyToWholeOrder === false && companyIds.length > 0 && (
          <div>
            Business Companies:&nbsp;
            {companyIds.map((companyId) => {
              return (
                <span key={companyId}>
                  {companies.find((co) => co.id === companyId)
                    ? companies.find((co) => co.id === companyId).name
                    : null}
                  &nbsp;
                </span>
              );
            })}
          </div>
        )}
        Last Date: {moment.utc(lastDate).format('MMMM Do YYYY')} <br />
        {/*Discount Strategy: {discountStrategy} <br />
        Use by default: {useByDefault ? 'true' : 'false'} <br />*/}
        Discount applies To : {companyName.substring(0, companyNameIndex)}
        <br />
        Apply to whole order ? {applyToWholeOrder ? 'true' : 'false'}
        {applyToWholeOrder && (
          <div>Apply whole order discount to overall total ? {applyAsOverAllTotal ? 'true' : 'false'}</div>
        )}
        <Table
          tableHead={dealerDiscountHeaders(dealerDiscount)}
          tableData={dealerDiscountData(dealerDiscount)}
          isCheckBox={false}
        />
      </CardBody>
      {isShow && (
        <SweetAlert
          warning
          showCancel
          title={`Delete Product`}
          onConfirm={() => {
            setisShow(false);
            deleteDealerDiscount(dealerDiscount.id);
          }}
          onCancel={() => {
            setisShow(false);
          }}
          confirmBtnText={<span id="productOk">Ok</span>}
          cancelBtnText={<span id="productCancel">Cancel</span>}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          This discount is apply to the below PurchaseOrder. <br></br>
          {product &&
            purchaseOrders
              .filter((p) =>
                product.length > 0
                  ? product.includes(p.id)
                  : p.dealerDiscounts.length > 0 && p.dealerDiscounts.filter((d) => d.DiscountId == dealerDiscount.id),
              )
              .map((p) => {
                const link = `/app/customers/${p.customerId}/purchase_order/${p.id}`;
                return (
                  <div>
                    <a href={link} target="_blank">
                      #{p.id}-{p.name}
                    </a>
                    <br></br>
                  </div>
                );
              })}
        </SweetAlert>
      )}
    </Card>
  );
};

export default withStyles(styles)(Discount);
