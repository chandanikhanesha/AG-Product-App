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

export default class SeedSizeField extends Component {
  state = {
    originalSeedSize: null,
    seedSize: null,
    ableItemActionAnchorEl: null,
    tableItemActionMenuOpen: false,
    activeTableItem: null,
  };

  componentDidMount = () => {
    const { seedSize, seedCompany } = this.props;
    this.setState({
      originalSeedSize: { ...seedSize },
      seedSize: { ...seedSize },
      seedCompany,
    });
  };

  handleSeedSizeChange = (field) => (event) => {
    const value = event.target.value;
    this.setState((state) => ({
      seedSize: {
        ...state.seedSize,
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
    const { classes, createSeedSize, updateSeedSize, deleteSeedSize, addNewSeedSizeClose, removeNewSeedSize } =
      this.props;

    const {
      tableItemActionMenuOpen,
      tableItemActionAnchorEl,
      activeTableItem,
      seedSize,
      originalSeedSize,
      seedCompany,
    } = this.state;

    if (!seedSize) {
      return null;
    }

    const checkSame =
      seedSize.id === undefined
        ? false
        : seedSize.name === originalSeedSize.name &&
          seedSize.seedType === originalSeedSize.seedType &&
          seedSize.numberOfBags === originalSeedSize.numberOfBags;

    const canAdd =
      seedSize.name !== null && seedSize.seedType !== null && seedSize.name !== '' && seedSize.seedType !== '';

    // this.seedTypeName(seedSize.seedType);

    const metadata = JSON.parse(seedCompany.metadata);
    const cropTypes = Object.keys(metadata);

    return (
      <Grid
        item
        xs={12}
        key={seedSize.id}
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <FormControl className={classes.seedSizeGridItemWidth4}>
          <CustomInput
            id={'name'}
            formControlProps={{
              fullWidth: true,
              classes: { root: classes.textItemStyles },
            }}
            inputProps={{
              type: 'text',
              value: seedSize.name,
              onChange: this.handleSeedSizeChange('name'),
              name: 'name',
              classes: { root: classes.itemWidth },
            }}
          />
        </FormControl>
        <FormControl className={classes.seedSizeGridItemWidth4}>
          <Select
            value={seedSize.seedType}
            onChange={this.handleSeedSizeChange('seedType')}
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
        <div>
          {!checkSame ? (
            <Fragment>
              <IconButton
                onClick={() => {
                  this.setState({
                    originalSeedSize: { ...this.state.seedSize },
                  });
                  seedSize.id ? updateSeedSize(this.state.seedSize) : createSeedSize(this.state.seedSize);
                  seedSize.id && addNewSeedSizeClose();
                }}
                style={canAdd ? { color: 'green' } : { color: 'grey' }}
                disabled={!canAdd}
              >
                <CheckIcon />
              </IconButton>

              <IconButton
                style={{ color: 'red' }}
                onClick={() => {
                  if (seedSize.id) {
                    const { originalSeedSize } = this.state;
                    this.setState({
                      seedSize: { ...originalSeedSize },
                    });
                  } else {
                    removeNewSeedSize();
                    addNewSeedSizeClose();
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </Fragment>
          ) : (
            <IconButton aria-label="delete" onClick={this.handleTableItemActionMenuOpen(seedSize)}>
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
                  deleteSeedSize(activeTableItem);
                  addNewSeedSizeClose();
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
