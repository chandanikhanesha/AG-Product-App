import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import CircularProgress from '@material-ui/core/CircularProgress';

import {
  listBackupDealerDiscounts,
  listBackupCustomer,
  listPurchaseOrders,
  createBackupPdf,
  deleteAllRecord,
} from '../../store/actions';
import Button from '../../components/material-dashboard/CustomButtons/Button';

class Settings extends Component {
  state = {
    selectedTab: 0,
    selectedCustomer: [],
    selectedDiscount: [],
    isProcess: false,
  };
  componentDidMount() {
    const { listBackupDealerDiscounts, listBackupCustomer, listPurchaseOrders } = this.props;
    listBackupDealerDiscounts();
    // listBackupCustomer();
    listPurchaseOrders();
  }

  onTabChange(selectedTabIndex) {
    this.setState({
      selectedTab: selectedTabIndex,
    });
  }
  getPurchaseOrdersForCustomer(item) {
    const customer = item !== undefined ? item.id : 0;
    return this.props.purchaseOrders.filter((po) => po.customerId === customer);
  }

  backupProcess = async () => {
    const json = localStorage.getItem('reduxPersist:organizationReducer');

    const json1 = localStorage.getItem('reduxPersist:backupCustomerReducer');

    const orgName = JSON.parse(json).name;
    const orgId = JSON.parse(json).id;
    const customersData = JSON.parse(json1, customersData);
    this.setState({ isProcess: true });
    await this.props
      .createBackupPdf(orgName, orgId, customersData)
      .then((res) => {
        console.log('Backup All PDF succesfully');
        this.props
          .deleteAllRecord()
          .then((res) => {
            this.setState({ isProcess: false });
          })
          .catch((e) => {
            console.log(e, 'error while delete table record');
          });
      })
      .catch((e) => {
        console.log(e, 'error while createPdf');
      });
  };

  render() {
    return (
      <div>
        <Button color="primary" disabled={this.state.isProcess} onClick={() => this.backupProcess()}>
          Backup
        </Button>
        {this.state.isProcess && (
          <CircularProgress
            size={24}
            style={{ position: 'absolute', top: '35%', left: '8%', marginTop: -12, marginLeft: -12 }}
          />
        )}
      </div>
    );
  }
}

Settings.propTypes = {
  second: PropTypes.third,
};

const mapStateToProps = (state) => ({
  backupCustomers: state.backupCustomerReducer.backupCustomers,
  backupDealerDiscounts: state.backupDiscountReducer.backupDealerDiscounts,
  purchaseOrders: state.purchaseOrderReducer.purchaseOrders,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listBackupDealerDiscounts,
      listBackupCustomer,
      listPurchaseOrders,
      createBackupPdf,
      deleteAllRecord,
    },
    dispatch,
  );

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
