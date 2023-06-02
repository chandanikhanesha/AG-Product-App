import React, { Component } from 'react';
import BayerOrdersPreviewPresenter from './bayer_orders_preview_presenter';

class BayerOrderPreview extends Component {
  state = {
    isPrinting: false,

    // purchaseOrder: null,
    // customer: null,
    // isPrinting: false,
    // deliveryReceipts: null,
  };

  componentWillMount() {
    this.props.listSeedCompanies();
    this.props.listCompanies();
    this.props.listDeliveryReceipts();
  }

  render() {
    //const { customers, getCustomerShareholders, currentPurchaseOrder } = this.props;
    //const { purchaseOrder } = this.state;
    const printSingleDelivery = this.props.location.state;

    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <BayerOrdersPreviewPresenter {...this.state} {...this.props} printSingleDelivery={printSingleDelivery} />
      </div>
    );
  }
}

export default BayerOrderPreview;
