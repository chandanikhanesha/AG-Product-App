import { Component } from 'react';
import axios from 'axios';

class Admin extends Component {
  componentWillMount() {
    let id = localStorage.getItem('id');
    axios
      .get(`${process.env.REACT_APP_API_BASE}/users/${id}/permissions`, {
        headers: { 'x-access-token': localStorage.getItem('authToken') },
      })
      .then((response) => {
        if (response.data.permissions !== true) {
          this.props.history.push('/app/home');
        }
      })
      .catch((e) => {
        this.props.history.push('/app/home');
      });
  }

  render() {
    return null;
  }
}

export default Admin;
