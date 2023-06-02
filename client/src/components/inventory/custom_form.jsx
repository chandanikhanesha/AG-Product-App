import React, { Component } from 'react';
import { withStyles } from '@material-ui/core';

// material-ui icons
import Business from '@material-ui/icons/Business';

// core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import CardFooter from '../../components/material-dashboard/Card/CardFooter';
import CustomInput from '../../components/material-dashboard/CustomInput/CustomInput';

// custom components
import CTABar from '../cta-bar';

const styles = {
  cardIcon: {
    color: 'white',
  },
};

class CustomProductForm extends Component {
  render() {
    const {
      classes,
      id,
      name,
      type,
      description,
      unit,
      customId,
      costUnit,
      quantity,
      handleChange,
      history,
      onSubmit,
      buttonText,
      companyId,
    } = this.props;

    return (
      <div>
        <GridContainer justifyContent="center">
          <GridItem xs={6}>
            <form action="#" onSubmit={onSubmit}>
              <Card>
                <CardHeader>
                  <CardIcon className={classes.cardIcon} color="gray">
                    <Business />
                  </CardIcon>

                  <h4>{id ? 'Update' : 'Create'} product</h4>
                </CardHeader>

                <CardBody>
                  <CustomInput
                    labelText="Product"
                    id="name"
                    formControlProps={{
                      fullWidth: true,
                      required: true,
                    }}
                    inputProps={{
                      value: name,
                      onChange: handleChange('name'),
                    }}
                  />

                  <CustomInput
                    labelText="Type"
                    id="type"
                    formControlProps={{
                      fullWidth: true,
                      required: true,
                    }}
                    inputProps={{
                      value: type,
                      onChange: handleChange('type'),
                    }}
                  />

                  <CustomInput
                    labelText="Product Description"
                    id="description"
                    formControlProps={{
                      fullWidth: true,
                    }}
                    inputProps={{
                      value: description,
                      onChange: handleChange('description'),
                    }}
                  />

                  <CustomInput
                    labelText="ID"
                    id="customId"
                    formControlProps={{
                      fullWidth: true,
                      required: true,
                    }}
                    inputProps={{
                      value: customId,
                      onChange: handleChange('customId'),
                    }}
                  />

                  <CustomInput
                    labelText="Unit"
                    id="unit"
                    formControlProps={{
                      fullWidth: true,
                      required: true,
                    }}
                    inputProps={{
                      value: unit,
                      onChange: handleChange('unit'),
                    }}
                  />

                  <CustomInput
                    labelText="Cost per unit"
                    id="costUnit"
                    formControlProps={{
                      fullWidth: true,
                      required: true,
                    }}
                    inputProps={{
                      value: costUnit,
                      type: 'number',
                      onChange: handleChange('costUnit'),
                    }}
                  />

                  <CustomInput
                    labelText="Quantity"
                    id="quantity"
                    formControlProps={{
                      fullWidth: true,
                      required: true,
                    }}
                    inputProps={{
                      value: quantity,
                      type: 'number',
                      onChange: (e) => {
                        const value = {
                          target: {
                            value: e.target.value < 0 && e.target.value !== '' ? 0 : e.target.value,
                          },
                        };
                        handleChange('quantity')(value);
                      },
                    }}
                  />
                </CardBody>

                <CardFooter>
                  <CTABar text={buttonText} secondaryAction={() => history.push(`/app/companies/${companyId}`)} />
                </CardFooter>
              </Card>
            </form>
          </GridItem>
        </GridContainer>
      </div>
    );
  }
}

export default withStyles(styles)(CustomProductForm);
