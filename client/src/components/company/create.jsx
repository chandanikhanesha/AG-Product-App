import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';

// material-ui icons
import BusinessCenter from '@material-ui/icons/BusinessCenter';

// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../components/material-dashboard/Card/CardFooter';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';

import { eventEmitter } from '../../event_emitter';

import { createCompany } from '../../store/actions';

// custom components
import CTABar from '../cta-bar';

const styles = {
  cardIcon: {
    color: 'white',
  },
};

class CreateCompany extends Component {
  state = {
    name: '',
  };

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  createCompany = (e) => {
    const { createCompany } = this.props;
    const { name } = this.state;
    e.preventDefault();

    createCompany({ name }).then((response) => {
      eventEmitter.emit('newCompany');
      this.props.history.push(`/app/companies/${response.payload.id}`);
    });
  };

  render() {
    const { classes } = this.props;
    const { name } = this.state;

    return (
      <GridContainer justifyContent="center">
        <GridItem xs={6}>
          <form action="#" onSubmit={this.createCompany}>
            <Card>
              <CardHeader>
                <CardIcon className={classes.cardIcon} color="gray">
                  <BusinessCenter />
                </CardIcon>

                <h4>Create Company</h4>
              </CardHeader>

              <CardBody>
                <CustomInput
                  labelText="Company Name"
                  id="name"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  inputProps={{
                    value: name,
                    onChange: this.handleChange('name'),
                  }}
                />
              </CardBody>

              <CardFooter>
                <CTABar secondaryAction={() => this.props.history.push(`/app/customers`)} />
              </CardFooter>
            </Card>
          </form>
        </GridItem>
      </GridContainer>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createCompany,
    },
    dispatch,
  );

export default withStyles(styles)(connect(null, mapDispatchToProps)(CreateCompany));
