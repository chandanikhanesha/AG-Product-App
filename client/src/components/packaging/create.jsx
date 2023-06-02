import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';

// icons
import Label from '@material-ui/icons/Label';

// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
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

import { createPackaging } from '../../store/actions';

// custom components
import CTABar from '../cta-bar';

const styles = {
  cardIcon: {
    color: 'white',
  },
};

class CreatePackaging extends Component {
  state = {
    name: '',
    numberOfBags: 0,
    seedType: '',
    seedCompanyId: null,
  };

  componentWillMount() {
    this.setState({
      seedCompanyId: parseInt(this.props.match.params.id, 10),
    });
  }

  handleChange = (name) => (event) => {
    this.setState({
      [name]: event.target.value,
    });
  };

  create = (e) => {
    e.preventDefault();

    const { createPackaging } = this.props;
    const { name, numberOfBags, seedType, seedCompanyId } = this.state;

    createPackaging({ name, numberOfBags, seedType, seedCompanyId }).then(() => {
      this.props.history.push(`/app/seed_companies/${seedCompanyId}/packaging`);
    });
  };

  render() {
    const { name, numberOfBags, seedType, seedCompanyId } = this.state;
    const { classes, seedCompanies } = this.props;

    const seedCompany = seedCompanies.find((sc) => sc.id === seedCompanyId);

    if (!seedCompany) return null;

    const metadata = JSON.parse(seedCompany.metadata);
    const cropTypes = Object.keys(metadata);

    return (
      <div>
        <GridContainer justifyContent="center">
          <GridItem xs={6}>
            <form action="#" onSubmit={this.create}>
              <Card>
                <CardHeader>
                  <CardIcon className={classes.cardIcon} color="gray">
                    <Label />
                  </CardIcon>

                  <h4>Create Packaging</h4>
                </CardHeader>

                <CardBody>
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

                  <CustomInput
                    labelText="Number of bags"
                    id="numberOfBags"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      value: numberOfBags,
                      type: 'number',
                      onChange: (e) => {
                        const value = {
                          target: {
                            value: e.target.value < 0 && e.target.value !== '' ? 0 : e.target.value,
                          },
                        };
                        this.handleChange('numberOfBags')(value);
                      },
                    }}
                  />
                </CardBody>

                <CardFooter>
                  <CTABar
                    secondaryAction={() => this.props.history.push(`/app/seed_companies/${seedCompanyId}/packaging`)}
                  />
                </CardFooter>
              </Card>
            </form>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  seedCompanies: state.seedCompanyReducer.seedCompanies,
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createPackaging,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(CreatePackaging));
