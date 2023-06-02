import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';
import SweetAlert from 'react-bootstrap-sweetalert';

import { listUsers, deleteUser } from '../../../store/actions';

// material-ui icons
import Assignment from '@material-ui/icons/Assignment';

// core components
import GridContainer from '../../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../../components/material-dashboard/Grid/GridItem';
import Table from '../../../components/material-dashboard/Table/Table';
import Card from '../../../components/material-dashboard/Card/Card';
import CardHeader from '../../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import Button from '../../../components/material-dashboard/CustomButtons/Button';

import { cardTitle } from '../../../assets/jss/material-dashboard-pro-react';
import sweetAlertStyle from '../../../assets/jss/material-dashboard-pro-react/views/sweetAlertStyle';

const styles = Object.assign(
  {},
  {
    customCardContentClass: {
      paddingLeft: '0',
      paddingRight: '0',
    },
    cardIconTitle: {
      ...cardTitle,
      marginTop: '15px',
      marginBottom: '0px',
    },
  },
  sweetAlertStyle,
);

class UsersAdmin extends Component {
  state = {
    deleteConfirmAlert: null,
  };

  componentDidMount = async () => {
    const { listUsers } = this.props;
    await listUsers(true);
  };

  showDeleteConfirmation(user) {
    const { classes } = this.props;

    this.setState({
      deleteConfirmAlert: (
        <SweetAlert
          warning
          showCancel
          title="Delete User"
          onConfirm={() => this.deleteUser(user)}
          onCancel={() => {
            this.setState({
              deleteConfirmAlert: null,
            });
          }}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to remove user: <br /> {user.firstName} {user.lastName} - {user.email} ?
        </SweetAlert>
      ),
    });
  }

  deleteUser = (user) => {
    const { deleteUser } = this.props;
    deleteUser(user.id);
    this.setState({
      deleteConfirmAlert: null,
    });
  };

  renderUserActions = (user) => {
    const { userId } = this.props;
    return (
      <React.Fragment>
        <Button
          color="danger"
          onClick={() => this.showDeleteConfirmation(user)}
          size="sm"
          disabled={user.id == userId ? true : false}
        >
          Delete User
        </Button>
      </React.Fragment>
    );
  };

  render() {
    const { deleteConfirmAlert } = this.state;
    const { users, classes } = this.props;
    const usersMap = users.map((u) => [u.firstName, u.lastName, u.email, u.role, this.renderUserActions(u)]);

    return (
      <div>
        {deleteConfirmAlert}
        <Button color="primary" onClick={() => this.props.history.push('/app/admin/users/create')}>
          Add User
        </Button>
        <GridContainer>
          <GridItem xs={12}>
            <Card>
              <CardHeader color="gray" icon>
                <CardIcon color="gray">
                  <Assignment />
                </CardIcon>

                <h4 className={classes.cardIconTitle}>Users list</h4>
              </CardHeader>

              <CardBody>
                <Table
                  hover={true}
                  isCheckBox={false}
                  tableHeaderColor="primary"
                  tableHead={['First Name', 'Last Name', 'Email', 'Role', '']}
                  tableData={usersMap}
                />
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listUsers,
      deleteUser,
    },
    dispatch,
  );

const mapStateToProps = (state) => {
  return {
    users: state.userReducer.users,
    userId: state.userReducer.id,
  };
};

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(UsersAdmin));
