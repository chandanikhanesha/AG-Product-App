import React, { Component } from 'react';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import { debounce } from 'lodash/function';
import classnames from 'classnames';
import CheckBox from '@material-ui/core/Checkbox';

import InvoiceDatePicker from '../../../components/invoice/invoiceDatePicker';
import InvoiceDueDate from '../../../components/invoice/dueDate';
import { numberToDollars } from '../../../utilities';
import { updatePurchaseOrder } from '../../../store/actions';
import agriDealerGreenImage from '../../../assets/img/agridealer-all-green.png';

import { invoiceHeaderStyles } from './invoice_header.styles';

const ToInfo = ({
  to: { deliveryAddress, businessStreet, businessCity, businessState, businessZip, email, cellPhoneNumber },
}) => {
  let addressArray = [];
  // if (businessStreet) addressArray.push(businessStreet)

  // let cityStateArray = []
  if (businessCity) addressArray.push(businessCity);
  if (businessState) addressArray.push(businessState);
  if (businessZip) addressArray.push(businessZip);
  const businessAddresee = addressArray.join(', ');

  const _businessCityState = (
    <React.Fragment>
      {businessStreet && <span>{businessStreet}</span>}
      <br />
      {businessAddresee !== '' && <span>{businessAddresee}</span>}
    </React.Fragment>
  );

  const _deliveryAddress = deliveryAddress && (
    <React.Fragment>
      {deliveryAddress} <br />
    </React.Fragment>
  );

  return (
    <p>
      {/* {_deliveryAddress} */}
      {_businessCityState}
      <br />
      {email}
      <br />
      {cellPhoneNumber}
      <br />
    </p>
  );
};

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

class InvoiceHeader extends Component {
  constructor(props) {
    super(props);

    this.state = {
      note:
        props.purchaseOrder.invoiceNote && Array.isArray(props.purchaseOrder.invoiceNote)
          ? props.purchaseOrder.invoiceNote
          : [{ shareholderId: 'all', note: '' }],
    };
  }

  get to() {
    const { selectedShareholder, customer } = this.props;
    return this.grower && selectedShareholder.id !== 'theCustomer' ? selectedShareholder : customer;
  }

  get grower() {
    const { selectedShareholder, customer } = this.props;

    return selectedShareholder ? customer : null;
  }

  getPaymentsTotal() {
    const { payments, selectedShareholder, purchaseOrder } = this.props;
    let total = 0;
    payments
      .filter((payment) => payment.purchaseOrderId === purchaseOrder.id)
      .filter((payment) => {
        if (selectedShareholder) {
          return payment.shareholderId === selectedShareholder.id;
        } else {
          return true;
        }
      })
      .forEach((payment) => {
        let amount = 0;
        if (!(payment.method === 'Return')) {
          //if (payment.method === 'Cash' || payment.method === 'Check') {
          amount = payment.amount;
        } else {
          amount = -1 * parseFloat(payment.amount);
        }
        total += parseFloat(amount);
      });
    return total;
  }

  getBalanceDue() {
    let grandTotalString = this.props.grandTotal.replace('$', '');
    grandTotalString = grandTotalString.replace(/\,/g, '');
    let grandTotal = parseFloat(grandTotalString);
    let paymentTotal = this.getPaymentsTotal();
    return numberToDollars(grandTotal - paymentTotal);
  }

  updateNote = debounce(() => {
    this.props.updatePurchaseOrder(this.props.customer.id, this.props.purchaseOrder.id, {
      invoiceNote: this.state.note,
    });
  }, 1000);

  handleNoteChange = (e) => {
    // this.setState({
    //   note: e.target.value,
    // });
    const { selectedShareholder } = this.props;

    const check = this.state.note.find((p) => p.shareholderId == selectedShareholder.id)
      ? this.state.note.find((p) => p.shareholderId == selectedShareholder.id)
      : selectedShareholder.id == undefined
      ? this.state.note.find((p) => p.shareholderId == 'all')
      : undefined;
    if (check != undefined) {
      const modifyNote = this.state.note;
      const objIndex = modifyNote.findIndex((obj) => obj.shareholderId == check.shareholderId);
      modifyNote[objIndex].note = e.target.value;
      this.setState({
        note: modifyNote,
      });
    } else {
      this.setState({
        note: [...this.state.note, { shareholderId: selectedShareholder.id, note: e.target.value }],
      });
    }

    this.updateNote();
  };

  componentDidMount() {
    const { organization } = this.props;

    convertImgToBase64(`${process.env.REACT_APP_DO_BUCKET}/${organization.logo}`, (base64Img) => {
      document.getElementById('OrganizationLogo') !== null &&
        document.getElementById('OrganizationLogo').setAttribute('src', base64Img);
    });
  }

  render() {
    const {
      classes,
      organization,
      purchaseOrder,
      handleInvoiceDateChange,
      currentInvoiceDate,
      updateDaysToDueDate,
      customer,
      selectedShareholder,
    } = this.props;

    let toNameSize = '1em';
    if (this.to.name !== undefined && this.to.name.length >= 12 && this.to.name.length <= 20) toNameSize = '1.3em';
    if (this.to.name !== undefined && this.to.name.length > 20) toNameSize = '1em';

    const shareHolderNote = this.state.note.find(
      (p) => p.ShareholderId == (selectedShareholder.id ? selectedShareholder.id : 'all'),
    );
    const finalNote = shareHolderNote ? shareHolderNote.note : '';
    const isId = document.getElementById('growerInfo');

    return (
      <React.Fragment>
        <Grid container className={classes.headerWrapper} spacing={16} id="invoice-page">
          <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
            <img className={`${classes.logo_green} hide-print`} src={agriDealerGreenImage} />
          </div>
          <Grid container spacing={16} className={classes.invoiceHeader}>
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
            {/* <Grid item xs={4} className={classes.invoiceTitle}>
              <h3 className={classes.h3Header}>{purchaseOrder.isQuote ? 'Quote' : 'Invoice'}</h3>
              <h5 className={classes.h5Header}>Grand Total</h5>
              <h5 className={classes.h5Header} data-test-id="gradTotal">
                {this.props.grandTotal}
              </h5>
              {this.getBalanceDue() !== '$0.00' && (
                <React.Fragment>
                  <h5 className={classes.h5Header}>Balance Due</h5>
                  <h5 className={classes.h5Header} data-test-id="balanceDue">
                    {this.getBalanceDue()}
                  </h5>
                </React.Fragment>
              )}
            </Grid> */}
            <Grid item xs={4}>
              <h4 className={classes.h3Header}>&nbsp;</h4>
              <span className={classes.invoiceDetailsHeader}>
                {purchaseOrder.isQuote ? 'Quote No:' : 'Invoice No:'}
              </span>
              <span>{`#${purchaseOrder.id}`}</span>
              <br />
              {purchaseOrder.name != '' && (
                <span className={classes.invoiceDetailsHeader}>
                  {purchaseOrder.isQuote ? 'Quote Name:' : 'Invoice Name:'}
                </span>
              )}
              <span>{purchaseOrder.name ? `(${purchaseOrder.name})` : ''}</span>
              <br />
              <span className={classes.invoiceDetailsHeader}>Created On:</span>
              <InvoiceDatePicker
                currentInvoiceDate={currentInvoiceDate}
                handleInvoiceDateChange={handleInvoiceDateChange}
                invoicePreview={true}
              />
              <br />
              <span className={classes.invoiceDetailsHeader}>Due on:</span>
              <InvoiceDueDate
                currentInvoiceDate={currentInvoiceDate}
                updateDefaultDaysToDueDate={updateDaysToDueDate}
                organization={organization}
                invoicePreview={true}
                purchaseOrder={this.props.purchaseOrder}
              />
              <br />

              {customer.monsantoTechnologyId ? (
                <span>Bayer TECH ID : {`${customer.monsantoTechnologyId}`}</span>
              ) : customer.glnId ? (
                <span>Bayer GLN ID : {`${customer.glnId}`}</span>
              ) : (
                ''
              )}
            </Grid>
          </Grid>
          <Grid item xs={1} style={{ marginLeft: '-15px' }} id="growerGrid">
            {isId !== null && (
              <CheckBox
                id="growerBox"
                color="primary"
                className="hide-print"
                defaultChecked={true}
                onChange={() => {
                  const isCheck = document.getElementById('growerBox').checked;

                  if (isId !== null) {
                    if (isCheck == false) {
                      document.getElementById('growerInfo').style.display = 'none';
                    } else {
                      document.getElementById('growerInfo').style.display = 'contents';
                    }
                  }
                }}
              />
            )}
          </Grid>
          <Grid item xs={4} style={{ marginTop: '10px' }}>
            <h5
              className={classes.h3Header}
              style={{
                fontSize: toNameSize,
              }}
            >
              {this.to.name}
            </h5>
            <ToInfo to={this.to} />
          </Grid>

          {!this.grower && <Grid item xs={3} />}
          {this.grower && (
            <Grid item xs={3}>
              <div id="growerInfo">
                <h4>Grower</h4>
                <h5>{this.grower.name}</h5>
                <ToInfo to={this.grower} />
              </div>
            </Grid>
          )}
          {/* <Grid item xs={4}>
            <h4 className={classes.h3Header}>&nbsp;</h4>
            <span className={classes.invoiceDetailsHeader}>{purchaseOrder.isQuote ? 'Quote:' : 'Invoice:'}</span>
            <span>{`#${purchaseOrder.id}` + (purchaseOrder.name ? `(${purchaseOrder.name})` : '')}</span>
            <br />
            <span className={classes.invoiceDetailsHeader}>Date:</span>
            <InvoiceDatePicker
              currentInvoiceDate={currentInvoiceDate}
              handleInvoiceDateChange={handleInvoiceDateChange}
              invoicePreview={true}
            />
            <br />
            <span className={classes.invoiceDetailsHeader}>Due on:</span>
            <InvoiceDueDate
              currentInvoiceDate={currentInvoiceDate}
              updateDefaultDaysToDueDate={updateDaysToDueDate}
              organization={organization}
              invoicePreview={true}
              purchaseOrder={this.props.purchaseOrder}
            />
            <br />
            {customer.glnId ? <span>Bayer GLN ID : {`${customer.glnId}`}</span> : ''}
          </Grid> */}
          <Grid item xs={4}>
            <div
              id="invoice-note"
              className={classnames({
                [classes.invoiceNote]: true,
                'hide-print': finalNote === '',
              })}
              style={{ marginTop: '10px', minHeight: '100px' }}
            >
              <TextField
                className={classes.invoiceNoteInput}
                value={finalNote}
                onChange={this.handleNoteChange}
                multiline
                rows={5}
                placeholder="Add invoice note"
              />
            </div>
          </Grid>
        </Grid>
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

export default withStyles(invoiceHeaderStyles)(connect(null, mapDispatchToProps)(InvoiceHeader));
