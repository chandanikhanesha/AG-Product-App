import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core';
import SweetAlert from 'react-bootstrap-sweetalert';
import Button from '../../components/material-dashboard/CustomButtons/Button';

// material-ui icons
import BusinessCenter from '@material-ui/icons/BusinessCenter';

// core components
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../components/material-dashboard/Card/CardFooter';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';

import { eventEmitter } from '../../event_emitter';
import { updateCompany, deleteCompany } from '../../store/actions';

// custom components
import CTABar from '../cta-bar';

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

const styles = {
  wrapper: {
    padding: 50,
  },
  paper: {
    maxHeight: 435,
    width: 500,
  },
  CTABar: {
    backgroundColor: '#999',
  },
  contentContainer: {
    maxHeight: '43em',
  },
  cardTitle: {
    color: '#3C4858',
  },
  cardIcon: {
    color: 'white',
  },
  cardContainer: {
    marginBottom: 0,
    boxShadow: 'none',
  },
  button: {
    height: '35px',
    width: '100px',
    border: 'none',
    fontWeight: 600,
    color: 'white',
  },
  success: {
    backgroundColor: '#38a154',
  },
  danger: {
    backgroundColor: '#999',
  },
};

class CreateCompany extends Component {
  state = {
    name: '',
    deleteCompanyConfirm: false,
  };

  componentDidMount() {
    this.setState({
      name: this.props.company.name,
    });
  }

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  update = (e) => {
    const { updateCompany, company } = this.props;
    const { name } = this.state;
    e.preventDefault();
    company.name = name;
    updateCompany(company).then((response) => {
      eventEmitter.emit('newCompany', response.payload.id);
      this.props.onClose();
    });
  };
  deleteCompany = () => {
    const { seedCompanyId } = this.state;
    const { deleteCompany, classes, history, company } = this.props;
    this.setState({
      deleteCompanyConfirm: (
        <SweetAlert
          warning
          showCancel
          title="Delete Seed Company"
          onConfirm={() => {
            deleteCompany(company.id, history);
          }}
          onCancel={() => this.setState({ deleteCompanyConfirm: null })}
          confirmBtnCssClass={classes.button + ' ' + classes.success}
          cancelBtnCssClass={classes.button + ' ' + classes.danger}
        >
          Are you sure you want to delete this company? This will also remove any products, discounts, products added to
          existing purchase orders and quotes.
        </SweetAlert>
      ),
    });
  };

  render() {
    const { classes, open, onClose } = this.props;
    const { name, deleteCompanyConfirm } = this.state;

    return (
      <Dialog
        open={open}
        onClose={() => onClose()}
        TransitionComponent={Transition}
        maxWidth="md"
        classes={{
          paper: classes.paper,
        }}
      >
        <Card className={classes.cardContainer}>
          <CardHeader style={{ display: 'flex', justifyContent: 'space-between' }}>
            <CardIcon className={classes.cardIcon} color="gray">
              <BusinessCenter />
            </CardIcon>
            <h4>Edit Company</h4>

            <Button className="hide-print" color="primary" onClick={this.deleteCompany}>
              Delete Company
            </Button>
          </CardHeader>

          <CardBody>
            <CustomInput
              labelText="Company Name"
              id="name"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: name,
                onChange: this.handleChange('name'),
              }}
            />
          </CardBody>
          {deleteCompanyConfirm}

          <CardFooter>
            <CTABar
              text="Update"
              form={false}
              primaryAction={this.update}
              disabled={this.props.company.name === name}
              secondaryAction={() => onClose()}
            />
          </CardFooter>
        </Card>
      </Dialog>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateCompany,
      deleteCompany,
    },
    dispatch,
  );

export default withStyles(styles)(connect(null, mapDispatchToProps)(CreateCompany));
