import React, { Component, Fragment } from 'react';
import { TextField } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseIcon from '@material-ui/icons/Close';

export default class TextFieldWithConfirm extends Component {
  state = {
    value: null,
  };

  componentDidMount = () => {
    const { originalValue } = this.props;

    this.setState({
      value: originalValue,
    });
  };

  render() {
    const { value } = this.state;
    const { onSave, originalValue, placeholder, type } = this.props;

    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <TextField
          placeholder={placeholder}
          type={type}
          value={value || ''}
          onChange={(e) => {
            this.setState({
              value: e.target.value,
            });
          }}
        ></TextField>
        {value !== originalValue && (
          <Fragment>
            <CheckIcon
              onClick={() => {
                const { value } = this.state;
                onSave(value);
              }}
              style={{ color: 'green' }}
            />
            <CloseIcon
              onClick={() => {
                const { originalValue } = this.props;
                this.setState({
                  value: originalValue,
                });
              }}
              style={{ color: 'red' }}
            ></CloseIcon>
          </Fragment>
        )}
      </div>
    );
  }
}
