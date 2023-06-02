import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';

// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Tabs from '../../components/material-dashboard/CustomTabsWithoutBody/CustomTabsWithoutBody';

import { listDealerDiscounts, deleteDealerDiscount, listCustomerMonsantoProducts } from '../../store/actions';
import Discount from './discount';

const styles = {};

class DealerDiscounts extends Component {
  state = {
    selectedMenuTabIndex: 0,
  };

  componentDidMount() {
    const { listDealerDiscounts, listCustomerMonsantoProducts } = this.props;
    listDealerDiscounts();
    listCustomerMonsantoProducts();
  }
  onMenuTabChange = (selectedMenuTabIndex) => {
    this.setState({ selectedMenuTabIndex });
  };
  render() {
    const {
      dealerDiscounts,
      companies,
      seedCompanies,
      isAdmin,
      customerMonsantoProduct,
      purchaseOrders,
      deleteDealerDiscount,
    } = this.props;
    const { selectedMenuTabIndex } = this.state;
    const menuTabs = [
      { tabName: 'Flat Amount Discount', tabIndex: 'Flat Amount Discount' },
      { tabName: 'Early Pay Discount', tabIndex: 'Early Pay Discount' },
      { tabName: 'Quantity Discount', tabIndex: 'Quantity Discount' },
    ];

    let tabName = 'Flat Amount Discount';
    if (selectedMenuTabIndex === 0) {
      tabName = 'Flat Amount Discount';
    } else if (selectedMenuTabIndex === 1) {
      tabName = 'Early Pay Discount';
    } else if (selectedMenuTabIndex === 2) {
      tabName = 'Quantity Discount';
    }
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'baseline' }}>
          <Tabs
            headerColor="gray"
            selectedTab={selectedMenuTabIndex}
            onTabChange={this.onMenuTabChange}
            tabs={menuTabs}
          />
          {(isAdmin === true || isAdmin === 'true') && (
            <Button
              color="primary"
              style={{ height: '45px' }}
              id="createDiscount"
              onClick={() => this.props.history.push('/app/setting/discount_editor/create')}
            >
              Create discount
            </Button>
          )}
        </div>

        <GridContainer>
          {dealerDiscounts
            .filter((d) => d.discountStrategy == tabName)
            .map((dealerDiscount) => {
              return (
                <GridItem xs={4} key={dealerDiscount.id}>
                  <Discount
                    dealerDiscount={dealerDiscount}
                    companies={companies}
                    seedCompanies={seedCompanies}
                    deleteDealerDiscount={deleteDealerDiscount}
                    history={this.props.history}
                    isAdmin={isAdmin === true || isAdmin === 'true'}
                    customerMonsantoProduct={customerMonsantoProduct}
                    purchaseOrders={purchaseOrders}
                  />
                </GridItem>
              );
            })}
        </GridContainer>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  dealerDiscounts: state.dealerDiscountReducer.dealerDiscounts,
  companies: state.companyReducer.companies,
  seedCompanies: state.seedCompanyReducer.seedCompanies,
  isAdmin: state.userReducer.isAdmin,
  customerMonsantoProduct: state.customerMonsantoProductReducer.customerMonsantoProducts,
  purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listDealerDiscounts,
      deleteDealerDiscount,
      listCustomerMonsantoProducts,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(DealerDiscounts));
