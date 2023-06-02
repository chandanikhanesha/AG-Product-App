import React, { Component } from 'react';

// material-ui icons
import BusinessCenter from '@material-ui/icons/BusinessCenter';

// core components
import Dialog from '@material-ui/core/Dialog';
import Card from '../../../components/material-dashboard/Card/Card';
import CardHeader from '../../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../../components/material-dashboard/Card/CardFooter';
import CustomInput from '../../../components/material-dashboard/CustomInput/CustomInput';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';

import SweetAlert from 'react-bootstrap-sweetalert';
import CTABar from '../../../components/cta-bar';

import Slide from '@material-ui/core/Slide';
import NavigateBefore from '@material-ui/icons/NavigateBefore';
import NavigateNext from '@material-ui/icons/NavigateNext';
import { DatePicker } from '@material-ui/pickers';

import moment from 'moment';

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

class Modal extends Component {
  constructor(props) {
    super(props);
    const { season } = this.props;
    const nextYearDate = new Date(moment.utc().add(1, 'year'));
    this.state = {
      name: (season && season.name) || '',
      startDate: (season && season.startDate) || new Date(),
      endDate: (season && season.endDate) || nextYearDate, // 365 days from now
      isDefault: (season && season.isDefault) || false,
      companyIds: (season && season.companyIds) || [],
      seedCompanyIds: (season && season.seedCompanyIds) || [],
      apiCompanyIds: (season && season.apiCompanyIds) || [],
      selectedSeedCompanyIds: [],
      selectedCompanyIds: [],
      selectedApiCompanyIds: [],
    };
  }

  handleDateChange = (name) => (date) => {
    this.setState({
      [name]: moment.utc(date).format('YYYY-MM-DD') + 'T00:00:00.000Z',
    });
  };

  edit = (e) => {
    const { updateSeason, season, afterEdit } = this.props;
    e.preventDefault();
    updateSeason({
      ...season,
      ...this.state,
    }).then(() => {
      if (afterEdit) afterEdit();
      this.props.onClose();
    });
  };

  create = (e) => {
    const { createSeason, onClose, afterCreate } = this.props;
    const { name, startDate, endDate, isDefault } = this.state;
    e.preventDefault();
    if (!name) {
      return this.setState({
        error: {
          message: 'Please give the season a name',
        },
      });
    }
    createSeason({
      name,
      startDate,
      endDate,
      isDefault,
    }).then(() => {
      if (afterCreate) afterCreate();
      onClose();
    });
  };

  render() {
    const { classes, open, onClose, editMode } = this.props;
    const { name, startDate, endDate, isDefault, error } = this.state;
    const modalTitle = editMode ? 'Edit Season' : 'Create Season';
    return (
      <Dialog open={open} onClose={() => onClose()} TransitionComponent={Transition}>
        {error && (
          <SweetAlert
            error
            onConfirm={() => {
              this.setState({ error: null });
            }}
            title="Error"
          >
            {error.message}
          </SweetAlert>
        )}
        <Card className={classes.cardContainer}>
          <CardHeader>
            <CardIcon className={classes.cardIcon} color="gray">
              <BusinessCenter />
            </CardIcon>

            <h4>{modalTitle}</h4>
          </CardHeader>

          <CardBody>
            <CustomInput
              labelText="Season Name"
              id="name"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: name,
                onChange: (event) =>
                  this.setState({
                    name: event.target.value,
                  }),
              }}
            />

            <DatePicker
              className={classes.datePicker}
              label="Start Date"
              style={{ width: '100%', padding: 0 }}
              leftArrowIcon={<NavigateBefore />}
              rightArrowIcon={<NavigateNext />}
              value={startDate}
              format="MMMM Do YYYY"
              disablePast={false}
              onChange={this.handleDateChange('startDate')}
            />

            <DatePicker
              className={classes.datePicker}
              label="End Date"
              style={{ width: '100%', padding: 0 }}
              leftArrowIcon={<NavigateBefore />}
              rightArrowIcon={<NavigateNext />}
              value={endDate}
              format="MMMM Do YYYY"
              disablePast={false}
              onChange={this.handleDateChange('endDate')}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={isDefault}
                  onChange={(event) =>
                    this.setState({
                      isDefault: event.target.checked,
                    })
                  }
                />
              }
              label="Make Default (PO, Quotes)"
            />
          </CardBody>
          <CardFooter className={classes.footer}>
            <CTABar
              text={editMode ? 'Edit' : 'Create'}
              form={false}
              primaryAction={editMode ? this.edit : this.create}
              secondaryAction={() => onClose()}
            />
          </CardFooter>
        </Card>
      </Dialog>
    );
  }
}

export default Modal;
