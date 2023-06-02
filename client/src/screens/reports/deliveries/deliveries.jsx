import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { deliveriesStyles } from './deliveries.style';
import moment from 'moment';
// core components
import Button from '../../../components/material-dashboard/CustomButtons/Button';
import Card from '../../../components/material-dashboard/Card/Card';
import CardHeader from '../../../components/material-dashboard/Card/CardHeader';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import CardContent from '@material-ui/core/CardContent';
import ReactTable from 'react-table';
import { FormControl, FormLabel, FormGroup, FormControlLabel, Select, Checkbox } from '@material-ui/core';
// icons
import Print from '@material-ui/icons/Print';
import CircularProgress from '@material-ui/core/CircularProgress';

import { getProductName } from '../../../utilities/product.v2';
import { isUnloadedOrLoading } from '../../../utilities';

const headers = [
  {
    Header: 'Date of Delivery',
    show: true,
    accessor: 'date',
  },
  {
    Header: 'Purchase Order',
    show: true,
    id: 'po',
    accessor: (d) => d,
    Cell: (props) => {
      const { purchaseOrder } = props.value;
      return `${purchaseOrder.isQuote ? 'Quote' : 'Purchase Order'} #${purchaseOrder.id} ${purchaseOrder.name}`;
    },
  },
  {
    Header: 'Customer',
    show: true,
    id: 'customer',
    accessor: (d) => d,
    Cell: (props) => {
      const { customer } = props.value;
      return customer.name;
    },
  },
  {
    Header: 'Detail of delivery',
    show: true,
    accessor: 'detail',
    headerStyle: { textAlign: 'left' },
  },
];

class Deliveries extends Component {
  state = {
    rows: [],
    deliveryReceiptCustomers: [],
    selectedCustomerIds: [],
    deliveryReceiptDates: [],
    selectedDates: [],
    purchaseOrders: [],
  };
  componentDidMount = () => {
    this.props.purchaseOrder && this.props.purchaseOrder.id
      ? this.props.listDeliveryReceipts(this.props.purchaseOrder.id)
      : this.props.listDeliveryReceipts();
  };

  get isLoading() {
    return this.props.isOnline && [this.props.deliveryReceiptsStatus].some(isUnloadedOrLoading);
  }

  getRowsData = () => {
    const { deliveryReceipts, customers, purchaseOrders } = this.props;
    const { selectedCustomerIds, selectedDates } = this.state;
    let rows = [],
      drCustomers = [],
      drCustomerIds = [],
      drDates = [];
    deliveryReceipts.forEach((deliveryReceipt) => {
      const { DeliveryReceiptDetails } = deliveryReceipt;
      const po = purchaseOrders.find((_po) => _po.id === deliveryReceipt.purchaseOrderId);
      const customer = customers.find((_customer) => _customer.id === po.customerId);
      if (!drCustomerIds.includes(customer.id)) {
        drCustomerIds.push(customer.id);
        drCustomers.push({ id: customer.id, name: customer.name });
      }
      DeliveryReceiptDetails.forEach((ddr) => {
        if (!drDates.includes(moment.utc(ddr.deliveredAt).format('MMMM DD, YYYY'))) {
          drDates.push(moment.utc(ddr.deliveredAt).format('MMMM DD, YYYY'));
        }
        if (
          (selectedDates.length > 0 && !selectedDates.includes(moment.utc(ddr.deliveredAt).format('MMMM DD, YYYY'))) ||
          (selectedCustomerIds.length > 0 && !selectedCustomerIds.includes(customer.id))
        )
          return null;
        const { Lot } = ddr;
        rows.push({
          date: moment.utc(ddr.deliveredAt).format('MMMM DD, YYYY'),
          purchaseOrder: { isQuote: po.isQuote, id: po.id, name: po.name },
          customer: { id: customer.id, name: customer.name },
          detail: `${Lot.Product.blend} : ${Lot.Product.quantity} bags / ${ddr.deliveredBy || '-'} / Lot #${
            Lot.lotNumber
          }`,
        });
      });
    });
    return {
      rows,
      customers: drCustomers,
      dates: drDates,
    };
  };

  handleSelectCustomer = (id) => (event) => {
    const { selectedCustomerIds } = this.state;
    if (event.target.checked) {
      this.setState({ selectedCustomerIds: [...selectedCustomerIds, id] });
    } else {
      this.setState({
        selectedCustomerIds: selectedCustomerIds.filter((_id) => _id !== id),
      });
    }
  };

  handleSelectDate = (date) => (event) => {
    const { selectedDates } = this.state;
    if (event.target.checked) {
      this.setState({ selectedDates: [...selectedDates, date] });
    } else {
      this.setState({
        selectedDates: selectedDates.filter((_date) => _date !== date),
      });
    }
  };

  print = () => {
    setTimeout(() => {
      window.print();
    }, 500);
  };

  render() {
    const { classes } = this.props;
    const { selectedCustomerIds, selectedDates } = this.state;

    if (this.isLoading) return <CircularProgress />;
    const { rows, customers, dates } = this.getRowsData();
    return (
      <div className={classes.title}>
        <h3>Deliveries Reporting</h3>
        <Card className="hide-print">
          <CardHeader>
            <h3>Create Report</h3>
          </CardHeader>
          <CardBody>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Select Customers</FormLabel>
              <FormGroup row={true}>
                {customers.map((customer, idx) => {
                  return (
                    <FormControlLabel
                      key={`${customer.name}-${idx}`}
                      control={
                        <Checkbox
                          checked={selectedCustomerIds.includes(customer.id)}
                          onChange={this.handleSelectCustomer(customer.id)}
                          value={customer.id}
                        />
                      }
                      label={customer.name.substring(0, 25)}
                    />
                  );
                })}
              </FormGroup>
            </FormControl>
            <FormControl component="fieldset" className={classes.formControl}>
              <FormLabel component="legend">Select Dates</FormLabel>
              <FormGroup row={true}>
                {dates.map((date, idx) => {
                  return (
                    <FormControlLabel
                      key={`${date}-${idx}`}
                      control={
                        <Checkbox
                          checked={selectedDates.includes(date)}
                          onChange={this.handleSelectDate(date)}
                          value={date}
                        />
                      }
                      label={moment.utc(date).format('MMMM DD, YYYY')}
                    />
                  );
                })}
              </FormGroup>
            </FormControl>
          </CardBody>
        </Card>
        <div className={classes.actions}>
          {/* <Button
            className={`${classes.pdfButton} hide-print`}
            color="info"
            onClick={this.savePageAsPdf}
          >
            Save as PDF
          </Button> */}
          <Button className="hide-print" onClick={this.print} color="info">
            <Print />
          </Button>
        </div>
        <div className={classes.reportContainer}>
          <Card>
            <CardHeader>
              <h4>Delivery Report</h4>
            </CardHeader>
            <CardContent>
              <ReactTable data={rows} columns={headers} minRows={1} resizable={false} showPagination={false} />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
}

export default withStyles(deliveriesStyles)(Deliveries);
