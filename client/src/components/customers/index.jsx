import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import { Link } from 'react-router-dom';

// material-ui icons
import AccountBox from '@material-ui/icons/AccountBox';
import Print from '@material-ui/icons/Print';

// material-ui components
import CircularProgress from '@material-ui/core/CircularProgress';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Tooltip from '@material-ui/core/Tooltip';

// core components
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Card from '../../components/material-dashboard/Card/Card';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import Table from '../../components/material-dashboard/Table/Table';

import { getId, isPending, isUnloadedOrLoading } from '../../utilities';
import { listCustomers, listPurchaseOrders } from '../../store/actions';

import { cardTitle } from '../../assets/jss/material-dashboard-pro-react';

const styles = {
  cardIconTitle: {
    ...cardTitle,
    marginBottom: '0px',
    fontWeight: 600,
  },
  cardHeaderContent: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '15px',
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
  },
  addCustomerButton: {
    marginLeft: '28px',
  },
  addIcon: {
    margin: '0 !important',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
  fullWidth: {
    display: 'block',
  },
  printBtn: {
    marginRight: 13,
    marginLeft: 'auto',
  },
};

class CustomersList extends Component {
  state = {
    activeTab: 0,
  };

  get isLoading() {
    const { purchaseOrdersLoadingStatus, customersLoadingStatus, isOnline } = this.props;

    return isOnline && [purchaseOrdersLoadingStatus, customersLoadingStatus].some(isUnloadedOrLoading);
  }

  handleTabChange = (event, value) => {
    this.setState({
      activeTab: value,
    });
  };

  componentWillMount() {
    this.props.listCustomers();
    this.props.listPurchaseOrders();
  }

  getPurchaseOrderLinks(customerId, purchaseOrders) {
    const { classes } = this.props;
    return (
      <React.Fragment>
        {purchaseOrders.map((po) => (
          <Link key={po.id} to={`/app/customers/${customerId}/purchase_order/${po.id}`} className={classes.fullWidth}>
            {po.name}
          </Link>
        ))}
      </React.Fragment>
    );
  }

  getQuoteLinks(customerId, quotes) {
    const { classes } = this.props;
    return (
      <React.Fragment>
        {quotes.map((quote) => (
          <Link key={quote.id} to={`/app/customers/${customerId}/quote/${quote.id}`} className={classes.fullWidth}>
            {quote.name}
          </Link>
        ))}
      </React.Fragment>
    );
  }

  getPurchaseOrdersForCustomer(customer) {
    return this.props.purchaseOrders.filter((po) => po.customerId === customer.id);
  }

  getPurchaseOrderTableData() {
    const { customers, history } = this.props;
    const headers = ['Name / Organization Name', 'Purchase Orders', 'Quotes'];
    const rows = customers
      .filter((customer) => this.getPurchaseOrdersForCustomer(customer).filter((po) => !po.isQuote).length)
      .map((customer) => {
        const id = getId(customer);
        const purchaseOrders = this.getPurchaseOrdersForCustomer(customer);
        return [
          customer.name,
          this.getPurchaseOrderLinks(
            id,
            purchaseOrders.filter((po) => !po.isQuote),
          ),
          this.getQuoteLinks(
            id,
            purchaseOrders.filter((po) => po.isQuote),
          ),
          <Tooltip title="Create a new quote">
            <Button
              className="hide-print"
              color="primary"
              onClick={() => history.push(`/app/customers/${id}/quote/new`)}
              disabled={isPending(customer)}
            >
              New Quote
            </Button>
          </Tooltip>,
          <Tooltip title="Create a new purchase order">
            <Button
              className="hide-print"
              color="primary"
              onClick={() => history.push(`/app/customers/${id}/purchase_order/new`)}
              disabled={isPending(customer)}
            >
              New Purchase Order
            </Button>
          </Tooltip>,
          <Tooltip title={`View ${customer.name}'s profile`}>
            <Button
              className="hide-print"
              color="primary"
              onClick={() => this.props.history.push(`/app/customers/${id}`)}
              disabled={isPending(customer)}
            >
              Customer Profile
            </Button>
          </Tooltip>,
        ];
      });
    return { headers, rows };
  }

  getQuoteTableData() {
    const { customers, history } = this.props;
    const headers = ['Name / Organization Name', 'Quotes'];
    const rows = customers
      .filter(
        (customer) =>
          !this.getPurchaseOrdersForCustomer(customer).filter((po) => !po.isQuote).length &&
          this.getPurchaseOrdersForCustomer(customer).filter((po) => po.isQuote).length,
      )
      .map((customer) => {
        const quotes = this.getPurchaseOrdersForCustomer(customer).filter((po) => po.isQuote);
        const id = getId(customer);
        return [
          customer.name,
          this.getQuoteLinks(id, quotes),
          <Tooltip title="Create a new quote">
            <Button
              className="hide-print"
              color="primary"
              onClick={() => history.push(`/app/customers/${id}/quote/new`)}
              disabled={isPending(customer)}
            >
              New Quote
            </Button>
          </Tooltip>,
          <Tooltip title="Create a new purchase order">
            <Button
              className="hide-print"
              color="primary"
              onClick={() => history.push(`/app/customers/${id}/purchase_order/new`)}
              disabled={isPending(customer)}
            >
              New Purchase Order
            </Button>
          </Tooltip>,
          <Tooltip title={`View ${customer.name}'s profile`}>
            <Button
              className="hide-print"
              color="primary"
              onClick={() => this.props.history.push(`/app/customers/${id}`)}
              disabled={isPending(customer)}
            >
              Customer Profile
            </Button>
          </Tooltip>,
        ];
      });
    return { headers, rows };
  }

  getProspectTableData() {
    const { customers, history } = this.props;
    const headers = ['Name / Organization Name'];
    const rows = customers
      .filter(
        (customer) =>
          !this.getPurchaseOrdersForCustomer(customer).filter((po) => !po.isQuote).length &&
          !this.getPurchaseOrdersForCustomer(customer).filter((po) => po.isQuote).length,
      )
      .map((customer) => {
        const id = getId(customer);
        return [
          customer.name,
          <Tooltip title="Create a new quote">
            <Button
              className="hide-print"
              color="primary"
              onClick={() => history.push(`/app/customers/${id}/quote/new`)}
              disabled={isPending(customer)}
            >
              New Quote
            </Button>
          </Tooltip>,
          <Tooltip title="Create a new purchase order">
            <Button
              className="hide-print"
              color="primary"
              onClick={() => history.push(`/app/customers/${id}/purchase_order/new`)}
              disabled={isPending(customer)}
            >
              New Purchase Order
            </Button>
          </Tooltip>,
        ];
      });
    return { headers, rows };
  }

  print = () => {
    setTimeout(() => {
      window.print();
    }, 500);
  };

  render() {
    const { classes } = this.props;
    const { activeTab } = this.state;

    if (this.isLoading) {
      return <CircularProgress />;
    }

    const purchaseOrderTable = this.getPurchaseOrderTableData();
    const quoteTable = this.getQuoteTableData();
    const prospectTable = this.getProspectTableData();

    return (
      <Card>
        <CardHeader color="gray" icon>
          <CardIcon color="gray" className="hide-print">
            <AccountBox />
          </CardIcon>
          <div className={classes.cardHeaderContent}>
            <h4 className={classes.cardIconTitle}>Customers List</h4>
            <Button
              variant="contained"
              href="/app/customers/create"
              size="sm"
              className={`${classes.addCustomerButton} hide-print`}
              color="primary"
            >
              New Customer
            </Button>
            <Button
              className={`${classes.printBtn} hide-print`}
              color="info"
              size="sm"
              variant="contained"
              onClick={this.print}
            >
              <Print />
            </Button>
          </div>
        </CardHeader>

        <CardBody className={classes.cardBody}>
          <Tabs
            className="hide-print"
            value={this.state.activeTab}
            indicatorColor="primary"
            textColor="primary"
            onChange={this.handleTabChange}
            centered
          >
            <Tab
              label={`Purchase Orders (${purchaseOrderTable.rows.length})`}
              disabled={!purchaseOrderTable.rows.length}
            />
            <Tab label={`Quotes (${quoteTable.rows.length})`} disabled={!quoteTable.rows.length} />
            <Tab label={`Prospects (${prospectTable.rows.length})`} disabled={!prospectTable.rows.length} />
          </Tabs>
          {activeTab === 0 && (
            <Table
              hover={true}
              tableHeaderColor="primary"
              tableHead={purchaseOrderTable.headers}
              tableData={purchaseOrderTable.rows}
              striped={true}
            />
          )}
          {activeTab === 1 && (
            <Table
              hover={true}
              tableHeaderColor="primary"
              tableHead={quoteTable.headers}
              tableData={quoteTable.rows}
              striped={true}
            />
          )}
          {activeTab === 2 && (
            <Table
              hover={true}
              tableHeaderColor="primary"
              tableHead={prospectTable.headers}
              tableData={prospectTable.rows}
              striped={true}
            />
          )}
        </CardBody>
      </Card>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    isOnline: state.offline.online,
    customers: state.customerReducer.customers,
    customersLoadingStatus: state.customerReducer.loadingStatus,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
    purchaseOrdersLoadingStatus: state.purchaseOrderReducer.loadingStatus,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomers,
      listPurchaseOrders,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CustomersList));
