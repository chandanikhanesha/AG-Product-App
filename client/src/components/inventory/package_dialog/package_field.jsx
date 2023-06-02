import React, { Component, Fragment } from 'react';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Grid from '@material-ui/core/Grid';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Popover from '@material-ui/core/Popover';
import MenuList from '@material-ui/core/MenuList';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';

import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import MoreHorizontalIcon from '@material-ui/icons/MoreHoriz';

export default class PackageField extends Component {
  state = {
    originalPackaging: null,
    packaging: null,
    ableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,
    activeTableItem: null,
  };

  componentDidMount = () => {
    const { packaging, seedCompany } = this.props;
    this.setState({
      originalPackaging: { ...packaging },
      packaging: { ...packaging },
      seedCompany,
    });
  };

  handlePackagingChange = (field) => (event) => {
    const value = event.target.value;
    this.setState((state) => ({
      packaging: {
        ...state.packaging,
        [field]: value,
      },
    }));
  };

  handleTableItemActionMenuOpen = (item) => (event) => {
    this.setState({
      tableItemActionMenuOpen: true,
      tableItemActionAnchorEl: event.target,
      activeTableItem: item,
    });
  };

  handleTableItemActionMenuClose = () => {
    this.setState({ tableItemActionMenuOpen: false, activeTableItem: null });
  };

  seedTypeName = (seedType) => {
    const { seedCompany } = this.state;
    const metadata = JSON.parse(seedCompany.metadata);
    return metadata[seedType] ? metadata[seedType].brandName : '';
  };

  render() {
    const { classes, createPackaging, updatePackaging, deletePackaging, addNewPackagingClose, removeNewPackaging } =
      this.props;

    const {
      tableItemActionMenuOpen,
      tableItemActionAnchorEl,
      activeTableItem,
      packaging,
      originalPackaging,
      seedCompany,
    } = this.state;

    if (!packaging) {
      return null;
    }

    const checkSame =
      packaging.id === undefined
        ? false
        : packaging.name === originalPackaging.name &&
          packaging.seedType === originalPackaging.seedType &&
          packaging.numberOfBags === originalPackaging.numberOfBags;

    const canAdd =
      packaging.name !== null && packaging.seedType !== null && packaging.name !== '' && packaging.seedType !== '';

    // this.seedTypeName(packaging.seedType);

    const metadata = JSON.parse(seedCompany.metadata);
    const cropTypes = Object.keys(metadata);
    return (
      <Grid
        item
        xs={12}
        key={packaging.id}
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <FormControl className={classes.packagingGridItemWidth3}>
          <CustomInput
            id={'name'}
            formControlProps={{
              fullWidth: true,
              classes: { root: classes.textItemStyles },
            }}
            inputProps={{
              type: 'text',
              value: packaging.name,
              onChange: this.handlePackagingChange('name'),
              name: 'name',
              classes: { root: classes.itemWidth },
            }}
          />
        </FormControl>
        <FormControl className={classes.packagingGridItemWidth3}>
          <Select
            value={packaging.seedType}
            onChange={this.handlePackagingChange('seedType')}
            inputProps={{
              required: true,
              id: 'seedType',
              name: 'seedType',
            }}
            className={classes.itemWidth}
          >
            {cropTypes
              .filter((seedType) => metadata[seedType].brandName.trim() !== '')
              .map((cropType, index) => (
                <MenuItem key={index} value={cropType.toUpperCase()}>
                  {metadata[cropType].brandName}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        <FormControl className={classes.packagingGridItemWidth3}>
          <CustomInput
            id={'number'}
            formControlProps={{
              fullWidth: true,
              classes: { root: classes.textItemStyles },
            }}
            inputProps={{
              type: 'number',
              value: packaging.numberOfBags,
              classes: { root: classes.itemWidth },
              name: 'numberOfBags',
              onChange: this.handlePackagingChange('numberOfBags'),
            }}
          />
        </FormControl>
        <div>
          {!checkSame ? (
            <Fragment>
              <IconButton
                onClick={() => {
                  this.setState({
                    originalPackaging: { ...this.state.packaging },
                  });
                  packaging.id ? updatePackaging(this.state.packaging) : createPackaging(this.state.packaging);

                  packaging.id && addNewPackagingClose();
                  //onSave(this.state.packaging);
                }}
                style={canAdd ? { color: 'green' } : { color: 'grey' }}
                disabled={!canAdd}
              >
                <CheckIcon />
              </IconButton>
              <IconButton
                style={{ color: 'red' }}
                onClick={() => {
                  if (packaging.id) {
                    const { originalPackaging } = this.state;
                    this.setState({
                      packaging: { ...originalPackaging },
                    });
                  } else {
                    removeNewPackaging();
                    addNewPackagingClose();
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Fragment>
          ) : (
            <IconButton aria-label="delete" onClick={this.handleTableItemActionMenuOpen(packaging)}>
              <MoreHorizontalIcon fontSize="small" />
            </IconButton>
          )}
        </div>
        <Divider />
        <Popover
          open={tableItemActionMenuOpen}
          anchorEl={tableItemActionAnchorEl}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          onClose={this.handleTableItemActionMenuClose}
        >
          <Paper>
            <MenuList>
              <MenuItem
                className={classes.addNewMenuItem}
                onClick={() => {
                  deletePackaging(activeTableItem);
                  addNewPackagingClose();
                  this.handleTableItemActionMenuClose();
                }}
              >
                Delete
              </MenuItem>
            </MenuList>
          </Paper>
        </Popover>
      </Grid>
    );
  }
}
