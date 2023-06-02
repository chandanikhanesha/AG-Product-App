import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Snackbar from '../../components/material-dashboard/Snackbar/Snackbar';

import { clearNotification, addNotification } from '../../store/actions';

class SnackBarContextual extends Component {
  closeNotification(notificationId) {
    this.props.clearNotification(notificationId);
  }

  render() {
    const { notifications } = this.props;
    return (
      <React.Fragment>
        {notifications.map((notification) => (
          <Snackbar
            place="bc"
            color={notification.color}
            message={notification.message}
            open={true}
            closeNotification={() => this.closeNotification(notification.id)}
            close={notification.canClose}
            actions={notification.actions}
          />
        ))}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    notifications: state.notificationReducer.notifications,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      addNotification,
      clearNotification,
    },
    dispatch,
  );

SnackBarContextual.propTypes = {
  notifications: PropTypes.array,
  clearNotification: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(SnackBarContextual);
