import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { DialogActions, withStyles } from '@material-ui/core';

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
import Button from '../../components/material-dashboard/CustomButtons/Button';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import FormLabel from '@material-ui/core/FormLabel';
import Tooltip from '@material-ui/core/Tooltip';
import Add from '@material-ui/icons/Add';

import { eventEmitter } from '../../event_emitter';
import { updateSeedCompany } from '../../store/actions';

// custom components
import CTABar from '../cta-bar';
import SupportText from './support_text';
import CropTypeEditor from './crop_type_editor';
import defaultMetadata from './default_metadata.json';

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
};

const styles = {
  wrapper: {
    padding: 50,
  },
  paper: {
    maxHeight: 435,
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  supportText: {
    flexGrow: 1,
  },
  contentContainer: {
    maxHeight: '43em',
  },
  cardTitle: {
    color: '#3C4858',
  },
  cardIcon: {
    color: 'white',
    marginBottom: 10,
    marginTop: -15,
  },
  cardContainer: {
    marginBottom: 0,
    boxShadow: 'none',
  },
  cropNameCard: {
    boxShadow: 'none',
    padding: '20px 50px',
  },
};

class EditCompany extends Component {
  state = {
    name: '',
    metadata: defaultMetadata,
    addNewCropDialogOpen: false,
    newCropName: '',
  };

  componentDidMount() {
    const { name, metadata } = this.props.seedCompany;
    this.setState({
      name,
      metadata: JSON.parse(metadata),
    });
  }

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleChangeBrandName = (type) => (value) => {
    this.setState({
      metadata: {
        ...this.state.metadata,
        [type]: {
          ...this.state.metadata[type],
          brandName: value,
        },
      },
    });
  };

  handleChangeMetadata = (type) => (field) => (value) => {
    this.setState({
      metadata: {
        ...this.state.metadata,
        [type]: {
          ...this.state.metadata[type],
          [field]: value,
        },
      },
    });
  };

  handleAddNewCropType = () => {
    this.setState({
      addNewCropDialogOpen: true,
    });
  };

  handleSaveNewCrop = () => {
    const { newCropName, metadata } = this.state;
    this.setState({
      metadata: {
        ...metadata,
        [newCropName]: {
          brand: true,
          blend: true,
          rm: true,
          treatment: true,
          msrp: true,
          seedCompany: true,
          grower: true,
          longShort: true,
          qtyWarehouse: true,
          brandName: '',
        },
      },
      addNewCropDialogOpen: false,
    });
  };

  update = (e) => {
    const { updateSeedCompany, seedCompany } = this.props;
    const { name, metadata } = this.state;
    e.preventDefault();
    updateSeedCompany({
      ...seedCompany,
      Products: undefined,
      name,
      metadata: JSON.stringify(metadata),
    }).then((response) => {
      eventEmitter.emit('newSeedCompany', response.payload.id);
      this.props.onClose();
    });
  };

  render() {
    const { classes, open, onClose, deleteAction } = this.props;
    const { name, metadata, addNewCropDialogOpen, newCropName } = this.state;
    return (
      <Dialog
        open={open}
        onClose={() => onClose()}
        TransitionComponent={Transition}
        maxWidth="lg"
        PaperProps={{ classes: { root: classes.dialog } }}
      >
        <Card className={classes.cardContainer}>
          <CardHeader style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex' }}>
              <CardIcon className={classes.cardIcon} color="gray">
                <BusinessCenter />
              </CardIcon>

              <h4>Edit Seed Company</h4>
            </div>
            <Button className="hide-print" color="primary" onClick={deleteAction}>
              Delete Inventory Company
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

            <FormLabel component="legend">Crop Types</FormLabel>
            <CropTypeEditor
              metadata={metadata}
              onChangeBrandName={this.handleChangeBrandName}
              onChangeMetadata={this.handleChangeMetadata}
            />
            <Tooltip title="Add New Crop Type">
              <Button justIcon round color="primary" onClick={this.handleAddNewCropType}>
                <Add />
              </Button>
            </Tooltip>
          </CardBody>

          <SupportText className={classes.supportText} />
          <CardFooter className={classes.footer}>
            <CTABar text="Update" form={false} primaryAction={this.update} secondaryAction={() => onClose()} />
          </CardFooter>
        </Card>
        <Dialog open={addNewCropDialogOpen} maxWidth="xl" PaperProps={{ classes: { root: classes.dialog } }}>
          <Card className={classes.cropNameCard}>
            <CustomInput
              labelText="Crop Name"
              id="newCropName"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: newCropName,
                onChange: this.handleChange('newCropName'),
              }}
            />
            <DialogActions style={{ marginBottom: '20px' }}>
              <Button color="primary" className={classes.addButton} onClick={this.handleSaveNewCrop}>
                SAVE
              </Button>
              <Button
                onClick={() => {
                  this.setState({ newCropName: '', addNewCropDialogOpen: false });
                }}
                color="primary"
              >
                Cancel
              </Button>
            </DialogActions>
          </Card>
        </Dialog>
      </Dialog>
    );
  }
}

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      updateSeedCompany,
    },
    dispatch,
  );

export default withStyles(styles)(connect(null, mapDispatchToProps)(EditCompany));
