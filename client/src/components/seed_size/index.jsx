import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withStyles from '@material-ui/core/styles/withStyles';

// icons
import Label from '@material-ui/icons/Label';

// material-ui core components
import GridContainer from '../../components/material-dashboard/Grid/GridContainer';
import GridItem from '../../components/material-dashboard/Grid/GridItem';
import Table from '../../components/material-dashboard/Table/Table';
import Card from '../../components/material-dashboard/Card/Card';
import CardHeader from '../../components/material-dashboard/Card/CardHeader';
import CardIcon from '../../components/material-dashboard/Card/CardIcon';
import CardBody from '../../components/material-dashboard/Card/CardBody';
import Button from '../../components/material-dashboard/CustomButtons/Button';
import Tooltip from '@material-ui/core/Tooltip';

import { cardTitle } from '../../assets/jss/material-dashboard-pro-react';

import { listSeedSizes, updateSeedSize } from '../../store/actions';
import SeedSizeEditModal from './edit';

const styles = {
  cardIconTitle: {
    ...cardTitle,
    marginTop: '15px',
    marginBottom: '0px',
  },
  editButton: {
    backgroundColor: '#999',
  },
};

class SeedSizes extends Component {
  state = {
    editModalOpen: false,
    selectedSeedSize: null,
    seedCompanyId: null,
    seedCompany: null,
  };

  closeEditModal = () => {
    this.setState({
      editModalOpen: false,
      selectedSeedSize: null,
    });
  };

  editSeedSizes = (id) => {
    const { seedSizes } = this.props;
    this.setState({
      editModalOpen: true,
      selectedSeedSize: seedSizes.find((p) => p.id === id),
    });
  };

  componentWillMount() {
    const { listSeedSizes, seedCompanies } = this.props;

    listSeedSizes();

    let seedCompanyId = parseInt(this.props.match.params.id, 10);

    this.setState({
      seedCompanyId,
      seedCompany: seedCompanies.find((sc) => sc.id === seedCompanyId),
    });
  }

  seedTypeName = (seedType) => {
    const { seedCompany } = this.state;
    switch (seedType) {
      case 'CORN':
        return seedCompany.cornBrandName || 'Corn';
      case 'SOYBEAN':
        return seedCompany.soybeanBrandName || 'Soybean';
      case 'SORGHUM':
        return seedCompany.sorghumBrandName || 'Sorghum';
      default:
        return '';
    }
  };

  render() {
    const { editModalOpen, selectedSeedSize, seedCompanyId, seedCompany } = this.state;
    const { seedSizes, classes, updateSeedSize, isAdmin } = this.props;

    if (!seedCompany) return null;

    const tableData = seedSizes
      .filter((p) => p.seedCompanyId === seedCompanyId)
      .map((p) => [
        p.name,
        this.seedTypeName(p.seedType),
        (isAdmin === true || isAdmin === 'true') && (
          <Tooltip title="Edit seed size details">
            <Button className={classes.editButton} onClick={() => this.editSeedSizes(p.id)}>
              Edit
            </Button>
          </Tooltip>
        ),
      ]);

    return (
      <div>
        {(isAdmin === true || isAdmin === 'true') && (
          <Button
            color="primary"
            onClick={() => this.props.history.push(`/app/seed_companies/${seedCompanyId}/seed_size/create`)}
          >
            New Seed Size
          </Button>
        )}
        <GridContainer>
          <GridItem xs={12}>
            <Card>
              <CardHeader color="gray" icon>
                <CardIcon color="gray">
                  <Label />
                </CardIcon>

                <h4 className={classes.cardIconTitle}>Seed Size</h4>
              </CardHeader>

              <CardBody>
                <Table
                  hover={true}
                  tableHeaderColor="primary"
                  tableHead={['Name', 'Seed Type', '']}
                  tableData={tableData}
                  customClassesForCells={[2]}
                />
              </CardBody>
            </Card>
          </GridItem>
        </GridContainer>
        {editModalOpen && (
          <SeedSizeEditModal
            selectedSeedSize={selectedSeedSize}
            open={editModalOpen}
            onClose={this.closeEditModal}
            updateSeedSize={updateSeedSize}
            seedCompany={seedCompany}
          />
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    seedSizes: state.seedSizeReducer.seedSizes,
    seedCompanies: state.seedCompanyReducer.seedCompanies,
    isAdmin: state.userReducer.isAdmin,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listSeedSizes,
      updateSeedSize,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(SeedSizes));
