import React, { Component, Fragment } from 'react';
import { InputLabel, FormControl, Input, IconButton, Select, MenuItem, TextField } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import DeleteIcon from '@material-ui/icons/Delete';

export default class PackagingField extends Component {
  state = {
    originalPackagingGroup: null,
    packagingGroup: null,
  };

  componentDidMount = () => {
    const { packagingGroup } = this.props;
    this.setState({
      originalPackagingGroup: { ...packagingGroup },
      packagingGroup: { ...packagingGroup },
    });
  };

  handlePackagingGroupChange = (field) => (event) => {
    const value = event.target.value;
    this.setState((state) => ({
      packagingGroup: {
        ...state.packagingGroup,
        [field]: value,
      },
    }));
  };

  render() {
    const {
      classes,
      availableSeedSizes,
      availablePackagings,

      index,
      // Methods
      onDelete,
      onSave,
    } = this.props;

    const { packagingGroup, originalPackagingGroup } = this.state;

    if (!packagingGroup) {
      return null;
    }

    const checkSame =
      packagingGroup.packagingId === originalPackagingGroup.packagingId &&
      packagingGroup.seedSizeId === originalPackagingGroup.seedSizeId &&
      packagingGroup.quantity === originalPackagingGroup.quantity;

    const i = index;

    return (
      <div className={classes.fieldRoot}>
        <FormControl className={classes.packagingFormControl}>
          <InputLabel shrink htmlFor={`seedsizes-${i}`}>
            Seed Size
          </InputLabel>
          <Select
            value={packagingGroup.seedSizeId}
            onChange={this.handlePackagingGroupChange('seedSizeId')}
            input={<Input name="packaging" id={`seedsizes-${i}`} />}
          >
            {availableSeedSizes.map((seedSize) => (
              <MenuItem key={seedSize.id} value={seedSize.id}>
                {seedSize.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl className={classes.packagingFormControl}>
          <InputLabel shrink htmlFor={`packagings-${i}`}>
            Packaging
          </InputLabel>
          <Select
            value={packagingGroup.packagingId}
            onChange={this.handlePackagingGroupChange('packagingId')}
            input={<Input name="packaging" id={`packagings-${i}`} />}
          >
            {availablePackagings.map((packaging) => (
              <MenuItem key={packaging.id} value={packaging.id}>
                {packaging.name} - {packaging.numberOfBags}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          className={classes.quantityInput}
          label="No. of Units"
          value={packagingGroup.quantity}
          id={`quantity-${i}`}
          type="number"
          onChange={this.handlePackagingGroupChange('quantity')}
        />

        {!checkSame && (
          <Fragment>
            <CheckIcon
              onClick={() => {
                this.setState({
                  originalPackagingGroup: { ...this.state.packagingGroup },
                });
                onSave(this.state.packagingGroup);
              }}
              style={{ color: 'green' }}
            />
            <CloseIcon
              onClick={() => {
                const { originalPackagingGroup } = this.state;
                this.setState({
                  packagingGroup: { ...originalPackagingGroup },
                });
              }}
              style={{ color: 'red' }}
            ></CloseIcon>
          </Fragment>
        )}

        <IconButton aria-label="Delete" onClick={onDelete}>
          <DeleteIcon />
        </IconButton>
      </div>
    );
  }
}
