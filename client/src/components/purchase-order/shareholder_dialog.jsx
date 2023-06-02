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
    this.props.createShareholder(this.state.name);

    this.setState({
      name: '',
    });
  };

  render() {
    const { name } = this.state;
    const { showShareholderForm, cancelShareholderDialog } = this.props;

    return (
      <React.Fragment>
        <Dialog open={showShareholderForm}>
          <DialogTitle>Create Shareholder</DialogTitle>

          <DialogContent>
            <CustomInput
              labelText="Shareholder name"
              id="shareholder-name"
              formControlProps={{
                fullWidth: true,
                required: true,
              }}
              inputProps={{
                defaultValue: name,
                onChange: this.handleChange('name'),
              }}
            />
          </DialogContent>

          <DialogActions>
            <Button onClick={cancelShareholderDialog} color="primary">
              Cancel
            </Button>
            <Button onClick={this.submit} color="primary">
              Create
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

export default FarmFormDialog;
