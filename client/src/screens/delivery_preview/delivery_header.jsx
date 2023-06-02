import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import InvoiceDatePicker from '../../components/invoice/invoiceDatePicker';
import { DatePicker } from '@material-ui/pickers';
import moment from 'moment';

import { updatePurchaseOrder } from '../../store/actions';

import { invoiceHeaderStyles } from '../invoice_preview/invoice_header/invoice_header.styles';

function convertImgToBase64(url, callback) {
  let canvas = document.createElement('CANVAS');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.crossOrigin = 'Anonymous';
  img.onload = function () {
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    var dataURL = canvas.toDataURL('image/png');
    callback.call(this, dataURL);
    // Clean up
    canvas = null;
  };
  img.src = url;
}

class DeliveryListPreviewHeader extends Component {
  constructor(props) {
    super(props);
  }
  state = { selectedDate: new Date() };

  componentDidMount() {
    const { organization } = this.props;

    convertImgToBase64(`${process.env.REACT_APP_DO_BUCKET}/${organization.logo}`, (base64Img) => {
      document.getElementById('OrganizationLogo').setAttribute('src', base64Img);
    });
  }

  render() {
    const { classes, organization, purchaseOrder, paramsData, customers } = this.props;
    const { selectedDate } = this.state;

    const currentPo = purchaseOrder && purchaseOrder.filter((p) => p.id === parseInt(paramsData.purchase_order));
    const currentCust = customers.find((c) => c.id == paramsData.customer_id);
    return (
      <React.Fragment>
        <Grid container className={classes.headerWrapper} style={{ borderBottom: '3px solid black' }} spacing={16}>
          <Grid container spacing={16} className={classes.DeliveryListPreviewHeader}>
            <Grid item xs={4}>
              <h3 className={classes.h3Header}>{organization.name}</h3>
              <p style={{ marginBottom: 0 }}>
                {organization.address}
                <br />
                {`${organization.businessCity}, ${organization.businessState}, ${organization.businessZip}`}
                <br />
                {organization.email}
                <br />
                {organization.phoneNumber}
              </p>
            </Grid>
            <Grid item xs={4}>
              <img className={classes.logo} alt={organization.logo} id="OrganizationLogo" />
            </Grid>

            <Grid item xs={4}>
              {/* <h4 className={classes.h3Header}>&nbsp;</h4> */}

              <h5>
                {currentPo && currentPo[0].isQuote === true
                  ? `Quote#${currentPo[0].id}-${currentPo[0].name}`
                  : `PO#${currentPo[0].id}-${currentPo[0].name}`}
              </h5>
              <DatePicker
                label="Date :"
                format="MMMM Do YYYY"
                value={selectedDate}
                onChange={(date) =>
                  this.setState({ selectedDate: moment.utc(date).format('YYYY-MM-DD') + 'T00:00:00.000Z' })
                }
              />
            </Grid>
          </Grid>
          <Grid item xs={1} />
        </Grid>
        <h4>{currentCust && `${currentCust.name}`}</h4>
        <span>{currentCust && `${currentCust.businessStreet}`}</span>
        <br />
        <span>
          {currentCust && `${currentCust.businessCity},${currentCust.businessState},${currentCust.businessZip}`}
        </span>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updatePurchaseOrder,
    },
    dispatch,
  );

export default withStyles(invoiceHeaderStyles)(connect(null, mapDispatchToProps)(DeliveryListPreviewHeader));
