import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles, CircularProgress } from '@material-ui/core';

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

import { updateDiscountPackage, listDiscountPackages, listDealerDiscounts } from '../../store/actions';
import { isUnloadedOrLoading } from '../../utilities';

const styles = {
  iconColor: {
    color: '#fff',
  },
};

class EditDiscountPackage extends Component {
  state = {
    name: '',
    discounts: [],
    firstSetDiscouns: false,
    discountPackage: null,
  };

  componentWillMount = async () => {
    const { listDealerDiscounts, listDiscountPackages } = this.props;
    await listDealerDiscounts();
    await listDiscountPackages();
    this.setDefaultValue();
  };

  get isLoading() {
    const { discountPackagesStatus, dealerDiscountsStatus } = this.props;
    return [discountPackagesStatus, dealerDiscountsStatus].some(isUnloadedOrLoading);
  }

  componentDidUpdate = () => {
    this.setDefaultValue();
  };

  setDefaultValue = () => {
    const {
      discountPackages,
      match: {
        params: { package_id },
      },
    } = this.props;
    const { firstSetDiscouns } = this.state;
    let index = 2;
    if (discountPackages.length > 0 && !firstSetDiscouns) {
      const discountPackage = discountPackages.find(
        (_discountPackage) => _discountPackage.id === parseInt(package_id, 10),
      );
      const { dealerDiscountIds, name } = discountPackage;
      let discounts = dealerDiscountIds.map((discount) => {
        return { order: index++, DiscountId: discount };
      });
      this.setState({
        discountPackage,
        firstSetDiscouns: true,
        discounts,
        name,
      });
    }
  };

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

  updateDiscountPackage = (e) => {
    e.preventDefault();
    const { name, discounts, discountPackage } = this.state;
    const { updateDiscountPackage } = this.props;

    updateDiscountPackage({
      id: discountPackage.id,
      name,
      dealerDiscountIds: discounts.map((d) => d.DiscountId),
    }).then(() => this.props.history.push('/app/setting/discount_packages'));
  };

  render() {
    const { classes, dealerDiscounts } = this.props;
    const { name, discounts } = this.state;
    if (this.isLoading) {
      return <CircularProgress />;
    }
    return (
      <div>
        <GridContainer justifyContent="center">
          <GridItem xs={6}>
            <form action="#" onSubmit={this.updateDiscountPackage}>
              <Card>
                <CardHeader>
                  <CardIcon className={`${classes.cardIcon} ${classes.iconColor}`} color="gray">
                    <MonetizationOn />
                  </CardIcon>

                  <h4>Edit discount package </h4>
                </CardHeader>

                <CardBody>
                  <CustomInput
                    labelText="Name"
                    id="name"
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
                  <CTABar
                    text="Save"
                    secondaryAction={() => this.props.history.push('/app/setting/discount_packages')}
                  />
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
  discountPackages: state.discountPackageReducer.discountPackages,
  discountPackagesStatus: state.discountPackageReducer.loadingStatus,
  dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
  dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateDiscountPackage,
      listDealerDiscounts,
      listDiscountPackages,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(EditDiscountPackage));
