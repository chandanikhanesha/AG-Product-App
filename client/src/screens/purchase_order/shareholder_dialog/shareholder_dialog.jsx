import React, { Component } from 'react';

// material ui components
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import CreatableSelect from 'react-select/creatable';
import { connect } from 'react-redux';

class ShareholderDialog extends Component {
  state = {
    name: '',
  };

  handleChange = (name) => {
    this.setState({
      name: name,
    });
  };

  submit = () => {
    const { customers } = this.props;
    const oldData = customers.find((item) => item.name === this.state.name);
    let data = {
      name: this.state.name,
    };
    if (oldData) {
      data['businessCity'] = oldData.businessCity;
      data['businessState'] = oldData.businessState;
      data['businessStreet'] = oldData.businessStreet;
      data['businessZip'] = oldData.businessZip;
      data['deliveryAddress'] = oldData.deliveryAddress;
    }

    this.props.createShareholder(data);
    this.setState({
      name: '',
    });
  };

  render() {
    const { name } = this.state;
    const { showShareholderForm, cancelShareholderDialog, customers } = this.props;
    return (
      <React.Fragment>
        <Dialog open={showShareholderForm} fullWidth>
          <DialogTitle>Create Sareholder</DialogTitle>

          <DialogContent style={{ height: '230px' }}>
            <CreatableSelect
              id="shareholder-name"
              isClearable
              onChange={(data) => data && this.handleChange(data.label)}
              onInputChange={(data) => data && this.handleChange(data)}
              placeholder="Create or Select a Shareholder"
              options={customers.map((item) => ({ label: item.name, value: item.id }))}
              // value={{ label: name, value: name }}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={cancelShareholderDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={() => this.submit()} color="primary" id="createShareHolderbtn">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    customers: state.customerReducer.customers,
  };
};

export default connect(mapStateToProps, null)(ShareholderDialog);
