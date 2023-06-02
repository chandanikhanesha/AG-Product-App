import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import { Link } from 'react-router-dom';

import SweetAlert from 'react-bootstrap-sweetalert';
import get from 'lodash/get';

// icons
import DeleteForever from '@material-ui/icons/DeleteForever';

// material-ui components
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';

// core components
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import Table from '../../components/material-dashboard/Table/Table';

import { primaryColor } from '../../assets/jss/material-dashboard-pro-react';

import {
  listPurchaseOrders,
  listCustomers,
  deleteCustomer,
  deleteShareholder,
  listShareholders,
  listFarms,
  deleteFarm,
} from '../../store/actions';
import { LoadingStatus } from '../../store/constants';
import { metaId, isPending } from '../../utilities';

const styles = {
  scroll: {
    overflow: 'auto',
    height: '100%',
  },
  tabRoot: {
    paddingLeft: 3,
  },
  isCurrent: {
    borderLeft: `3px solid ${primaryColor}`,
    paddingLeft: 0,
  },
  tabSelected: {
    color: 'blue',
  },
  customerInfoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  customerInfo: {
    margin: '15px 0 15px',
  },
  customerInfoLabel: {
    fontWeight: 'bold',
    marginRight: 20,
    width: 150,
    display: 'inline-block',
  },
  customerInfoText: {
    fontSize: '1.3em',
  },
  editBtn: {
    backgroundColor: '#999',
    marginRight: 20,
  },
  btnStyles: {
    padding: '8px 12px',
  },
};

const getCustomer = (customers, customerId) => {
  return customers.find((customer) => {
    return `${customer.id}` === customerId || get(customer, 'meta.id') === customerId;
  });
};

class CustomerShow extends Component {
  state = {
    deleteCustomerConfirmation: null,
    deleteShareholderConfirmation: null,
    deleteFarmConfirmation: null,
  };

  componentDidMount() {
    const { listCustomers, listShareholders, listFarms } = this.props;
    const customer = getCustomer(this.props.customers, this.props.match.params.id);
    if (customer && customer.meta && customer.meta.pending === true) return;
    const customerId = this.props.match.params.id;
    listCustomers();
    listShareholders(customerId);
    listFarms(customerId);
    listPurchaseOrders();
  }

  componentDidUpdate(prevProps) {
    const { listCustomers, listShareholders, listFarms } = this.props;
    const customer = getCustomer(this.props.customers, this.props.match.params.id);
    const prevCustomer = getCustomer(prevProps.customers, prevProps.match.params.id);
    if (metaId(customer) === metaId(prevCustomer) && !isPending(customer) && isPending(prevCustomer)) {
      listCustomers();
      listShareholders(customer.id);
      listFarms(customer.id);
      this.props.history.push(`/app/customers/${customer.id}`);
    }
  }

  deleteCustomer = () => {
    const { deleteCustomer } = this.props;
    deleteCustomer(this.props.match.params.id).then(() => {
      this.props.history.push('/app/customers');
    });
  };

  deleteShareholder = (shareholder) => {
    const { deleteShareholder, match } = this.props;
    deleteShareholder(match.params.id, shareholder);
    this.setState({
      deleteShareholderConfirmation: null,
    });
  };

  deleteFarm = (farm) => {
    const { deleteFarm, match } = this.props;
    deleteFarm(match.params.id, farm);
    this.setState({
      deleteFarmConfirmation: null,
    });
  };

  showShareholderDeleteWarning = (shareholder) => {
    const { classes } = this.props;

    this.setState({
      deleteShareholderConfirmation: (
        <SweetAlert
          warning
          showCancel
          title="Delete Shareholder"
          onConfirm={() => this.deleteShareholder(shareholder)}
          onCancel={() => {
            this.setState({
              deleteShareholderConfirmation: null,
            });
          }}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to remove shareholder: <br /> {shareholder.name}
        </SweetAlert>
      ),
    });
  };

  showFarmDeleteWarning = (farm) => {
    const { classes } = this.props;

    this.setState({
      deleteFarmConfirmation: (
        <SweetAlert
          warnings
          showCancel
          title="Delete Farm"
          onConfirm={() => this.deleteFarm(farm)}
          onCancel={() => {
            this.setState({
              deleteFarmConfirmation: null,
            });
          }}
          confirmBtnCssClass={classes.button + ' ' + classes}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to remove the farm: <br /> {farm.name}
        </SweetAlert>
      ),
    });
  };

  showDeleteConfirmation() {
    const { classes } = this.props;

    this.setState({
      deleteCustomerConfirmation: (
        <SweetAlert
          warning
          showCancel
          title="Delete Cusomer"
          onConfirm={() => this.deleteCustomer()}
          onCancel={() => {
            this.setState({
              deleteCustomerConfirmation: null,
            });
          }}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to remove customer: <br /> {this.state.name} ?
        </SweetAlert>
      ),
    });
  }

  renderShareholdersTable() {
    const { customers, match, shareholders } = this.props;
    const customer = getCustomer(customers, match.params.id) || {};
    if (!customer || !customer.name) return [];

    let tableData = shareholders
      .filter((shareholder) => shareholder.customerId === customer.id)
      .map((shareholder) => {
        return [
          shareholder.name,
          <Button
            justIcon
            round
            size="sm"
            color="danger"
            onClick={() => this.showShareholderDeleteWarning(shareholder)}
          >
            <DeleteForever />
          </Button>,
        ];
      });

    return <Table hover={true} tableHead={['Name', '']} tableData={tableData} />;
  }

  renderFarmsTable() {
    const { farms, match, customers } = this.props;
    const customer = getCustomer(customers, match.params.id) || {};
    if (!customer || !customer.name) return [];

    let tableData = farms
      .filter((farm) => farm.customerId === customer.id)
      .map((farm) => {
        return [
          farm.name,
          <Button justIcon round size="sm" color="danger" onClick={() => this.showFarmDeleteWarning(farm)}>
            <DeleteForever />
          </Button>,
        ];
      });

    return <Table hover={true} tableHead={['Name', '']} tableData={tableData} />;
  }

  renderPurchaseOrdersTable(isQuote = false) {
    const { purchaseOrders, customers, match } = this.props;
    const customer = getCustomer(customers, match.params.id) || {};
    if (!customer || !customer.name) return [];

    let tableData = purchaseOrders
      .filter((po) => po.customerId === customer.id)
      .filter((po) => (isQuote ? po.isQuote : !po.isQuote))
      .map((purchaseOrder) => [
        <Link
          key={purchaseOrder.id}
          to={`/app/customers/${customer.id}/${isQuote ? 'quote' : 'purchase_order'}/${purchaseOrder.id}`}
        >
          {purchaseOrder.name}
        </Link>,
      ]);

    return <Table hover={true} tableHead={['Name']} tableData={tableData} />;
  }

  render() {
    const { classes, customersLoadingStatus, customers, match } = this.props;
    const { deleteCustomerConfirmation, deleteShareholderConfirmation, deleteFarmConfirmation } = this.state;

    const customer = getCustomer(customers, match.params.id) || {};
    const {
      id,
      name,
      organizationName,
      email,
      officePhoneNumber,
      cellPhoneNumber,
      deliveryAddress,
      businessStreet,
      businessCity,
      businessState,
      businessZip,
      monsantoTechnologyId,
      notes,
    } = customer;

    return (
      <React.Fragment>
        {deleteCustomerConfirmation}
        {deleteShareholderConfirmation}
        {deleteFarmConfirmation}
        {customersLoadingStatus === LoadingStatus.Loading ? (
          <CircularProgress />
        ) : (
          <Grid container spacing={24}>
            <Grid item sm={6} xs={12}>
              <div>
                <div className={classes.scroll}>
                  <section id="customer-info" className={classes.section}>
                    <Card>
                      <CardHeader className={classes.customerInfoHeader}>
                        <h4>Customer Info {isPending(customer) ? '(Pending Create)' : null}</h4>
                        <div>
                          <Button
                            className={`${classes.editBtn} ${classes.btnStyles}`}
                            onClick={() => this.props.history.push(`/app/customers/edit/${id}`)}
                            disabled={isPending(customer)}
                          >
                            Edit
                          </Button>
                          <Button
                            className={classes.btnStyles}
                            color="danger"
                            onClick={() => this.showDeleteConfirmation()}
                            disabled={isPending(customer)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardHeader>

                      <CardBody>
                        <div className={classes.customerInfo}>
                          <span className={classes.customerInfoLabel}>Name</span>
                          <span className={classes.customerInfoText}>{name}</span>
                        </div>

                        <div className={classes.customerInfo}>
                          <span className={classes.customerInfoLabel}>Organization Name</span>
                          <span className={classes.customerInfoText}>{organizationName}</span>
                        </div>

                        <div className={classes.customerInfo}>
                          <span className={classes.customerInfoLabel}>Email</span>
                          <span className={classes.customerInfoText}>{email}</span>
                        </div>

                        <div className={classes.customerInfo}>
                          <span className={classes.customerInfoLabel}>Office Phone Number</span>
                          <span className={classes.customerInfoText}>{officePhoneNumber}</span>
                        </div>

                        <div className={classes.customerInfo}>
                          <span className={classes.customerInfoLabel}>Cell Phone Number</span>
                          <span className={classes.customerInfoText}>{cellPhoneNumber}</span>
                        </div>

                        <div className={classes.customerInfo}>
                          <span className={classes.customerInfoLabel}>Delivery Address</span>
                          <span className={classes.customerInfoText}>{deliveryAddress}</span>
                        </div>

                        <div className={classes.customerInfo}>
                          <span className={classes.customerInfoLabel}>Business Address</span>
                          <span className={classes.customerInfoText}>{businessStreet}</span>
                          <span className={classes.customerInfoText}>, {businessCity}</span>
                          <span className={classes.customerInfoText}>, {businessState}</span>
                          <span className={classes.customerInfoText}>, {businessZip}</span>
                        </div>
                      </CardBody>
                    </Card>
                  </section>
                </div>
              </div>
            </Grid>
            <Grid item sm={6} xs={12}>
              <section id="customer-notes" className={classes.section}>
                <Card>
                  <CardHeader>
                    <h4>Customer Notes</h4>
                  </CardHeader>

                  <CardBody>{notes}</CardBody>
                </Card>
              </section>

              <section id="monsanto-tech-id" className={classes.section}>
                <Card>
                  <CardHeader>
                    <h4>Bayer Technology ID</h4>
                  </CardHeader>

                  <CardBody>{monsantoTechnologyId}</CardBody>
                </Card>
              </section>
            </Grid>
            <Grid item sm={6} xs={12}>
              <section id="shareholders" className={classes.section}>
                <Card>
                  <CardHeader className={classes.customerInfoHeader}>
                    <h4>Shareholders</h4>
                    <div>
                      <Button
                        className={classes.btnStyles}
                        color="primary"
                        onClick={() => this.props.history.push(`/app/customers/${id}/shareholders/create`)}
                      >
                        Add Shareholder
                      </Button>
                    </div>
                  </CardHeader>

                  <CardBody>{this.renderShareholdersTable()}</CardBody>
                </Card>
              </section>
            </Grid>
            <Grid item sm={6} xs={12}>
              <section id="farms" className={classes.section}>
                <Card>
                  <CardHeader className={classes.customerInfoHeader}>
                    <h4>Farms</h4>
                    <div>
                      <Button
                        className={classes.btnStyles}
                        color="primary"
                        onClick={() => this.props.history.push(`/app/customers/${id}/farms/create`)}
                      >
                        Add Farm
                      </Button>
                    </div>
                  </CardHeader>

                  <CardBody>{this.renderFarmsTable()}</CardBody>
                </Card>
              </section>
            </Grid>

            <Grid item sm={6} xs={12}>
              <section id="purchase-orders" className={classes.section}>
                <Card>
                  <CardHeader className={classes.customerInfoHeader}>
                    <h4>Purchase Orders</h4>
                    <div>
                      <Button
                        className={classes.btnStyles}
                        color="primary"
                        onClick={() => this.props.history.push(`/app/customers/${id}/purchase_order/new`)}
                      >
                        Create Purchase Order
                      </Button>
                    </div>
                  </CardHeader>

                  <CardBody>{this.renderPurchaseOrdersTable()}</CardBody>
                </Card>
              </section>
            </Grid>

            <Grid item sm={6} xs={12}>
              <section id="quotes" className={classes.section}>
                <Card>
                  <CardHeader className={classes.customerInfoHeader}>
                    <h4>Quotes</h4>
                    <div>
                      <Button
                        className={classes.btnStyles}
                        color="primary"
                        onClick={() => this.props.history.push(`/app/customers/${id}/quote/new`)}
                      >
                        Create Quote
                      </Button>
                    </div>
                  </CardHeader>

                  <CardBody>{this.renderPurchaseOrdersTable(true)}</CardBody>
                </Card>
              </section>
            </Grid>
          </Grid>
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
    customersLoadingStatus: state.customerReducer.loadingStatus,
    shareholders: state.shareholderReducer.shareholders,
    farms: state.farmReducer.farms,
    purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listCustomers,
      deleteCustomer,
      deleteShareholder,
      listShareholders,
      deleteFarm,
      listFarms,
      listPurchaseOrders,
    },
    dispatch,
  );

export default withStyles(styles, { withTheme: true })(connect(mapStateToProps, mapDispatchToProps)(CustomerShow));
