import React from 'react';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Print from '@material-ui/icons/Print';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { withStyles } from '@material-ui/core';

const styles = {
  shareholdersSelect: {
    marginLeft: '20px',
    minWidth: '120px',
  },
};

const InvoiceActionBar = (props) => {
  return (
    <React.Fragment>
      {!props.isQuote && (
        <Button color="primary" className="hide-print" onClick={props.showPaymentDialog}>
          Create Payment
        </Button>
      )}

      <Button className="hide-print" onClick={props.print} color="info">
        <Print />
      </Button>
      <Select
        displayEmpty
        className={`${props.classes.shareholdersSelect} hide-print`}
        // get id only if is not null
        value={props.selectedShareholder.id || ''}
        onChange={props.setSelectedShareholder}
      >
        <MenuItem value={''}>All Shareholder</MenuItem>
        <MenuItem value={'theCustomer'}>{props.customer.name}</MenuItem>
        {props.shareholders.map((shareholder) => (
          <MenuItem key={shareholder.id} value={shareholder.id}>
            {shareholder.name}
          </MenuItem>
        ))}
      </Select>
    </React.Fragment>
  );
};

export default withStyles(styles)(InvoiceActionBar);
