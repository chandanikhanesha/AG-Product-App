import React, { Component, Fragment } from 'react';
import CustomInput from '../../../../components/material-dashboard/CustomInput/CustomInput';
import GridItem from '../../../../components/material-dashboard/Grid/GridItem';
import MoreHoriz from '@material-ui/icons/MoreHoriz';

import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';
import Divider from '@material-ui/core/Divider';

export default class ShareholderField extends Component {
  state = {
    originalShareholder: null,
    shareholder: null,
  };

  componentDidMount = () => {
    const { shareholder } = this.props;
    this.setState({
      originalShareholder: { ...shareholder },
      shareholder: { ...shareholder },
    });
  };

  handleShareholderChange = (field) => (event) => {
    const value = event.target.value;

    this.setState((state) => ({
      shareholder: {
        ...state.shareholder,
        [field]: parseFloat(value),
      },
    }));
  };

  render() {
    const {
      classes,
      //availableShareholders,

      //index,
      // Methods
      //onDelete,
      onSave,
      isCustomer,
      type,
      shareholderType,
    } = this.props;

    const { shareholder, originalShareholder } = this.state;

    if (!shareholder) {
      return null;
    }

    const checkSame =
      shareholderType == 'percentage' || shareholderType == undefined
        ? shareholder.name === originalShareholder.name && shareholder.percent == originalShareholder.percent
        : shareholder.name === originalShareholder.name && shareholder.units == originalShareholder.units;

    return (
      <GridItem
        xs={12}
        key={shareholder.id}
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <CustomInput
          id={'customer-name'}
          formControlProps={{
            fullWidth: true,
            classes: { root: classes.shareholderName },
          }}
          inputProps={{
            type: 'text',
            value: shareholder.name,
            onChange: this.handleShareholderChange('name'),
            disabled: isCustomer ? true : false,
            // disabled: subjectName === 'Invoice'
          }}
        />

        <CustomInput
          labelText={shareholderType == 'percentage' || shareholderType == undefined ? 'percentage' : 'units'}
          id={`percentage-${this.props.shareHolderIndex}`}
          formControlProps={{
            fullWidth: true,
            classes: { root: classes.formRoot },
          }}
          inputProps={{
            type: 'number',
            className: classes.shareholderInput,

            value:
              shareholderType == 'percentage' || shareholderType == undefined
                ? shareholder.percent || 0
                : shareholder.units || 0,
            onChange: this.handleShareholderChange(
              shareholderType == 'percentage' || shareholderType == undefined ? 'percent' : 'units',
            ),
            inputProps: { min: 0, step: 0.1, min: 0 },

            // disabled: subjectName === 'Invoice'
          }}
        />
        <div className={classes.formActions}>
          {!checkSame ? (
            <Fragment>
              <CheckIcon
                id="savePercent"
                onClick={() => {
                  this.setState({
                    originalShareholder: { ...this.state.shareholder },
                  });
                  onSave(this.state.shareholder);
                }}
                style={{ color: 'green' }}
              />
              <CloseIcon
                style={{ color: 'red' }}
                onClick={() => {
                  const { originalShareholder } = this.state;
                  this.setState({
                    shareholder: { ...originalShareholder },
                  });
                }}
              />
            </Fragment>
          ) : (
            <MoreHoriz></MoreHoriz>
          )}
        </div>
        <Divider />
      </GridItem>
    );
  }
}
