import React from 'react';
import { withStyles } from '@material-ui/core';
import Button from '../../components/material-dashboard/CustomButtons/Button';

const styles = {
  CTABar: {
    marginRight: 20,
  },
  secondaryCta: {
    backgroundColor: '#999',
  },
};

const CTABar = ({
  classes,
  text = 'Create',
  disabled = false,
  form = true,
  primaryAction,
  secondaryAction,
  history,
}) => (
  <div>
    {form ? (
      <Button type="submit" color="primary" disabled={disabled} className={classes.CTABar} id="creteByer">
        {text}
      </Button>
    ) : (
      <Button color="primary" disabled={disabled} onClick={primaryAction} className={classes.CTABar} id="creteByer">
        {text}
      </Button>
    )}
    <Button className={classes.secondaryCta} onClick={secondaryAction}>
      Cancel
    </Button>
  </div>
);

export default withStyles(styles)(CTABar);
