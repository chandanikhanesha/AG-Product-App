import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';

// icons
import Label from '@material-ui/icons/Label';

// core components
import Dialog from '@material-ui/core/Dialog';
import Slide from '@material-ui/core/Slide';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../components/material-dashboard/Card/CardFooter';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Input from '@material-ui/core/Input';

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
  cardContainer: {
    marginBottom: 0,
    boxShadow: 'none',
  },
  dialogAction: {
    justifyContent: 'flex-start',
    padding: '16px 20px',
  },
};

class UpdateSeedSizeModal extends Component {
  state = {
    name: this.props.selectedSeedSize.name,
    seedType: this.props.selectedSeedSize.seedType,
  };

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  update = (e) => {
    e.preventDefault();
    const { updateSeedSize, selectedSeedSize } = this.props;
    const { name, seedType } = this.state;
    const updatedData = Object.assign({}, selectedSeedSize, { name, seedType });

    updateSeedSize(updatedData).then(() => {
      this.props.onClose();
    });
  };

  render() {
    const { classes, open, onClose, selectedSeedSize, seedCompany } = this.props;

    const { name, seedType } = this.state;
    const metadata = JSON.parse(seedCompany.metadata);
    const cropTypes = Object.keys(metadata);

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
          <CardHeader color="gray" icon>
            <CardIcon className={classes.cardIcon} color="gray">
              <Label />
            </CardIcon>

            <h4 className={classes.cardTitle}>Edit Seed Size</h4>
          </CardHeader>

          <CardBody className={classes.contentContainer}>
            <CustomInput
              labelText="Name"
              id="name"
              formControlProps={{
                fullWidth: true,
              }}
              inputProps={{
                value: name,
                onChange: this.handleChange('name'),
              }}
            />

            <FormControl fullWidth={true}>
              <InputLabel htmlFor="seedType-helper">Seed Type</InputLabel>

              <Select
                value={seedType}
                onChange={this.handleChange('seedType')}
                input={<Input name="seedType" id="seedType-helper" />}
                inputProps={{
                  required: true,
                }}
              >
                {cropTypes
                  .filter((seedType) => metadata[seedType].brandName.trim() !== '')
                  .map((cropType, index) => (
                    <MenuItem key={index} value={cropType.toUpperCase()}>
                      {metadata[cropType].brandName}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </CardBody>

          <CardFooter>
            <CTABar
              text="Update"
              form={false}
              primaryAction={this.update}
              disabled={selectedSeedSize.name === name && selectedSeedSize.seedType === seedType}
              secondaryAction={() => onClose()}
            />
          </CardFooter>
        </Card>
      </Dialog>
    );
  }
}

export default withStyles(styles)(UpdateSeedSizeModal);
