import React, { Component } from 'react';
//import { flatten } from "lodash/array";
import Snackbar from '@material-ui/core/Snackbar';

import { withStyles } from '@material-ui/core';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';

import CloseIcon from '@material-ui/icons/Close';

import Button from '../../../components/material-dashboard/CustomButtons/Button';
import { packageDialogStyles } from './package_dialog.styles';
import PackageField from './package_field';
//import { getQtyShipped, getGrowerOrderDelivered } from "utilities/product";

class PackageDialog extends Component {
  state = {
    packagings: [],
    seedCompany: {},
    addingPackaging: false,
    showSnackbar: false,
    showSnackbarText: '',
  };

  componentWillMount = () => {
    this.renderPackagingsData();
  };

  renderPackagingsData = async () => {
    await this.props.listPackagings();
    const { packagings, seedCompany } = this.props;

    this.setState({
      packagings: packagings.filter((packaging) => packaging.seedCompanyId === seedCompany.id),
      seedCompany,
    });
  };
  componentDidUpdate = (prevProps) => {
    if (prevProps.packagings.length !== this.props.packagings.length) {
      this.renderPackagingsData();
    }
  };

  addNewPackaging = () => {
    const { packagings } = this.state;
    let newPackaging = {
      name: null,
      seedType: null,
      numberOfBags: 0,
    };
    let newPackagings = [newPackaging, ...packagings];
    this.setState({ packagings: newPackagings, addingPackaging: true });
  };

  removeNewPackaging = () => {
    const { packagings } = this.state;
    let newPackagings = packagings.filter((packaging) => packaging.id !== undefined);
    this.setState({ packagings: newPackagings });
  };

  addNewPackagingClose = () => {
    this.setState({ addingPackaging: false });
  };

  createPackaging = (packaging) => {
    const { createPackaging } = this.props;

    const createData = {
      name: packaging.name,
      seedType: packaging.seedType,
      numberOfBags: packaging.numberOfBags,
      seedCompanyId: this.state.seedCompany.id,
    };

    createPackaging(createData).then(() => {
      this.setState({ addingPackaging: false });
      this.renderPackagingsData();
    });
  };

  updatePackaging = (packaging) => {
    const { updatePackaging } = this.props;

    const updateData = {
      id: packaging.id,
      name: packaging.name,
      seedType: packaging.seedType,
      numberOfBags: packaging.numberOfBags,
    };

    updatePackaging(updateData).then(() => {
      this.setState({ addingPackaging: false });
      this.renderPackagingsData();
    });
  };

  deletePackaging = (packaging) => {
    const { deletePackaging } = this.props;

    const packagingData = {
      id: packaging.id,
      name: packaging.name,
      seedType: packaging.seedType,
      numberOfBags: packaging.numberOfBags,
    };

    deletePackaging(packagingData)
      .then(() => {
        this.renderPackagingsData();
      })
      .catch((e) => {
        console.log(e, 'e');

        this.setState({ showSnackbar: true, showSnackbarText: `${e}` });
      });
  };

  render() {
    const { classes, onClose, open, seedCompany } = this.props;
    const { packagings, addingPackaging, showSnackbarText, showSnackbar } = this.state;
    return (
      <Dialog open={open} onClose={onClose} fullWidth={true} maxWidth="md">
        <DialogTitle className={classes.dialogTitle}>
          <div className={classes.dialogHeader}>
            <h3>Packaging</h3>
            <div className={classes.dialogHeaderActions}>
              <Button
                color="primary"
                className={classes.addButton}
                value="Add"
                onClick={this.addNewPackaging}
                disabled={addingPackaging}
              >
                ADD PACKAGE
              </Button>
              <IconButton color="inherit" onClick={onClose} aria-label="Close">
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </DialogTitle>
        <Divider />
        <Grid container className={classes.lotGridContainer}>
          <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Name</h4>
          </Grid>
          <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Seed Type</h4>
          </Grid>
          <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}>
            <h4 className={classes.customerNameCol}>Number of Units</h4>
          </Grid>
          <Grid item xs={3} style={{ display: 'flex', alignItems: 'center' }}></Grid>

          {packagings.map((packaging) => {
            return (
              <PackageField
                key={packaging.id}
                packaging={packaging}
                classes={classes}
                seedCompany={seedCompany}
                createPackaging={this.createPackaging}
                updatePackaging={this.updatePackaging}
                deletePackaging={this.deletePackaging}
                addNewPackagingClose={this.addNewPackagingClose}
                removeNewPackaging={this.removeNewPackaging}
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

export default withStyles(packageDialogStyles)(PackageDialog);
