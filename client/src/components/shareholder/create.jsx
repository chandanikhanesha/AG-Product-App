import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';

// material-ui icons
import AccountBox from '@material-ui/icons/AccountBox';

// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../components/material-dashboard/Card/CardFooter';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';

// custom components
import CTABar from '../cta-bar';

import { createShareholder } from '../../store/actions';

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

class CreateShareholder extends Component {
  state = {
    name: '',
  };

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  onSubmit = (e) => {
    e.preventDefault();

    const { createShareholder, match } = this.props;
    const { name } = this.state;
    const customerId = match.params.customer_id;
    createShareholder(customerId, { name }).then(() => {
      this.props.history.push(`/app/customers/${customerId}`);
    });
  };

  render() {
    const { name } = this.state;
    const { classes, match } = this.props;

    return (
      <GridContainer justifyContent="center">
        <GridItem xs={6}>
          <form action="#" onSubmit={this.onSubmit}>
            <Card>
              <CardHeader>
                <CardIcon className={classes.cardIcon} color="gray">
                  <AccountBox />
                </CardIcon>
              </CardHeader>

              <CardBody>
                <CustomInput
                  labelText="Shareholder Name"
                  id="name"
                  formControlProps={{
                    fullWidth: true,
                    required: true,
                  }}
                  inputProps={{
                    value: name,
                    onChange: this.handleChange('name'),
                  }}
                />
              </CardBody>

              <CardFooter>
                <CTABar secondaryAction={() => this.props.history.push(`/app/customers/${match.params.customer_id}`)} />
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
      createShareholder,
    },
    dispatch,
  );

export default withStyles(styles)(connect(null, mapDispatchToProps)(CreateShareholder));
