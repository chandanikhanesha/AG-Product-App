import React from 'react';
import cx from 'classnames';
import { withStyles } from '@material-ui/core';

const styles = {
  text: {
    fontSize: 10,
    color: '#605E5E',
    lineHeight: 1.5,
  },
  link: {
    fontWeight: 'bold',
    color: '#38A154',
  },
};

const SupportText = ({ classes, className, ...props }) => (
  <div className={cx(classes.text, className)} {...props} style={{ padding: 20 }}>
    {/* AgriDEALER only supports 5 Crop Types as of now.
    <br />
    If you want to add more then please&nbsp;<a href="https://agridealer.app/" target="_blank" className={classes.link} rel="noopener noreferrer">Contact AgriDEALER Support</a> */}
  </div>
);

export default withStyles(styles)(SupportText);
