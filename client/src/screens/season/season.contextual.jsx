import withStyles from '@material-ui/core/styles/withStyles';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styles from './season.style';

// actions
import { listSeasons, createSeason, updateSeason, deleteSeason, loadOrganization } from '../../store/actions';

import Season from './season';

const mapStateToProps = (state) => {
  return {
    organizationId: state.userReducer.organizationId,
    seasons: state.seasonReducer.seasons,
    organization: state.organizationReducer,
    seasonsStatus: state.seasonReducer.loadingStatus,
  };
};

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      listSeasons,
      loadOrganization,
      createSeason,
      updateSeason,
      deleteSeason,
    },
    dispatch,
  );

export default withStyles(styles)(connect(mapStateToProps, mapDispatchToProps)(Season));
