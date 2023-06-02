import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import shortid from 'shortid';
import PropTypes from 'prop-types';
import { addNotification, clearNotifications, clearNotification } from '../../store/actions';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import BroadcastChannel from 'broadcast-channel';

class ServiceWorkerContextual extends Component {
  constructor() {
    super();
    this.channel = new BroadcastChannel('sw-message-channel');
  }

  handleMessage(event) {
    if (event && (!event || (event && !event.type))) {
      return;
    }

    const { type } = event;
    if (type === 'new-content-available') {
      this.handleNewContent();
    } else if (type === 'available-offline') {
      this.handleAvailableOffline();
    }
  }

  refreshPage(notificationId) {
    this.props.clearNotification(notificationId);
    window.location.reload(true);
  }

  handleNewContent() {
    const id = shortid.generate();
    this.props.addNotification({
      id,
      message: 'A new version of the app is available.',
      color: 'info',
      canClose: false,
      actions: [
        <Button color="info" onClick={() => this.refreshPage.bind(this)(id)} size="sm">
          Refresh
        </Button>,
      ],
    });
  }

  handleAvailableOffline() {
    this.props.addNotification({
      id: shortid.generate(),
      message: 'Caching complete! App is available for offline use.',
      color: 'info',
      canClose: true,
    });
  }

  componentDidMount() {
    this.props.clearNotifications();
    this.channel.addEventListener('message', this.handleMessage.bind(this));
  }

  componentWillUnmount() {
    this.channel.removeEventListener('message', this.handleMessage.bind(this));
    this.channel.close();
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      addNotification,
      clearNotifications,
      clearNotification,
    },
    dispatch,
  );

ServiceWorkerContextual.propTypes = {
  addNotification: PropTypes.func,
  clearNotifications: PropTypes.func,
  clearNotification: PropTypes.func,
};

export default connect(mapStateToProps, mapDispatchToProps)(ServiceWorkerContextual);
