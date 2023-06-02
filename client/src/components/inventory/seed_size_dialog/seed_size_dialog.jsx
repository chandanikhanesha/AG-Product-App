import React, { Component } from 'react';
//import { flatten } from "lodash/array";

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Snackbar from '@material-ui/core/Snackbar';

import CloseIcon from '@material-ui/icons/Close';

import Button from '../../../components/material-dashboard/CustomButtons/Button';
import { seedSizeDialogStyles } from './seed_size_dialog.styles';
import SeedSizeField from './seed_size_field';
//import { getQtyShipped, getGrowerOrderDelivered } from "utilities/product";

class SeedSizeDialog extends Component {
  state = {
    seedSizes: [],
    seedCompany: {},
    addingSeedSize: false,
    showSnackbar: false,
    showSnackbarText: '',
  };

  componentWillMount = () => {
    this.renderSeedSizesData();
  };

  renderSeedSizesData = async () => {
    await this.props.listSeedSizes();
    const { seedSizes, seedCompany } = this.props;
    this.setState({
      seedSizes: seedSizes.filter((seedSize) => seedSize.seedCompanyId === seedCompany.id),
      seedCompany,
    });
  };

  componentDidUpdate = (prevProps) => {
    if (prevProps.seedSizes.length !== this.props.seedSizes.length) {
      this.renderSeedSizesData();
    }
  };
  addNewSeedSize = () => {
    const { seedSizes } = this.state;
    let newSeedSize = {
      name: null,
      seedType: null,
    };
    let newSeedSizes = [newSeedSize, ...seedSizes];
    this.setState({ seedSizes: newSeedSizes, addingSeedSize: true });
  };

  removeNewSeedSize = () => {
    const { seedSizes } = this.state;
    let newseedSizes = seedSizes.filter((seedSize) => seedSize.id !== undefined);
    this.setState({ seedSizes: newseedSizes });
  };

  addNewSeedSizeClose = () => {
    this.setState({ addingSeedSize: false });
  };

  createSeedSize = (seedSize) => {
    const { createSeedSize } = this.props;

    const createData = {
      name: seedSize.name,
      seedType: seedSize.seedType,
      seedCompanyId: this.state.seedCompany.id,
    };

    createSeedSize(createData).then(() => {
      this.setState({ addingSeedSize: false });
      this.renderSeedSizesData();
    });
  };

  updateSeedSize = (seedSize) => {
    const { updateSeedSize } = this.props;

    const updateData = {
      id: seedSize.id,
      name: seedSize.name,
      seedType: seedSize.seedType,
    };

    updateSeedSize(updateData).then(() => {
      this.setState({ addingSeedSize: false });
      this.renderSeedSizesData();
    });
  };

  deleteSeedSize = (seedSize) => {
    const { deleteSeedSize } = this.props;

    const seedSizeData = {
      id: seedSize.id,
      name: seedSize.name,
      seedType: seedSize.seedType,
    };

    deleteSeedSize(seedSizeData)
      .then((res) => {
        this.renderSeedSizesData();
      })
      .catch((e) => {
        this.setState({ showSnackbar: true, showSnackbarText: `${e}` });
      });
  };

  render() {
    const { classes, onClose, open, seedCompany } = this.props;
    const { seedSizes, addingSeedSize, showSnackbarText, showSnackbar } = this.state;
    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="md">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            <h3>SeedSize</h3>
            <div className={classes.dialogHeaderActions}>
              <Button
                color="primary"
                className={classes.addButton}
                value="Add"
                onClick={this.addNewSeedSize}
                disabled={addingSeedSize}
              >
                ADD SEED SIZE
              </Button>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <Grid container className={classes.lotGridContainer}>
          <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Name</h4>
          </Grid>
          <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Seed Type</h4>
          </Grid>
          <Grid item xs={4} style={{ display: 'flex', alignItems: 'center' }}></Grid>
          {seedSizes.map((seedSize) => {
            return (
              <SeedSizeField
                key={seedSize.id}
                seedSize={seedSize}
                classes={classes}
                seedCompany={seedCompany}
                createSeedSize={this.createSeedSize}
                updateSeedSize={this.updateSeedSize}
                deleteSeedSize={this.deleteSeedSize}
                addNewSeedSizeClose={this.addNewSeedSizeClose}
                removeNewSeedSize={this.removeNewSeedSize}
              />
            );
          })}
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={showSnackbar}
          message={<span style={{ whiteSpace: 'pre-line' }}>{showSnackbarText}</span>}
          onClick={() => this.setState({ showSnackbar: false })}
          onClose={() => this.setState({ showSnackbar: false })}
        />
      </Dialog>
    );
  }
}

export default withStyles(seedSizeDialogStyles)(SeedSizeDialog);
