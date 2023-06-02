import React, { Component } from 'react';

// material ui components
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

// material dashboard components
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';

class FarmFormDialog extends Component {
  state = {
    name: '',
  };

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  submit = () => {
    const { close, update, farm, match } = this.props;
    const customerId = match.params.customer_id;
    farm.name = this.state.name;
    update(customerId, farm).then(() => {
      close();
    });

    this.setState({
      name: '',
    });
  };

  render() {
    const { name } = this.state;
    const { open, close, farm } = this.props;

    return (
      <React.Fragment>
        <Dialog open={open}>
          <DialogTitle>Farm Name</DialogTitle>

          <DialogContent>
            <CustomInput
              labelText="Edit Farm Name"
              id="farm-name"
              formControlProps={{
                fullWidth: true,
                required: true,
              }}
              inputProps={{
                value: name || farm.name,
                onChange: this.handleChange('name'),
              }}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={close} color="primary">
              Cancel
            </Button>
            <Button onClick={this.submit} color="primary">
              Update
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default FarmFormDialog;
