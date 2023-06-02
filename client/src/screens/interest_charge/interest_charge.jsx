import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';

import Button from '../../components/material-dashboard/CustomButtons/Button';

import { interestChargeStyles } from './interest_charge.styles';
import ShowInterestCharge from './show_interest_charge';

class InterestCharge extends Component {
  state = {};

  componentDidMount() {
    const { listInterestCharges } = this.props;
    listInterestCharges(true);
  }

  render() {
    const { isAdmin } = this.props;
    return (
      <div>
        {(isAdmin === true || isAdmin === 'true') && (
          <Button color="primary" onClick={() => this.props.history.push('/app/setting/interest_charge/create')}>
            Create New Interest Charge
          </Button>
        )}
        <ShowInterestCharge
          isAdmin={isAdmin === true || isAdmin === 'true'}
          history={this.props.history}
          interestCharges={this.props.interestCharges}
          listInterestCharges={this.props.listInterestCharges}
        />
      </div>
    );
  }
}

export default withStyles(interestChargeStyles)(InterestCharge);
