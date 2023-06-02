import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SweetAlert from 'react-bootstrap-sweetalert';
import { withStyles } from '@material-ui/core';
import sweetAlertStyle from '../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';

// icons
import Edit from '@material-ui/icons/Edit';
import Remove from '@material-ui/icons/Remove';
import CircularProgress from '@material-ui/core/CircularProgress';

// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardBody from '../../components/material-dashboard/Card/CardBody';

import { listDiscountPackages, deleteDiscountPackage, listDealerDiscounts } from '../../store/actions';
import { isUnloadedOrLoading } from '../../utilities';

const styles = {
  editButton: {
    position: 'absolute',
    top: 5,
    right: 70,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  sweetAlertStyle,
};

class DiscountPackages extends Component {
  state = {
    removePackageDialog: null,
  };
  componentDidMount() {
    this.props.listDealerDiscounts();
    this.props.listDiscountPackages();
  }

  get isLoading() {
    const { discountPackagesStatus, dealerDiscountsStatus } = this.props;
    return [discountPackagesStatus, dealerDiscountsStatus].some(isUnloadedOrLoading);
  }

  removeDiscountPackage = (discountPackage) => (event) => {
    const { deleteDiscountPackage, classes } = this.props;
    this.setState({
      removePackageDialog: (
        <SweetAlert
          showCancel
          title={'Remove Package: ' + discountPackage.name}
          onConfirm={() => {
            deleteDiscountPackage(discountPackage.id);
            this.setState({ removePackageDialog: null });
          }}
          onCancel={() => this.setState({ removePackageDialog: null })}
          confirmBtnText="Confirm"
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnText="Cancel"
          cancelBtnCssClass={classes.button + ' ' + classes.white + ' ' + classes.primary}
        >
          You are going to delete Package {discountPackage.name}!
        </SweetAlert>
      ),
    });
  };

  render() {
    const { discountPackages, classes, dealerDiscounts, isAdmin } = this.props;
    const { removePackageDialog } = this.state;

    if (this.isLoading) {
      return <CircularProgress />;
    }

    return (
      <div>
        {(isAdmin === true || isAdmin === 'true') && (
          <Button
            color="primary"
            onClick={() => this.props.history.push('/app/discount_packages/create')}
            id="createPackage"
          >
            Create discount package
          </Button>
        )}

        <GridContainer>
          {discountPackages.map((discountPackage) => {
            return (
              <GridItem xs={4} key={discountPackage.id}>
                <Card>
                  <CardHeader>
                    <h4>{discountPackage.name}</h4>
                    {(isAdmin === true || isAdmin === 'true') && (
                      <Button
                        justIcon
                        round
                        color="primary"
                        onClick={() => this.props.history.push(`/app/discount_packages/${discountPackage.id}/edit`)}
                        className={classes.editButton}
                      >
                        <Edit />
                      </Button>
                    )}
                    {(isAdmin === true || isAdmin === 'true') && (
                      <Button
                        justIcon
                        round
                        color="danger"
                        onClick={this.removeDiscountPackage(discountPackage)}
                        className={classes.removeButton}
                      >
                        <Remove />
                      </Button>
                    )}
                  </CardHeader>

                  <CardBody>
                    {discountPackage.dealerDiscountIds.map((discountId) => {
                      const discount = dealerDiscounts.find((discount) => discount.id === discountId);
                      if (!discount) return null;
                      return <div key={discount.id}>{discount.name}</div>;
                    })}
                  </CardBody>
                </Card>
              </GridItem>
            );
          })}
        </GridContainer>
        {removePackageDialog}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  discountPackages: state.discountPackageReducer.discountPackages,
  discountPackagesStatus: state.discountPackageReducer.loadingStatus,
  dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
  dealerDiscountsStatus: state.dealerDiscountReducer.loadingStatus,
  isAdmin: state.userReducer.isAdmin,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listDiscountPackages,
      deleteDiscountPackage,
      listDealerDiscounts,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(DiscountPackages));
