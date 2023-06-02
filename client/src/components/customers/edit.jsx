import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';

// material-ui components
import AccountBox from '@material-ui/icons/AccountBox';
import CircularProgress from '@material-ui/core/CircularProgress';

// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../components/material-dashboard/Card/CardFooter';

// custom components
import CTABar from '../cta-bar';
import CustomerForm from './form';

import { getId } from '../../utilities';
import { updateCustomer, listCustomers } from '../../store/actions';
import { LoadingStatus } from '../../store/constants';

const styles = {
  cardIcon: {
    color: 'white',
  },
  CTABar: {
    marginRight: 20,
  },
  secondaryCta: {
    backgroundColor: '#999',
  },
};

class EditCustomer extends Component {
  state = {
    name: '',
    organizationName: '',
    email: '',
    officePhoneNumber: '',
    cellPhoneNumber: '',
    deliveryAddress: '',
    businessStreet: '',
    businessCity: '',
    businessState: '',
    businessZip: '',
    monsantoTechnologyId: '',
    notes: '',
  };

  componentDidUpdate(prevProps) {
    if (!prevProps.customers.length && this.props.customers.length) {
      this.initFormFields();
    }
  }

  componentDidMount() {
    this.props.listCustomers();
    this.initFormFields();
  }

  initFormFields() {
    const { customers, match } = this.props;
    const customer = customers.find((customer) => `${getId(customer)}` === match.params.id);
    if (customer) {
      this.setState({
        id: customer.id,
        name: customer.name || '',
        organizationName: customer.organizationName || '',
        email: customer.email || '',
        officePhoneNumber: customer.officePhoneNumber || '',
        cellPhoneNumber: customer.cellPhoneNumber || '',
        deliveryAddress: customer.deliveryAddress || '',
        businessStreet: customer.businessStreet || '',
        businessCity: customer.businessCity || '',
        businessState: customer.businessState || '',
        businessZip: customer.businessZip || '',
        monsantoTechnologyId: customer.monsantoTechnologyId || '',
        notes: customer.notes || '',
      });
    }
  }

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  updateCustomer = (e) => {
    e.preventDefault();

    const { updateCustomer } = this.props;
    const {
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
    } = this.state;

    updateCustomer(this.state.id, {
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
    })
      .then(() => {
        this.props.history.push(`/app/customers/${this.state.id}`);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  render() {
    const { classes, customersLoadingStatus } = this.props;
    const {
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
    } = this.state;
    const formProps = {
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
    };

    return (
      <GridContainer justifyContent="center">
        <GridItem xs={6}>
          <form action="#" onSubmit={this.updateCustomer}>
            <Card>
              <CardHeader>
                <CardIcon className={classes.cardIcon} color="rose">
                  <AccountBox />
                </CardIcon>

                <h4>Update Customer</h4>
              </CardHeader>

              {customersLoadingStatus === LoadingStatus.Loading ? (
                <CircularProgress />
              ) : (
                <React.Fragment>
                  <CardBody>
                    <CustomerForm {...formProps} handleChange={this.handleChange} />
                  </CardBody>

                  <CardFooter>
                    <CTABar
                      text="Update"
                      secondaryAction={() => this.props.history.push(`/app/customers/${this.state.id}`)}
                    />
                  </CardFooter>
                </React.Fragment>
              )}
            </Card>
          </form>
        </GridItem>
      </GridContainer>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
    customersLoadingStatus: state.customerReducer.loadingStatus,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateCustomer,
      listCustomers,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(EditCustomer));
