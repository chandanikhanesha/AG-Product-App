import React, { Component } from 'react';
import DeliveryListPreviewPresenter from './delivery_presenter';

class DeliveryListPreview extends Component {
  state = {
    purchaseOrder: null,
    customer: null,
    isPrinting: false,
    deliveryReceipts: null,
  };

  componentDidMount() {
    this.props.listCustomerProducts();
    this.props.listPurchaseOrders();
    this.props.loadOrganization(this.props.organizationId);
    this.props.listDeliveryReceipts();
  }

  render() {
    const { customers, getCustomerShareholders, currentPurchaseOrder, purchaseOrders } = this.props;

    const printSingleDelivery = this.props.location.state;

    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <DeliveryListPreviewPresenter
          {...this.state}
          {...this.props}
          printSingleDelivery={printSingleDelivery}
          paramsData={this.props.match.params}
        />
      </div>
    );
  }
}

export default DeliveryListPreview;
