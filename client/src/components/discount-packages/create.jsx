import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';

// icons
import MonetizationOn from '@material-ui/icons/MonetizationOn';

// core components
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../components/material-dashboard/Card/CardFooter';

// custom components
import CTABar from '../cta-bar';
import DiscountSelector from '../../components/purchase-order/discount_selector';

import { createDiscountPackage, listDealerDiscounts } from '../../store/actions';

const styles = {
  iconColor: {
    color: '#fff',
  },
};

class CreateDiscountPackage extends Component {
  state = {
    name: '',
    discounts: [],
  };

  componentDidMount() {
    this.props.listDealerDiscounts();
  }

  handleChange = (name) => (event) => {
    let val = event.target.hasOwnProperty('checked') ? event.target.checked : event.target.value;
    this.setState({
      [name]: val,
    });
  };

  onDiscountsUpdate = (discounts) => {
    this.setState({
      discounts: discounts,
    });
  };

  createDiscountPackage = (e) => {
    e.preventDefault();
    const { name, discounts } = this.state;
    const { createDiscountPackage } = this.props;

    createDiscountPackage({ name, dealerDiscountIds: discounts.map((d) => d.DiscountId) }).then(() =>
      this.props.history.push('/app/setting/discount_packages'),
    );
  };

  render() {
    const { classes, dealerDiscounts } = this.props;
    const { name, discounts } = this.state;

    return (
      <div id="discountPackage">
        <GridContainer justifyContent="center">
          <GridItem xs={6}>
            <form action="#" onSubmit={this.createDiscountPackage}>
              <Card>
                <CardHeader>
                  <CardIcon className={`${classes.cardIcon} ${classes.iconColor}`} color="gray">
                    <MonetizationOn />
                  </CardIcon>

                  <h4>Create discount package</h4>
                </CardHeader>

                <CardBody>
                  <CustomInput
                    labelText="Name"
                    id="disPackageName"
                    formControlProps={{
                      required: true,
                    }}
                    inputProps={{
                      value: name,
                      onChange: this.handleChange('name'),
                    }}
                  />

                  <DiscountSelector
                    discounts={discounts}
                    dealerDiscounts={dealerDiscounts}
                    onUpdate={this.onDiscountsUpdate}
                  />
                </CardBody>

                <CardFooter>
                  <CTABar secondaryAction={() => this.props.history.push('/app/setting/discount_packages')} />
                </CardFooter>
              </Card>
            </form>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createDiscountPackage,
      listDealerDiscounts,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CreateDiscountPackage));
