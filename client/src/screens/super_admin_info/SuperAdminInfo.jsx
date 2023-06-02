import React, { Component } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import { Link } from 'react-router-dom';
import ReactTable from 'react-table';
import axios from 'axios';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

import CircularProgress from '@material-ui/core/CircularProgress';
import Card from '../../components/material-dashboard/Card/Card';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import { customersStyles } from '../customers/customers.styles';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import ViewSubscriptionsDialog from './ViewSubscriptionsDialog';

class SuperAdminInfo extends Component {
  state = {
    tableColumns: [
      {
        Header: 'Organisation',
        accessor: 'name',
      },
      {
        Header: 'Email',
        accessor: 'email',
      },
      {
        Header: 'Address',
        accessor: 'address',
      },
      {
        Header: 'Phone Number',
        accessor: 'phoneNumber',
      },
      {
        Header: 'Bayer c/n',
        accessor: 'apiSeedCompanies',
      },
      {
        Header: 'Companies',
        accessor: 'companies',
      },
      {
        Header: 'Seed Companies',
        accessor: 'seedCompanies',
      },
      {
        Header: 'Customers',
        accessor: 'customers',
      },
      {
        Header: 'Purchase Orders',
        accessor: 'purchaseOrders',
        headerStyle: {
          textAlign: 'right',
        },
      },
      {
        Header: 'Quotes',
        accessor: 'quotes',
      },
      {
        Header: 'Discounts',
        accessor: 'discounts',
      },
      {
        Header: 'Subscription',
        id: 'Subscription',
        accessor: (data) => {
          return (
            <Button
              simple={true}
              color="primary"
              // className={`${classes.createQT} hide-print`}
              // data-test-id="balanceDue"
              style={{ color: '#2F2E2E', fontSize: '.875rem', fontWeight: 300 }}
              onClick={() => this.handleViewSubscriptionsDialogOpen(data)}
            >
              {data.subscription.length == 0 ? '-' : 'yes'}
            </Button>
          );
        },
      },
    ],
    organizationsList: [],
    showViewSubscriptionDialog: null,
  };

  componentDidMount() {
    // this.props.getBayer_order_check(true);
    axios
      .get(`${process.env.REACT_APP_API_BASE}/organizations/superAdminData`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        if (response.data.data) {
          this.setState({ organizationsList: response.data.data });
          response.data.data.map((c) => console.log(c.subscription));
        } else {
          console.log('nope organisations: ', response);
        }
      });
  }

  handleViewSubscriptionsDialogOpen = (data) => {
    this.setState({
      showViewSubscriptionDialog: (
        <ViewSubscriptionsDialog
          open={true}
          onClose={this.handleViewSubscriptionsDialogClose}
          classes={this.props.classes}
          data={data}
          planList={this.props.planList}
          subscriptionPlan={this.props.subscriptionPlan}
          getSubscriptionPlans={this.props.getSubscriptionPlans}
        />
      ),
    });
  };

  handleViewSubscriptionsDialogClose = () => {
    this.setState({ showViewSubscriptionDialog: null });
  };

  handleSubmit = async (event) => {
    event.preventDefault();

    const selectedPlanNames = this.props.planList
      .filter((item) => this.state.items.includes(item.id))
      .map((item) => item.nickname);
    const items = this.state.items.map((item) => ({ price: item }));

    const data = {
      items: items,
      selectedPlanNames,
    };
    this.props.createSubsciptionPayment(data).then((data) => {
      this.setState({ isSubmitting: true });
      window.location.reload();
    });
  };

  render() {
    const { classes } = this.props;
    const { tableColumns, organizationsList, showViewSubscriptionDialog } = this.state;

    return (
      <div>
        <h3 className={classes.cardIconTitle}>Organisation Data</h3>
        <Card>
          <CardBody className={classes.cardBody}>
            <ReactTable data={organizationsList} columns={tableColumns} minRows={1} showPagination={true} />
          </CardBody>
        </Card>
        {showViewSubscriptionDialog}
      </div>
    );
  }
}

export default withStyles(customersStyles)(SuperAdminInfo);
